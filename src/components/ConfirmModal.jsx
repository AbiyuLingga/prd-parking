import { Car, X } from "lucide-react";

export function ConfirmModal({ lot, onCancel, onConfirm }) {
  if (!lot) {
    return null;
  }

  return (
    <div
      aria-labelledby="parking-confirm-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md"
      role="dialog"
    >
      <div className="animate-modal-in w-full max-w-md rounded-lg border border-white/16 bg-slate-900/86 p-5 shadow-2xl shadow-black/45">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-slate-950">
              <Car size={24} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-white"
                id="parking-confirm-title"
              >
                Konfirmasi Parkir
              </h2>
              <p className="text-sm text-slate-400">
                Lot akan ditandai terisi di dashboard.
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup modal"
            className="rounded-md p-2 text-slate-400 transition hover:bg-white/8 hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
          <div className="font-data text-2xl font-semibold text-white">
            {lot.id}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-slate-500">Lantai</div>
              <div className="font-semibold text-slate-100">{lot.floor}</div>
            </div>
            <div>
              <div className="text-slate-500">Jarak</div>
              <div className="font-semibold text-slate-100">
                {lot.jarakLobby}m
              </div>
            </div>
            <div>
              <div className="text-slate-500">Padat</div>
              <div className="font-semibold text-slate-100">
                {lot.kepadatanPrediksi}/10
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="rounded-lg border border-white/12 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
            onClick={onCancel}
            type="button"
          >
            Batal
          </button>
          <button
            className="rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
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
