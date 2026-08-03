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
      path: '/parents/childlist',
      name: 'parents-child-list',
      component: ChildList,
    },
    {
      path: '/parents/linkcode',
      name: 'parents-link-code',
      component: LinkCode,
    },
    {
      path: '/parents/linkcomplete',
      name: 'parents-link-complete',
      component: LinkComplete,
    },
    {
      path: '/child/home',
      name: 'child-home',
      component: ChildHome,
    },
    { path: '/parents/charge', 
      name: 'charge', 
      component:Charge 
    },
    { path: '/parents/charge/auto', 
      name: 'auto-charge', 
      component: AutoCharge 
    },
    { path: '/parents/charge/charging', 
      name: 'charging', 
      component: Charging
    },
    { path: '/parents/charge/complete', 
      name: 'charge-complete', 
      component: ChargeComplete 
    }
  ],
});

export default router;
