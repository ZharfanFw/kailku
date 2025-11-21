<template>
  <div class="payment-method-container">
    <div class="payment-card">
      <div class="payment-header">
        <h2 class="header-title">Metode Pembayaran</h2>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div> Memuat tagihan...
      </div>

      <div v-else>
        <div class="payment-tabs">
          <button v-for="tab in paymentTabs" :key="tab.id" :class="['tab-button', { active: selectedTab === tab.id }]"
            @click="selectTab(tab.id)">
            {{ tab.label }}
          </button>
        </div>

        <div class="payment-methods-list">
          <h3 class="list-title">{{ getCurrentTabTitle() }}</h3>

          <div class="methods-container">
            <label v-for="method in filteredMethods" :key="method.id"
              :class="['method-item', { disabled: method.disabled }]">
              <input type="radio" name="payment-method" :value="method.id" v-model="selectedMethod"
                :disabled="method.disabled" class="method-radio" />
              <div class="method-content">
                <div class="method-icon">
                  <img :src="method.icon || 'https://via.placeholder.com/32'" :alt="method.name" />
                </div>
                <div class="method-info">
                  <span class="method-name">{{ method.name }}</span>
                  <span v-if="method.description" class="method-description">
                    {{ method.description }}
                  </span>
                </div>
              </div>
              <div v-if="method.badge" class="method-badge">
                {{ method.badge }}
              </div>
            </label>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal Pesanan</span>
            <span class="summary-value">{{ formatCurrency(orderSummary.subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Biaya Layanan (Admin)</span>
            <span class="summary-value">{{ formatCurrency(orderSummary.serviceFee) }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total-row">
            <span class="summary-label-total">Total Pembayaran</span>
            <span class="summary-value-total">{{ formatCurrency(totalPayment) }}</span>
          </div>
        </div>

        <button class="submit-button" :disabled="!selectedMethod || isProcessing" @click="handleSubmitPayment">
          {{ isProcessing ? 'Memproses...' : 'Bayar Sekarang' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoading = ref(true);
const isProcessing = ref(false);

// Data Tagihan (Akan diisi dari DB)
const pendingBookings = ref([]);
const pendingOrders = ref([]);
const PRICE_PER_HOUR = 25000; // Asumsi harga per jam

// UI State
const selectedTab = ref("transfer");
const selectedMethod = ref(null);

const paymentTabs = [
  { id: "transfer", label: "Transfer Bank" },
  { id: "cod", label: "COD" },
  { id: "qris", label: "QRIS" },
];

const paymentMethods = ref([
  // (Data dummy metode bayar kamu tetap bisa dipakai)
  { id: "bca", name: "Bank BCA", type: "transfer", disabled: false },
  { id: "mandiri", name: "Bank Mandiri", type: "transfer", disabled: false },
  { id: "qris", name: "QRIS", type: "qris", badge: "Instant", disabled: false },
  { id: "cod", name: "Bayar di Tempat", type: "cod", disabled: false },
]);

// --- 1. FETCH TAGIHAN DARI BACKEND ---
onMounted(async () => {
  const token = localStorage.getItem('kailku_token');
  if (!token) return router.push('/login');

  try {
    // A. Ambil Booking
    const resBook = await fetch('http://localhost:3000/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resBook.ok) {
      const data = await resBook.json();
      pendingBookings.value = data.filter(b => b.status === 'pending');
    }

    // B. Ambil Order Alat
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

// --- 2. HITUNG TOTAL OTOMATIS ---
const orderSummary = computed(() => {
  let subtotal = 0;

  // Hitung harga booking
  pendingBookings.value.forEach(b => {
    if (b.start_time && b.end_time) {
      const startH = parseInt(b.start_time.split(':')[0]);
      const endH = parseInt(b.end_time.split(':')[0]);
      subtotal += (endH - startH) * PRICE_PER_HOUR;
    }
  });

  // Hitung harga alat (asumsi ada field total_harga atau hitung manual)
  pendingOrders.value.forEach(o => {
    subtotal += Number(o.total_harga) || 0;
  });

  return {
    subtotal: subtotal,
    serviceFee: 2500 // Biaya admin tetap
  };
});

const totalPayment = computed(() => {
  return orderSummary.value.subtotal + orderSummary.value.serviceFee;
});

const filteredMethods = computed(() => {
  return paymentMethods.value.filter(m => m.type === selectedTab.value);
});

// --- 3. PROSES PEMBAYARAN (POST ke Backend) ---
async function handleSubmitPayment() {
  if (!confirm(`Bayar sebesar ${formatCurrency(totalPayment.value)} via ${selectedMethod.value}?`)) return;

  const token = localStorage.getItem('kailku_token');
  isProcessing.value = true;

  try {
    const payload = {
      booking_ids: pendingBookings.value.map(b => b.id),
      order_ids: pendingOrders.value.map(o => o.id),
      payment_method: selectedMethod.value,
      total_amount: totalPayment.value
    };

    const res = await fetch('http://localhost:3000/payment/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal memproses pembayaran");

    alert("Pembayaran Berhasil! Terima kasih.");
    router.push('/profil');

  } catch (err) {
    alert(err.message);
  } finally {
    isProcessing.value = false;
  }
}

// Helpers
function selectTab(id) { selectedTab.value = id; selectedMethod.value = null; }
function getCurrentTabTitle() {
  const map = { transfer: "Pilih Bank", cod: "Bayar di Tempat", qris: "Scan QRIS" };
  return map[selectedTab.value];
}
function formatCurrency(val) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val); }

</script>

<style scoped>
/* --- GUNAKAN CSS ASLI KAMU (SAYA COPY PASTE DI SINI AGAR AMAN) --- */

:root {
  --color-primary: #48cae4;
  --color-secondary: #ffa200;
  --color-dark: #03045e;
  --color-light-bg: #f0f8ff;
  --color-white: #ffffff;
  --color-border: #e0e0e0;
  --color-text-secondary: #666666;
  --color-success: #10b981;
  --color-error: #ef4444;
}

.payment-method-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 100px 24px 40px;
  /* Padding top disesuaikan navbar */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.payment-card {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.payment-header {
  padding: 24px;
  border-bottom: 2px solid var(--color-border);
}

.header-title {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.payment-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
  background-color: #fafafa;
}

.tab-button {
  flex: 0 0 auto;
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--color-primary);
  background-color: rgba(72, 202, 228, 0.05);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 700;
}

.payment-methods-list {
  padding: 24px;
}

.list-title {
  color: var(--color-dark);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.methods-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.method-item:hover:not(.disabled) {
  border-color: var(--color-primary);
  background-color: rgba(72, 202, 228, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 202, 228, 0.15);
}

.method-radio {
  width: 20px;
  height: 20px;
  margin-right: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.method-item:has(.method-radio:checked) {
  border-color: var(--color-primary);
  background-color: rgba(72, 202, 228, 0.1);
  box-shadow: 0 0 0 3px rgba(72, 202, 228, 0.2);
}

.method-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.method-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.method-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.method-name {
  color: var(--color-dark);
  font-size: 15px;
  font-weight: 600;
}

.method-badge {
  padding: 4px 12px;
  background-color: var(--color-success);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.order-summary {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 12px;
  margin: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.summary-value {
  color: var(--color-dark);
  font-size: 14px;
  font-weight: 600;
}

.summary-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 16px 0;
}

.summary-value-total {
  color: var(--color-secondary);
  font-size: 20px;
  font-weight: 800;
}

.submit-button {
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 16px;
  background-color: var(--color-secondary);
  color: #ff8c00;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 162, 0, 0.3);
}

.submit-button:hover:not(:disabled) {
  background-color: #ff8c00;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 162, 0, 0.4);
  color: var(--color-white);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 50px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
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
</style>
