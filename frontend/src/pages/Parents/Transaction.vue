<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">전체 거래내역</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-chevron.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <!-- 지갑 카드 -->
    <div class="wallet-card">
      <img src="@/assets/logo.svg" alt="티니머니 로고" class="wallet-logo" />
      <div class="wallet-info">
        <p class="wallet-label">티니머니 지갑</p>
        <!-- TODO: API 연동 후 실제 잔액으로 교체 -->
        <!-- GET /wallet/balance → res.data.balance -->
        <p class="wallet-amount">24,500원</p>
      </div>
    </div>

    <!-- 필터 탭 -->
    <div class="filter-tabs">
      <!-- TODO: 탭 클릭 시 해당 필터로 API 재호출 -->
      <!-- GET /transactions?type=all | income | expense -->
      <button class="tab tab-active">전체</button>
      <button class="tab">입금</button>
      <button class="tab">출금</button>
      <button class="tab tab-period">
        <img src="@/assets/icons/icon-calendar.svg" alt="" class="calendar-icon" />
        기간
      </button>
      <!-- TODO: 기간 설정 클릭 시 날짜 선택 후 API 재호출 -->
      <!-- GET /transactions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD -->
    </div>

    <!-- 거래 내역 -->
    <div class="transaction-list">
      <!-- TODO: 하드코딩 데이터 제거 후 API 응답 데이터로 교체 -->
      <!-- GET /transactions → res.data (날짜별 그룹핑된 배열) -->
      <div v-for="group in transactions" :key="group.date" class="transaction-group">
        <p class="date-label">{{ group.date }}</p>
        <div class="transaction-card">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="transaction-item"
          >
            <div class="transaction-left">
              <p class="transaction-name">{{ item.name }}</p>
              <p class="transaction-meta">{{ item.time }} · {{ item.method }}</p>
            </div>
            <div class="transaction-right">
              <p class="transaction-amount" :class="item.amount > 0 ? 'positive' : 'negative'">
                {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}원
              </p>
              <p class="transaction-balance">
                잔액 {{ item.balance.toLocaleString() }}원
                <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item nav-item-active" type="button">
        <img src="@/assets/icons/icon-home-alive.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item" type="button">
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

// TODO: API 연동 후 ref([]) 로 변경 및 onMounted 에서 호출
// const transactions = ref([])

// onMounted(async () => {
//   try {
//     const res = await api.get('/transactions')
//     transactions.value = res.data
//   } catch (error) {
//     console.error('거래내역 불러오기 실패', error)
//   }
// })

// TODO: 아래 하드코딩 데이터 API 연동 후 제거
const transactions = [
  {
    date: '2025.10.24',
    items: [
      { id: 1, name: '김첫째 용돈', time: '14:20', method: '체크카드', amount: -5500, balance: 24500 },
      { id: 2, name: '충전', time: '10:00', method: '이체', amount: 50000, balance: 24500 },
    ],
  },
  {
    date: '2025.10.23',
    items: [
      { id: 3, name: '김첫째 용돈', time: '18:45', method: '체크카드', amount: -3200, balance: 24500 },
      { id: 4, name: '김첫째 용돈', time: '15:30', method: '체크카드', amount: -28900, balance: 24500 },
    ],
  },
  {
    date: '2025.10.22',
    items: [
      { id: 5, name: '김첫째 보상금', time: '12:15', method: '체크카드', amount: -8200, balance: 24500 },
    ],
  },
]
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
  background-color: #f4f5f7;
}

.back-btn,
.alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon,
.alarm-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

/* 지갑 카드 */
.wallet-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 8px 16px 16px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 16px;
}

.wallet-logo {
  width: 48px;
  height: 48px;
}

.wallet-label {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8b9097;
}

.wallet-amount {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #191b1e;
}

/* 필터 탭 */
.filter-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 16px;
}

.tab {
  padding: 8px 16px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.tab-active {
  background-color: #ffbc00;
  border-color: #ffbc00;
  color: #ffffff;
}

.tab-period {
  display: flex;
  align-items: center;
  gap: 4px;
}

.calendar-icon {
  width: 14px;
  height: 14px;
}

/* 거래 내역 */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
}

.date-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #8b9097;
}

.transaction-card {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  border-bottom: 1px solid #f0f1f3;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.transaction-meta {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.transaction-right {
  text-align: right;
}

.transaction-amount {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
}

.negative {
  color: #191b1e;
}

.positive {
  color: #1a73e8;
}

.transaction-balance {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.chevron-icon {
  width: 14px;
  height: 14px;
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