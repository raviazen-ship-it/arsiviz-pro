# ArsiViz Pro v2.0

**3D Architectural Configurator & Construction Lifecycle Visualizer**

ArsiViz Pro adalah aplikasi web studio interaktif berbasis **Next.js 16 (App Router)**, **React 19**, **Three.js (`@react-three/fiber` + `@react-three/drei`)**, **Tailwind CSS**, **Zustand**, dan **Zod** untuk merancang rumah tinggal secara visual, mempelajari 6 tahapan konstruksi dari nol hingga serah terima, menghitung simulasi **RAB / Bill of Quantities (BoQ)**, serta mensimulasikan skema **cicilan KPR**.

## Fitur Utama

1. **Workspace 3D Studio Interaktif**:
   - Orbit 360°, Zoom, Pan, 4 Camera Presets (`Perspektif 3D`, `Fasad Depan`, `Denah Atas`, `Interior Mode`), `Reset Kamera`, `Cutaway (Buka Atap)` setinggi pinggang (`0.95 m`), `Grid Kavling`, `Dimensi (m)`, `Sun Study (06:00 - 21:00)` dengan penyalaan lampu malam otomatis, dan klik elemen 3D langsung (raycast).
   - Fallback skematik proporsional 2D otomatis bila akselerasi WebGL tidak tersedia di perangkat pengguna.
2. **4 Geometri Tipe Rumah Prosedural Berbeda**:
   - `Modern Minimalist Box` (parapet datar, kanopi kantilever, sirip dinding, jendela sudut).
   - `Tropical Contemporary Villa` (atap limasan lebar ber-overhang teduh, kisi *secondary skin* kayu ulin, beranda).
   - `Industrial Loft House` (rangka ekspos profil baja H-beam gelap, atap miring *mono-pitch*, bukaan kaca *mullion* tinggi).
   - `Japandi Compact Home` (atap pelana tenang, taman dalam *inner courtyard / tsubo-niwa*, kisi *koshi* kayu).
3. **Timeline 6 Tahap Konstruksi (`Tahap 0` - `Tahap 5`)**:
   - Pemutaran otomatis maupun manual dari persiapan lahan & *bouwplank*, pondasi & *sloof*, struktur utama, dinding & MEP kasar, penutupan atap & fasad, hingga *finishing* interior & lanskap, disertai panduan teknis PBG/SLF dan tips pengawasan kontraktor.
4. **Kalkulator RAB / BoQ & Simulasi KPR Terintegrasi**:
   - Rincian 12 kategori pekerjaan tanpa hitung ganda, editor asumsi harga satuan & *contingency*, serta tampilan cetak laporan RAB (`Print / Save as PDF`).
   - Simulator anuitas bulanan KPR lengkap dengan kasus bunga `0%`, opsi DP persen/nominal, dan estimasi dana tunai awal.
5. **Manajemen Proyek, Perbandingan Desain & Booking Konsultasi**:
   - Simpan, muat, duplikasi, ubah nama, hapus, ekspor/impor JSON tervalidasi Zod (mendukung migrasi skema `v1 -> v2`), perbandingan berdampingan 2 desain, serta formulir jadwal konsultasi arsitek (transparan berjalan pada *Local Demo Mode* bila variabel cloud belum dikonfigurasi).

## Menjalankan Proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di browser.

## Skrip Kualitas & Pengujian

```bash
npm run typecheck   # Pemeriksaan tipe TypeScript strict
npm run lint        # Pemeriksaan ESLint
npm run test        # Unit test Vitest (RAB, KPR, validasi skema, migrasi, store)
npm run build       # Production build Next.js
```

## Konfigurasi Lingkungan (Opsional)

Salin `.env.example` menjadi `.env.local` bila ingin menghubungkan abstraksi penyimpanan ke layanan eksternal di masa mendatang. Tanpa `.env.local`, aplikasi berjalan penuh dan jujur dalam **Demo Mode (Lokal)** menggunakan `localStorage` tervalidasi.
