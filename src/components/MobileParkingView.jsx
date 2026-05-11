import {
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  Database,
  Home,
  Navigation,
  RefreshCw,
  Shuffle,
  TimerReset,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useParking } from "../context/ParkingContext";

function MobileStatCard({ title, value, emphasize = false }) {
  return (
    <div
      className={`relative flex h-24 flex-col justify-between overflow-hidden rounded-[18px] border p-4 ${
        emphasize
          ? "border-white/10 bg-[#2a2723]/80 shadow-lg shadow-black/20"
          : "border-white/5 bg-[#2a2723]/58"
      }`}
    >
      {emphasize && (
        <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-white/5 blur-xl" />
      )}
      <span className="relative text-xs font-medium text-white/50">{title}</span>
      <span className="relative font-data text-2xl font-bold tracking-tight text-white">
        {value}
      </span>
    </div>
  );
}

function MobileRecommendationCard({ lot, rank, onOpenMap }) {
  return (
    <div
      className="relative flex w-64 shrink-0 snap-center flex-col overflow-hidden rounded-[20px] border border-white/5 bg-[#2a2723]/78 p-4 text-left"
    >
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(194,186,149,0.09))]" />
      <div className="relative mb-8 grid h-8 w-8 place-items-center rounded-lg border border-[#c2ba95]/35 bg-[#918c70]/26 text-sm font-bold text-[#fff6dc]">
        {rank}
      </div>
      <div className="relative mt-auto flex items-end justify-between gap-3">
        <div>
          <h4 className="font-data text-lg font-bold text-white">{lot.id}</h4>
          <div className="mt-0.5 text-xs text-white/48">{lot.jarakLobby}m ke lobby</div>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
          onClick={() => onOpenMap(lot)}
          type="button"
        >
          Map
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function MobileParkingSlot({ lot, isRecommended, isSelected, onSelect, rank }) {
  const handleClick = useCallback(() => {
    onSelect(lot);
  }, [lot, onSelect]);

  let statusClass = "border-white/5 bg-[#33312e]/50 text-white/80";

  if (lot.isOccupied) {
    statusClass = "border-[#8f5a4e]/50 bg-[#5f3a32]/58 text-[#f0d4c8]/70";
  } else if (isRecommended) {
    statusClass =
      "border-[#c2ba95]/55 bg-[#918c70]/30 text-white shadow-[inset_0_0_18px_rgba(194,186,149,0.08),0_0_14px_rgba(255,181,71,0.14)] ring-1 ring-[#c2ba95]/18";
  } else if (isSelected) {
    statusClass = "border-orange-100/80 bg-[#ffb547]/80 text-[#201d19]";
  }

  return (
    <button
      aria-label={`${lot.id}, ${lot.isOccupied ? "terisi" : "tersedia"}`}
      className={`parking-slot relative flex h-[72px] flex-col justify-center overflow-hidden rounded-xl border p-3 text-left transition-colors ${statusClass}`}
      onClick={handleClick}
      type="button"
    >
      {isRecommended && (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(194,186,149,0.12),transparent)]" />
      )}
      <div className="relative flex items-center gap-2">
        {lot.isOccupied && <Car className="text-[#ffb6a0]/55" size={14} />}
        <span
          className={`font-data text-sm font-semibold tracking-wide ${
            lot.isOccupied ? "text-white/42 line-through decoration-white/20" : ""
          }`}
        >
          {lot.id}
        </span>
      </div>
      <span className="relative mt-1 text-[11px] text-white/42">{lot.jarakLobby}m</span>
      {rank && (
        <span className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#1a1715] font-data text-xs font-bold text-white shadow-lg shadow-black/40">
          {rank}
        </span>
      )}
    </button>
  );
}

export function MobileParkingView({ onRequestPark }) {
  const {
    canManuallyPark,
    connectionStatus,
    dataError,
    dataMode,
    leaveParking,
    parkedCarId,
    parkedLot,
    parkingLots,
    recommendations,
    refreshRealData,
    resetRealParking,
    selectedFloor,
    selectedLotId,
    selectLot,
    setDataMode,
    setFloor,
    setViewMode,
    viewMode,
  } = useParking();

  const floorLots = useMemo(
    () => parkingLots.filter((lot) => lot.floor === selectedFloor),
    [parkingLots, selectedFloor],
  );

  const leftLots = useMemo(
    () => floorLots.filter((lot) => lot.row === "A"),
    [floorLots],
  );

  const rightLots = useMemo(
    () => floorLots.filter((lot) => lot.row === "B"),
    [floorLots],
  );

  const recommendationMap = useMemo(
    () => new Map(recommendations.map((lot, index) => [lot.id, index + 1])),
    [recommendations],
  );

  const floorAvailable = floorLots.filter((lot) => !lot.isOccupied).length;
  const nearestLot = recommendations[0] ?? floorLots.find((lot) => !lot.isOccupied);

  const handleSlotSelect = useCallback(
    (lot) => {
      selectLot(lot.id);

      if (lot.isOccupied || parkedCarId) {
        return;
      }

      onRequestPark(lot);
    },
    [onRequestPark, parkedCarId, selectLot],
  );

  const handleOpenMap = useCallback(
    (lot) => {
      setFloor(lot.floor);
      selectLot(lot.id);
      setViewMode("map");
      document
        .getElementById("mobile-live-layout")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [selectLot, setFloor, setViewMode],
  );

  return (
    <section className="relative z-10 mx-auto w-full max-w-[390px] pb-24 text-white lg:hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-[linear-gradient(180deg,#201d19,rgba(32,29,25,0))] p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff6845] shadow-[0_0_15px_rgba(255,104,69,0.28)]">
            <Home size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-white/90">
              Smart Parking
            </span>
            <span className="text-[10px] text-white/50">ITB Main Entrance</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"
            type="button"
          >
            <Bell size={18} className="text-white/80" />
          </button>
          <div className="h-10 w-10 rounded-full border-2 border-[#201d19] bg-[linear-gradient(45deg,#ff6845,#ffd6a6)] shadow-lg" />
        </div>
      </header>

      <div className="space-y-6 px-5">
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            emphasize
            title="Empty slots"
            value={`${floorAvailable}/${floorLots.length}`}
          />
          <MobileStatCard title="Recommended" value={nearestLot?.id ?? "-"} />
        </div>

        <div className="rounded-[20px] border border-white/5 bg-[#2a2723]/72 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/65">
              <Database size={14} />
              Mode Data
            </div>
            {dataMode === "real" && (
              <div className="flex items-center gap-2">
                <button
                  aria-label="Reset random parkiran"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70"
                  onClick={resetRealParking}
                  type="button"
                >
                  <Shuffle size={14} />
                </button>
                <button
                  aria-label="Refresh Supabase"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70"
                  onClick={refreshRealData}
                  type="button"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 rounded-[14px] border border-white/5 bg-black/18 p-1">
            {[
              { label: "Simulasi", value: "simulation" },
              { label: "Real", value: "real" },
            ].map((option) => (
              <button
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  dataMode === option.value
                    ? "bg-[#ff6845] text-white"
                    : "text-white/50"
                }`}
                key={option.value}
                onClick={() => setDataMode(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-3 text-xs">
            <span className="text-white/45">Status</span>
            <span
              className={
                connectionStatus === "offline" ? "text-red-100" : "text-emerald-200"
              }
            >
              {connectionStatus === "live"
                ? "Supabase live"
                : connectionStatus === "connecting"
                  ? "Menghubungkan"
                  : connectionStatus === "offline"
                    ? "Offline"
                    : "Simulasi lokal"}
            </span>
          </div>
          {dataError && (
            <div className="mt-2 rounded-lg border border-red-200/15 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {dataError}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-white/90">
              RECOMMENDED SPOTS
            </h3>
            <span className="flex items-center gap-1 text-xs text-[#d8cfaa]">
              <CheckCircle2 size={12} />
              Live
            </span>
          </div>

          {parkedLot ? (
            <div className="rounded-[20px] border border-orange-200/20 bg-orange-300/8 p-4">
              <div className="mb-3 flex items-center gap-2 text-orange-100">
                <Car size={18} />
                <h3 className="text-sm font-semibold">Mobil Terparkir</h3>
              </div>
              <div className="mb-4 rounded-xl bg-black/22 p-3">
                <div className="font-data text-lg font-semibold">{parkedLot.id}</div>
                <div className="text-sm text-white/58">
                  Lantai {parkedLot.floor}, {parkedLot.jarakLobby}m dari lobby
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${
                    viewMode === "pedestrian_route"
                      ? "bg-[#ff6845] text-white"
                      : "bg-[#ffb547] text-[#201d19]"
                  }`}
                  onClick={() =>
                    setViewMode(
                      viewMode === "pedestrian_route" ? "map" : "pedestrian_route",
                    )
                  }
                  type="button"
                >
                  <Navigation size={16} />
                  Rute
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-300/25 px-3 py-3 text-sm font-semibold text-red-100"
                  onClick={leaveParking}
                  type="button"
                >
                  <TimerReset size={16} />
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <div className="hide-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-4">
              {recommendations.map((lot, index) => (
                <MobileRecommendationCard
                  key={lot.id}
                  lot={lot}
                  onOpenMap={handleOpenMap}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pb-8" id="mobile-live-layout">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-white/90">
              LIVE LAYOUT
            </h3>
            <div className="flex rounded-[14px] border border-white/5 bg-[#2a2723]/80 p-1">
              {[1, 2].map((floor) => (
                <button
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedFloor === floor
                      ? "bg-[#ff6845] text-white shadow-md"
                      : "text-white/50"
                  }`}
                  key={floor}
                  onClick={() => setFloor(floor)}
                  type="button"
                >
                  Lantai {floor}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#2a2723]/60 p-4 shadow-2xl shadow-black/25">
            <div className="relative flex">
              <div className="flex flex-1 flex-col gap-2.5">
                <div className="mb-2 rounded-lg border border-white/5 bg-black/20 py-1.5 text-center text-[10px] font-semibold tracking-widest text-white/40">
                  SISI KIRI
                </div>
                {leftLots.map((lot) => (
                  <MobileParkingSlot
                    key={lot.id}
                    isRecommended={recommendationMap.has(lot.id)}
                    isSelected={selectedLotId === lot.id}
                    lot={lot}
                    onSelect={handleSlotSelect}
                    rank={recommendationMap.get(lot.id)}
                  />
                ))}
              </div>

              <div className="relative mx-2 flex w-12 shrink-0 flex-col items-center justify-center border-x border-dashed border-white/10">
                <div className="mb-8 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#1f1a15] font-data text-[10px] font-bold text-white/70 shadow-lg">
                  L{selectedFloor}
                </div>
                <div className="mb-8 flex flex-1 flex-col items-center justify-center gap-8 font-semibold text-white/10">
                  <span className="mb-12 rotate-90 text-[10px] tracking-[0.4em]">
                    JALAN
                  </span>
                  <span className="mt-12 rotate-90 text-[10px] tracking-[0.4em]">
                    JALAN
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                <div className="mb-2 rounded-lg border border-[#ff6845]/20 bg-[#ff6845]/10 py-1.5 text-center text-[10px] font-semibold tracking-widest text-[#ff6845]">
                  SISI KANAN
                  <br />
                  <span className="text-[8px] opacity-70">LOBBY AREA</span>
                </div>
                {rightLots.map((lot) => (
                  <MobileParkingSlot
                    key={lot.id}
                    isRecommended={recommendationMap.has(lot.id)}
                    isSelected={selectedLotId === lot.id}
                    lot={lot}
                    onSelect={handleSlotSelect}
                    rank={recommendationMap.get(lot.id)}
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
