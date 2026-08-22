<template>
  <div class="score-view">
    <!-- 상단 네비바 — 화면 좌우 끝까지 꽉 차게 스크롤 영역 밖으로 뺀다 -->
    <header class="nav">
      <button class="back-btn" @click="goBack" aria-label="뒤로가기">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">티니점수</h1>
      <ChildNavActions />
    </header>

    <div class="scroll-area">

      <div v-if="loading" class="state-text">불러오는 중...</div>
      <div v-else-if="errorMsg" class="state-text error">{{ errorMsg }}</div>

      <template v-else>
      <!-- 상단 히어로 점수 카드 섹션 -->
      <section class="hero-section">
        <!-- 히어로 점수 카드 -->
        <div class="hero-card">
          <div class="hero-top-row">
            <!-- 도넛 차트 -->
            <div class="donut-wrap">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                <circle
                  class="donut-fill"
                  cx="65"
                  cy="65"
                  r="52"
                  fill="none"
                  :stroke="gradeColor"
                  stroke-width="12"
                  :stroke-dasharray="donutCircumference"
                  :stroke-dashoffset="donutOffset"
                  stroke-linecap="round"
                  transform="rotate(-90 65 65)"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-label">티니점수</span>
                <b class="donut-score">{{ score }}</b>
                <span class="donut-max">/ {{ SCORE_MAX }}</span>
              </div>
            </div>

            <!-- 현재 등급 -->
            <div class="grade-info-col">
              <div class="grade-header-row">
                <span class="sub-label">현재 등급</span>
              </div>

              <!-- 등급 명칭 -->
              <div class="grade-badge-row">
                <span class="badge-gold-text" :style="{ color: gradeColor }">{{ grade }}</span>
              </div>

              <!-- 안내 멘트 -->
              <p class="grade-status-desc">
                지금 아주 훌륭하게<br />신용 점수를 모으고 있어요!
              </p>
            </div>
          </div>

          <!-- 티니 점수 게이지 바 -->
          <div class="hero-progress-box">
            <div class="progress-info-row">
              <span class="gap-text">다음 등급까지 <strong>{{ remainingScore }}점</strong> 남았어요</span>
              <span class="next-target">{{ nextGradeMinScore ?? maxScore }}점 ({{ nextGradeName }})</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: progressPercent + '%', background: gradeColor }"></div>
            </div>
          </div>

          <!-- 상세보기 버튼 -->
          <button class="hero-detail-btn" @click="goGradeDetail">
            <span class="btn-text">티니 등급 상세보기</span>
            <span class="chev">›</span>
          </button>
        </div>
      </section>

      <!-- 지난달 대비 점수 변동 -->
      <section class="section-container">
        <div class="card weekly-diff-card">
          <div class="card-head-sm">
            <span class="title">지난달 대비 점수 변동</span>
            <span class="change-pill" :class="{ down: monthlyDiff < 0 }">
              {{ monthlyDiff >= 0 ? '▲ +' : '▼ ' }}{{ monthlyDiff }}점
            </span>
          </div>

          <p class="diff-sub-text">
            지난달({{ prevMonthScore }}점)보다
            <strong>{{ Math.abs(monthlyDiff) }}점 {{ monthlyDiff >= 0 ? '상승' : '하락' }}</strong>
            했어요.
          </p>

          <div class="compare-row">
            <div class="compare-item">
              <span class="comp-label">지난달</span>
              <b class="comp-val gray">{{ prevMonthScore }}점</b>
            </div>
            <span class="diff-arrow">→</span>
            <div class="compare-item">
              <span class="comp-label">이번 달</span>
              <b class="comp-val main">{{ score }}점</b>
            </div>
          </div>

          <div v-if="monthlyHistory.length" class="chart-wrap">
            <svg
              class="chart-svg"
              viewBox="0 0 300 148"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="childChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ffbc00" stop-opacity="0.32" />
                  <stop offset="70%" stop-color="#ffbc00" stop-opacity="0.06" />
                  <stop offset="100%" stop-color="#ffbc00" stop-opacity="0" />
                </linearGradient>
              </defs>

              <g stroke="#eceef1" stroke-width="1" stroke-dasharray="3 5">
                <line
                  v-for="(y, index) in chartGridYs"
                  :key="index"
                  :x1="28"
                  :x2="272"
                  :y1="y"
                  :y2="y"
                />
              </g>

              <path
                v-if="chartAreaPath"
                class="chart-area"
                :d="chartAreaPath"
                fill="url(#childChartGradient)"
              />
              <path
                v-if="chartPath"
                class="chart-line"
                :d="chartPath"
                fill="none"
                stroke="#ffbc00"
                stroke-width="2.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                pathLength="1"
              />

              <g
                v-for="(point, index) in chartPoints"
                :key="index"
                class="chart-point"
                :style="{ animationDelay: `${0.28 + index * 0.06}s` }"
              >
                <circle
                  v-if="point.isLast"
                  :cx="point.x"
                  :cy="point.y"
                  r="9"
                  fill="#ffbc00"
                  fill-opacity="0.16"
                />
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  :r="point.isLast ? 5.5 : 4.5"
                  fill="#ffffff"
                  stroke="#ffbc00"
                  :stroke-width="point.isLast ? 2.6 : 2"
                />
                <text
                  :x="point.x"
                  :y="point.y - 12"
                  text-anchor="middle"
                  fill="#191b1e"
                  font-size="11"
                  font-weight="700"
                >
                  {{ point.score }}점
                </text>
                <text
                  :x="point.x"
                  :y="140"
                  text-anchor="middle"
                  fill="#8b9097"
                  font-size="11"
                  font-weight="600"
                >
                  {{ point.label }}
                </text>
              </g>
            </svg>
          </div>

          <div v-if="monthlyHistory.length" class="monthly-list">
            <div
              v-for="item in monthlyHistoryDesc"
              :key="item.yearMonth"
              class="monthly-item"
            >
              <span class="monthly-label">{{ formatYearMonthLabel(item.yearMonth) }}</span>
              <strong class="monthly-score">{{ item.teenyScore }}점</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- 현재 등급 혜택 (슬라이드 형태) -->
      <section class="section-container">
        <div class="benefit-slide-header">
          <span class="title">현재 등급 혜택</span>
          <span class="slide-count">{{ benefits.length }}개 적용 중</span>
        </div>

        <div class="benefit-carousel" ref="carouselRef" @scroll="onCarouselScroll">
          <div v-for="(b, i) in benefits" :key="i" class="benefit-card">
            <span class="benefit-tag">{{ b.tag }}</span>
            <strong class="benefit-title">{{ b.title }}</strong>
            <p class="benefit-desc">{{ b.desc }}</p>
          </div>
        </div>

        <div class="carousel-indicators">
          <span v-for="(_, i) in benefits.slice(0, -1)" :key="i"
                class="dot" :class="{ active: i === activeBenefitCard }"></span>
        </div>
      </section>

      <!-- 최근 점수 변동 내역 (3개 요약) -->
      <section class="section-container last-section">
        <div class="card">
          <div class="history-head">
            <span class="title">최근 점수 변동 내역</span>
            <span class="all-link">전체 보기</span>
          </div>

          <div class="history-list">
            <div v-for="(item, i) in summaryActivities" :key="i" class="history-item">
              <div class="item-left">
                <span class="diff-val" :class="{ minus: item.diff < 0 }">
                  {{ item.diff > 0 ? '+' : '' }}{{ item.diff }}
                </span>
              </div>

              <div class="item-center">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-date">{{ item.date }}</span>
              </div>

              <span class="item-result-score">{{ item.resultScore }}점</span>
            </div>
          </div>
        </div>
      </section>

      </template>

    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="home" @select="onTabSelect" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import {
  getTeenyScore,
  getTeenyScoreGrades,
  getTeenyScoreMonthlyHistory,
  getMyHistories,
} from '@/api/teenyScore'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import {
  currentKstYearMonth,
  formatKstRelativeDay,
  getKstParts,
  parseServerDate,
} from '@/utils/datetime'

const router = useRouter()
const authStore = useAuthStore()
const { accessToken, memberId } = storeToRefs(authStore)
const childId = memberId

// ==================================================================
// 상태
// ==================================================================
const loading = ref(true)
const errorMsg = ref('')

const score = ref(0)
const grade = ref('')       // 백엔드 gradeName 그대로 (새싹/스타터/플러스/프로/마스터)
const minScore = ref(0)     // 현재 등급 구간의 최소값 (진행바용)
const maxScore = ref(0)     // 현재 등급 구간의 최대값 (진행바용)
const nextGradeName = ref('')
const nextGradeMinScore = ref(null) // 다음 등급의 시작 점수. 최고 등급이면 null
const gradeColor = ref('#facc15') // 현재 등급 색상 (API의 color 값, 도넛/진행바/등급명에 사용)

const overallMinScore = ref(0)
const overallMaxScore = ref(1000)

const prevMonthScore = ref(0)
const monthlyHistory = ref([])
const monthlyDiff = computed(() => score.value - prevMonthScore.value)

const bonusRate = ref(0)
const activities = ref([])

// ==================================================================
// 데이터 로드
// ==================================================================
async function loadScoreData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [scoreRes, gradesRes, monthlyRes, historyRes] = await Promise.all([
      getTeenyScore(accessToken.value, childId.value),
      getTeenyScoreGrades(accessToken.value),
      getTeenyScoreMonthlyHistory(accessToken.value, childId.value),
      getMyHistories(accessToken.value),
    ])

    // 현재 점수/등급
    const d = scoreRes.data
    score.value = d.teenyScore
    grade.value = d.gradeName
    minScore.value = d.minScore
    maxScore.value = d.maxScore
    bonusRate.value = d.bonusRate
    gradeColor.value = d.color

    const gradesAsc = [...gradesRes.data].sort((a, b) => a.minScore - b.minScore)
    const currentIdx = gradesAsc.findIndex((g) => g.gradeId === d.gradeId)
    const next = currentIdx >= 0 && currentIdx < gradesAsc.length - 1
      ? gradesAsc[currentIdx + 1]
      : null
    nextGradeName.value = next ? next.gradeName : d.gradeName
    nextGradeMinScore.value = next ? next.minScore : null

    if (gradesAsc.length > 0) {
      overallMinScore.value = gradesAsc[0].minScore
      overallMaxScore.value = gradesAsc[gradesAsc.length - 1].maxScore
    }

    const now = new Date()
    const currentYearMonth = currentKstYearMonth(now)

    const monthlyList = [...(monthlyRes.data ?? [])]
      .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
    monthlyHistory.value = monthlyList

    const pastMonths = monthlyList
      .filter((m) => m.yearMonth < currentYearMonth)
      .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))

    const prevMonthEntry = pastMonths[0] ?? null
    prevMonthScore.value = prevMonthEntry ? prevMonthEntry.teenyScore : score.value

    const histories = [...historyRes.data].sort((a, b) => {
      const parse = (v) => parseServerDate(v)?.getTime() ?? 0
      return parse(b.createdAt) - parse(a.createdAt)
    })
    activities.value = histories.map((h) => ({
      title: h.description,
      date: formatRelativeDate(h.createdAt),
      diff: h.amount,
      resultScore: h.scoreAfter,
    }))
  } catch (e) {
    errorMsg.value = e.message || '점수 정보를 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
}

function formatRelativeDate(dateVal) {
  return formatKstRelativeDay(dateVal)
}

onMounted(loadScoreData)

// ==================================================================
// 계산값
// ==================================================================
const SCORE_MAX = computed(() => overallMaxScore.value || 1000)
const SCORE_MIN = computed(() => overallMinScore.value || 0)

const remainingScore = computed(() => {
  if (nextGradeMinScore.value === null) return 0
  return Math.max(0, nextGradeMinScore.value - score.value)
})
const progressPercent = computed(() => {
  const target = nextGradeMinScore.value ?? maxScore.value
  const total = target - minScore.value
  if (total <= 0) return 0
  const current = score.value - minScore.value
  return Math.min(100, Math.max(0, (current / total) * 100))
})

const donutCircumference = 2 * Math.PI * 52
const donutFill = computed(() => {
  const total = SCORE_MAX.value - SCORE_MIN.value
  if (total <= 0) return 0
  const ratio = (score.value - SCORE_MIN.value) / total
  return Math.min(1, Math.max(0, ratio)) * donutCircumference
})
const animatedDonutFill = ref(0)
const donutOffset = computed(() => donutCircumference - animatedDonutFill.value)

watch(loading, async (isLoading) => {
  if (isLoading) {
    animatedDonutFill.value = 0
    return
  }

  animatedDonutFill.value = 0
  await nextTick()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animatedDonutFill.value = donutFill.value
    })
  })
})

const benefits = computed(() => [
  { tag: '금리 혜택', title: '저축 기본 이자 우대', desc: `연 +${bonusRate.value}%p 우대 금리 자동 적용` },
  { tag: '퀘스트', title: `${grade.value} 전용 퀘스트`, desc: '더 많은 포인트를 받는 퀘스트 오픈' },
  { tag: '배지', title: `${grade.value} 전용 프로필 배지`, desc: '마이페이지 전용 배지 부여' },
  { tag: '수수료', title: '송금 수수료 무제한 면제', desc: '어디로 보내든 송금 수수료 0원' },
])

const carouselRef = ref(null)
const activeBenefitCard = ref(0)

function onCarouselScroll() {
  const el = carouselRef.value
  if (!el) return
  const cardWidth = 210 + 10
  activeBenefitCard.value = Math.round(el.scrollLeft / cardWidth)
}

const summaryActivities = computed(() => activities.value.slice(0, 3))

const monthlyHistoryDesc = computed(() =>
  [...monthlyHistory.value].sort((a, b) =>
    b.yearMonth.localeCompare(a.yearMonth)
  )
)

function formatYearMonthLabel(yearMonth) {
  if (!yearMonth) return ''
  const [year, month] = yearMonth.split('-')
  return `${year}년 ${Number(month)}월`
}

const CHART_WIDTH = 300
const CHART_PAD_X = 28
const CHART_PAD_TOP = 26
const CHART_PAD_BOTTOM = 36
const CHART_PLOT_BOTTOM = 148 - CHART_PAD_BOTTOM

const chartGridYs = [CHART_PAD_TOP, (CHART_PAD_TOP + CHART_PLOT_BOTTOM) / 2, CHART_PLOT_BOTTOM]

const chartPoints = computed(() => {
  const data = monthlyHistory.value
  if (!data.length) return []

  const scores = data.map((item) => item.teenyScore)
  const maxScoreVal = Math.max(...scores)
  const minScoreVal = Math.min(...scores)
  const range = maxScoreVal - minScoreVal || 1
  const yMin = minScoreVal - range * 0.22
  const yMax = maxScoreVal + range * 0.22
  const yRange = yMax - yMin || 1
  const innerWidth = CHART_WIDTH - CHART_PAD_X * 2
  const innerHeight = CHART_PLOT_BOTTOM - CHART_PAD_TOP
  const step = data.length > 1 ? innerWidth / (data.length - 1) : 0
  const currentYear = `${getKstParts().year}년 `

  return data.map((item, index) => {
    const x = CHART_PAD_X + (data.length > 1 ? index * step : innerWidth / 2)
    const y =
      CHART_PAD_TOP +
      innerHeight -
      ((item.teenyScore - yMin) / yRange) * innerHeight

    return {
      x,
      y,
      score: item.teenyScore,
      label: formatYearMonthLabel(item.yearMonth).replace(currentYear, ''),
      isLast: index === data.length - 1,
    }
  })
})

const chartPath = computed(() => {
  const points = chartPoints.value
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const prev = points[index - 1]
    const dx = (point.x - prev.x) / 2
    return `${path} C ${prev.x + dx} ${prev.y}, ${point.x - dx} ${point.y}, ${point.x} ${point.y}`
  }, '')
})

const chartAreaPath = computed(() => {
  const points = chartPoints.value
  if (!points.length || !chartPath.value) return ''

  const firstX = points[0].x
  const lastX = points[points.length - 1].x
  return `${chartPath.value} L ${lastX} ${CHART_PLOT_BOTTOM} L ${firstX} ${CHART_PLOT_BOTTOM} Z`
})

function goBack() { router.push({ name: 'child-home' }) }
function goGradeDetail() { router.push({ name: 'child-score-grade' }) }

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'quest')   router.push({ name: 'child-quest-list' })
}
</script>

<style scoped>
.score-view {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }

.state-text {
  padding: 60px 0;
  text-align: center;
  font-size: 13px;
  color: #6a6f76;
}
.state-text.error {
  color: #e5484d;
}

.section-container {
  padding: 0 16px 12px;
}
.section-container.last-section {
  padding-bottom: 16px;
}

/* 메인 섹션 */
.hero-section {
  padding: 12px 18px 12px;
}

/* 상단 네비바 — 화면 좌우 끝까지 꽉 차게 */
.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 18px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.nav-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.hero-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 18px 16px 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.hero-top-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.donut-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.donut-fill {
  transition: stroke-dashoffset 0.4s ease-out;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #727e8e;
}

.donut-score {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
  line-height: 1;
}

.donut-max {
  font-size: 10px;
  font-weight: 700;
  color: #727e8e;
  margin-top: 2px;
}

.grade-info-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.grade-header-row {
  display: flex;
  align-items: center;
}

.sub-label {
  font-size: 12px;
  font-weight: 700;
  color: #727e8e;
}

.badge-gold-text {
  font-size: 22px;
  font-weight: 900;
  color: #eab308;
  letter-spacing: 0.5px;
}

.grade-status-desc {
  margin: 4px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  line-height: 1.4;
}

.hero-progress-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.progress-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.gap-text strong {
  color: #2563eb;
}

.next-target {
  font-size: 10px;
  color: #727e8e;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #facc15;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.hero-detail-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}

.btn-text {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
}

.chev {
  font-size: 16px;
  color: #727e8e;
}

.card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.card-head-sm {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-head-sm .title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.change-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8f8ee;
  color: #22c55e;
  font-size: 12px;
  font-weight: 700;
}

.change-pill.down {
  background: #ffe5e5;
  color: #ef4444;
}

.diff-sub-text {
  margin: 0 0 14px;
  font-size: 13px;
  color: #8b9097;
  line-height: 1.5;
}

.diff-sub-text strong {
  color: #191b1e;
}

.compare-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.compare-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.comp-label {
  font-size: 12px;
  color: #8b9097;
  text-align: center;
}

.comp-val {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.comp-val.gray { color: #8b9097; }
.comp-val.main { color: #191b1e; }

.diff-arrow {
  color: #d0d3d8;
  font-size: 18px;
}

.chart-wrap {
  margin-bottom: 16px;
  padding: 10px 2px 4px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #eef0f3;
}

.chart-svg {
  display: block;
  width: 100%;
  height: auto;
}

.chart-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: chart-draw 0.6s ease-out forwards;
}

.chart-area {
  opacity: 0;
  animation: chart-fade 0.4s ease-out 0.18s forwards;
}

.chart-point {
  opacity: 0;
  animation: chart-fade 0.3s ease-out forwards;
}

@keyframes chart-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes chart-fade {
  to {
    opacity: 1;
  }
}

.monthly-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monthly-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #eef0f3;
}

.monthly-label {
  font-size: 13px;
  color: #8b9097;
}

.monthly-score {
  font-size: 14px;
  color: #191b1e;
}

.benefit-slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 2px;
}

.benefit-slide-header .title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.slide-count {
  font-size: 11px;
  font-weight: 700;
  color: #727e8e;
}

.benefit-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.benefit-carousel::-webkit-scrollbar { display: none; }

.benefit-card {
  flex: 0 0 210px;
  scroll-snap-align: start;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.benefit-tag {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 800;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.benefit-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.benefit-desc {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: #4d596b;
  line-height: 1.35;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.carousel-indicators .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.2s;
}

.carousel-indicators .dot.active {
  width: 14px;
  border-radius: 3px;
  background: #0f172a;
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-head .title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.all-link {
  font-size: 11.5px;
  font-weight: 700;
  color: #4d596b;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #f8fafc;
}

.history-item:first-child { border-top: none; }

.item-left { width: 45px; }

.diff-val {
  font-size: 13px;
  font-weight: 900;
  color: #2563eb;
}

.diff-val.minus { color: #ef4444; }

.item-center {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.item-date {
  font-size: 9.5px;
  font-weight: 600;
  color: #727e8e;
}

.item-result-score {
  font-size: 12.5px;
  font-weight: 800;
  color: #2563eb;
}

</style>