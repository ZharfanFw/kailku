<template>
  <div class="payment-container">
    <div class="confirmation-card">
      <!-- Header Section -->
      <div class="header-section">
        <div class="success-icon-wrapper">
          <svg class="success-icon" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <h2 class="header-title">Rincian Biaya</h2>
        <p class="header-subtitle">Booking Anda berhasil dibuat!</p>
      </div>

      <!-- Informasi Booking -->
      <div class="info-section">
        <h3 class="section-title">Informasi Booking</h3>
        <div class="detail-group">
          <div class="detail-item">
            <strong>Tempat:</strong> {{ bookingInfo.placeName }}
          </div>
          <div class="detail-item">
            <strong>Lokasi:</strong> {{ bookingInfo.location }}
          </div>
          <div class="detail-item">
            <strong>Tanggal:</strong> {{ formatDate(bookingInfo.date) }}
          </div>
          <div class="detail-item">
            <strong>Waktu:</strong> {{ bookingInfo.time }}
          </div>
          <div class="detail-item">
            <strong>Durasi:</strong> {{ bookingInfo.duration }} jam
          </div>
          <div class="detail-item">
            <strong>Jumlah Orang:</strong> {{ bookingInfo.persons }} orang
          </div>
        </div>
      </div>

      <hr class="divider" />

      <!-- Rincian Pembayaran -->
      <div class="payment-details">
        <h3 class="section-title">Rincian Pembayaran</h3>

        <div class="payment-item">
          <span>Biaya Booking ({{ bookingInfo.duration }} jam)</span>
          <span class="amount">{{ formatCurrency(bookingCost) }}</span>
        </div>

        <!-- Equipment List -->
        <template v-if="equipmentList.length > 0">
          <div class="payment-item equipment-header">
            <span><strong>Peralatan:</strong></span>
          </div>

          <div
            v-for="item in equipmentList"
            :key="item.id"
            class="payment-item sub-item"
          >
            <span>{{ item.name }} ({{ item.type }}) × {{ item.quantity }}</span>
            <span class="amount">{{ formatCurrency(item.total) }}</span>
          </div>

          <div class="payment-item total-equipment">
            <span>Total Peralatan</span>
            <span class="amount">{{ formatCurrency(equipmentTotal) }}</span>
          </div>
        </template>
      </div>

      <hr class="divider" />

      <!-- Total Pembayaran -->
      <div class="total-payment">
        <span class="total-label">Total Pembayaran</span>
        <div class="grand-total">
          Rp
          <span class="grand-total-amount">{{ formatNumber(grandTotal) }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="booking-again-btn" @click="router.push('/booking')">
          Booking Lagi
        </button>
        <button class="confirm-pay-btn" @click="router.push('/method-payment')">
          Konfirmasi & Bayar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- KONVERSI KE SCRIPT SETUP ---
import { ref, computed } from "vue";
import { useRouter } from "vue-router"; // <-- INI YANG ANDA MAU

// Panggil useRouter di level atas
const router = useRouter();

// --- KONVERSI DARI data() ---
const bookingInfo = ref({
  placeName: "Kolam Pancing Sari Alam",
  location: "Lembang, Bandung",
  date: "2025-11-11",
  time: "11:31",
  duration: 2,
  persons: 1,
  pricePerHour: 50000,
});

const equipmentList = ref([
  {
    id: 1,
    name: "Kursi Lipat",
    type: "Sewa",
    quantity: 1,
    pricePerUnit: 20000,
    total: 20000,
  },
]);

// --- KONVERSI DARI computed: ---
const bookingCost = computed(() => {
  return bookingInfo.value.pricePerHour * bookingInfo.value.duration;
});

const equipmentTotal = computed(() => {
  return equipmentList.value.reduce((sum, item) => sum + item.total, 0);
});

const grandTotal = computed(() => {
  return bookingCost.value + equipmentTotal.value;
});

// --- KONVERSI DARI methods: ---
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(amount) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// --- PERBAIKAN HANDLE ---
function handleBookingAgain() {
  // Gunakan router dari useRouter()
  router.push("/booking");
  console.log("Booking lagi clicked, navigating to /booking");
}

function handleConfirmPayment() {
  // Gunakan router dari useRouter()
  router.push("/method-payment");
  console.log("Konfirmasi pembayaran, navigating to /method-payment");
}
</script>

<style scoped>
/* ===== VARIABEL WARNA ===== */
:root {
  --color-primary: #48cae4;
  --color-secondary: #ffa200;
  --color-dark: #03045e;
  --color-light-bg: #f0f8ff;
  --color-white: #ffffff;
  --color-border: #e0e0e0;
}

/* ===== CONTAINER UTAMA ===== */
.payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--color-light-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.confirmation-card {
  background-color: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(3, 4, 94, 0.12);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== HEADER SECTION ===== */
.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.success-icon-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  background-color: rgba(72, 202, 228, 0.1);
  border-radius: 50%;
  animation: scaleIn 0.5s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-icon {
  width: 40px;
  height: 40px;
  fill: var(--color-primary);
}

.header-title {
  color: var(--color-dark);
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.header-subtitle {
  color: var(--color-dark);
  opacity: 0.7;
  margin: 0;
  font-size: 16px;
}

/* ===== INFO SECTION ===== */
.info-section {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid rgba(72, 202, 228, 0.2);
}

.section-title {
  color: var(--color-dark);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  color: var(--color-dark);
  font-size: 15px;
  line-height: 1.5;
}

.detail-item strong {
  font-weight: 600;
  margin-right: 4px;
}

/* ===== DIVIDER ===== */
.divider {
  border: none;
  border-top: 2px solid var(--color-border);
  margin: 24px 0;
}

/* ===== PAYMENT DETAILS ===== */
.payment-details {
  margin-bottom: 24px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: var(--color-dark);
  font-size: 15px;
}

.payment-item .amount {
  font-weight: 600;
  white-space: nowrap;
  margin-left: 16px;
}

.equipment-header {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
}

.sub-item {
  padding-left: 20px;
  font-size: 14px;
  color: rgba(3, 4, 94, 0.8);
}

.total-equipment {
  font-weight: 700;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
  background-color: rgba(72, 202, 228, 0.05);
  padding: 12px;
  margin-left: -12px;
  margin-right: -12px;
  border-radius: 8px;
}

/* ===== TOTAL PAYMENT ===== */
.total-payment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  margin-top: 24px;
  border: 2px solid var(--color-primary);
}

.total-label {
  color: var(--color-dark);
  font-weight: 700;
  font-size: 18px;
}

.grand-total {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 700;
}

.grand-total-amount {
  color: var(--color-primary);
  font-size: 32px;
  font-weight: 800;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.booking-again-btn,
.confirm-pay-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-again-btn {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.booking-again-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 202, 228, 0.3);
}

.confirm-pay-btn {
  /* Ubah background dan border di sini */
  background-color: #ffffff; /* Dark Orange */
  color: #000; /* Teks hitam agar kontras dengan Dark Orange */
  border: 2px solid #ff8c00; /* Dark Orange */
}

.confirm-pay-btn:hover {
  /* Anda mungkin ingin menyesuaikan hover agar sedikit berbeda */
  background-color: #e57e00; /* Sedikit lebih gelap saat hover */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.4);
}

.booking-again-btn:active,
.confirm-pay-btn:active {
  transform: translateY(0);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 640px) {
  .confirmation-card {
    padding: 24px;
  }

  .header-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .grand-total {
    font-size: 20px;
  }

  .grand-total-amount {
    font-size: 28px;
  }
}
</style>
