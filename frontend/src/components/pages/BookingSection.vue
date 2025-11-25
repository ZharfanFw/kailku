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

      <!--tabel cek kesediaan-->
      <div class="global-filter">
        <div class="filter-header">
          <strong>🔍 Cek Ketersediaan</strong>
          <small>(Ubah ini untuk melihat kursi kosong di jam berbeda)</small>
        </div>
        <!--di dalmnya ada tanggal, jam cek, durasi-->
        <div class="filter-row">
          <div class="filter-group">
            <label>Tanggal</label>
            <input type="date" v-model="globalDate" :min="todayDate" />
          </div>
          <!--tanggal-->
          <div class="filter-group">
            <label>Jam Cek</label>
            <select v-model="globalStartTime" :disabled="!globalDate">
              <option value="">-- Pilih Jam --</option>
              <!--memilih perjam-->
              <option v-for="time in generatedTimeSlots" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          <!--durasi-->
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

      <!--denah peta-->
      <div class="seating-area">
        <div v-if="isLoadingSeats" class="loading-state">
          <div class="spinner"></div> Memuat denah...
        </div>

        <!--tabel yang berisi denah tempat-->
        <div v-else class="layout-wrapper">
          <!--kursi di bagian atas-->
          <div class="seat-row top">
            <div v-for="seat in layout.top" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
              @click="handleSeatClick(seat)">
              {{ seat.id }}
            </div>
          </div>
          <!--kursi di bagian kanan dan kiri-->
          <div class="middle-section">
            <!--kursi kiri-->
            <div class="seat-col left">
              <div v-for="seat in layout.left" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
                @click="handleSeatClick(seat)">
                {{ seat.id }}
              </div>
            </div>
            <div class="pond">
              <div class="water"><span>KOLAM</span></div>
            </div>
            <!--kursi dibagian kanan-->
            <div class="seat-col right">
              <div v-for="seat in layout.right" :key="seat.id" :class="['seat', getSeatVisualStatus(seat)]"
                @click="handleSeatClick(seat)">
                {{ seat.id }}
              </div>
            </div>
          </div>
          <!--kursi dibagian bawah-->
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

      <!--tabl yang adaarnya-->
      <div class="booking-list">
        <!--bagian dalam arnya-->
        <div v-for="(booking, index) in myBookings" :key="booking.tempId" class="booking-card">
          <!--pnentuan nomor yang ada kursi-->
          <div class="card-header">
            <span class="seat-badge">Kursi #{{ booking.no_kursi }}</span>
            <button @click="removeBooking(index)" class="btn-del">Hapus</button>
          </div>

          <!--tabl yang yang dalamnya tanggal, jam mulai, durasi-->
          <div class="card-body">
            <div class="form-group-sm">
              <label>Tanggal</label>
              <!--memilih tanggal-->
              <input type="date" v-model="booking.tanggal" :min="todayDate"
                @change="fetchSpecificSeatSchedule(booking)" />
            </div>

            <!--jam yang dipilih usr mulai pada jam brapa-->
            <div class="form-group-sm">
              <label>Jam Mulai</label>

              <select v-model="booking.start" :disabled="booking.isLoadingSchedule">
                <!--saat mmilih jam bisa diubah lagi -->
                <option value="" disabled>{{ booking.isLoadingSchedule ? 'Cek..' : 'Pilih' }}</option>
                <option v-for="time in booking.availableStartTimes" :key="time" :value="time">{{ time }}</option>
              </select>
            </div>

            <!--durasi yang di pilih user-->
            <div class="form-group-sm">
              <label>Durasi</label>
              <select v-model.number="booking.durasi">
                <option v-for="h in 8" :key="h" :value="h">{{ h }} Jam</option>
              </select>
            </div>

            <!--jumlah yang akan di booking setiap perjam-->
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
  //mencari bookign yang belum mengisi jam mulau (start_time)
  const invalid = myBookings.value.find(b => !b.start);
  //jika ada yang kosong maka menampilkan peringatan
  if (invalid) return alert(`Lengkapi jam untuk Kursi #${invalid.no_kursi}`);

  //ambil token dari localstorage untuk autentikasi, harus ada login terlebih dahulu
  const token = localStorage.getItem('kailku_token');
  //tidak bisa ngebooking dikarenakan belum login, dah harus login
  if (!token) return router.push('/login');

  //set status sedang submit untuk mendisabled button atau tampilkan loading
  isSubmitting.value = true;
  try {
    //loop setiap item booking yang ada di myBookings
    for (const b of myBookings.value) {
      //mensiapkan data yang akan dikirim ke API
      const payload = {
        //ID_TEMPAT/venue
        tempat_id: VENUE_ID,
        //nomor kursi yang di booking
        no_kursi: b.no_kursi,
        //tanggal booking
        tanggal_booking: b.tanggal,
        //jam mulai booking
        start_time: b.start,
        //lama durasi
        duration: b.durasi
      };
      //kirim request POST k API backend
      const res = await fetch('http://localhost:3000/bookings/', {
        //metode http post
        method: 'POST',
        //kirim data dalam dormat JSON
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        //serta akun yang sudah di login
        body: JSON.stringify(payload)
      });
      //jika API reponse error, lempar error
      if (!res.ok) throw new Error("Gagal booking kursi " + b.no_kursi);
    }
    //tampilan jika booking berhasil
    alert("Booking Berhasil!");
    //setelah berhasil booking maka user akan dipindahkan ke cart
    router.push('/cart');
  } catch (err) { alert(err.message); } //tangkap error dan tampilkan pesan ke user
  finally { isSubmitting.value = false; } //set kembali status submit  selesai 
}

// --- HELPERS ---
const generatedTimeSlots = computed(() => {
  //jika jam buka venue belum ada, kembalikan array kosong
  if (!venueOpenTime.value) return [];
  //array untuk menampong daftar slot waktu
  const slots = [];
  //buat waktu awal berdasarkan jam (tanggal bebas, hanya jam yang di pakai)
  let current = new Date(`2000-01-01T${venueOpenTime.value}`);
  ////buat waktu akhir berdasarkan jam tutup
  let end = new Date(`2000-01-01T${venueCloseTime.value}`);
  //kurang 1 dari jam tutup, supaya slot trakhir tidak melewatu jam tutup
  //misal tutup jam 22:00 maka slot trakhir 21:00
  end.setHours(end.getHours() - 1);

  //loop untuk menghasilkan slot waktu dari jam buka hingga slot trakhir
  while (current <= end) {
    //ambil hanya format jam:menit dari waktu contohnya "09:00", "10:00"
    slots.push(current.toTimeString().slice(0, 5));
    //tambah 1 jam untuk slot berikutnya
    current.setMinutes(current.getMinutes() + 60);
  }
  //kembalikan hasil daftar slot
  return slots;
});

// Layout Kolam
const layout = computed(() => {
  //menghitung total kursi 
  const total = seats.value.length;
  //jika ada kuris, kemalikan layout kosong
  if (total === 0) return { top: [], right: [], bottom: [], left: [] };

  //tentukan jumlah kursi di setiap sisi
  //35% untuk sisi atas
  const topCount = Math.ceil(total * 0.35);
  //15% sisi kanan
  const rightCount = Math.ceil(total * 0.15);
  //35% sisi bawah
  const bottomCount = Math.ceil(total * 0.35);
  //ambil data kursi untuk sisi atas dari index 0 sampai topCount
  const top = seats.value.slice(0, topCount);
  //Ambil data kursi sisi kanan lanjutan atas
  const right = seats.value.slice(topCount, topCount + rightCount);
  //ambil data kursi untuk sisi bawah setelah atas dan bawah
  const bottom = seats.value.slice(topCount + rightCount, topCount + rightCount + bottomCount);
  //sisa kursi dimasukkan ke sisi kiri
  const left = seats.value.slice(topCount + rightCount + bottomCount);
  //kembalikan layout sebagai objek 4 sisi
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
/* --- LAYOUT UTAMA --- */
.booking-page {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px;
  gap: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Desktop Layout */
@media (min-width: 992px) {
  .booking-page {
    flex-direction: row;
    align-items: flex-start;
  }

  .main-content {
    flex: 3;
    /* Biar konten kiri bisa scroll independen dari sidebar */
    min-width: 0;
  }

  .sidebar {
    flex: 1.3;
    position: sticky;
    top: 100px;
    /* KUNCI SCROLL DESKTOP: Batasi tinggi sidebar setinggi layar */
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
  }
}

/* --- BAGIAN KIRI (DENAH) --- */
.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.badge-time {
  background: #e0f2fe;
  color: #023e8a;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.badge-price {
  background: #fff3cd;
  color: #856404;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-left: 10px;
}

.badge-loading {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.global-filter {
  /* display: grid; */
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 600;
}

.filter-group select,
.filter-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 0.9rem;
}

.legend {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 0.85rem;
  color: #555;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.box.available {
  background: white;
  border: 2px solid #2ecc71;
}

.box.unavailable {
  background: #e0e0e0;
  border: 2px solid #ccc;
}

.box.selected {
  background: #023e8a;
  border: 2px solid #023e8a;
}

.seating-area {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
  gap: 8px;
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
  font-size: 1.2rem;
  letter-spacing: 1px;
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
  pointer-events: none;
}

.seat.selected {
  background: #023e8a;
  border: 2px solid #023e8a;
  color: white;
}

/* --- BAGIAN KANAN (SIDEBAR - SCROLL FIX) --- */
.sidebar {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  /* Default Mobile: Tinggi otomatis mengikuti konten */
  height: auto;
}

/* Container List yang Bisa di-Scroll */
.booking-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;

  /* KUNCI SCROLL MOBILE: Batasi tinggi list di HP */
  max-height: 400px;
  overflow-y: auto;

  padding-right: 5px;
  /* Jarak biar scrollbar ga nempel */
}

/* Custom Scrollbar yang Cantik */
.booking-list::-webkit-scrollbar {
  width: 6px;
}

.booking-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.booking-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.booking-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.booking-card {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
  /* Mencegah kartu gepeng */
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
  padding: 8px;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
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

/* Bagian Bawah Sidebar (Tetap di Bawah) */
.summary {
  border-top: 2px solid #eee;
  padding-top: 20px;
  margin-top: auto;
  /* Dorong ke paling bawah di mode flex */
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

.btn-add-person {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px dashed #023e8a;
  background: #f0f9ff;
  color: #023e8a;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
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
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* --- MODIFIKASI DESKTOP UNTUK SCROLL --- */
@media (min-width: 992px) {
  .booking-list {
    /* Di Desktop, biarkan list mengambil sisa ruang yang ada */
    flex: 1;
    max-height: none;
    /* Reset max-height mobile */
    min-height: 0;
    /* Fix untuk Firefox flex scroll */
  }
}

@media (max-width: 768px) {
  .booking-page {
    padding-top: 80px;
    gap: 20px;
  }

  /* Kursi lebih kecil di HP biar muat */
  .seat {
    width: 30px;
    height: 30px;
    font-size: 0.7rem;
  }

  .layout-wrapper {
    gap: 5px;
  }
}
</style>
