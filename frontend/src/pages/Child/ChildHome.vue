<template>
  <div class="child-home">
    <div class="scroll-area">

      <!-- 상단 영역 (일러스트 배경 + 인사말 + 캐릭터 + 통합 점수카드) -->
      <section class="hero-section">
        <!-- 상단 네비바 -->
        <header class="top-nav">
          <div class="brand">
            <img src="@/assets/logo.svg" class="brand-logo" alt="티니머니" />
            <span class="brand-title">티니머니</span>
          </div>
          <div class="nav-actions">
            <!-- 알림 버튼 -->
            <button class="bell-btn" @click="goNotification">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" stroke="#333" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M10 20a2 2 0 0 0 4 0" stroke="#333" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <span v-if="hasUnread" class="bell-dot"></span>
            </button>
          </div>
        </header>

       <!-- 인사말 텍스트 -->
        <div class="hero-text">
          <h2 class="hero-title">
            오늘도 반가워요!<br />
            <span class="highlight-blue">{{ userName || '김티니' }}님</span>
          </h2>
          <p class="hero-sub">티니와 함께 금융 모험을 시작해 볼까요?</p>
        </div>

        <!-- 티니 캐릭터 -->
        <div class="hero-mascot-wrap">
          <img :src="teenyScoreMascot" class="hero-mascot" alt="티니" />
          <div class="mascot-shadow"></div>
        </div>

        <!-- 티니점수 카드 -->
        <div class="hero-score-card" @click="goScore">
          <div class="score-card-top">
            <div class="score-card-left">
              <span class="score-card-title">티니점수</span>
              <div class="score-value-row">
                <span class="score-num">{{ score }}</span>
                <span class="score-unit">점</span>
              </div>
            </div>

            <!-- 등급 배지: 현재 등급 색상(API) 반영 -->
            <div class="score-card-right">
              <div
                class="grade-badge"
                :style="{ backgroundColor: gradeColor + '18', borderColor: gradeColor + '55' }"
              >
                <span class="badge-icon">🎖️</span>
                <span class="badge-text" :style="{ color: gradeColor }">{{ grade }} 티니</span>
              </div>
            </div>
          </div>

          <!-- 티니 점수 프로그레스 게이지 -->
          <div class="score-progress-wrap">
            <div class="progress-text-row">
              <span class="progress-label">다음 등급까지 <strong class="hl-blue" :style="{ color: gradeColor }">{{ remainingScore }}점</strong></span>
              <span class="progress-target">{{ nextGradeMinScore ?? maxScore }}점</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: progressPercent + '%', background: gradeColor }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 잔액 & 송금/결제 영역 -->
      <section class="wallet-section">
        <div class="balance-row">
          <div class="balance-info">
            <span class="balance-label">티니머니 잔액</span>
            <p class="balance-amount">{{ balance.toLocaleString() }}원</p>
          </div>
          <div class="action-btns">
            <button class="btn-pill btn-yellow">송금</button>
            <button class="btn-pill btn-gray" @click="goPayment">결제내역</button>
          </div>
        </div>
      </section>

      <!-- 내 금융 -->
      <section class="finance">
        <div class="finance-head" @click="goFinance" style="cursor: pointer;">
          <span class="finance-title">내 금융</span>
          <span class="finance-all">전체보기 ›</span>
        </div>
        <div class="finance-scroll" ref="scrollRef" @scroll="onScroll">
          <FinanceCard v-for="f in finances" :key="f.id" v-bind="f" />
        </div>

        <div class="indicator">
          <span
            v-for="(f, i) in finances"
            :key="f.id"
            class="dot"
            :class="{ active: i === activeCard }"
          ></span>
        </div>
      </section>

      <!-- 최근 이용내역 -->
      <section class="history">
        <div class="history-head" @click="goPayment" style="cursor: pointer;">
          <span class="history-title">최근 이용내역</span>
          <span class="chev">›</span>
        </div>
        <div v-for="t in transactions" :key="t.id" class="tx-item">
          <div class="tx-info">
            <span class="tx-date">{{ t.date }}</span>
            <span class="tx-name">{{ t.name }}</span>
          </div>
          <span class="tx-amount" :class="{ plus: t.amount > 0 }">
            {{ t.amount > 0 ? '+' : '' }}{{ t.amount.toLocaleString() }}
          </span>
        </div>
      </section>
    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="home" @select="onTabSelect" />
  </div>
</template>

<script setup>
import FinanceCard from '@/components/Child/FinanceCard.vue'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAllowRequestStore } from '@/stores/allowRequest'
import { getMyWallet } from '@/api/wallet'
import { getTeenyScore, getTeenyScoreGrades } from '@/api/teenyScore'

const router    = useRouter()
const authStore  = useAuthStore()
const allowStore = useAllowRequestStore()

const teenyScoreMascot = new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href

const activeCard = ref(0)
const scrollRef  = ref(null)
const hasUnread  = ref(true)

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  const maxScroll = el.scrollWidth - el.clientWidth
  const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
  activeCard.value = Math.round(ratio * (finances.value.length - 1))
}

function goNotification() { router.push({ name: 'child-notification' }) }
function goPayment()      { router.push({ name: 'child-transaction' }) }
function goScore()        { router.push({ name: 'child-score' }) }
function goFinance()      { router.push({ name: 'child-finance-myproducts' }) }
function goAllowRequest() { router.push({ name: 'child-todayallow-request' }) }

const userName     = ref('')
const balance      = ref(0)
const transactions = ref([])

// 티니점수 관련 값 — getTeenyScore API로 채워짐 (onMounted 참고)
const score    = ref(0)
const grade    = ref('')
const minScore = ref(0)     // 현재 등급 구간 최소값 (진행바용)
const maxScore = ref(0)     // 현재 등급 구간 최대값 (표시 폴백용)
const gradeColor = ref('#facc15') // 현재 등급 색상 (API의 color 값)
const nextGradeMinScore = ref(null) // 다음 등급 시작 점수. 최고 등급이면 null

// "다음 등급까지 몇 점"은 다음 등급의 시작 점수를 목표로 계산한다.
// 현재 등급의 maxScore를 목표로 삼으면 등급 상세 화면(다음 등급 minScore 기준)과
// 1점 차이가 나므로, 계산 기준을 nextGradeMinScore로 통일했다.
const remainingScore = computed(() => {
  if (nextGradeMinScore.value === null) return 0 // 최고 등급
  return Math.max(0, nextGradeMinScore.value - score.value)
})
const progressPercent = computed(() => {
  const target = nextGradeMinScore.value ?? maxScore.value
  const total = target - minScore.value
  if (total <= 0) return 0
  const current = score.value - minScore.value
  return Math.min(100, Math.max(0, (current / total) * 100))
})

const finances = ref([
  { id: 1, type: '적금', rate: '연 4.5%', name: '티니 꿈나무 적금', amount: '90,000원', sub: '3 / 24개월', progress: 13, amountColor: '#15171b' },
  { id: 2, type: '예금', rate: '연 2.8%', name: '용돈 모으기 예금', amount: '35,000원', sub: '자유 입출금', progress: 60, amountColor: '#15171b' },
])

// 백엔드 createdAt이 문자열 또는 [년,월,일,시,분,초] 배열(LocalDateTime 직렬화)로
// 올 수 있어 둘 다 지원. 기존 표시 형식("MM-DD  HH:mm")을 그대로 유지한다.
function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatTxDate(dateVal) {
  if (!dateVal) return '-'

  if (Array.isArray(dateVal)) {
    const [, month, day, hour = 0, minute = 0] = dateVal
    return `${pad2(month)}-${pad2(day)}  ${pad2(hour)}:${pad2(minute)}`
  }

  // 문자열(ISO)인 경우 기존 방식 유지: "2026-08-13T16:49:00" → "08-13  16:49"
  if (typeof dateVal === 'string' && dateVal.length >= 16) {
    return dateVal.slice(5, 16).replace('T', '  ')
  }

  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return '-'
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}  ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

onMounted(async () => {
  try {
    userName.value = authStore.name ?? ''

    const [walletRes, scoreRes, gradesRes] = await Promise.all([
      getMyWallet(authStore.accessToken),
      getTeenyScore(authStore.accessToken, authStore.memberId),
      getTeenyScoreGrades(authStore.accessToken),
    ])

    balance.value = walletRes.data.balance
    transactions.value = walletRes.data.recentTransactions.map(t => ({
      id:     t.id,
      date:   formatTxDate(t.createdAt),
      name:   t.description,
      amount: t.direction === 'CREDIT' ? t.amount : -t.amount,
    }))

    const d = scoreRes.data
    score.value      = d.teenyScore
    grade.value       = d.gradeName
    minScore.value    = d.minScore
    maxScore.value     = d.maxScore
    gradeColor.value  = d.color

    // 다음 등급의 시작 점수 계산 (등급 상세 화면과 기준 통일)
    const gradesAsc = [...gradesRes.data].sort((a, b) => a.minScore - b.minScore)
    const currentIdx = gradesAsc.findIndex((g) => g.gradeId === d.gradeId)
    const next = currentIdx >= 0 && currentIdx < gradesAsc.length - 1
      ? gradesAsc[currentIdx + 1]
      : null
    nextGradeMinScore.value = next ? next.minScore : null
  } catch (e) {
    console.error('홈 데이터 조회 실패:', e.message)
  }
})

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'quest')   router.push({ name: 'child-quest-list' })
}
</script>

<style scoped>
.child-home {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }

/* 상단 일러스트 영역 */
.hero-section {
  position: relative;
  background: linear-gradient(180deg, #eef7ff 0%, #fffbe8 100%);
  padding: 36px 18px 24px;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  overflow: hidden;
}

/* 네비게이션 바 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-logo {
  width: 26px;
  height: 26px;
}

.brand-title {
  font-size: 17px;
  font-weight: 900;
  color: #1c1e22;
}

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.bell-dot {
  position: absolute;
  top: -1px;
  right: 1px;
  width: 7px;
  height: 7px;
  background: #ff4d4f;
  border-radius: 50%;
  border: 1.5px solid #fff;
}

/* 히어로 텍스트 */
.hero-text {
  position: relative;
  z-index: 2;
  margin-bottom: 16px;
}

.hero-title {
  margin: 0 0 6px;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.35;
  color: #191b1e;
  letter-spacing: -0.5px;
}

.highlight-blue { color: #2563eb; }

.hero-sub {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #71717a;
}

/* 캐릭터 및 그림자 */
.hero-mascot-wrap {
  position: absolute;
  right: -8px;
  top: 125px;
  z-index: 1;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-mascot {
  width: 165px;
  height: 165px;
  object-fit: contain;
}

.mascot-shadow {
  width: 105px;
  height: 12px;
  background: rgba(220, 190, 80, 0.32);
  border-radius: 50%;
  margin-top: -18px;
  filter: blur(5px);
}

/* 티니점수 카드 */
.hero-score-card {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  width: 170px;
  background: #ffffff;
  border-radius: 18px;
  padding: 12px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.score-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.score-card-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.score-card-title {
  font-size: 11px;
  font-weight: 800;
  color: #27272a;
}

.score-value-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: 1px;
}

.score-num {
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
  line-height: 1;
}

.score-unit {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

/* 등급 배지 */
.score-card-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

.grade-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border-radius: 999px;
  padding: 2px 6px;
  border: 1px solid transparent;
}

.badge-icon { font-size: 9px; }

.badge-text {
  font-size: 9.5px;
  font-weight: 800;
  white-space: nowrap;
}

.arrow-icon {
  font-size: 13px;
  font-weight: 700;
  color: #a1a1aa;
  margin-left: 1px;
}

/* 카드 내부 게이지 레이아웃 */
.score-progress-wrap {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
}

.progress-text-row {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.hl-blue {
  font-weight: 800;
}

.progress-bar-bg {
  width: 100%;
  height: 7px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease-out;
}

/* 잔액 영역 카드 */
.wallet-section {
  padding: 14px 18px 0;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.balance-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #71717a;
}

.balance-amount {
  margin: 2px 0 0;
  font-size: 21px;
  font-weight: 900;
  color: #0f172a;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.btn-pill {
  padding: 9px 15px;
  border-radius: 12px;
  border: none;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
}

.btn-yellow {
  background: #facc15;
  color: #18181b;
}

.btn-gray {
  background: #f4f4f5;
  color: #27272a;
}

/* 오늘만 허용 섹션 */
.allow-section {
  padding: 20px 0 0;
}

.allow-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 10px;
}

.allow-title {
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
  line-height: 1;
}

.allow-expire {
  font-weight: 600;
  font-size: 11px;
  color: #a0a5b1;
  line-height: 1;
}

.allow-slide {
  display: flex;
  gap: 10px;
  padding: 2px 20px 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.allow-slide::-webkit-scrollbar {
  display: none;
}

.allow-card {
  flex-shrink: 0;
  width: 175px;
  height: 124px;
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 20px;
  padding: 12px 14px;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease;
  overflow: hidden;
}

.allow-card.clickable {
  cursor: pointer;
}

.allow-card:active {
  transform: scale(0.97);
}

.allow-card-content {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  height: 100%;
}

.allow-card-badge {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 8px;
  line-height: 1;
  margin-bottom: 8px;
}

.status-badge--pending {
  background: #fff8e6;
  color: #d98200;
}

.status-badge--approved {
  background: #eef9eb;
  color: #3b8e27;
}

.status-badge--rejected {
  background: #fff0f0;
  color: #e5484d;
}

.allow-card-name {
  font-size: 14px;
  font-weight: 800;
  color: #22252a;
  line-height: 1.1;
  white-space: nowrap;
  margin-bottom: 12px;
}

.allow-card-sub {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.allow-card-msg {
  font-size: 10.5px;
  font-weight: 700;
  color: #d98200;
  line-height: 1.2;
  white-space: nowrap;
}

.allow-card-msg.msg--rejected {
  color: #d94b4f;
}

.allow-time-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100px;
}

.allow-time-bar {
  width: 100%;
  height: 5px;
  background: #f0f2f5;
  border-radius: 999px;
  overflow: hidden;
}

.allow-time-fill {
  height: 100%;
  background: #62b24a;
  border-radius: 999px;
}

.allow-card-remain {
  font-size: 9.5px;
  font-weight: 700;
  color: #43962d;
  line-height: 1;
}

.allow-mascot {
  position: absolute;
  right: -6px;
  bottom: -10px;
  width: 70px;
  height: 70px;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));
}

.allow-card--new {
  width: 100px;
  height: 124px;
  background: #f7f8fa;
  border: 1.5px dashed #d8dbdf;
  border-radius: 20px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.allow-card--new:active {
  background: #eeeeee;
}

.plus-icon-wrapper {
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.allow-card-label {
  font-weight: 700;
  font-size: 11px;
  color: #8b9097;
  line-height: 1;
}

/* 내 금융 */
.finance {
  margin: 12px 18px 0;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px 0 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.finance-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.finance-title {
  font-weight: 800;
  font-size: 15px;
  color: #0f172a;
}

.finance-all {
  font-weight: 700;
  font-size: 12px;
  color: #a1a1aa;
}

.finance-scroll {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.finance-scroll::-webkit-scrollbar { display: none; }

.indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  transition: all 0.2s;
}

.dot.active {
  width: 16px;
  background: #0f172a;
}

/* 최근 이용내역 */
.history {
  margin: 12px 18px 16px;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-title {
  font-weight: 800;
  font-size: 15px;
  color: #0f172a;
}

.chev {
  font-size: 18px;
  color: #a1a1aa;
}

.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #f8fafc;
}
.tx-item:first-of-type { border-top: none; }

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-date {
  font-weight: 600;
  font-size: 10.5px;
  color: #a1a1aa;
}

.tx-name {
  font-weight: 700;
  font-size: 13px;
  color: #18181b;
}

.tx-amount {
  font-weight: 800;
  font-size: 14px;
  color: #18181b;
}

.tx-amount.plus {
  color: #2563eb;
}

.child-home :deep(.tabbar) {
  margin-top: auto;
}
</style>