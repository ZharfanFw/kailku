<template>
  <div class="booking-page">
    <div class="main-content">
      <!-- LOGIC BARU: Menampilkan pesan error jika kursi penuh -->
      <div v-if="seatError" class="seat-error-message">
        {{ seatError }}
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="legend-box available"></div>
          <span>Masih Kosong</span>
        </div>
        <div class="legend-item">
          <div class="legend-box unavailable"></div>
          <span>Tidak Tersedia</span>
        </div>
        <div class="legend-item">
          <div class="legend-box selected"></div>
          <span>Pilihanmu</span>
        </div>
      </div>

      <div class="seating-layout">
        <div class="layout-inner-wrap">
          <!-- Denah kursi tidak berubah, event click-nya masih sama -->
          <div class="seat-row top">
            <div
              v-for="id in [41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26]"
              :key="id"
              :class="['seat', getSeatById(id).status]"
              @click="toggleSeat(id)"
            >
              {{ id }}
            </div>
          </div>
          <div class="middle-section">
            <div class="seat-column left">
              <div
                v-for="id in [42, 43, 44, 45, 46, 47, 48, 49]"
                :key="id"
                :class="['seat', getSeatById(id).status]"
                @click="toggleSeat(id)"
              >
                {{ id }}
              </div>
            </div>
            <div class="pond">Kolam Ikan</div>
            <div class="seat-column right">
              <div
                v-for="id in [25, 24, 23, 22, 21, 20, 19, 18]"
                :key="id"
                :class="['seat', getSeatById(id).status]"
                @click="toggleSeat(id)"
              >
                {{ id }}
              </div>
            </div>
          </div>
          <div class="seat-row bottom">
            <div
              v-for="id in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]"
              :key="id"
              :class="['seat', getSeatById(id).status]"
              @click="toggleSeat(id)"
            >
              {{ id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BAGIAN INI BERUBAH TOTAL -->
    <div class="sidebar">
      <!-- LOGIC BARU: Looping (v-for) untuk setiap form booking -->
      <div class="booking-list">
        <div
          v-for="(booking, index) in bookings"
          :key="booking.id"
          class="booking-info"
        >
          <div class="booking-header">
            <h3>Detail Booking #{{ index + 1 }}</h3>
            <!-- Tombol hapus, tidak muncul jika hanya ada 1 booking -->
            <button
              v-if="bookings.length > 1"
              @click="removeBooking(booking.id)"
              class="remove-btn"
            >
              Hapus
            </button>
          </div>

          <!-- Menampilkan kursi yang terhubung ke booking ini -->
          <div class="info-item linked-seat">
            <label>Kursi Terpilih</label>
            <span :class="['seat-display', { 'not-selected': !booking.selectedSeatId }]">
              {{ booking.selectedSeatId ? `No. ${booking.selectedSeatId}` : "Pilih kursi..." }}
            </span>
          </div>

          <div class="info-item">
            <label :for="`booking-date-${booking.id}`">Tanggal Booking</label>
            <input
              type="date"
              :id="`booking-date-${booking.id}`"
              v-model="booking.bookingDate"
            />
          </div>
          <div class="info-item">
            <label :for="`start-time-${booking.id}`">Waktu Mulai</label>
            <input
              type="time"
              :id="`start-time-${booking.id}`"
              v-model="booking.startTime"
            />
          </div>
          <div class="info-item">
            <label :for="`duration-${booking.id}`">Durasi (jam)</label>
            <!-- PERUBAHAN UTAMA: DARI <input> MENJADI <select> -->
            <select
              :id="`duration-${booking.id}`"
              v-model.number="booking.duration"
            >
              <option v-for="h in 8" :key="h" :value="h">
                {{ h }} jam
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="summary">
        <!-- Tombol ini sekarang memanggil addBooking -->
        <button
          class="add-person-btn"
          @click="addBooking"
          :disabled="!canAddBooking"
        >
          {{ canAddBooking ? "Tambah Orang +1" : "Maksimal 5 Orang" }}
        </button>

        <div class="total-price">
          Total Harga
          <span>{{ formattedTotalPrice }}</span>
        </div>
        <button class="continue-btn" @click="router.push('/cart')">Lanjut Sewa/Beli Alat</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();


const PRICE_PER_SEAT_PER_HOUR = 10000;
const MAX_BOOKINGS = 5;
let nextBookingId = 2; // ID unik untuk booking baru

// --- LOGIC BARU: State untuk pesan error ---
const seatError = ref(null);

// Fungsi helper untuk membuat objek booking baru
const createDefaultBooking = (id) => ({
  id: id,
  bookingDate: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  duration: 1, // Default durasi 1 jam
  selectedSeatId: null, // Setiap booking punya 1 kursi
});

// --- DATA REAKTIF ---
// State 'bookings' sekarang adalah array of objects
const bookings = ref([createDefaultBooking(1)]); // Mulai dengan 1 form booking

// State 'seats' tetap sama, sebagai master list
const seats = ref([
  { id: 1, status: "available" }, { id: 2, status: "available" }, { id: 3, status: "available" },
  { id: 4, status: "available" }, { id: 5, status: "available" }, { id: 6, status: "available" },
  { id: 7, status: "unavailable" }, { id: 8, status: "unavailable" }, { id: 9, status: "available" },
  { id: 10, status: "available" }, { id: 11, status: "unavailable" }, { id: 12, status: "unavailable" },
  { id: 13, status: "unavailable" }, { id: 14, status: "unavailable" }, { id: 15, status: "available" },
  { id: 16, status: "available" }, { id: 17, status: "available" },
  { id: 18, status: "available" }, { id: 19, status: "available" }, { id: 20, status: "available" },
  { id: 21, status: "available" }, { id: 22, status: "unavailable" }, { id: 23, status: "available" },
  { id: 24, status: "available" }, { id: 25, status: "unavailable" },
  { id: 26, status: "available" }, { id: 27, status: "available" }, { id: 28, status: "available" },
  { id: 29, status: "available" }, { id: 30, status: "available" }, { id: 31, status: "available" },
  { id: 32, status: "available" }, { id: 33, status: "available" }, { id: 34, status: "available" },
  { id: 35, status: "unavailable" }, { id: 36, status: "available" }, { id: 37, status: "unavailable" },
  { id: 38, status: "available" }, { id: 39, status: "available" }, { id: 40, status: "available" },
  { id: 41, status: "available" },
  { id: 42, status: "available" }, { id: 43, status: "available" }, { id: 44, status: "unavailable" },
  { id: 45, status: "unavailable" }, { id: 46, status: "available" }, { id: 47, "status": "unavailable" },
  { id: 48, status: "unavailable" }, { id: 49, status: "available" },
]);

// --- COMPUTED PROPERTIES ---
// Computed untuk menonaktifkan tombol "Tambah"
const canAddBooking = computed(() => bookings.value.length < MAX_BOOKINGS);

// LOGIC BARU: Total harga dihitung dari SETIAP booking
const totalPrice = computed(() => {
  return bookings.value.reduce((total, booking) => {
    // Hanya hitung harga jika booking tsb punya kursi
    if (booking.selectedSeatId) {
      // Karena sudah pakai <select>, value PASTI valid (1-8)
      // Tapi kita tetap jaga logic validasi ini untuk keamanan
      const validDuration = Math.min(Math.max(1, booking.duration || 1), 8);
      return total + PRICE_PER_SEAT_PER_HOUR * validDuration;
    }
    return total;
  }, 0);
});

const formattedTotalPrice = computed(() => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalPrice.value);
});

// --- METHODS ---
function getSeatById(id) {
  return seats.value.find((s) => s.id === id);
}

// LOGIC BARU: Fungsi untuk menambah form booking
function addBooking() {
  if (canAddBooking.value) {
    bookings.value.push(createDefaultBooking(nextBookingId++));
    seatError.value = null; // Hapus error jika ada
  }
}

// LOGIC BARU: Fungsi untuk menghapus form booking
function removeBooking(bookingId) {
  const bookingIndex = bookings.value.findIndex((b) => b.id === bookingId);
  if (bookingIndex === -1) return;

  const bookingToRemove = bookings.value[bookingIndex];

  // Jika booking yang dihapus punya kursi, buat kursi itu 'available' lagi
  if (bookingToRemove.selectedSeatId) {
    const seat = getSeatById(bookingToRemove.selectedSeatId);
    if (seat) {
      seat.status = "available";
    }
  }
  // Hapus booking dari array
  bookings.value.splice(bookingIndex, 1);
}

// LOGIC BARU: toggleSeat dimodifikasi
function toggleSeat(seatId) {
  const seat = getSeatById(seatId);
  if (seat.status === "unavailable") {
    return;
  }
  
  // Hapus error setiap kali user klik
  seatError.value = null;

  if (seat.status === "selected") {
    // Jika kursi sudah 'selected', user pasti ingin membatalkan
    seat.status = "available";
    // Cari booking yang punya kursi ini dan kosongkan
    const bookingToClear = bookings.value.find(
      (b) => b.selectedSeatId === seatId
    );
    if (bookingToClear) {
      bookingToClear.selectedSeatId = null;
    }
  } else if (seat.status === "available") {
    // Jika kursi 'available', cari form booking pertama yang kosong
    const availableBookingSlot = bookings.value.find(
      (b) => b.selectedSeatId === null
    );

    if (availableBookingSlot) {
      // Jika ada form booking kosong, alokasikan kursi ini ke sana
      availableBookingSlot.selectedSeatId = seatId;
      seat.status = "selected";
    } else {
      // Jika tidak ada form booking kosong
      seatError.value = "Kapasitas booking penuh. Silakan tambah orang (booking) baru.";
      console.warn("Tidak ada slot booking kosong.");
    }
  }
}
</script>

<style scoped>
/* ... SEMUA STYLE LAMA ANDA TETAP SAMA ... */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.booking-page {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background-color: #ffffff;
}
.main-content {
  width: 100%;
}
.sidebar {
  width: 100%;
  padding: 0 24px 24px 24px;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  color: #555;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}
.legend-box.available {
  background-color: #212121;
}
.legend-box.unavailable {
  background-color: #d0d0d0;
  border: 1px solid #bbb;
}
.legend-box.selected {
  background-color: #3498db;
}
.seating-layout {
  padding: 24px;
  max-width: 100%;
  margin: 0 auto;
  overflow-x: auto;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}
.layout-inner-wrap {
  min-width: 580px;
}
.seat-row,
.seat-column {
  display: flex;
  gap: 6px;
}
.seat-row {
  justify-content: center;
  flex-wrap: nowrap;
}
.seat-column {
  flex-direction: column;
}
.middle-section {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}
.pond {
  flex-grow: 1;
  display: grid;
  place-items: center;
  background-color: #f0f4f8;
  border-radius: 20px;
  color: #778ca3;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0 10px;
  min-height: 200px;
  text-align: center;
  min-width: 300px;
}
.seat {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.seat.available {
  background-color: #212121;
  color: white;
}
.seat.available:hover {
  opacity: 0.8;
}
.seat.unavailable {
  background-color: #d0d0d0;
  color: #777;
  border: 1px solid #bbb;
  cursor: not-allowed;
}
.seat.selected {
  background-color: #3498db;
  color: white;
  border: 1px solid #2980b9;
}

/* --- STYLE BARU & MODIFIKASI --- */

/* Wrapper untuk daftar booking-info */
.booking-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Jarak antar form booking */
  margin-bottom: 16px; /* Jarak sebelum summary */
}

.booking-info {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  background-color: #fafafa; /* Sedikit bedakan warna form */
}

/* Header di dalam form booking (Judul + Tombol Hapus) */
.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: 1 / -1; /* Lebar penuh */
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.booking-header h3 {
  font-size: 1.1rem;
  color: #333;
}
.remove-btn {
  background: none;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

/* Tampilan kursi terpilih di dalam form */
.linked-seat {
  grid-column: 1 / -1;
  background-color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.linked-seat label {
  font-size: 12px;
  color: #555;
  margin-bottom: 2px;
}
.seat-display {
  font-size: 1rem;
  font-weight: 600;
  color: #3498db;
}
.seat-display.not-selected {
  color: #999;
  font-weight: 500;
  font-style: italic;
}


.info-item {
  display: flex;
  flex-direction: column;
}
@media (min-width: 401px) {
  /* Atur ulang grid untuk form di mobile */
  .booking-info {
    grid-template-columns: 1fr 1fr;
  }
  .booking-info .linked-seat {
    grid-column: 1 / -1;
  }
  /* Buat tanggal jadi lebar penuh lagi */
  .booking-info .info-item:nth-of-type(3) {
     grid-column: 1 / -1;
  }
}
.info-item label {
  font-size: 12px;
  color: #555;
  margin-bottom: 4px;
}

/* PERUBAHAN STYLE: Menambahkan 'select' agar stylenya sama */
.info-item input,
.info-item select {
  font-size: 14px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  background-color: #fff; /* Pastikan <select> punya background */
}

.summary {
  width: 100%;
}
.add-person-btn {
  background: none;
  border: none;
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
  text-align: right;
  width: 100%;
  padding: 16px 0 8px 0;
  font-size: 14px;
}
.add-person-btn:disabled {
  color: #999;
  cursor: not-allowed;
}
.total-price {
  text-align: center;
  color: #555;
  font-size: 1rem;
  margin-bottom: 16px;
}
.total-price span {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
}
.continue-btn {
  width: 100%;
  background-color: #0d1a4d;
  color: white;
  padding: 18px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
}
.continue-btn:hover {
  background-color: #1a2f8b;
}

/* Style untuk pesan error */
.seat-error-message {
  background-color: #e74c3c;
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-weight: 500;
  border-radius: 0; /* Lebar penuh di atas */
}


/* =========================================== */
/* STYLING DESKTOP (LANDSCAPE)          	      */
/* =========================================== */
@media (min-width: 992px) {
  .booking-page {
    display: flex;
    flex-direction: row;
    max-width: 1200px;
    margin: 2rem auto;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    /* Penting untuk layout desktop: sidebar bisa scroll */
    align-items: flex-start;
  }
  .main-content {
    flex: 2;
    padding: 24px;
    border-right: 1px solid #eee;
  }
  .sidebar {
    flex: 1;
    padding: 24px;
    background-color: #fdfdfd;
    display: flex;
    flex-direction: column;
    
    /* FIX: Buat sidebar bisa scroll jika formnya banyak */
    max-height: 90vh; /* Sesuaikan dengan tinggi viewport */
    overflow-y: auto;
  }

  .seating-layout {
    overflow-x: hidden;
    padding: 24px 0 0 0;
  }
  .layout-inner-wrap {
    min-width: 0;
  }

  /* Di desktop, kembalikan grid ke 1 kolom agar rapi */
  .booking-info {
    grid-template-columns: 1fr;
  }
  .booking-info .linked-seat {
    grid-column: 1 / -1;
  }
  .booking-info .info-item:nth-of-type(3) {
     grid-column: 1 / -1;
  }

  /* Buat summary menempel di bawah */
  .summary {
    margin-top: auto; /* Dorong ke bawah */
    padding-top: 24px;
    border-top: 1px solid #eee;
    background: #fdfdfd; /* Pastikan ada background */
    
    /* Fix: Buat summary tetap di bawah */
    position: sticky;
    bottom: 0;
  }
  
  .continue-btn {
    border-radius: 8px;
  }

  .seat-error-message {
    border-radius: 8px 8px 0 0;
  }
}
</style>
