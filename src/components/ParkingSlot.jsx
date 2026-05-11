import { Car } from "lucide-react";

function slotTone(lot, isRecommended, isSelected) {
  if (isRecommended) {
    return "border-emerald-100 bg-emerald-300 text-slate-950";
  }

  if (lot.isOccupied) {
    return "border-red-300 bg-red-500/70 text-red-50";
  }

  if (isSelected) {
    return "border-cyan-100 bg-cyan-300/80 text-slate-950";
  }

  return "border-emerald-200 bg-emerald-300/65 text-slate-950";
}

export function ParkingSlot({ isRecommended, isSelected, lot, onClick, rank }) {
  const blocked = lot.isOccupied;

  return (
    <button
      aria-label={`${lot.id}, ${
        lot.isOccupied ? "terisi" : "tersedia"
      }`}
      className={`group relative flex min-h-[68px] items-center justify-between gap-3 rounded-md border-2 px-3 py-2 shadow-lg transition duration-200 ${slotTone(
        lot,
        isRecommended,
        isSelected,
      )} ${blocked ? "cursor-default" : "hover:brightness-110"} ${
        isRecommended ? "z-20" : "z-10"
      }`}
      onClick={onClick}
      style={{
        animation: isRecommended ? "pulse-recommend 1.8s infinite" : undefined,
      }}
      title={`${lot.id} | ${lot.jarakLobby}m | status ${
        lot.isOccupied ? "terisi" : "kosong"
      }`}
      type="button"
    >
      <span className="flex flex-col items-start gap-1 text-left">
        <span className="flex items-center gap-1">
          {lot.isOccupied && <Car size={15} />}
          <span className="font-data text-sm font-semibold">{lot.id}</span>
        </span>
        <span
          className={`text-[11px] ${
            isRecommended || isSelected ? "text-slate-800" : "text-slate-200"
          }`}
        >
          {lot.jarakLobby}m
        </span>
      </span>

      {rank && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white bg-slate-950 font-data text-xs font-bold text-white">
          {rank}
        </span>
      )}
    </button>
  );
}
