import { useState } from "react";
import {
  Bell,
  Home,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ParkingProvider } from "./context/ParkingContext";
import { ConfirmModal } from "./components/ConfirmModal";
import { ParkingMap } from "./components/ParkingMap";
import { Sidebar } from "./components/Sidebar";
import { useParking } from "./context/ParkingContext";

function TopNavigation() {
  return (
    <nav className="static-glass static-glass-nav mb-5 flex min-h-14 items-center gap-4 rounded-[22px] border border-white/12 bg-black/34 px-4 text-sm text-white shadow-md shadow-black/15">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ff6845] text-white">
        <Home size={18} />
      </div>
      <div className="hidden items-center gap-8 lg:flex">
        <span>Parking list</span>
        <span>What is Smart Parking?</span>
      </div>
      <div className="ml-auto flex min-w-[230px] flex-1 items-center gap-3 rounded-full bg-white/12 px-4 py-2 text-white/85 lg:max-w-[390px]">
        <Search size={16} />
        <span className="truncate text-xs">Lantai aktif, slot, atau lobby</span>
        <SlidersHorizontal className="ml-auto" size={16} />
      </div>
      <button
        aria-label="Notifications"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"
        type="button"
      >
        <Bell size={16} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff6845]" />
      </button>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,#ffd6a6,#ff6845)]" />
        <div className="leading-tight">
          <div className="text-xs font-semibold">Parking Admin</div>
          <div className="text-[11px] text-white/60">Indonesia</div>
        </div>
      </div>
    </nav>
  );
}

function ParkingDashboard() {
  const { parkCar } = useParking();
  const [pendingLot, setPendingLot] = useState(null);

  function handleConfirmParking() {
    if (!pendingLot) {
      return;
    }

    parkCar(pendingLot.id);
    setPendingLot(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1f201c] text-white">
      <div className="dashboard-room-bg absolute inset-0" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto min-h-screen w-full max-w-[1380px] px-4 py-4 sm:px-7">
        <TopNavigation />

        <div className="static-glass static-glass-panel grid min-h-[650px] grid-cols-1 gap-4 rounded-[28px] border border-white/14 bg-[#4e4b43]/66 p-4 shadow-lg shadow-black/20 lg:grid-cols-[minmax(0,1fr)_288px]">
          <ParkingMap onRequestPark={setPendingLot} />
          <Sidebar />
        </div>
      </div>

      <ConfirmModal
        lot={pendingLot}
        onCancel={() => setPendingLot(null)}
        onConfirm={handleConfirmParking}
      />
    </main>
  );
}

export default function App() {
  return (
    <ParkingProvider>
      <ParkingDashboard />
    </ParkingProvider>
  );
}
