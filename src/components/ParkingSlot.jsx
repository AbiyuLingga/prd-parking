import { memo, useCallback } from "react";
import { Car } from "lucide-react";

function slotTone(lot, isRecommended, isSelected) {
  if (isRecommended) {
    return "border-[#c2ba95] bg-[#918c70]/95 text-[#fff9e8]";
  }

  if (lot.isOccupied) {
    return "border-[#8f5a4e] bg-[#5f3a32]/85 text-[#f0d4c8]";
  }

  if (isSelected) {
    return "border-orange-100 bg-[#ffb547] text-slate-950";
  }

  return "border-[#8e8972] bg-[#615f4e]/85 text-[#f2ecd8]";
}

function ParkingSlotComponent({ isRecommended, isSelected, lot, onSelect, rank }) {
  const blocked = lot.isOccupied;
  const handleClick = useCallback(() => {
    onSelect(lot);
  }, [lot, onSelect]);
  const recommendedGlow = isRecommended
    ? {
        boxShadow:
          "0 0 0 2px rgba(254, 249, 195, 0.72), 0 0 14px rgba(250, 204, 21, 0.34)",
      }
    : undefined;

  return (
    <button
      aria-label={`${lot.id}, ${
        lot.isOccupied ? "terisi" : "tersedia"
      }`}
      className={`parking-slot group relative flex min-h-[64px] items-center justify-between gap-3 rounded-md border-2 px-3 py-2 transition-colors duration-100 ${slotTone(
        lot,
        isRecommended,
        isSelected,
      )} ${blocked ? "cursor-default" : "hover:border-white/70"} ${
        isRecommended ? "z-20" : "z-10"
      }`}
      onClick={handleClick}
      style={recommendedGlow}
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
            isRecommended || isSelected ? "text-[#343020]" : "text-[#d8cfb9]"
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

export const ParkingSlot = memo(ParkingSlotComponent);
