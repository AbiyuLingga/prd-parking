import {
  Layers3,
  MoveVertical,
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
    return {
      available,
      occupied: floorLots.length - available,
      total: floorLots.length,
    };
  }, [floorLots]);

  const nearestLot = recommendations[0] ?? floorLots.find((lot) => !lot.isOccupied);

  const leftLots = useMemo(
    () => floorLots.filter((lot) => lot.row === "A"),
    [floorLots],
  );

  const rightLots = useMemo(
    () => floorLots.filter((lot) => lot.row === "B"),
    [floorLots],
  );

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

        <div className="parking-stage relative min-h-[560px] overflow-hidden rounded-[16px] border border-white/10 bg-[#252720]/48 p-4">
          <div className="relative mx-auto h-[530px] w-full max-w-[860px]">
            {viewMode === "pedestrian_route" && parkedCarId && (
              <PedestrianRoute floor={selectedFloor} parkedLotId={parkedCarId} />
            )}

            <div className="absolute inset-x-0 top-0 mx-auto w-full origin-top scale-[0.58] rounded-[16px] p-4 pb-8 sm:scale-[0.78] xl:scale-100">
              <div className="grid grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)_72px] gap-3 sm:grid-cols-[minmax(0,1fr)_118px_minmax(0,1fr)_96px] sm:gap-5">
                <div className="space-y-3">
                  <div className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-center text-xs font-semibold uppercase text-white/70">
                    Sisi Kiri
                  </div>
                  <div className="grid grid-rows-6 gap-2">
                    {leftLots.map((lot) => (
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

                <div className="relative overflow-hidden rounded-lg border border-dashed border-white/18 bg-black/22">
                  <div className="absolute inset-x-1/2 top-0 h-full w-px -translate-x-1/2 bg-orange-100/35" />
                  <div className="absolute inset-x-0 top-0 flex justify-center">
                    <div className="mt-3 flex items-center gap-1 rounded-md border border-orange-200/25 bg-orange-300/12 px-2 py-1 text-[11px] font-semibold text-orange-100">
                      <MoveVertical size={13} />
                      Jalan
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-md border border-orange-100/25 bg-[#252720]/80 px-3 py-2 text-center font-data text-sm font-semibold text-orange-100 shadow-sm">
                      L{selectedFloor}
                    </div>
                  </div>
                  <div className="absolute inset-x-4 top-16 bottom-8 rounded-full border-x border-orange-200/20" />
                </div>

                <div className="space-y-3">
                  <div className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-center text-xs font-semibold uppercase text-white/70">
                    Sisi Kanan
                  </div>
                  <div className="grid grid-rows-6 gap-2">
                    {rightLots.map((lot) => (
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

                <div className="flex flex-col gap-3">
                  <div className="rounded-md border border-white/10 bg-black/24 px-2 py-2 text-center text-xs font-semibold uppercase text-white/70">
                    Area
                  </div>
                  <div className="relative flex min-h-[68px] items-center justify-center overflow-hidden rounded-md border-2 border-orange-200/55 bg-orange-300/12 px-2 py-2 text-center text-orange-100">
                    <span className="relative text-xs font-semibold uppercase">
                      Lobby
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
