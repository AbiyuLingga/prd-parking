import { createClient } from "@supabase/supabase-js";
import { generateParkingLots } from "../data/parkingData";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const parkingTable = import.meta.env.VITE_SUPABASE_TABLE ?? "parking_slots";

let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

function readFirst(row, keys) {
  return keys.map((key) => row[key]).find((value) => value !== undefined && value !== null);
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    return ["1", "true", "occupied", "terisi", "full"].includes(value.toLowerCase());
  }

  return false;
}

function normalizeFloor(row, id) {
  const floorValue = readFirst(row, ["floor", "lantai"]);
  const levelValue = readFirst(row, ["level_id", "levelId"]);

  if (floorValue !== undefined) {
    return Number(floorValue);
  }

  if (levelValue !== undefined) {
    const levelNumber = Number(levelValue);
    return levelNumber <= 1 ? levelNumber + 1 : levelNumber;
  }

  return Number(id?.match(/^L(\d+)/)?.[1]);
}

function normalizeRowLabel(row, id) {
  const rowValue =
    readFirst(row, ["row", "baris"]) ??
    readFirst(row, ["zone_id", "zoneId", "area_id", "areaId"]) ??
    id?.match(/-([A-Z])\d+/)?.[1];

  return rowValue ? String(rowValue).trim().charAt(0).toUpperCase() : undefined;
}

function buildLayoutId({ id, floor, row, column }) {
  if (id && /^L\d+-[A-Z]\d+$/.test(String(id))) {
    return String(id);
  }

  if (!Number.isFinite(floor) || !row || !Number.isFinite(column)) {
    return id;
  }

  return `L${floor}-${row}${column}`;
}

function normalizeSlotRow(row) {
  const rawId = readFirst(row, [
    "slot_id",
    "slotId",
    "parking_id",
    "parkingId",
    "id",
    "lot_id",
    "lotId",
    "parking_slot",
  ]);
  const floor = normalizeFloor(row, rawId);
  const rowLabel = normalizeRowLabel(row, rawId);
  const rawColumn = Number(
    readFirst(row, ["column", "col", "slot_number", "slotNumber"]) ??
      rawId?.match(/(\d+)$/)?.[1],
  );

  return {
    rawId,
    floor,
    row: rowLabel,
    column: rawColumn,
    isOccupied: normalizeBoolean(
      readFirst(row, [
        "is_occupied",
        "isOccupied",
        "is_filled",
        "isFilled",
        "occupied",
        "status",
        "value",
      ]),
    ),
    updatedAt: readFirst(row, ["updated_at", "updatedAt", "created_at", "createdAt"]) ?? null,
  };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseClient());
}

export function mergeRealRowsWithBaseLayout(rows) {
  const baseLots = generateParkingLots().map((lot) => ({ ...lot, isOccupied: false }));
  const baseById = new Map(baseLots.map((lot) => [lot.id, lot]));
  const normalizedSlots = rows.map(normalizeSlotRow);
  const usesZeroBasedSlotNumbers = normalizedSlots.some(
    (slot) =>
      Number.isFinite(slot.column) &&
      slot.column === 0 &&
      !(slot.rawId && /^L\d+-[A-Z]\d+$/.test(String(slot.rawId))),
  );

  normalizedSlots.forEach((slot) => {
    const column =
      usesZeroBasedSlotNumbers &&
      Number.isFinite(slot.column) &&
      !(slot.rawId && /^L\d+-[A-Z]\d+$/.test(String(slot.rawId)))
        ? slot.column + 1
        : slot.column;
    const id = buildLayoutId({
      id: slot.rawId,
      floor: slot.floor,
      row: slot.row,
      column,
    });

    if (!id || !baseById.has(id)) {
      return;
    }

    const baseLot = baseById.get(id);
    baseById.set(id, {
      ...baseLot,
      floor: Number.isFinite(slot.floor) ? slot.floor : baseLot.floor,
      row: slot.row ?? baseLot.row,
      column: Number.isFinite(column) ? column : baseLot.column,
      isOccupied: slot.isOccupied,
      updatedAt: slot.updatedAt,
    });
  });

  return Array.from(baseById.values());
}

export async function fetchRealParkingLots() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase env belum diisi");
  }

  const { data, error } = await client.from(parkingTable).select("*");

  if (error) {
    throw error;
  }

  return mergeRealRowsWithBaseLayout(data ?? []);
}

function layoutFieldsFromLot(lot) {
  const id = typeof lot === "string" ? lot : lot.id;
  const match = id?.match(/^L(\d+)-([A-Z])(\d+)$/);

  return {
    id,
    levelId: Number(match?.[1] ?? lot.floor) - 1,
    zoneId: match?.[2] ?? lot.row,
    slotNumber: Number(match?.[3] ?? lot.column),
  };
}

async function updateAndReturnRows(query, payload) {
  const { data, error } = await query.update(payload).select("parking_id");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateRealParkingSlot(lot, isFilled) {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase env belum diisi");
  }

  const { id, levelId, zoneId, slotNumber } = layoutFieldsFromLot(lot);
  const payload = { is_filled: isFilled };

  if (id) {
    const rows = await updateAndReturnRows(
      client.from(parkingTable).eq("parking_id", id),
      payload,
    );

    if (rows.length > 0) {
      return rows;
    }
  }

  if (!Number.isFinite(levelId) || !zoneId || !Number.isFinite(slotNumber)) {
    throw new Error("Slot tidak punya mapping level/zone/nomor yang valid.");
  }

  const zeroBasedRows = await updateAndReturnRows(
    client
      .from(parkingTable)
      .eq("level_id", levelId)
      .eq("zone_id", zoneId)
      .eq("slot_number", slotNumber - 1),
    payload,
  );

  if (zeroBasedRows.length > 0) {
    return zeroBasedRows;
  }

  const oneBasedRows = await updateAndReturnRows(
    client
      .from(parkingTable)
      .eq("level_id", levelId)
      .eq("zone_id", zoneId)
      .eq("slot_number", slotNumber),
    payload,
  );

  if (oneBasedRows.length === 0) {
    throw new Error("Slot Supabase tidak ditemukan untuk diupdate.");
  }

  return oneBasedRows;
}

export function subscribeToParkingChanges(onChange, onError) {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const channel = client
    .channel("parking-slots-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: parkingTable },
      () => {
        onChange();
      },
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        onError?.(new Error(`Supabase realtime ${status.toLowerCase()}`));
      }
    });

  return () => {
    client.removeChannel(channel);
  };
}
