<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getChildMoneyReport } from '@/api/report'
import { getChildren } from '@/api/children'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const childId = computed(() => route.params.childId)

const loading = ref(true)
const errorMsg = ref('')
const childName = ref('')
const report = ref(null)
const selectedMonth = ref('')
const showMonthSheet = ref(false)

const CATEGORY_COLORS = [
  '#f0b352',
  '#4a90d9',
  '#8b7dd8',
  '#d96a94',
  '#62b24a',
  '#f97316',
  '#14b8a6',
  '#64748b',
]

const INSIGHT_TITLES = {
  SAVING_PAYMENT_PROGRESS: '적금 납입이 잘 되고 있어요',
  LOAN_REPAYMENT_PROGRESS: '대출 상환 현황',
  SPENDING_UP: '이번 달 소비가 늘었어요',
  SPENDING_DOWN: '이번 달 소비가 줄었어요',
  WATCH_SPENDING: '눈여겨볼 소비가 있어요',
  TEENY_SCORE_CHANGE: '티니점수가 변동했어요',
}

function insightKind(insight) {
  const code = String(insight.insightCode || '').toUpperCase()
  const metrics = insight.metrics || {}

  if (code.includes('SPEND') || 'topCategoryName' in metrics) return 'spending'
  if (code.includes('REQUEST') || code.includes('ALLOW') || 'requestCount' in metrics) return 'request'
  if (code.includes('QUEST') || code.includes('MISSION') || 'rewardAmount' in metrics) return 'quest'
  if (code.includes('SAVING') || code.includes('DEPOSIT') || 'savingAmount' in metrics) return 'saving'
  if (code.includes('SCORE')) return 'score'
  return 'generic'
}

function won(n) {
  return `${Number(n || 0).toLocaleString('ko-KR')}원`
}

function formatYearMonth(yearMonth) {
  if (!yearMonth) return '이번 달'
  const [year, month] = String(yearMonth).split('-')
  return `${year}년 ${Number(month)}월`
}

function formatShortDate(dateStr) {
  if (!dateStr) return '-'
  const parts = String(dateStr).split('-')
  if (parts.length < 3) return dateStr
  return `${Number(parts[1])}.${Number(parts[2])}`
}

function categoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

const period = computed(() => report.value?.period ?? null)
const summary = computed(() => report.value?.summary ?? null)
const spending = computed(() => report.value?.spending ?? null)
const watchSpending = computed(() => report.value?.watchSpending ?? null)
const insights = computed(() => report.value?.insights ?? [])
const insightCards = computed(() =>
  insights.value.map((insight) => ({
    insight,
    ...formatInsight(insight),
  }))
)
const teenyScore = computed(() => report.value?.teenyScore ?? null)

const availableMonths = computed(() => {
  const months = [...(report.value?.availableMonths ?? [])]
  const current = period.value?.yearMonth
  if (current && !months.some((item) => item.yearMonth === current)) {
    months.push({
      yearMonth: current,
      status: period.value?.status || 'IN_PROGRESS',
    })
  }
  return months.sort((a, b) => String(b.yearMonth).localeCompare(String(a.yearMonth)))
})

const periodCaption = computed(() => {
  if (!period.value) return ''
  const range = `${formatShortDate(period.value.startDate)} – ${formatShortDate(period.value.endDate)}`
  if (period.value.status === 'IN_PROGRESS') {
    return `${range} · 오늘까지 · 전월 같은 일수와 비교`
  }
  return `${range} · 한 달 전체 · 직전 달과 비교`
})

const comparisonCaption = computed(() => {
  if (!period.value) return ''
  return `비교 기간 ${formatShortDate(period.value.comparisonStartDate)} – ${formatShortDate(period.value.comparisonEndDate)}`
})

const amountDeltaText = computed(() => {
  const delta = spending.value?.comparisonAmountDelta
  if (delta == null) return '비교할 소비가 없어요'
  if (delta === 0) return '지난 기간과 똑같이 썼어요'
  if (delta > 0) return `지난 기간보다 ${won(delta)} 더 썼어요`
  return `지난 기간보다 ${won(Math.abs(delta))} 덜 썼어요`
})

const countDeltaText = computed(() => {
  const delta = spending.value?.comparisonCountDelta
  if (delta == null) return ''
  if (delta === 0) return '결제 횟수는 같아요'
  if (delta > 0) return `결제가 ${delta}회 늘었어요`
  return `결제가 ${Math.abs(delta)}회 줄었어요`
})

const weeklyTrend = computed(() => spending.value?.weeklyTrend ?? [])

const maxWeekAmount = computed(() => {
  const amounts = weeklyTrend.value
    .map((week) => week.amount)
    .filter((amount) => amount != null)
  return Math.max(1, ...amounts, 0)
})

function weekBarHeight(week) {
  if (week.amount == null) return '10px'
  if (week.amount === 0) return '10px'
  return `${Math.max(12, Math.round((week.amount / maxWeekAmount.value) * 110))}px`
}

function isUpcomingWeek(week) {
  return week.amount == null && week.paymentCount == null
}

const categories = computed(() => spending.value?.categories ?? [])

const CIRC = 2 * Math.PI * 66
const donutSegments = computed(() => {
  let offset = 0
  return categories.value.map((cat, index) => {
    const len = ((cat.ratio || 0) / 100) * CIRC
    const seg = {
      color: categoryColor(index),
      dash: `${len} ${CIRC}`,
      offset: -offset,
    }
    offset += len
    return seg
  })
})

const summaryCards = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    { key: 'spent', label: '쓴 돈', value: won(s.spentAmount), hint: `결제 ${s.paymentCount ?? 0}회` },
    { key: 'saved', label: '모은 돈', value: won(s.savedAmount), hint: `적금 ${won(s.savingAmount)}` },
    { key: 'earned', label: '번 돈', value: won(s.earnedAmount), hint: `${s.earnedCount ?? 0}건` },
    { key: 'repaid', label: '갚은 돈', value: won(s.repaidAmount), hint: `이자 ${won(s.repaidInterest)}` },
  ]
})

function formatInsight(insight) {
  const metrics = insight.metrics || {}
  const kind = insightKind(insight)
  const mappedTitle = INSIGHT_TITLES[insight.insightCode]

  if (insight.insightCode === 'SAVING_PAYMENT_PROGRESS') {
    return {
      kind: 'saving',
      badge: '저축',
      title: mappedTitle,
      desc: `${metrics.paidCount ?? 0}/${metrics.totalCount ?? 0}회 납입 · 진행률 ${metrics.progressRate ?? 0}%`,
    }
  }

  if (kind === 'spending') {
    const delta = Number(metrics.comparisonAmountDelta || 0)
    let extra = ''
    if (delta > 0) extra = `지난 기간보다 ${won(delta)} 더 썼어요`
    else if (delta < 0) extra = `지난 기간보다 ${won(Math.abs(delta))} 덜 썼어요`

    return {
      kind,
      badge: '소비',
      title: metrics.topCategoryName
        ? `${metrics.topCategoryName}에 가장 많이 썼어요`
        : (mappedTitle || '이번 달 소비'),
      desc: `총 ${won(metrics.totalAmount)} · ${metrics.paymentCount ?? 0}회 결제`,
      extra: metrics.topCategoryName
        ? `${metrics.topCategoryName} ${won(metrics.topCategoryAmount)} (${metrics.topCategoryRatio ?? 0}%)`
        : extra,
    }
  }

  if (kind === 'request') {
    return {
      kind,
      badge: '요청',
      title: mappedTitle || '오늘만 허용 요청',
      desc: `요청 ${metrics.requestCount ?? 0}건 · 승인 ${metrics.approvedCount ?? 0}건 · 거절 ${metrics.rejectedCount ?? 0}건`,
      extra: (metrics.pendingCount || metrics.expiredCount)
        ? `대기 ${metrics.pendingCount ?? 0}건 · 만료 ${metrics.expiredCount ?? 0}건`
        : '',
    }
  }

  if (kind === 'saving') {
    return {
      kind,
      badge: '저축',
      title: mappedTitle || '저축 현황',
      desc: `적금 ${won(metrics.savingAmount ?? metrics.amount)} · 상품 ${metrics.savingProductCount ?? 0}개`,
      extra: metrics.savingPaymentCount != null
        ? `납입 ${metrics.savingPaymentCount}회`
        : '',
    }
  }

  if (kind === 'quest') {
    return {
      kind,
      badge: '퀘스트',
      title: mappedTitle || '퀘스트 진행 현황',
      desc: `완료 ${metrics.completedCount ?? 0}건 · 보상 ${won(metrics.rewardAmount)}`,
      extra: `진행 중 ${metrics.inProgressCount ?? 0}건 · 실패 ${metrics.failedCount ?? 0}건`,
    }
  }

  return {
    kind,
    badge: '안내',
    title: mappedTitle || '이번 달 인사이트',
    desc: '눌러서 자세한 내용을 확인해 보세요',
  }
}

function goInsight(insight) {
  const path = insight?.deepLink
  if (!path) return

  const enrollmentMatch = String(path).match(/enrollments\/(\d+)/)
  if (enrollmentMatch) {
    router.push({
      name: 'parents-child-finance',
      params: { childId: childId.value },
    })
    return
  }

  if (String(path).startsWith('/child/')) {
    router.push({
      name: 'parents-child-detail',
      params: { childId: childId.value },
    })
    return
  }

  router.push(path)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push({
    name: 'parents-child-detail',
    params: { childId: childId.value },
  })
}

async function fetchReport(month) {
  if (!childId.value) {
    errorMsg.value = '자녀 정보가 없습니다.'
    loading.value = false
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const monthQuery = Array.isArray(month) ? month[0] : month
    const res = await getChildMoneyReport(
      authStore.accessToken,
      childId.value,
      monthQuery || undefined
    )
    report.value = res.data ?? null
    selectedMonth.value = res.data?.period?.yearMonth || month || ''
  } catch (e) {
    report.value = null
    errorMsg.value = e.message || '머니 리포트를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function fetchChildName() {
  try {
    const res = await getChildren(authStore.accessToken)
    const matched = res.data?.find(
      (item) => String(item.childId) === String(childId.value)
    )
    if (matched?.name) childName.value = matched.name
  } catch {
    childName.value = ''
  }
}

async function selectMonth(yearMonth) {
  showMonthSheet.value = false
  if (!yearMonth || yearMonth === selectedMonth.value) return
  await fetchReport(yearMonth)
}

onMounted(async () => {
  await Promise.all([
    fetchReport(route.query.month),
    fetchChildName(),
  ])
})
</script>

<template>
  <div class="report-screen">
    <header class="nav">
      <button class="icon-btn" type="button" aria-label="뒤로" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#191b1e" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">
        {{ childName ? `${childName} 머니 리포트` : '머니 리포트' }}
      </h1>
      <ParentNavActions />
    </header>

    <div v-if="loading" class="state-box">불러오는 중...</div>

    <div v-else-if="errorMsg" class="state-box">
      <p class="error-text">{{ errorMsg }}</p>
      <button class="retry-btn" type="button" @click="fetchReport(selectedMonth)">다시 시도</button>
    </div>

    <div v-else-if="report" class="scroll">
      <section class="month-row">
        <button class="month-btn" type="button" @click="showMonthSheet = true">
          <span>{{ formatYearMonth(period?.yearMonth || selectedMonth) }}</span>
          <span class="caret">▾</span>
        </button>
        <span
          class="status-pill"
          :class="period?.status === 'COMPLETED' ? 'done' : 'live'"
        >
          {{ period?.status === 'COMPLETED' ? '완료된 달' : '진행 중' }}
        </span>
      </section>
      <p class="period-caption">{{ periodCaption }}</p>
      <p class="period-caption faint">{{ comparisonCaption }}</p>

      <section class="card">
        <div class="sec-head">
          <span class="sec-title">이번 달 한눈에</span>
        </div>
        <div class="summary-grid">
          <div v-for="item in summaryCards" :key="item.key" class="summary-item">
            <span class="summary-label">{{ item.label }}</span>
            <strong class="summary-value">{{ item.value }}</strong>
            <span class="summary-hint">{{ item.hint }}</span>
          </div>
        </div>
        <p class="deposit-line">들어온 용돈 {{ won(summary?.depositAmount) }}</p>
      </section>

      <section class="card">
        <div class="sec-head">
          <span class="sec-title">소비 비교</span>
        </div>
        <p class="delta-text" :class="{ down: (spending?.comparisonAmountDelta ?? 0) < 0 }">
          {{ amountDeltaText }}
        </p>
        <p class="sec-sub">{{ countDeltaText }}</p>
        <div class="compare-box">
          <div class="compare-item">
            <span class="comp-label">지난 기간</span>
            <b class="gray">{{ won(spending?.comparisonAmount) }}</b>
            <span class="comp-hint">{{ spending?.comparisonCount ?? 0 }}회</span>
          </div>
          <div class="diff-arrow">→</div>
          <div class="compare-item">
            <span class="comp-label">이번 기간</span>
            <b>{{ won(spending?.totalAmount) }}</b>
            <span class="comp-hint">{{ spending?.paymentCount ?? 0 }}회</span>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="sec-head">
          <span class="sec-title">주간 소비 추이</span>
        </div>
        <p class="sec-sub compact">월요일~일요일 기준 · 아직 오지 않은 주는 — 로 표시</p>

        <div v-if="weeklyTrend.length" class="bars">
          <div
            v-for="week in weeklyTrend"
            :key="week.weekNo"
            class="bar-col"
          >
            <span
              class="bar-val"
              :class="{ upcoming: isUpcomingWeek(week) }"
            >
              {{ isUpcomingWeek(week) ? '—' : won(week.amount) }}
            </span>
            <div
              class="bar"
              :class="{
                upcoming: isUpcomingWeek(week),
                zero: week.amount === 0,
              }"
              :style="{ height: weekBarHeight(week) }"
            ></div>
            <span class="bar-label">{{ week.weekNo }}주차</span>
            <span class="bar-date">
              {{ formatShortDate(week.startDate) }}–{{ formatShortDate(week.endDate) }}
            </span>
          </div>
        </div>
        <p v-else class="empty-text">아직 주간 소비가 없어요</p>
      </section>

      <section class="card">
        <div class="sec-head">
          <span class="sec-title">카테고리별 소비</span>
        </div>

        <div class="donut-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="66" fill="none" stroke="#eef1f5" stroke-width="26" />
            <circle
              v-for="(seg, i) in donutSegments"
              :key="i"
              cx="90" cy="90" r="66"
              fill="none"
              :stroke="seg.color"
              stroke-width="26"
              :stroke-dasharray="seg.dash"
              :stroke-dashoffset="seg.offset"
              transform="rotate(-90 90 90)"
            />
            <text x="90" y="84" text-anchor="middle" class="donut-label">이번 달</text>
            <text x="90" y="110" text-anchor="middle" class="donut-amount">
              {{ won(spending?.totalAmount) }}
            </text>
          </svg>
        </div>

        <div v-if="categories.length" class="cat-list">
          <div
            v-for="(cat, i) in categories"
            :key="cat.categoryId ?? cat.categoryName"
            class="cat-row"
          >
            <span class="cat-dot" :style="{ background: categoryColor(i) }"></span>
            <div class="cat-main">
              <span class="cat-name">{{ cat.categoryName }}</span>
              <span class="cat-count">{{ cat.paymentCount ?? 0 }}회</span>
            </div>
            <span class="cat-pct">{{ cat.ratio ?? 0 }}%</span>
            <span class="cat-amt">{{ won(cat.amount) }}</span>
          </div>
        </div>
        <p v-else class="empty-text">카테고리 소비가 없어요</p>
      </section>

      <section class="card">
        <div class="sec-head">
          <span class="sec-title">눈여겨볼 소비</span>
        </div>
        <p class="watch-lead">
          전체 {{ watchSpending?.totalPaymentCount ?? 0 }}회 중
          {{ watchSpending?.paymentCount ?? 0 }}회 · {{ won(watchSpending?.amount) }}
        </p>
        <p class="sec-sub">지난 기간 {{ watchSpending?.comparisonCount ?? 0 }}회</p>

        <div v-if="watchSpending?.categories?.length" class="watch-list">
          <div
            v-for="cat in watchSpending.categories"
            :key="cat.categoryId ?? cat.categoryName"
            class="watch-row"
          >
            <div>
              <strong>{{ cat.categoryName }}</strong>
              <span>{{ cat.paymentCount ?? 0 }}회</span>
            </div>
            <b>{{ won(cat.amount) }}</b>
          </div>
        </div>
        <p v-else class="empty-text">특별히 살펴볼 소비가 없어요</p>
      </section>

      <section class="card">
        <div class="sec-head">
          <span class="sec-title">인사이트</span>
        </div>
        <div v-if="insightCards.length" class="insight-list">
          <button
            v-for="(card, index) in insightCards"
            :key="card.insight.insightCode + index"
            class="insight-row"
            type="button"
            @click="goInsight(card.insight)"
          >
            <div>
              <span class="insight-badge" :class="`badge-${card.kind}`">
                {{ card.badge }}
              </span>
              <strong>{{ card.title }}</strong>
              <span>{{ card.desc }}</span>
              <span v-if="card.extra">{{ card.extra }}</span>
            </div>
            <span class="chev">›</span>
          </button>
        </div>
        <p v-else class="empty-text">이번 달 인사이트가 아직 없어요</p>
      </section>

      <section class="card last-card">
        <div class="sec-head">
          <span class="sec-title">티니점수 변동</span>
          <span
            class="score-pill"
            :class="{ minus: (teenyScore?.netChange ?? 0) < 0 }"
          >
            {{ (teenyScore?.netChange ?? 0) > 0 ? '+' : '' }}{{ teenyScore?.netChange ?? 0 }}점
          </span>
        </div>
        <p class="sec-sub">
          상승 {{ teenyScore?.increaseEventCount ?? 0 }}건 ·
          하락 {{ teenyScore?.decreaseEventCount ?? 0 }}건
        </p>
        <div v-if="teenyScore?.topReasons?.length" class="reason-list">
          <div
            v-for="(reason, index) in teenyScore.topReasons"
            :key="reason.eventCode + index"
            class="reason-row"
          >
            <div>
              <strong>{{ reason.description }}</strong>
              <span>{{ reason.eventCode }}</span>
            </div>
            <b :class="{ minus: reason.amount < 0 }">
              {{ reason.amount > 0 ? '+' : '' }}{{ reason.amount }}점
            </b>
          </div>
        </div>
        <p v-else class="empty-text">이번 달 점수 변동 사유가 없어요</p>
      </section>
    </div>

    <transition name="sheet">
      <div v-if="showMonthSheet" class="sheet-dim" @click.self="showMonthSheet = false">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <p class="sheet-title">조회할 달을 선택하세요</p>
          <button
            v-for="item in availableMonths"
            :key="item.yearMonth"
            class="month-option"
            :class="{ on: item.yearMonth === selectedMonth }"
            type="button"
            @click="selectMonth(item.yearMonth)"
          >
            <span>{{ formatYearMonth(item.yearMonth) }}</span>
            <span class="month-status">
              {{ item.status === 'COMPLETED' ? '완료' : '진행 중' }}
            </span>
          </button>
          <p v-if="!availableMonths.length" class="empty-text">선택 가능한 달이 없어요</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.report-screen {
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
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 28px 18px 12px;
  background: #f8fafc;
}

.icon-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
}

.nav-title {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
  color: #191b1e;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
  scrollbar-width: none;
}

.scroll::-webkit-scrollbar {
  display: none;
}

.state-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.error-text {
  margin: 0;
  color: #e5484d;
}

.retry-btn {
  border: none;
  background: #facc15;
  color: #18181b;
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 800;
  cursor: pointer;
}

.month-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.month-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  cursor: pointer;
}

.caret {
  color: #94a3b8;
  font-size: 14px;
}

.status-pill {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 800;
}

.status-pill.live {
  background: #fff8e5;
  color: #d97706;
}

.status-pill.done {
  background: #eef8ee;
  color: #2e8540;
}

.period-caption {
  margin: 0 0 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

.period-caption.faint {
  margin-bottom: 14px;
  color: #94a3b8;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.last-card {
  margin-bottom: 8px;
}

.sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sec-title {
  font-weight: 800;
  font-size: 15px;
  color: #0f172a;
}

.sec-sub {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.sec-sub.compact {
  margin-bottom: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.summary-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}

.summary-label,
.summary-hint,
.comp-label,
.comp-hint,
.cat-count,
.watch-row span,
.insight-row span:not(.insight-badge),
.reason-row span,
.bar-date,
.month-status {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.summary-value,
.compare-item b,
.cat-amt,
.watch-row b,
.reason-row b {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.deposit-line {
  margin: 12px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.delta-text {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 800;
  color: #2563eb;
}

.delta-text.down {
  color: #16a34a;
}

.compare-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}

.compare-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.compare-item b.gray {
  color: #64748b;
}

.reason-row b.minus,
.score-pill.minus {
  color: #e5484d;
}

.diff-arrow {
  color: #cbd5e1;
  font-weight: 800;
}

.bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 6px;
  min-height: 160px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-val {
  font-size: 9.5px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
}

.bar-val.upcoming {
  color: #cbd5e1;
}

.bar {
  width: 100%;
  max-width: 36px;
  border-radius: 10px;
  background: #facc15;
}

.bar.zero {
  background: #e2e8f0;
}

.bar.upcoming {
  background: transparent;
  border: 1.5px dashed #cbd5e1;
}

.bar-label {
  font-size: 11px;
  font-weight: 800;
  color: #475569;
}

.donut-wrap {
  display: flex;
  justify-content: center;
  margin: 8px 0 4px;
}

.donut-label {
  font-size: 12px;
  fill: #8b9097;
}

.donut-amount {
  font-size: 15px;
  font-weight: 800;
  fill: #191b1e;
}

.cat-list,
.watch-list,
.insight-list,
.reason-list {
  display: flex;
  flex-direction: column;
}

.cat-row,
.watch-row,
.insight-row,
.reason-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
}

.cat-row:first-child,
.watch-row:first-child,
.insight-row:first-child,
.reason-row:first-child {
  border-top: none;
}

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-main,
.watch-row div,
.insight-row div,
.reason-row div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cat-name,
.watch-row strong,
.insight-row strong,
.reason-row strong {
  font-size: 13px;
  font-weight: 800;
  color: #15171b;
}

.cat-pct {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.watch-lead {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.insight-row {
  width: 100%;
  border: none;
  background: transparent;
  padding-left: 0;
  padding-right: 0;
  text-align: left;
  cursor: pointer;
}

.insight-badge {
  align-self: flex-start;
  margin-bottom: 4px;
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
}

.badge-spending {
  background: #fff8e5;
  color: #d97706;
}

.badge-request {
  background: #eff6ff;
  color: #2563eb;
}

.badge-saving {
  background: #eef8ee;
  color: #2e8540;
}

.badge-quest {
  background: #f5f3ff;
  color: #7c3aed;
}

.badge-score,
.badge-generic {
  background: #f1f5f9;
  color: #475569;
}

.chev {
  color: #cbd5e1;
  font-size: 18px;
}

.score-pill {
  background: #eff6ff;
  color: #2563eb;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 800;
}

.score-pill.minus {
  background: #fff0f0;
}

.empty-text {
  margin: 8px 0 0;
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #94a3b8;
}

.sheet-dim {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: flex-end;
  z-index: 20;
}

.sheet {
  width: 100%;
  background: #fff;
  border-radius: 22px 22px 0 0;
  padding: 12px 18px 24px;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #e2e8f0;
  margin: 4px auto 16px;
}

.sheet-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.month-option {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eef1f5;
  background: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  cursor: pointer;
}

.month-option.on {
  border-color: #facc15;
  background: #fffbeb;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
