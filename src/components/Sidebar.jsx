import {
  ArrowRight,
  Car,
  CheckCircle2,
  Database,
  Navigation,
  RefreshCw,
  TimerReset,
} from "lucide-react";
import { useParking } from "../context/ParkingContext";

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase text-slate-400">
        {label}
      </div>
      <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-slate-950/50 p-1">
        {options.map((option) => (
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              value === option.value
                ? "bg-[#ff6845] text-white"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DataModeControl({
  connectionStatus,
  dataError,
  dataMode,
  lastUpdatedAt,
  onRefresh,
  onSelectMode,
}) {
  const statusLabel = {
    simulation: "Simulasi lokal",
    connecting: "Menghubungkan",
    live: "Supabase live",
    offline: "Offline",
  }[connectionStatus];

  return (
    <section className="rounded-[18px] border border-white/12 bg-black/14 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Database size={16} />
          Mode Data
        </div>
        {dataMode === "real" && (
          <button
            aria-label="Refresh Supabase"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/12"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-slate-950/50 p-1">
        {[
          { label: "Simulasi", value: "simulation" },
          { label: "Real", value: "real" },
        ].map((option) => (
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              dataMode === option.value
                ? "bg-[#ff6845] text-white"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
            key={option.value}
            onClick={() => onSelectMode(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 text-xs">
        <span className="text-white/55">Status</span>
        <span
          className={`text-right ${
            connectionStatus === "offline" ? "text-red-100" : "text-emerald-200"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      {lastUpdatedAt && dataMode === "real" && (
        <div className="mt-2 flex justify-between gap-3 text-xs">
          <span className="text-white/55">Update</span>
          <span className="font-data text-white/75">
            {new Date(lastUpdatedAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      )}
      {dataError && (
        <div className="mt-3 rounded-lg border border-red-200/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {dataError}
        </div>
      )}
    </section>
  );
}

function RecommendationCard({ lot, rank, onSelect }) {
  return (
    <button
      className="group w-full rounded-[14px] border border-white/10 bg-white/8 p-3 text-left transition hover:border-[#c2ba95]/60 hover:bg-white/12"
      onClick={() => onSelect(lot.id)}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,#d8cfaa,#918c70)] text-[#1f201c]">
            <span className="font-data text-xs font-bold">{lot.id.split("-")[1]}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-[#c2ba95] text-xs font-bold text-[#1f201c]">
              {rank}
              </span>
              <span className="font-data text-sm font-semibold text-white">
                {lot.id}
              </span>
            </div>
            <div className="mt-1 text-xs text-white/55">{lot.jarakLobby}m ke lobby</div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#d8cfaa]">
        Sorot di map
        <ArrowRight
          className="transition group-hover:translate-x-1"
          size={14}
        />
      </div>
    </button>
  );
}

export function Sidebar() {
  const {
    connectionStatus,
    dataError,
    dataMode,
    leaveParking,
    lastUpdatedAt,
    parkedLot,
    recommendations,
    refreshRealData,
    selectedFloor,
    selectLot,
    setDataMode,
    setFloor,
    setViewMode,
    stats,
    viewMode,
  } = useParking();

  return (
    <aside className="flex min-w-0 flex-col gap-4 rounded-[22px] border border-white/12 bg-white/12 p-4 text-white shadow-lg shadow-black/15">
      <section className="rounded-[18px] border border-white/12 bg-black/14 p-4">
        <div className="mb-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">ITB Parking</div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-white/55">Location</span>
            <span className="text-right">Main Entrance</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/55">Empty slots</span>
            <span className="font-data">{stats.available}/{stats.total}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/55">System</span>
            <span className="inline-flex items-center gap-1 text-emerald-200">
              <CheckCircle2 size={13} />
              Online
            </span>
          </div>
        </div>
      </section>

      <DataModeControl
        connectionStatus={connectionStatus}
        dataError={dataError}
        dataMode={dataMode}
        lastUpdatedAt={lastUpdatedAt}
        onRefresh={refreshRealData}
        onSelectMode={setDataMode}
      />

      <SegmentedControl
        label="Lantai"
        onChange={setFloor}
        options={[
          { label: "Lantai 1", value: 1 },
          { label: "Lantai 2", value: 2 },
        ]}
        value={selectedFloor}
      />

      <section className="scrollbar-thin min-h-0 flex-1 overflow-y-auto rounded-[18px] border border-white/12 bg-black/14 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {parkedLot ? "My Parking" : "Recommended Spots"}
          </h2>
        </div>
        {!parkedLot && (
          <div className="space-y-3">
            {recommendations.map((lot, index) => (
              <RecommendationCard
                key={lot.id}
                lot={lot}
                onSelect={selectLot}
                rank={index + 1}
              />
            ))}
          </div>
        )}

        {parkedLot && (
          <div className="rounded-[14px] border border-orange-200/25 bg-orange-300/8 p-4">
            <div className="mb-3 flex items-center gap-2 text-orange-100">
              <Car size={18} />
              <h2 className="text-sm font-semibold">Mobil Terparkir</h2>
            </div>
            <div className="mb-4 rounded-lg bg-slate-950/45 p-3">
              <div className="font-data text-lg font-semibold text-white">
                {parkedLot.id}
              </div>
              <div className="text-sm text-slate-300">
                Lantai {parkedLot.floor}, {parkedLot.jarakLobby}m dari lobby
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  viewMode === "pedestrian_route"
                    ? "bg-[#ff6845] text-white"
                    : "bg-[#ffb547] text-slate-950 hover:bg-[#ffc96b]"
                }`}
                onClick={() => setViewMode("pedestrian_route")}
                type="button"
              >
                <Navigation size={18} />
                Cari Mobil Saya
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg border border-red-300/25 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/10"
                onClick={leaveParking}
                type="button"
              >
                <TimerReset size={18} />
                Keluar Parkir
              </button>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
