<template>
    <div class="page">
    <!-- 부모 홈 페이지 내용 -->
    <header class="nav">
        <h1 class="nav-title">김철수님</h1>
        <button class="alarm-btn" aria-label="알림">
           <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
        </button>
    </header>

    <!-- 지갑 카드 -->
      <div class="wallet-card">
        <p class="wallet-label">티니머니</p>
        <div class="wallet-row">
            <img src="@/assets/logo.svg" alt="티니머니 로고" class="wallet-logo" />
            <p class="wallet-amount">42,500원</p>
        </div>
        <div class="wallet-btns">
            <button class="btn btn-primary">충전</button>
            <button class="btn btn-secondary">용돈 지급</button>
        </div>
      </div>
      

    <!-- 정기 용돈 설정 -->
    <div class="section">
      <h2 class="section-title">정기 용돈 설정</h2>
      <button class="allowance-card" type="button">
        <div class="allowance-left">
          <img src="@/assets/icons/icon-clock.svg" alt="" class="clock-icon" />
          <div>
            <p class="allowance-main">매월 1일 지급</p>
            <p class="allowance-sub">100,000원 자동 충전</p>
          </div>
        </div>
        <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
      </button>
    </div>

    <!-- 최근 이용내역 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">최근 이용내역</h2>
          <img 
          src="@/assets/icons/icon-chevron.svg" 
          alt="" 
          class="chevron-icon"
          @click ="$router.push('/parents/transaction')"
        />
      </div>

      <div
        v-for="item in recentTransactions"
        :key="item.id"
        class="transaction-item"
      >
        <div class="transaction-left">
          <p class="transaction-date">{{ item.date }}</p>
          <p class="transaction-name">{{ item.name }}</p>
        </div>
        <div class="transaction-right">
          <p class="transaction-amount" :class="item.amount > 0 ? 'positive' : 'negative'">
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }} 원
          </p>
          <p class="transaction-balance">잔액 : {{ item.balance.toLocaleString() }}원</p>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item nav-item-active" type="button">
        <img src="@/assets/icons/icon-home-alive.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item" type="button" @click="router.push('/parents/childlist')">
        <img src="@/assets/icons/icon-child.svg" alt="" class="nav-icon" />
        <span class="nav-label">자녀관리</span>
      </button>
      <button class="nav-item" type="button">
        <img src="@/assets/icons/icon-mypage.svg" alt="" class="nav-icon" />
        <span class="nav-label">마이페이지</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'  // ← 추가

const router = useRouter()  

// 홈 탭 클릭
function goHome() {
  router.push('/parents/home')
}

// TODO: 하드코딩 데이터 API 연동 후 제거
const recentTransactions = [
  { id: 1, date: '07.15  21:17', name: '잔액 충전', amount: 10000, balance: 10000 },
  { id: 2, date: '07.14  16:07', name: '보상금 지급', amount: -3200, balance: 10000 },
  { id: 3, date: '07.13  15:50', name: '용돈 지급', amount: -1500, balance: 10000 },
]

// TODO: API 연동 후 아래 코드로 교체
// const recentTransactions = ref([])

// onMounted(async () => {
//   try {
//     const res = await api.get('/transactions/recent')
//     // 백엔드에서 최신 3개만 내려주거나, 프론트에서 slice(0, 3) 으로 자르기
//     recentTransactions.value = res.data.slice(0, 3)
//   } catch (error) {
//     console.error('최근 거래내역 불러오기 실패', error)
//   }
// })
</script>

<style scoped>

.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

/* 헤더 */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
}

.nav-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
}

.alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.alarm-icon {
  width: 24px;
  height: 24px;
}

/* 지갑 카드 */
.wallet-card {
  margin: 0 16px 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 16px;
}

.wallet-label {
  margin: 0 0 8px;
  font-size: 12px;
  color: #8b9097;
}

.wallet-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.wallet-logo {
  width: 48px;
  height: 48px;
}

.wallet-amount {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #191b1e;
}

.wallet-btns {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background-color: #f4f5f7;
  color: #191b1e;
}

/* 섹션 공통 */
.section {
  margin: 0 16px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

/* 정기 용돈 */
.allowance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  background-color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.allowance-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clock-icon {
  width: 28px;
  height: 28px;
}

.allowance-main {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.allowance-sub {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.chevron-icon {
  width: 18px;
  height: 18px;
}

/* 거래 내역 */
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f0f1f3;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-date {
  margin: 0 0 4px;
  font-size: 11px;
  color: #8b9097;
}

.transaction-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.transaction-right {
  text-align: right;
}

.transaction-amount {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
}

.positive {
  color: #1a73e8;
}

.negative {
  color: #191b1e;
}

.transaction-balance {
  margin: 0;
  font-size: 11px;
  color: #8b9097;
}

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: black;
  font-weight: 700;
}

</style>