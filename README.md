# 📔 Photo Journal

Buku harian visual berbasis React Native (Expo) — setiap momen, foto, lokasi, dan cuaca tersimpan rapi dengan tampilan ala buku harian kertas ("Paper Journal").

Dibangun untuk Mission 13: Native Power App — Mata Kuliah Praktek Pemrograman Mobile.

---

## Fitur

### Level 1 — Core (wajib)
- Akses kamera **dan** galeri dengan permission flow yang benar (`requestPermissionsAsync` → cek `status === 'granted'` → baru akses fitur).
- Penolakan izin ditangani dengan `Alert` ramah + tombol ke Pengaturan, tanpa crash.
- Cek `result.canceled` sebelum mengambil `assets[0].uri`.
- Lokasi diambil & ditampilkan sebagai koordinat + nama tempat.
- UI menampilkan hasil foto & koordinat secara rapi.

### Level 2 — Pengembangan (6/6 diambil)
| Fitur | Implementasi |
|---|---|
| 📸 Kamera + Galeri | Alert pilihan sumber foto sebelum membuka picker |
| 📍 Kamera + Lokasi | Satu entry berisi foto **dan** koordinat + nama tempat |
| 💾 Persistensi | Semua entry disimpan/dimuat lewat `AsyncStorage` |
| 🗺️ Buka di Maps | Tombol di halaman Detail membuka koordinat via `Linking` |
| 🔁 Tombol Settings | Saat izin ditolak, `Alert` menyediakan tombol `Linking.openSettings()` |
| 🖼️ Galeri Multi-Foto | Seluruh entry (dengan foto masing-masing) ditampilkan dalam `FlatList` timeline |

### Level 3 — Bonus (5/5 diambil)
- 🌦️ **GPS + Cuaca**: koordinat dikirim ke Open-Meteo (`api.open-meteo.com`), hasil ditampilkan sebagai stempel cuaca.
- 🧭 **Priming screen**: layar penjelasan izin sebelum dialog sistem muncul (ditampilkan sekali, status disimpan di `AsyncStorage`).
- 🏘️ **Reverse geocoding**: koordinat diubah jadi nama kecamatan/kota lewat `Location.reverseGeocodeAsync`.
- ⚙️ **app.json lengkap**: usage description iOS (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`) + permission Android + config plugin `expo-image-picker` & `expo-location`.
- 🗑️ **Hapus foto**: tombol di halaman Detail mereset foto entry menjadi placeholder tanpa menghapus catatannya.

---

## Tech Stack

- **React Native** + **Expo SDK 54** (template blank)
- `expo-image-picker` — akses kamera & galeri
- `expo-location` — GPS & reverse geocoding
- `@react-native-async-storage/async-storage` — persistensi lokal
- [Open-Meteo API](https://open-meteo.com/) — data cuaca (gratis, tanpa API key)
- Navigasi disatukan dalam satu `App.js` menggunakan state (`priming | home | new | detail`) — tanpa library navigasi tambahan.

---

## Cara Menjalankan

```bash
# 1. Buat project dari template
npx create-expo-app@latest profile-card --template blank@sdk-54
cd profile-card

# 2. Install dependency native yang dipakai
npx expo install expo-image-picker expo-location @react-native-async-storage/async-storage expo-status-bar

# 4. Jalankan
npx expo start
```

Lalu scan QR code dengan aplikasi **Expo Go** di HP fisik (Android/iOS).

---

## 📸 Screenshot

| Tampilan | Preview |
|----------|---------|
| **Priming Screen** | ![alt text](priming.jpeg) |
| **Permission Denied** | ![alt text](denied.jpeg) |
| **Home Timeline** |![alt text](list.jpeg) |
| **New Entry** | ![alt text](<new entry.jpeg>) |

---

## 🔗 Expo Snack
**[Buka di Expo Snack](https://snack.expo.dev/@maengie/photojournal)**



