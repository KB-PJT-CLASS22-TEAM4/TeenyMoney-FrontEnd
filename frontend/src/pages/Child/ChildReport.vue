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
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
}

function goBack() {
  router.push({ name: 'child-home' })
}

function goToScore() {
  router.push({ name: 'child-score' })
}

// ============================================================
// [API 연동 필요] 머니 리포트 데이터
//
// 현재는 더미 데이터. 백엔드 API가 나오면 아래 데이터들을
// ref로 바꾸고 onMounted에서 API 응답으로 채우면 됨.
//
// [연동 방법]
//   1) 아래 const를 ref(null) / ref([])로 변경
//   2) api/report.js 에 조회 함수 작성 (finance.js 방식과 동일)
//        export async function getMoneyReport(accessToken, period) {
//          fetch(`.../api/v1/reports/money?period=${period}`, {
//            headers: { Authorization: `Bearer ${accessToken}` }
//          })
//        }
//   3) onMounted에서 조회 → 각 ref에 담기
//   4) 월 선택 pill(monthPill) 클릭 시 period 파라미터 바꿔 재호출
// ============================================================

const report = ref({
  period: { label: '8월 1일~13일', status: '진행 중' },
  compare: '비교 기간 2026-07-01 ~ 2026-07-13 (같은 일수 기준)',
})

const summary = ref([
  { icon: 'wallet', label: '사용한 돈', value: 38200, colorClass: '', desc: '7번 결제했어요.' },
  { icon: 'trending', label: '모은 돈', value: 20000, colorClass: 'green', desc: '예금과 적금에 넣었어요.' },
  { icon: 'coin', label: '직접 얻은 돈', value: 5000, colorClass: 'blue', desc: '퀘스트를 완료해서 받았어요.' },
  { icon: 'check', label: '갚은 돈', value: 10000, colorClass: '', desc: '대출을 1번 갚았어요.' },
])

const habits = ref([
  {
    dot: '#f0b352',
    title: '소비',
    desc: ['이번 달에는 7번 결제해서 모두 38,200원을 사용했어요.', '카페·디저트에서 가장 많이 사용했어요.'],
  },
  {
    dot: '#4a90d9',
    title: '소통 · 오늘만 허용',
    desc: ['게임 업종을 이용하려고 오늘만 허용을 1번 요청했어요.', '이유를 적어서 보냈고 부모님이 승인했어요.'],
  },
  {
    dot: '#4caf82',
    title: '저축 · 상환',
    desc: ['이번 달 적금 납입은 아직 완료하지 않았어요.', '대출은 5번 중 2번 갚았어요.'],
    checks: { done: 0, total: 6 },
    footer: '적금 6회 중 0회 완료 · 다음 납입일 8월 25일',
  },
  {
    dot: '#8b7dd8',
    title: '책임 · 퀘스트',
    desc: ['퀘스트 2개를 완료하고 5,000원을 받았어요.', '지금 1개를 하고 있어요.'],
  },
])

const spend = ref({
  label: '이번 달에 사용한 돈',
  amount: 38200,
  diffText: '+6,100원 증가',
  compareText: '전월 같은 기간 32,100원 · 횟수 +1회',
  weeks: [
    { label: '1주', amount: 10000, display: '10,000원', active: false },
    { label: '2주', amount: 16000, display: '16,000원', active: false },
    { label: '3주', amount: 13000, display: '13,000원', active: false },
    { label: '4주', amount: 9000, display: '9,000원', active: true },
  ],
  categories: [
    { name: '카페·디저트', amount: 9500, percent: 25, times: 3, color: '#f0b352' },
    { name: '편의점', amount: 8700, percent: 23, times: 1, color: '#4a90d9' },
    { name: '문구·도서·완구', amount: 7000, percent: 18, times: 1, color: '#4caf82' },
    { name: '게임', amount: 6500, percent: 17, times: 1, color: '#8b7dd8' },
    { name: '온라인쇼핑', amount: 6500, percent: 17, times: 1, color: '#3aa7a0' },
  ],
  topCategory: '카페·디저트',
})

const products = ref([
  {
    name: '티니 자유적금',
    tag: '가족 상품',
    tagClass: 'family',
    type: '적금',
    status: '유지 중',
    statusClass: '',
    period: '2026.05.25 ~ 2026.11.25',
    progress: { done: 3, total: 6, percent: 50, colorClass: 'green' },
    desc: '다음 납입일은 8월 25일이에요.',
  },
  {
    name: '튼튼 정기예금',
    tag: '금융기관 상품',
    tagClass: 'institution',
    type: '예금',
    status: '유지 중',
    statusClass: '',
    period: '2026.03.02 ~ 2026.09.02',
    desc: '지금 120,000원이 들어 있고 9월 2일에 만기가 돼요.',
  },
  {
    name: '자전거 대출',
    tag: '가족 상품',
    tagClass: 'family',
    type: '대출',
    status: '상환 진행 중',
    statusClass: 'blue',
    period: '2026.04.20 ~ 2026.09.20',
    progress: { done: 2, total: 5, percent: 40, colorClass: 'blue' },
    desc: '앞으로 갚을 돈은 30,000원이에요.',
  },
])

const score = ref({
  change: 3,
  up: 1,
  down: 0,
  detailLabel: '적금 정기 납입 완료',
  detailValue: '+3',
})

const schedules = ref([
  { dday: 'D-7', date: '8/20', title: '자전거 대출 상환', desc: '10,000원 낼 예정이에요', type: 'loan', theme: 'red', tagLabel: '대출' },
  { dday: 'D-12', date: '8/25', title: '티니 자유적금 납입', desc: '10,000원 넣을 예정이에요', type: 'saving', theme: 'yellow', tagLabel: '자유적금' },
  { dday: 'D-20', date: '9/2', title: '튼튼 정기예금 만기', desc: '120,000원 받을 예정이에요', type: 'deposit', theme: 'green', tagLabel: '예금' },
  { dday: 'D-25', date: '9/7', title: '반짝반짝 저금통 적금 납입', desc: '15,000원 넣을 예정이에요', type: 'saving', theme: 'yellow', tagLabel: '정액적금' },
])

// ---- 화면 계산 로직 ----

function won(n) {
  return n.toLocaleString('ko-KR') + '원'
}

// 요약 카드 아이콘별 배경/글자색
const ICON_STYLE = {
  wallet: { bg: '#f2f3f5', fg: '#6b7280' },
  trending: { bg: '#e6f6ec', fg: '#2f9e5b' },
  coin: { bg: '#eaf2fc', fg: '#2e72c7' },
  check: { bg: '#f2f3f5', fg: '#6b7280' },
}
function iconStyle(icon) {
  const s = ICON_STYLE[icon] || ICON_STYLE.wallet
  return { background: s.bg, color: s.fg }
}

// 저축 습관 카드의 회차 체크칩
function checkChips(h) {
  if (!h.checks) return []
  const arr = []
  for (let i = 1; i <= h.checks.total; i++) {
    arr.push({ n: i, done: i <= h.checks.done })
  }
  return arr
}

// [연동 필요] 실제로는 클릭 시 서버에 납입/상환 완료 처리 API 호출 후 결과로 done 갱신
// 지금은 로컬에서 바로 토글: 완료된 회차 클릭 → 그 회차부터 예정으로 되돌림
//            예정된 회차 클릭 → 그 회차까지 완료로 채움
function onCheckClick(habit, chip) {
  habit.checks.done = chip.done ? chip.n - 1 : chip.n
}

// 막대 차트 높이 (제일 큰 값 기준으로 비율)
const maxWeek = computed(() => Math.max(...spend.value.weeks.map((w) => w.amount), 1))
function barHeight(week) {
  if (week.empty) return '4px'
  return Math.max(Math.round((week.amount / maxWeek.value) * 76), 6) + 'px'
}

// 도넛 세그먼트 계산 (SVG stroke-dasharray)
const CIRC = 2 * Math.PI * 44 // 반지름 44의 둘레
const donutSegments = computed(() => {
  let offset = 0
  return spend.value.categories.map((c) => {
    const len = (c.percent / 100) * CIRC
    const seg = { color: c.color, dash: `${len} ${CIRC}`, offset: -offset }
    offset += len
    return seg
  })
})

// 가장 많이 쓴 카테고리 색상 (도넛 밖 캡션의 컬러 점에 사용)
const topCategoryColor = computed(() => {
  const found = spend.value.categories.find((c) => c.name === spend.value.topCategory)
  return found ? found.color : 'var(--ink-faint)'
})

// 카테고리 목록: 기본은 많이 쓴 순서로 상위 3개만, "전체 보기" 클릭 시 나머지도 펼침
const CATEGORY_PREVIEW_COUNT = 3
const showAllCategories = ref(false)
const sortedCategories = computed(() =>
  [...spend.value.categories].sort((a, b) => b.amount - a.amount)
)
const visibleCategories = computed(() =>
  showAllCategories.value
    ? sortedCategories.value
    : sortedCategories.value.slice(0, CATEGORY_PREVIEW_COUNT)
)
const hiddenCategoryCount = computed(() =>
  Math.max(0, sortedCategories.value.length - CATEGORY_PREVIEW_COUNT)
)
function toggleAllCategories() {
  showAllCategories.value = !showAllCategories.value
}

// 다가오는 금융 일정: 3개까지만 먼저 보여주고 "전체 보기" 클릭 시 나머지도 펼침
const SCHEDULE_PREVIEW_COUNT = 3
const showAllSchedules = ref(false)
const visibleSchedules = computed(() =>
  showAllSchedules.value
    ? schedules.value
    : schedules.value.slice(0, SCHEDULE_PREVIEW_COUNT)
)
const hiddenScheduleCount = computed(() =>
  Math.max(0, schedules.value.length - SCHEDULE_PREVIEW_COUNT)
)
function toggleAllSchedules() {
  showAllSchedules.value = !showAllSchedules.value
}
</script>

<template>
  <div class="report-screen">
    <div class="scroll">

      <!-- 상단 네비 -->
      <div class="nav">
        <div class="nav-left">
          <button class="icon-btn" @click="goBack" aria-label="뒤로">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#16181c" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="nav-title">머니리포트</span>
        </div>
        <!-- [API] 클릭 시 월 선택 시트 오픈 → period 재요청 (지금은 표시만) -->
        <button class="month-pill">
          {{ '2026년 8월' }}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#392b00" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>

      <div class="date-row">
        <span class="date-text">{{ report.period.label }}</span>
        <span class="status-badge">{{ report.period.status }}</span>
      </div>
      <p class="compare-line">{{ report.compare }}</p>

      <!-- 이번 달 한눈에 보기 -->
      <section>
        <h2 class="sec-heading">이번 달 한눈에 보기</h2>
        <div class="stat-grid">
          <div class="stat-card" v-for="s in summary" :key="s.label">
            <div class="stat-icon" :style="iconStyle(s.icon)">
              <svg v-if="s.icon === 'wallet'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12.3h.01"/><path d="M3 10h18"/></svg>
              <svg v-else-if="s.icon === 'trending'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
              <svg v-else-if="s.icon === 'coin'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.6 9.7c0-1.1 1-1.9 2.4-1.9s2.4.8 2.4 1.8c0 2.3-4.8 1.8-4.8 4.1 0 1 1 1.8 2.4 1.8s2.4-.8 2.4-1.8"/></svg>
              <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.5 2.5 5-5.2"/></svg>
            </div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-value" :class="s.colorClass">{{ won(s.value) }}</div>
            <div class="stat-desc">{{ s.desc }}</div>
          </div>
        </div>
      </section>

      <!-- 이번 달 금융 습관 -->
      <section>
        <h2 class="sec-heading">이번 달 금융 습관</h2>
        <div class="habit-card" v-for="h in habits" :key="h.title">
          <div class="habit-head">
            <div class="habit-title"><span class="habit-dot" :style="{ background: h.dot }"></span>{{ h.title }}</div>
          </div>
          <div class="habit-desc">
            <span v-for="(line, i) in h.desc" :key="i">{{ line }}<br v-if="i < h.desc.length - 1" /></span>
          </div>
          <template v-if="h.checks">
            <div class="checks-row">
              <button
                v-for="c in checkChips(h)"
                :key="c.n"
                type="button"
                class="check-chip"
                :class="{ pending: !c.done }"
                :aria-label="`${c.n}회차 ${c.done ? '완료' : '예정'}`"
                @click="onCheckClick(h, c)"
              >{{ c.done ? '✓' : '·' }} {{ c.n }}회</button>
            </div>
            <div class="habit-footer">{{ h.footer }}</div>
          </template>
        </div>
      </section>

      <!-- 소비 명세 -->
      <section>
        <h2 class="sec-heading">소비 명세</h2>
        <div class="spend-card">
          <p class="spend-label">{{ spend.label }}</p>
          <p class="spend-amount">{{ won(spend.amount) }}</p>
          <span class="spend-diff">{{ spend.diffText }}</span>
          <p class="spend-compare">{{ spend.compareText }}</p>

          <div class="bar-chart">
            <div class="bar-col" v-for="w in spend.weeks" :key="w.label">
              <span class="bar-amt">{{ w.display }}</span>
              <div
                class="bar"
                :class="{ active: w.active, empty: w.empty }"
                :style="{ height: barHeight(w) }"
              ></div>
              <span class="bar-week" :class="{ active: w.active }">{{ w.label }}</span>
            </div>
          </div>

          <div class="top-cat-row">
            <span class="top-cat-label">이번 달 가장 많이 쓴 카테고리</span>
            <span class="top-cat-name">
              <span class="top-cat-dot" :style="{ background: topCategoryColor }"></span>
              {{ spend.topCategory }}
            </span>
          </div>

          <div class="donut-section">
            <svg width="98" height="98" viewBox="0 0 120 120">
              <circle
                v-for="(seg, i) in donutSegments"
                :key="i"
                cx="60" cy="60" r="44"
                fill="none"
                :stroke="seg.color"
                stroke-width="17"
                :stroke-dasharray="seg.dash"
                :stroke-dashoffset="seg.offset"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="57" text-anchor="middle" font-size="9" font-weight="600" fill="#94a3b8">총 사용</text>
              <text x="60" y="73" text-anchor="middle" font-size="13" font-weight="800" fill="#0f172a">{{ won(spend.amount) }}</text>
            </svg>
            <div class="donut-legend">
              <div class="legend-row" v-for="c in visibleCategories" :key="c.name">
                <span class="legend-dot" :style="{ background: c.color }"></span>
                <span class="legend-name">{{ c.name }}</span>
                <span class="legend-amt">{{ won(c.amount) }}</span>
              </div>
            </div>
          </div>

          <div class="cat-list">
            <div class="cat-row" v-for="c in visibleCategories" :key="c.name + '-row'">
              <span class="legend-dot" :style="{ background: c.color }"></span>
              <span class="cat-name">{{ c.name }}</span>
              <span class="cat-stat">{{ c.times }}회 · {{ c.percent }}%</span>
            </div>
          </div>

          <button class="btn-outline" v-if="sortedCategories.length > CATEGORY_PREVIEW_COUNT" @click="toggleAllCategories">
            {{ showAllCategories ? '접기' : `전체 보기 (카테고리 ${hiddenCategoryCount}개 더보기)` }}
          </button>
        </div>
      </section>

      <!-- 금융상품 진행 상태 -->
      <section>
        <h2 class="sec-heading">금융상품 진행 상태</h2>
        <div class="product-card" v-for="p in products" :key="p.name">
          <div class="product-head">
            <span class="product-name">{{ p.name }}</span>
            <span class="tag" :class="p.tagClass">{{ p.tag }}</span>
          </div>
          <div class="product-sub">{{ p.type }} · <span class="status" :class="p.statusClass">{{ p.status }}</span></div>
          <div class="product-period">{{ p.period }}</div>
          <template v-if="p.progress">
            <div class="progress-track">
              <div class="progress-fill" :class="p.progress.colorClass" :style="{ width: p.progress.percent + '%' }"></div>
            </div>
            <div class="progress-label">
              {{ p.type === '대출' ? '상환' : '납입' }} {{ p.progress.done }}/{{ p.progress.total }}회 · {{ p.progress.percent }}%
            </div>
          </template>
          <div class="product-desc">{{ p.desc }}</div>
          <div class="product-link">
            상품 자세히 보기
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </div>
      </section>

      <!-- 이달의 티니점수 변화 -->
      <section>
        <h2 class="sec-heading">이달의 티니점수 변화</h2>
        <div class="score-card">
          <div class="score-head">
            <div class="score-head-left">
              <div class="score-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
              </div>
              <div class="score-head-text">
                <span class="score-label">이번 달 점수 변화</span>
                <span class="score-value">+{{ score.change }}점</span>
              </div>
            </div>
            <div class="score-stats">
              <span class="score-stat up"><span class="stat-dot"></span>증가 {{ score.up }}건</span>
              <span class="score-stat down"><span class="stat-dot"></span>감소 {{ score.down }}건</span>
            </div>
          </div>
          <div class="score-detail-row">
            <span class="score-detail-label">{{ score.detailLabel }}</span>
            <span class="score-detail-value">{{ score.detailValue }}</span>
          </div>
          <button type="button" class="score-link" @click="goToScore">
            티니점수 자세히 보기
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </section>

      <!-- 다가오는 금융 일정 -->
      <section>
        <div class="sec-head-row">
          <h2 class="sec-heading">다가오는 금융 일정</h2>
          <span class="sec-count">{{ schedules.length }}</span>
        </div>
        <div class="schedule-box" v-if="schedules.length > 0">
          <div
            class="schedule-row"
            :class="{ 'border-top': i > 0 }"
            v-for="(s, i) in visibleSchedules"
            :key="s.title"
          >
            <div class="schedule-date-tile" :class="`tile--${s.theme}`">
              <span class="tile-dday">{{ s.dday }}</span>
              <span class="tile-date">{{ s.date }}</span>
            </div>
            <div class="schedule-detail">
              <div class="schedule-detail-top">
                <span class="schedule-name">{{ s.title }}</span>
                <span class="schedule-type-badge" :class="`badge-text--${s.theme}`">{{ s.tagLabel }}</span>
              </div>
              <p class="schedule-desc">{{ s.desc }}</p>
            </div>
          </div>
        </div>
        <div v-else class="schedule-empty">
          <p class="empty-text">예정된 금융 일정이 없어요</p>
        </div>
        <button
          class="btn-outline schedule-more-btn"
          v-if="schedules.length > SCHEDULE_PREVIEW_COUNT"
          @click="toggleAllSchedules"
        >
          {{ showAllSchedules ? '접기' : `전체 보기 (일정 ${hiddenScheduleCount}개 더보기)` }}
        </button>
      </section>

    </div>

    <!-- 하단 탭바 (고정) -->
    <BottomTabBar active="report" @select="onTabSelect" />
  </div>
</template>

<style scoped>
.report-screen {
  --card: #ffffff;
  --card-border: #eaedf1;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.03);
  --ink: #0f172a;
  --ink-sub: #64748b;
  --ink-faint: #94a3b8;
  --yellow: #ffbc00;
  --orange: #f0b352;
  --orange-tag-bg: #fdf0dd;
  --orange-tag-fg: #b5793a;
  --blue: #4a90d9;
  --green: #4caf82;
  --green-tag-bg: #e6f6ec;
  --green-tag-fg: #2f9e5b;
  --blue-tag-bg: #eaf2fc;
  --blue-tag-fg: #2e72c7;
  --line: #f1f5f9;
  --radius-lg: 20px;
  --radius-md: 20px;
  --radius-sm: 12px;

  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid var(--card-border);
  overflow: hidden;
  color: var(--ink);
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 40px;
}
.scroll::-webkit-scrollbar { width: 4px; }
.scroll::-webkit-scrollbar-thumb { background: #e2e4e8; border-radius: 999px; }

/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 18px;
}
.nav-left { display: flex; align-items: center; gap: 6px; }
.icon-btn {
  border: none;
  background: transparent;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  transition: background 0.15s ease;
}
.icon-btn:hover { background: #f2f3f5; }
.nav-title { font-weight: 900; font-size: 18px; letter-spacing: -0.01em; color: var(--ink); margin-left: 2px; }
.month-pill {
  background: var(--yellow);
  border: none;
  border-radius: 999px;
  padding: 8px 12px 8px 14px;
  font-weight: 700;
  font-size: 13.5px;
  color: #392b00;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(255,188,0,0.35);
  transition: transform 0.12s ease;
}
.month-pill:active { transform: scale(0.97); }

.date-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.date-text { font-size: 14.5px; font-weight: 700; color: var(--ink); }
.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--green-tag-bg);
  color: var(--green-tag-fg);
}
.compare-line { margin: 4px 0 0; font-size: 12px; color: var(--ink-faint); margin-bottom: 28px; }

h2.sec-heading {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 0 0 12px;
}

section { margin-bottom: 30px; }

/* 2x2 요약 카드 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stat-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-md);
  padding: 16px 14px;
}
.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.stat-label { font-size: 12.5px; color: var(--ink-sub); margin-bottom: 4px; font-weight: 600; }
.stat-value { font-size: 19px; font-weight: 800; color: var(--ink); margin-bottom: 6px; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.stat-value.green { color: var(--green-tag-fg); }
.stat-value.blue { color: var(--blue-tag-fg); }
.stat-desc { font-size: 11.5px; color: var(--ink-faint); line-height: 1.4; }

/* 금융 습관 카드 */
.habit-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 10px;
}
.habit-head {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.habit-title { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 14.5px; color: var(--ink); }
.habit-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.habit-desc { font-size: 13.5px; color: #3d3f44; line-height: 1.7; word-break: keep-all; overflow-wrap: break-word; }

.checks-row { display: flex; gap: 6px; margin: 12px 0 8px; }
.check-chip {
  flex: 1;
  background: var(--green-tag-bg);
  border: none;
  border-radius: var(--radius-sm);
  padding: 7px 0;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--green-tag-fg);
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.1s ease;
}
.check-chip:hover { filter: brightness(0.97); }
.check-chip:active { transform: scale(0.96); }
.check-chip:focus-visible { outline: 2px solid var(--green-tag-fg); outline-offset: 2px; }
.check-chip.pending {
  background: #f5f6f8;
  color: var(--ink-faint);
}
.habit-footer { font-size: 12px; color: var(--ink-sub); font-weight: 500; }

/* 소비 명세 카드 */
.spend-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-lg);
  padding: 20px 18px;
}
.spend-label { font-size: 13px; color: var(--ink-sub); margin: 0; font-weight: 600; }
.spend-amount { font-size: 25px; font-weight: 900; color: var(--ink); margin: 2px 0 10px; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.spend-diff {
  display: inline-block;
  background: var(--orange-tag-bg);
  color: var(--orange-tag-fg);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}
.spend-compare { margin: 4px 0 0; font-size: 12px; color: var(--ink-faint); margin-bottom: 20px; }

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 92px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
}
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
.bar { width: 100%; max-width: 34px; border-radius: 8px 8px 3px 3px; background: var(--yellow); transition: height 0.25s ease; }
.bar.empty { background: transparent; border: 1.5px dashed #d7d9dd; }
.bar-week { font-size: 11px; color: var(--ink-sub); font-weight: 600; text-align: center; }
.bar-week.active { color: #a67300; font-weight: 800; }
.bar-amt { font-size: 10px; color: var(--ink-faint); font-variant-numeric: tabular-nums; white-space: nowrap; text-align: center; }

.top-cat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 18px;
}
.top-cat-label { font-size: 12.5px; color: var(--ink-sub); font-weight: 600; }
.top-cat-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
}
.top-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.donut-section { display: flex; align-items: center; gap: 14px; margin: 14px 0 16px; }
.donut-legend { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.legend-row { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; min-width: 0; color: var(--ink); font-weight: 600; white-space: nowrap; overflow: hidden; }
.legend-amt { flex-shrink: 0; min-width: 54px; text-align: right; color: var(--ink); font-weight: 700; font-variant-numeric: tabular-nums; }

.cat-list { display: flex; flex-direction: column; margin-bottom: 18px; }
.cat-row { display: flex; align-items: center; gap: 8px; font-size: 13.5px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.cat-row:last-child { border-bottom: none; }
.cat-row .legend-dot { width: 8px; height: 8px; }
.cat-row .cat-name { flex: 1; min-width: 0; color: var(--ink); font-weight: 600; white-space: nowrap; overflow: hidden; }
.cat-row .cat-stat { flex-shrink: 0; min-width: 66px; text-align: right; color: var(--ink-sub); font-size: 12.5px; font-variant-numeric: tabular-nums; }

.btn-outline {
  width: 100%;
  background: transparent;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 12px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink-sub);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn-outline:hover { background: #f8f9fa; border-color: #e2e4e8; }

/* 금융상품 카드 */
.product-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 10px;
}
.product-head { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.product-name { font-weight: 800; font-size: 15px; color: var(--ink); letter-spacing: -0.01em; }
.tag {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}
.tag.family { background: var(--green-tag-bg); color: var(--green-tag-fg); }
.tag.institution { background: var(--blue-tag-bg); color: var(--blue-tag-fg); }
.product-sub { font-size: 13px; color: var(--ink-sub); margin-bottom: 2px; font-weight: 500; }
.product-sub .status { color: var(--green-tag-fg); font-weight: 700; }
.product-sub .status.blue { color: var(--blue-tag-fg); }
.product-period { font-size: 11.5px; color: var(--ink-faint); margin-bottom: 12px; font-variant-numeric: tabular-nums; }

.progress-track {
  width: 100%;
  height: 7px;
  background: #f0f1f3;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill { height: 100%; border-radius: 999px; }
.progress-fill.green { background: var(--green); }
.progress-fill.blue { background: var(--blue); }
.progress-label { font-size: 12.5px; font-weight: 700; color: var(--ink); margin-bottom: 6px; font-variant-numeric: tabular-nums; }
.product-desc { font-size: 13px; color: var(--ink-sub); margin-bottom: 10px; }
.product-link { display: flex; align-items: center; gap: 2px; font-size: 12.5px; font-weight: 700; color: var(--ink-sub); }

/* 티니점수 카드 */
.score-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-lg);
  padding: 18px;
}
.score-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.score-head-left { display: flex; align-items: center; gap: 10px; }
.score-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--green-tag-bg);
  color: var(--green-tag-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.score-head-text { display: flex; flex-direction: column; gap: 3px; }
.score-label { font-size: 12.5px; color: var(--ink-sub); font-weight: 600; }
.score-value { font-size: 20px; font-weight: 900; color: var(--green-tag-fg); letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }

.score-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; padding-top: 2px; }
.score-stat { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.score-stat.up { color: var(--green-tag-fg); }
.score-stat.down { color: var(--ink-faint); }
.stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: currentColor; }

.score-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}
.score-detail-label { color: var(--ink); font-weight: 600; }
.score-detail-value { color: var(--green-tag-fg); font-weight: 800; font-variant-numeric: tabular-nums; }

.score-link {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-sub);
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
}

/* 다가오는 금융 일정 */
.sec-head-row { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.sec-head-row .sec-heading { margin: 0; }
.sec-count {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--yellow);
  background: #fff8e5;
  padding: 1px 6px;
  border-radius: 999px;
}

.schedule-box {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-lg);
  padding: 4px 16px;
}
.schedule-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
}
.schedule-row.border-top { border-top: 1px solid var(--line); }

.schedule-date-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  margin-right: 12px;
  flex-shrink: 0;
}
.tile-dday { font-size: 11.5px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
.tile-date { font-size: 9.5px; font-weight: 700; line-height: 1; margin-top: 3px; font-variant-numeric: tabular-nums; }

.tile--green { background: #eef8ee; color: #2e8540; }
.tile--yellow { background: #fff8e5; color: #d97706; }
.tile--red { background: #fff0f0; color: #e5484d; }

.schedule-detail { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.schedule-detail-top { display: flex; align-items: center; gap: 6px; }
.schedule-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.schedule-type-badge {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
}
.badge-text--green { background: #eef8ee; color: #2e8540; }
.badge-text--yellow { background: #fff8e5; color: #d97706; }
.badge-text--red { background: #fff0f0; color: #e5484d; }
.schedule-desc { margin: 0; font-size: 11.5px; font-weight: 600; color: var(--ink-sub); line-height: 1.2; }

.schedule-empty {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  text-align: center;
}
.schedule-empty .empty-text { margin: 0; font-size: 12.5px; font-weight: 700; color: var(--ink-faint); }
.schedule-more-btn { margin-top: 10px; }

/* 하단 탭바 고정 */
.report-screen :deep(.tabbar) {
  flex-shrink: 0;
}
</style>