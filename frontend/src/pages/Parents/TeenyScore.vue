<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">티니점수</h1>
      <ParentNavActions />
    </header>

    <div v-if="isLoading" class="state-box">
      <p>불러오는 중입니다...</p>
    </div>

    <div v-else-if="errorMessage" class="state-box">
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-else class="content">
      <section class="score-summary">
        <div class="hero-card">
          <div class="hero-top-row">
            <div class="donut-wrap">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                <circle
                  class="donut-fill"
                  cx="65"
                  cy="65"
                  r="52"
                  fill="none"
                  :stroke="scoreData.gradeColor"
                  stroke-width="12"
                  :stroke-dasharray="donutCircumference"
                  :stroke-dashoffset="donutOffset"
                  stroke-linecap="round"
                  transform="rotate(-90 65 65)"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-label">티니점수</span>
                <b class="donut-score">{{ scoreData.teenyScore }}</b>
                <span class="donut-max">/ {{ scoreMax }}</span>
              </div>
            </div>

            <div class="grade-info-col">
              <div class="grade-header-row">
                <span class="sub-label">현재 등급</span>
              </div>
              <div class="grade-badge-row">
                <span
                  class="badge-gold-text"
                  :style="{ color: scoreData.gradeColor }"
                >
                  {{ scoreData.gradeName }}
                </span>
              </div>
              <p class="grade-status-desc">
                지금 아주 훌륭하게<br />신용 점수를 모으고 있어요!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="change-section">
        <div class="section-title-row">
          <span class="section-title">자녀의 등급 변화</span>
          <button
            class="help-btn"
            type="button"
            aria-label="등급 안내"
            @click="showInfoModal = true"
          >
            ?
          </button>
        </div>

        <div class="change-card">
          <div class="change-head">
            <span class="change-label">지난달 대비 점수 변동</span>
            <span class="change-pill" :class="{ down: scoreData.diff < 0 }">
              {{ scoreData.diff >= 0 ? '▲ +' : '▼ ' }}{{ scoreData.diff }}점
            </span>
          </div>

          <p class="change-desc">
            지난달({{ prevMonthScore }}점)보다
            <strong>{{ Math.abs(scoreData.diff) }}점 {{ scoreData.diff >= 0 ? '상승' : '하락' }}</strong>
            했어요.
          </p>

          <div class="compare-row">
            <div class="compare-item">
              <span class="compare-label">지난달</span>
              <strong class="compare-value muted">{{ prevMonthScore }}점</strong>
            </div>
            <span class="compare-arrow">→</span>
            <div class="compare-item">
              <span class="compare-label">이번 달</span>
              <strong class="compare-value">{{ scoreData.teenyScore }}점</strong>
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
                <linearGradient id="parentChartGradient" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#parentChartGradient)"
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
    </div>

    <div
      v-if="showInfoModal"
      class="info-overlay"
      @click.self="showInfoModal = false"
    >
      <div class="info-popup" role="dialog" aria-modal="true" aria-labelledby="info-popup-title">
        <p id="info-popup-title" class="info-title">등급 안내</p>

        <div class="info-guide-list">
          <div
            v-for="gradeItem in gradesDesc"
            :key="gradeItem.gradeId"
            class="guide-row"
            :class="{ current: gradeItem.label === scoreData.gradeName }"
          >
            <span
              class="guide-dot"
              :style="{ backgroundColor: gradeItem.color }"
            ></span>
            <div class="guide-text">
              <div class="guide-title-row">
                <b class="guide-label">{{ gradeItem.label }}</b>
                <span class="guide-range faint">
                  {{ gradeItem.min }}~{{
                    gradeItem.max === scoreMax
                      ? gradeItem.max.toLocaleString()
                      : gradeItem.max
                  }}점
                </span>
                <span
                  v-if="gradeItem.label === scoreData.gradeName"
                  class="current-badge"
                  :style="{ backgroundColor: gradeItem.color }"
                >
                  현재
                </span>
              </div>
              <span class="guide-headline">{{ gradeItem.headline }}</span>
              <ul class="guide-perks">
                <li v-for="(perk, index) in gradeItem.perks" :key="index">
                  {{ perk }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <button
          class="info-close-btn"
          type="button"
          @click="showInfoModal = false"
        >
          확인
        </button>
      </div>
    </div>

    <ParentBottomNav active="child" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  getTeenyScore,
  getTeenyScoreMonthlyHistory,
  getTeenyScoreGrades,
} from '@/api/teenyScore'
import {
  GRADE_ID_META,
  FALLBACK_GRADE_META,
} from '@/utils/teenyScoreGradeMeta'
import { currentKstYearMonth, getKstParts } from '@/utils/datetime'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const childId = computed(() => route.params.childId)
const isLoading = ref(false)
const errorMessage = ref('')

const scoreData = ref({
  teenyScore: 0,
  gradeName: '',
  minScore: 0,
  maxScore: 0,
  gradeColor: '#3b82f6',
  bonusRate: 0,
  diff: 0,
})

const gradesAsc = ref([])
const monthlyHistory = ref([])
const prevMonthScore = ref(0)
const showInfoModal = ref(false)

const scoreMin = computed(
  () => gradesAsc.value[0]?.min ?? 0
)

const scoreMax = computed(
  () => gradesAsc.value[gradesAsc.value.length - 1]?.max ?? 1000
)

const gradesDesc = computed(() => [...gradesAsc.value].reverse())

const donutCircumference = 2 * Math.PI * 52

const donutOffset = computed(() => {
  const total = scoreMax.value - scoreMin.value
  if (total <= 0) return donutCircumference
  const ratio = Math.min(
    1,
    Math.max(0, (scoreData.value.teenyScore - scoreMin.value) / total)
  )
  return donutCircumference * (1 - ratio)
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

function calcMonthDiff(currentScore, history) {
  const currentYearMonth = currentKstYearMonth()

  const prevMonthEntry = [...history]
    .filter((item) => item.yearMonth < currentYearMonth)
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))[0]

  if (!prevMonthEntry) return { diff: 0, prevScore: currentScore }
  return {
    diff: currentScore - prevMonthEntry.teenyScore,
    prevScore: prevMonthEntry.teenyScore,
  }
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
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const range = maxScore - minScore || 1
  const yMin = minScore - range * 0.22
  const yMax = maxScore + range * 0.22
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

async function loadTeenyScore() {
  isLoading.value = true

  try {
    const [scoreRes, historyRes, gradesRes] = await Promise.all([
      getTeenyScore(authStore.accessToken, childId.value),
      getTeenyScoreMonthlyHistory(authStore.accessToken, childId.value),
      getTeenyScoreGrades(authStore.accessToken),
    ])

    if (scoreRes.success) {
      const data = scoreRes.data
      const history = historyRes.success ? (historyRes.data ?? []) : []
      const { diff, prevScore } = calcMonthDiff(data.teenyScore ?? 0, history)

      scoreData.value = {
        teenyScore: data.teenyScore ?? 0,
        gradeName: data.gradeName ?? '',
        minScore: data.minScore ?? 0,
        maxScore: data.maxScore ?? 0,
        gradeColor: data.color ?? '#3b82f6',
        bonusRate: data.bonusRate ?? 0,
        diff,
      }
      prevMonthScore.value = prevScore
    }

    if (historyRes.success) {
      monthlyHistory.value = [...(historyRes.data ?? [])]
        .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
    }

    if (gradesRes.success) {
      gradesAsc.value = [...(gradesRes.data ?? [])]
        .sort((a, b) => a.minScore - b.minScore)
        .map((grade) => {
          const meta = GRADE_ID_META[grade.gradeId] ?? FALLBACK_GRADE_META
          return {
            gradeId: grade.gradeId,
            label: grade.gradeName,
            min: grade.minScore,
            max: grade.maxScore,
            color: grade.color ?? '#3b82f6',
            headline: meta.headline,
            perks: meta.perks,
          }
        })
    }
  } catch (error) {
    console.error('티니 등급 불러오기 실패:', error)
    errorMessage.value = '티니 등급 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

watch(childId, (id, prev) => {
  if (!id || String(id) === String(prev)) return
  loadTeenyScore()
})

onMounted(loadTeenyScore)
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;
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

.state-box {
  padding: 60px 0;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.error-text {
  color: #ff3b30;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px;
}

.score-summary {
  display: flex;
  flex-direction: column;
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
  gap: 6px;
}

.sub-label {
  font-size: 12px;
  font-weight: 700;
  color: #727e8e;
}

.help-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #d0d3d8;
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  color: #8b9097;
  cursor: pointer;
  line-height: 1;
  padding: 0;
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

.section-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
}

.eyebrow,
.section-title {
  display: block;
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.guide-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f1f3;
}

.guide-row:last-child {
  border-bottom: none;
}

.guide-row.current {
  background: #fff8e5;
  margin: 0 -8px;
  padding: 12px 8px;
  border-radius: 12px;
  border-bottom: none;
}

.guide-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.guide-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.guide-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-label {
  font-weight: 800;
  font-size: 15px;
  color: #15171b;
}

.guide-range,
.faint {
  font-weight: 600;
  font-size: 12.5px;
  color: #b9bec5;
}

.current-badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 11px;
  color: #ffffff;
  flex-shrink: 0;
}

.guide-headline {
  font-weight: 700;
  font-size: 12.5px;
  color: #4a4e55;
}

.guide-perks {
  margin: 4px 0 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.guide-perks li {
  font-weight: 500;
  font-size: 12px;
  line-height: 17px;
  color: #b9bec5;
}

.change-section {
  display: flex;
  flex-direction: column;
}

.change-card {
  padding: 16px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.change-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.change-label {
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
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

.change-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: #8b9097;
  line-height: 1.5;
}

.change-desc strong {
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

.compare-label {
  font-size: 12px;
  color: #8b9097;
  text-align: center;
}

.compare-value {
  font-size: 18px;
  color: #191b1e;
  text-align: center;
}

.compare-value.muted {
  color: #8b9097;
}

.compare-arrow {
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

.info-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: rgba(0, 0, 0, 0.35);
}

.info-popup {
  width: 100%;
  max-width: 320px;
  max-height: min(76dvh, 620px);
  padding: 20px 16px 16px;
  border-radius: 18px;
  background: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.info-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.info-guide-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 0 12px;
  padding: 0 4px;
  scrollbar-width: none;
}

.info-guide-list::-webkit-scrollbar {
  display: none;
}

.info-close-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
</style>