<template>
  <div class="booking-page">

    <div class="main-content">
      <div class="venue-header">
        <h2>Denah Lokasi</h2>
        <div class="venue-meta" v-if="venueOpenTime">
          <span class="badge-time">
            <font-awesome-icon icon="fa-regular fa-clock" />
            Buka: {{ venueOpenTime.slice(0, 5) }} - {{ venueCloseTime.slice(0, 5) }}
          </span>
        </div>
      </div>

      <div class="global-filter">
        <div class="filter-header">
          <strong>🔍 Cek Ketersediaan</strong>
          <small>(Ubah ini untuk melihat kursi kosong di jam berbeda)</small>
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label>Tanggal</label>
            <input type="date" v-model="globalDate" :min="todayDate" />
          </div>
          <div class="filter-group">
            <label>Jam Cek</label>
            <select v-model="globalStartTime" :disabled="!globalDate">
              <option value="">-- Pilih Jam --</option>
              <option v-for="time in generatedTimeSlots" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Durasi</label>
            <select v-model.number="globalDuration">
              <option v-for="h in 8" :key="h" :value="h">{{ h }} Jam</option>
            </select>
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="box available"></div> Kosong
        </div>
        <div class="legend-item">
          <div class="box unavailable"></div> Terisi
        </div>
        <div class="legend-item">
          <div class="box selected"></div> Pilihanmu
        </div>
      </div>

      <div class="seating-area">
        <div v-if="isLoadingSeats" class="loading-state">
          <div class="spinner"></div> Memuat denah...
        </div>

        <div v-else class="layout-wrapper">
          <div class="seat-row top">
            <div v-for="seat in layout.top" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
              @click="handleSeatClick(seat)">
              {{ seat.id }}
            </div>
          </div>
          <div class="middle-section">
            <div class="seat-col left">
              <div v-for="seat in layout.left" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
                @click="handleSeatClick(seat)">
                {{ seat.id }}
              </div>
            </div>
            <div class="pond">
              <div class="water"><span>KOLAM</span></div>
            </div>
            <div class="seat-col right">
              <div v-for="seat in layout.right" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
                @click="handleSeatClick(seat)">
                {{ seat.id }}
              </div>
            </div>
          </div>
          <div class="seat-row bottom">
            <div v-for="seat in layout.bottom" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
              @click="handleSeatClick(seat)">
              {{ seat.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar">
      <h3>Daftar Pesanan</h3>

      <div v-if="myBookings.length === 0" class="empty-state">
        <p>Pilih Tanggal & Jam di kiri, lalu klik kursi untuk menambahkan.</p>
      </div>

      <div class="booking-list">
        <div v-for="(booking, index) in myBookings" :key="booking.tempId" class="booking-card">
          <div class="card-header">
            <span class="seat-badge">Kursi #{{ booking.no_kursi }}</span>
            <button @click="removeBooking(index)" class="btn-del">Hapus</button>
          </div>

          <div class="card-body">
            <div class="form-group-sm">
              <label>Tanggal</label>
              <input type="date" v-model="booking.tanggal" :min="todayDate"
                @change="fetchSpecificSeatSchedule(booking)" />
            </div>

            <div class="form-group-sm">
              <label>Jam Mulai</label>
              <select v-model="booking.start" :disabled="booking.isLoadingSchedule">
                <option value="" disabled>{{ booking.isLoadingSchedule ? 'Cek..' : 'Pilih' }}</option>
                <option v-for="time in booking.availableStartTimes" :key="time" :value="time">{{ time }}</option>
              </select>
            </div>

            <div class="form-group-sm">
              <label>Durasi</label>
              <select v-model.number="booking.durasi">
                <option v-for="h in 8" :key="h" :value="h">{{ h }} Jam</option>
              </select>
            </div>

            <div class="price-calc">
              Subtotal: <strong>{{ formatCurrency(PRICE_PER_HOUR * booking.durasi) }}</strong>
            </div>

            <div v-if="booking.errorMsg" class="error-text">{{ booking.errorMsg }}</div>
          </div>
        </div>
      </div>

      <div class="summary">
        <div class="total-row">
          <span>Total ({{ myBookings.length }} Kursi)</span>
          <span class="total-val">{{ formatCurrency(totalPrice) }}</span>
        </div>
        <button class="btn-checkout" @click="submitBookings" :disabled="myBookings.length === 0 || isSubmitting">
          {{ isSubmitting ? 'Memproses...' : 'Lanjut Pembayaran' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const VENUE_ID = route.params.id || 1;
const PRICE_PER_HOUR = 25000;
const MAX_BOOKINGS_PER_USER = 5;
const todayDate = new Date().toISOString().split('T')[0];

// State Data Tempat
const venueCapacity = ref(0);
const venueOpenTime = ref("08:00:00");
const venueCloseTime = ref("22:00:00");

// State Kursi (Visual)
const seats = ref([]);
const bookedSeatIdsGlobal = ref([]); // ID kursi yang merah di peta (berdasarkan filter global)
const isLoadingSeats = ref(false);

// State Filter Global (Hanya untuk visualisasi Peta)
const globalDate = ref(todayDate);
const globalStartTime = ref("");
const globalDuration = ref(1);

// State Keranjang Belanja
const myBookings = ref([]);
const isSubmitting = ref(false);

// --- 1. INIT ---
async function fetchVenueInfo() {
  try {
    const res = await fetch(`http://localhost:3000/tempat_mancing/${VENUE_ID}`);
    const data = await res.json();
    if (res.ok) {
      venueCapacity.value = data.jumlah_lapak || 20;
      venueOpenTime.value = data.jam_buka;
      venueCloseTime.value = data.jam_tutup;
      generateSeats(venueCapacity.value);
    }
  } catch (err) { console.error(err); }
}

function generateSeats(total) {
  const arr = [];
  for (let i = 1; i <= total; i++) {
    arr.push({ id: i, status: 'available' });
  }
  seats.value = arr;

  // Kalau filter global sudah diisi, cek ketersediaan
  if (globalStartTime.value) fetchAvailabilityGlobal();
}

// --- 2. CEK KETERSEDIAAN GLOBAL (Untuk Mewarnai Peta) ---
async function fetchAvailabilityGlobal() {
  if (!globalDate.value || !globalStartTime.value) return;

  isLoadingSeats.value = true;
  try {
    const params = new URLSearchParams({
      tempat_id: VENUE_ID,
      tanggal: globalDate.value,
      start: globalStartTime.value,
      durasi: globalDuration.value
    });

    const res = await fetch(`http://localhost:3000/bookings/check-seats?${params}`);
    const data = await res.json();
    bookedSeatIdsGlobal.value = data.bookedSeats || [];

  } catch (err) { console.error(err); }
  finally { isLoadingSeats.value = false; }
}

// --- 3. KLIK KURSI (TAMBAH KE KERANJANG) ---
function handleSeatClick(seat) {
  // A. Cek apakah kursi ini UNAVAILABLE di jam Global Filter?
  // Note: Kita izinkan klik 'unavailable' KALAU user mau ganti jamnya nanti di keranjang.
  // TAPI biar ga bingung, kita blokir aja kalau status visualnya merah.
  const isUnavailable = bookedSeatIdsGlobal.value.includes(seat.id);
  if (isUnavailable) return alert("Kursi ini terisi di jam yang dipilih. Coba ganti jam di filter atas.");

  // B. Cek apakah sudah ada di keranjang saya?
  const idx = myBookings.value.findIndex(b => b.no_kursi === seat.id);
  if (idx !== -1) {
    // Hapus (Unselect)
    myBookings.value.splice(idx, 1);
  } else {
    // Tambah Baru
    if (myBookings.value.length >= MAX_BOOKINGS_PER_USER) return alert("Maksimal 5 kursi.");

    if (!globalStartTime.value) return alert("Pilih Jam Mulai dulu di filter atas.");

    const newBooking = {
      tempId: Date.now() + Math.random(),
      no_kursi: seat.id,
      // Copy nilai dari Global Filter saat ini
      tanggal: globalDate.value,
      start: globalStartTime.value,
      durasi: globalDuration.value,
      // Properti untuk dropdown individual
      availableStartTimes: generatedTimeSlots.value, // Default awal (semua slot)
      isLoadingSchedule: false,
      errorMsg: ""
    };

    // Cek jadwal spesifik buat kursi ini (biar dropdown individual-nya akurat)
    fetchSpecificSeatSchedule(newBooking);

    myBookings.value.push(newBooking);
  }
}

// Helper Visual Status
function getSeatVisualStatus(seat) {
  // 1. Apakah ada di keranjang saya? -> Biru
  if (myBookings.value.some(b => b.no_kursi === seat.id)) return 'selected';

  // 2. Apakah rusak? (Manual) -> Abu
  const rusakIds = [7, 13];
  if (rusakIds.includes(seat.id)) return 'unavailable';

  // 3. Apakah terisi orang lain (berdasarkan Filter Global)? -> Abu
  if (bookedSeatIdsGlobal.value.includes(seat.id)) return 'unavailable';

  // 4. Kosong -> Putih/Hijau
  return 'available';
}

// --- 4. CEK JADWAL INDIVIDUAL (PER KARTU) ---
// Ini fitur kuncinya! Saat kartu dibuat atau tanggal diganti di kartu,
// kita cek ke backend: "Kursi X tanggal Y, jam berapa aja yang kosong?"
async function fetchSpecificSeatSchedule(booking) {
  if (!booking.tanggal) return;

  booking.isLoadingSchedule = true;

  // Kalau user ganti tanggal di kartu, reset jam start-nya biar ga invalid
  // (Kecuali ini panggilan pertama saat add to cart)
  // booking.start = ""; 

  try {
    const params = new URLSearchParams({
      tempat_id: VENUE_ID,
      no_kursi: booking.no_kursi,
      tanggal: booking.tanggal
    });

    // Minta data slot SIBUK dari backend
    // Backend endpoint /schedule mengembalikan array [{start_time, end_time}]
    const res = await fetch(`http://localhost:3000/bookings/schedule?${params}`);
    const bookedSlots = await res.json();

    // Filter ulang Time Slots berdasarkan data sibuk tersebut
    const validSlots = [];
    let current = new Date(`2000-01-01T${venueOpenTime.value}`);
    let end = new Date(`2000-01-01T${venueCloseTime.value}`);
    end.setHours(end.getHours() - 1); // Buffer durasi min 1 jam

    while (current <= end) {
      let timeStr = current.toTimeString().slice(0, 5);

      // Cek bentrok
      const isClash = bookedSlots.some(b => {
        const bStart = b.start_time.slice(0, 5);
        const bEnd = b.end_time.slice(0, 5);
        return timeStr >= bStart && timeStr < bEnd;
      });

      if (!isClash) validSlots.push(timeStr);
      current.setMinutes(current.getMinutes() + 60);
    }

    booking.availableStartTimes = validSlots;

    // Validasi: Jika jam yang dipilih sekarang jadi ga valid (karena ganti tanggal), reset
    if (booking.start && !validSlots.includes(booking.start)) {
      booking.start = "";
      booking.errorMsg = "Jam sebelumnya tidak tersedia di tanggal ini.";
    } else {
      booking.errorMsg = "";
    }

  } catch (err) { console.error(err); }
  finally { booking.isLoadingSchedule = false; }
}

// --- 5. SUBMIT ---
async function submitBookings() {
  // Validasi
  const invalid = myBookings.value.find(b => !b.start);
  if (invalid) return alert(`Lengkapi jam untuk Kursi #${invalid.no_kursi}`);

  const token = localStorage.getItem('kailku_token');
  if (!token) return router.push('/login');

  isSubmitting.value = true;
  try {
    for (const b of myBookings.value) {
      const payload = {
        tempat_id: VENUE_ID,
        no_kursi: b.no_kursi,
        tanggal_booking: b.tanggal,
        start_time: b.start,
        duration: b.durasi
      };
      const res = await fetch('http://localhost:3000/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal booking kursi " + b.no_kursi);
    }
    alert("Booking Berhasil!");
    router.push('/cart');
  } catch (err) { alert(err.message); }
  finally { isSubmitting.value = false; }
}

// --- HELPERS ---
const generatedTimeSlots = computed(() => {
  if (!venueOpenTime.value) return [];
  const slots = [];
  let current = new Date(`2000-01-01T${venueOpenTime.value}`);
  let end = new Date(`2000-01-01T${venueCloseTime.value}`);
  end.setHours(end.getHours() - 1);
  while (current <= end) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setMinutes(current.getMinutes() + 60);
  }
  return slots;
});

// Layout Kolam
const layout = computed(() => {
  const total = seats.value.length;
  if (total === 0) return { top: [], right: [], bottom: [], left: [] };
  const topCount = Math.ceil(total * 0.35);
  const rightCount = Math.ceil(total * 0.15);
  const bottomCount = Math.ceil(total * 0.35);
  const top = seats.value.slice(0, topCount);
  const right = seats.value.slice(topCount, topCount + rightCount);
  const bottom = seats.value.slice(topCount + rightCount, topCount + rightCount + bottomCount);
  const left = seats.value.slice(topCount + rightCount + bottomCount);
  return { top, right, bottom, left };
});

const totalPrice = computed(() => myBookings.value.reduce((sum, b) => sum + (PRICE_PER_HOUR * b.durasi), 0));
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
const calculateEndTime = (start, dur) => {
  if (!start) return "--:--";
  const [h, m] = start.split(':').map(Number);
  return `${String(h + dur).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const removeBooking = (i) => myBookings.value.splice(i, 1);

// Watcher Global Filter (Hanya update visual peta, JANGAN RESET CART)
watch([globalDate, globalStartTime, globalDuration], () => {
  fetchAvailabilityGlobal();
});

onMounted(() => fetchVenueInfo());
</script>

<style scoped>
/* --- LAYOUT --- */
.booking-page {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px;
  gap: 30px;
  min-height: 100vh;
}

@media (min-width: 992px) {
  .booking-page {
    flex-direction: row;
    align-items: flex-start;
  }

  .main-content {
    flex: 3;
  }

  .sidebar {
    flex: 1.3;
    position: sticky;
    top: 100px;
  }
}

/* --- BAGIAN KIRI --- */
.venue-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.badge-time {
  background: #e0f2fe;
  color: #023e8a;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.global-filter {
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.filter-header {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.filter-group label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.seating-area {
  background: white;
  padding: 30px;
  border-radius: 16px;
  overflow-x: auto;
}

.layout-wrapper {
  min-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.seat-row,
.seat-col {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.seat-col {
  flex-direction: column;
}

.middle-section {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
}

.pond {
  flex-grow: 1;
  background: #e0f7fa;
  border: 3px solid #4dd0e1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.water {
  color: #00838f;
  font-weight: bold;
}

.seat {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.2s;
}

.seat:hover {
  transform: scale(1.1);
}

.seat.available {
  background: white;
  border: 2px solid #2ecc71;
  color: #2ecc71;
}

.seat.unavailable {
  background: #e0e0e0;
  border: 2px solid #ccc;
  color: #999;
  cursor: not-allowed;
}

.seat.is-selected {
  background: #023e8a;
  border: 2px solid #023e8a;
  color: white;
}

/* --- BAGIAN KANAN (CART) --- */
.sidebar {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
  max-height: 60vh;
  overflow-y: auto;
}

.booking-card {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.seat-badge {
  font-weight: 700;
  color: #023e8a;
}

.btn-del {
  color: #ef4444;
  border: none;
  background: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
}

.card-body {
  padding: 15px;
}

.form-group-sm {
  margin-bottom: 10px;
}

.form-group-sm label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
}

.form-group-sm input,
.form-group-sm select {
  width: 100%;
  padding: 6px;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.price-calc {
  text-align: right;
  font-size: 0.9rem;
  margin-top: 10px;
  color: #555;
}

.error-text {
  color: red;
  font-size: 0.8rem;
  margin-top: 5px;
}

.summary {
  border-top: 2px solid #eee;
  padding-top: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.total-val {
  color: #023e8a;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #023e8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-checkout:disabled {
  background: #ccc;
}

/* Legend */
.legend {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.box {
  width: 14px;
  height: 14px;
  border-radius: 2px;
}
</style>
