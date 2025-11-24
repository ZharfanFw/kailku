<template>
  <div class="payment-method-container">
    <div class="payment-card">
      <div class="payment-header">
        <h2 class="header-title">Metode Pembayaran</h2>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p style="margin-top: 10px; color: #666">Menghitung total tagihan...</p>
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
                  <img :src="method.icon" :alt="method.name"
                    @error="$event.target.src = 'https://via.placeholder.com/48?text=Bank'" />
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
          {{ isProcessing ? 'Memproses...' : 'Buat Pesanan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// --- KONFIGURASI & STATE ---
const PRICE_PER_HOUR = 25000;
const SERVICE_FEE = 2500;

const isLoading = ref(true);
const isProcessing = ref(false);
const pendingBookings = ref([]);
const pendingOrders = ref([]);

// UI State
const selectedTab = ref("transfer");
const selectedMethod = ref(null);

const paymentTabs = [
  { id: "transfer", label: "Transfer Bank" },
  { id: "cod", label: "COD" },
  { id: "qris", label: "QRIS" },
];

// --- DATA METODE PEMBAYARAN (FULL LIST KAMU) ---
const paymentMethods = ref([
  // Transfer Bank
  { id: "seabank", name: "SeaBank", type: "transfer", icon: new URL("@/assets/img/method-payment/seabank.avif", import.meta.url).href, disabled: false },
  { id: "bca", name: "Bank BCA", type: "transfer", icon: new URL("@/assets/img/method-payment/bca.avif", import.meta.url).href, disabled: false },
  { id: "mandiri", name: "Bank Mandiri", type: "transfer", icon: new URL("@/assets/img/method-payment/mandiri.avif", import.meta.url).href, disabled: false },
  { id: "bni", name: "Bank BNI", type: "transfer", icon: new URL("@/assets/img/method-payment/bni.avif", import.meta.url).href, disabled: false },
  { id: "bri", name: "Bank BRI", type: "transfer", icon: new URL("@/assets/img/method-payment/bri.avif", import.meta.url).href, disabled: false },
  { id: "bsi", name: "Bank Syariah Indonesia (BSI)", type: "transfer", icon: new URL("@/assets/img/method-payment/bsi.avif", import.meta.url).href, disabled: false },
  { id: "permata", name: "Bank Permata", type: "transfer", icon: new URL("@/assets/img/method-payment/permata.avif", import.meta.url).href, disabled: false },
  { id: "cimb", name: "Bank CIMB Niaga", type: "transfer", icon: new URL("@/assets/img/method-payment/cimb.avif", import.meta.url).href, disabled: false },
  { id: "other-bank", name: "Bank lainnya", type: "transfer", description: "Menerima transfer dari semua bank", icon: new URL("@/assets/img/method-payment/banklainnya.avif", import.meta.url).href, disabled: false },

  // COD
  { id: "cod-jne", name: "Bayar di Tempat (COD)", type: "cod", description: "Bayar saat barang diterima", icon: new URL("@/assets/img/method-payment/cod.avif", import.meta.url).href, disabled: false },

  // QRIS
  { id: "qris", name: "QRIS", type: "qris", description: "Scan QR untuk pembayaran instant", icon: new URL("@/assets/img/method-payment/qris.avif", import.meta.url).href, badge: "Instant", disabled: false },
]);

// --- 1. FETCH DATA DARI BACKEND ---
onMounted(async () => {
  const token = localStorage.getItem('kailku_token');
  if (!token) return router.push('/login');

  try {
    // A. Ambil Booking Pending
    const resBook = await fetch('http://localhost:3000/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resBook.ok) {
      const data = await resBook.json();
      pendingBookings.value = data.filter(b => b.status === 'pending');
    }

    // B. Ambil Order Alat Pending
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

// --- 2. HITUNG HARGA REALTIME ---
const orderSummary = computed(() => {
  let subtotal = 0;

  // Hitung harga Booking Tempat (Durasi * Harga)
  pendingBookings.value.forEach(b => {
    if (b.start_time && b.end_time) {
      const startH = parseInt(b.start_time.split(':')[0]);
      const endH = parseInt(b.end_time.split(':')[0]);
      const duration = endH - startH;
      subtotal += duration * PRICE_PER_HOUR;
    }
  });

  // Hitung harga Order Alat
  pendingOrders.value.forEach(o => {
    subtotal += Number(o.total_harga) || 0;
  });

  return {
    subtotal: subtotal,
    shipping: 0,
    serviceFee: SERVICE_FEE
  };
});

const totalPayment = computed(() => {
  return orderSummary.value.subtotal + orderSummary.value.serviceFee;
});

const pendingCount = computed(() => pendingBookings.value.length + pendingOrders.value.length);

const filteredMethods = computed(() => {
  return paymentMethods.value.filter(m => m.type === selectedTab.value);
});


// --- 3. PROSES BUAT TAGIHAN (CREATE PAYMENT) ---
async function handleSubmitPayment() {
  if (!selectedMethod.value) {
    alert("Silakan pilih metode pembayaran terlebih dahulu");
    return;
  }

  // Cek jika tagihan kosong
  if (totalPayment.value <= 0 && pendingCount.value === 0) {
    alert("Tidak ada tagihan yang perlu dibayar.");
    router.push('/profil');
    return;
  }

  const token = localStorage.getItem('kailku_token');
  isProcessing.value = true;

  try {
    const payload = {
      booking_ids: pendingBookings.value.map(b => b.id),
      order_ids: pendingOrders.value.map(o => o.id),
      payment_method: selectedMethod.value,
      total_amount: totalPayment.value
    };

    // Panggil Backend: Buat Payment (status: menunggu_verifikasi)
    const res = await fetch('http://localhost:3000/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal membuat tagihan pembayaran");

    const data = await res.json();

    // Redirect ke halaman eksekusi (QR Code / No Rekening)
    router.push(`/payment-execution/${data.payment_id}`);

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
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}
</script>

<style scoped>
/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #48cae4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


/* --- CSS ASLI KAMU --- */
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
  padding: 24px;
  padding-top: 100px;
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

.payment-tabs::-webkit-scrollbar {
  height: 4px;
}

.payment-tabs::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 2px;
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

.method-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9f9f9;
}

.method-radio {
  width: 20px;
  height: 20px;
  margin-right: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.method-radio:disabled {
  cursor: not-allowed;
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

.method-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.method-name {
  color: var(--color-dark);
  font-size: 15px;
  font-weight: 600;
}

.method-description {
  color: var(--color-text-secondary);
  font-size: 13px;
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

.total-row {
  margin-bottom: 0;
}

.summary-label-total {
  color: var(--color-dark);
  font-size: 16px;
  font-weight: 700;
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

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .payment-method-container {
    padding: 12px;
    padding-top: 100px;
  }

  .payment-header {
    padding: 16px;
  }

  .header-title {
    font-size: 20px;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 13px;
  }

  .payment-methods-list {
    padding: 16px;
  }

  .method-item {
    padding: 12px;
  }

  .method-icon {
    width: 40px;
    height: 40px;
  }

  .method-icon img {
    width: 24px;
    height: 24px;
  }

  .order-summary {
    margin: 16px;
    padding: 16px;
  }

  .submit-button {
    width: calc(100% - 32px);
    margin: 0 16px 16px;
  }
}
</style>
