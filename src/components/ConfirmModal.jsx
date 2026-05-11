import { Car, MapPinned, X } from "lucide-react";

export function ConfirmModal({ lot, onCancel, onConfirm }) {
  if (!lot) {
    return null;
  }

  return (
    <div
      aria-labelledby="parking-confirm-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#15140f]/78 p-4"
      role="dialog"
    >
      <div className="static-glass static-glass-modal animate-modal-in w-full max-w-md rounded-[22px] border border-orange-100/18 bg-[#24231d]/86 p-5 shadow-lg shadow-black/35">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff6845] text-white shadow-lg shadow-orange-950/30">
              <Car size={24} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-white"
                id="parking-confirm-title"
              >
                Konfirmasi Slot Kosong
              </h2>
              <p className="text-sm text-white/58">
                Slot ini tersedia dan bisa langsung dipakai.
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup modal"
            className="rounded-md p-2 text-white/55 transition hover:bg-white/8 hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-[16px] border border-orange-100/14 bg-black/22 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-data text-2xl font-semibold text-white">
              {lot.id}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-300/18 px-3 py-1 text-xs font-semibold text-emerald-100">
              <MapPinned size={13} />
              Kosong
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-white/45">Lantai</div>
              <div className="font-semibold text-white">Lantai {lot.floor}</div>
            </div>
            <div>
              <div className="text-white/45">Jarak</div>
              <div className="font-semibold text-white">
                {lot.jarakLobby}m
              </div>
            </div>
            <div>
              <div className="text-white/45">Padat</div>
              <div className="font-semibold text-white">
                {lot.kepadatanPrediksi}/10
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/8 hover:text-white"
            onClick={onCancel}
            type="button"
          >
            Batal
          </button>
          <button
            className="rounded-xl bg-[#ff6845] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ff7d5e]"
            onClick={onConfirm}
            type="button"
          >
            Ya, Parkir
          </button>
        </div>
      </div>
    </div>
  );
}
