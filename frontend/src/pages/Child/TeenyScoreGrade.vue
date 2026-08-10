<template>
  <div class="grade-screen">
    <div class="scroll">

      <!-- 상단 네비 -->
      <div class="nav">
        <button class="back-btn" @click="goBack" aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="nav-title">티니 점수 등급</h1>
      </div>

      <!-- 현재 등급 -->
      <div class="current-block">
        <span class="eyebrow">현재 등급</span>

        <div class="gauge-wrap">
          <svg viewBox="0 0 280 190" width="100%" height="190" overflow="visible">
            <path v-for="(seg, i) in arcSegments" :key="i" :d="seg.d" :stroke="seg.color"
                  stroke-width="14" fill="none" stroke-linecap="round"/>

            <!-- 현재 점수 포인터 -->
            <circle :cx="pointerPos.x" :cy="pointerPos.y" r="7" fill="#fff"
                    :stroke="currentGradeInfo.color" stroke-width="3"/>

            <!-- 점수 말풍선 -->
            <rect :x="bubbleX" :y="bubbleY" width="44" height="20" rx="6" :fill="currentGradeInfo.color"/>
            <text :x="bubbleX + 22" :y="bubbleY + 14" text-anchor="middle"
                  font-size="10" font-weight="700" fill="#fff">{{ score }}점</text>

            <!-- 최소/최대 라벨 -->
            <text x="44" y="168" font-size="10" fill="#c6cbd2">{{ SCORE_MIN }}점</text>
            <text x="236" y="168" text-anchor="end" font-size="10" fill="#c6cbd2">{{ SCORE_MAX.toLocaleString() }}점</text>
          </svg>
        </div>

        <div class="grade-row">
          <span class="grade-emoji">{{ currentGradeInfo.emoji }}</span>
          <b class="grade-adjective" :style="{ color: currentGradeInfo.color }">{{ grade }}</b>
          <span class="score-val">{{ score }}점</span>
        </div>

        <div class="compare-row">
          <span class="compare-text">지난주 보다</span>
          <div class="compare-badge" :class="{ negative: scoreDiff < 0 }">
            <span>{{ scoreDiff >= 0 ? '+' : '' }}{{ scoreDiff }}점</span>
          </div>
        </div>

        <div v-if="nextGradeGap !== null" class="encourage-text">
          다음 등급까지 <b>{{ nextGradeGap }}점</b> 남았어요! 조금만 더 힘내요 💪
        </div>
        <div v-else class="encourage-text">
          최고 등급이에요! 지금처럼만 잘 관리해봐요 🎉
        </div>
      </div>

      <!-- 등급 안내 -->
      <div class="guide-block">
        <span class="eyebrow">등급 안내</span>

        <div class="guide-list">
          <div v-for="g in grades" :key="g.label" class="guide-row"
               :class="{ current: g.label === grade }">
            <span class="guide-emoji">{{ g.emoji }}</span>
            <div class="guide-text">
              <div class="guide-title-row">
                <b class="guide-label">{{ g.label }}</b>
                <span class="guide-range faint">{{ g.min }}~{{ g.max === SCORE_MAX ? g.max.toLocaleString() : g.max }}점</span>
                <span v-if="g.label === grade" class="current-badge">현재</span>
              </div>
              <span class="guide-headline">{{ g.headline }}</span>
              <ul class="guide-perks">
                <li v-for="(p, i) in g.perks" :key="i">{{ p }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 팁 박스 -->
      <div class="tips-box">
        <span class="tips-label">💡 등급은 어떻게 오르나요?</span>
        <p class="tips-content faint">
          결제 습관·목표 달성·퀘스트 완료로 점수가 오르면 등급이 올라갑니다.
          등급이 높을수록 이용할 수 있는 범위가 넓어집니다.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ==================================================================
// API 연동 필요 (지금은 더미 데이터)
// ==================================================================

const score = 850
const scoreDiff = 15

const SCORE_MIN = 600
const SCORE_MAX = 1000

// 각 등급의 안내 -> 수정 필요
const grades = [
  {
    label: '우수', min: 920, max: SCORE_MAX, color: '#4D8AD6', emoji: '⭐',
    headline: '최고예요! 🎉',
    perks: ['모든 결제를 자유롭게 할 수 있어요', '오늘만 허용 요청이 거의 바로 승인돼요', '특별 아이템을 교환할 수 있어요'],
  },
  {
    label: '양호', min: 840, max: 919, color: '#62B24A', emoji: '🍎',
    headline: '아주 잘하고 있어요!',
    perks: ['대부분의 결제를 자유롭게 할 수 있어요', '저금 목표를 달성하면 보너스를 받아요', '특별 아이템을 교환할 수 있어요'],
  },
  {
    label: '보통', min: 760, max: 839, color: '#F4B400', emoji: '🌳',
    headline: '꾸준히 잘 자라고 있어요',
    perks: ['일반 결제를 자유롭게 할 수 있어요', '저금 목표를 달성하면 보너스를 받아요'],
  },
  {
    label: '주의', min: 680, max: 759, color: '#EF8A3C', emoji: '🍀',
    headline: '조금씩 성장하고 있어요',
    perks: ['기본적인 결제를 할 수 있어요', '오늘만 허용 요청은 보호자 승인이 필요해요'],
  },
  {
    label: '회복', min: SCORE_MIN, max: 679, color: '#E5484D', emoji: '🌱',
    headline: '이제 막 시작하는 단계예요',
    perks: ['결제할 때 보호자 승인이 필요해요', '조금씩 점수를 올려봐요'],
  },
]

function getGradeByScore(s) {
  const found = grades.find(g => s >= g.min && s <= g.max)
  return found ? found.label : grades[grades.length - 1].label
}
const grade = getGradeByScore(score)
const currentGradeInfo = computed(() => grades.find(g => g.label === grade))

// 다음 등급까지 남은 점수
const currentGradeIdx = computed(() => grades.findIndex(g => g.label === grade))
const nextGradeGap = computed(() => {
  if (currentGradeIdx.value <= 0) return null // 이미 최고 등급
  const nextGrade = grades[currentGradeIdx.value - 1]
  return nextGrade.min - score
})

const thumbPercent = computed(() => {
  const ratio = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)
  return Math.min(100, Math.max(0, ratio * 100))
})

// ==== 반원 게이지 좌표 계산 ====
const GAUGE_CX = 140
const GAUGE_CY = 150
const GAUGE_R = 96
const GAUGE_STROKE = 14

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArcFlag = Math.abs(startAngle - endAngle) <= 180 ? '0' : '1'
  const sweepFlag = startAngle > endAngle ? '1' : '0'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}

// 등급 5개를 낮은 점수 -> 높은 점수 순으로 반원 36도씩 배치
const arcSegments = computed(() => {
  const ordered = [...grades].reverse()
  return ordered.map((g, i) => {
    const startAngle = 180 - i * 36
    const endAngle = startAngle - 36
    return { color: g.color, d: describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, startAngle, endAngle) }
  })
})

const pointerAngle = computed(() => 180 - thumbPercent.value * 1.8)
const pointerPos = computed(() => polarToCartesian(GAUGE_CX, GAUGE_CY, GAUGE_R, pointerAngle.value))

const bubbleX = computed(() => Math.min(Math.max(pointerPos.value.x - 22, 6), 280 - 44 - 6))
const bubbleY = computed(() => pointerPos.value.y - GAUGE_STROKE / 2 - 28)

function goBack() {
  router.push({ name: 'child-score' })
}
</script>

<style scoped>
.grade-screen {
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
  padding: 10px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 22px;
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
  letter-spacing: -0.32px;
}

.eyebrow {
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: 0.36px;
  color: #8a9099;
}

.faint {
  color: #b9bec5;
}

/* 현재 등급 */
.current-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grade-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin-top: -6px;
}

.grade-emoji {
  font-size: 22px;
  line-height: 1;
}

.compare-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.compare-text {
  font-size: 12px;
  color: #8b9097;
}

.grade-adjective {
  font-weight: 800;
  font-size: 25px;
  letter-spacing: -0.72px;
}

.score-val {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.3px;
  color: #4a4e55;
}

.compare-badge {
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

.encourage-text {
  text-align: center;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7078;
  margin-top: 4px;
}

.encourage-text b {
  color: #ffbc00;
  font-weight: 800;
}

.gauge-wrap {
  margin-top: 4px;
}

/* 등급 안내 */
.guide-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guide-list {
  margin-top: 10px;
}

.guide-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px 4px;
  border-bottom: 1px solid #f0f1f3;
}

.guide-row:last-child {
  border-bottom: none;
}

.guide-row.current {
  background: #f6fbf7;
  border-radius: 10px;
  border-bottom: none;
}

.guide-emoji {
  font-size: 20px;
  line-height: 1;
  margin-top: 1px;
  flex-shrink: 0;
}

.guide-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.guide-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-label {
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
}

.guide-range {
  font-weight: 600;
  font-size: 12.5px;
}

.current-badge {
  margin-left: auto;
  padding: 3px 9px;
  background: #ffbc00;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  color: #ffffff;
}

.guide-headline {
  font-weight: 700;
  font-size: 12.5px;
  color: #4a4e55;
}

.guide-perks {
  margin: 2px 0 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.guide-perks li {
  font-weight: 500;
  font-size: 12px;
  line-height: 17px;
  color: #b9bec5;
}

/* 팁 박스 */
.tips-box {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 17px 16px 15px;
  border: 1px solid #f0f1f3;
  border-radius: 12px;
}

.tips-label {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
}

.tips-content {
  margin: 0;
  font-weight: 500;
  font-size: 12.5px;
  line-height: 19px;
}
</style>