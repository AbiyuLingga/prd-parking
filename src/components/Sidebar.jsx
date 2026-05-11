import {
  ArrowRight,
  Car,
  MapPinned,
  Navigation,
  ParkingCircle,
  Route,
  TimerReset,
  Users,
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
                ? "bg-cyan-400 text-slate-950"
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

function StatTile({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <Icon className={tone} size={18} />
      </div>
      <div className="font-data text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function RecommendationCard({ lot, rank, onSelect }) {
  return (
    <button
      className="group w-full rounded-lg border border-emerald-300/20 bg-emerald-300/8 p-3 text-left transition hover:border-emerald-200/60 hover:bg-emerald-300/14"
      onClick={() => onSelect(lot.id)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-300 text-xs font-bold text-slate-950">
              {rank}
            </span>
            <span className="font-data text-base font-semibold text-white">
              {lot.id}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
            <span>{lot.jarakLobby}m ke lobby</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-data text-sm font-semibold text-emerald-200">
            {lot.costScore}
          </div>
          <div className="text-[11px] text-slate-500">score</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-200">
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
    leaveParking,
    parkedLot,
    recommendations,
    selectedFloor,
    selectLot,
    setFloor,
    setViewMode,
    stats,
    viewMode,
  } = useParking();

  return (
    <aside className="flex w-full max-w-[calc(100vw-32px)] min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-900/72 shadow-2xl shadow-black/30 backdrop-blur lg:max-h-[calc(100vh-48px)] lg:w-[390px] lg:max-w-none">
      <div className="border-b border-white/10 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-slate-950">
            <ParkingCircle size={26} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Smart Parking System
            </h1>
            <p className="text-sm text-slate-400">
              Simulasi rekomendasi slot parkir
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatTile
            icon={MapPinned}
            label="Kosong"
            tone="text-emerald-200"
            value={`${stats.available}/${stats.total}`}
          />
          <StatTile
            icon={Car}
            label="Terisi"
            tone="text-red-300"
            value={`${stats.occupiedPercentage}%`}
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-5">
        <section className="space-y-3">
          <SegmentedControl
            label="Lantai"
            onChange={setFloor}
            options={[
              { label: "Lantai 1", value: 1 },
              { label: "Lantai 2", value: 2 },
            ]}
            value={selectedFloor}
          />
        </section>

        {!parkedLot && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase text-slate-400">
                Rekomendasi
              </h2>
              <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300">
                Top 3
              </span>
            </div>
            <div className="space-y-2">
              {recommendations.map((lot, index) => (
                <RecommendationCard
                  key={lot.id}
                  lot={lot}
                  onSelect={selectLot}
                  rank={index + 1}
                />
              ))}
            </div>
          </section>
        )}

        {parkedLot && (
          <section className="rounded-lg border border-cyan-200/25 bg-cyan-300/8 p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-100">
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
                    ? "bg-cyan-200 text-slate-950"
                    : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
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
          </section>
        )}
      </div>

      <div className="border-t border-white/10 p-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 p-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Users size={16} />
            Mode tampilan
          </div>
          <div className="flex gap-1">
            <button
              className={`rounded-md px-3 py-2 text-xs font-semibold ${
                viewMode === "map"
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-white/8"
              }`}
              onClick={() => setViewMode("map")}
              type="button"
            >
              Map
            </button>
            <button
              className={`rounded-md px-3 py-2 text-xs font-semibold ${
                viewMode === "pedestrian_route"
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-white/8"
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
        </div>
      </div>
    </aside>
  );
}
