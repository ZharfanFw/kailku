import { createRouter, createWebHistory } from "vue-router";

import Welcome from "@/components/pages/Welcome.vue";
import BookingSection from "@/components/pages/BookingSection.vue";
import SignUp from "@/components/pages/Sign-up.vue";
import Payment from "@/components/pages/Payment.vue";
import MethodPayment from "@/components/pages/MethodPayment.vue";
import MemancingSection from "@/components/pages/MemancingSection.vue";
import Cart from "@/components/pages/Cart.vue";
import ReviewSection from "@/components/pages/ReviewSection.vue";
import AllTampilan from "@/components/pages/AllTampilan.vue";
import Login from "@/components/pages/Login.vue";
import Kelompok from "@/components/pages/Kelompok.vue";
import UserProfil from "@/components/pages/UserProfil.vue";
import ForgotPassword from "../components/pages/ForgotPassword.vue"; // Nanti kita buat
import ResetPassword from "../components/pages/ResetPassword.vue"; // Nanti kita buat
import PaymentExecution from "../components/pages/PaymentExecution.vue"; // Nanti kita buat

const routes = [
  {
    path: "/dev",
    name: "AllTampilan",
    component: AllTampilan,
  },
  {
    path: "/",
    name: "Welcome",
    component: Welcome,
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUp,
  },
  {
    path: "/Login",
    name: "Login",
    component: Login,
  },
  {
    path: "/payment",
    name: "Payment",
    component: Payment,
  },
  {
    path: "/method-payment",
    name: "MethodPayment",
    component: MethodPayment,
  },
  {
    path: "/memancing-section",
    name: "MemancingSection",
    component: MemancingSection,
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart,
  },
  {
    path: "/booking/:id",
    name: "BookingSection",
    component: BookingSection,
    props: true,
  },
  {
    path: "/review/:id",
    name: "ReviewSection",
    component: ReviewSection,
    props: true,
  },
  {
    path: "/kelompok",
    name: "Kelompok",
    component: Kelompok,
  },
  {
    path: "/profil",
    name: "UserProfil",
    component: UserProfil,
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
  {
    path: "/payment-execution/:id",
    name: "PaymentExecution",
    component: PaymentExecution,
    meta: { requireAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
