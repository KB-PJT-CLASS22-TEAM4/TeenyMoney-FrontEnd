<template>
  <div class="history-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <div class="nav-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="nav-title">거래내역조회</h1>
      </div>
      <button class="search-btn">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#15171b" stroke-width="1.8"/>
          <path d="M20 20l-3.5-3.5" stroke="#15171b" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- 지갑 잔액 -->
      <section class="wallet">
        <img src="@/assets/logo.svg" class="wallet-img" alt="지갑" />
        <div class="wallet-text">
          <p class="wallet-label">티니머니 지갑</p>
          <p class="wallet-amount">{{ balance }}원</p>
        </div>
      </section>

      <!-- 소비 리포트 배너 -->
      <div class="report-banner" @click="goReport">
        <div class="report-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M6 20v-6M12 20V5M18 20v-9" stroke="#8b9097" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="report-text">
          <b class="report-title">이번 달 소비 리포트</b>
          <span class="report-sub">카테고리별 소비를 한눈에 확인하기</span>
        </div>
        <svg class="chev" viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M9 6l6 6-6 6" stroke="#8b9097" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 거래유형 필터 (전체,입금,출금) -->
      <div class="filters">
        <span
          v-for="f in filters"
          :key="f"
          class="chip"
          :class="{ active: f === activeFilter }"
          @click="activeFilter = f"
        >{{ f }}</span>
      </div>

      <!-- 조회 필터 바 (기간,정렬) 누르면 바텀시트 -->
      <button class="filter-bar" @click="openFilter">
        <span class="filter-summary">{{ activePeriod }} · {{ activeSort }}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M7 10l5 5 5-5" stroke="#8b9097" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- 날짜별 거래 목록 -->
      <div v-for="group in groupedList" :key="group.date" class="group">
        <p class="date-label">{{ group.date }}</p>
        <div v-for="tx in group.items" :key="tx.id" class="tx-item">
          <div class="tx-left">
            <span class="tx-time">{{ tx.time }}</span>
            <span class="tx-name">{{ tx.name }}</span>
          </div>
          <div class="tx-right">
            <span class="tx-amount" :class="{ plus: tx.amount > 0 }">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toLocaleString() }}원
            </span>
            <span class="tx-balance">잔액 {{ tx.balance.toLocaleString() }}원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 조회 필터 바텀시트 (기간,정렬만) -->
    <transition name="sheet">
      <div v-if="showFilter" class="sheet-dim" @click.self="showFilter = false">
        <div class="sheet">
          <div class="sheet-handle-wrap"><div class="sheet-handle"></div></div>

          <p class="sheet-group-title">조회기간</p>
          <div class="sheet-chips">
            <button v-for="p in periods" :key="p" class="s-chip"
              :class="{ on: p === tempPeriod }" @click="tempPeriod = p">
              {{ p.replace('최근 ', '') }}
            </button>
          </div>

          <p class="sheet-group-title">정렬</p>
          <div class="sheet-chips">
            <button v-for="s in sorts" :key="s" class="s-chip"
              :class="{ on: s === tempSort }" @click="tempSort = s">{{ s }}</button>
          </div>

          <button class="sheet-apply" @click="applyFilter">조회하기</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyWallet, getMyTransactions } from '@/api/wallet'

const router    = useRouter()
const authStore = useAuthStore()

// 거래유형
const activeFilter = ref('전체')
const filters = ['전체', '입금', '출금']

// 기간·정렬
const activePeriod = ref('최근 1개월')
const activeSort   = ref('최신순')

const periods = ['최근 1주일', '최근 1개월', '최근 3개월', '최근 6개월']
const sorts   = ['최신순', '과거순']

// 바텀시트
const showFilter = ref(false)
const tempPeriod = ref(activePeriod.value)
const tempSort   = ref(activeSort.value)

// UI값 → API값 매핑
const periodMap = { '최근 1주일': 'WEEK', '최근 1개월': 'MONTH', '최근 3개월': 'THREE_MONTHS', '최근 6개월': 'SIX_MONTHS' }
const sortMap   = { '최신순': 'DESC', '과거순': 'ASC' }
const typeMap   = { '전체': 'ALL', '입금': 'CREDIT', '출금': 'DEBIT' }

// createdAt → 날짜 그룹 문자열 ("07.13 월" 형태)
const dayNames = ['일', '월', '화', '수', '목', '금', '토']
function toGroup(createdAt) {
  const d = new Date(createdAt)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const day = dayNames[d.getDay()]
  return `${mm}.${dd} ${day}`
}

// createdAt → 시간 문자열 ("14:30" 형태)
function toTime(createdAt) {
  return createdAt.slice(11, 16)
}

// API 응답 → 기존 구조 변환
function mapTransaction(t) {
  return {
    id:      t.id,
    group:   toGroup(t.createdAt),
    time:    toTime(t.createdAt),
    name:    t.description,
    amount:  t.direction === 'CREDIT' ? t.amount : -t.amount,
    balance: t.balanceAfter,
    type:    t.direction === 'CREDIT' ? '입금' : '출금',
  }
}

// [API] 지갑 잔액
const balance = ref(0)

// [API] 거래내역 목록
const transactions = ref([])

async function fetchTransactions() {
  try {
    const res = await getMyTransactions(authStore.accessToken, {
      period: periodMap[activePeriod.value],
      sort:   sortMap[activeSort.value],
      type:   typeMap[activeFilter.value],
    })
    transactions.value = res.data.map(mapTransaction)
    console.log('거래내역:', res.data)
  } catch (e) {
    console.error('거래내역 조회 실패:', e.message)
  }
}

onMounted(async () => {
  try {
    const res = await getMyWallet(authStore.accessToken)
    balance.value = res.data.balance
  } catch (e) {
    console.error('잔액 조회 실패:', e.message)
  }
  await fetchTransactions()
})

// 거래유형 필터 변경 시 재조회
watch(activeFilter, fetchTransactions)

function openFilter() {
  tempPeriod.value = activePeriod.value
  tempSort.value   = activeSort.value
  showFilter.value = true
}

async function applyFilter() {
  activePeriod.value = tempPeriod.value
  activeSort.value   = tempSort.value
  showFilter.value   = false
  await fetchTransactions()
}

// 날짜 그룹핑
const groupedList = computed(() => {
  const groups = {}
  transactions.value.forEach(t => {
    if (!groups[t.group]) groups[t.group] = []
    groups[t.group].push(t)
  })
  return Object.keys(groups).map(date => ({ date, items: groups[date] }))
})

function goBack()   { router.push({ name: 'child-home' }) }
function goReport() { router.push({ name: 'child-report' }) }

const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}
</script>
<style scoped>
.history-screen {
  box-sizing: border-box;
  position: relative;         
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

/* 상단 네비 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 16px 6px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn, .search-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 20px;
}
.scroll::-webkit-scrollbar {
  width: 3px;
}
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb {
  background: #d8dbdf;
}

/* 지갑 잔액 */
.wallet {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 0 20px;
}

.wallet-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.wallet-label {
  margin: 0;
  font-weight: 600;
  font-size: 12px;
  color: #8b9097;
}

.wallet-amount {
  margin: 3px 0 0;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.8px;
  color: #191b1e;
}

/* 소비 리포트 배너 */
.report-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: px solid #e7e9ec; 
  border-radius: 12px;
  cursor: pointer;
}

.report-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  background: #fff;
  border-radius: 10px;
  flex: none;
}

.report-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.report-title {
  font-weight: 700;
  font-size: 14px;
  color: #191b1e;
}

.report-sub {
  font-weight: 500;
  font-size: 11.5px;
  color: #9da0a3;
}

.chev {
  font-size: 20px;
  color: none;  
}

/* 거래유형 필터 칩 */
.filters {
  display: flex;
  gap: 8px;
  padding: 18px 0 6px;
}

.chip {
  padding: 5px 14px;
  border: 1px solid #e7e9ec;
  border-radius: 999px;
  background: #fff;
  font-weight: 700;
  font-size: 12px;
  color: #959ba3;
  cursor: pointer;
}

.chip.active {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #191b1e;
}

/* 조회 필터 바 (기간·정렬) — 왼쪽 정렬 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  padding: 14px 0 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.filter-summary {
  font-weight: 600;
  font-size: 13px;
  color: #8b9097;
}

/* 날짜 그룹 */
.date-label {
  margin: 10px 0 0;
  padding: 8px 0;
  font-weight: 700;
  font-size: 12.5px;
  color: #8b9097;
}

/* 거래 항목 */
.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 0;
  border-top: 1px solid #f0f1f3;
}

.tx-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tx-time {
  font-weight: 500;
  font-size: 11.5px;
  color: #b9bec5;
}

.tx-name {
  font-weight: 700;
  font-size: 14px;
  color: #191b1e;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.tx-amount {
  font-weight: 800;
  font-size: 15px;
  color: #191b1e;   /* 출금 검정 */
}

.tx-amount.plus {
  color: #4d8ad6;   /* 입금 파랑 */
}

.tx-balance {
  font-weight: 500;
  font-size: 11.5px;
  color: #b9bec5;
}

/* ===== 조회 필터 바텀시트 ===== */
.sheet-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
  z-index: 50;
}

.sheet {
  box-sizing: border-box;
  width: 100%;
  padding: 16px 20px 28px;
  background: #fff;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
}

.sheet-handle-wrap {
  display: flex;
  justify-content: center;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
}

.sheet-group-title {
  margin: 18px 0 10px;
  font-weight: 700;
  font-size: 13px;
  color: #8b9097;
}

.sheet-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.s-chip {
  padding: 8px 16px;
  border: 1px solid #e7e9ec;
  border-radius: 999px;
  background: #fff;
  font-weight: 700;
  font-size: 13px;
  color: #959ba3;
  cursor: pointer;
}

.s-chip.on {
  background: #fff8e6;
  border-color: #ffbc00;
  color: #ffbc00;
}

.sheet-apply {
  width: 100%;
  margin-top: 24px;
  padding: 15px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
}

/* 슬라이드 업 애니메이션 */
.sheet-enter-active, .sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .sheet, .sheet-leave-active .sheet {
  transition: transform 0.25s ease;
}
.sheet-enter-from, .sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet, .sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>