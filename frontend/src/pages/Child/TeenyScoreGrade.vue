<template>
  <div class="grade-screen">
    <!-- 상단 네비 — 화면 좌우 끝까지 꽉 차게 스크롤 영역 밖으로 뺀다 -->
    <div class="nav">
      <button class="back-btn" @click="goBack" aria-label="뒤로가기">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">티니 점수 등급</h1>
      <ChildNavActions />
    </div>

    <div class="scroll">

      <div v-if="loading" class="state-text">불러오는 중...</div>
      <div v-else-if="errorMsg" class="state-text error">{{ errorMsg }}</div>

      <template v-else>
        <!-- 현재 등급 -->
        <div class="current-section">
          <span class="eyebrow">현재 등급</span>

          <div class="score-row">
            <div class="score-num-wrap">
              <span class="score-num" :style="{ color: currentGradeInfo.color }">{{ score }}</span>
              <span class="score-unit">점</span>
            </div>

            <div class="grade-pill" :style="{ backgroundColor: currentGradeInfo.color + '18', color: currentGradeInfo.color }">
              <span class="grade-pill-dot" :style="{ backgroundColor: currentGradeInfo.color }"></span>
              {{ grade }}
            </div>
          </div>

          <!-- 등급 갱신 주기 안내 배너 -->
          <div
            class="notice-banner"
            :style="{
              backgroundColor: currentGradeInfo.color + '14',
              borderColor: currentGradeInfo.color + '55',
              color: currentGradeInfo.color,
            }"
          >
            <div class="notice-banner-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle cx="12" cy="12" r="8.5" :stroke="currentGradeInfo.color" stroke-width="1.8"/>
                <path d="M12 11v5" :stroke="currentGradeInfo.color" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="8" r="1" :fill="currentGradeInfo.color"/>
              </svg>
            </div>
            <p class="notice-banner-text">점수는 실시간으로 반영되지만, 등급은 매월 1일에 갱신돼요.</p>
          </div>

          <!-- 등급 세그먼트 트랙 -->
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
              <span>{{ SCORE_MAX.toLocaleString() }}점</span>
            </div>
          </div>
        </div>

        <!-- 등급 안내 -->
        <div class="guide-block">
          <span class="eyebrow">등급 안내</span>

          <div class="guide-list">
            <div v-for="g in gradesDesc" :key="g.gradeId" class="guide-row"
                 :class="{ current: g.label === grade }">
              <span class="guide-dot" :style="{ backgroundColor: g.color }"></span>
              <div class="guide-text">
                <div class="guide-title-row">
                  <b class="guide-label">{{ g.label }}</b>
                  <span class="guide-range faint">{{ g.min }}~{{ g.max === SCORE_MAX ? g.max.toLocaleString() : g.max }}점</span>
                  <span v-if="g.label === grade" class="current-badge" :style="{ backgroundColor: g.color }">현재</span>
                  <span
                    v-else-if="isGradeMismatch && g.label === projectedGrade?.label"
                    class="current-badge"
                    :style="{ backgroundColor: g.color }"
                  >다음 달</span>
                </div>
                <span class="guide-headline">{{ g.headline }}</span>
                <ul class="guide-perks">
                  <li v-for="(p, i) in g.perks" :key="i">{{ p }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </template>

    </div>

    <!-- 말풍선 없이 챗봇 플로팅 버튼만 표시 -->
    <Chatbot hint-text="" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTeenyScore, getTeenyScoreGrades } from '@/api/teenyScore'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'

const router = useRouter()
const authStore = useAuthStore()
const { accessToken, memberId } = storeToRefs(authStore)
const childId = memberId

const GRADE_ID_META = {
  1: { headline: '이제 막 시작하는 단계예요',
    perks: ['결제할 때 보호자 승인이 필요해요', '조금씩 점수를 올려봐요'] },
  2: { headline: '조금씩 성장하고 있어요',
    perks: ['기본적인 결제를 할 수 있어요', '오늘만 허용 요청은 보호자 승인이 필요해요'] },
  3: { headline: '꾸준히 잘 자라고 있어요',
    perks: ['일반 결제를 자유롭게 할 수 있어요', '저금 목표를 달성하면 보너스를 받아요'] },
  4: { headline: '아주 잘하고 있어요!',
    perks: ['대부분의 결제를 자유롭게 할 수 있어요', '저금 목표를 달성하면 보너스를 받아요', '특별 아이템을 교환할 수 있어요'] },
  5: { headline: '최고예요!',
    perks: ['모든 결제를 자유롭게 할 수 있어요', '오늘만 허용 요청이 거의 바로 승인돼요', '특별 아이템을 교환할 수 있어요'] },
}
const FALLBACK_META = { color: '#999999', headline: '', perks: [] }

const score = ref(0)
const grade = ref('')
const gradesAsc = ref([])
const loading = ref(true)
const errorMsg = ref('')

async function loadData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [scoreRes, gradesRes] = await Promise.all([
      getTeenyScore(accessToken.value, childId.value),
      getTeenyScoreGrades(accessToken.value),
    ])

    score.value = scoreRes.data.teenyScore
    grade.value = scoreRes.data.gradeName

    gradesAsc.value = [...gradesRes.data]
      .sort((a, b) => a.minScore - b.minScore)
      .map((g) => {
        const meta = GRADE_ID_META[g.gradeId] ?? FALLBACK_META
        return {
          gradeId: g.gradeId,
          label: g.gradeName,
          min: g.minScore,
          max: g.maxScore,
          color: g.color,
          headline: meta.headline,
          perks: meta.perks,
        }
      })
  } catch (e) {
    errorMsg.value = e.message || '등급 정보를 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const gradesDesc = computed(() => [...gradesAsc.value].reverse())

const SCORE_MIN = computed(() => gradesAsc.value[0]?.min ?? 0)
const SCORE_MAX = computed(() => gradesAsc.value[gradesAsc.value.length - 1]?.max ?? 0)

const currentGradeInfo = computed(
  () => gradesAsc.value.find((g) => g.label === grade.value) ?? FALLBACK_META
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
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.scroll::-webkit-scrollbar {
  width: 3px;
}

.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}

.state-text {
  padding: 40px 0;
  text-align: center;
  font-size: 13px;
  color: #6a6f76;
}
.state-text.error {
  color: #e5484d;
}

/* 상단 네비 — 화면 좌우 끝까지 꽉 차게 */
.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 50px 20px 8px;
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
  width: 44px;
  height: 44px;
}

.nav-title {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
  color: #15171b;
  letter-spacing: -0.32px;
}

.nav-spacer {
  width: 44px;
}

.eyebrow {
  display: block;
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: 0.36px;
  color: #6a6f76;
  margin-bottom: 10px;
}

.faint {
  color: #8b9097;
}

/* 현재 등급 섹션 */
.current-section {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.score-num-wrap {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.score-num {
  font-size: 38px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1;
}

.score-unit {
  font-size: 15px;
  font-weight: 700;
  color: #6b7077;
}

.grade-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
}

.grade-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.notice-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 14px;
  box-sizing: border-box;
}

.notice-banner-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-banner-text {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  word-break: keep-all;
}

/* 세그먼트 트랙 */
/* 점 위에 항상 말풍선 라벨이 뜨므로 윗 요소와 겹치지 않도록 여유를 준다 */
.segment-wrap {
  margin-top: 44px;
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

/* 현재 등급 / 다음 달 등급 위치를 가리키는 말풍선 라벨 */
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

/* 등급 안내 */
.guide-block {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}

.guide-list {
  margin-top: 4px;
}

.guide-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid #f0f1f3;
}

.guide-row:last-child {
  border-bottom: none;
}

.guide-row.current {
  background: #fff8e5;
  border: 1px solid #ffe89a;
  border-bottom: 1px solid #ffe89a;
  padding: 14px 10px;
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

.guide-range {
  font-weight: 600;
  font-size: 12.5px;
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
  color: #8b9097;
}
</style>