import {
  Layers3,
  Route,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useParking } from "../context/ParkingContext";
import { ParkingSlot } from "./ParkingSlot";
import { PedestrianRoute } from "./PedestrianRoute";

function LegendItem({ className, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className={`h-3 w-3 rounded-sm border ${className}`} />
      {label}
    </div>
  );
}

function MetricCard({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-[14px] border border-white/12 bg-white/12 p-4 shadow-sm">
      <div className="text-xs font-semibold text-white/75">{label}</div>
      <div className={`mt-3 font-data text-2xl font-semibold ${accent}`}>
        {value}
      </div>
    </div>
  );
}

export function ParkingMap({ onRequestPark }) {
  const {
    canManuallyPark,
    parkedCarId,
    parkingLots,
    recommendations,
    selectedFloor,
    selectedLotId,
    selectLot,
    setViewMode,
    viewMode,
  } = useParking();

  const floorLots = useMemo(
    () => parkingLots.filter((lot) => lot.floor === selectedFloor),
    [parkingLots, selectedFloor],
  );

  const recommendationMap = useMemo(
    () =>
      new Map(recommendations.map((lot, index) => [lot.id, { rank: index + 1 }])),
    [recommendations],
  );

  const selectedFloorStats = useMemo(() => {
    const available = floorLots.filter((lot) => !lot.isOccupied).length;
    const occupied = floorLots.filter((lot) => lot.isOccupied).length;
    return {
      available,
      occupied,
      total: floorLots.length,
    };
  }, [floorLots]);

  const nearestLot = recommendations[0] ?? floorLots.find((lot) => !lot.isOccupied);

  const handleSlotClick = useCallback((lot) => {
    selectLot(lot.id);

    if (lot.isOccupied || parkedCarId) {
      return;
    }

    onRequestPark(lot);
  }, [onRequestPark, parkedCarId, selectLot]);

  return (
    <section className="min-w-0 space-y-4 text-white">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
            <Layers3 size={17} />
            Lantai {selectedFloor}
          </div>
          <h2 className="text-2xl font-semibold">Personal cabinet</h2>
        </div>

        <div className="flex gap-2 rounded-full bg-black/15 p-1">
          <button
            className={`rounded-full px-5 py-2 text-xs font-semibold ${
              viewMode === "map"
                ? "bg-[#ff6845] text-white"
                : "text-white/80 hover:bg-white/8"
            }`}
            onClick={() => setViewMode("map")}
            type="button"
          >
            Map
          </button>
          <button
            className={`rounded-full px-5 py-2 text-xs font-semibold ${
              viewMode === "pedestrian_route"
                ? "bg-[#ff6845] text-white"
                : "text-white/80 hover:bg-white/8"
            }`}
            onClick={() => setViewMode("pedestrian_route")}
            type="button"
          >
            <span className="inline-flex items-center gap-1">
              <Route size={13} />
              Rute
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <MetricCard label="Active floor" value={`Lantai ${selectedFloor}`} />
        <MetricCard
          label="Empty slots"
          value={`${selectedFloorStats.available}/${selectedFloorStats.total}`}
          accent="text-white"
        />
        <MetricCard label="Recommended" value={nearestLot?.id ?? "-"} />
      </div>

      <div className="rounded-[18px] border border-white/12 bg-black/16 p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Live parking layout</h3>
            <p className="text-xs text-white/55">
              {canManuallyPark
                ? "Pilih slot hijau untuk parkir."
                : "Mode real membaca status dari Supabase."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-full bg-white/10 px-3 py-2">
            <LegendItem
              className="border-[#8e8972] bg-[#615f4e]"
              label="Available"
            />
            <LegendItem
              className="border-[#8f5a4e] bg-[#5f3a32]"
              label="Occupied"
            />
            <LegendItem
              className="border-[#c2ba95] bg-[#918c70] shadow-[0_0_10px_rgba(255,181,71,0.55)]"
              label="Recommended"
            />
          </div>
        </div>

        <div className="parking-stage relative min-h-[300px] overflow-hidden rounded-[16px] border border-white/10 bg-[#252720]/48 p-4">
          <div className="relative mx-auto min-h-[270px] w-full max-w-[760px]">
            {viewMode === "pedestrian_route" && parkedCarId && (
              <PedestrianRoute floor={selectedFloor} parkedLotId={parkedCarId} />
            )}

            <div className="relative rounded-[16px] p-4 pb-8">
              <div className="mb-4 grid grid-cols-[minmax(0,1fr)_96px] gap-4">
                <div className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-center text-xs font-semibold uppercase text-white/70">
                  Slot Parkir Lantai {selectedFloor}
                </div>
                <div className="rounded-md border border-orange-200/35 bg-orange-300/12 px-3 py-2 text-center text-xs font-semibold uppercase text-orange-100">
                  Lobby
                </div>
              </div>

              <div
                className={`grid gap-3 ${
                  selectedFloor === 1 ? "grid-cols-2" : "grid-cols-3"
                }`}
              >
                {floorLots.map((lot) => (
                  <ParkingSlot
                    key={lot.id}
                    isRecommended={recommendationMap.has(lot.id)}
                    isSelected={selectedLotId === lot.id}
                    lot={lot}
                    onSelect={handleSlotClick}
                    rank={recommendationMap.get(lot.id)?.rank}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
