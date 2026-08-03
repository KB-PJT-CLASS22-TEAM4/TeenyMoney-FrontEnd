import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import LoginView from '@/pages/Login.vue';
// 회원가입 페이지
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


import ParentsHome from '@/pages/Parents/Home.vue';
import Transaction from '@/pages/Parents/Transaction.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
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
    {
      path: '/parents/transaction',
      name: 'parents-transaction',
      component: Transaction,
    },
    {
      path: '/child/home',
      name: 'child-home',
      component: ChildHome,
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
  ],
});

export default router;
