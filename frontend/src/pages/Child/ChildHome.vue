<template>
  <div class="child-home">
    <!-- 상단 헤더 -->
    <header class="header">
      <span class="username">{{ userName }}님</span>
      <button class="bell-btn"  @click="goNotification">
        <svg viewBox="0 0 24 24" width="23" height="23" fill="none">
          <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" stroke="#4a4e55" stroke-width="1.7" stroke-linejoin="round"/>
          <path d="M10 20a2 2 0 0 0 4 0" stroke="#4a4e55" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
        <!-- 안 읽은 알림 있으면 빨간 점 -->
        <span v-if="hasUnread" class="bell-dot"></span>
      </button>
    </header>

    <!-- 잔액 영역 -->
    <section class="balance">
      <img src="@/assets/logo.svg" class="wallet" alt="지갑" />
      <div class="balance-text">
        <p class="balance-label">티니머니</p>
        <p class="balance-amount">{{ balance }}원</p>
      </div>
    </section>

    <!-- 송금 / 결제내역 버튼 -->
    <div class="actions">
      <button class="pill primary">송금</button>
      <button class="pill" @click="goPayment">결제내역</button>
    </div>

    <!-- 티니 점수 -->
    <section class="score">
      <div class="score-head">
        <span class="score-title">티니 점수</span>
        <span class="chev">›</span>
      </div>
      <div class="score-row">
        <b class="score-value">{{ score }}점</b>
        <span class="score-grade">{{ grade }} 등급</span>
      </div>
      <div class="score-bar">
        <div class="score-fill" :style="{ width: scorePercent + '%' }"></div>
      </div>
    </section>

<!-- 내 금융 -->
<section class="finance">
  <div class="finance-head">
    <span class="finance-title">내 금융</span>
    <span class="finance-all">전체보기</span>
  </div>
  <div class="finance-scroll" ref="scrollRef" @scroll="onScroll">
  <FinanceCard v-for="f in finances" :key="f.id" v-bind="f" />
</div>

<!-- 페이지 인디케이터 -->
<div class="indicator">
  <span
    v-for="(f, i) in finances"
    :key="f.id"
    class="dot"
    :class="{ active: i === activeCard }"
  ></span>
</div>
</section>

    <!-- 최근 이용내역 -->
    <section class="history">
      <div class="history-head">
        <span class="history-title">최근 이용내역</span>
        <span class="chev">›</span>
      </div>
      <div v-for="t in transactions" :key="t.id" class="tx-item">
        <div class="tx-info">
          <span class="tx-date">{{ t.date }}</span>
          <span class="tx-name">{{ t.name }}</span>
        </div>
        <span class="tx-amount" :class="{ plus: t.amount > 0 }">
          {{ t.amount > 0 ? '+' : '' }}{{ t.amount.toLocaleString() }}
        </span>
      </div>
    </section>

    <!-- 하단 탭바 -->
    <BottomTabBar active="home" @select="onTabSelect" />
  </div>
</template>



<script setup>
import FinanceCard from '@/components/Child/FinanceCard.vue';
import BottomTabBar from '@/components/Child/BottomTabBar.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const activeCard = ref(0);
const scrollRef = ref(null);
const hasUnread = ref(true); 

function onScroll() {
  const el = scrollRef.value;
  if (!el) return;
  const maxScroll = el.scrollWidth - el.clientWidth;
  const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
  activeCard.value = Math.round(ratio * (finances.length - 1));
}

function goNotification() {
  router.push({ name: 'child-notification' });
}


function goPayment() {
  // TODO: 결제내역 페이지 만들면 연결
  // router.push({ name: 'child-payment' });
}

// 아래 3개는 각 페이지 만들면 살려서 @click 연결 예정
// function goScore() {
//   router.push({ name: 'child-score' });
// }
// function goFinance() {
//   router.push({ name: 'child-myfinance' });
// }
// function goHistory() {
//   router.push({ name: 'child-history' });
// }

// ==== API 연동 필요 (지금은 더미 데이터) ====
// [API] 사용자 정보 (이름)
const userName = '김첫째';
// [API] 잔액 조회
const balance = '42,500';
// [API] 티니 점수 조회 (점수 + 등급 + 진척도)
const score = 850;
const grade = '우수';
const scorePercent = 70;
// [API] 내 금융 상품 목록 (적금/예금/대출)
const finances = [
  { id: 1, type: '적금', rate: '연 4.5%', name: '티니 꿈나무 적금', amount: '90,000원', sub: '3 / 24개월', progress: 13, amountColor: '#15171b' },
  { id: 2, type: '예금', rate: '연 2.8%', name: '용돈 모으기 예금', amount: '35,000원', sub: '자유 입출금', progress: 60, amountColor: '#15171b' },
];
// [API] 최근 이용내역 (최근 3건)
const transactions = [
  { id: 1, date: '07.15  21:17', name: 'GS25 강남점', amount: -3200 },
  { id: 2, date: '07.14  16:07', name: '교통카드 충전', amount: -10000 },
  { id: 3, date: '07.13  15:50', name: '정기 용돈', amount: 15000 },
];

function onTabSelect(key) {
  // TODO: 탭 선택 시 해당 페이지로 이동 연결
}
</script>



<style scoped>
.child-home {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
}

/* 상단 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.username {
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
}

.bell-btn {
  position: relative;  
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
}
.bell-dot {
  position: absolute;
  top: -2px;
  right: 1px;
  width: 7px;
  height: 7px;
  background: #ff4d4f;  
  border-radius: 50%;
  border: 1.5px solid #fff;  
}

/* 잔액 */
.balance {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
}

.wallet {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.balance-label {
  margin: 0;
  font-weight: 600;
  font-size: 11.5px;
  color: #8b9097;
}

.balance-amount {
  margin: 2px 0 0;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.875px;
  color: #191b1e;
}

/* 송금/결제 버튼 */
.actions {
  display: flex;
  gap: 14px;
  padding: 16px 20px 0;
}

.pill {
  flex: 1;
  padding: 9px 16px;
  border: none;
  border-radius: 4px;
  background: #f2f4f6;
  font-weight: 700;
  font-size: 12px;
  color: #191b1e;
  cursor: pointer;
}

.pill.primary {
  background: #ffbc00;
}

/* 티니 점수 */
.score {
  padding: 20px 20px 0;
}

.score-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-title {
  font-weight: 700;
  font-size: 13px;
  color: #191b1e;
}

.chev {
  font-size: 18px;
  color: #b9bec5;
}

.score-row {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.score-value {
  font-weight: 600;
  font-size: 13px;
  color: #191b1e;
}

.score-grade {
  font-weight: 700;
  font-size: 12px;
  color: #191b1e;
}

.score-bar {
  width: 100%;
  height: 6px;
  margin-top: 8px;
  background: #e9ecef;
  border-radius: 999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: #ffbc00;
  border-radius: 999px;
}

/* 내 금융 */
.finance {
  padding: 24px 0 0;
}

.finance-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.finance-title {
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
}

.finance-all {
  font-weight: 600;
  font-size: 12.3px;
  color: #b9bec5;
}

.finance-scroll {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  overflow-x: auto;
  scrollbar-width: none;       
  -ms-overflow-style: none;   
}

/* Chrome/Safari 스크롤바 숨김 */
.finance-scroll::-webkit-scrollbar {
  display: none;
}

/* 최근 이용내역 */
.history {
  padding: 12px 20px 0;
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px; 
}

.history-title {
  font-weight: 700;
  font-size: 13px;
  color: #191b1e;
}

.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #f0f1f3;
}

.tx-item:first-of-type {
  border-top: none;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tx-date {
  font-weight: 500;
  font-size: 10.5px;
  color: #b9bec5;
}

.tx-name {
  font-weight: 600;
  font-size: 12.8px;
  color: #191b1e;
}

.tx-amount {
  font-weight: 600;
  font-size: 13.5px;
  color: #191b1e;
}

.tx-amount.plus {
  color: #4d8ad6; 
}

/* 하단 탭바 하단 고정 */
.child-home :deep(.tabbar) {
  margin-top: auto;
}

.indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 6px 0 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #d8dbdf;  
  border-radius: 3px;
  transition: all 0.2s;
}

.dot.active {
  width: 16px;    
  background: #15171b;   
}
</style>