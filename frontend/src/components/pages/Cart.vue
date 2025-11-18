<template>
  <div class="cart-container">
    <!-- Header Page -->
    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image-wrapper">
          <img :src="product.image" :alt="product.name" class="product-image" />
          <span
            :class="[
              'product-badge',
              product.type === 'beli' ? 'badge-beli' : 'badge-sewa',
            ]"
          >
            {{ product.type === "beli" ? "Beli" : "Sewa" }}
          </span>
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-rating">
            <svg
              v-for="star in 5"
              :key="star"
              class="star-icon"
              :class="{ filled: star <= product.rating }"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </div>
          <p class="product-price">{{ formatCurrency(product.price) }}</p>

          <p
            :class="['product-stock', { 'out-of-stock': product.stock === 0 }]"
          >
            Stok: {{ product.stock > 0 ? product.stock : "Habis" }}
          </p>

          <button
            class="add-to-cart-button"
            @click="addToCart(product)"
            :disabled="isInCart(product.id) || product.stock === 0"
          >
            {{
              product.stock === 0
                ? "Stok Habis"
                : isInCart(product.id)
                ? "Ditambahkan"
                : "Pilih"
            }}
          </button>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="['pagination-btn', { active: currentPage === page }]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- PANEL KERANJANG: Muncul jika ada item -->
    <div class="cart-panel" v-if="cartItems.length > 0">
      <div class="cart-panel-header">
        <h3 class="cart-panel-title">Keranjang Belanja</h3>
        <button class="clear-cart-button" @click="clearCart">Hapus</button>
      </div>

      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="cart-item-image" />
          <div class="cart-item-info">
            <h4 class="cart-item-name">
              {{ item.name }}
              <span
                :class="[
                  'cart-item-badge',
                  item.type === 'beli' ? 'badge-beli' : 'badge-sewa',
                ]"
              >
                {{ item.type === "beli" ? "Beli" : "Sewa" }}
              </span>
            </h4>
            <p class="cart-item-category">{{ item.category }}</p>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" @click="decreaseQuantity(item)">
              -
            </button>
            <span class="quantity-value">{{ item.quantity }}</span>
            <button
              class="quantity-btn"
              @click="increaseQuantity(item)"
              :disabled="item.quantity >= item.maxStock || item.quantity >= 10"
            >
              +
            </button>
          </div>
          <p class="cart-item-price">
            {{ formatCurrency(item.price * item.quantity) }}
          </p>
          <button class="remove-item-button" @click="removeFromCart(item.id)">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="cart-panel-footer">
        <div class="cart-total">
          <span class="total-label">Total:</span>
          <span class="total-value">{{ formatCurrency(cartTotal) }}</span>
        </div>
        <button class="checkout-button" @click="checkout">
          Lihat Keranjang Baru
        </button>
      </div>
    </div>

    <!-- PANEL LANJUTKAN: Muncul jika keranjang kosong -->
    <div class="footer-panel-empty" v-if="cartItems.length === 0">
      <button class="continue-button" @click="goToPayment">Lanjutkan</button>
    </div>
  </div>
</template>

<script>
// --- FIX: IMPORT HEADERPAGE ---
export default {
  name: "MemancingSection",
  data() {
    // Definisi data produk dengan penambahan properti 'stock'
    return {
      currentPage: 1,
      totalPages: 9,
      cartItems: [],

      products: [
        {
          id: 1,
          name: "Kail Pancing A-1",
          category: "Kail Pancing",
          price: 5000,
          rating: 4,
          type: "beli",
          image: new URL("@/assets/img/cart/kaila-1.avif", import.meta.url)
            .href,
          stock: 5, // STOK DITAMBAHKAN
        },
        {
          id: 2,
          name: "Kail Pancing Premium",
          category: "Kail Pancing",
          price: 8000,
          rating: 5,
          type: "sewa",
          image: new URL("@/assets/img/cart/premium.avif", import.meta.url)
            .href,
          stock: 2, // STOK DITAMBAHKAN
        },
        {
          id: 3,
          name: "Joran Teleskopik 3m",
          category: "Joran",
          price: 150000,
          rating: 4,
          type: "beli",
          image: new URL(
            "@/assets/img/cart/joranteleskopik3m.avif",
            import.meta.url
          ).href,
          stock: 0, // STOK HABIS
        },
        {
          id: 4,
          name: "Reel Spinning X-Power",
          category: "Reel",
          price: 70000,
          rating: 5,
          type: "sewa",
          image: new URL("@/assets/img/cart/reel.avif", import.meta.url).href,
          stock: 3, // STOK DITAMBAHKAN
        },
        {
          id: 5,
          name: "Senar PE Maxima 0.25mm",
          category: "Senar",
          price: 50000,
          rating: 4,
          type: "sewa",
          image: new URL("@/assets/img/cart/adunfishing.avif", import.meta.url)
            .href,
          stock: 10, // STOK DITAMBAHKAN
        },
        {
          id: 6,
          name: "Senar Monofilamen K-Flex",
          category: "Senar",
          price: 35000,
          rating: 5,
          type: "beli",
          image: new URL("@/assets/img/cart/senarsuper.avif", import.meta.url)
            .href,
          stock: 7, // STOK DITAMBAHKAN
        },
        {
          id: 7,
          name: "Umpan Buatan Minnow",
          category: "Umpan",
          price: 15000,
          rating: 4,
          type: "beli",
          image: new URL("@/assets/img/cart/minnow.avif", import.meta.url).href,
          stock: 12,
        },
        {
          id: 8,
          name: "Kotak Pancing Jumbo",
          category: "Aksesoris",
          price: 45000,
          rating: 3,
          type: "beli",
          image: new URL("@/assets/img/cart/jumbo.avif", import.meta.url).href,
          stock: 4,
        },
        {
          id: 9,
          name: "Jaring Ikan Lipat",
          category: "Aksesoris",
          price: 60000,
          rating: 5,
          type: "sewa",
          image: new URL("@/assets/img/cart/jaring.avif", import.meta.url).href,
          stock: 1,
        },
        {
          id: 10,
          name: "Joran Casting Pro-Series",
          category: "Joran",
          price: 280000,
          rating: 5,
          type: "beli",
          image: new URL("@/assets/img/cart/joranpro.avif", import.meta.url)
            .href,
          stock: 6,
        },
      ],
    };
  },

  computed: {
    cartTotal() {
      return this.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },

  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    },

    addToCart(product) {
      if (product.stock <= 0) {
        alert("Stok produk ini habis!");
        return;
      }

      const existingItem = this.cartItems.find(
        (item) => item.id === product.id
      );

      // Cari produk asli di array 'products' untuk update stok
      const productInStock = this.products.find((p) => p.id === product.id);

      if (existingItem) {
        if (existingItem.quantity < productInStock.stock) {
          existingItem.quantity++;
        } else {
          alert("Stok maksimum telah tercapai!");
          return;
        }
      } else {
        this.cartItems.push({
          ...product,
          quantity: 1,
          maxStock: productInStock.stock, // Simpan stok max saat ini
        });
      }

      // Kurangi stok pada produk asli
      if (productInStock) {
        productInStock.stock--;
      }

      this.$emit("cart-updated", this.cartItems);
    },

    removeFromCart(productId) {
      const removedItem = this.cartItems.find((item) => item.id === productId);

      if (removedItem) {
        // Tambahkan kembali stok sejumlah quantity yang dihapus
        const productInStock = this.products.find((p) => p.id === productId);
        if (productInStock) {
          productInStock.stock += removedItem.quantity;
        }
      }

      this.cartItems = this.cartItems.filter((item) => item.id !== productId);
      this.$emit("cart-updated", this.cartItems);
    },

    increaseQuantity(item) {
      // Cek apakah kuantitas masih di bawah stok maksimum (maxStock) yang disimpan
      const productInStock = this.products.find((p) => p.id === item.id);

      if (item.quantity < item.maxStock && item.quantity < 10) {
        // Batas maksimal 10 atau stok max
        item.quantity++;

        // Kurangi stok pada produk asli
        if (productInStock) {
          productInStock.stock--;
        }
      }
    },

    decreaseQuantity(item) {
      const productInStock = this.products.find((p) => p.id === item.id);

      if (item.quantity > 1) {
        item.quantity--;

        // Tambahkan kembali stok pada produk asli
        if (productInStock) {
          productInStock.stock++;
        }
      } else {
        // Jika kuantitas 1 dan dikurangi, hapus dari keranjang (stok dikembalikan di removeFromCart)
        this.removeFromCart(item.id);
      }
    },

    clearCart() {
      if (confirm("Apakah Anda yakin ingin menghapus semua item?")) {
        // Kembalikan semua stok sebelum mengosongkan keranjang
        this.cartItems.forEach((item) => {
          const productInStock = this.products.find((p) => p.id === item.id);
          if (productInStock) {
            productInStock.stock += item.quantity;
          }
        });

        this.cartItems = [];
        this.$emit("cart-updated", this.cartItems);
      }
    },

    isInCart(productId) {
      return this.cartItems.some((item) => item.id === productId);
    },

    goToPage(page) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    checkout() {
      this.$emit("proceed-to-checkout", {
        items: this.cartItems,
        total: this.cartTotal,
      });
      console.log("Checkout:", this.cartItems);
    },

    // --- METHOD BARU UNTUK TOMBOL LANJUTKAN ---
    goToPayment() {
      // Pastikan router tersedia. Jika menggunakan Options API,
      // Anda akan menggunakan 'this.$router.push'.
      // Jika Anda setup router di main.js dan app.use(router),
      // this.$router seharusnya bekerja.
      // Jika tidak, Anda mungkin perlu mengimpor router di sini.
      // Untuk kesederhanaan, kita asumsikan $router tersedia.
      this.$router.push("/payment");
    },
  },
};
</script>

<style scoped>
/* Tambahkan style untuk menampilkan stok */
.product-stock {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-success); /* Warna hijau untuk stok tersedia */
  margin: 0 0 12px 0;
}

.product-stock.out-of-stock {
  color: var(--color-danger); /* Warna merah untuk stok habis */
}

/* ===== VARIABEL WARNA ===== */
/* Pastikan variabel ini didefinisikan di global style Anda atau di sini */
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
  --color-black: #000000; /* Tambahkan definisi warna hitam */
}

/* (Style lainnya tetap sama) */

/* ... sisanya dari style Anda yang tidak berubah ... */

/* ===== CONTAINER ===== */
.cart-container {
  max-width: 1280px;
  margin: 0 auto;
  /* Tingkatkan padding atas untuk memberi ruang di bawah header */
  padding: 24px; /* Ganti atau tambahkan baris di bawah */
  padding-top: 100px; /* Nilai contoh. Sesuaikan sesuai tinggi header Anda, misalnya 80px atau 100px */
  background-color: #fafafa;
  min-height: 100vh;
  /* PENTING: Tambahkan padding-bottom agar panel fixed tidak menutupi konten */
  padding-bottom: 120px;
}

/* ===== PRODUCTS GRID ===== */
.products-grid {
  /* PENYESUAIAN PENTING: Menambahkan margin-top agar konten produk tidak terpotong header */
  /* Nilai margin-top ini harus lebih besar dari tinggi header (misalnya 100px jika header tingginya sekitar 80px) */
  margin-top: 20px; /* Nilai ini mungkin perlu disesuaikan tergantung tinggi aktual HeaderPage Anda */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 0 40px 40px 40px; /* Hapus padding-top agar margin-top di atas yang mengontrol jarak */
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.product-card {
  background-color: var(--color-white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* ===== PRODUCT IMAGE ===== */
.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: var(--color-gray-100);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.cart-item-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-left: 8px;
  vertical-align: middle;
}

.badge-beli {
  background-color: #dcfce7;
  color: #166534;
}

.badge-sewa {
  background-color: #fef3c7;
  color: #92400e;
}

/* ===== PRODUCT INFO ===== */
.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0 0 8px 0;
}

.product-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 12px;
}

.star-icon {
  color: var(--color-gray-200);
  transition: color 0.2s ease;
}

.star-icon.filled {
  color: #fbbf24;
}

.product-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 12px 0;
}

.add-to-cart-button {
  width: 100%;
  padding: 10px;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-button:hover:not(:disabled) {
  background-color: #020338;
}

.add-to-cart-button:disabled {
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
  cursor: not-allowed;
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 40px;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-gray-200);
  border-radius: 8px;
  background-color: var(--color-white);
  color: var(--color-gray-600);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.pagination-btn.active {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: var(--color-white);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ===== CART PANEL ===== */
.cart-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-white);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.cart-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid var(--color-gray-100);
}

.cart-panel-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0;
}

.clear-cart-button {
  padding: 6px 16px;
  background-color: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-cart-button:hover {
  background-color: var(--color-danger);
  color: var(--color-white);
}

/* ===== CART ITEMS ===== */
.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  max-height: 240px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-gray-50);
  border-radius: 12px;
  margin-bottom: 12px;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0 0 4px 0;
}

.cart-item-category {
  font-size: 12px;
  color: var(--color-gray-600);
  margin: 0;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-white);
  border-radius: 8px;
  padding: 4px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-secondary);
  color: var(--color-white); /* Ubah agar lebih terlihat */
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background-color: #3aa8c1;
}

.quantity-btn:disabled {
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
  cursor: not-allowed;
}

.quantity-value {
  min-width: 24px;
  text-align: center;
  font-weight: 700;
  color: var(--color-gray-800);
}

.cart-item-price {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
  min-width: 100px;
  text-align: right;
}

.remove-item-button {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-item-button:hover {
  transform: scale(1.1);
}

/* ===== CART FOOTER ===== */
.cart-panel-footer {
  padding: 20px 24px;
  border-top: 2px solid var(--color-gray-100);
  background-color: var(--color-white);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-600);
}

.total-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-primary);
}

.checkout-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-secondary) 0%, #3aa8c1 100%);
  color: var(--color-black);
  border: 1px solid var(--color-secondary);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(72, 202, 228, 0.3);
}

.checkout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 213, 255, 0.4);
}

/* --- STYLE BARU UNTUK PANEL KOSONG --- */
.footer-panel-empty {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-white);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 20px 24px;
  z-index: 1000;
}

.continue-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #020338 100%);
  color: var(--color-white);
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(3, 4, 94, 0.3);
}
.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(3, 4, 94, 0.4);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  /* ... (Style responsif tetap sama) ... */
}
</style>
