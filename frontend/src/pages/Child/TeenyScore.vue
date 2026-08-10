<template>
  <div class="score-screen">
    <div class="scroll">

      <!-- 상단 네비  -->
      <div class="nav">
        <button class="back-btn" @click="goBack" aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="nav-title">티니 점수</h1>
      </div>

      <!-- 점수 도넛 -->
      <div class="card">
        <div class="card-header" @click="goGradeDetail" style="cursor: pointer;">
          <span class="card-title">티니 점수 등급 알아보기</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#b9bec5" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="donut-wrap">
          <svg width="158" height="158" viewBox="0 0 158 158">
            <circle cx="79" cy="79" r="62" fill="none" stroke="#edeff2" stroke-width="16"/>
            <circle cx="79" cy="79" r="62" fill="none" stroke="#ffbc00" stroke-width="16"
                    :stroke-dasharray="`${donutFill} ${donutCircumference}`"
                    stroke-dashoffset="0" stroke-linecap="round"
                    transform="rotate(-90 79 79)"/>
          </svg>
          <div class="donut-center">
            <span class="donut-label">티니 점수</span>
            <b class="donut-score">{{ score }}</b>
          </div>
        </div>

        <div class="compare-row">
          <span class="compare-text">지난주 보다</span>
          <div class="compare-badge" :class="{ negative: scoreDiff < 0 }">
            <svg v-if="scoreDiff >= 0" viewBox="0 0 10 10" width="10" height="10" fill="none">
              <path d="M5 2l4 6H1z" fill="#62b24a"/>
            </svg>
            <svg v-else viewBox="0 0 10 10" width="10" height="10" fill="none">
              <path d="M5 8L1 2h8z" fill="#e5484d"/>
            </svg>
            <span>{{ scoreDiff >= 0 ? '+' : '' }}{{ scoreDiff }}점</span>
          </div>
        </div>

        <div class="progress-wrap">
          <div class="segment-bar">
            <div v-for="(g, i) in grades" :key="g.label" class="segment"
                 :style="{ background: i <= gradeIndex ? g.color : '#f0f1f3' }"></div>
          </div>
          <div class="grade-labels">
            <span v-for="(g, i) in grades" :key="g.label" class="grade-label"
                  :style="{ color: i <= gradeIndex ? g.color : '#c6cbd2' }">{{ g.label }}</span>
          </div>
        </div>

        <div v-if="nextGradeGap !== null" class="encourage-text">
          다음 등급까지 <b>{{ nextGradeGap }}점</b> 남았어요! 조금만 더 힘내요 💪
        </div>
        <div v-else class="encourage-text">
          최고 등급이에요! 지금처럼만 잘 관리해봐요 🎉
        </div>
      </div>

      <!-- 주간 점수 변동  -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">주간 점수 변동</span>
        </div>

        <div class="line-chart-wrap">
          <svg :viewBox="`0 0 ${svgW} ${svgH}`" width="100%" :height="svgH" overflow="visible">
            <line v-for="y in yLabels" :key="y"
                  :x1="paddingL" :y1="scoreToY(y)"
                  :x2="svgW - paddingR" :y2="scoreToY(y)"
                  stroke="#f2f4f6" stroke-width="1"/>

            <text v-for="y in yLabels" :key="`label-${y}`"
                  :x="paddingL - 14" :y="scoreToY(y) + 4"
                  text-anchor="end" font-size="9" fill="#c6cbd2">{{ y }}</text>

            <path :d="areaPath" fill="#ffbc00" fill-opacity="0.1"/>

            <path :d="linePath" fill="none" stroke="#ffbc00" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>

            <g v-for="(w, i) in weekly" :key="`dot-${i}`">
              <template v-if="w.current">
                <circle :cx="pointX(i)" :cy="scoreToY(w.score)" r="6" fill="#ffbc00"/>
                <circle :cx="pointX(i)" :cy="scoreToY(w.score)" r="3" fill="#fff"/>
                <rect :x="pointX(i) - 22" :y="scoreToY(w.score) - 32"
                      width="44" height="20" rx="6" fill="#ffbc00"/>
                <text :x="pointX(i)" :y="scoreToY(w.score) - 18"
                      text-anchor="middle" font-size="10" font-weight="700" fill="#fff">{{ w.score }}점</text>
              </template>
              <template v-else>
                <circle :cx="pointX(i)" :cy="scoreToY(w.score)" r="4"
                        fill="#fff" stroke="#ffbc00" stroke-width="2"/>
                <text :x="pointX(i)" :y="scoreToY(w.score) - 12"
                      text-anchor="middle" font-size="9" fill="#b9bec5">{{ w.score }}</text>
              </template>
            </g>

            <text v-for="(w, i) in weekly" :key="`xlabel-${i}`"
                  :x="pointX(i)" :y="svgH - 2"
                  text-anchor="middle" font-size="9" fill="#8a9099">{{ w.label }}</text>
          </svg>
        </div>
      </div>

      <!-- 등급 혜택 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">{{ grade }} 등급 혜택</span>
          <div class="active-badge">{{ gradeEmoji[grade] }} {{ grade }}등급 적용 중</div>
        </div>

        <div class="benefit-list">
          <div v-for="(b, i) in benefits" :key="i" class="benefit-row"
               :class="{ 'border-top': i > 0 }">
            <div class="benefit-text">
              <span class="benefit-title">{{ b.title }}</span>
              <span class="benefit-desc">{{ b.desc }}</span>
            </div>
            <!-- 등급 조건 충족 시에만 초록 dot, 아니면 회색 -->
            <span class="benefit-dot" :class="{ inactive: !b.active }"></span>
          </div>
        </div>
      </div>

      <!-- 최근 점수 변동 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">최근 점수 변동</span>
          <span class="score-diff-text">
            <b class="diff-val" :class="{ minus: scoreDiff < 0 }">{{ scoreDiff >= 0 ? '+' : '' }}{{ scoreDiff }}</b>
            <span class="diff-sub"> 이번 주</span>
          </span>
        </div>

        <div class="activity-list">
          <div v-for="(a, i) in activities" :key="i" class="activity-row"
               :class="{ 'border-top': i > 0 }">
            <div class="activity-text">
              <span class="activity-title">{{ a.title }}</span>
              <span class="activity-desc">{{ a.desc }}</span>
            </div>
            <div class="activity-score">
              <b :class="['score-val', a.diff >= 0 ? 'plus' : 'minus']">
                {{ a.diff > 0 ? '+' : '' }}{{ a.diff }}
              </b>
              <span class="score-unit">점</span>
            </div>
          </div>
        </div>

        <button class="more-btn" @click="goGradeDetail">전체 내역 보기 ›</button>
      </div>

    </div>

    <BottomTabBar active="finance" @select="onTabSelect" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

const router = useRouter()

// ==================================================================
// API 연동 필요 (지금은 더미 데이터)
// ==================================================================

const score = 850

// grade는 API에서 내려주는 값이 아니라 score 기준으로 프론트에서 계산.
// 600~1000점을 5등급으로 80점씩 균등 분할.
function getGradeByScore(s) {
  if (s >= 920) return '우수'
  if (s >= 840) return '양호'
  if (s >= 760) return '보통'
  if (s >= 680) return '주의'
  return '회복'
}
const grade = getGradeByScore(score)

const gradeEmoji = { '회복': '🌱', '주의': '🍀', '보통': '🌳', '양호': '🍎', '우수': '⭐' }

const SCORE_MIN = 600
const SCORE_MAX = 1000

const donutCircumference = 2 * Math.PI * 62
const donutFill = computed(() =>
  ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * donutCircumference
)

const grades = [
  { label: '회복',   color: '#f08080' },
  { label: '주의', color: '#f4a86a' },
  { label: '보통',   color: '#f0cc6a' },
  { label: '양호',   color: '#72c472' },
  { label: '우수',     color: '#7ab8f5' },
]
const gradeIndex = computed(() => grades.findIndex(g => g.label === grade))

// 다음 등급까지 남은 점수 (격려 문구용). 이미 최고 등급이면 null.
const GRADE_STEP = 80 // (SCORE_MAX - SCORE_MIN) / grades.length
const nextGradeGap = computed(() => {
  if (gradeIndex.value >= grades.length - 1) return null
  const nextThreshold = 680 + gradeIndex.value * GRADE_STEP
  return nextThreshold - score
})

function getWeekLabel(weeksAgo) {
  const date = new Date()
  date.setDate(date.getDate() - weeksAgo * 7)
  const month = date.getMonth() + 1
  const weekOfMonth = Math.ceil(date.getDate() / 7)
  return `${month}월 ${weekOfMonth}주`
}

const weekly = [
  { label: getWeekLabel(3), score: 800, current: false },
  { label: getWeekLabel(2), score: 835, current: false },
  { label: getWeekLabel(1), score: 850, current: false },
  { label: getWeekLabel(0), score: 870, current: true  },
]

// scoreDiff는 하드코딩하지 않고 weekly 마지막 두 값의 차이로 계산
// (API 연동 후에도 weekly만 내려주면 이 값은 자동으로 맞음)
const scoreDiff = computed(() => {
  if (weekly.length < 2) return 0
  const last = weekly[weekly.length - 1].score
  const prev = weekly[weekly.length - 2].score
  return last - prev
})

const svgW     = 280
const svgH     = 169
const paddingL = 52
const paddingR = 16
const paddingT = 34
const paddingB = 22

// 점수는 600점부터 시작. 도넛과 동일한 스케일로 통일.
const Y_MAX = 1000
const Y_MIN = 600
const yLabels = [1000, 900, 800, 700, 600]

function scoreToY(s) {
  return paddingT + ((Y_MAX - s) / (Y_MAX - Y_MIN)) * (svgH - paddingT - paddingB)
}
function pointX(i) {
  const usableW = svgW - paddingL - paddingR
  return paddingL + (i / (weekly.length - 1)) * usableW
}
const linePath = computed(() =>
  weekly.map((w, i) => `${i === 0 ? 'M' : 'L'} ${pointX(i)} ${scoreToY(w.score)}`).join(' ')
)
const areaPath = computed(() => {
  const line = weekly.map((w, i) => `${i === 0 ? 'M' : 'L'} ${pointX(i)} ${scoreToY(w.score)}`).join(' ')
  const bottom = scoreToY(Y_MIN)
  return `${line} L ${pointX(weekly.length - 1)} ${bottom} L ${pointX(0)} ${bottom} Z`
})

// benefits의 active는 현재 등급(grade)에 따라 결정되어야 함.
// 지금은 예시로 '열매' 등급 이상이면 앞 3개가 적용된다고 가정한 더미 데이터.
// 성인 은행앱 문구(적금 우대금리/대출 금리 인하) 대신 아이가 체감할 수 있는 혜택으로 교체함.
const benefits = [
  { title: '🛍️ 자유로운 결제',          desc: '대부분의 결제를 자유롭게 할 수 있어요',           active: true },
  { title: '🐷 용돈 저금 보너스',         desc: '저금 목표를 달성하면 보너스 용돈을 받아요',        active: true },
  { title: '🎁 특별 아이템 교환',         desc: '티니 포인트로 특별 아이템을 교환할 수 있어요',      active: true },
  { title: '🔓 오늘만 허용 범위 확대',    desc: '오늘만 허용 요청 범위가 더 넓어져요',              active: false },
]

const activities = [
  { title: '퀘스트 완료',    desc: '방 청소하기 · 오늘',   diff: 10 },
  { title: '목표 저축 달성', desc: '무선 이어폰 · 어제',   diff: 5  },
  { title: '위험 결제 시도', desc: '심야 편의점 · 3일 전', diff: -3 },
]

function goBack() {
  router.push({ name: 'child-home' })
}

function goGradeDetail() {
  router.push({ name: 'child-score-grade' })
}

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'report')  router.push({ name: 'child-report' })
}
</script>

<style scoped>
.score-screen {
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
  font-family: 'Pretendard', 'Inter', sans-serif;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scroll::-webkit-scrollbar {
  width: 3px;
}

.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  min-width: 44px;
  min-height: 44px;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #15171b;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.3px solid #f2f4f6;
  padding-bottom: 12px;
}

.card-title {
  font-weight: 700;
  font-size: 14.5px;
  color: #191b1e;
}

.donut-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 22px 0 10px;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #b9bec5;
}

.donut-score {
  font-size: 34px;
  font-weight: 800;
  color: #15171b;
  letter-spacing: -0.62px;
}

.compare-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
}

.compare-text {
  font-size: 12px;
  color: #8b9097;
}

.compare-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  background: #e8f4e2;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  color: #62b24a;
}

.compare-badge.negative {
  background: #fbe9e9;
  color: #e5484d;
}

.progress-wrap {
  padding: 0 0 18px;
}

.segment-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.segment {
  flex: 1;
  height: 10px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.grade-labels {
  display: flex;
  gap: 4px;
}

.grade-label {
  flex: 1;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  transition: color 0.3s ease;
}

.encourage-text {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #6b7078;
  padding-top: 14px;
  border-top: 1.3px solid #f2f4f6;
}

.encourage-text b {
  color: #ffbc00;
  font-weight: 800;
}

.line-chart-wrap {
  padding-top: 6px;
  overflow: visible;
}

.active-badge {
  padding: 3px 8px;
  background: #e8f4e2;
  border-radius: 999px;
  font-weight: 700;
  font-size: 11px;
  color: #62b24a;
}

.benefit-list {
  padding-top: 4px;
}

.benefit-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
}

.benefit-row.border-top {
  border-top: 1.3px solid #f2f4f6;
}

.benefit-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.benefit-title {
  font-weight: 600;
  font-size: 14.5px;
  color: #191b1e;
}

.benefit-desc {
  font-weight: 500;
  font-size: 12.5px;
  color: #b9bec5;
}

.benefit-dot {
  width: 6px;
  height: 6px;
  background: #62b24a;
  border-radius: 50%;
  flex-shrink: 0;
}

.benefit-dot.inactive {
  background: #d8dbe0;
}

.score-diff-text {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.diff-val {
  font-size: 14px;
  font-weight: 800;
  color: #4585d6;
}

.diff-val.minus {
  color: #e5484d;
}

.diff-sub {
  font-size: 11.5px;
  color: #8b9097;
}

.activity-list {
  padding-top: 4px;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
}

.activity-row.border-top {
  border-top: 1.3px solid #f2f4f6;
}

.activity-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.activity-title {
  font-weight: 600;
  font-size: 14.5px;
  color: #15171b;
}

.activity-desc {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
}

.activity-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.score-val {
  font-size: 16.5px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.score-val.plus {
  color: #4585d6;
}

.score-val.minus {
  color: #e5484d;
}

.score-unit {
  font-size: 11px;
  color: #c6cbd2;
}

.more-btn {
  width: 100%;
  padding: 14px 0 0;
  border: none;
  border-top: 1.3px solid #f2f4f6;
  background: transparent;
  font-weight: 600;
  font-size: 13.5px;
  color: #8b9097;
  cursor: pointer;
  text-align: center;
  margin-top: 4px;
  min-height: 44px;
}
</style>