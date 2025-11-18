<template>
  <div class="profile-page-container">
    <main class="profile-content">
      <h1 class="title">Profil Saya</h1>

      <div class="profile-card">
        <!-- Bagian Avatar -->
        <div class="avatar-section">
          <img :src="avatar" alt="User Avatar" class="avatar" />
          <button class="change-avatar-btn">Ganti Foto</button>
          <h2 class="user-name">{{ user.firstName }} {{ user.lastName }}</h2>
          <p class="user-email">{{ user.email }}</p>
        </div>

        <!-- Bagian Info (bisa diedit) -->
        <div class="info-section">
          <h3 class="section-title">Informasi Akun</h3>

          <!-- Tampilan Teks (v-if="!isEditing") -->
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
            <div class="info-field full-width">
              <span class="label">Alamat</span>
              <span class="value">{{ user.address }}</span>
            </div>
          </div>

          <!-- Tampilan Form (v-else) -->
          <form v-else @submit.prevent="saveEdit" class="form-grid">
            <div class="form-field">
              <label for="firstName">Nama Depan</label>
              <input type="text" id="firstName" v-model="userEdit.firstName" />
            </div>
            <div class="form-field">
              <label for="lastName">Nama Belakang</label>
              <input type="text" id="lastName" v-model="userEdit.lastName" />
            </div>
            <div class="form-field">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="userEdit.email" />
            </div>
            <div class="form-field">
              <label for="phone">No. Telepon</label>
              <input type="tel" id="phone" v-model="userEdit.phone" />
            </div>
            <div class="form-field full-width">
              <label for="address">Alamat</label>
              <textarea id="address" v-model="userEdit.address" rows="3"></textarea>
            </div>
          </form>
        </div>

        <!-- Bagian Tombol Aksi -->
        <div class="actions-section">
          <!-- Tombol saat mode non-edit -->
          <button v-if="!isEditing" @click="startEdit" class="btn btn-primary">
            Edit Profile
          </button>
          
          <!-- Tombol saat mode edit -->
          <div v-else class="edit-buttons">
            <button @click="cancelEdit" class="btn btn-secondary">
              Batal
            </button>
            <button @click="saveEdit" class="btn btn-primary">
              Simpan Perubahan
            </button>
          </div>

          <!-- Tombol Logout (selalu ada) -->
          <button @click="handleLogout" class="btn btn-danger">Logout</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
// Placeholder avatar
const defaultAvatar = 'https://placehold.co/120x120/EBF8FF/023e8a?text=User';

export default {
  name: "UserProfile",
  
  data() {
    return {
      isEditing: false,
      isLoading: true, // Tambah status loading
      avatar: defaultAvatar,
      
      // Data user default (kosong dulu)
      user: {
        id: null,
        firstName: "",
        lastName: "", 
        email: "",
        phone: "", // Backend kita belum simpan phone & address, jadi ini nanti null
        address: "",
      },
      
      // Salinan data untuk edit
      userEdit: null, 
    };
  },

  // === 1. OTOMATIS JALAN SAAT HALAMAN DIBUKA ===
  created() {
    this.fetchUserProfile();
  },

  methods: {
    // === 2. AMBIL DATA DARI BACKEND ===
    async fetchUserProfile() {
      const token = localStorage.getItem('kailku_token');

      // Kalau tidak ada token, tendang ke Login
      if (!token) {
        alert("Anda belum login!");
        this.$router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // <-- KUNCI MASUK (TIKET)
          }
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil profil");
        }

        const data = await response.json();
        
        // Update data di layar dengan data dari backend
        // Karena backend cuma simpan 'username', kita taruh di firstName dulu
        this.user.id = data.id;
        this.user.firstName = data.username; 
        this.user.email = data.email;
        
        // (Opsional: Jika backend kirim phone/address nanti, update di sini)

      } catch (err) {
        console.error(err);
        alert("Sesi habis, silakan login ulang.");
        localStorage.removeItem('kailku_token');
        this.$router.push('/login');
      } finally {
        this.isLoading = false;
      }
    },

    // === 3. UPDATE PROFIL (PATCH) ===
    async saveEdit() {
      const token = localStorage.getItem('kailku_token');
      
      try {
        const response = await fetch('http://localhost:3000/auth/my-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            username: this.userEdit.firstName, // Backend pake 'username'
            email: this.userEdit.email
          })
        });

        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || "Gagal update profil");
        }

        // Sukses update di backend, update di frontend
        this.user = { ...this.userEdit };
        this.isEditing = false;
        alert("Profil berhasil diperbarui!");

      } catch (err) {
        alert(err.message);
      }
    },

    startEdit() {
      this.userEdit = { ...this.user };
      this.isEditing = true;
    },

    cancelEdit() {
      this.userEdit = null;
      this.isEditing = false;
    },

    // === 4. LOGOUT ===
    handleLogout() {
      // Hapus tiket
      localStorage.removeItem('kailku_token');
      // Pindah ke login
      this.$router.push('/login');
    }
  },
};
</script>
<style scoped>
.profile-page-container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  padding: 40px 20px;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #0d1a4d; /* Biru Navy (sesuai tema) */
  text-align: center;
  margin-bottom: 24px;
}

.profile-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* --- Bagian Avatar --- */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: #f9fafb; /* Latar belakang header card */
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
  color: #0077b6; /* Biru cerah */
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

/* --- Bagian Info --- */
.info-section {
  padding: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #023e8a; /* Biru tema */
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* Tampilan Teks Statis */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.info-field {
  display: flex;
  flex-direction: column;
}

.info-field.full-width {
  grid-column: 1 / -1;
}

.label {
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

/* Tampilan Form Edit */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-field input,
.form-field textarea {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #0077b6;
  box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.2);
}

.form-field textarea {
  resize: vertical;
}

/* --- Bagian Tombol Aksi --- */
.actions-section {
  padding: 24px 32px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  font-family: 'Poppins', sans-serif;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

@media (min-width: 640px) {
  /* Di desktop, tombol tidak perlu full width */
  .btn {
    width: auto;
  }
  .actions-section {
    flex-direction: row;
    justify-content: space-between;
  }
  .edit-buttons {
    order: 1; /* Tombol edit/simpan di kanan */
  }
  .btn-danger {
    order: 0; /* Tombol logout di kiri */
  }
}

.btn-primary {
  background-color: #0d1a4d;
  color: white;
}
.btn-primary:hover {
  background-color: #070f2b;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}
.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-danger {
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}
.btn-danger:hover {
  background-color: #e74c3c;
  color: white;
}
</style>
