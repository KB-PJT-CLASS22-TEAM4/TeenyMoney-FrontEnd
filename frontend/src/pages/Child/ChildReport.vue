<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
 
const router = useRouter()
 
// 하단 탭 이동
function onTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' })
  if (key === 'report') router.push({ name: 'child-report' })
  if (key === 'my') router.push({ name: 'child-mypage' })
  if (key === 'q') router.push({ name: 'qr-scan' }) 
  //finance(금융상품)는 페이지 생기면 추가
}
 
// 스크롤할 때만 스크롤바 보이기
const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}
 
// ============================================================
// [API 연동 필요] 소비 리포트 데이터
//
// 현재는 더미 데이터
// 백엔드 API가 나오면 아래 3개(weekly/monthly/categories)를
// API 응답으로 교체해야 함.
//
// [연동 방법]
//   1) 아래 데이터를 ref로 바꾸기 (지금은 const 고정값)
//        const weekly = ref(null)
//        const monthly = ref(null)
//        const categories = ref([])
//   2) api/report.js 에 조회 함수 만들기 (member.js 방식과 동일)
//        export async function getReport(accessToken, period) {
//          fetch(`.../api/v1/reports?period=${period}`, {
//            headers: { Authorization: `Bearer ${accessToken}` }
//          })
//        }
//   3) onMounted에서 조회 → 위 ref에 담기
//        onMounted(async () => {
//          const data = await getReport(authStore.accessToken, '2025-07-3')
//          weekly.value = data.weekly
//          monthly.value = data.monthly
//          categories.value = data.categories
//        })
//   4) 템플릿에서 weekly → weekly.value 로 접근 (ref로 바뀌므로)
//   5) 로딩/에러 처리 추가 (try/catch, v-if로 로딩 표시)
//
// 참고: 기간 드롭다운(▾)을 누르면 다른 주차/월을 조회하도록
//          period 파라미터를 바꿔서 재호출해야 함 (지금은 미구현)
// ============================================================
 
// --- [더미] 주차별 소비 (막대 차트) → API의 weekly로 교체 ---
const weekly = {
  title: '7월 3주차 소비리포트',
  total: 54900,
  bars: [
    { label: '7월 2주차', amount: 61000, current: false },
    { label: '7월 3주차', amount: 54900, current: true },
  ],
}
 
// --- [더미] 월별 소비 (도넛 차트) → API의 monthly로 교체 ---
const monthly = {
  title: '7월 소비리포트',
  diffText: '지난달보다 6,100원 덜 썼어요',
  total: 38200,
}
 
// --- [더미] 카테고리별 소비 → API의 categories로 교체 ---
// (color는 프론트에서 지정. API가 색을 안 주면 카테고리명으로 매핑)
const categories = [
  { name: '식비', percent: 38, amount: 14500, color: '#f0b352' },
  { name: '교통', percent: 26, amount: 10000, color: '#4a90d9' },
  { name: '쇼핑', percent: 21, amount: 8000, color: '#8b7dd8' },
  { name: '여가', percent: 15, amount: 5700, color: '#d96a94' },
]
 
// ---- 화면 계산 로직 ----
 
// 숫자 → "54,900원"
function won(n) {
  return n.toLocaleString('ko-KR') + '원'
}
 
// 막대 높이 (제일 큰 값 기준으로 비율)
const maxBar = computed(() => Math.max(...weekly.bars.map((b) => b.amount)))
function barHeight(amount) {
  return Math.round((amount / maxBar.value) * 110) + 'px'
}
 
// 도넛 차트 세그먼트 계산 (SVG stroke-dasharray)
const CIRC = 2 * Math.PI * 66 // 반지름 66의 둘레 ≈ 414.7
const donutSegments = computed(() => {
  let offset = 0
  return categories.map((c) => {
    const len = (c.percent / 100) * CIRC
    const seg = { color: c.color, dash: `${len} ${CIRC}`, offset: -offset }
    offset += len
    return seg
  })
})
 
function goBack() {
  router.back()
}
</script>
 
<template>
  <div class="report-screen">
    <!-- 스크롤 영역 (스크롤할 때만 스크롤바 표시) -->
    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#191b1e" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">소비리포트</h1>
    </div>
 
    <!-- 주차별 막대 차트 -->
    <section class="section">
      <div class="sec-head">
        <span class="sec-title">{{ weekly.title }}</span>
        <!-- [API] 드롭다운 클릭 시 다른 주차 조회 → weekly 재요청 (지금은 표시만) -->
        <span class="caret">▾</span>
      </div>
      <p class="sec-sub">총 {{ won(weekly.total) }} 썼어요</p>
 
      <div class="bars">
        <div class="dashline"></div>
        <div v-for="bar in weekly.bars" :key="bar.label" class="bar-col">
          <span class="bar-val" :class="{ current: bar.current }">{{ won(bar.amount) }}</span>
          <div
            class="bar"
            :class="{ current: bar.current }"
            :style="{ height: barHeight(bar.amount) }"
          ></div>
          <span class="bar-label">{{ bar.label }}</span>
        </div>
      </div>
    </section>
 
    <!-- 월별 도넛 카드 -->
    <section class="card">
      <div class="sec-head">
        <span class="sec-title">{{ monthly.title }}</span>
        <!-- [API] 드롭다운 클릭 시 다른 월 조회 → monthly 재요청 (지금은 표시만) -->
        <span class="caret">▾</span>
      </div>
      <p class="sec-sub compact">{{ monthly.diffText }}</p>
 
      <div class="donut-wrap">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            v-for="(seg, i) in donutSegments"
            :key="i"
            cx="90" cy="90" r="66"
            fill="none"
            :stroke="seg.color"
            stroke-width="26"
            :stroke-dasharray="seg.dash"
            :stroke-dashoffset="seg.offset"
            transform="rotate(-90 90 90)"
          />
          <text x="90" y="84" text-anchor="middle" class="donut-label">이번 달</text>
          <text x="90" y="110" text-anchor="middle" class="donut-amount">{{ won(monthly.total) }}</text>
        </svg>
      </div>
    </section>
 
    <!-- 카테고리 리스트 -->
    <section class="cat-list">
      <div
        v-for="(cat, i) in categories"
        :key="cat.name"
        class="cat-row"
        :class="{ last: i === categories.length - 1 }"
      >
        <span class="cat-dot" :style="{ background: cat.color }"></span>
        <span class="cat-name">{{ cat.name }}</span>
        <span class="cat-pct">{{ cat.percent }}%</span>
        <span class="cat-amt">{{ won(cat.amount) }}</span>
      </div>
    </section>
    </div>
 
    <!-- 하단 탭바 (고정) -->
    <BottomTabBar active="report" @select="onTabSelect" />
  </div>
</template>
 
<style scoped>
.report-screen {
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
 
/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0 20px;
}
 
.icon-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
}
 
.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: #191b1e;
}
 
/* 섹션 공통 */
.section {
  padding: 0;
}
 
.sec-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  margin-left: 20px; 
}
 
.sec-title {
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
}
 
.caret {
  color: #b9bec5;
  font-size: 12px;
}
 
.sec-sub {
  font-weight: 600;
  font-size: 14px;
  color: #3b82f6;
  margin: 0 0 24px;
  margin-left: 20px; 
}
 
.sec-sub.compact {
  margin-bottom: 0;
}
 
/* 막대 차트 */
.bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
  position: relative;
  padding: 0 10px;
}
 
.dashline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 78px;
  border-top: 1.5px dashed #ffbc00;
}
 
.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
 
.bar-val {
  font-weight: 700;
  font-size: 12px;
  color: #b9bec5;
}
 
.bar-val.current {
  color: #ffbc00;
}
 
.bar {
  width: 46px;
  border-radius: 12px;
  background: #e8eaed;
}
 
.bar.current {
  background: #ffbc00;
}
 
.bar-label {
  font-size: 12px;
  color: #8b9097;
  font-weight: 500;
  margin-top: 6px;
}
 
/* 도넛 카드 */
.card {
  margin: 28px 0 0;
  padding: 24px 20px;
  border: 1px solid #eceef1;
  border-radius: 18px;
}
 
.donut-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
 
.donut-label {
  font-size: 12px;
  fill: #8b9097;
}
 
.donut-amount {
  font-size: 22px;
  font-weight: 700;
  fill: #191b1e;
}
 
/* 카테고리 리스트 */
.cat-list {
  padding: 20px 0 0;
}
 
.cat-row {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f1f3;
}
 
.cat-row.last {
  border-bottom: none;
}
 
.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
}
 
.cat-name {
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
  flex: 1;
}
 
.cat-pct {
  font-size: 14px;
  color: #b9bec5;
  font-weight: 500;
  margin-right: 16px;
}
 
.cat-amt {
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
}
 
/* 하단 탭바 고정 */
.report-screen :deep(.tabbar) {
  flex-shrink: 0;
}
</style>
 
