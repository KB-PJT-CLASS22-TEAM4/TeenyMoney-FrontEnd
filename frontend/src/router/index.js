import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/pages/Login.vue';
import Signup from '@/pages/Signup.vue';
// 자녀 연동 코드 입력 페이지
import LinkCodeInput from '@/pages/Child/LinkCodeInput.vue';
// 자녀 연동 코드 보호자 확인 페이지
import LinkConfirm from '@/pages/Child/LinkConfirm.vue';
// 자녀 코드 연동 완료 페이지
import ChildLinkComplete from '@/pages/Child/LinkComplete.vue';
// 부모 자녀 연동 완료 페이지
import ParentLinkComplete from '@/pages/Parents/Link/LinkComplete.vue';
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
// 자녀 결제 비밀번호 설정         
import PasswordSetting from '@/pages/Child/PasswordSetting.vue';
// 자녀 결제 비밀번호 설정 완료
import PasswordSettingDone from '@/pages/Child/PasswordSettingDone.vue';
// 결제 비밀번호 변경
import PasswordChange from '@/pages/Child/PasswordChange.vue';
// 자녀 소비 리포트 
import ChildReport from '@/pages/Child/ChildReport.vue';
// 자녀 금융상품 가입 확인 페이지
import ProductConfirm from '@/pages/Child/Finance/ProductsConfirm.vue';
// 자녀 오늘만 허용 요청
import Request from '@/pages/Child/TodayAllow/Request.vue';
// 자녀 마이페이지
import ChildMyPage from '@/pages/Child/ChildMyPage.vue';
// 자녀 오늘만 허용 요청 확인
import Confirm from '@/pages/Child/TodayAllow/Confirm.vue';
// 자녀 신규 금융상품 목록
import NewProducts from '@/pages/Child/Finance/NewProducts.vue';
// 자녀 나의 금융상품 페이지
import MyProducts from '@/pages/Child/Finance/MyProducts.vue'
// 자녀 금융상품 가입 페이지
import ProductsJoin from '@/pages/Child/Finance/ProductsJoin.vue';
// 자녀 금융상품 중도해지
import ProductsCancel from '@/pages/Child/Finance/ProductsCancel.vue';
// 자녀 중도해지 완료 상품 상세
import ProductTerminatedDetail from '@/pages/Child/Finance/ProductTerminatedDetail.vue';
// 자녀 대출 상환 완료 상품 상세
import LoanRepaymentDetail from '@/pages/Child/Finance/LoanRepaymentDetail.vue';
// QR스캔
import QrScan from '@/pages/Child/Payment/QRscan.vue';
// 자녀 티니점수
import TeenyScore from '@/pages/Child/TeenyScore.vue';
// 자녀 티니 등급 상세
import TeenyScoreGrade from '@/pages/Child/TeenyScoreGrade.vue';
// 자녀 퀘스트 목록
import QuestList from '@/pages/Child/Quest/QuestList.vue';
// 자녀 퀘스트 인증하기
import QuestDetail from '@/pages/Child/Quest/QuestDetail.vue';
// 자녀 오늘만 허용 수정 페이지
import Edit from '@/pages/Child/TodayAllow/Edit.vue';

import ParentsHome from '@/pages/Parents/Home.vue';
import Transaction from '@/pages/Parents/Transaction.vue';
import ChildList from '@/pages/Parents/Child/ChildList.vue';
import LinkCode from '@/pages/Parents/Link/LinkCode.vue';

import Charge from '@/pages/Parents/Charge/Charge.vue'
import Charging from '@/pages/Parents/Charge/Charging.vue'
import ChargeComplete from '@/pages/Parents/Charge/ChargeComplete.vue'
import Mypage from '@/pages/Parents/Mypage.vue'
import MonthlyLimit from '@/pages/Parents/TodayAllow/MonthlyLimit.vue'
import Faq from '@/pages/Faq.vue'
import Terms from '@/pages/Terms.vue'
import TermsDetail from '@/pages/TermsDetail.vue'
import HarmfulCategory from '@/pages/Parents/Harmful/HarmfulCategory.vue'
import SendAllowance from '@/pages/Parents/Allowance/SendAllowance.vue'
import RequestList from '@/pages/Parents/RequestList.vue'
import SendingAllowance from '@/pages/Parents/Allowance/SendingAllowance.vue'
import SendFail from '@/pages/Parents/Allowance/SendFail.vue'
import SendComplete from '@/pages/Parents/Allowance/SendComplete.vue'
import PaymentChange from '@/pages/Parents/Payment/PaymentChange.vue'
import PaymentChangeComplete from '@/pages/Parents/Payment/PaymentChangeComplete.vue'
import PaymentPasswordSetting from '@/pages/Parents/Payment/PaymentPasswordSetting.vue'
import PaymentPasswordSettingDone from '@/pages/Parents/Payment/PaymentPasswordSettingDone.vue'
import RegularAllowance from '@/pages/Parents/Allowance/RegularAllowance.vue'
import RegularAllowanceComplete from '@/pages/Parents/Allowance/RegularAllowanceComplete.vue'
import ChildDetail from '@/pages/Parents/Child/ChildDetail.vue'
import ParentChildTransaction from '@/pages/Parents/Child/ChildTransaction.vue'
import MoneyReport from '@/pages/Parents/Child/MoneyReport.vue'
import ChildFinance from '@/pages/Parents/Child/ChildFinance.vue'
import FinanceProductCreate from '@/pages/Parents/Child/FinanceProductCreate.vue'
import FinanceApprovalDetail from '@/pages/Parents/Child/FinanceApprovalDetail.vue'
import FinanceCompletionDetail from '@/pages/Parents/Child/FinanceCompletionDetail.vue'
import TeenyScoring from '@/pages/Parents/TeenyScore.vue'
import QuestLists from '@/pages/Parents/Quest/QuestList.vue'
import QuestCreate from '@/pages/Parents/Quest/QuestCreate.vue'
import QuestDetails from '@/pages/Parents/Quest/QuestDetail.vue'
import QuestApproval from '@/pages/Parents/Quest/QuestApproval.vue';'@/pages/Parents/QuestApproval.vue'
import ParentsNotification from '@/pages/Parents/ParentsNotification.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    // 로그인 페이지 (기존 경로 호환)
    {
      path: '/login',
      redirect: '/',
    },
    // 회원가입 페이지
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      meta: { public: true },
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
      component: ChildLinkComplete,
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
    // 부모 자녀 연동 완료 페이지
    {
      path: '/parents/linkcomplete',
      name: 'parents-link-complete',
      component: ParentLinkComplete,
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
    // 부모 알림페이지
    {
      path: '/parents/notification',
      name: 'parents-notification',
      component: ParentsNotification,
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
    // 자녀 마이페이지
    {
      path: '/child/mypage',
      name: 'child-mypage',
      component: ChildMyPage,
    },
    // 부모 마이페이지
    {
      path: '/parents/mypage',
      name: 'parents-mypage',
      component : Mypage,
    },
    {
      path: '/parents/faq',
      name: 'parents-faq',
      component: Faq,
    },
    {
      path: '/child/faq',
      name: 'child-faq',
      component: Faq,
    },
    {
      path: '/parents/mypage/terms',
      name: 'parents-terms',
      component: Terms,
    },
    {
      path: '/parents/mypage/terms/:code',
      name: 'parents-terms-detail',
      component: TermsDetail,
    },
    {
      path: '/child/mypage/terms',
      name: 'child-terms',
      component: Terms,
    },
    {
      path: '/child/mypage/terms/:code',
      name: 'child-terms-detail',
      component: TermsDetail,
    },
    {
      path: '/parents/mypage/payment-password',
      name: 'parents-payment-password',
      component: PaymentPasswordSetting,
    },
    {
      path: '/parents/mypage/payment-password/done',
      name: 'parents-payment-password-done',
      component: PaymentPasswordSettingDone,
    },
    {
      path: '/parents/mypage/today-allow-limit',
      name: 'parents-today-allow-limit',
      component: MonthlyLimit,
    },
    // 자녀 결제 비밀번호 설정
    {
      path: '/child/passwordsetting',
      name: 'child-password-setting',
      component: PasswordSetting,
    },
    // 결제 비밀번호 설정 완료
  {
  path: '/child/passwordsetting/done',
  name: 'child-password-setting-done',
  component: PasswordSettingDone,
  },
  // 결제 비밀번호 변경
  {
  path: '/child/passwordchange',
  name: 'child-password-change',
  component: PasswordChange,
  },
  // 자녀 소비 리포트
  {
  path: '/child/report',
  name: 'child-report',
  component: ChildReport,
  },
  // 자녀 금융상품 가입 확인 페이지
  {
    path: '/child/finance/confirm',
    name: 'product-confirm',
    component: ProductConfirm,
  },
  {
    path: '/parents/harmfulcategory',
    name: 'parents-harmful-category',
    component: HarmfulCategory,
  },
  {
    path: '/parents/place-list',
    name: 'parents-place-list',
    component: HarmfulCategory,
  },
  // 자녀 신규 금융상품 목록
  {
  path: '/child/finance/newproducts',
  name: 'child-finance-newproducts',
  component: NewProducts,
  },
  // 자녀 오늘만 허용 요청
   {
    path: '/child/todayallow/request',
    name: 'child-todayallow-request',
    component: Request,
    meta: { requiresAuth: true },   // 로그인 가드 쓰면
  },
  // 자녀 오늘만 허용 요청 확인
  {
    path: '/child/todayallow/confirm',
    name: 'child-todayallow-confirm',
    component: Confirm,
  },
  // 자녀 나의 금융상품 페이지
  {
    path: '/child/finance/myproducts',
    name: 'child-finance-myproducts',
    component: MyProducts,
  },
  // 자녀 금융상품 가입 페이지
  {
    path: '/child/finance/join',
    name: 'child-finance-join',
    component: ProductsJoin,
  },
  // 자녀 금융상품 중도해지
  {
    path: '/child/finance/cancel',
    name: 'product-cancel',
    component: ProductsCancel,
  },
  // 자녀 중도해지 완료 상품 상세
  {
    path: '/child/finance/terminated-detail',
    name: 'child-finance-terminated-detail',
    component: ProductTerminatedDetail,
  },
  // 자녀 대출 상환 완료 상품 상세
  {
    path: '/child/finance/repayment-detail',
    name: 'child-finance-repayment-detail',
    component: LoanRepaymentDetail,
  },
  // 자녀 티니점수
  {
    path: '/child/score',
    name: 'child-score',
    component: TeenyScore,
  },
  // 자녀 티니 등급 상세
  {
    path: '/child/score/grade',
    name: 'child-score-grade',
    component: TeenyScoreGrade,
  },
  // 자녀 퀘스트 목록
  { 
    path: '/child/quest', 
    name: 'child-quest-list', 
    component: QuestList
  },
  // 자녀 퀘스트 인증하기
  { 
  path: '/child/questdetail/:questId',   // :questId 추가
  name: 'child-quest-detail', 
  component: QuestDetail
  },
  // 자녀 오늘만 허용 수정 페이지 
  {
    path: '/child/todayallow/edit',
    name: 'child-todayallow-edit',
    component: Edit
  },
  // QR스캔
  {
    path: '/child/payment/scan',
    name: 'qr-scan',
    component: QrScan,
  },
  { path: '/parents/send-allowance', 
    name: 'send-allowance', 
    component: SendAllowance 
  },
  {
    path: '/parents/requests',
    name: 'parents-request-list',
    component: RequestList,
  },
  {
    path: '/parents/sending-allowance',
    name: 'sending-allowance',
    component: SendingAllowance,
  },
  { path: '/parents/send/fail', 
    name: 'send-fail', 
    component: SendFail 
  },
  { path: '/parents/send/complete', 
    name: 'send-complete', 
    component: SendComplete 
  },
  { 
    path: '/parents/payment/change',
    name: 'payment-change', 
    component: PaymentChange 
  },
  { 
    path: '/parents/payment/change-complete', 
    name: 'payment-change-complete', 
    component: PaymentChangeComplete 
  },
  { 
    path: '/parents/regular-allowance', 
    name: 'regular-allowance', 
    component: RegularAllowance 
  },
  { 
    path: '/parents/regular-allowance/complete', 
    name: 'regular-allowance-complete', 
    component: RegularAllowanceComplete 
  },
  {
    path: '/parents/children/:childId',
    name: 'parents-child-detail',
    component: ChildDetail,
  },
  {
    path: '/parents/children/:childId/transactions',
    name: 'parents-child-transaction',
    component: ParentChildTransaction,
  },
  {
    path: '/parents/children/:childId/report',
    name: 'parents-child-report',
    component: MoneyReport,
  },
  {
    path: '/parents/children/:childId/finance',
    name: 'parents-child-finance',
    component: ChildFinance,
  },
  {
    path: '/parents/finance/create',
    name: 'parents-finance-create',
    component: FinanceProductCreate,
  },
  {
    path: '/parents/children/:childId/finance/create',
    name: 'parents-child-finance-create',
    component: FinanceProductCreate,
  },
  {
    path: '/parents/children/:childId/finance/approval/:productType/:enrollmentId',
    name: 'parents-finance-approval-detail',
    component: FinanceApprovalDetail,
  },
  {
    path: '/parents/children/:childId/finance/completion/:productType/:enrollmentId',
    name: 'parents-finance-completion-detail',
    component: FinanceCompletionDetail,
  },
  { 
    path: '/parents/children/:childId/teeny-score', 
    name: 'teeny-score', 
    component: TeenyScoring 
  },
  {
    path: '/parents/quest',
    name: 'parents-quest-list',
    component: QuestLists,
  },
  {
    path : '/parents/quest/create',
    name : 'parents-quest-create',
    component : QuestCreate
  },
  { 
    path: '/parents/quest/:questId', 
    name: 'quest-detail', 
    component: QuestDetails 
  },
  {
  path: '/parents/quest/:questId/verifications/:verificationId',
  name: 'ParentQuestApproval',
  component: QuestApproval,
  },
  // 자녀 퀘스트 목록
  { 
    path: '/child/quest', 
    name: 'child-quest-list', 
    component: QuestList 
  },
  // 자녀 퀘스트 인증하기
{ 
  path: '/child/questdetail/:questId',   // :questId 추가
  name: 'child-quest-detail', 
  component: QuestDetail
},
    // QR스캔
    {
      path: '/child/payment/scan',
      name: 'qr-scan',
      component: QrScan,
    },
    { path: '/parents/send-allowance', 
      name: 'send-allowance', 
      component: SendAllowance 
    },
    {
      path: '/parents/sending-allowance',
      name: 'sending-allowance',
      component: SendingAllowance,
    },
    { path: '/parents/send/fail', 
      name: 'send-fail', 
      component: SendFail 
    },
    { path: '/parents/send/complete', 
      name: 'send-complete', 
      component: SendComplete 
    },
    { 
      path: '/parents/payment/change',
     name: 'payment-change', 
     component: PaymentChange 
    },
{ 
  path: '/parents/payment/change-complete', 
  name: 'payment-change-complete', 
  component: PaymentChangeComplete 
},
{ 
  path: '/parents/regular-allowance', 
  name: 'regular-allowance', 
  component: RegularAllowance 
},
{ 
  path: '/parents/regular-allowance/complete', 
  name: 'regular-allowance-complete', 
  component: RegularAllowanceComplete 
},
{
  path: '/parents/children/:childId',
  name: 'parents-child-detail',
  component: ChildDetail,
},
{
  path: '/parents/children/:childId/finance',
  name: 'parents-child-finance',
  component: ChildFinance,
},
{
  path: '/parents/children/:childId/finance/create',
  name: 'parents-child-finance-create',
  component: FinanceProductCreate,
},
{
  path: '/parents/children/:childId/finance/approval/:productType/:enrollmentId',
  name: 'parents-finance-approval-detail',
  component: FinanceApprovalDetail,
},
{ 
  path: '/parents/children/:childId/teeny-score', 
  name: 'teeny-score', 
  component: TeenyScoring 
}
  ],
});

export default router;