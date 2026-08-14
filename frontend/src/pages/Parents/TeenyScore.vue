<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">티니 점수</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <div v-if="isLoading" class="state-box">
      <p>불러오는 중입니다...</p>
    </div>

    <div v-else-if="errorMessage" class="state-box">
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-else class="content">
      <!-- 안전한 금융 생활 가이드 -->
      <div class="guide-header">
        <h2 class="guide-title">안전한 금융 생활 가이드</h2>
        <button class="help-btn" type="button" aria-label="도움말">?</button>
      </div>
      <p class="guide-desc">
        자녀의 경제 습관에 맞춰 신뢰도 기준을 설정해 주세요. 기준 미달 시 스마트한 자동 관리가 시작됩니다.
      </p>

      <!-- 등급 기준 카드 -->
      <div class="grade-card">
        <p class="grade-card-title">등급 기준</p>
        <div
          v-for="grade in grades"
          :key="grade.name"
          class="grade-row"
          :class="{ 'grade-highlight': grade.name === scoreData.gradeName }"
        >
          <span class="grade-dot" :style="{ backgroundColor: grade.color }"></span>
          <span class="grade-name">{{ grade.name }}</span>
          <span class="grade-range">{{ grade.range }}</span>
        </div>
      </div>

      <!-- 신뢰도 등급 -->
      <div class="trust-section">
        <div class="trust-header">
          <span class="trust-label">신뢰도 등급 :</span>
          <span class="trust-badge">{{ scoreData.gradeName }}</span>
        </div>

        <!-- 점수 카드 -->
        <div class="score-card">
          <p class="score-value">점수 : <strong>{{ scoreData.score }}점</strong></p>
          <p class="score-diff">
            <span class="trend-icon">📈</span>
            지난달보다 {{ scoreData.diff >= 0 ? '+' : '' }}{{ scoreData.diff }}점
            {{ scoreData.diff >= 0 ? '올랐어요!' : '내렸어요!' }}
          </p>

          <!-- 차트 -->
          <div class="chart-wrap">
            <svg class="chart-svg" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ffbc00" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#ffbc00" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path
                v-if="chartPath"
                :d="chartAreaPath"
                fill="url(#chartGradient)"
              />
              <path
                v-if="chartPath"
                :d="chartPath"
                fill="none"
                stroke="#ffbc00"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
            <div class="chart-labels">
              <span v-for="label in chartLabels" :key="label">{{ label }}</span>
            </div>
          </div>

          <!-- 피드백 -->
          <div class="feedback-box">
            <img src="@/assets/icons/icon-shield.svg" alt="" class="feedback-icon" />
            <p class="feedback-text">{{ scoreData.feedback }}</p>
          </div>
        </div>
      </div>

      <!-- 신뢰도 점수란? -->
      <div class="info-card">
        <div class="info-header">
          <p class="info-title">신뢰도 점수란?</p>
        </div>
        <p class="info-text">
          자녀의 약속 이행도, 유해 상점 준수 여부 등을 종합하여 산출되는 지표입니다.
          꾸준한 좋은 습관 형성을 위해 부모님과 함께 확인해 보세요.
        </p>
      </div>
    </div>

    <ParentBottomNav active="child" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getTeenyScore, getTeenyScoreMonthlyHistory, getTeenyScoreGrades } from '@/api/teenyScore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const childId = route.params.childId
const isLoading = ref(false)
const errorMessage = ref('')

const scoreData = ref({
  score: 0,
  gradeName: '',
  diff: 0,
  feedback: '',
})

// 등급 기준 (API 응답에 맞게 수정 필요)
const grades = ref([
  { name: '우수', range: '850~1000점', color: '#3b82f6' },
  { name: '양호', range: '700~849점', color: '#22c55e' },
  { name: '보통', range: '650~699점', color: '#eab308' },
  { name: '주의', range: '500~649점', color: '#f97316' },
  { name: '회복 필요', range: '300~499점', color: '#ef4444' },
])

const monthlyHistory = ref([])

// 차트 경로 계산
const chartLabels = computed(() => {
  if (!monthlyHistory.value.length) return []
  return monthlyHistory.value.map(h => h.month + '월')
})

const chartPath = computed(() => {
  if (!monthlyHistory.value.length) return ''
  const data = monthlyHistory.value
  const maxScore = Math.max(...data.map(d => d.score))
  const minScore = Math.min(...data.map(d => d.score))
  const range = maxScore - minScore || 1
  const w = 300
  const h = 80
  const step = w / (data.length - 1)

  return data.map((d, i) => {
    const x = i * step
    const y = h - ((d.score - minScore) / range) * h
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const chartAreaPath = computed(() => {
  if (!chartPath.value) return ''
  const data = monthlyHistory.value
  const maxScore = Math.max(...data.map(d => d.score))
  const minScore = Math.min(...data.map(d => d.score))
  const range = maxScore - minScore || 1
  const w = 300
  const h = 80
  const step = w / (data.length - 1)
  const lastX = (data.length - 1) * step
  return `${chartPath.value} L ${lastX} ${h} L 0 ${h} Z`
})

onMounted(async () => {
  isLoading.value = true
  try {
    const [scoreRes, historyRes, gradesRes] = await Promise.all([
      getTeenyScore(authStore.accessToken, childId),
      getTeenyScoreMonthlyHistory(authStore.accessToken, childId),
      getTeenyScoreGrades(authStore.accessToken),
    ])

    // TODO: API 응답 구조에 맞게 필드명 수정
    if (scoreRes.success) {
      scoreData.value = {
        score: scoreRes.data.score,
        gradeName: scoreRes.data.gradeName,
        diff: scoreRes.data.diff ?? 0,
        feedback: scoreRes.data.feedback ?? '꾸준히 좋은 습관을 유지하고 있어요!',
      }
    }

    if (historyRes.success) {
      monthlyHistory.value = historyRes.data
    }

    if (gradesRes.success) {
      // TODO: API 응답 구조에 맞게 grades 매핑
      // grades.value = gradesRes.data.map(g => ({ ... }))
    }
  } catch (error) {
    console.error('티니 점수 불러오기 실패:', error)
    errorMessage.value = '티니 점수를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
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
}

.back-btn, .alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon, .alarm-icon { width: 24px; height: 24px; }

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

.error-text { color: #ff3b30; }

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 16px;
}

/* 가이드 헤더 */
.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.guide-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
}

.help-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #d0d3d8;
  background: transparent;
  font-size: 12px;
  color: #8b9097;
  cursor: pointer;
}

.guide-desc {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
  line-height: 1.6;
}

/* 등급 기준 카드 */
.grade-card {
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grade-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.grade-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
}

.grade-highlight {
  background-color: #fff8e1;
}

.grade-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.grade-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #191b1e;
}

.grade-range {
  font-size: 13px;
  color: #8b9097;
}

/* 신뢰도 등급 */
.trust-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trust-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trust-label {
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.trust-badge {
  padding: 4px 14px;
  background-color: #f4f5f7;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #191b1e;
}

/* 점수 카드 */
.score-card {
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-value {
  margin: 0;
  font-size: 18px;
  color: #191b1e;
}

.score-value strong {
  font-size: 24px;
  font-weight: 700;
}

.score-diff {
  margin: 0;
  font-size: 13px;
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 차트 */
.chart-wrap {
  margin: 8px 0;
}

.chart-svg {
  width: 100%;
  height: 80px;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.chart-labels span {
  font-size: 11px;
  color: #8b9097;
}

/* 피드백 */
.feedback-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 12px;
  margin-top: 4px;
}

.feedback-icon { width: 16px; height: 16px; margin-top: 2px; }

.feedback-text {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
  line-height: 1.6;
}

/* 신뢰도 점수란 */
.info-card {
  background-color: #ffbc00;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 16px;
  color: #191b1e;
}

.info-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.info-text {
  margin: 0;
  font-size: 13px;
  color: #191b1e;
  line-height: 1.6;
}

</style>