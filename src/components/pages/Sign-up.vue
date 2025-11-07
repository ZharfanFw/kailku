<script setup>
import HeaderPage from "@/components/layouts/HeaderPage.vue";
</script>

<template>
  <div class="signup-page">
    <HeaderPage />
    <!-- Sign Up Form -->
    <div class="signup-container">
      <div class="signup-card">
        <!-- Decorative circles -->
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
        <div class="circle circle-5"></div>
        <div class="signup-content">
          <h2 class="signup-title">Sign Up</h2>
          <p class="signup-subtitle">
            Sebelum booking atau membeli peralatan atau sewa, Yuk!! Daftar
            akunnya terlebih dahulu!
          </p>

          <div class="form">
            <!-- First Name & Last Name -->
            <div class="form-row">
              <div class="form-group">
                <input
                  v-model="formData.firstName"
                  type="text"
                  placeholder="First Name"
                  :class="['form-input', { 'input-error': errors.firstName }]"
                  @input="clearError('firstName')"
                />
                <p v-if="errors.firstName" class="error-message">
                  {{ errors.firstName }}
                </p>
              </div>
              <div class="form-group">
                <input
                  v-model="formData.lastName"
                  type="text"
                  placeholder="Last Name"
                  :class="['form-input', { 'input-error': errors.lastName }]"
                  @input="clearError('lastName')"
                />
                <p v-if="errors.lastName" class="error-message">
                  {{ errors.lastName }}
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <input
                v-model="formData.email"
                type="email"
                placeholder="Email"
                :class="['form-input', { 'input-error': errors.email }]"
                @input="clearError('email')"
              />
              <p v-if="errors.email" class="error-message">
                {{ errors.email }}
              </p>
            </div>

            <!-- Password -->
            <div class="form-group">
              <div class="input-wrapper">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  :class="['form-input', { 'input-error': errors.password }]"
                  @input="clearError('password')"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="toggle-password"
                >
                  <svg
                    v-if="showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="error-message">
                {{ errors.password }}
              </p>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <div class="input-wrapper">
                <input
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm Password"
                  :class="[
                    'form-input',
                    { 'input-error': errors.confirmPassword },
                  ]"
                  @input="clearError('confirmPassword')"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="toggle-password"
                >
                  <svg
                    v-if="showConfirmPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="error-message">
                {{ errors.confirmPassword }}
              </p>
            </div>

            <!-- Submit Button -->
            <button @click="handleSubmit" class="btn-submit">Sign Up</button>
          </div>

          <p class="signin-text">
            Already have an account?
            <span class="signin-link">Sign In</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SignUp",
  data() {
    return {
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      showPassword: false,
      showConfirmPassword: false,
      errors: {},
    };
  },
  methods: {
    clearError(field) {
      if (this.errors[field]) {
        this.errors = {
          ...this.errors,
          [field]: "",
        };
      }
    },
    validateForm() {
      const newErrors = {};

      if (!this.formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }

      if (!this.formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }

      if (!this.formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(this.formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!this.formData.password) {
        newErrors.password = "Password is required";
      } else if (this.formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!this.formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (this.formData.password !== this.formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      return newErrors;
    },
    handleSubmit() {
      const newErrors = this.validateForm();

      if (Object.keys(newErrors).length === 0) {
        console.log("Form submitted:", this.formData);
        alert(
          "Sign up successful!\n\nData:\n" +
            JSON.stringify(this.formData, null, 2)
        );

        // Reset form
        this.formData = {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        };
        this.errors = {};
      } else {
        this.errors = newErrors;
      }
    },
  },
};
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-black);
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #6c757d;
  transition: color var(--transition);
}

.nav-link:hover {
  color: var(--color-black);
}

.btn-primary {
  background: var(--color-primary-deep);
  color: var(--color-white);
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background var(--transition);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

/* Signup Container */
.signup-container {
  width: 100%;
  max-width: 480px;
  margin-top: 5rem;
}

.signup-card {
  background: var(--color-white);
  border-radius: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
}

/* Decorative Circles */
.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.circle-1 {
  width: 96px;
  height: 96px;
  background: var(--color-accent-pale);
  top: -32px;
  left: -32px;
}

.circle-2 {
  width: 64px;
  height: 64px;
  background: var(--color-accent-light);
  top: 48px;
  right: 48px;
}

.circle-3 {
  width: 48px;
  height: 48px;
  background: var(--color-accent-pale);
  bottom: -24px;
  left: 32px;
}

.circle-4 {
  width: 80px;
  height: 80px;
  background: var(--color-accent-light);
  bottom: -16px;
  left: 80px;
}

.circle-5 {
  width: 128px;
  height: 128px;
  background: var(--color-accent-pale);
  bottom: 48px;
  right: -24px;
}

.signup-content {
  position: relative;
  z-index: 1;
}

.signup-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.75rem;
  color: var(--color-black);
}

.signup-subtitle {
  text-align: center;
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--color-white);
  border: 2px solid transparent;
  outline: none;
  transition: all var(--transition);
}

.form-input::placeholder {
  color: var(--color-white);
  opacity: 0.9;
}

.form-input:focus {
  border-color: var(--color-primary-dark);
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1);
}

.input-error {
  border-color: #dc3545 !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  margin-left: 1rem;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
}

.btn-submit {
  width: 100%;
  padding: 0.875rem;
  background: var(--color-primary-deep);
  color: var(--color-white);
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background var(--transition);
}

.btn-submit:hover {
  background: var(--color-primary-dark);
}

.signin-text {
  text-align: center;
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 1.5rem;
}

.signin-link {
  color: var(--color-primary-deep);
  font-weight: 600;
  cursor: pointer;
}

.signin-link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .signup-card {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .signup-title {
    font-size: 2rem;
  }

  .nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.875rem;
  }

  .btn-primary {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
