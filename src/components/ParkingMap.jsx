import { DoorOpen, Layers3, MapPinned, MoveVertical } from "lucide-react";
import { useMemo } from "react";
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

export function ParkingMap({ onRequestPark }) {
  const {
    parkedCarId,
    parkingLots,
    recommendations,
    selectedFloor,
    selectedLotId,
    selectLot,
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

  const leftLots = useMemo(
    () => floorLots.filter((lot) => lot.row === "A"),
    [floorLots],
  );

  const rightLots = useMemo(
    () => floorLots.filter((lot) => lot.row === "B"),
    [floorLots],
  );

  function handleSlotClick(lot) {
    selectLot(lot.id);

    if (lot.isOccupied || parkedCarId) {
      return;
    }

    onRequestPark(lot);
  }

  return (
    <section className="relative flex min-h-[620px] max-w-[calc(100vw-32px)] min-w-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#0d1322] shadow-2xl shadow-black/30 lg:min-h-[720px] lg:max-w-none">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,165,233,0.09),transparent_38%),linear-gradient(90deg,rgba(16,185,129,0.08),transparent_42%),radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_1px)] bg-[size:auto,auto,28px_28px]" />

      <div className="relative z-10 flex w-full flex-col">
        <header className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/28 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cyan-200">
              <Layers3 size={17} />
              Lantai {selectedFloor}
            </div>
            <h2 className="text-2xl font-semibold text-white">
              2D Parking Layout
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-[260px]">
            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-400">Kosong</div>
              <div className="font-data text-lg font-semibold text-emerald-200">
                {selectedFloorStats.available}/{selectedFloorStats.total}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-400">Terisi</div>
              <div className="font-data text-lg font-semibold text-red-200">
                {selectedFloorStats.occupied}
              </div>
            </div>
          </div>
        </header>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-8">
          <div className="absolute left-5 top-5 z-20 flex flex-wrap gap-3 rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 backdrop-blur">
            <LegendItem
              className="border-emerald-200 bg-emerald-300/70"
              label="Available"
            />
            <LegendItem
              className="border-red-300 bg-red-400/60"
              label="Occupied"
            />
            <LegendItem
              className="border-yellow-100 bg-emerald-300 shadow-[0_0_10px_rgba(250,204,21,0.85)]"
              label="Recommended"
            />
          </div>

          <div className="relative h-[620px] w-full max-w-[860px]">
            {viewMode === "pedestrian_route" && parkedCarId && (
              <PedestrianRoute floor={selectedFloor} parkedLotId={parkedCarId} />
            )}

            <div className="absolute inset-x-0 top-10 mx-auto w-full max-w-[820px] rounded-lg border border-cyan-200/18 bg-slate-800/72 p-4 shadow-[0_32px_90px_rgba(0,0,0,0.35)] sm:p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)_72px] gap-3 sm:grid-cols-[minmax(0,1fr)_118px_minmax(0,1fr)_96px] sm:gap-5">
                <div className="space-y-3">
                  <div className="rounded-md border border-white/10 bg-slate-950/52 px-3 py-2 text-center text-xs font-semibold uppercase text-slate-300">
                    Sisi Kiri
                  </div>
                  <div className="grid grid-rows-6 gap-3">
                    {leftLots.map((lot) => (
                      <ParkingSlot
                        key={lot.id}
                        isRecommended={recommendationMap.has(lot.id)}
                        isSelected={selectedLotId === lot.id}
                        lot={lot}
                        onClick={() => handleSlotClick(lot)}
                        rank={recommendationMap.get(lot.id)?.rank}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-dashed border-cyan-200/35 bg-slate-950/62">
                  <div className="absolute inset-x-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-200/35" />
                  <div className="absolute inset-x-0 top-0 flex justify-center">
                    <div className="mt-3 flex items-center gap-1 rounded-md border border-cyan-200/25 bg-cyan-300/12 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                      <MoveVertical size={13} />
                      Jalan
                    </div>
                  </div>
                  <div className="absolute inset-x-4 top-16 bottom-8 rounded-full border-x border-cyan-200/20" />
                </div>

                <div className="space-y-3">
                  <div className="rounded-md border border-white/10 bg-slate-950/52 px-3 py-2 text-center text-xs font-semibold uppercase text-slate-300">
                    Sisi Kanan
                  </div>
                  <div className="grid grid-rows-6 gap-3">
                    {rightLots.map((lot) => (
                      <ParkingSlot
                        key={lot.id}
                        isRecommended={recommendationMap.has(lot.id)}
                        isSelected={selectedLotId === lot.id}
                        lot={lot}
                        onClick={() => handleSlotClick(lot)}
                        rank={recommendationMap.get(lot.id)?.rank}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-md border border-white/10 bg-slate-950/52 px-2 py-2 text-center text-xs font-semibold uppercase text-slate-300">
                    Area
                  </div>
                  <div className="relative flex min-h-[68px] flex-col items-center justify-center gap-1 overflow-hidden rounded-md border-2 border-cyan-200/55 bg-cyan-300/12 px-2 py-2 text-center text-cyan-100">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,211,238,0.13),transparent)]" />
                    <DoorOpen size={24} />
                    <span className="relative text-xs font-semibold uppercase">
                      Lobby
                    </span>
                    <span className="relative text-[11px] text-cyan-100/75">
                      Sisi kanan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-2 top-2 rounded-lg border border-white/10 bg-slate-950/58 p-3 text-sm text-slate-300 backdrop-blur">
              <div className="flex items-center gap-2">
                <MapPinned className="text-emerald-200" size={16} />
                Klik slot hijau untuk parkir
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
