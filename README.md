# Smart Parking Dashboard

Dashboard web untuk sistem parkir pintar dengan dua mode data:

- **Simulasi**: memakai data lokal/random untuk demo tanpa hardware.
- **Real**: membaca status slot langsung dari Supabase, yang sudah diisi oleh alur hardware dan worker.

Alur data mode real:

```txt
Sensor Ultrasonik
-> ESP32
-> HiveMQ MQTT Broker
-> Worker MQTT Subscribe
-> CloudAMQP Queue
-> Worker Queue Consumer
-> Supabase
-> Web Dashboard
```

Web ini tidak menerima data langsung dari ESP32. ESP32 dan worker cukup mengirim data ke Supabase, lalu web membaca tabel Supabase memakai API Supabase dari frontend.

## Fitur

- Dashboard parkir 2 lantai.
- Tampilan slot kosong, terisi, dan rekomendasi.
- Mode `Simulasi` untuk demo lokal.
- Mode `Real` untuk status live dari Supabase.
- Supabase Realtime subscription untuk update slot.
- Layout desktop dan mobile.
- Rekomendasi slot berdasarkan jarak lobby, lantai, dan kepadatan prediksi.
- Rute pencarian mobil untuk mode simulasi setelah user memilih slot.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Supabase JavaScript Client
- Lucide React Icons

## Struktur Project

```txt
.
├── public/
│   ├── gedung_itb2.jpg
│   └── gedung_itb2_blur.jpg
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx
│   │   ├── MobileParkingView.jsx
│   │   ├── ParkingMap.jsx
│   │   ├── ParkingSlot.jsx
│   │   ├── PedestrianRoute.jsx
│   │   └── Sidebar.jsx
│   ├── context/
│   │   └── ParkingContext.jsx
│   ├── data/
│   │   └── parkingData.js
│   ├── services/
│   │   └── supabaseParking.js
│   ├── utils/
│   │   └── algorithm.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Quick Start

Clone repo, lalu install dependency:

```bash
npm install
```

Buat file environment lokal:

```bash
cp .env.example .env
```

Isi `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_SUPABASE_TABLE=parking_slots
```

Jalankan development server:

```bash
npm run dev
```

Buka:

```txt
http://localhost:5173
```

Karena script dev memakai `--host 0.0.0.0`, app juga bisa dibuka dari device lain di jaringan yang sama memakai IP laptop.

## Commands

| Command | Fungsi |
| --- | --- |
| `npm install` | Install dependency project |
| `npm run dev` | Jalankan Vite dev server |
| `npm run build` | Build production ke folder `dist/` |
| `npm run preview` | Preview hasil build production |

## Environment Variables

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Ya untuk mode real | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Ya untuk mode real | Supabase anon public key |
| `VITE_SUPABASE_TABLE` | Tidak | Nama tabel status slot, default `parking_slots` |

File `.env` tidak boleh dipush ke GitHub. File yang dipush hanya `.env.example` sebagai template.

## Setup Supabase

Default nama tabel yang dipakai:

```txt
parking_slots
```

Default kolom yang direkomendasikan:

| Kolom | Tipe | Contoh | Keterangan |
| --- | --- | --- | --- |
| `slot_id` | text | `L1-A1` | ID slot parkir |
| `floor` | integer | `1` | Lantai |
| `row` | text | `A` | Baris slot |
| `column` | integer | `1` | Nomor kolom |
| `is_occupied` | boolean | `true` | Status terisi/kosong |
| `updated_at` | timestamptz | `now()` | Waktu update terakhir |

Contoh SQL tabel:

```sql
create table if not exists parking_slots (
  slot_id text primary key,
  floor integer not null,
  row text not null,
  column integer not null,
  is_occupied boolean not null default false,
  updated_at timestamptz not null default now()
);
```

Contoh seed 24 slot:

```sql
insert into parking_slots (slot_id, floor, row, column, is_occupied)
select
  'L' || floor || '-' || row_label || column_number as slot_id,
  floor,
  row_label,
  column_number,
  false
from generate_series(1, 2) as floor
cross join unnest(array['A', 'B']) as row_label
cross join generate_series(1, 6) as column_number
on conflict (slot_id) do nothing;
```

Contoh update dari worker:

```sql
update parking_slots
set
  is_occupied = true,
  updated_at = now()
where slot_id = 'L1-A1';
```

## Supabase RLS

Karena frontend membaca Supabase langsung memakai anon key, aktifkan RLS dan beri izin read-only untuk dashboard.

```sql
alter table parking_slots enable row level security;

create policy "allow public read parking slots"
on parking_slots
for select
to anon
using (true);
```

Jangan berikan policy `insert`, `update`, atau `delete` ke role `anon` jika web dashboard hanya boleh membaca data. Worker sebaiknya memakai credential server-side sendiri, bukan key yang dipakai frontend.

## Supabase Realtime

Mode real memakai `postgres_changes` Supabase Realtime. Pastikan Realtime aktif untuk tabel `parking_slots`.

Di Supabase Dashboard:

1. Buka **Database**.
2. Buka **Replication** atau **Realtime**.
3. Aktifkan tabel `parking_slots` untuk Realtime.

Jika Realtime belum aktif, mode real masih bisa membaca data saat pertama kali fetch atau saat tombol refresh ditekan, tetapi update otomatis mungkin tidak masuk.

## Format Data yang Dibaca Frontend

Adapter frontend ada di:

```txt
src/services/supabaseParking.js
```

Kolom utama yang dibaca:

```txt
slot_id
floor
row
column
is_occupied
updated_at
```

Adapter juga menerima beberapa variasi nama kolom agar mudah disesuaikan dengan output worker:

| Data | Nama kolom yang diterima |
| --- | --- |
| ID slot | `slot_id`, `slotId`, `id`, `lot_id`, `lotId`, `parking_slot` |
| Lantai | `floor`, `lantai` |
| Baris | `row`, `baris` |
| Kolom | `column`, `col`, `slot_number`, `slotNumber` |
| Status | `is_occupied`, `isOccupied`, `occupied`, `status`, `value` |
| Waktu update | `updated_at`, `updatedAt`, `created_at`, `createdAt` |

Nilai status yang dianggap terisi:

```txt
true, 1, "true", "occupied", "terisi", "full"
```

## Mode Simulasi vs Mode Real

### Mode Simulasi

- Data slot dibuat lokal dari `src/data/parkingData.js`.
- Status terisi dibuat random saat app dibuka atau mode simulasi di-reset.
- User bisa klik slot kosong untuk simulasi parkir.
- Tombol cari rute dan keluar parkir bekerja lokal.

### Mode Real

- Data dibaca dari Supabase.
- UI bersifat read-only terhadap status slot.
- Klik slot hanya memilih/menyorot slot.
- Popup parkir lokal tidak muncul karena status sebenarnya dikendalikan ESP32 dan worker.
- Tombol refresh tersedia untuk mengambil ulang data Supabase.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import repo di Vercel.
3. Set framework preset ke **Vite**.
4. Isi environment variable di Vercel:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_SUPABASE_TABLE=parking_slots
```

5. Deploy.

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

## Catatan Keamanan

- Jangan commit `.env`.
- Jangan taruh `service_role key` Supabase di frontend.
- Frontend hanya boleh memakai `anon key`.
- Atur RLS Supabase agar anon hanya bisa `select`.
- Worker yang menulis data ke Supabase harus berjalan di server dan memakai credential terpisah.

## Troubleshooting

### Mode Real menampilkan "Supabase env belum diisi"

Pastikan `.env` sudah dibuat dan nilainya benar:

```bash
cp .env.example .env
```

Setelah mengubah `.env`, restart dev server.

### Data tidak berubah realtime

Pastikan Realtime Supabase aktif untuk tabel `parking_slots`. Jika belum aktif, gunakan tombol refresh di mode real untuk mengambil data terbaru.

### Slot tetap kosong semua

Pastikan `slot_id` di Supabase cocok dengan ID layout frontend:

```txt
L1-A1 sampai L1-A6
L1-B1 sampai L1-B6
L2-A1 sampai L2-A6
L2-B1 sampai L2-B6
```

Jika worker memakai nama kolom berbeda, sesuaikan mapping di `src/services/supabaseParking.js`.

### App gagal build setelah clone

Install dependency terlebih dahulu:

```bash
npm install
npm run build
```

## Git Hygiene

Folder berikut tidak dipush ke GitHub:

```txt
node_modules/
dist/
.env
```

`node_modules/` dibuat ulang dengan `npm install`, sedangkan `dist/` dibuat ulang dengan `npm run build`.
