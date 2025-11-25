<template>
  <div class="exec-container">
    <div class="exec-card">
      <div class="timer" :class="{ 'expired': isExpired }">
        {{ isExpired ? 'Waktu Habis' : `Selesaikan dalam ${formattedTime}` }}
      </div>

      <div class="amount-box">
        <p>Total Pembayaran</p>
        <h2>{{ formatCurrency(paymentData.jumlah_bayar) }}</h2>
      </div>

      <div v-if="isTransfer" class="method-details">
        <div class="bank-header">
          <span>Transfer Bank {{ getBankName(paymentData.metode_pembayaran) }}</span>
        </div>
        <div class="va-box">
          <p>Nomor Virtual Account</p>
          <div class="va-number">
            <h1>{{ virtualAccount }}</h1>
            <button class="btn-copy" @click="copyVA">Salin</button>
          </div>
        </div>
        <div class="instructions">
          <p>1. Buka M-Banking {{ getBankName(paymentData.metode_pembayaran) }}</p>
          <p>2. Pilih menu Transfer Virtual Account</p>
          <p>3. Masukkan nomor di atas</p>
        </div>
      </div>

      <div v-else-if="isQRIS" class="method-details center">
        <h3>Scan QRIS</h3>
        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
          class="qr-code" />
        <p>Scan menggunakan GoPay, OVO, Dana, atau Mobile Banking</p>
      </div>

      <div v-else class="method-details center">
        <h3>Bayar di Tempat</h3>
        <p>Siapkan uang tunai pas saat datang ke lokasi.</p>
      </div>

      <button class="btn-finish" @click="finishPayment" :disabled="isProcessing || isExpired">
        {{ isProcessing ? 'Memverifikasi...' : (isExpired ? 'Pembayaran Kadaluarsa' : 'Saya Sudah Bayar') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const paymentId = route.params.id;

const paymentData = ref({});
const isProcessing = ref(false);
const virtualAccount = ref("8800" + Math.floor(1000000000 + Math.random() * 9000000000));

const isTransfer = computed(() => paymentData.value.metode_pembayaran?.includes('transfer'));
const isQRIS = computed(() => paymentData.value.metode_pembayaran === 'qris');

// --- LOGIKA TIMER ---
const timeLeft = ref(86400); // 1 Jam dalam detik (60 * 60)
const isExpired = ref(false);
let timerInterval = null;

const formattedTime = computed(() => {
  const h = Math.floor(timeLeft.value / 3600).toString().padStart(2, '0');
  const m = Math.floor((timeLeft.value % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft.value % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
});

function startTimer() {
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      isExpired.value = true;
      clearInterval(timerInterval);
    }
  }, 1000);
}

// --- FETCH DATA ---
onMounted(async () => {
  startTimer(); // Mulai hitung mundur

  const token = localStorage.getItem('kailku_token');
  try {
    const res = await fetch(`http://localhost:3000/payment/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) paymentData.value = await res.json();
  } catch (e) { console.error(e); }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval); // Bersihkan timer saat pindah halaman
});

// --- ACTIONS ---
async function finishPayment() {
  const token = localStorage.getItem('kailku_token');
  isProcessing.value = true;

  setTimeout(async () => {
    try {
      const res = await fetch(`http://localhost:3000/payment/${paymentId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Pembayaran Berhasil! Terima kasih.");
        router.push('/profil');
      }
    } catch (e) { alert("Gagal verifikasi"); }
  }, 1500);
}

// Helpers
function formatCurrency(val) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val || 0); }
function getBankName(method) { return method ? method.replace('transfer_', '').toUpperCase() : ''; }
function getBankLogo(method) {
  // Logika placeholder logo bank sederhana
  return 'https://via.placeholder.com/50?text=Bank';
}
function copyVA() { navigator.clipboard.writeText(virtualAccount.value); alert("Disalin!"); }
</script>

<style scoped>
.exec-container {
  min-height: 100vh;
  background: #f4f7f9;
  display: flex;
  justify-content: center;
  padding: 100px 20px;
  font-family: sans-serif;
}

.exec-card {
  background: white;
  max-width: 500px;
  width: 100%;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
}

/* Style Timer */
.timer {
  background: #fff3cd;
  color: #856404;
  padding: 10px 20px;
  border-radius: 50px;
  display: inline-block;
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.timer.expired {
  background: #fee2e2;
  color: #dc2626;
}

.amount-box h2 {
  color: #023e8a;
  font-size: 2rem;
  margin: 5px 0 20px;
}

.method-details {
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
  padding: 20px 0;
  margin: 20px 0;
  text-align: left;
}

.method-details.center {
  text-align: center;
}

.bank-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 15px;
}

.bank-logo {
  width: 50px;
}

.va-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.va-number {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.va-number h1 {
  color: #023e8a;
  font-size: 1.5rem;
  margin: 0;
  letter-spacing: 2px;
}

.btn-copy {
  color: #023e8a;
  font-weight: bold;
  cursor: pointer;
  border: none;
  background: none;
}

.instructions {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

.qr-code {
  width: 200px;
  margin: 20px auto;
  display: block;
}

.btn-finish {
  width: 100%;
  padding: 15px;
  background: #10b981;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-finish:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.btn-finish:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
