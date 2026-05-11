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

  if (!rowValue) {
    return undefined;
  }

  const normalizedValue = String(rowValue).trim().toLowerCase();

  if (["kiri", "left", "a", "zone_a", "zona_a"].includes(normalizedValue)) {
    return "A";
  }

  if (["kanan", "right", "b", "zone_b", "zona_b"].includes(normalizedValue)) {
    return "B";
  }

  return String(rowValue).trim().charAt(0).toUpperCase();
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
  const rawLevelId = readFirst(row, ["level_id", "levelId"]);
  const rawZoneId = readFirst(row, ["zone_id", "zoneId"]);
  const rawAreaId = readFirst(row, ["area_id", "areaId"]);
  const rawSlotNumber = readFirst(row, ["slot_number", "slotNumber"]);

  return {
    rawId,
    source: {
      parkingId: rawId,
      levelId: rawLevelId,
      zoneId: rawZoneId,
      areaId: rawAreaId,
      slotNumber: rawSlotNumber,
    },
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
  const baseLots = generateParkingLots().map((lot, index) => ({
    ...lot,
    isOccupied: index % 2 === 0,
    isFallbackData: true,
  }));
  const baseById = new Map(baseLots.map((lot) => [lot.id, lot]));
  const normalizedSlots = rows.map(normalizeSlotRow);
  const usesZeroBasedLevels = normalizedSlots.some(
    (slot) => Number(slot.source?.levelId) === 0,
  );
  const usesZeroBasedSlotNumbers = normalizedSlots.some(
    (slot) =>
      Number.isFinite(slot.column) &&
      slot.column === 0 &&
      !(slot.rawId && /^L\d+-[A-Z]\d+$/.test(String(slot.rawId))),
  );

  normalizedSlots.forEach((slot) => {
    const sourceLevel = Number(slot.source?.levelId);
    const floor = Number.isFinite(sourceLevel)
      ? usesZeroBasedLevels
        ? sourceLevel + 1
        : sourceLevel
      : slot.floor;
    const column =
      usesZeroBasedSlotNumbers &&
      Number.isFinite(slot.column) &&
      !(slot.rawId && /^L\d+-[A-Z]\d+$/.test(String(slot.rawId)))
        ? slot.column + 1
        : slot.column;
    const id = buildLayoutId({
      id: slot.rawId,
      floor,
      row: slot.row,
      column,
    });

    if (!id || !baseById.has(id)) {
      return;
    }

    const baseLot = baseById.get(id);
    baseById.set(id, {
      ...baseLot,
      floor: Number.isFinite(floor) ? floor : baseLot.floor,
      row: slot.row ?? baseLot.row,
      column: Number.isFinite(column) ? column : baseLot.column,
      isOccupied: slot.isOccupied,
      isFallbackData: false,
      supabaseRef: slot.source,
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
  const floor = Number(match?.[1] ?? lot.floor);

  return {
    id,
    floor,
    zeroBasedLevelId: floor - 1,
    oneBasedLevelId: floor,
    zoneId: match?.[2] ?? lot.row,
    slotNumber: Number(match?.[3] ?? lot.column),
  };
}

function isUsableFilterValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function dedupeFilters(filtersList) {
  const seen = new Set();

  return filtersList.filter((filters) => {
    if (!filters.every(([, value]) => isUsableFilterValue(value))) {
      return false;
    }

    const key = JSON.stringify(filters);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function updateAndReturnRows(client, filters, payload) {
  let query = client.from(parkingTable).update(payload);

  filters.forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  const { data, error } = await query.select("parking_id");

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

  const { id, floor, zeroBasedLevelId, oneBasedLevelId, zoneId, slotNumber } =
    layoutFieldsFromLot(lot);
  const payload = { is_filled: isFilled };
  const supabaseRef = lot?.supabaseRef ?? {};

  if (!Number.isFinite(floor) || !zoneId || !Number.isFinite(slotNumber)) {
    throw new Error("Slot tidak punya mapping level/zone/nomor yang valid.");
  }

  const levelCandidates = [
    supabaseRef.levelId,
    zeroBasedLevelId,
    oneBasedLevelId,
  ].filter((value, index, values) => isUsableFilterValue(value) && values.indexOf(value) === index);
  const zoneCandidates = [
    supabaseRef.zoneId,
    zoneId,
    zoneId === "A" ? "kiri" : undefined,
    zoneId === "B" ? "kanan" : undefined,
    String(zoneId).toLowerCase(),
    String(zoneId).toUpperCase(),
  ].filter((value, index, values) => isUsableFilterValue(value) && values.indexOf(value) === index);
  const areaCandidates = [
    supabaseRef.areaId,
    zoneId,
    String(zoneId).toLowerCase(),
    String(zoneId).toUpperCase(),
  ].filter((value, index, values) => isUsableFilterValue(value) && values.indexOf(value) === index);
  const slotNumberCandidates = [
    supabaseRef.slotNumber,
    slotNumber - 1,
    slotNumber,
  ].filter((value, index, values) => isUsableFilterValue(value) && values.indexOf(value) === index);

  const candidateFilters = dedupeFilters([
    [["parking_id", supabaseRef.parkingId]],
    [["parking_id", id]],
    ...levelCandidates.flatMap((levelId) =>
      zoneCandidates.flatMap((zoneValue) =>
        slotNumberCandidates.map((slotValue) => [
          ["level_id", levelId],
          ["zone_id", zoneValue],
          ["slot_number", slotValue],
        ]),
      ),
    ),
    ...levelCandidates.flatMap((levelId) =>
      areaCandidates.flatMap((areaValue) =>
        slotNumberCandidates.map((slotValue) => [
          ["level_id", levelId],
          ["area_id", areaValue],
          ["slot_number", slotValue],
        ]),
      ),
    ),
  ]);

  for (const filters of candidateFilters) {
    const rows = await updateAndReturnRows(client, filters, payload);

    if (rows.length > 0) {
      return rows;
    }
  }

  throw new Error(
    `Slot Supabase tidak ditemukan untuk diupdate. UI=${id}, filter dicoba=${JSON.stringify(
      candidateFilters,
    )}`,
  );
}

export async function randomizeRealParkingSlots() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase env belum diisi");
  }

  const { data, error } = await client.from(parkingTable).select("parking_id");

  if (error) {
    throw error;
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    throw new Error("Tabel Supabase belum punya data slot untuk di-random.");
  }

  const shuffledRows = [...rows].sort(() => Math.random() - 0.5);
  const filledCount = Math.floor(shuffledRows.length / 2);
  const filledIds = new Set(
    shuffledRows.slice(0, filledCount).map((row) => row.parking_id),
  );

  const updates = rows.map((row) =>
    client
      .from(parkingTable)
      .update({ is_filled: filledIds.has(row.parking_id) })
      .eq("parking_id", row.parking_id),
  );

  const results = await Promise.all(updates);
  const failedResult = results.find((result) => result.error);

  if (failedResult) {
    throw failedResult.error;
  }

  return rows.length;
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
