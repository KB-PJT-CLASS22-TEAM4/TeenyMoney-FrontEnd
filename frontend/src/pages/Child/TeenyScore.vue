<template>
  <div class="score-view">
    <ChildPageNav title="티니점수" @back="goBack" />

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
                <button
                  type="button"
                  class="grade-info-btn"
                  aria-label="점수와 등급 갱신 안내"
                  @click="showGradeInfoModal = true"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                    <circle cx="12" cy="12" r="8.5" stroke="#9aa1ab" stroke-width="1.8"/>
                    <path d="M12 11v5" stroke="#9aa1ab" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="8" r="1" fill="#9aa1ab"/>
                  </svg>
                </button>
              </div>

              <!-- 등급 명칭 -->
              <div class="grade-badge-row">
                <span class="badge-gold-text" :style="{ color: gradeColor }">{{ grade }}</span>
              </div>

              <!-- 안내 멘트 -->
              <p class="grade-status-desc">
                지금 아주 훌륭하게<br />티니점수를 모으고 있어요!
              </p>
            </div>
          </div>

          <!-- 점수/등급 갱신 안내 팁 박스 -->
          <div v-if="showGradeInfoModal" class="grade-tip-box">
            <button type="button" class="grade-tip-close" aria-label="닫기" @click="showGradeInfoModal = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#15171b" stroke-width="2.4" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="grade-tip-head">
              <span class="grade-tip-title">왜 점수랑 등급이 다르지?</span>
            </div>
            <p class="grade-tip-text">점수는 지금 바로바로 올라가요!<br />근데 등급은 매달 1일에 딱 한 번만 바뀌어요.</p>
          </div>

          <!-- 티니 등급 세그먼트 바 (티니 등급 상세 페이지와 동일한 디자인) -->
          <div class="segment-wrap">
            <div class="segment-track">
              <div class="segment-track-bg">
                <div
                  v-for="(g, i) in gradesAsc"
                  :key="g.gradeId"
                  class="segment-fill"
                  :style="{ backgroundColor: g.color, width: segmentWidths[i] + '%' }"
                ></div>
              </div>
              <div class="segment-pointer" :style="{ left: thumbPercent + '%' }">
                <span class="segment-pointer-bubble">{{ isGradeMismatch ? '다음 달 등급' : '현재 등급' }}</span>
                <span class="segment-pointer-dot" :style="{ borderColor: (projectedGrade ?? currentGradeInfo).color }"></span>
              </div>
              <div
                v-if="isGradeMismatch"
                class="segment-pointer"
                :style="{ left: officialGradeCenterPercent + '%' }"
              >
                <span class="segment-pointer-bubble">현재 등급</span>
                <span class="segment-pointer-dot" :style="{ borderColor: currentGradeInfo.color }"></span>
              </div>
            </div>

            <div class="segment-labels">
              <span
                v-for="(g, i) in gradesAsc"
                :key="g.gradeId"
                class="segment-label"
                :class="{ active: g.label === grade }"
                :style="[{ width: segmentWidths[i] + '%' }, g.label === grade ? { color: g.color } : {}]"
              >
                {{ g.label }}
              </span>
            </div>

            <div class="segment-minmax">
              <span>{{ SCORE_MIN }}점</span>
              <span>{{ SCORE_MAX }}점</span>
            </div>
          </div>

          <!-- 상세보기 버튼 -->
          <button class="hero-detail-btn" @click="goGradeDetail">
            <span class="btn-text">티니 등급 상세보기</span>
            <span class="chev">›</span>
          </button>
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

      <!-- 최근 점수 변동 내역 (5개 요약) -->
      <section class="section-container last-section">
        <div class="card">
          <div class="history-head">
            <span class="title">최근 점수 변동 내역</span>
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

    <Chatbot hint-text="" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
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
const showGradeInfoModal = ref(false)

const score = ref(0)
const grade = ref('')       // 백엔드 gradeName 그대로 (새싹/스타터/플러스/프로/마스터)
const gradeColor = ref('#facc15') // 현재 등급 색상 (API의 color 값, 도넛/진행바/등급명에 사용)

const overallMinScore = ref(0)
const overallMaxScore = ref(1000)
const gradesAsc = ref([]) // 등급 세그먼트 바용 전체 등급 목록(오름차순)

const prevMonthScore = ref(0)
const monthlyHistory = ref([])
const monthlyDiff = computed(() => score.value - prevMonthScore.value)

const bonusRate = ref(0)
const loanRate = ref(null)
const monthlyOverrideLimit = ref(null)
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
    bonusRate.value = d.bonusRate
    gradeColor.value = d.color

    const sortedGrades = [...gradesRes.data].sort((a, b) => a.minScore - b.minScore)

    // 현재 등급의 실제 대출 금리/오늘만 허용 한도 (등급 목록 API에만 있는 값)
    const currentGradeRaw = sortedGrades.find((g) => g.gradeId === d.gradeId)
    loanRate.value = currentGradeRaw?.loanRate ?? null
    monthlyOverrideLimit.value = currentGradeRaw?.monthlyOverrideLimit ?? null

    if (sortedGrades.length > 0) {
      overallMinScore.value = sortedGrades[0].minScore
      overallMaxScore.value = sortedGrades[sortedGrades.length - 1].maxScore
    }

    gradesAsc.value = sortedGrades.map((g) => ({
      gradeId: g.gradeId,
      label: g.gradeName,
      min: g.minScore,
      max: g.maxScore,
      color: g.color,
    }))

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

// 티니 등급 상세 페이지와 동일한 등급 세그먼트 바 계산 로직
const currentGradeInfo = computed(
  () => gradesAsc.value.find((g) => g.label === grade.value) ?? { color: gradeColor.value }
)

const thumbPercent = computed(() => {
  const total = SCORE_MAX.value - SCORE_MIN.value
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, ((score.value - SCORE_MIN.value) / total) * 100))
})

const segmentWidths = computed(() => {
  const total = SCORE_MAX.value - SCORE_MIN.value
  if (total <= 0) return []
  return gradesAsc.value.map((g) => ((g.max - g.min + 1) / total) * 100)
})

// 실시간 점수가 지금 속한 등급 구간(= 다음 갱신일에 반영될 등급 예상치)
const projectedGrade = computed(
  () => gradesAsc.value.find((g) => score.value >= g.min && score.value <= g.max) ?? null
)

// 서버가 갱신한 공식 등급과 실시간 점수 기준 등급이 다른지 (월 1회 갱신 주기 때문에 발생)
const isGradeMismatch = computed(
  () => projectedGrade.value !== null && projectedGrade.value.label !== grade.value
)

// 공식 등급 구간의 중앙 위치(%) — 실시간 점수 포인터와 구분되는 별도 마커용
const officialGradeCenterPercent = computed(() => {
  const total = SCORE_MAX.value - SCORE_MIN.value
  if (total <= 0) return 0

  let offset = 0
  for (const g of gradesAsc.value) {
    const width = ((g.max - g.min + 1) / total) * 100
    if (g.label === grade.value) return offset + width / 2
    offset += width
  }
  return 0
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

// getTeenyScoreGrades API가 실제로 내려주는 값(bonusRate/loanRate/monthlyOverrideLimit)만으로 구성한다.
const benefits = computed(() => {
  const list = [
    { tag: '금리 혜택', title: '저축 기본 이자 우대', desc: `연 +${bonusRate.value}%p 우대 금리 자동 적용` },
  ]

  list.push(
    loanRate.value != null
      ? { tag: '대출 혜택', title: '대출 금리', desc: `대출 이용 시 연 ${loanRate.value}% 금리 적용` }
      : { tag: '대출 혜택', title: '대출 이용 제한', desc: '아직 대출 상품은 이용할 수 없어요' }
  )

  if (monthlyOverrideLimit.value != null) {
    list.push({
      tag: '오늘만 허용',
      title: '월간 요청 한도',
      desc: `오늘만 허용을 월 ${monthlyOverrideLimit.value}회까지 요청할 수 있어요`,
    })
  }

  return list
})

const carouselRef = ref(null)
const activeBenefitCard = ref(0)

function onCarouselScroll() {
  const el = carouselRef.value
  if (!el) return
  const cardWidth = 210 + 10
  activeBenefitCard.value = Math.round(el.scrollLeft / cardWidth)
}

const summaryActivities = computed(() => activities.value.slice(0, 5))

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
  padding-bottom: 90px;
  box-sizing: border-box;
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
  position: relative;
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
  gap: 4px;
}

.grade-info-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
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

/* 점수/등급 갱신 안내 팁 박스 — 레이아웃을 밀지 않고 등급 표시 영역 위에 겹쳐서 뜬다 (어린이 타겟, 말풍선 느낌) */
.grade-tip-box {
  position: absolute;
  top: 46px;
  right: 16px;
  width: 220px;
  z-index: 20;
  padding: 16px 18px 15px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
}

.grade-tip-head {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
}

.grade-tip-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #15171b;
}

.grade-tip-close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
}

.grade-tip-close:hover {
  background: #eef2f6;
}

.grade-tip-text {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #15171b;
  line-height: 1.6;
  word-break: keep-all;
}

/* 등급 세그먼트 바 (티니 등급 상세 페이지와 동일) */
.segment-wrap {
  margin-top: 26px;
  margin-bottom: 14px;
}

.segment-track {
  position: relative;
  padding-top: 14px;
}

.segment-track-bg {
  display: flex;
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
}

.segment-fill {
  height: 100%;
}

.segment-pointer {
  position: absolute;
  top: 19px;
  left: 0;
  width: 13px;
  height: 13px;
  transform: translate(-50%, -50%);
}

.segment-pointer-dot {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #999;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
}

.segment-pointer-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 9px;
  white-space: nowrap;
  background: #ffffff;
  color: #334155;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 9px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
}

.segment-pointer-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #ffffff;
}

.segment-labels {
  display: flex;
  width: 100%;
  margin-top: 8px;
}

.segment-label {
  box-sizing: border-box;
  text-align: center;
  font-size: 10.5px;
  font-weight: 600;
  color: #989ca2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.segment-label.active {
  font-weight: 800;
}

.segment-minmax {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10.5px;
  font-weight: 600;
  color: #989ca2;
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
  background: #eff6ff;
  color: #2563eb;
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