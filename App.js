import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Linking,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ==========================================================
// KONSTANTA
// ==========================================================
const COLORS = {
  paper: '#F5EFE4',
  paperDark: '#EBE1CE',
  ink: '#3A332A',
  inkSoft: '#7A7160',
  terracotta: '#C1652F',
  terracottaDark: '#A2521F',
  sage: '#8A9A5B',
  sageDark: '#6F7D48',
  white: '#FFFFFF',
  danger: '#B3452C',
  line: '#C9BFA9',
};

const STORAGE_KEY = '@photo_journal_entries_v1';
const PRIMING_KEY = '@photo_journal_priming_seen_v1';

const WEATHER_MAP = {
  0: { label: 'Cerah', emoji: '☀️' },
  1: { label: 'Cerah Berawan', emoji: '🌤️' },
  2: { label: 'Berawan Sebagian', emoji: '⛅' },
  3: { label: 'Mendung', emoji: '☁️' },
  45: { label: 'Berkabut', emoji: '🌫️' },
  48: { label: 'Berkabut', emoji: '🌫️' },
  51: { label: 'Gerimis Ringan', emoji: '🌦️' },
  53: { label: 'Gerimis', emoji: '🌦️' },
  55: { label: 'Gerimis Lebat', emoji: '🌧️' },
  61: { label: 'Hujan Ringan', emoji: '🌧️' },
  63: { label: 'Hujan', emoji: '🌧️' },
  65: { label: 'Hujan Lebat', emoji: '🌧️' },
  71: { label: 'Salju Ringan', emoji: '🌨️' },
  73: { label: 'Salju', emoji: '🌨️' },
  75: { label: 'Salju Lebat', emoji: '❄️' },
  80: { label: 'Hujan Deras', emoji: '🌧️' },
  81: { label: 'Hujan Deras', emoji: '🌧️' },
  82: { label: 'Hujan Sangat Deras', emoji: '⛈️' },
  95: { label: 'Badai Petir', emoji: '⛈️' },
};

function getWeatherInfo(code) {
  return WEATHER_MAP[code] || { label: 'Tidak Diketahui', emoji: '🌡️' };
}

function getRotationDeg(id) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return (sum % 7) - 3;
}

function formatTanggal(iso) {
  const d = new Date(iso);
  const hari = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${hari} · ${jam}`;
}

// v1.0.1: sapaan dinamis berdasarkan jam perangkat (perubahan UI untuk Bonus C)
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 10) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

async function loadEntriesFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Gagal memuat data:', e);
    return [];
  }
}

async function saveEntriesToStorage(entries) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Gagal menyimpan data:', e);
  }
}

async function requestPermission(requestFn, namaFitur) {
  const { status } = await requestFn();
  if (status !== 'granted') {
    Alert.alert(
      `Izin ${namaFitur} Ditolak`,
      `Photo Journal butuh izin ${namaFitur} untuk fitur ini. Kamu bisa mengaktifkannya lewat Pengaturan HP.`,
      [
        { text: 'Nanti Saja', style: 'cancel' },
        { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
}

function WeatherStamp({ weather }) {
  if (!weather) return null;
  const info = getWeatherInfo(weather.weathercode);
  return (
    <View style={styles.stamp}>
      <Text style={styles.stampEmoji}>{info.emoji}</Text>
      <Text style={styles.stampText}>{Math.round(weather.temperature)}°C</Text>
    </View>
  );
}

function PolaroidPhoto({ uri, size = 250, rotationId = '' }) {
  const rotation = useMemo(() => getRotationDeg(rotationId || `${size}`), [rotationId, size]);
  return (
    <View style={[styles.polaroidFrame, { transform: [{ rotate: `${rotation}deg` }] }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, backgroundColor: COLORS.paperDark }} />
      ) : (
        <View style={[styles.polaroidPlaceholder, { width: size, height: size }]}>
          <Text style={{ fontSize: 40 }}>📷</Text>
          <Text style={styles.placeholderText}>Foto dihapus</Text>
        </View>
      )}
      <View style={styles.washiTape} />
    </View>
  );
}

function PrimingScreen({ onContinue }) {
  return (
    <SafeAreaView style={styles.primingContainer}>
      <ScrollView contentContainerStyle={styles.primingScroll}>
        <Text style={styles.primingEmoji}>📔</Text>
        <Text style={styles.primingTitle}>Selamat Datang di{'\n'}Photo Journal</Text>
        <Text style={styles.primingSubtitle}>
          Buku harian visual kamu — setiap momen, foto, dan lokasi tersimpan rapi seperti buku harian kertas.
        </Text>

        <View style={styles.primingCard}>
          <Text style={styles.primingCardIcon}>📸</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.primingCardTitle}>Kamera & Galeri</Text>
            <Text style={styles.primingCardDesc}>Untuk mengambil atau memilih foto momen harianmu.</Text>
          </View>
        </View>

        <View style={styles.primingCard}>
          <Text style={styles.primingCardIcon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.primingCardTitle}>Lokasi</Text>
            <Text style={styles.primingCardDesc}>Untuk menandai tempat kejadian & menampilkan cuaca saat itu.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Mengerti, Lanjutkan →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({ entries, onAddNew, onSelectEntry, onOpenAbout }) {
  const sorted = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderItem = ({ item, index }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onSelectEntry(item)} style={styles.timelineRow}>
      <View style={styles.timelineTrack}>
        <View style={styles.timelineDot} />
        {index !== sorted.length - 1 && <View style={styles.timelineDashedLine} />}
      </View>
      <View style={styles.entryCard}>
        <View style={{ alignItems: 'center' }}>
          <PolaroidPhoto uri={item.photoUri} size={150} rotationId={item.id} />
        </View>
        <View style={styles.entryCardBody}>
          <View style={styles.entryCardHeaderRow}>
            <Text style={styles.entryDate}>{formatTanggal(item.createdAt)}</Text>
            <WeatherStamp weather={item.weather} />
          </View>
          {item.placeName ? <Text style={styles.entryPlace}>📍 {item.placeName}</Text> : null}
          {item.note ? (
            <Text style={styles.entryNote} numberOfLines={2}>{item.note}</Text>
          ) : (
            <Text style={styles.entryNoteEmpty}>(Tanpa catatan)</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.homeHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.homeTitle}>{getGreeting()} 📔</Text>
            <Text style={styles.homeSubtitle}>Waktunya menulis catatan hari ini</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={onOpenAbout} style={styles.aboutButton}>
              <Text style={styles.aboutButtonText}>ⓘ</Text>
              {sorted.length > 0 && (
                <View style={styles.entryBadge}>
                  <Text style={styles.entryBadgeText}>{sorted.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 56 }}>🖋️</Text>
          <Text style={styles.emptyTitle}>Halaman masih kosong</Text>
          <Text style={styles.emptyDesc}>Ketuk tombol + untuk menulis catatan pertamamu.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddNew}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function NewEntryScreen({ onSave, onCancel }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const pickFromCamera = async () => {
    const ok = await requestPermission(ImagePicker.requestCameraPermissionsAsync, 'Kamera');
    if (!ok) return;
    setSavingPhoto(true);
    const hasil = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    setSavingPhoto(false);
    if (!hasil.canceled) setPhotoUri(hasil.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const ok = await requestPermission(ImagePicker.requestMediaLibraryPermissionsAsync, 'Galeri');
    if (!ok) return;
    setSavingPhoto(true);
    const hasil = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    setSavingPhoto(false);
    if (!hasil.canceled) setPhotoUri(hasil.assets[0].uri);
  };

  const choosePhotoSource = () => {
    Alert.alert('Tambah Foto', 'Ambil foto dari mana?', [
      { text: '📷 Kamera', onPress: pickFromCamera },
      { text: '🖼️ Galeri', onPress: pickFromGallery },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      return data.current_weather || null;
    } catch (e) {
      console.warn('Gagal ambil cuaca:', e);
      return null;
    }
  };

  const handleGetLocation = async () => {
    const ok = await requestPermission(Location.requestForegroundPermissionsAsync, 'Lokasi');
    if (!ok) return;
    setLoadingLocation(true);
    try {
      const pos = await Location.getCurrentPositionAsync({});
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setLocation(coords);

      try {
        const places = await Location.reverseGeocodeAsync(coords);
        if (places && places.length > 0) {
          const p = places[0];
          const nama = [p.district || p.subregion, p.city || p.region].filter(Boolean).join(', ');
          setPlaceName(nama || 'Lokasi tidak dikenal');
        }
      } catch (e) {
        console.warn('Reverse geocode gagal:', e);
      }

      const w = await fetchWeather(coords.latitude, coords.longitude);
      setWeather(w);
    } catch (e) {
      Alert.alert('Gagal Ambil Lokasi', 'Pastikan GPS HP kamu aktif, lalu coba lagi.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const removeLocation = () => {
    setLocation(null);
    setPlaceName(null);
    setWeather(null);
  };

  const handleSave = () => {
    if (!photoUri) {
      Alert.alert('Foto Kosong', 'Tambahkan minimal satu foto untuk menyimpan catatan ini.');
      return;
    }
    const entry = {
      id: `${Date.now()}`,
      photoUri,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      location,
      placeName,
      weather,
    };
    onSave(entry);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={styles.newEntryHeaderRow}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.linkText}>‹ Batal</Text>
          </TouchableOpacity>
          <Text style={styles.newEntryTitle}>Catatan Baru</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          {savingPhoto ? (
            <View style={[styles.photoPickerBox]}>
              <ActivityIndicator color={COLORS.terracotta} />
            </View>
          ) : photoUri ? (
            <View style={{ alignItems: 'center' }}>
              <PolaroidPhoto uri={photoUri} size={230} rotationId="draft" />
              <TouchableOpacity onPress={choosePhotoSource} style={styles.secondaryButtonSmall}>
                <Text style={styles.secondaryButtonSmallText}>Ganti Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoPickerBox} onPress={choosePhotoSource}>
              <Text style={{ fontSize: 34 }}>🖼️</Text>
              <Text style={styles.photoPickerText}>Ketuk untuk Tambah Foto</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.fieldLabel}>Catatan</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Ceritakan momen ini..."
          placeholderTextColor={COLORS.inkSoft}
          multiline
          value={note}
          onChangeText={setNote}
        />

        <Text style={styles.fieldLabel}>Lokasi & Cuaca (opsional)</Text>
        {location ? (
          <View style={styles.locationCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryPlace}>📍 {placeName || 'Mengambil nama tempat...'}</Text>
              <Text style={styles.locationCoords}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
            <WeatherStamp weather={weather} />
            <TouchableOpacity onPress={removeLocation} style={{ marginLeft: 10 }}>
              <Text style={{ color: COLORS.danger, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleGetLocation} disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator color={COLORS.sageDark} />
            ) : (
              <Text style={styles.secondaryButtonText}>📍 Tambahkan Lokasi & Cuaca</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>Simpan Catatan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailScreen({ entry, onBack, onDeleteEntry, onDeletePhoto }) {
  const openInMaps = () => {
    if (!entry.location) return;
    const url = `https://www.google.com/maps?q=${entry.location.latitude},${entry.location.longitude}`;
    Linking.openURL(url);
  };

  const confirmDeletePhoto = () => {
    Alert.alert('Hapus Foto?', 'Foto akan diganti placeholder, catatan tetap tersimpan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDeletePhoto(entry.id) },
    ]);
  };

  const confirmDeleteEntry = () => {
    Alert.alert('Hapus Catatan?', 'Tindakan ini tidak bisa dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDeleteEntry(entry.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={styles.newEntryHeaderRow}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.linkText}>‹ Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.newEntryTitle}>Detail</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <PolaroidPhoto uri={entry.photoUri} size={260} rotationId={entry.id} />
        </View>

        <Text style={styles.entryDate}>{formatTanggal(entry.createdAt)}</Text>

        {entry.weather && (
          <View style={{ marginTop: 8 }}>
            <WeatherStamp weather={entry.weather} />
          </View>
        )}

        {entry.note ? <Text style={styles.detailNote}>{entry.note}</Text> : null}

        {entry.location && (
          <View style={styles.locationCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryPlace}>📍 {entry.placeName || 'Lokasi tersimpan'}</Text>
              <Text style={styles.locationCoords}>
                {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}
              </Text>
            </View>
            <TouchableOpacity onPress={openInMaps}>
              <Text style={styles.linkText}>Buka Maps ↗</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={confirmDeletePhoto}>
          <Text style={styles.secondaryButtonText}>🗑️ Hapus Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={confirmDeleteEntry}>
          <Text style={styles.dangerButtonText}>Hapus Catatan Ini</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AboutScreen({ onBack }) {
  const appVersion =
    Constants.expoConfig?.version || Constants.manifest?.version || 'tidak diketahui';
  const androidVersionCode =
    Constants.expoConfig?.android?.versionCode ||
    Constants.manifest?.android?.versionCode ||
    'tidak diketahui';
  const packageName =
    Constants.expoConfig?.android?.package || Constants.manifest?.android?.package || '-';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={styles.newEntryHeaderRow}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.linkText}>‹ Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.newEntryTitle}>Tentang</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <Text style={{ fontSize: 56 }}>📔</Text>
          <Text style={styles.primingTitle}>Photo Journal</Text>
          <Text style={styles.primingSubtitle}>
            Buku harian visual — setiap momen, foto, dan lokasi tersimpan rapi seperti
            buku harian kertas.
          </Text>
        </View>

        <View style={styles.aboutInfoCard}>
          <View style={styles.aboutInfoRow}>
            <Text style={styles.aboutInfoLabel}>Versi Aplikasi</Text>
            <Text style={styles.aboutInfoValue}>{appVersion}</Text>
          </View>
          <View style={styles.aboutInfoDivider} />
          <View style={styles.aboutInfoRow}>
            <Text style={styles.aboutInfoLabel}>Kode Versi (Android)</Text>
            <Text style={styles.aboutInfoValue}>{androidVersionCode}</Text>
          </View>
          <View style={styles.aboutInfoDivider} />
          <View style={styles.aboutInfoRow}>
            <Text style={styles.aboutInfoLabel}>Package</Text>
            <Text style={styles.aboutInfoValue}>{packageName}</Text>
          </View>
        </View>

        <Text style={styles.primingNote}>
          Dibangun dengan Expo & React Native, sebagai bagian dari mata kuliah Pemrograman
          Mobile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    (async () => {
      const seenPriming = await AsyncStorage.getItem(PRIMING_KEY);
      const stored = await loadEntriesFromStorage();
      setEntries(stored);
      setScreen(seenPriming ? 'home' : 'priming');
    })();
  }, []);

  const handleFinishPriming = async () => {
    await AsyncStorage.setItem(PRIMING_KEY, 'true');
    setScreen('home');
  };

  const handleSaveEntry = async (entry) => {
    const updated = [...entries, entry];
    setEntries(updated);
    await saveEntriesToStorage(updated);
    setScreen('home');
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setScreen('detail');
  };

  const handleDeleteEntry = async (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await saveEntriesToStorage(updated);
    setScreen('home');
  };

  const handleDeletePhoto = async (id) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, photoUri: null } : e));
    setEntries(updated);
    await saveEntriesToStorage(updated);
    setSelectedEntry(updated.find((e) => e.id === id));
  };

  if (screen === 'loading') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={COLORS.terracotta} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'priming' && <PrimingScreen onContinue={handleFinishPriming} />}
      {screen === 'home' && (
        <HomeScreen
          entries={entries}
          onAddNew={() => setScreen('new')}
          onSelectEntry={handleSelectEntry}
          onOpenAbout={() => setScreen('about')}
        />
      )}
      {screen === 'new' && <NewEntryScreen onSave={handleSaveEntry} onCancel={() => setScreen('home')} />}
      {screen === 'detail' && selectedEntry && (
        <DetailScreen
          entry={selectedEntry}
          onBack={() => setScreen('home')}
          onDeleteEntry={handleDeleteEntry}
          onDeletePhoto={handleDeletePhoto}
        />
      )}
      {screen === 'about' && <AboutScreen onBack={() => setScreen('home')} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
    paddingTop: RNStatusBar.currentHeight || 0,
  },
  primingContainer: { flex: 1, backgroundColor: COLORS.paper },
  primingScroll: { padding: 28, paddingTop: 60, alignItems: 'center' },
  primingEmoji: { fontSize: 56, marginBottom: 12 },
  primingTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  primingSubtitle: {
    fontSize: 15,
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  primingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.paperDark,
  },
  primingCardIcon: { fontSize: 28, marginRight: 14 },
  primingCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.ink, marginBottom: 2 },
  primingCardDesc: { fontSize: 13, color: COLORS.inkSoft, lineHeight: 18 },
  primingNote: {
    fontSize: 12,
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginVertical: 18,
    fontStyle: 'italic',
  },
  homeHeader: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  homeTitle: { fontSize: 28, fontWeight: '700', color: COLORS.ink },
  homeSubtitle: { fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  aboutButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutButtonText: { fontSize: 16, color: COLORS.terracotta, fontWeight: '700' },
  entryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.sage,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.paper,
  },
  entryBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginTop: 10 },
  emptyDesc: { fontSize: 13, color: COLORS.inkSoft, textAlign: 'center', marginTop: 6 },
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineTrack: { width: 24, alignItems: 'center' },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.terracotta,
    marginTop: 8,
  },
  timelineDashedLine: {
    flex: 1,
    width: 1,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.line,
    borderStyle: 'dashed',
    marginTop: 4,
    marginBottom: -4,
  },
  entryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: COLORS.paperDark,
  },
  entryCardBody: { marginTop: 10 },
  entryCardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontSize: 12, color: COLORS.inkSoft, fontWeight: '600' },
  entryPlace: { fontSize: 13, color: COLORS.sageDark, fontWeight: '600', marginTop: 4 },
  entryNote: { fontSize: 14, color: COLORS.ink, marginTop: 6, lineHeight: 19 },
  entryNoteEmpty: { fontSize: 13, color: COLORS.inkSoft, fontStyle: 'italic', marginTop: 6 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  fabText: { color: COLORS.white, fontSize: 30, marginTop: -2 },
  polaroidFrame: {
    backgroundColor: COLORS.white,
    padding: 10,
    paddingBottom: 22,
    borderRadius: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  polaroidPlaceholder: {
    backgroundColor: COLORS.paperDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 11, color: COLORS.inkSoft, marginTop: 4 },
  washiTape: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 14,
    backgroundColor: COLORS.sage,
    opacity: 0.6,
    transform: [{ rotate: '-2deg' }],
  },
  stamp: {
    borderWidth: 1.5,
    borderColor: COLORS.terracotta,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  stampEmoji: { fontSize: 12, marginRight: 3 },
  stampText: { fontSize: 11, color: COLORS.terracottaDark, fontWeight: '700' },
  newEntryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  newEntryTitle: { fontSize: 17, fontWeight: '700', color: COLORS.ink },
  linkText: { color: COLORS.terracotta, fontWeight: '600', fontSize: 14 },
  photoPickerBox: {
    width: 230,
    height: 230,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  photoPickerText: { fontSize: 13, color: COLORS.inkSoft, marginTop: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.ink, marginTop: 20, marginBottom: 8 },
  noteInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.paperDark,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    color: COLORS.ink,
    textAlignVertical: 'top',
  },
  detailNote: { fontSize: 15, color: COLORS.ink, lineHeight: 22, marginTop: 14 },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.paperDark,
    padding: 14,
    marginTop: 8,
  },
  locationCoords: { fontSize: 11, color: COLORS.inkSoft, marginTop: 2 },
  aboutInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.paperDark,
    padding: 4,
  },
  aboutInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  aboutInfoLabel: { fontSize: 13, color: COLORS.inkSoft },
  aboutInfoValue: { fontSize: 13, color: COLORS.ink, fontWeight: '700' },
  aboutInfoDivider: { height: 1, backgroundColor: COLORS.paperDark, marginHorizontal: 14 },
  primaryButton: {
    backgroundColor: COLORS.terracotta,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 26,
    width: '100%',
  },
  primaryButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    backgroundColor: '#EEF1E4',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.sage,
  },
  secondaryButtonText: { color: COLORS.sageDark, fontWeight: '700', fontSize: 14 },
  secondaryButtonSmall: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 14 },
  secondaryButtonSmallText: { color: COLORS.terracotta, fontWeight: '600', fontSize: 13 },
  dangerButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerButtonText: { color: COLORS.danger, fontWeight: '600', fontSize: 13 },
});