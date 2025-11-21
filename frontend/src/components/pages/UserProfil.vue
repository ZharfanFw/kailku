<template>
  <div class="profile-page-container">
    <main class="profile-content">
      <h1 class="title">Profil Saya</h1>

      <div class="profile-tabs">
        <button :class="['tab-btn', { active: activeTab === 'profile' }]" @click="activeTab = 'profile'">
          Profil Akun
        </button>
        <button :class="['tab-btn', { active: activeTab === 'orders' }]" @click="activeTab = 'orders'">
          Riwayat Pesanan
        </button>
      </div>

      <div v-if="activeTab === 'profile'" class="profile-card">
        <div class="avatar-section">
          <img :src="avatar" alt="User Avatar" class="avatar" />
          <button class="change-avatar-btn">Ganti Foto</button>
          <h2 class="user-name">{{ user.firstName }} {{ user.lastName }}</h2>
          <p class="user-email">{{ user.email }}</p>
        </div>

        <div class="info-section">
          <h3 class="section-title">Informasi Akun</h3>

          <div v-if="!isEditing" class="info-grid">
            <div class="info-field">
              <span class="label">Nama Depan</span>
              <span class="value">{{ user.firstName }}</span>
            </div>
            <div class="info-field">
              <span class="label">Nama Belakang</span>
              <span class="value">{{ user.lastName }}</span>
            </div>
            <div class="info-field">
              <span class="label">Email</span>
              <span class="value">{{ user.email }}</span>
            </div>
            <div class="info-field">
              <span class="label">No. Telepon</span>
              <span class="value">{{ user.phone || '-' }}</span>
            </div>
            <div class="info-field full-width">
              <span class="label">Alamat</span>
              <span class="value">{{ user.address || '-' }}</span>
            </div>
          </div>

          <form v-else @submit.prevent="saveEdit" class="form-grid">
            <div class="form-field">
              <label>Nama Depan</label>
              <input type="text" v-model="userEdit.firstName" />
            </div>
            <div class="form-field">
              <label>Nama Belakang</label>
              <input type="text" v-model="userEdit.lastName" />
            </div>
            <div class="form-field">
              <label>Email</label>
              <input type="email" v-model="userEdit.email" disabled style="background: #eee; cursor: not-allowed;" />
            </div>
            <div class="form-field">
              <label>No. Telepon</label>
              <input type="tel" v-model="userEdit.phone" />
            </div>
            <div class="form-field full-width">
              <label>Alamat</label>
              <textarea v-model="userEdit.address" rows="3"></textarea>
            </div>
          </form>
        </div>

        <div class="actions-section">
          <button v-if="!isEditing" @click="startEdit" class="btn btn-primary">
            Edit Profile
          </button>

          <div v-else class="edit-buttons">
            <button @click="cancelEdit" class="btn btn-secondary">
              Batal
            </button>
            <button @click="saveEdit" class="btn btn-primary">
              Simpan Perubahan
            </button>
          </div>

          <button @click="handleLogout" class="btn btn-danger">Logout</button>
        </div>
      </div>

      <div v-else-if="activeTab === 'orders'" class="orders-card">

        <div v-if="isLoadingOrders" class="loading-state">
          <div class="spinner"></div> Memuat riwayat...
        </div>

        <div v-else-if="bookings.length === 0 && orders.length === 0" class="empty-state">
          <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" width="60"
            style="opacity: 0.5; margin-bottom: 10px;">
          <p>Belum ada riwayat pesanan.</p>
          <button @click="$router.push('/memancing-section')" class="btn btn-primary"
            style="width: auto; margin-top: 10px;">
            Mulai Booking
          </button>
        </div>

        <div v-else class="history-list">

          <div v-for="b in bookings" :key="'b-' + b.id" class="history-item">
            <div class="history-icon ticket">🎫</div>
            <div class="history-info">
              <h4>{{ b.nama_tempat }}</h4>
              <p>📍 {{ b.lokasi_tempat }}</p>
              <p class="meta">{{ formatDate(b.tanggal_booking) }} • {{ b.start_time.slice(0, 5) }} - {{
                b.end_time.slice(0, 5) }}</p>
              <span :class="['status-badge', b.status]">{{ b.status }}</span>
            </div>
            <div class="history-price">
              {{ formatCurrency(calculateBookingPrice(b)) }}
            </div>
          </div>

          <div v-for="o in orders" :key="'o-' + o.id" class="history-item">
            <div class="history-icon tool">🎣</div>
            <div class="history-info">
              <h4>Pesanan Alat #{{ o.id }}</h4>
              <p class="meta">Dipesan pada {{ formatDate(o.created_at) }}</p>
              <span :class="['status-badge', o.status]">{{ o.status }}</span>
            </div>
            <div class="history-price">
              {{ formatCurrency(Number(o.total_harga) || 0) }}
            </div>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const defaultAvatar = 'https://placehold.co/120x120/EBF8FF/023e8a?text=User';

// State UI
const activeTab = ref('profile');
const isEditing = ref(false);
const isLoadingOrders = ref(false);
const avatar = ref(defaultAvatar);

// State Data User
const user = ref({
  id: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
});
const userEdit = ref(null);

// State Data Riwayat
const bookings = ref([]);
const orders = ref([]);
const PRICE_PER_HOUR = 25000;

// --- 1. FETCH PROFIL ---
async function fetchUserProfile() {
  const token = localStorage.getItem('kailku_token');
  if (!token) return router.push('/login');

  try {
    const res = await fetch('http://localhost:3000/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Session expired");

    const data = await responseHandler(res);

    // Mapping Data Backend ke Frontend
    user.value.id = data.id;
    const fullName = data.full_name || data.username;
    const names = fullName.split(' ');
    user.value.firstName = names[0];
    user.value.lastName = names.slice(1).join(' ') || '';
    user.value.email = data.email;
    user.value.phone = data.phone || '';
    user.value.address = data.address || '';

    if (data.avatar_url) avatar.value = data.avatar_url;

  } catch (e) {
    localStorage.removeItem('kailku_token');
    router.push('/login');
  }
}

// --- 2. FETCH RIWAYAT ---
async function fetchHistory() {
  const token = localStorage.getItem('kailku_token');
  isLoadingOrders.value = true;
  try {
    // Ambil Booking
    const resBook = await fetch('http://localhost:3000/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resBook.ok) bookings.value = await resBook.json();

    // Ambil Order
    const resOrder = await fetch('http://localhost:3000/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resOrder.ok) orders.value = await resOrder.json();

  } catch (e) { console.error(e); }
  finally { isLoadingOrders.value = false; }
}

// --- 3. EDIT & LOGOUT ---
function startEdit() {
  userEdit.value = { ...user.value };
  isEditing.value = true;
}

function cancelEdit() {
  userEdit.value = null;
  isEditing.value = false;
}

async function saveEdit() {
  const token = localStorage.getItem('kailku_token');
  try {
    const payload = {
      username: user.value.firstName, // Backend butuh username utk login, tp disini kita update nama
      full_name: `${userEdit.value.firstName} ${userEdit.value.lastName}`,
      email: userEdit.value.email,
      phone: userEdit.value.phone,
      address: userEdit.value.address
    };

    const res = await fetch('http://localhost:3000/auth/my-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal update");

    user.value = { ...userEdit.value };
    isEditing.value = false;
    alert("Profil berhasil diperbarui!");

  } catch (e) { alert(e.message); }
}

function handleLogout() {
  if (confirm("Keluar dari akun?")) {
    localStorage.removeItem('kailku_token');
    router.push('/login');
  }
}

// --- HELPERS ---
async function responseHandler(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
const calculateBookingPrice = (b) => {
  if (!b.start_time) return 0;
  const dur = parseInt(b.end_time.split(':')[0]) - parseInt(b.start_time.split(':')[0]);
  return dur * PRICE_PER_HOUR;
}

// --- INIT ---
onMounted(() => {
  fetchUserProfile();
  fetchHistory();
});
</script>

<style scoped>
/* ===== CSS UTAMA (SAMA SEPERTI PUNYAMU) ===== */
.profile-page-container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  padding: 100px 20px 40px;
  background-color: #f8f9fa;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #0d1a4d;
  text-align: center;
  margin-bottom: 30px;
}

/* --- TABS STYLE (BARU) --- */
.profile-tabs {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.tab-btn {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.tab-btn.active {
  background: #023e8a;
  color: white;
  border-color: #023e8a;
  box-shadow: 0 4px 12px rgba(2, 62, 138, 0.2);
}

/* --- PROFILE CARD STYLE (PUNYAMU) --- */
.profile-card,
.orders-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

/* Avatar */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.change-avatar-btn {
  background: none;
  border: none;
  color: #0077b6;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 16px;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.user-email {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Info Section */
.info-section {
  padding: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #023e8a;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.info-grid,
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.info-field,
.form-field {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.label,
label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.form-field input,
.form-field textarea {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: 0.2s;
}

.form-field input:focus {
  border-color: #0077b6;
  outline: none;
}

/* Actions */
.actions-section {
  padding: 24px 32px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .actions-section {
    flex-direction: row;
    justify-content: space-between;
  }

  .edit-buttons {
    order: 1;
    display: flex;
    gap: 10px;
  }

  .btn-danger {
    order: 0;
    width: auto;
  }
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #0d1a4d;
  color: white;
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-danger {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

/* --- HISTORY STYLE (BARU) --- */
.orders-card {
  padding: 30px;
  min-height: 400px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: 0.2s;
}

.history-item:hover {
  border-color: #023e8a;
  transform: translateX(5px);
}

.history-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.history-icon.ticket {
  background: #e0f2fe;
}

.history-icon.tool {
  background: #fef3c7;
}

.history-info h4 {
  margin: 0 0 5px;
  font-size: 1rem;
  color: #333;
}

.history-info .meta {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: #666;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #d97706;
}

.status-badge.paid {
  background: #dcfce7;
  color: #166534;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.history-price {
  margin-left: auto;
  font-weight: 700;
  color: #023e8a;
  font-size: 1.1rem;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
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
  100% {
    transform: rotate(360deg);
  }
}
</style>
