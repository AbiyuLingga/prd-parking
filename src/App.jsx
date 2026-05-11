import { useState } from "react";
import { ParkingProvider } from "./context/ParkingContext";
import { ConfirmModal } from "./components/ConfirmModal";
import { ParkingMap } from "./components/ParkingMap";
import { Sidebar } from "./components/Sidebar";
import { useParking } from "./context/ParkingContext";

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
    <main className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <div className="min-h-screen bg-[linear-gradient(135deg,#0a0e1a_0%,#101827_52%,#111827_100%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1500px] min-w-0 flex-col gap-4 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
          <Sidebar />
          <ParkingMap onRequestPark={setPendingLot} />
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
