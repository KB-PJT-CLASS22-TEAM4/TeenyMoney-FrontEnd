import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomePage from '@/pages/HomePage.vue';
import LoginView from '@/pages/Login.vue';
import Signup from '@/pages/Signup.vue';
import LinkCodeInput from '@/pages/Child/LinkCodeInput.vue';
import LinkConfirm from '@/pages/Child/LinkConfirm.vue';
import LinkComplete from '@/pages/Child/LinkComplete.vue';
import ChildHome from '@/pages/Child/ChildHome.vue';
import ChildTransaction from '@/pages/Child/ChildTransaction.vue';
import ChildNotification from '@/pages/Child/ChildNotification.vue';
import QRScan from '@/pages/Child/Payment/QRscan.vue';
import QRcode from '@/pages/Child/Payment/QRcode.vue';
import PayInfo from '@/pages/Child/Payment/PayInfo.vue';
import PayPassword from '@/pages/Child/Payment/PayPassword.vue';
import PayProcessing from '@/pages/Child/Payment/PayProcessing.vue';
import PayDone from '@/pages/Child/Payment/PayDone.vue';
import PasswordSetting from '@/pages/Child/PasswordSetting.vue';
import PasswordSettingDone from '@/pages/Child/PasswordSettingDone.vue';
import PasswordChange from '@/pages/Child/PasswordChange.vue';
import ChildReport from '@/pages/Child/ChildReport.vue';
import ProductConfirm from '@/pages/Child/Finance/ProductsConfirm.vue';
import Request from '@/pages/Child/TodayAllow/Request.vue';
import ChildMyPage from '@/pages/Child/ChildMyPage.vue';
import Confirm from '@/pages/Child/TodayAllow/Confirm.vue';
import NewProducts from '@/pages/Child/Finance/NewProducts.vue';
import MyProducts from '@/pages/Child/Finance/MyProducts.vue';
import ProductsJoin from '@/pages/Child/Finance/ProductsJoin.vue';
import ProductsCancel from '@/pages/Child/Finance/ProductsCancel.vue';
import ParentsHome from '@/pages/Parents/Home.vue';
import Transaction from '@/pages/Parents/Transaction.vue';
import ChildList from '@/pages/Parents/ChildList.vue';
import LinkCode from '@/pages/Parents/LinkCode.vue';
import Charge from '@/pages/Parents/Charge.vue';
import AutoCharge from '@/pages/Parents/AutoCharge.vue';
import Charging from '@/pages/Parents/Charging.vue';
import ChargeComplete from '@/pages/Parents/ChargeComplete.vue';
import Mypage from '@/pages/Parents/Mypage.vue';
import HarmfulCategory from '@/pages/Parents/HarmfulCategory.vue';
import PlaceList from '@/pages/Parents/PlaceList.vue';

// 로그인 없이 접근 가능한 페이지
const publicPages = ['/', '/login', '/signup']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: Signup },
    { path: '/child/link', name: 'child-link', component: LinkCodeInput },
    { path: '/child/linkconfirm', name: 'child-link-confirm', component: LinkConfirm },
    { path: '/child/linkcomplete', name: 'child-link-complete', component: LinkComplete },
    { path: '/parents/home', name: 'parents-home', component: ParentsHome },
    { path: '/parents/transaction', name: 'parents-transaction', component: Transaction },
    { path: '/parents/childlist', name: 'parents-child-list', component: ChildList },
    { path: '/parents/linkcode', name: 'parents-link-code', component: LinkCode },
    { path: '/parents/linkcomplete', name: 'parents-link-complete', component: LinkComplete },
    { path: '/child/home', name: 'child-home', component: ChildHome },
    { path: '/parents/charge', name: 'charge', component: Charge },
    { path: '/parents/charge/auto', name: 'auto-charge', component: AutoCharge },
    { path: '/parents/charge/charging', name: 'charging', component: Charging },
    { path: '/parents/charge/complete', name: 'charge-complete', component: ChargeComplete },
    { path: '/child/transaction', name: 'child-transaction', component: ChildTransaction },
    { path: '/child/notification', name: 'child-notification', component: ChildNotification },
    { path: '/child/payment/scan', name: 'qr-scan', component: QRScan },
    { path: '/child/payment/qrcode', name: 'qr-code', component: QRcode },
    { path: '/child/payment/info', name: 'pay-info', component: PayInfo },
    { path: '/child/payment/password', name: 'pay-password', component: PayPassword },
    { path: '/child/payment/processing', name: 'pay-processing', component: PayProcessing },
    { path: '/child/payment/done', name: 'pay-done', component: PayDone },
    { path: '/child/mypage', name: 'child-mypage', component: ChildMyPage },
    { path: '/parents/mypage', name: 'parents-mypage', component: Mypage },
    { path: '/child/passwordsetting', name: 'child-password-setting', component: PasswordSetting },
    { path: '/child/passwordsetting/done', name: 'child-password-setting-done', component: PasswordSettingDone },
    { path: '/child/passwordchange', name: 'child-password-change', component: PasswordChange },
    { path: '/child/report', name: 'child-report', component: ChildReport },
    { path: '/child/finance/confirm', name: 'product-confirm', component: ProductConfirm },
    { path: '/parents/harmfulcategory', name: 'parents-harmful-category', component: HarmfulCategory },
    { path: '/parents/place-list', name: 'parents-place-list', component: PlaceList },
    { path: '/child/finance/newproducts', name: 'child-finance-newproducts', component: NewProducts },
    { path: '/child/todayallow/request', name: 'child-todayallow-request', component: Request },
    { path: '/child/todayallow/confirm', name: 'child-todayallow-confirm', component: Confirm },
    { path: '/child/finance/myproducts', name: 'child-finance-myproducts', component: MyProducts },
    { path: '/child/finance/join', name: 'child-finance-join', component: ProductsJoin },
    { path: '/child/finance/cancel', name: 'product-cancel', component: ProductsCancel },
  ],
})

// 네비게이션 가드
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isPublic = publicPages.includes(to.path)

  // 비로그인 상태에서 보호된 페이지 접근 시 → 로그인으로
  if (!isPublic && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 이미 로그인된 상태에서 로그인/회원가입 접근 시 → 역할에 따라 홈으로
  if (isPublic && to.path !== '/' && authStore.isAuthenticated) {
    const role = authStore.role
    if (role === 'CHILD') {
      next('/child/home')
    } else {
      next('/parents/home')
    }
    return
  }

  next()
})

export default router