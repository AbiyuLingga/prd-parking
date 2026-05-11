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

function normalizeSlotRow(row) {
  const id = readFirst(row, ["slot_id", "slotId", "id", "lot_id", "lotId", "parking_slot"]);
  const floor = Number(readFirst(row, ["floor", "lantai"]) ?? id?.match(/^L(\d+)/)?.[1]);
  const rowLabel = readFirst(row, ["row", "baris"]) ?? id?.match(/-([A-Z])\d+/)?.[1];
  const column = Number(readFirst(row, ["column", "col", "slot_number", "slotNumber"]) ?? id?.match(/(\d+)$/)?.[1]);

  return {
    id,
    floor,
    row: rowLabel,
    column,
    isOccupied: normalizeBoolean(
      readFirst(row, ["is_occupied", "isOccupied", "occupied", "status", "value"]),
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

  rows.map(normalizeSlotRow).forEach((slot) => {
    if (!slot.id || !baseById.has(slot.id)) {
      return;
    }

    const baseLot = baseById.get(slot.id);
    baseById.set(slot.id, {
      ...baseLot,
      floor: Number.isFinite(slot.floor) ? slot.floor : baseLot.floor,
      row: slot.row ?? baseLot.row,
      column: Number.isFinite(slot.column) ? slot.column : baseLot.column,
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
