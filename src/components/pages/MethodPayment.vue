<template>
  <div class="payment-method-container">
    <div class="payment-card">
      <!-- Header -->
      <div class="payment-header">
        <h2 class="header-title">Metode Pembayaran</h2>
      </div>

      <!-- Payment Method Tabs -->
      <div class="payment-tabs">
        <button
          v-for="tab in paymentTabs"
          :key="tab.id"
          :class="['tab-button', { active: selectedTab === tab.id }]"
          @click="selectTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Payment Methods List -->
      <div class="payment-methods-list">
        <h3 class="list-title">{{ getCurrentTabTitle() }}</h3>

        <div class="methods-container">
          <label
            v-for="method in filteredMethods"
            :key="method.id"
            :class="['method-item', { disabled: method.disabled }]"
          >
            <input
              type="radio"
              name="payment-method"
              :value="method.id"
              v-model="selectedMethod"
              :disabled="method.disabled"
              class="method-radio"
            />
            <div class="method-content">
              <div class="method-icon">
                <img :src="method.icon" :alt="method.name" />
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

      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-row">
          <span class="summary-label">Subtotal Pesanan</span>
          <span class="summary-value">{{
            formatCurrency(orderSummary.subtotal)
          }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Subtotal Pengiriman</span>
          <span class="summary-value">{{
            formatCurrency(orderSummary.shipping)
          }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">
            Biaya Layanan
            <span class="info-icon" title="Biaya layanan platform">ⓘ</span>
          </span>
          <span class="summary-value">{{
            formatCurrency(orderSummary.serviceFee)
          }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row total-row">
          <span class="summary-label-total">Total Pembayaran</span>
          <span class="summary-value-total">{{
            formatCurrency(totalPayment)
          }}</span>
        </div>
      </div>

      <!-- Action Button -->
      <button
        class="submit-button"
        :disabled="!selectedMethod"
        @click="handleSubmitPayment"
      >
        Buat Pesanan
      </button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
const router = useRouter();

export default {
  name: "MethodPayment",

  data() {
    return {
      selectedTab: "transfer",
      selectedMethod: null,

      paymentTabs: [
        { id: "transfer", label: "Transfer Bank" },
        { id: "cod", label: "COD" },
        { id: "qris", label: "QRIS" },
      ],

      paymentMethods: [
        // Transfer Bank
        {
          id: "seabank",
          name: "SeaBank",
          type: "transfer",
          icon: new URL(
            "@/assets/img/method-payment/seabank.avif",
            import.meta.url
          ).href,
          disabled: false,
        },
        {
          id: "bca",
          name: "Bank BCA",
          type: "transfer",
          icon: new URL("@/assets/img/method-payment/bca.avif", import.meta.url)
            .href,
          disabled: false,
        },
        {
          id: "mandiri",
          name: "Bank Mandiri",
          type: "transfer",
          icon: new URL(
            "@/assets/img/method-payment/mandiri.avif",
            import.meta.url
          ).href,
          disabled: false,
        },
        {
          id: "bni",
          name: "Bank BNI",
          type: "transfer",
          icon: new URL("@/assets/img/method-payment/bni.avif", import.meta.url)
            .href,
          disabled: false,
        },
        {
          id: "bri",
          name: "Bank BRI",
          type: "transfer",
          icon: new URL("@/assets/img/method-payment/bri.avif", import.meta.url)
            .href,
          disabled: false,
        },
        {
          id: "bsi",
          name: "Bank Syariah Indonesia (BSI)",
          type: "transfer",
          icon: new URL("@/assets/img/method-payment/bsi.avif", import.meta.url)
            .href,
          disabled: false,
        },
        {
          id: "permata",
          name: "Bank Permata",
          type: "transfer",
          icon: new URL(
            "@/assets/img/method-payment/permata.avif",
            import.meta.url
          ).href,
          disabled: false,
        },
        {
          id: "cimb",
          name: "Bank CIMB Niaga",
          type: "transfer",
          icon: new URL(
            "@/assets/img/method-payment/cimb.avif",
            import.meta.url
          ).href,
          disabled: false,
        },
        {
          id: "other-bank",
          name: "Bank lainnya",
          type: "transfer",
          description: "Menerima transfer dari semua bank",
          icon: new URL(
            "@/assets/img/method-payment/banklainnya.avif",
            import.meta.url
          ).href,
          disabled: false,
        },
        // COD
        {
          id: "cod-jne",
          name: "Bayar di Tempat (COD)",
          type: "cod",
          description: "Bayar saat barang diterima",
          icon: new URL("@/assets/img/method-payment/cod.avif", import.meta.url)
            .href,
          disabled: false,
        },
        // QRIS
        {
          id: "qris",
          name: "QRIS",
          type: "qris",
          description: "Scan QR untuk pembayaran instant",
          icon: new URL(
            "@/assets/img/method-payment/qris.avif",
            import.meta.url
          ).href,
          badge: "Instant",
          disabled: false,
        },
      ],

      orderSummary: {
        subtotal: 55000,
        shipping: 5000,
        serviceFee: 2500,
      },
    };
  },

  computed: {
    filteredMethods() {
      return this.paymentMethods.filter(
        (method) => method.type === this.selectedTab
      );
    },

    totalPayment() {
      return (
        this.orderSummary.subtotal +
        this.orderSummary.shipping +
        this.orderSummary.serviceFee
      );
    },
  },

  methods: {
    selectTab(tabId) {
      this.selectedTab = tabId;
      this.selectedMethod = null;
    },

    getCurrentTabTitle() {
      const tabTitles = {
        transfer: "Pilih Bank",
        cod: "Bayar di Tempat",
        qris: "Pembayaran QRIS",
      };
      return tabTitles[this.selectedTab] || "Pilih Metode Pembayaran";
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    },

    handleSubmitPayment() {
      if (!this.selectedMethod) {
        alert("Silakan pilih metode pembayaran terlebih dahulu");
        return;
      }

      const selectedMethodData = this.paymentMethods.find(
        (method) => method.id === this.selectedMethod
      );

      this.$emit("payment-selected", {
        method: selectedMethodData,
        total: this.totalPayment,
        summary: this.orderSummary,
      });

      console.log("Payment method selected:", selectedMethodData);
      console.log("Total payment:", this.totalPayment);
    },
  },
};
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
  --color-text-secondary: #666666;
  --color-success: #10b981;
  --color-error: #ef4444;
}

/* ===== CONTAINER ===== */
.payment-method-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.payment-card {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ===== HEADER ===== */
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

/* ===== PAYMENT TABS ===== */
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

/* ===== PAYMENT METHODS LIST ===== */
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

/* ===== METHOD ITEM ===== */
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

/* ===== ORDER SUMMARY ===== */
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

.info-icon {
  display: inline-block;
  margin-left: 4px;
  color: var(--color-text-secondary);
  cursor: help;
  font-size: 12px;
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

/* ===== SUBMIT BUTTON ===== */
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .payment-method-container {
    padding: 12px;
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
