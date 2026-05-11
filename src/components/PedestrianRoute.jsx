import { CarFront, DoorOpen } from "lucide-react";
import { useMemo } from "react";
import { useParking } from "../context/ParkingContext";

function pointForLot(lot) {
  const y = 116 + lot.columnIndex * 81;

  return {
    x: lot.row === "A" ? 180 : 620,
    y,
  };
}

export function PedestrianRoute({ floor, parkedLotId }) {
  const { parkingLots } = useParking();

  const parkedLot = useMemo(
    () => parkingLots.find((lot) => lot.id === parkedLotId),
    [parkingLots, parkedLotId],
  );

  if (!parkedLot || parkedLot.floor !== floor) {
    return (
      <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2 rounded-lg border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm text-amber-100">
        Mobil berada di Lantai {parkedLot?.floor ?? "-"}
      </div>
    );
  }

  const start = { x: 785, y: 116 };
  const end = pointForLot(parkedLot);
  const mid = {
    x: 430,
    y: end.y,
  };
  const path = `M ${start.x} ${start.y} L ${mid.x} ${start.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 860 620"
      >
        <path
          d={path}
          fill="none"
          stroke="rgba(255,181,71,0.95)"
          strokeDasharray="12 10"
          strokeLinecap="round"
          strokeWidth="7"
        />
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      <div
        className="absolute grid h-11 w-11 place-items-center rounded-lg border border-orange-100 bg-slate-950 text-orange-100 shadow-sm"
        style={{ left: start.x - 22, top: start.y - 22 }}
      >
        <DoorOpen size={21} />
      </div>
      <div
        className="absolute grid h-11 w-11 place-items-center rounded-lg border border-emerald-100 bg-slate-950 text-emerald-100 shadow-sm"
        style={{ left: end.x - 22, top: end.y - 22 }}
      >
        <CarFront size={21} />
      </div>
    </div>
  );
}
