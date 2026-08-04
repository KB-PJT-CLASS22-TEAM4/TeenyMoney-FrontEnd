import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import LoginView from '@/pages/Login.vue';
import Signup from '@/pages/Signup.vue';
// 자녀 연동 코드 입력 페이지
import LinkCodeInput from '@/pages/Child/LinkCodeInput.vue';
// 자녀 연동 코드 보호자 확인 페이지
import LinkConfirm from '@/pages/Child/LinkConfirm.vue';
// 자녀 코드 연동 완료 페이지
import LinkComplete from '@/pages/Child/LinkComplete.vue' ;
// 자녀 홈 화면
import ChildHome from '@/pages/Child/ChildHome.vue';
// 자녀 거래내역 조회
import ChildTransaction from '@/pages/Child/ChildTransaction.vue';
// 자녀 알림페이지
import ChildNotification from '@/pages/Child/ChildNotification.vue';
// QR스캔
import QRScan from '@/pages/Child/Payment/QRscan.vue';
// QR코드 보여주기
import QRcode from '@/pages/Child/Payment/QRcode.vue';
// 결제 정보
import PayInfo from '@/pages/Child/Payment/PayInfo.vue';
// 결제 비밀번호 입력
import PayPassword from '@/pages/Child/Payment/PayPassword.vue';
// 결제 진행중
import PayProcessing from '@/pages/Child/Payment/PayProcessing.vue';
// 결제 완료
import PayDone from '@/pages/Child/Payment/PayDone.vue';

import ParentsHome from '@/pages/Parents/Home.vue';
import Transaction from '@/pages/Parents/Transaction.vue';
import ChildList from '@/pages/Parents/ChildList.vue';
import LinkCode from '@/pages/Parents/LinkCode.vue';

import Charge from '@/pages/Parents/Charge.vue'
import AutoCharge from '@/pages/Parents/AutoCharge.vue'
import Charging from '@/pages/Parents/Charging.vue'
import ChargeComplete from '@/pages/Parents/ChargeComplete.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    // 로그인 페이지
    {
    path: '/login',
    name: 'login',
    component: LoginView
    },
    // 회원가입 페이지
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
    },
    // 자녀 연동 코드 입력 페이지
    {
      path: '/child/link',
      name: 'child-link',
      component: LinkCodeInput,
    },
    // 자녀 연동 코드 보호자 확인 페이지
    {
      path: '/child/linkconfirm',
      name: 'child-link-confirm',
      component: LinkConfirm,
    },
    // 자녀 코드 연동 완료 페이지
    {
      path: '/child/linkcomplete',
      name: 'child-link-complete',
      component: LinkComplete,
    },
     // 부모 홈 페이지
    {
      path: '/parents/home',
      name: 'parents-home',
      component: ParentsHome,
    },
    // 부모 거래네역 전체 페이지
    {
      path: '/parents/transaction',
      name: 'parents-transaction',
      component: Transaction,
    },
    // 자녀 목록 페이지
    {
      path: '/parents/childlist',
      name: 'parents-child-list',
      component: ChildList,
    },
    // 부모 연동 코드 발급 신청 페이지
    {
      path: '/parents/linkcode',
      name: 'parents-link-code',
      component: LinkCode,
    },
    // 부모 연동 코드 발급 완료 페이지
    {
      path: '/parents/linkcomplete',
      name: 'parents-link-complete',
      component: LinkComplete,
    },
    // 자녀 홈 화면
    {
      path: '/child/home',
      name: 'child-home',
      component: ChildHome,
    },
    // 충전 관련 페이지
    { path: '/parents/charge', 
      name: 'charge', 
      component:Charge 
    },
    // 자동 충전 페이지
    { path: '/parents/charge/auto', 
      name: 'auto-charge', 
      component: AutoCharge 
    },
    // 충전 진행 중 페이지
    { path: '/parents/charge/charging', 
      name: 'charging', 
      component: Charging
    },
    // 충전 완료 페이지
    { path: '/parents/charge/complete', 
      name: 'charge-complete', 
      component: ChargeComplete
    },
    // 자녀 거래내역 조회
    {
      path: '/child/transaction',
      name: 'child-transaction',
      component: ChildTransaction,
    },
    // 자녀 알림페이지
    {
      path: '/child/notification',
      name: 'child-notification',
      component: ChildNotification,
    },
    // QR스캔
    {
      path: '/child/payment/scan',
      name: 'qr-scan',
      component: QRScan,
    },
    // QR코드 보여주기
    {
      path: '/child/payment/qrcode',
      name: 'qr-code',
      component: QRcode,
    },
    // 결제 정보 표시
    {
      path: '/child/payment/info',
      name: 'pay-info',
      component: PayInfo,
    },
    // 결제 비밀번호 입력
    {
     path: '/child/payment/password',
     name: 'pay-password',
      component: PayPassword,
    },
    // 결제 진행 중
    {
      path: '/child/payment/processing',
      name: 'pay-processing',
      component: PayProcessing,
    },
    // 결제 완료
    {
      path: '/child/payment/done',
      name: 'pay-done',
      component: PayDone,
    },
  ],
});

export default router;
