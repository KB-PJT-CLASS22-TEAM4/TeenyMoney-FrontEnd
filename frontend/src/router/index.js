import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import LoginView from '@/pages/Login.vue';
import Signup from '@/pages/Signup.vue';
import ParentsHome from '@/pages/Parents/Home.vue';
import Transaction from '@/pages/Parents/Transaction.vue';
import ChildList from '@/pages/Parents/ChildList.vue';
import LinkCode from '@/pages/Parents/LinkCode.vue';
import LinkComplete from '@/pages/Parents/LinkComplete.vue';

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
    }
    ]
});

export default router;
