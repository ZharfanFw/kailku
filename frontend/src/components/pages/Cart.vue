<template>
  <div class="cart-container">

    <div class="booking-section" v-if="bookings.length > 0">
      <h2 class="section-title">🎫 Tiket Booking Tempat</h2>
      <div class="booking-list">
        <div v-for="booking in bookings" :key="booking.id" class="ticket-card">
          <div class="ticket-icon">🎣</div>
          <div class="ticket-info">
            <h3>{{ booking.nama_tempat }}</h3>
            <p class="loc">📍 {{ booking.lokasi_tempat }}</p>
            <div class="ticket-meta">
              <span>📅 {{ formatDate(booking.tanggal_booking) }}</span>
              <span>⏰ {{ booking.start_time.slice(0, 5) }} - {{ booking.end_time.slice(0, 5) }}</span>
              <span>🪑 Kursi No. {{ booking.no_kursi || 'Bebas' }}</span>
            </div>
          </div>
          <div class="ticket-status">
            <span class="badge pending">Menunggu Pembayaran</span>
          </div>
        </div>
      </div>
    </div>

    <h2 class="section-title">🎣 Sewa / Beli Alat Pancing</h2>

    <div v-if="isLoadingTools" class="loading-state">
      <div class="spinner"></div> Memuat alat pancing...
    </div>

    <div v-else class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image-wrapper">
          <img :src="product.image_url || placeholderImg" :alt="product.nama" class="product-image" />

          <span class="product-badge">{{ product.kategori }}</span>
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ product.nama }}</h3>

          <p :class="['product-stock', { 'out-of-stock': product.stok === 0 }]">
            Stok: {{ product.stok > 0 ? product.stok : "Habis" }}
          </p>

          <div class="price-actions">
            <div v-if="product.harga_sewa" class="action-row">
              <span class="price-text">{{ formatCurrency(product.harga_sewa) }} <small>/sewa</small></span>
              <button class="add-btn outline" @click="addToCart(product, 'sewa')" :disabled="product.stok === 0">
                + Sewa
              </button>
            </div>

            <div v-if="product.harga_beli" class="action-row">
              <span class="price-text">{{ formatCurrency(product.harga_beli) }} <small>/beli</small></span>
              <button class="add-btn" @click="addToCart(product, 'beli')" :disabled="product.stok === 0">
                + Beli
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <transition name="slide-up">
      <div class="cart-panel" v-if="cartItems.length > 0">
        <div class="cart-panel-header">
          <h3 class="cart-panel-title">Keranjang Belanja ({{ cartItems.length }})</h3>
          <button class="clear-cart-button" @click="clearCart">Hapus Semua</button>
        </div>

        <div class="cart-items">
          <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
            <img :src="item.image_url || placeholderImg" class="cart-item-image" />

            <div class="cart-item-info">
              <h4 class="cart-item-name">
                {{ item.nama }}
                <span :class="['cart-item-badge', item.tipe === 'beli' ? 'badge-beli' : 'badge-sewa']">
                  {{ item.tipe === "beli" ? "Beli" : "Sewa" }}
                </span>
              </h4>
              <p class="cart-item-category">{{ formatCurrency(item.harga) }} x {{ item.jumlah }}</p>
            </div>

            <div class="cart-item-quantity">
              <button class="quantity-btn" @click="item.jumlah > 1 ? item.jumlah-- : removeItem(index)">-</button>
              <span class="quantity-value">{{ item.jumlah }}</span>
              <button class="quantity-btn" @click="item.jumlah++" :disabled="item.jumlah >= item.stok">+</button>
            </div>

            <p class="cart-item-price">
              {{ formatCurrency(item.harga * item.jumlah) }}
            </p>

            <button class="remove-item-button" @click="removeItem(index)">✕</button>
          </div>
        </div>

        <div class="cart-panel-footer">
          <div class="cart-total">
            <span class="total-label">Total:</span>
            <span class="total-value">{{ formatCurrency(grandTotal) }}</span>
          </div>
          <button class="checkout-button" @click="handleCheckout" :disabled="isProcessing">
            {{ isProcessing ? 'Memproses...' : 'Konfirmasi Pesanan' }}
          </button>
        </div>
      </div>
    </transition>

    <div class="footer-panel-empty" v-if="cartItems.length === 0 && bookings.length > 0">
      <div class="cart-total">
        <span>Total Booking:</span>
        <span class="total-value">Bayar di Kasir</span>
      </div>
      <button class="continue-button" @click="router.push('/payment')">Selesai (Bayar Nanti)</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const placeholderImg = 'https://via.placeholder.com/150?text=Alat';

// --- STATE ---
const bookings = ref([]);
const products = ref([]);
const cartItems = ref([]);
const isLoadingTools = ref(true);
const isProcessing = ref(false);

// --- 1. FETCH DATA ---
onMounted(async () => {
  const token = localStorage.getItem('kailku_token');
  if (!token) {
    alert("Silakan login terlebih dahulu");
    router.push('/login');
    return;
  }

  // A. Fetch Booking (Tiket)
  try {
    const resBook = await fetch('http://localhost:3000/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resBook.ok) {
      const data = await resBook.json();
      // Ambil booking yang statusnya pending (baru dibuat)
      // Batasi 5 terakhir biar ga penuh
      bookings.value = data.filter(b => b.status === 'pending').slice(0, 5);
    }
  } catch (e) { console.error(e); }

  // B. Fetch Alat Pancing (Produk)
  try {
    const resTools = await fetch('http://localhost:3000/alat_pancing');
    if (resTools.ok) {
      products.value = await resTools.json();
    }
  } catch (e) { console.error(e); }
  finally { isLoadingTools.value = false; }
});

// --- 2. CART LOGIC ---
function addToCart(product, tipe) {
  // Cek stok di frontend (stok asli dijaga backend juga)
  if (product.stok <= 0) return alert("Stok habis!");

  const existing = cartItems.value.find(i => i.id === product.id && i.tipe === tipe);

  if (existing) {
    if (existing.jumlah < product.stok) existing.jumlah++;
    else alert("Stok tidak cukup!");
  } else {
    cartItems.value.push({
      id: product.id,
      nama: product.nama,
      image_url: product.image_url,
      tipe: tipe,
      harga: tipe === 'sewa' ? product.harga_sewa : product.harga_beli,
      jumlah: 1,
      stok: product.stok
    });
  }
}

function removeItem(index) {
  cartItems.value.splice(index, 1);
}

function clearCart() {
  if (confirm("Hapus semua alat dari keranjang?")) {
    cartItems.value = [];
  }
}

const grandTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
});

// --- 3. CHECKOUT ---
async function handleCheckout() {
  const token = localStorage.getItem('kailku_token');
  isProcessing.value = true;

  try {
    const payload = {
      items: cartItems.value.map(item => ({
        id: item.id,
        tipe: item.tipe,
        jumlah: item.jumlah
      }))
    };

    const res = await fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal membuat pesanan");

    alert("Pesanan Alat Berhasil! Silakan bayar di kasir.");
    cartItems.value = []; // Kosongkan cart
    router.push('/payment'); // Pindah ke profil

  } catch (err) {
    alert(err.message);
  } finally {
    isProcessing.value = false;
  }
}

// --- HELPERS ---
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
</script>

<style scoped>
/* Gunakan Style Asli Kamu + Sedikit Tambahan untuk Ticket */

:root {
  --color-primary: #03045e;
  --color-secondary: #48cae4;
  --color-accent: #ffa200;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-600: #4b5563;
  --color-gray-800: #1f2937;
}

.cart-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 20px 140px;
  /* Padding bawah besar buat panel */
  background-color: #fafafa;
  min-height: 100vh;
}

.section-title {
  font-size: 1.5rem;
  color: var(--color-gray-800);
  margin-bottom: 20px;
  font-weight: 800;
}

/* --- STYLE TIKET (Baru) --- */
.booking-section {
  margin-bottom: 40px;
}

.booking-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.ticket-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  border: 1px solid #e0e7ff;
  border-left: 5px solid #023e8a;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ticket-icon {
  font-size: 2rem;
}

.ticket-info h3 {
  margin: 0 0 5px;
  font-size: 1rem;
  color: #023e8a;
}

.loc {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 5px;
}

.ticket-meta {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badge.pending {
  background: #fff3cd;
  color: #d97706;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}


/* --- STYLE PRODUK (Modifikasi dari punyamu) --- */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: 0.3s;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-image-wrapper {
  height: 180px;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #023e8a;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 1rem;
  margin: 0 0 5px;
  color: #333;
  font-weight: 700;
  height: 2.4em;
  overflow: hidden;
}

.product-stock {
  font-size: 0.8rem;
  color: #10b981;
  margin-bottom: 10px;
  font-weight: 600;
}

.product-stock.out-of-stock {
  color: #ef4444;
}

.price-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #555;
}

.add-btn {
  background: #023e8a;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.add-btn.outline {
  background: transparent;
  color: #023e8a;
  border: 1px solid #023e8a;
}

.add-btn:hover {
  opacity: 0.8;
}

.add-btn:disabled {
  background: #ccc;
  border-color: #ccc;
  color: white;
  cursor: not-allowed;
}


/* --- CART PANEL --- */
.cart-panel,
.footer-panel-empty {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  z-index: 1000;
  padding: 20px;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
}

.cart-panel-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.clear-cart-button {
  color: #ef4444;
  background: none;
  border: 1px solid #ef4444;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.cart-items {
  overflow-y: auto;
  flex: 1;
  margin-bottom: 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f9f9f9;
}

.cart-item-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  margin: 0;
  font-size: 0.9rem;
}

.cart-item-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 5px;
}

.badge-beli {
  background: #dcfce7;
  color: #166534;
}

.badge-sewa {
  background: #fef3c7;
  color: #92400e;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 25px;
  height: 25px;
  background: #e0f2fe;
  border: none;
  border-radius: 4px;
  color: #023e8a;
  font-weight: bold;
  cursor: pointer;
}

.remove-item-button {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1.2rem;
}

.remove-item-button:hover {
  color: #ef4444;
}

.cart-panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.total-label {
  font-size: 0.9rem;
  color: #666;
}

.total-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #023e8a;
  display: block;
}

.checkout-button,
.continue-button {
  background: #023e8a;
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

.checkout-button:disabled {
  background: #ccc;
}

/* Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Responsive */
@media (min-width: 768px) {

  .cart-panel,
  .footer-panel-empty {
    max-width: 500px;
    left: auto;
    right: 20px;
    bottom: 20px;
    border-radius: 16px;
  }
}
</style>
