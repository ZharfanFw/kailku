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
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 class="header-title">Review Pesanan</h2>
          <p class="header-subtitle">Cek kembali pesanan Anda sebelum membayar</p>
        </div>

        <div class="info-section" v-if="pendingBookings.length > 0">
          <h3 class="section-title">Tiket Booking ({{ pendingBookings.length }})</h3>
          <div v-for="(booking, index) in pendingBookings" :key="booking.id" class="detail-group mb-3">
            <div class="detail-item"><strong>Tempat:</strong> {{ booking.nama_tempat }}</div>
            <div class="detail-item">
              <strong>Jadwal:</strong> {{ formatDate(booking.tanggal_booking) }} | {{ booking.start_time.slice(0, 5) }}
              -
              {{ booking.end_time.slice(0, 5) }}
            </div>
            <div class="detail-item price-highlight">
              Rp {{ formatCurrency(calculateBookingPrice(booking)) }}
            </div>
            <hr v-if="index < pendingBookings.length - 1" class="item-divider">
          </div>
        </div>

        <div class="payment-details" v-if="pendingOrders.length > 0">
          <h3 class="section-title">Sewa / Beli Alat</h3>
          <div v-for="order in pendingOrders" :key="order.id" class="payment-item">
            <span>Order #{{ order.id }}</span>
            <span class="amount">Rp {{ formatCurrency(Number(order.total_harga) || 0) }}</span>
          </div>
        </div>

        <hr class="divider" />

        <div class="total-payment">
          <span class="total-label">Total Tagihan</span>
          <div class="grand-total">
            Rp <span class="grand-total-amount">{{ formatCurrency(totalBill) }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="booking-again-btn" @click="router.push('/cart')">
            Kembali
          </button>
          <button class="confirm-pay-btn" @click="goToMethodPayment">
            Pilih Pembayaran
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

const pendingBookings = ref([]);
const pendingOrders = ref([]);
const isLoading = ref(true);
const PRICE_PER_HOUR = 25000;

onMounted(async () => {
  const token = localStorage.getItem('kailku_token');
  if (!token) return router.push('/login');

  try {
    const resBook = await fetch('http://localhost:3000/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resBook.ok) {
      const data = await resBook.json();
      pendingBookings.value = data.filter(b => b.status === 'pending');
    }

    const resOrder = await fetch('http://localhost:3000/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resOrder.ok) {
      const data = await resOrder.json();
      pendingOrders.value = data.filter(o => o.status === 'pending');
    }
  } catch (err) { console.error(err); }
  finally { isLoading.value = false; }
});

const totalBill = computed(() => {
  let total = 0;
  pendingBookings.value.forEach(b => total += calculateBookingPrice(b));
  pendingOrders.value.forEach(o => total += Number(o.total_harga) || 0);
  return total;
});

function calculateBookingPrice(booking) {
  if (!booking.start_time || !booking.end_time) return 0;
  const startH = parseInt(booking.start_time.split(':')[0]);
  const endH = parseInt(booking.end_time.split(':')[0]);
  return (endH - startH) * PRICE_PER_HOUR;
}

// --- FUNGSI PINDAH HALAMAN ---
function goToMethodPayment() {
  // Kita pindah ke halaman pemilihan metode pembayaran
  router.push('/method-payment');
}

// Helpers
function formatCurrency(val) { return new Intl.NumberFormat("id-ID").format(val); }
function formatDate(d) { return new Date(d).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }); }
</script>

<style scoped>
/* Gunakan CSS yang sama persis dengan Payment.vue sebelumnya */
/* ... CSS KAMU ... */
:root {
  --color-primary: #48cae4;
  --color-dark: #03045e;
  --color-light-bg: #f0f8ff;
  --color-white: #ffffff;
}

.payment-container {
  display: flex;
  justify-content: center;
  padding: 120px 20px 40px;
  background-color: var(--color-light-bg);
  min-height: 100vh;
}

.confirmation-card {
  background-color: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(3, 4, 94, 0.12);
  padding: 40px;
  max-width: 600px;
  width: 100%;
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
  background-color: rgba(72, 202, 228, 0.1);
  border-radius: 50%;
  margin-bottom: 15px;
}

.success-icon {
  width: 40px;
  height: 40px;
  stroke: var(--color-primary);
}

.header-title {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.section-title {
  color: var(--color-dark);
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.detail-group {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.price-highlight {
  font-weight: bold;
  color: var(--color-primary);
  margin-top: 5px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9;
}

.amount {
  font-weight: bold;
}

.total-payment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f9ff;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #b9e6fe;
}

.grand-total-amount {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-dark);
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.booking-again-btn {
  flex: 1;
  padding: 14px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.confirm-pay-btn {
  flex: 1;
  padding: 14px;
  background: #ff8c00;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
