<template>
  <div class="score-view">
    <div class="scroll-area">

      <div v-if="loading" class="state-text">불러오는 중...</div>
      <div v-else-if="errorMsg" class="state-text error">{{ errorMsg }}</div>

      <template v-else>
      <!-- 상단 히어로 점수 카드 섹션 -->
      <section class="hero-section">
        <!-- 상단 네비바 -->
        <header class="top-nav">
          <button class="back-btn" @click="goBack" aria-label="뒤로가기">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h1 class="nav-title">티니점수</h1>
          <ChildNavActions />
        </header>

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
            <span class="blue-pill" :class="{ minus: monthlyDiff < 0 }">
              {{ monthlyDiff >= 0 ? '▲ +' : '▼ ' }}{{ monthlyDiff }}점
            </span>
          </div>

          <p class="diff-sub-text">
            지난달({{ prevMonthScore }}점)보다 <strong class="hl-text">{{ Math.abs(monthlyDiff) }}점 {{ monthlyDiff >= 0 ? '상승' : '하락' }}</strong>했어요!
          </p>

          <div class="diff-compare-box">
            <div class="compare-item">
              <span class="comp-label">지난달</span>
              <b class="comp-val gray">{{ prevMonthScore }}점</b>
            </div>
            <div class="diff-arrow">→</div>
            <div class="compare-item">
              <span class="comp-label">이번 달</span>
              <b class="comp-val main">{{ score }}점</b>
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
          <span v-for="(_, i) in benefits" :key="i"
                class="dot" :class="{ active: i === activeBenefitCard }"></span>
        </div>
      </section>

      <!-- 최근 점수 변동 내역 (3개 요약) -->
      <section class="section-container">
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

      <!-- 하단 티니코치-->
      <section class="section-container last-section">
        <div class="coach-tip-banner">
          <div class="coach-tip-top">
            <div class="coach-character-wrap">
              <img :src="teenyScoreMascot" alt="티니코치" class="coach-full-mascot" />
            </div>

            <div class="coach-speech-box">
              <span class="coach-name">티니 코치</span>
              <p class="speech-text">
                오늘도 티니점수 올려볼까?<br />
                아래 미션을 꾸준히 하면 금방 오를 거야!
              </p>
            </div>
          </div>

          <div class="mission-card-row">
            <div class="mission-card">
              <div class="mission-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20z" stroke="#C98A00" stroke-width="1.6" stroke-linejoin="round"/>
                  <path d="M13 7l4 4" stroke="#C98A00" stroke-width="1.6"/>
                </svg>
              </div>
              <span class="mission-title">소비 기록하기</span>
            </div>

            <div class="mission-card">
              <div class="mission-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="#C98A00" stroke-width="1.6"/>
                  <circle cx="12" cy="12" r="4" stroke="#C98A00" stroke-width="1.6"/>
                  <circle cx="12" cy="12" r="1" fill="#C98A00"/>
                </svg>
              </div>
              <span class="mission-title">저축 목표 달성하기</span>
            </div>

            <div class="mission-card">
              <div class="mission-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="5" stroke="#C98A00" stroke-width="1.6"/>
                  <path d="M8.5 12.5l2.3 2.3L16 9.5" stroke="#C98A00" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="mission-title">퀘스트 완료하기</span>
            </div>
          </div>
        </div>
      </section>
      </template>

    </div>

    <!-- 티니점수 안내 말풍선 포함 챗봇 플로팅 버튼 -->
    <Chatbot hint-text="티니점수를 올리는 방법이 궁금해?" />

    <!-- 하단 탭바 -->
    <BottomTabBar active="home" @select="onTabSelect" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import {
  getTeenyScore,
  getTeenyScoreGrades,
  getTeenyScoreMonthlyHistory,
  getMyHistories,
} from '@/api/teenyScore'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { accessToken, memberId } = storeToRefs(authStore)
const childId = memberId

// 티니 캐릭터
const teenyScoreMascot = new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href

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
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const monthlyList = monthlyRes.data
    const pastMonths = monthlyList
      .filter((m) => m.yearMonth < currentYearMonth)
      .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))

    const prevMonthEntry = pastMonths[0] ?? null
    prevMonthScore.value = prevMonthEntry ? prevMonthEntry.teenyScore : score.value

    const histories = [...historyRes.data].sort((a, b) => {
      const parse = (v) => {
        if (Array.isArray(v)) {
          const [y, mo, d, h = 0, mi = 0, s = 0] = v
          return new Date(y, mo - 1, d, h, mi, s).getTime()
        }
        const t = new Date(v).getTime()
        return isNaN(t) ? 0 : t
      }
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
  if (!dateVal) return '-'

  let date
  if (Array.isArray(dateVal)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal
    date = new Date(year, month - 1, day, hour, minute, second)
  } else {
    date = new Date(dateVal)
  }

  if (isNaN(date.getTime())) return '-'

  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffDays <= 0) return '오늘'
  if (diffDays === 1) return '어제'
  return `${diffDays}일 전`
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
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Inter', sans-serif;
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
  color: #8a9099;
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
  padding: 36px 18px 12px;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 14px;
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
  color: #94a3b8;
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
  color: #94a3b8;
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
  color: #94a3b8;
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
  color: #94a3b8;
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
  color: #94a3b8;
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

.blue-pill {
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.blue-pill.minus {
  background: #fef2f2;
  color: #ef4444;
}

.diff-sub-text {
  margin: 2px 0 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

.hl-text {
  color: #2563eb;
  font-weight: 800;
}

.diff-compare-box {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}

.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.comp-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
}

.comp-val {
  font-size: 16px;
  font-weight: 900;
}

.comp-val.gray { color: #64748b; }
.comp-val.main { color: #0f172a; }

.diff-arrow {
  font-size: 16px;
  font-weight: 800;
  color: #cbd5e1;
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
  color: #94a3b8;
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
  color: #64748b;
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
  color: #64748b;
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
  color: #94a3b8;
}

.item-result-score {
  font-size: 12.5px;
  font-weight: 800;
  color: #2563eb;
}

.coach-tip-banner {
  padding: 16px 14px 14px;
}

.coach-tip-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.coach-character-wrap {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -4px;
}

.coach-full-mascot {
  width: 68px;
  height: 68px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
}

.coach-name {
  display: block;
  font-size: 12.5px;
  font-weight: 800;
  color: #b98a00;
  margin-bottom: 4px;
}

.coach-speech-box {
  position: relative;
  flex: 1;
  background: #fff6dc;
  border-radius: 20px;
  padding: 12px 16px;
}

.coach-speech-box::before {
  content: '';
  position: absolute;
  left: -8px;
  bottom: 16px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px 10px 8px 0;
  border-color: transparent #fff6dc transparent transparent;
}

.speech-text {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #3d2b00;
  line-height: 1.5;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

.mission-card-row {
  display: flex;
  gap: 10px;
}

.mission-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #f1f1f2;
  border-radius: 18px;
  padding: 18px 8px 18px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: transform 0.1s ease;
}

.mission-card:active {
  transform: scale(0.97);
}

.mission-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff3d2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mission-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e1e1e;
  text-align: center;
  line-height: 1.35;
  word-break: keep-all;
  min-height: 32px;
  display: flex;
  align-items: center;
}
</style>