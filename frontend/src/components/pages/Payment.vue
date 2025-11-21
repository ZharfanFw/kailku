<template>
  <div class="payment-container">
    <div class="confirmation-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div> Memuat tagihan...
      </div>

      <div v-else-if="totalBill === 0" class="empty-state">
        <h3>Tidak ada tagihan pending.</h3>
        <button class="booking-again-btn" @click="router.push('/')">Kembali ke Beranda</button>
      </div>

      <div v-else>
        <div class="header-section">
          <div class="success-icon-wrapper">
            <svg class="success-icon" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h2 class="header-title">Rincian Biaya</h2>
          <p class="header-subtitle">Silakan selesaikan pembayaran Anda</p>
        </div>

        <div class="info-section" v-if="pendingBookings.length > 0">
          <h3 class="section-title">Informasi Booking ({{ pendingBookings.length }} Item)</h3>

          <div v-for="(booking, index) in pendingBookings" :key="booking.id" class="detail-group mb-3">
            <div class="detail-item"><strong>Tempat:</strong> {{ booking.nama_tempat }}</div>
            <div class="detail-item"><strong>Lokasi:</strong> {{ booking.lokasi_tempat }}</div>
            <div class="detail-item">
              <strong>Waktu:</strong> {{ formatDate(booking.tanggal_booking) }} | {{ booking.start_time.slice(0, 5) }} -
              {{ booking.end_time.slice(0, 5) }}
            </div>
            <div class="detail-item"><strong>Kursi:</strong> {{ booking.no_kursi || 'Bebas' }}</div>
            <div class="detail-item price-highlight">
              <strong>Biaya:</strong> {{ formatCurrency(calculateBookingPrice(booking)) }}
            </div>
            <hr v-if="index < pendingBookings.length - 1" class="item-divider">
          </div>
        </div>

        <hr class="divider" v-if="pendingBookings.length > 0 && pendingOrders.length > 0" />

        <div class="payment-details" v-if="pendingOrders.length > 0">
          <h3 class="section-title">Sewa / Beli Alat</h3>

          <div v-for="order in pendingOrders" :key="order.id" class="payment-item">
            <span>Order #{{ order.id }} ({{ formatDate(order.created_at) }})</span>
            <span class="amount">{{ formatCurrency(Number(order.total_harga) || 0) }}</span>
            <small v-if="!order.total_harga" style="color:red; font-size:0.7rem; display:block">(Harga menyusul)</small>
          </div>
        </div>

        <hr class="divider" />

        <div class="total-payment">
          <span class="total-label">Total Pembayaran</span>
          <div class="grand-total">
            Rp <span class="grand-total-amount">{{ formatNumber(totalBill) }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="booking-again-btn" @click="router.push('/memancing-section')">
            Tambah Pesanan
          </button>
          <button class="confirm-pay-btn" @click="handleConfirmPayment" :disabled="isProcessing">
            {{ isProcessing ? 'Memproses...' : 'Konfirmasi & Bayar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// --- STATE ---
const pendingBookings = ref([]);
const pendingOrders = ref([]);
const isLoading = ref(true);
const isProcessing = ref(false);
const PRICE_PER_HOUR = 25000; // Harga default booking tempat

// --- FETCH DATA ---
onMounted(async () => {
  const token = localStorage.getItem('kailku_token');
  if (!token) return router.push('/login');

  try {
    // 1. Ambil Booking Pending
    const resBook = await fetch('http://localhost:3000/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resBook.ok) {
      const data = await resBook.json();
      pendingBookings.value = data.filter(b => b.status === 'pending');
    }

    // 2. Ambil Order Pending
    const resOrder = await fetch('http://localhost:3000/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resOrder.ok) {
      const data = await resOrder.json();
      pendingOrders.value = data.filter(o => o.status === 'pending');
    }

  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

// --- COMPUTED ---
const totalBill = computed(() => {
  let total = 0;
  // Total Booking
  pendingBookings.value.forEach(b => total += calculateBookingPrice(b));
  // Total Order (Jika ada total_harga di DB, pakai itu. Jika null, 0 dulu)
  pendingOrders.value.forEach(o => total += Number(o.total_harga) || 0);
  return total;
});

// --- METHODS ---
function calculateBookingPrice(booking) {
  if (!booking.start_time || !booking.end_time) return 0;
  const startH = parseInt(booking.start_time.split(':')[0]);
  const endH = parseInt(booking.end_time.split(':')[0]);
  return (endH - startH) * PRICE_PER_HOUR;
}

async function handleConfirmPayment() {
  if (!confirm("Konfirmasi pembayaran sekarang?")) return;

  const token = localStorage.getItem('kailku_token');
  isProcessing.value = true;

  try {
    // Kirim ID apa saja yang mau dibayar
    const payload = {
      booking_ids: pendingBookings.value.map(b => b.id),
      order_ids: pendingOrders.value.map(o => o.id)
    };

    const res = await fetch('http://localhost:3000/payment/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal bayar");

    alert("Pembayaran Berhasil! Terima kasih.");
    router.push('/method-payment'); // Balik ke profil

  } catch (err) {
    alert(err.message);
  } finally {
    isProcessing.value = false;
  }
}

// Formatters
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}
function formatNumber(amount) {
  return new Intl.NumberFormat("id-ID").format(amount);
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
</script>

<style scoped>
/* ===== SEMUA CSS KAMU (PLUS SEDIKIT TAMBAHAN) ===== */

/* Loading & Empty State */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #023e8a;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Tambahan styling untuk list booking */
.mb-3 {
  margin-bottom: 15px;
}

.item-divider {
  border-top: 1px dashed #ccc;
  margin: 10px 0;
  border-bottom: none;
}

.price-highlight {
  color: var(--color-primary);
  font-weight: bold;
  margin-top: 5px;
}

/* --- CSS ASLI KAMU --- */
:root {
  --color-primary: #48cae4;
  --color-secondary: #ffa200;
  --color-dark: #03045e;
  --color-light-bg: #f0f8ff;
  --color-white: #ffffff;
  --color-border: #e0e0e0;
}

.payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 120px 20px 40px;
  /* Sesuaikan padding top karena navbar fixed */
  background-color: var(--color-light-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
  gap: 6px;
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

.divider {
  border: none;
  border-top: 2px solid var(--color-border);
  margin: 24px 0;
}

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
  background-color: #ffffff;
  color: #000;
  border: 2px solid #ff8c00;
}

.confirm-pay-btn:hover {
  background-color: #e57e00;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.4);
}

.confirm-pay-btn:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

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
