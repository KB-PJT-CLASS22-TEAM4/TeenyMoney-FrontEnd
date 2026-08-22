<template>
  <div class="grade-screen">
    <ChildPageNav title="티니 등급" @back="goBack" />

    <div class="scroll">

      <div v-if="loading" class="state-text">불러오는 중...</div>
      <div v-else-if="errorMsg" class="state-text error">{{ errorMsg }}</div>

      <template v-else>
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
                  <span class="guide-range faint">{{ g.min }}~{{ g.max }}점</span>
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
import ChildPageNav from '@/components/Child/ChildPageNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const { accessToken, memberId } = storeToRefs(authStore)
const childId = memberId

// 등급별 헤드라인은 API에 없는 톤앤매너용 문구라 프론트에 고정해둔다.
// 실제 혜택 수치(보너스 이자율/대출 금리/오늘만 허용 한도)는 buildPerks()에서
// getTeenyScoreGrades API 응답 값으로 직접 만든다.
const GRADE_ID_META = {
  1: { headline: '이제 막 시작하는 단계예요' },
  2: { headline: '조금씩 성장하고 있어요' },
  3: { headline: '꾸준히 잘 자라고 있어요' },
  4: { headline: '아주 잘하고 있어요!' },
  5: { headline: '최고예요!' },
}
const FALLBACK_META = { color: '#999999', headline: '' }

// 등급 혜택 문구를 API가 내려주는 실제 수치(보너스 이자율/대출 금리/오늘만 허용 한도)로 구성한다.
function buildPerks(g) {
  const perks = []
  if (g.monthlyOverrideLimit != null) {
    perks.push(`오늘만 허용을 월 ${g.monthlyOverrideLimit}회까지 요청할 수 있어요`)
  }
  if (g.bonusRate > 0) {
    perks.push(`적금·예금 이자에 연 +${g.bonusRate}%p 우대금리가 자동 적용돼요`)
  }
  perks.push(
    g.loanRate != null
      ? `대출 이용 시 금리는 연 ${g.loanRate}%예요`
      : '아직 대출 상품은 이용할 수 없어요'
  )
  return perks
}

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
          perks: buildPerks(g),
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

// 실시간 점수가 지금 속한 등급 구간(= 다음 갱신일에 반영될 등급 예상치)
const projectedGrade = computed(
  () => gradesAsc.value.find((g) => score.value >= g.min && score.value <= g.max) ?? null
)

// 서버가 갱신한 공식 등급과 실시간 점수 기준 등급이 다른지 (월 1회 갱신 주기 때문에 발생)
const isGradeMismatch = computed(
  () => projectedGrade.value !== null && projectedGrade.value.label !== grade.value
)

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