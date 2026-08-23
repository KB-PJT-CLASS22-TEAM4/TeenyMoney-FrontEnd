<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import { useAuthStore } from '@/stores/auth'
import { getChildMoneyReport, getMoneyAnalysis } from '@/api/report'
import { getMyEnrolledFinancialProducts } from '@/api/finance'
import { getKstParts, parseServerDate, todayKstDate } from '@/utils/datetime'

const router = useRouter()
const authStore = useAuthStore()

const coachMascot = new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href

function goBack() {
  router.push({ name: 'child-transaction' })
}

function goToScore() {
  router.push({ name: 'child-score' })
}

// 습관 카드를 눌러 다른 화면으로 이동할 때 from=report를 함께 넘긴다.
// 목적지 화면은 이 값이 있으면 뒤로가기를 눌렀을 때 히스토리 상태와 무관하게
// 무조건 이 리포트 화면으로 돌아오도록 처리한다(뒤로가기가 화면 두 개를
// 왕복하는 것처럼 보이는 문제를 히스토리에 의존하지 않고 확실하게 막기 위함).
function goToInsightRoute(h) {
  const target = h.route || h.deepLink
  if (!target) return
  if (typeof target === 'string') {
    router.push({ path: target, query: { from: 'report' } })
    return
  }
  router.push({ ...target, query: { ...(target.query || {}), from: 'report' } })
}

const isLoading = ref(true)
const loadError = ref(null)
const loadErrorType = ref('error') // 'empty'(이 달 데이터 없음) | 'error'(조회 실패)

const report = ref({ period: { label: '', status: '' }, compare: '', yearMonth: '' })
const summary = ref([])
const habits = ref([])
const spend = ref({
  label: '이번 달에 사용한 돈',
  amount: 0,
  diffText: '',
  compareText: '',
  weeks: [],
  categories: [],
  topCategory: '',
})
const score = ref({ change: 0, up: 0, down: 0, reasons: [] })

function won(n) {
  return (n ?? 0).toLocaleString('ko-KR') + '원'
}

// 괄호 안 문구가 중간에서 줄바꿈되지 않도록, 괄호 안의 일반 공백을
// 줄바꿈 없는 공백(non-breaking space)으로 치환
function noWrap(text) {
  return text.replace(/\(([^)]*)\)/g, (_, inner) => `(${inner.replace(/ /g, '\u00A0')})`)
}

const ICON_STYLE = {
  wallet: { bg: '#f2f3f5', fg: '#6b7280' },
  trending: { bg: '#e6f6ec', fg: '#2f9e5b' },
  coin: { bg: '#eaf2fc', fg: '#2e72c7' },
  check: { bg: '#f2f3f5', fg: '#6b7280' },
}
function iconStyle(icon) {
  const s = ICON_STYLE[icon] || ICON_STYLE.wallet
  return { background: s.bg, color: s.fg }
}

function formatMonthLabelFull(yearMonth) {
  if (!yearMonth) return '이번 달'
  const [y, m] = yearMonth.split('-')
  return `${y}년 ${Number(m)}월`
}

function formatPeriodLabel(startDate, endDate) {
  if (!startDate || !endDate) return ''
  const [, sm, sd] = startDate.split('-')
  const [, em, ed] = endDate.split('-')
  if (sm === em) return `${Number(sm)}월 ${Number(sd)}일~${Number(ed)}일`
  return `${Number(sm)}월 ${Number(sd)}일~${Number(em)}월 ${Number(ed)}일`
}

const PERIOD_STATUS_LABEL = { IN_PROGRESS: '진행 중', COMPLETED: '완료' }

function mapPeriod(period) {
  const compareSuffix = period.status === 'IN_PROGRESS' ? '(같은 일수 기준)' : '(전월 전체 기준)'
  return {
    label: formatPeriodLabel(period.startDate, period.endDate),
    status: PERIOD_STATUS_LABEL[period.status] || period.status,
    yearMonth: period.yearMonth,
    compare: `비교 기간 ${period.comparisonStartDate} ~ ${period.comparisonEndDate} ${compareSuffix}`,
  }
}

function mapSummary(summaryData) {
  return [
    { icon: 'wallet', label: '사용한 돈', value: summaryData.spentAmount, colorClass: '', desc: `${summaryData.paymentCount}번 결제했어요.` },
    { icon: 'trending', label: '모은 돈', value: summaryData.savedAmount, colorClass: 'green', desc: '예금과 적금에 넣었어요.' },
    { icon: 'coin', label: '직접 얻은 돈', value: summaryData.earnedAmount, colorClass: 'blue', desc: `${summaryData.earnedCount}번 받았어요.` },
    { icon: 'check', label: '갚은 돈', value: summaryData.repaidAmount, colorClass: '', desc: `대출을 ${summaryData.repaidCount}번 갚았어요.` },
  ]
}

const INSIGHT_META = {
  SPENDING_TOP_CATEGORY: { dot: '#f0b352', title: '소비' },
  PERMISSION_STATUS_SUMMARY: { dot: '#4a90d9', title: '오늘만 허용' },
  QUEST_COMPLETED: { dot: '#8b7dd8', title: '퀘스트' },
  SAVING_PAYMENT: { dot: '#4caf82', title: '저축' },
  LOAN_REPAYMENT: { dot: '#e5484d', title: '대출 상환' },
  SAVING_MATURED: { dot: '#3aa7a0', title: '적금·예금 만기' },
  DEPOSIT_MATURED: { dot: '#3aa7a0', title: '적금·예금 만기' },
}

const INSIGHT_ROUTE = {
  SPENDING_TOP_CATEGORY: { name: 'child-transaction' },
  PERMISSION_STATUS_SUMMARY: { name: 'child-todayallow-request' },
  QUEST_COMPLETED: { name: 'child-quest-list', query: { tab: 'ongoing' } },
  SAVING_PAYMENT: { name: 'child-finance-myproducts' },
  DEPOSIT_MATURED: { name: 'child-finance-myproducts' },
  LOAN_REPAYMENT: { name: 'child-finance-myproducts' },
  SAVING_MATURED: { name: 'child-finance-myproducts' },
}

function mapInsight(insight, data) {
  const teenyScoreData = data.teenyScore
  // 매핑에 없는 새 코드가 오더라도 원본 코드를 절대 화면에 노출하지 않는다.
  const meta = INSIGHT_META[insight.insightCode] || { dot: '#9aa1ab', title: '이번 달 인사이트' }
  const base = {
    dot: meta.dot,
    title: meta.title,
    route: INSIGHT_ROUTE[insight.insightCode] || null,
    deepLink: insight.deepLink,
  }
  const m = insight.metrics || {}

  if (insight.insightCode === 'SPENDING_TOP_CATEGORY') {
    return {
      ...base,
      desc: [
        `이번 달에는 ${m.paymentCount ?? 0}번 결제해서 모두 ${won(m.totalAmount)}을 사용했어요.`,
        noWrap(`${m.topCategoryName}에서 가장 많이 사용했어요 (${m.topCategoryCount ?? 0}회 · ${m.topCategoryRatio ?? 0}%).`),
      ],
    }
  }

  if (insight.insightCode === 'PERMISSION_STATUS_SUMMARY') {
    const requestCount = m.requestCount ?? 0
    const desc = [`이번 달에 오늘만 허용을 ${requestCount}번 요청했어요.`]

    if (requestCount > 0) {
      let hasResult = false
      if (m.approvedCount) {
        desc.push(`그중 ${m.approvedCount}건은 승인됐어요.`)
        hasResult = true
      }
      if (m.rejectedCount) {
        desc.push(`${m.rejectedCount}건은 반려됐어요.`)
        hasResult = true
      }
      if (m.pendingCount) {
        desc.push(`${m.pendingCount}건은 아직 답변 대기 중이에요.`)
        hasResult = true
      }
      if (m.expiredCount) {
        desc.push(`${m.expiredCount}건은 기간이 만료됐어요.`)
        hasResult = true
      }
      if (!hasResult) desc.push('아직 결과가 안 나왔어요.')
    }

    return { ...base, desc }
  }

  if (insight.insightCode === 'QUEST_COMPLETED') {
    const completedCount = m.completedCount ?? 0

    // 완료한 퀘스트가 없으면 "0개 완료 / 0원"이라는 텅 빈 문구 대신
    // 진행 중/실패 등 실제로 있었던 활동을 보여준다.
    if (completedCount === 0) {
      const inProgress = m.inProgressCount ?? 0
      const failed = m.failedCount ?? 0
      const expired = m.expiredCount ?? 0
      const declined = m.declinedCount ?? 0
      const parts = []
      if (inProgress) parts.push(`진행 중인 퀘스트가 ${inProgress}개`)
      if (failed) parts.push(`실패한 퀘스트가 ${failed}개`)
      if (expired) parts.push(`기간이 만료된 퀘스트가 ${expired}개`)
      if (declined) parts.push(`거절한 퀘스트가 ${declined}개`)

      const desc = parts.length
        ? ['이번 달엔 아직 완료한 퀘스트가 없어요.', `${parts.join(', ')} 있어요.`]
        : ['이번 달엔 아직 시작한 퀘스트가 없어요.']

      return { ...base, desc }
    }

    const questScoreReason = (teenyScoreData?.topReasons || []).find(
      (r) => r.eventCode === 'QUEST_COMPLETED'
    )

    const desc = [`퀘스트 ${completedCount}개를 인증 완료했어요.`]
    if (questScoreReason) {
      desc.push(`티니점수 ${questScoreReason.amount >= 0 ? '+' : ''}${questScoreReason.amount}점을 올렸어요.`)
    }
    desc.push(`${won(m.rewardAmount ?? 0)}을 받았어요.`)

    return { ...base, desc }
  }

  if (insight.insightCode === 'SAVING_PAYMENT') {
    const savingAmount = m.savingAmount ?? 0
    const savingProductCount = m.savingProductCount ?? 0
    const savingPaymentCount = m.savingPaymentCount ?? 0
    const depositAmount = m.depositAmount ?? 0
    const depositProductCount = m.depositProductCount ?? 0

    // ⚠️ 백엔드 응답에 상품별 내역 배열(breakdown) 필드 추가 필요
    // 예상 형태: [{ productName, amount, paymentCount }, ...]
    const savingBreakdown = m.savingBreakdown ?? m.breakdown ?? []
    const depositBreakdown = m.depositBreakdown ?? []

    const desc = []

    if (savingAmount > 0) {
      desc.push(
        noWrap(`이번 달에 적금 ${savingProductCount}개에 총 ${won(savingAmount)}을 넣었어요 (${savingPaymentCount}회 납입).`)
      )
      savingBreakdown.forEach((item) => {
        desc.push(noWrap(`· ${item.productName} — ${won(item.amount)} (${item.paymentCount ?? 0}회)`))
      })
    }

    if (depositAmount > 0) {
      desc.push(`예금 ${depositProductCount}개에는 ${won(depositAmount)}을 예치했어요.`)
      depositBreakdown.forEach((item) => {
        desc.push(`· ${item.productName} — ${won(item.amount)}`)
      })
    }

    if (desc.length === 0) {
      desc.push('이번 달엔 아직 적금이나 예금에 넣은 돈이 없어요.')
    }

    // type: 'savingRepayment' → 템플릿에서 회차 체크 배지가 있는 특수 카드로 렌더링.
    // desc는 가입 상품 데이터(activeProducts)를 못 불러왔을 때의 폴백 텍스트로 사용.
    return { ...base, desc, type: 'savingRepayment' }
  }

  // ⚠️ 백엔드 metrics 필드명이 확정되지 않아, 값이 없으면 일반 안내 문구로 대체한다.
  if (insight.insightCode === 'LOAN_REPAYMENT') {
    const amount = m.repaidAmount ?? m.amount
    const productName = m.productName ? `${m.productName} ` : ''
    const desc = amount != null
      ? [noWrap(`이번 달에 ${productName}대출을 갚아서 ${won(amount)}을 냈어요.`)]
      : ['이번 달에 대출 상환이 있었어요.']
    return { ...base, desc }
  }

  return { ...base, desc: ['자세한 내용은 아래 링크에서 확인할 수 있어요.'] }
}

const MATURED_INSIGHT_CODES = ['SAVING_MATURED', 'DEPOSIT_MATURED']

// 적금·예금 만기/중도해지 한 건에 대한 설명 한 줄
function mapMaturedLine(metrics) {
  const m = metrics || {}
  const productName = m.productName ? `${m.productName} ` : ''
  // metrics.status가 TERMINATED면 만기가 아니라 중도해지된 것이므로 문구를 구분한다.
  const verb = m.status === 'TERMINATED' ? '중도해지됐어요' : '만기됐어요'
  const amount = m.maturedAmount ?? m.currentAmount ?? m.amount
  return amount > 0
    ? `${productName}적금·예금이 ${verb}. ${won(amount)}을 받았어요.`
    : `${productName}적금·예금이 ${verb}.`
}

// 이번 달 종료된 적금·예금이 여러 건이면 하나의 습관 카드로 합쳐서 보여준다.
function mapMaturedGroup(insightList) {
  if (!insightList.length) return null
  const meta = INSIGHT_META.SAVING_MATURED
  const base = {
    dot: meta.dot,
    title: meta.title,
    route: INSIGHT_ROUTE.SAVING_MATURED,
  }

  if (insightList.length === 1) {
    return {
      ...base,
      deepLink: insightList[0].deepLink,
      desc: [noWrap(`가입했던 ${mapMaturedLine(insightList[0].metrics)}`)],
    }
  }

  return {
    ...base,
    deepLink: null,
    desc: [
      `이번 달에 적금·예금 ${insightList.length}건이 종료됐어요.`,
      ...insightList.map((i) => noWrap(`· ${mapMaturedLine(i.metrics)}`)),
    ],
  }
}

function mapWeeklyTrend(weeklyTrend) {
  const today = todayKstDate()
  return (weeklyTrend || []).map((w) => ({
    label: `${w.weekNo}주`,
    amount: w.amount ?? 0,
    display: w.amount == null ? '-' : won(w.amount),
    active: w.startDate <= today && today <= w.endDate,
    empty: w.amount == null,
  }))
}

const CATEGORY_COLORS = ['#f0b352', '#4a90d9', '#4caf82', '#8b7dd8', '#3aa7a0', '#e07a9e']

function mapCategories(categories) {
  return [...(categories || [])]
    .sort((a, b) => b.amount - a.amount)
    .map((c, i) => ({
      name: c.categoryName,
      amount: c.amount,
      percent: c.ratio,
      times: c.paymentCount,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
}

function mapSpending(spendingData) {
  const categories = mapCategories(spendingData.categories)
  const amountDelta = spendingData.comparisonAmountDelta ?? 0
  const countDelta = spendingData.comparisonCountDelta ?? 0
  return {
    label: '이번 달에 사용한 돈',
    amount: spendingData.totalAmount,
    diffText: `${amountDelta >= 0 ? '+' : ''}${won(amountDelta)} ${amountDelta >= 0 ? '증가' : '감소'}`,
    compareText: `전월 같은 기간 ${won(spendingData.comparisonAmount)} · 횟수 ${countDelta >= 0 ? '+' : ''}${countDelta}회`,
    weeks: mapWeeklyTrend(spendingData.weeklyTrend),
    categories,
    topCategory: categories[0]?.name || '',
  }
}

function mapTeenyScore(teenyScoreData) {
  return {
    change: teenyScoreData.netChange,
    up: teenyScoreData.increaseEventCount,
    down: teenyScoreData.decreaseEventCount,
    reasons: (teenyScoreData.topReasons || []).map((r) => ({
      label: r.description,
      value: `${r.amount >= 0 ? '+' : ''}${r.amount}`,
      positive: r.amount >= 0,
    })),
  }
}

function parseDateParts(raw) {
  const date = parseServerDate(raw)
  if (!date) return null
  const { year, month, day } = getKstParts(date)
  return { y: year, m: month, d: day }
}

function formatDateDot(raw) {
  const p = typeof raw === 'string' || raw instanceof Date ? parseDateParts(raw) : null
  if (!p) return ''
  return `${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')}`
}

function addMonthsToDate(startRaw, months) {
  const p = parseDateParts(startRaw)
  if (!p) return null
  const d = new Date(p.y, p.m - 1, p.d)
  d.setMonth(d.getMonth() + (months ?? 0))
  return d
}

function calcNextDueDate(startRaw, paidCount) {
  const p = parseDateParts(startRaw)
  if (!p) return null
  const d = new Date(p.y, p.m - 1, p.d)
  d.setMonth(d.getMonth() + (paidCount ?? 0) + 1)
  return d
}

function normalizeProductType(rawType) {
  const t = (rawType || '').toUpperCase()
  if (t.startsWith('DEPOSIT')) return 'DEPOSIT'
  if (t.startsWith('SAVING')) return 'SAVING'
  if (t.startsWith('LOAN')) return 'LOAN'
  return t
}

const selectedMonth = ref('')
const showMonthPicker = ref(false)

function generateMonthOptions(count = 12) {
  const { year, month } = getKstParts()
  const months = []
  for (let i = 0; i < count; i++) {
    const idx = year * 12 + (month - 1) - i
    const y = Math.floor(idx / 12)
    const m = (idx % 12) + 1
    months.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return months
}
const monthOptions = ref(generateMonthOptions())

const activeProducts = ref([])

// "저축·상환" 카드용: 가입 상품 목록에서 정액적금 1개 + 대출 1개를 뽑아
// 회차 진행 상황(1회~N회 체크)과 합산 문장을 만든다.
// 정액적금(FIXED)을 우선 사용 — 자유적금(FREE)은 회차 개념이 없어서 제외
const savingRepaymentDetail = computed(() => {
  const list = activeProducts.value || []
  const saving = list.find(
    (p) => normalizeProductType(p.productType) === 'SAVING' && p.savingsType === 'FIXED' && p.totalPaymentCount
  )
  const loan = list.find((p) => normalizeProductType(p.productType) === 'LOAN' && p.totalPaymentCount)

  if (!saving && !loan) return null

  const parts = []
  if (saving) {
    const paid = saving.paidCount ?? 0
    parts.push(`${saving.totalPaymentCount}번 중 ${paid}번의 적금 납입을 완료했어요.`)
    parts.push(`지금까지 ${won(saving.currentAmount ?? 0)}을 모았${loan ? '고, ' : '어요.'}`)
  }
  if (loan) {
    const loanPaid = loan.paidCount ?? 0
    parts.push(`대출도 ${loan.totalPaymentCount}번 중 ${loanPaid}번 갚았어요.`)
  }

  const rounds = saving
    ? Array.from({ length: saving.totalPaymentCount }, (_, i) => ({
        n: i + 1,
        label: `${i + 1}회`,
        done: i < (saving.paidCount ?? 0),
      }))
    : []

  let summaryLine = ''
  if (saving) {
    const nextDue = calcNextDueDate(saving.startDate, saving.paidCount)
    summaryLine = noWrap(
      `적금 ${saving.totalPaymentCount}번 중 ${saving.paidCount ?? 0}번 완료` +
        (nextDue ? ` · 다음 납입일 ${nextDue.getMonth() + 1}월 ${nextDue.getDate()}일` : '')
    )
  }

  return { desc: [noWrap(parts.join(' '))], rounds, summaryLine }
})

async function loadReport(month) {
  isLoading.value = true
  loadError.value = null
  try {
    const childId = authStore.memberId
    const result = await getChildMoneyReport(authStore.accessToken, childId, month)
    const data = result.data

    const mappedPeriod = mapPeriod(data.period)
    report.value = {
      period: { label: mappedPeriod.label, status: mappedPeriod.status },
      compare: mappedPeriod.compare,
      yearMonth: mappedPeriod.yearMonth,
    }
    selectedMonth.value = mappedPeriod.yearMonth

    summary.value = mapSummary(data.summary)
    // 적금·예금 만기/중도해지 인사이트가 여러 건이면 한 카드로 합쳐서 보여준다.
    const rawInsights = data.insights || []
    const maturedInsights = rawInsights.filter((i) => MATURED_INSIGHT_CODES.includes(i.insightCode))
    const firstMaturedIndex = rawInsights.findIndex((i) => MATURED_INSIGHT_CODES.includes(i.insightCode))
    habits.value = rawInsights
      .map((insight, idx) => {
        if (MATURED_INSIGHT_CODES.includes(insight.insightCode)) {
          return idx === firstMaturedIndex ? mapMaturedGroup(maturedInsights) : null
        }
        return mapInsight(insight, data)
      })
      .filter(Boolean)
    spend.value = mapSpending(data.spending)
    score.value = mapTeenyScore(data.teenyScore)
  } catch (e) {
    console.error('머니 리포트 조회 실패:', e)
    if (month) selectedMonth.value = month
    loadErrorType.value = e.status === 400 ? 'empty' : 'error'
    loadError.value =
      e.status === 400
        ? ['이 달은 아직 데이터가 없어요', '다른 달을 선택해보세요']
        : ['리포트를 불러오지 못했어요', '잠시 후 다시 시도해주세요']
  } finally {
    isLoading.value = false
  }
}

// AI 금융 습관 분석 — LLM 호출이라 느릴 수 있어서 페이지 진입 시 자동으로 부르지 않고
// 사용자가 버튼을 눌렀을 때만 시작한다.
const aiAnalysisStarted = ref(false)
const aiAnalysisText = ref('')
const aiAnalysisLoading = ref(false)
const aiAnalysisError = ref('')

function aiAnalysisErrorMessage(e) {
  if (e.status === 403) return '이 분석은 자녀 계정에서만 볼 수 있어요.'
  if (e.status === 502) return '티니코치가 지금은 분석하지 못했어요.'
  if (e.status === 503) return '지금은 분석 기능을 잠시 쉬고 있어요.'
  return '분석을 불러오지 못했어요.'
}

async function loadAiAnalysis() {
  aiAnalysisStarted.value = true
  aiAnalysisLoading.value = true
  aiAnalysisError.value = ''
  showFullAnalysis.value = false
  try {
    const result = await getMoneyAnalysis(authStore.accessToken)
    aiAnalysisText.value = result.data?.analysis || ''
  } catch (e) {
    console.error('AI 금융 습관 분석 조회 실패:', e)
    aiAnalysisError.value = aiAnalysisErrorMessage(e)
  } finally {
    aiAnalysisLoading.value = false
  }
}

const aiAnalysisParagraphs = computed(() =>
  aiAnalysisText.value.split('\n').map((s) => s.trim()).filter(Boolean)
)

const ANALYSIS_PREVIEW_COUNT = 1
const showFullAnalysis = ref(false)
const visibleAnalysisParagraphs = computed(() =>
  showFullAnalysis.value
    ? aiAnalysisParagraphs.value
    : aiAnalysisParagraphs.value.slice(0, ANALYSIS_PREVIEW_COUNT)
)
function toggleFullAnalysis() {
  showFullAnalysis.value = !showFullAnalysis.value
}

function toggleMonthPicker() {
  showMonthPicker.value = !showMonthPicker.value
}

function selectMonth(yearMonth) {
  showMonthPicker.value = false
  if (yearMonth === selectedMonth.value) return
  loadReport(yearMonth)
}


onMounted(async () => {
  await loadReport()

  try {
    const enrolledResult = await getMyEnrolledFinancialProducts(authStore.accessToken)
    const enrolled = Array.isArray(enrolledResult) ? enrolledResult : enrolledResult?.data ?? []
    const active = enrolled.filter((p) => p.status !== 'PENDING')
    activeProducts.value = active
  } catch (e) {
    console.error('금융상품 목록 조회 실패:', e)
  }
})

const maxWeek = computed(() => Math.max(...spend.value.weeks.map((w) => w.amount), 1))
function barHeight(week) {
  if (week.empty) return '4px'
  return Math.max(Math.round((week.amount / maxWeek.value) * 76), 6) + 'px'
}

const CIRC = 2 * Math.PI * 44
const donutSegments = computed(() => {
  let offset = 0
  return spend.value.categories.map((c) => {
    const len = (c.percent / 100) * CIRC
    const seg = { color: c.color, dash: `${len} ${CIRC}`, offset: -offset }
    offset += len
    return seg
  })
})

const topCategoryColor = computed(() => {
  const found = spend.value.categories.find((c) => c.name === spend.value.topCategory)
  return found ? found.color : 'var(--ink-faint)'
})

const CATEGORY_PREVIEW_COUNT = 3
const showAllCategories = ref(false)
const sortedCategories = computed(() =>
  [...spend.value.categories].sort((a, b) => b.amount - a.amount)
)
const visibleCategories = computed(() =>
  showAllCategories.value
    ? sortedCategories.value
    : sortedCategories.value.slice(0, CATEGORY_PREVIEW_COUNT)
)
const hiddenCategoryCount = computed(() =>
  Math.max(0, sortedCategories.value.length - CATEGORY_PREVIEW_COUNT)
)
function toggleAllCategories() {
  showAllCategories.value = !showAllCategories.value
}

</script>

<template>
  <div class="report-screen">
    <ChildPageNav title="머니 리포트" @back="goBack" />

    <!-- 월 이동 네비게이션 — 상단 네비와 이어지도록 흰 배경으로 화면 좌우 끝까지 꽉 차게 -->
    <div class="month-nav">
      <div class="month-picker">
        <button type="button" class="month-nav-label" @click="toggleMonthPicker">
          {{ formatMonthLabelFull(selectedMonth) }}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="month-dropdown" v-if="showMonthPicker">
          <button
            v-for="ym in monthOptions"
            :key="ym"
            type="button"
            class="month-option"
            :class="{ active: ym === selectedMonth }"
            @click="selectMonth(ym)"
          >
            {{ formatMonthLabelFull(ym) }}
          </button>
        </div>
      </div>
    </div>

    <div class="scroll">

      <!-- 로딩/에러 상태 -->
      <div v-if="isLoading" class="state-msg">리포트를 불러오는 중이에요...</div>
      <div v-else-if="loadError" class="notice-banner" :class="loadErrorType">
        <div class="notice-banner-icon">
          <svg v-if="loadErrorType === 'empty'" viewBox="0 0 24 24" width="20" height="20" fill="none">
            <rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="#5b7ca0" stroke-width="1.7"/>
            <path d="M3.5 10h17" stroke="#5b7ca0" stroke-width="1.7"/>
            <path d="M8 3.5v3.5M16 3.5v3.5" stroke="#5b7ca0" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M12 9v4.5M12 16.2v.1" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="8.5" stroke="#dc2626" stroke-width="1.8"/>
          </svg>
        </div>
        <div class="notice-banner-text">
          <span v-for="(line, i) in loadError" :key="i">{{ line }}<br v-if="i < loadError.length - 1" /></span>
        </div>
      </div>

      <template v-else>
      <div class="date-row">
        <span class="date-text">{{ report.period.label }}</span>
        <span class="status-badge">{{ report.period.status }}</span>
      </div>
      <p class="compare-line">{{ report.compare }}</p>

      <!-- 티니코치 AI 금융 습관 분석 -->
      <section>
        <div class="coach-bubble-card">
          <img :src="coachMascot" alt="티니코치" class="coach-bubble-mascot" />
          <div class="coach-bubble-box">
            <span class="coach-bubble-name">티니코치</span>

            <div v-if="!aiAnalysisStarted" class="coach-bubble-prompt">
              <p class="coach-bubble-text">AI 분석을 시작할까요?</p>
              <button type="button" class="coach-start-btn" @click="loadAiAnalysis">분석 시작하기</button>
            </div>

            <div v-else-if="aiAnalysisLoading" class="coach-bubble-loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-text">분석하고 있어요...</span>
            </div>

            <div v-else-if="aiAnalysisError" class="coach-bubble-error">
              <p class="coach-bubble-text">{{ aiAnalysisError }}</p>
              <button type="button" class="coach-retry-btn" @click="loadAiAnalysis">다시 시도</button>
            </div>

            <template v-else>
              <p v-for="(para, i) in visibleAnalysisParagraphs" :key="i" class="coach-bubble-para">
                {{ para }}
              </p>
              <button
                v-if="aiAnalysisParagraphs.length > ANALYSIS_PREVIEW_COUNT"
                type="button"
                class="coach-retry-btn"
                @click="toggleFullAnalysis"
              >
                {{ showFullAnalysis ? '접기' : '전체 보기' }}
              </button>
            </template>
          </div>
        </div>
      </section>

      <!-- 이번 달 한눈에 보기 -->
      <section>
        <h2 class="sec-heading">이번 달 한눈에 보기</h2>
        <div class="stat-grid">
          <div class="stat-card" v-for="s in summary" :key="s.label">
            <div class="stat-icon" :style="iconStyle(s.icon)">
              <svg v-if="s.icon === 'wallet'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12.3h.01"/><path d="M3 10h18"/></svg>
              <svg v-else-if="s.icon === 'trending'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
              <svg v-else-if="s.icon === 'coin'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.6 9.7c0-1.1 1-1.9 2.4-1.9s2.4.8 2.4 1.8c0 2.3-4.8 1.8-4.8 4.1 0 1 1 1.8 2.4 1.8s2.4-.8 2.4-1.8"/></svg>
              <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.5 2.5 5-5.2"/></svg>
            </div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-value" :class="s.colorClass">{{ won(s.value) }}</div>
            <div class="stat-desc">{{ s.desc }}</div>
          </div>
        </div>
      </section>

      <!-- 이번 달 금융 습관 -->
      <section v-if="habits.length > 0">
        <h2 class="sec-heading">이번 달 금융 습관</h2>
        <div class="insight-card">
        <div class="insight-list">
          <div class="habit-row" v-for="h in habits" :key="h.title">
            <button
              type="button"
              class="insight-row"
              @click="goToInsightRoute(h)"
            >
              <div>
                <span class="insight-badge" :style="{ background: h.dot + '22', color: h.dot }">
                  {{ h.type === 'savingRepayment' ? '저축·상환' : h.title }}
                </span>

                <!-- 저축·상환: 가입 상품 데이터로 회차 체크 배지 표시 -->
                <template v-if="h.type === 'savingRepayment' && savingRepaymentDetail">
                  <span v-for="(line, i) in savingRepaymentDetail.desc" :key="i">{{ line }}</span>
                </template>

                <!-- 일반 인사이트 (소비 / 오늘만 허용 / 퀘스트, 또는 저축 폴백 텍스트) -->
                <template v-else>
                  <span v-for="(line, i) in h.desc" :key="i">{{ line }}</span>
                </template>
              </div>
              <span class="chev" v-if="h.route || h.deepLink">›</span>
            </button>

            <template v-if="h.type === 'savingRepayment' && savingRepaymentDetail">
              <div class="round-row" v-if="savingRepaymentDetail.rounds.length">
                <div
                  v-for="r in savingRepaymentDetail.rounds"
                  :key="r.n"
                  class="round-badge"
                  :class="{ done: r.done }"
                >
                  <span class="round-circle">
                    <svg v-if="r.done" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                  <span class="round-label">{{ r.label }}</span>
                </div>
              </div>
              <div v-if="savingRepaymentDetail.summaryLine" class="round-summary">{{ savingRepaymentDetail.summaryLine }}</div>
            </template>
          </div>
        </div>
        </div>
      </section>

      <!-- 소비 명세 -->
      <section>
        <h2 class="sec-heading">소비 분석</h2>
        <div class="spend-card">
          <p class="spend-label">{{ spend.label }}</p>
          <p class="spend-amount">{{ won(spend.amount) }}</p>
          <span class="spend-diff">{{ spend.diffText }}</span>
          <p class="spend-compare">{{ spend.compareText }}</p>

          <div class="bar-chart">
            <div class="bar-col" v-for="w in spend.weeks" :key="w.label">
              <span class="bar-amt">{{ w.display }}</span>
              <div
                class="bar"
                :class="{ active: w.active, empty: w.empty }"
                :style="{ height: barHeight(w) }"
              ></div>
              <span class="bar-week" :class="{ active: w.active }">{{ w.label }}</span>
            </div>
          </div>

          <div class="top-cat-row">
            <span class="top-cat-label">이번 달 가장 많이 쓴 카테고리</span>
            <span class="top-cat-name">
              <span class="top-cat-dot" :style="{ background: topCategoryColor }"></span>
              {{ spend.topCategory }}
            </span>
          </div>

          <div class="donut-section">
            <svg width="98" height="98" viewBox="0 0 120 120">
              <circle
                v-for="(seg, i) in donutSegments"
                :key="i"
                cx="60" cy="60" r="44"
                fill="none"
                :stroke="seg.color"
                stroke-width="17"
                :stroke-dasharray="seg.dash"
                :stroke-dashoffset="seg.offset"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="57" text-anchor="middle" font-size="9" font-weight="600" fill="#94a3b8">총 사용</text>
              <text x="60" y="73" text-anchor="middle" font-size="13" font-weight="800" fill="#0f172a">{{ won(spend.amount) }}</text>
            </svg>
            <div class="donut-legend">
              <div class="legend-row" v-for="c in visibleCategories" :key="c.name">
                <span class="legend-dot" :style="{ background: c.color }"></span>
                <span class="legend-name">{{ c.name }}</span>
                <span class="legend-amt">{{ won(c.amount) }}</span>
              </div>
            </div>
          </div>

          <div class="cat-list">
            <div class="cat-row" v-for="c in visibleCategories" :key="c.name + '-row'">
              <span class="legend-dot" :style="{ background: c.color }"></span>
              <span class="cat-name">{{ c.name }}</span>
              <span class="cat-stat">{{ c.times }}회 · {{ c.percent }}%</span>
            </div>
          </div>

          <button class="btn-outline" v-if="sortedCategories.length > CATEGORY_PREVIEW_COUNT" @click="toggleAllCategories">
            {{ showAllCategories ? '접기' : `전체 보기 (카테고리 ${hiddenCategoryCount}개 더보기)` }}
          </button>
        </div>
      </section>

      <!-- 이달의 티니점수 변화 -->
      <section>
        <h2 class="sec-heading">티니점수 변화</h2>
        <div class="score-card">
          <div class="score-head">
            <div class="score-head-left">
              <div class="score-icon" :class="{ negative: score.change < 0 }">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
              </div>
              <div class="score-head-text">
                <span class="score-label">이번 달 점수 변화</span>
                <span class="score-value" :class="{ negative: score.change < 0 }">{{ score.change >= 0 ? '+' : '' }}{{ score.change }}점</span>
              </div>
            </div>
            <div class="score-stats">
              <span class="score-stat up"><span class="stat-dot"></span>증가 {{ score.up }}건</span>
              <span class="score-stat down"><span class="stat-dot"></span>감소 {{ score.down }}건</span>
            </div>
          </div>
          <div class="score-detail-row" v-for="(r, i) in score.reasons" :key="i">
            <span class="score-detail-label">{{ r.label }}</span>
            <span class="score-detail-value" :class="{ negative: !r.positive }">{{ r.value }}</span>
          </div>
          <button type="button" class="score-link" @click="goToScore">
            티니점수 자세히 보기
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </section>

      </template>

    </div>
  </div>
</template>

<style scoped>
.report-screen {
  --card: #ffffff;
  --card-border: #eaedf1;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.03);
  --ink: #0f172a;
  --ink-sub: #64748b;
  --ink-faint: #94a3b8;
  --yellow: #ffbc00;
  --orange: #f0b352;
  --orange-tag-bg: #fdf0dd;
  --orange-tag-fg: #b5793a;
  --blue: #4a90d9;
  --green: #4caf82;
  --green-tag-bg: #e6f6ec;
  --green-tag-fg: #2f9e5b;
  --blue-tag-bg: #eaf2fc;
  --blue-tag-fg: #2e72c7;
  --line: #f1f5f9;
  --radius-lg: 20px;
  --radius-md: 20px;
  --radius-sm: 12px;

  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  border: 1px solid var(--card-border);
  overflow: hidden;
  color: var(--ink);
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 4px 18px 40px;
}
.scroll::-webkit-scrollbar { width: 4px; }
.scroll::-webkit-scrollbar-thumb { background: #e2e4e8; border-radius: 999px; }

/* 상단 네비 — 스크롤 영역 밖 최상단에서 화면 좌우 끝까지 꽉 차게, 제목은 가운데 정렬 */
.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 14px 18px 18px;
}
.icon-btn {
  justify-self: start;
  border: none;
  background: transparent;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  transition: background 0.15s ease;
}
.icon-btn:hover { background: #f2f3f5; }
.nav-title {
  justify-self: center;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: var(--ink);
  white-space: nowrap;
}
.nav :deep(.nav-right) { justify-self: end; }

.state-msg {
  text-align: center;
  padding: 60px 20px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-sub);
}

/* 리포트 로드 실패 / 데이터 없음 안내 배너 */
.notice-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: var(--radius-md);
  box-sizing: border-box;
  margin-top: 4px;
}
.notice-banner.empty {
  background: #eef6ff;
  border: 1px solid #bfdbfe;
}
.notice-banner.error {
  background: #fff5f5;
  border: 1px solid #fecaca;
}
.notice-banner-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-banner-text {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}
.notice-banner.empty .notice-banner-text { color: #3d5a7a; }
.notice-banner.error .notice-banner-text { color: #991b1b; }

/* 월 이동 네비게이션 (은행 앱 스타일: ‹ 2026년 8월 › ) */
.month-nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 18px 4px;
}

.month-picker { position: relative; }
.month-nav-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 0;
  border: none;
  background: transparent;
  border-radius: 999px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.15s ease;
}
.month-nav-label:hover { background: #f2f3f5; }
.month-nav-label svg { color: var(--ink-faint); flex-shrink: 0; }

.month-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 10;
  min-width: 160px;
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(16,24,40,0.12);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.month-dropdown::-webkit-scrollbar { display: none; }
.month-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}
.month-option:hover { background: #f8f9fa; }
.month-option.active { background: var(--yellow); color: #392b00; font-weight: 800; }

.date-row { display: flex; align-items: center; justify-content: flex-start; gap: 8px; margin-bottom: 6px; }
.date-text { font-size: 13.5px; font-weight: 700; color: var(--ink-sub); }
.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--yellow);
  color: #ffffff;
}
.compare-line { margin: 4px 0 0; font-size: 12px; color: var(--ink-faint); margin-bottom: 28px; }

/* 티니코치 AI 금융 습관 분석 */
.coach-bubble-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.coach-bubble-mascot {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 4px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
}

.coach-bubble-box {
  position: relative;
  flex: 1;
  min-width: 0;
  background: #e8f3ff;
  border-radius: 18px;
  border-top-left-radius: 4px;
  padding: 14px 16px 16px;
}

.coach-bubble-box::before {
  content: '';
  position: absolute;
  top: 16px;
  left: -9px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 10px 10px 0;
  border-color: transparent #e8f3ff transparent transparent;
}

.coach-bubble-name {
  display: block;
  margin-bottom: 8px;
  font-size: 11.5px;
  font-weight: 800;
  color: #2f6fb0;
}

.coach-bubble-text {
  margin: 0 0 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1f3a52;
  line-height: 1.7;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.coach-bubble-para {
  margin: 0 0 12px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1f3a52;
  line-height: 1.75;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.coach-bubble-para:last-of-type {
  margin-bottom: 12px;
}

.coach-start-btn {
  border: none;
  background: var(--blue);
  color: #ffffff;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(74,144,217,0.35);
}

.coach-bubble-loading {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4a90d9;
  animation: coach-bounce 1.2s infinite;
}
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes coach-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.loading-text {
  font-size: 12px;
  font-weight: 600;
  color: #4a72a3;
}

.coach-retry-btn {
  border: 1px solid #4a90d9;
  color: #2f6fb0;
  background: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

h2.sec-heading {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 0 0 12px;
}

section { margin-bottom: 30px; }

/* 2x2 요약 카드 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stat-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-md);
  padding: 16px 14px;
}
.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.stat-label { font-size: 12.5px; color: var(--ink-sub); margin-bottom: 4px; font-weight: 600; }
.stat-value { font-size: 19px; font-weight: 800; color: var(--ink); margin-bottom: 6px; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.stat-value.green { color: var(--green-tag-fg); }
.stat-value.blue { color: var(--blue-tag-fg); }
.stat-desc { font-size: 11.5px; color: var(--ink-faint); line-height: 1.4; }

/* 금융 습관 카드 — 부모 자녀 리포트의 인사이트 카드와 동일한 리스트형 디자인 */
.insight-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-md);
  padding: 16px;
}

.insight-list {
  display: flex;
  flex-direction: column;
}

.habit-row {
  border-top: 1px solid var(--line);
}
.habit-row:first-child {
  border-top: none;
}

.insight-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0;
  border: none;
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.insight-row > div {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.insight-row > div > span:not(.insight-badge) {
  font-size: 13px;
  color: #3d3f44;
  line-height: 1.5;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.insight-badge {
  align-self: flex-start;
  margin-bottom: 2px;
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
}

.chev { flex-shrink: 0; color: #cbd5e1; font-size: 18px; }

/* 저축·상환 회차 배지 */
.round-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
}

.round-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 40px;
}

.round-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1.5px dashed #d7d9dd;
  color: transparent;
}

.round-badge.done .round-circle {
  background: var(--green-tag-bg);
  border: 1.5px solid var(--green);
  color: var(--green-tag-fg);
}

.round-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--ink-faint);
}

.round-badge.done .round-label {
  color: var(--green-tag-fg);
}

.round-summary {
  margin-top: 12px;
  padding-top: 10px;
  padding-bottom: 12px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-sub);
}

/* 소비 명세 카드 */
.spend-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-lg);
  padding: 20px 18px;
}
.spend-label { font-size: 13px; color: var(--ink-sub); margin: 0; font-weight: 600; }
.spend-amount { font-size: 25px; font-weight: 900; color: var(--ink); margin: 2px 0 10px; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.spend-diff {
  display: inline-block;
  background: var(--yellow);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}
.spend-compare { margin: 4px 0 0; font-size: 12px; color: var(--ink-faint); margin-bottom: 20px; }

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 92px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
}
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
.bar { width: 100%; max-width: 34px; border-radius: 8px 8px 3px 3px; background: var(--yellow); transition: height 0.25s ease; }
.bar.empty { background: transparent; border: 1.5px dashed #d7d9dd; }
.bar-week { font-size: 11px; color: var(--ink-sub); font-weight: 600; text-align: center; }
.bar-week.active { color: #a67300; font-weight: 800; }
.bar-amt { font-size: 10px; color: var(--ink-faint); font-variant-numeric: tabular-nums; white-space: nowrap; text-align: center; }

.top-cat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 18px;
}
.top-cat-label { font-size: 12.5px; color: var(--ink-sub); font-weight: 600; }
.top-cat-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
}
.top-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.donut-section { display: flex; align-items: center; gap: 14px; margin: 14px 0 16px; }
.donut-legend { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.legend-row { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; min-width: 0; color: var(--ink); font-weight: 600; white-space: nowrap; overflow: hidden; }
.legend-amt { flex-shrink: 0; min-width: 54px; text-align: right; color: var(--ink); font-weight: 700; font-variant-numeric: tabular-nums; }

.cat-list { display: flex; flex-direction: column; margin-bottom: 18px; }
.cat-row { display: flex; align-items: center; gap: 8px; font-size: 13.5px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.cat-row:last-child { border-bottom: none; }
.cat-row .legend-dot { width: 8px; height: 8px; }
.cat-row .cat-name { flex: 1; min-width: 0; color: var(--ink); font-weight: 600; white-space: nowrap; overflow: hidden; }
.cat-row .cat-stat { flex-shrink: 0; min-width: 66px; text-align: right; color: var(--ink-sub); font-size: 12.5px; font-variant-numeric: tabular-nums; }

.btn-outline {
  width: 100%;
  background: transparent;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 12px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink-sub);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn-outline:hover { background: #f8f9fa; border-color: #e2e4e8; }

/* 티니점수 카드 */
.score-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-lg);
  padding: 18px;
}
.score-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.score-head-left { display: flex; align-items: center; gap: 10px; }
.score-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--blue-tag-bg);
  color: var(--blue-tag-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.score-icon.negative { background: #fde7ea; color: #e5484d; }
.score-head-text { display: flex; flex-direction: column; gap: 3px; }
.score-label { font-size: 12.5px; color: var(--ink-sub); font-weight: 600; }
.score-value { font-size: 20px; font-weight: 900; color: var(--blue-tag-fg); letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.score-value.negative { color: #e5484d; }

.score-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; padding-top: 2px; }
.score-stat { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.score-stat.up { color: var(--blue-tag-fg); }
.score-stat.down { color: var(--ink-faint); }
.stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: currentColor; }

.score-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}
.score-detail-label { color: var(--ink); font-weight: 600; }
.score-detail-value { color: var(--blue-tag-fg); font-weight: 800; font-variant-numeric: tabular-nums; }
.score-detail-value.negative { color: #e5484d; }

.score-link {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-sub);
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
}

</style>