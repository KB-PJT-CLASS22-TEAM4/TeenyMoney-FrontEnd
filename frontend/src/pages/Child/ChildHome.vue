<template>
  <div class="child-home">
    <div class="scroll-area">

      <!-- 상단 히어로 영역 (일러스트 배경 + 인사말 + 캐릭터 + 통합 점수카드) -->
      <section class="hero-section">
        <!-- 상단 네비바 -->
        <header class="top-nav">
          <div class="brand">
            <img src="@/assets/logo.svg" class="brand-logo" alt="티니머니" />
            <span class="brand-title">티니머니</span>
          </div>
          <ChildNavActions />
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

            <!-- 등급 배지 -->
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
            <span class="balance-label">티니머니</span>
            <div class="balance-value-row">
              <img src="@/assets/logo.svg" alt="티니머니 로고" class="balance-logo" />
              <p class="balance-amount">{{ balance.toLocaleString() }}원</p>
            </div>
          </div>
          <div class="action-btns">
            <button class="btn-pill btn-yellow">송금</button>
            <button class="btn-pill btn-gray" @click="goPayment">거래내역</button>
          </div>
        </div>
      </section>

      <!-- 오늘만 허용 섹션 -->
      <section class="allow-section">
        <div class="allow-head">
          <span class="allow-title">오늘만 허용</span>
          <span class="allow-expire">오늘 밤 11:59까지</span>
        </div>

        <div class="allow-slide">
          <!-- 요청한 업종 카드 목록 -->
          <div
            v-for="item in allowRequests"
            :key="item.id"
            class="allow-card"
            :class="{ 'clickable': item.status === 'PENDING' }"
            @click="onClickAllowCard(item)"
          >
            <div class="allow-card-content">
              <div class="allow-card-badge" :class="`status-badge--${item.status.toLowerCase()}`">
                {{ getAllowStatusText(item.status) }}
              </div>

              <div class="allow-card-name">{{ item.label }}</div>
              
              <!-- 안내 메시지 및 남은 시간 표시 -->
              <div class="allow-card-sub">
                <template v-if="item.status === 'APPROVED'">
                  <div class="allow-time-box">
                    <div class="allow-time-bar">
                      <div class="allow-time-fill" :style="{ width: '62%' }"></div>
                    </div>
                    <span class="allow-card-remain">{{ getRemainingTime() }}</span>
                  </div>
                </template>

                <template v-else-if="item.status === 'PENDING'">
                  <div class="allow-card-msg">부모님이 확인 중이에요</div>
                </template>

                <template v-else-if="item.status === 'REJECTED'">
                  <div class="allow-card-msg msg--rejected">
                    부모님이 허락하지 않았어요!<br />오늘은 이용할 수 없어요
                  </div>
                </template>
              </div>
            </div>

            <!-- 상태별 캐릭터 이미지 -->
            <img 
              v-if="getMascotImage(item.status)"
              :src="getMascotImage(item.status)" 
              class="allow-mascot" 
              alt="티니" 
            />
          </div>

          <!-- 새로 요청하기 카드 -->
          <div class="allow-card allow-card--new" @click="goAllowRequest">
            <div class="plus-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#8b9097" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="allow-card-label">허용 요청하기</span>
          </div>
        </div>
      </section>

      <!-- ────────── 다가오는 일정 (금융상품 + 퀘스트 마감, 타임라인 카드 형태) ────────── -->
      <section class="schedule-section">
        <div class="schedule-head">
          <div class="schedule-head-left">
            <span class="schedule-title">다가오는 일정</span>
            <span class="schedule-count">{{ upcomingSchedules.length }}</span>
          </div>
        </div>

        <div class="schedule-box" v-if="upcomingSchedules.length > 0">
          <div
            v-for="(item, idx) in upcomingSchedules"
            :key="item.id"
            class="schedule-row"
            :class="{ 'border-top': idx > 0 }"
            @click="goToScheduleItem(item)"
          >
            <!-- 캘린더형 날짜 타일 (신호등 테마) -->
            <div class="schedule-date-tile" :class="`tile--${item.badgeTheme}`">
              <span class="tile-dday">{{ item.dday }}</span>
              <span class="tile-date">{{ item.dateStr }}</span>
            </div>

            <!-- 일정 상세 내용 -->
            <div class="schedule-detail">
              <div class="schedule-detail-top">
                <span class="schedule-name">{{ item.title }}</span>
                <span class="schedule-type-badge" :class="`badge-text--${item.badgeTheme}`">
                  {{ item.typeLabel }}
                </span>
              </div>
              <p class="schedule-desc">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 일정이 없을 때 -->
        <div v-else class="schedule-empty">
          <p class="empty-text">예정된 일정이 없어요</p>
        </div>
      </section>

      <!-- 내 금융 -->
      <section class="finance">
        <div class="finance-head" @click="goFinance" style="cursor: pointer;">
          <span class="finance-title">내 금융</span>
          <span class="finance-all">전체보기 ›</span>
        </div>
        
        <template v-if="finances.length > 0">
          <div class="finance-scroll" ref="scrollRef" @scroll="onScroll">
            <FinanceCard v-for="f in finances" :key="f.id" v-bind="f" />
          </div>

          <div class="indicator" v-if="finances.length > 1">
            <span
              v-for="(f, i) in finances"
              :key="f.id"
              class="dot"
              :class="{ active: i === activeCard }"
            ></span>
          </div>
        </template>
        
        <div v-else class="finance-empty" @click="goFinance" style="cursor: pointer;">
          <p class="empty-title">가입된 금융 상품이 없어요</p>
          <span class="empty-link">새로운 금융 상품 둘러보기 ›</span>
        </div>
      </section>

      <!-- 최근 이용내역 -->
      <section class="history">
        <div class="history-head" @click="goPayment" style="cursor: pointer;">
          <span class="history-title">최근 거래내역</span>
          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="chevron-icon"
          />
        </div>
        
        <template v-if="transactions.length > 0">
          <div v-for="t in transactions" :key="t.id" class="tx-item">
            <div class="tx-info">
              <span class="tx-date">{{ t.date }}</span>
              <span class="tx-name">{{ t.name }}</span>
            </div>
            <!-- 입금/출금 클래스 바인딩 및 부호 처리 -->
            <span class="tx-amount" :class="t.amount > 0 ? 'plus' : 'minus'">
              {{ t.amount > 0 ? '+' : '' }}{{ t.amount.toLocaleString() }}원
            </span>
          </div>
        </template>
        <div v-else class="tx-empty">
          최근 이용 내역이 없습니다.
        </div>
      </section>
    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="home" @select="onTabSelect" />

    <Chatbot />
  </div>
</template>

<script setup>
import FinanceCard from '@/components/Child/FinanceCard.vue'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import { ref, computed, onMounted } from 'vue'
import { useRefreshOnVisible } from '@/composables/useRefreshOnVisible'
import { useServerEvents } from '@/composables/useServerEvents'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAllowRequestStore } from '@/stores/allowRequest'
import { getMyWallet } from '@/api/wallet'
import { getTeenyScore, getTeenyScoreGrades } from '@/api/teenyScore'
import { getMyEnrolledFinancialProducts } from '@/api/finance'
import { getQuests } from '@/api/quest'
import {
  getKstParts,
  parseServerDate,
  startOfKstDay,
} from '@/utils/datetime'

const router    = useRouter()
const authStore  = useAuthStore()
const allowStore = useAllowRequestStore()

const teenyScoreMascot = new URL('@/assets/mascot/teeny-run.png', import.meta.url).href

const activeCard = ref(0)
const scrollRef  = ref(null)

function onScroll() {
  const el = scrollRef.value
  if (!el || finances.value.length === 0) return
  const maxScroll = el.scrollWidth - el.clientWidth
  const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
  activeCard.value = Math.round(ratio * (finances.value.length - 1))
}

function goPayment()      { router.push({ name: 'child-transaction' }) }
function goScore()        { router.push({ name: 'child-score' }) }
function goFinance()      { router.push({ name: 'child-finance-myproducts' }) }
function goAllowRequest() { router.push({ name: 'child-todayallow-request' }) }

// 다가오는 일정 카드 클릭 시 — 퀘스트는 퀘스트 상세로, 금융상품은 나의 상품 목록으로 이동
function goToScheduleItem(item) {
  if (item.scheduleType === 'quest') {
    router.push({ name: 'child-quest-detail', params: { questId: item.questId } })
  } else {
    router.push({ name: 'child-finance-myproducts' })
  }
}

// ==== 오늘만 허용 매핑 정보 ====
const CATEGORY_LABELS = {
  1: '편의점',
  2: '카페·디저트',
  3: '문구·도서·완구',
  4: '게임',
  5: 'PC방·노래방',
  6: '패션·뷰티',
  7: '대중교통',
  8: '통신',
  9: '영화·공연·테마파크',
  10: '온라인쇼핑',
  11: '학원·교육',
  12: '유흥·성인업소',
  13: '사행성·도박',
  14: '성인숙박업',
  15: '일반숙박업',
  16: '생활용품·잡화',
  17: '외식·숙박',
  18: '의료·건강',
  19: '문화·여가',
  20: '생활서비스',
  21: '기타',
}

const allowRequests = computed(() => {
  const list = allowStore.todayPermission
  if (!Array.isArray(list) || list.length === 0) return []
  return list.map(item => ({
    id: item.id,
    label: item.category,   // 이미 "PC방·노래방" 같은 이름 문자열
    status: item.status,    // PENDING / APPROVED / REJECTED
  }))
})

function onClickAllowCard(item) {
  if (item.status === 'PENDING') {
    router.push({
      name: 'child-todayallow-edit',
      query: { id: item.id, label: item.label },
    })
  }
}

function getMascotImage(status) {
  if (status === 'PENDING')  return new URL('@/assets/mascot/teeny-pending.png', import.meta.url).href
  if (status === 'APPROVED') return new URL('@/assets/mascot/teeny-approved.png', import.meta.url).href
  if (status === 'REJECTED') return new URL('@/assets/mascot/teeny-rejected.png', import.meta.url).href
  return ''
}

function getAllowStatusText(status) {
  if (status === 'PENDING')  return '승인 대기 중'
  if (status === 'APPROVED') return '승인 완료'
  if (status === 'REJECTED') return '승인 거부'
  return ''
}

function getRemainingTime() {
  const now      = new Date()
  const midnight = new Date()
  midnight.setHours(23, 59, 0, 0)
  const diff = midnight - now
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${h}시간 ${m}분 남음`
}

// ==== 유저 및 잔액/점수 정보 ====
const userName     = ref('')
const balance      = ref(0)
const transactions = ref([])

const score             = ref(0)
const grade             = ref('')
const minScore          = ref(0)
const maxScore          = ref(0)
const gradeColor        = ref('#facc15')
const nextGradeMinScore = ref(null)

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

// ==== 내 금융 상품 및 다가오는 일정 목록 ====
const finances = ref([])
const upcomingSchedules = ref([])

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatTxDate(dateVal) {
  const date = parseServerDate(dateVal)
  if (!date) return '-'
  const { month, day, hour, minute } = getKstParts(date)
  return `${pad2(month)}-${pad2(day)}  ${pad2(hour)}:${pad2(minute)}`
}

function parseDateParts(raw) {
  const date = parseServerDate(raw)
  if (!date) return null
  const { year, month, day } = getKstParts(date)
  return { y: year, m: month, d: day }
}

function formatDateCompact(raw) {
  const parts = parseDateParts(raw)
  if (!parts) return '-'
  return `${parts.y}.${pad2(parts.m)}.${pad2(parts.d)}`
}

function getLocalBonusDeposit(enrollmentId) {
  const saved = localStorage.getItem(`mock_deposit_${enrollmentId}`)
  return saved ? Number(saved) : 0
}

function calcNextDueDate(startRaw, paidCount) {
  const parts = parseDateParts(startRaw)
  if (!parts) return null
  const next = new Date(parts.y, parts.m - 1, parts.d)
  next.setMonth(next.getMonth() + (paidCount ?? 0) + 1)
  return next
}

// 날짜 기준 D-day/일자 문자열 및 diffDays 계산 (금융상품/퀘스트 공통)
function calcDdayInfo(targetDate) {
  const today = startOfKstDay(new Date())
  const target = startOfKstDay(targetDate)
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000)
  const dday = diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`
  const { month, day } = getKstParts(targetDate)
  const dateStr = `${month}/${day}`
  return { diffDays, dday, dateStr }
}

// 금융상품 API 응답 → 다가오는 일정 아이템 매핑 (🚦 신호등 색상 매핑)
function mapToScheduleItem(p) {
  const isLoan = p.productType === 'LOAN'
  const isSaving = p.productType === 'SAVING'
  const isDeposit = p.productType === 'DEPOSIT'
  const isFreeSaving = isSaving && p.savingsType === 'FREE'

  let targetDate = null
  if (isDeposit) {
    const parts = parseDateParts(p.maturityDate)
    if (parts) targetDate = new Date(parts.y, parts.m - 1, parts.d)
  } else {
    targetDate = calcNextDueDate(p.startDate, p.paidCount ?? 0)
  }

  if (!targetDate) return null

  const { diffDays, dday, dateStr } = calcDdayInfo(targetDate)

  let title = ''
  let desc = ''
  let typeLabel = ''
  let badgeTheme = 'green'

  const amountStr = p.monthlyAmount || p.currentAmount
    ? `${(p.monthlyAmount || p.currentAmount).toLocaleString()}원`
    : '10,000원'

  if (isLoan) {
    title = `${p.productName} 상환`
    desc = `${amountStr} 낼 예정이에요`
    typeLabel = '대출'
    badgeTheme = 'red' // 🔴 대출: 빨간색
  } else if (isSaving) {
    title = isFreeSaving ? `${p.productName} 입금` : `${p.productName} 납입`
    desc = `${amountStr} 넣을 예정이에요`
    typeLabel = isFreeSaving ? '자유적금' : '정액적금'
    badgeTheme = 'yellow' // 🟡 적금: 노란색
  } else if (isDeposit) {
    title = `${p.productName} 만기`
    desc = `${(p.currentAmount ?? 0).toLocaleString()}원 수령 예정이에요`
    typeLabel = '예금'
    badgeTheme = 'green' // 🟢 예금: 초록색
  }

  return {
    id: `finance-${p.enrollmentId}`,
    dday,
    dateStr,
    title,
    desc,
    typeLabel,
    badgeTheme,
    diffDays,
    scheduleType: 'finance',
  }
}

// 퀘스트 API 응답 → 다가오는 일정 아이템 매핑 (🟣 퀘스트: 보라색)
function mapToQuestScheduleItem(q) {
  const parts = parseDateParts(q.deadline)
  if (!parts) return null
  const targetDate = new Date(parts.y, parts.m - 1, parts.d)

  const { diffDays, dday, dateStr } = calcDdayInfo(targetDate)

  const desc = q.rewardAmount
    ? `완료하면 ${q.rewardAmount.toLocaleString()}원 받아요`
    : '퀘스트 마감이 다가와요'

  return {
    id: `quest-${q.questId}`,
    dday,
    dateStr,
    title: `${q.title} 마감`,
    desc,
    typeLabel: '퀘스트',
    badgeTheme: 'purple',
    diffDays,
    scheduleType: 'quest',
    questId: q.questId,
  }
}

// 금융상품 API 응답 → FinanceCard props 매핑 함수
function mapToFinanceCard(p) {
  const isLoan = p.productType === 'LOAN'
  const isSaving = p.productType === 'SAVING'
  const isDeposit = p.productType === 'DEPOSIT'
  const isFreeSaving = isSaving && p.savingsType === 'FREE'

  const paidCount = p.paidCount ?? 0
  const totalCount = p.totalPaymentCount ?? 0
  const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0

  const bonus = isFreeSaving ? getLocalBonusDeposit(p.enrollmentId) : 0
  const currentTotal = (p.currentAmount ?? 0) + bonus

  let typeLabel = '적금'
  if (isDeposit) typeLabel = '예금'
  else if (isLoan) typeLabel = '대출'
  else if (isFreeSaving) typeLabel = '자유적금'
  else if (isSaving) typeLabel = '정액적금'

  let subText = ''
  let progress = 0

  if (isDeposit) {
    subText = p.maturityDate ? `${formatDateCompact(p.maturityDate)} 만기` : '만기 유지 중'
    progress = 100
  } else if (isFreeSaving) {
    subText = '자유 납입'
    progress = 100
  } else if (isSaving) {
    subText = `${paidCount} / ${totalCount}회차`
    progress = progressPercent
  } else if (isLoan) {
    subText = `상환 ${paidCount} / ${totalCount}회`
    progress = progressPercent
  }

  return {
    id: p.enrollmentId,
    type: typeLabel,
    rate: `연 ${p.appliedRate ?? 0}%`,
    name: p.productName,
    amount: `${currentTotal.toLocaleString()}원`,
    sub: subText,
    progress: progress,
    amountColor: '#15171b',
  }
}

async function load() {
  try {
    userName.value = authStore.name ?? ''

    const [walletRes, scoreRes, gradesRes, enrolledRes, questRes] = await Promise.all([
      getMyWallet(authStore.accessToken),
      getTeenyScore(authStore.accessToken, authStore.memberId),
      getTeenyScoreGrades(authStore.accessToken),
      getMyEnrolledFinancialProducts(authStore.accessToken).catch(() => []),
      getQuests(authStore.accessToken, 'ONGOING', null, null).catch(() => null),
    ])

    // 지갑 및 거래내역
    balance.value = walletRes.data.balance
    transactions.value = walletRes.data.recentTransactions.map(t => ({
      id:     t.id,
      date:   formatTxDate(t.createdAt),
      name:   t.description,
      amount: t.direction === 'CREDIT' ? t.amount : -t.amount,
    }))

    // 티니 점수 및 등급
    const d = scoreRes.data
    score.value      = d.teenyScore
    grade.value      = d.gradeName
    minScore.value   = d.minScore
    maxScore.value   = d.maxScore
    gradeColor.value = d.color

    const gradesAsc = [...gradesRes.data].sort((a, b) => a.minScore - b.minScore)
    const currentIdx = gradesAsc.findIndex((g) => g.gradeId === d.gradeId)
    const next = currentIdx >= 0 && currentIdx < gradesAsc.length - 1
      ? gradesAsc[currentIdx + 1]
      : null
    nextGradeMinScore.value = next ? next.minScore : null

    // 금융상품 일정 매핑
    let financeSchedules = []
    if (Array.isArray(enrolledRes)) {
      const activeProducts = enrolledRes.filter(p => p.status !== 'PENDING')
      finances.value = activeProducts.map(mapToFinanceCard)
      financeSchedules = activeProducts.map(mapToScheduleItem).filter(Boolean)
    }

    // 퀘스트(진행 중, 마감일 있는 것) 일정 매핑
    let questSchedules = []
    const questItems = questRes?.data?.items ?? []
    questSchedules = questItems
      .filter((q) => q.status === 'IN_PROGRESS' && q.deadline)
      .map(mapToQuestScheduleItem)
      .filter(Boolean)

    // 금융상품 + 퀘스트 일정을 합쳐 가장 가까운(최신) 순으로 3개만 노출 (지난 일정은 제외)
    upcomingSchedules.value = [...financeSchedules, ...questSchedules]
      .filter((item) => item.diffDays >= 0)
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 3)

    // 오늘만 허용 상태 데이터 패치
    await allowStore.fetchTodayPermission(authStore.accessToken)
  } catch (e) {
    console.error('홈 데이터 조회 실패:', e.message)
  }
}

onMounted(load)
useRefreshOnVisible(load)
// 부모가 퀘스트를 만들거나 용돈을 보내면 이 화면이 낡는다. 알림 설정과 무관하게 갱신된다.
useServerEvents(load)

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
  overflow: hidden;
  position: relative;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }

/* 히어로 영역 */
.hero-section {
  position: relative;
  background: linear-gradient(180deg, #eef7ff 0%, #fffbe8 100%);
  padding: 20px 18px 24px;
  overflow: hidden;
}

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

.hero-text {
  position: relative;
  z-index: 2;
  margin-bottom: 16px;
  margin-left: 16px;
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
  color: #57575e;
}

.hero-mascot-wrap {
  position: absolute;
  right: 20px;
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
  margin-left: 14px;
  background: #ffffff;
  border-radius: 18px;
  padding: 12px;
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

.score-card-right {
  display: flex;
  align-items: center;
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
  color: #4d596b;
  margin-bottom: 4px;
}

.hl-blue { font-weight: 800; }

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
  border: 1px solid #eaedf1;
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.balance-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #57575e;
}

.balance-value-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.balance-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.balance-amount {
  margin: 0;
  font-size: 21px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
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
  font-weight: 800;
  font-size: 15px;
  color: #0f172a;
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
  padding: 2px 18px 8px;
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
  color: #ffbc00;
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
  background: #ffffff;
  border: 1.5px dashed #cbd5e1;
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
  background: #f1f5f9;
}

.plus-icon-wrapper {
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.allow-card-label {
  font-weight: 700;
  font-size: 11px;
  color: #4d596b;
  line-height: 1;
}

/* ────────── 다가오는 일정 (타임라인 카드 형태) ────────── */
.schedule-section {
  padding: 16px 18px 0;
}

.schedule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.schedule-head-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.schedule-title {
  font-weight: 800;
  font-size: 15px;
  color: #0f172a;
}

.schedule-count {
  font-size: 11.5px;
  font-weight: 800;
  color: #ffbc00;
  background: #fff8e5;
  padding: 1px 6px;
  border-radius: 999px;
}

.schedule-box {
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 20px;
  padding: 4px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.schedule-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
}

.schedule-row.border-top {
  border-top: 1px solid #f1f5f9;
}

/* 캘린더형 날짜 타일 */
.schedule-date-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.tile-dday {
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1;
}

.tile-date {
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1;
  margin-top: 3px;
}

/* 🚦 신호등 테마 색상 (타일 배경/텍스트) */
.tile--green {
  background: #eef8ee;
  color: #2e8540;
}

.tile--yellow {
  background: #fff8e5;
  color: #d97706;
}

.tile--red {
  background: #fff0f0;
  color: #e5484d;
}

/* 🟣 퀘스트 테마 */
.tile--purple {
  background: #f3eefc;
  color: #7c3aed;
}

/* 상세 내용 영역 */
.schedule-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.schedule-detail-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.schedule-name {
  font-size: 13px;
  font-weight: 800;
  color: #15171b;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-type-badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 🚦 신호등 뱃지 텍스트 테마 */
.badge-text--green {
  background: #eef8ee;
  color: #2e8540;
}

.badge-text--yellow {
  background: #fff8e5;
  color: #d97706;
}

.badge-text--red {
  background: #fff0f0;
  color: #e5484d;
}

/* 🟣 퀘스트 뱃지 텍스트 테마 */
.badge-text--purple {
  background: #f3eefc;
  color: #7c3aed;
}

.schedule-desc {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #4d596b;
  line-height: 1.2;
}

.schedule-empty {
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 18px;
  padding: 20px 16px;
  text-align: center;
}

.schedule-empty .empty-text {
  margin: 0;
  font-size: 12.5px;
  font-weight: 700;
  color: #727e8e;
}

/* 내 금융 */
.finance {
  margin: 12px 18px 0;
  background: #ffffff;
  border: 1px solid #eaedf1;
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
  color: #7c7c83;
}

.finance-scroll {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.finance-scroll::-webkit-scrollbar { display: none; }

.finance-empty {
  padding: 24px 16px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.empty-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #57575e;
}

.empty-link {
  font-size: 12px;
  font-weight: 700;
  color: #ffbc00;
}

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
  border: 1px solid #eaedf1;
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

.chevron-icon {
  width: 18px;
  height: 18px;
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
  color: #7c7c83;
}

.tx-name {
  font-weight: 700;
  font-size: 13px;
  color: #18181b;
}

.tx-amount {
  font-weight: 800;
  font-size: 14px;
  white-space: nowrap;
}

/* 입금: 블루 */
.tx-amount.plus {
  color: #3d70c2;
}

/* 출금: 소프트 코랄 레드 */
.tx-amount.minus {
  color: #dd494e;
}

.tx-empty {
  padding: 20px 0;
  text-align: center;
  font-size: 12.5px;
  color: #7c7c83;
  font-weight: 600;
}

.child-home :deep(.tabbar) {
  margin-top: auto;
}
</style>