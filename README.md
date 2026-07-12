# 📔 Photo Journal

**Buku harian visual berbasis React Native (Expo) — abadikan tiap momen dengan foto, lokasi, dan cuaca, tersimpan rapi ala buku harian kertas.**

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-000020?logo=expo&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.1-C1652F)

Dibangun untuk **Mission 13: Native Power App**, dirilis sebagai APK untuk **Mission 14: Menyiapkan Aplikasi untuk Rilis**, dan difinalisasi untuk **Mission 15: Demo Day** — Mata Kuliah Praktek Pemrograman Mobile.

---

## 🎨 Konsep Desain — "Buku Harian Kertas"

Bukan UI kartu-kotak generic bergaya Instagram. Konsep yang dipakai:

- Latar krem hangat (`#F5EFE4`), bukan putih polos
- Foto ditampilkan seperti polaroid: rotasi kecil, border putih tebal, "washi tape" di sudut
- Timeline vertikal dengan garis putus-putus penghubung antar entry
- Aksen warna terracotta (`#C1652F`) & sage green (`#8A9A5B`)
- Cuaca ditampilkan sebagai "stempel pos" mungil di tiap entry

---

## 📸 Screenshot

| Priming Screen | Permission Denied |
|---|---|
| ![Priming](priming.jpeg) | ![Denied](denied.jpeg) |

| Home Timeline | New Entry |
|---|---|
| ![Home](list.jpeg) | ![New Entry](newentry.jpeg) |

| APK EAS Build FINISHED |
|---|
| ![alt text](ss.png) |

| APK Terinstall di HP |
|---|
| ![alt text](apk-1.jpeg) |

---

## ✨ Fitur

- 📸 **Kamera & Galeri** — ambil atau pilih foto momen harian, lengkap dengan permission flow yang aman dan penanganan penolakan izin yang ramah (tidak crash)
- 📍 **Lokasi & Reverse Geocoding** — tandai tempat kejadian secara otomatis, koordinat diubah jadi nama kecamatan/kota
- 🌦️ **Cuaca Real-Time** — ambil data cuaca dari Open-Meteo berdasarkan lokasi entry, ditampilkan sebagai stempel pos mungil
- 💾 **Persistensi Lokal** — semua catatan tersimpan otomatis lewat AsyncStorage, tetap ada walau app ditutup
- 🗺️ **Buka di Maps** — satu ketuk untuk membuka lokasi entry di Google Maps
- 🖼️ **Timeline Multi-Entry** — seluruh catatan ditampilkan dalam alur vertikal ala buku harian, bukan grid galeri biasa

### Rincian Level Tugas

<details>
<summary>Klik untuk lihat detail lengkap Level 1–3 (P13) dan Bonus (P14)</summary>

**Level 1 — Core (wajib)**
- Akses kamera **dan** galeri dengan permission flow yang benar (`requestPermissionsAsync` → cek `status === 'granted'` → baru akses fitur)
- Penolakan izin ditangani dengan `Alert` ramah + tombol ke Pengaturan, tanpa crash
- Cek `result.canceled` sebelum mengambil `assets[0].uri`
- Lokasi diambil & ditampilkan sebagai koordinat + nama tempat
- UI menampilkan hasil foto & koordinat secara rapi

**Level 2 — Pengembangan (6/6 diambil)**

| Fitur | Implementasi |
|---|---|
| 📸 Kamera + Galeri | Alert pilihan sumber foto sebelum membuka picker |
| 📍 Kamera + Lokasi | Satu entry berisi foto **dan** koordinat + nama tempat |
| 💾 Persistensi | Semua entry disimpan/dimuat lewat `AsyncStorage` |
| 🗺️ Buka di Maps | Tombol di halaman Detail membuka koordinat via `Linking` |
| 🔁 Tombol Settings | Saat izin ditolak, `Alert` menyediakan tombol `Linking.openSettings()` |
| 🖼️ Galeri Multi-Foto | Seluruh entry (dengan foto masing-masing) ditampilkan dalam `FlatList` timeline |

**Level 3 — Bonus P13 (5/5 diambil)**
- 🌦️ **GPS + Cuaca**: koordinat dikirim ke Open-Meteo (`api.open-meteo.com`), hasil ditampilkan sebagai stempel cuaca
- 🧭 **Priming screen**: layar penjelasan izin sebelum dialog sistem muncul (ditampilkan sekali, status disimpan di `AsyncStorage`)
- 🏘️ **Reverse geocoding**: koordinat diubah jadi nama kecamatan/kota lewat `Location.reverseGeocodeAsync`
- ⚙️ **app.json lengkap**: usage description + permission Android + config plugin `expo-image-picker` & `expo-location`
- 🗑️ **Hapus foto**: tombol di halaman Detail mereset foto entry menjadi placeholder tanpa menghapus catatannya

**Level 3 — Bonus P14**

| Bonus | Status | Keterangan |
|---|---|---|
| **A — App Version Display** | ✅ | Halaman "Tentang" (ikon ⓘ di Home) menampilkan versi app, version code, dan package name lewat `expo-constants` |
| **B — Expo Snack link** | ✅ | [Buka di Expo Snack](https://snack.expo.dev/@maengie/photojournal) |
| **C — Update UI** | ✅ | Menambahkan greeting dinamis ("Selamat Pagi/Siang/Sore/Malam 📔") + badge angka jumlah entry di tombol ⓘ, dirilis sebagai versi `1.0.1` (versionCode `2`) |

| Halaman About | Update UI (Greeting & Badge) |
|---|---|
| ![Halaman About](about.jpeg) | ![Update UI](update.jpeg) |

</details>

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|---|---|
| **React Native 0.81** | Framework utama untuk membangun UI native Android |
| **Expo SDK 54** | Toolchain build, dev server, dan akses modul native |
| **expo-image-picker** | Akses kamera & galeri untuk mengambil/memilih foto |
| **expo-location** | Mengambil koordinat GPS & reverse geocoding nama tempat |
| **@react-native-async-storage/async-storage** | Persistensi data catatan secara lokal di perangkat |
| **expo-constants** | Membaca info versi app (`app.json`) untuk ditampilkan di UI |
| **Open-Meteo API** | Sumber data cuaca real-time berdasarkan koordinat, gratis tanpa API key |
| **EAS Build** | Build APK release untuk instalasi standalone tanpa Expo Go |

---

## ▶️ Cara Menjalankan (Development)

```bash
# 1. Clone repository ini
git clone https://github.com/meyclaudya/PhotoJournal.git
cd PhotoJournal

# 2. Install dependency
npm install

# 3. Jalankan development server
npx expo start
```

Scan QR code yang muncul dengan aplikasi **Expo Go** di HP fisik (Android/iOS).

> ⚠️ Fitur kamera & GPS butuh HP fisik, tidak berfungsi penuh di emulator.

---

## 📦 Cara Install APK (Release)

1. Download APK dari link berikut: **[Download APK — EAS Build](https://expo.dev/accounts/maengie/projects/photo-journal/builds/ef6c2347-3c7b-4649-ad82-4f7097f61e6a)**
2. Buka file APK di HP Android
3. Jika muncul peringatan "sumber tidak dikenal", izinkan instalasi dari sumber tersebut
4. Buka app **Photo Journal** dari app drawer

---

## 🔁 Catatan Versi

Aplikasi ini dirilis sebagai satu build versi `1.0.1` (versionCode `2`) — sudah termasuk fitur sapaan dinamis berdasarkan waktu dan badge jumlah entry di header Home.

---

## 🔗 Tautan

- **🧪 Coba langsung di Expo Snack (tanpa install apapun):** https://snack.expo.dev/@maengie/photojournal
- **📥 Download APK (EAS Build):** https://expo.dev/accounts/maengie/projects/photo-journal/builds/ef6c2347-3c7b-4649-ad82-4f7097f61e6a

---

## 📋 Info Rilis

| Field | Nilai |
|---|---|
| Package name | `com.mey.photojournal` |
| Versi saat ini | `1.0.1` |
| Version code | `2` |
| Build profile | `preview` (APK) |

---

## 👤 Developer

| | |
|---|---|
| **Nama** | Mey Claudya S. |
| **NIM** | 243303621293 |
| **Institusi** | Universitas Prima Indonesia |
| **Program Studi** | Sistem Informasi |
| **Mata Kuliah** | Praktek Pemrograman Mobile |