<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  getMyEnrolledFinancialProducts,
  getLoanProductDetail,
  createSavingPayment,
  getFinancialProducts,
  cancelPendingEnrollment,
} from '@/api/finance'
import { getMyWallet } from '@/api/wallet'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import { getKstParts, parseServerDate } from '@/utils/datetime'
import { formatRepaymentType } from '@/utils/financialProductMapper'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('나의 상품')
const tabs = ['신규 상품', '나의 상품']

watch(activeTab, (val) => {
  if (val === '신규 상품') {
    router.push({ name: 'child-finance-newproducts' })
  }
})

const categories = ['전체', '적금', '예금', '대출']
const statuses = ['전체', '승인 대기 중', '진행 중', '완료됨']

// 적용된 필터 상태
const activeCategory = ref('전체')
const activeStatus = ref('전체')

// 필터 바텀시트 상태
const showFilterSheet = ref(false)
const tempCategory = ref('전체')
const tempStatus = ref('전체')

function openFilterSheet() {
  tempCategory.value = activeCategory.value
  tempStatus.value = activeStatus.value
  showFilterSheet.value = true
}

function closeFilterSheet() {
  showFilterSheet.value = false
}

function applyFilter() {
  activeCategory.value = tempCategory.value
  activeStatus.value = tempStatus.value
  showFilterSheet.value = false
}

function resetFilter() {
  tempCategory.value = '전체'
  tempStatus.value = '전체'
}

const activeFilterCount = computed(() => {
  let count = 0
  if (activeCategory.value !== '전체') count++
  if (activeStatus.value !== '전체') count++
  return count
})

const filterSummaryText = computed(() => {
  const parts = []
  if (activeCategory.value !== '전체') parts.push(activeCategory.value)
  if (activeStatus.value !== '전체') parts.push(activeStatus.value)
  return parts.length > 0 ? parts.join(' · ') : '전체 필터'
})

// 매핑 테이블
const typeMap = { DEPOSIT: '예금', SAVING: '적금', LOAN: '대출' }
const interestTypeMap = { SIMPLE: '단리', COMPOUND: '복리' }
const savingsTypeMap = { FREE: '자유적금', FIXED: '정액적금' }

const statusMap = {
  PENDING: { label: '승인 대기 중', color: 'orange' },
  ACTIVE: null,
  TERMINATED: { label: '중도해지 완료', color: 'red' },
  CLOSED: { label: '중도해지 완료', color: 'red' },
  // 승인 대기 중 신청을 취소한 경우 (중도해지와는 다른 상태라 문구를 구분)
  CANCELLED: { label: '신청취소 완료', color: 'gray' },
  CANCELED: { label: '신청취소 완료', color: 'gray' },
  REPAID: { label: '상환 완료', color: 'green' },
}

// 해지(중도해지/만기 등으로 종료)된 계약인지 판별
// 백엔드가 status 문자열(TERMINATED 등)로 줄지, terminated boolean으로 줄지 확실치 않아 둘 다 체크
// CANCELLED/CANCELED 두 철자를 모두 내려줄 수 있어 둘 다 체크
function isEnrollmentTerminated(p) {
  return (
    p.terminated === true ||
    p.status === 'TERMINATED' ||
    p.status === 'CANCELLED' ||
    p.status === 'CANCELED' ||
    p.status === 'CLOSED' ||
    p.status === 'REPAID'
  )
}

// 정액적금 예상 만기 수령액 (월 납입금 x 개월 + 예상 이자)
function calcFixedSavingMaturity(monthlyAmount, termMonths, appliedRatePercent, isCompound) {
  if (!(monthlyAmount > 0) || !(termMonths > 0)) return 0
  const rate = (appliedRatePercent || 0) / 100
  let interest = 0
  for (let k = 1; k <= termMonths; k++) {
    const monthsHeld = termMonths - k + 1
    interest += isCompound
      ? monthlyAmount * (Math.pow(1 + rate / 12, monthsHeld) - 1)
      : monthlyAmount * rate * (monthsHeld / 12)
  }
  return monthlyAmount * termMonths + Math.floor(interest)
}

// 예금 예상 만기 수령액 (예치금 + 예상 이자, ProductsJoin.vue와 동일한 계산식)
function calcDepositMaturity(principal, termMonths, appliedRatePercent, isCompound) {
  if (!(principal > 0) || !(termMonths > 0)) return 0
  const rate = (appliedRatePercent || 0) / 100
  const interest = Math.floor(
    isCompound
      ? principal * (Math.pow(1 + rate / 12, termMonths) - 1)
      : principal * rate * (termMonths / 12)
  )
  return principal + interest
}

// 날짜 파싱 유틸
function parseDateParts(raw) {
  const date = parseServerDate(raw)
  if (!date) return null
  const { year, month, day } = getKstParts(date)
  return { y: year, m: month, d: day }
}

function formatDateCompact(raw) {
  const parts = parseDateParts(raw)
  if (!parts) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${parts.y}.${pad(parts.m)}.${pad(parts.d)}`
}

function formatDateKorean(raw) {
  const parts = parseDateParts(raw)
  if (!parts) return '-'
  return `${parts.m}월 ${parts.d}일`
}

// 다음 납입/상환일 계산
function calcNextDueDate(startRaw, paidCount) {
  const parts = parseDateParts(startRaw)
  if (!parts) return null

  const monthsToAdd = (paidCount ?? 0) + 1
  const targetMonthIndex = (parts.m - 1) + monthsToAdd
  const targetYear = parts.y + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12

  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const targetDay = Math.min(parts.d, lastDayOfTargetMonth)

  return new Date(targetYear, targetMonth, targetDay)
}

// 부모 생성 상품 vs 실제 금융기관 상품 판별
function resolveProductOrigin(p) {
  if (p.isFamilyProduct !== undefined) {
    return p.isFamilyProduct
      ? { type: 'family', label: '가족 상품' }
      : { type: 'bank', label: p.financialCompanyName || '금융기관' }
  }
  if (p.creatorType === 'PARENT' || p.creatorType === 'FAMILY') {
    return { type: 'family', label: '가족 상품' }
  }

  const comp = (p.financialCompanyName || '').trim()
  if (!comp || comp === '가족' || comp === '부모' || comp === '우리가족') {
    return { type: 'family', label: '가족 상품' }
  }

  return { type: 'bank', label: comp }
}

// 대출 최초 신청 원금 안전 조회 (백엔드 실제 신청금액 최우선)
// 주의: currentAmount는 "현재 남은 잔액"이라 조기상환할수록 줄어든다.
// 캐시보다 먼저 검사하면 상환할 때마다 원금이 줄어드는 값으로 덮어써지므로,
// 반드시 캐시(한 번 저장된 원금)를 currentAmount보다 먼저 확인해야 한다.
function getOrStoreOriginalLoanPrincipal(enrollmentId, currentAmount, explicitPrincipal) {
  const storageKey = enrollmentId ? `teeny_loan_principal_${enrollmentId}` : null

  // 1. 백엔드에서 내려온 실제 신청금액(explicitPrincipal)이 있으면 최우선 적용
  if (explicitPrincipal && explicitPrincipal > 0) {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(explicitPrincipal))
      } catch (e) {}
    }
    return explicitPrincipal
  }

  // 2. 이미 저장해둔 원금 캐시가 있으면 그대로 사용 (조기상환 후에도 원금은 불변)
  if (storageKey) {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw && Number(raw) > 0) return Number(raw)
    } catch (e) {}
  }

  // 3. 캐시도 없을 때만 현재 잔액을 원금으로 최초 1회 추정 저장 (아직 상환 전이면 잔액 = 원금)
  if (currentAmount && currentAmount > 0) {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(currentAmount))
      } catch (e) {}
    }
    return currentAmount
  }

  return 0
}

// 예금 신청 금액 캐시: 목록 API가 신청 금액 필드를 내려주지 않으므로
// ProductsConfirm.vue에서 저장해둔 localStorage 값을 사용한다.
function getOrStoreDepositAmount(enrollmentId, explicitAmount) {
  const storageKey = enrollmentId ? `teeny_deposit_amount_${enrollmentId}` : null

  if (explicitAmount && explicitAmount > 0) {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(explicitAmount))
      } catch (e) {}
    }
    return explicitAmount
  }

  if (storageKey) {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw && Number(raw) > 0) return Number(raw)
    } catch (e) {}
  }

  return 0
}

// 중도해지일 캐시 조회: 목록 API가 중도해지 완료 시점을 내려주지 않으므로
// ProductsCancel.vue에서 해지 처리 성공 시 저장해둔 localStorage 값을 사용한다.
function getCachedTerminatedDate(enrollmentId) {
  if (!enrollmentId) return null
  try {
    return localStorage.getItem(`teeny_terminated_date_${enrollmentId}`)
  } catch (e) {
    return null
  }
}

// 대출 상환 완료일 캐시 조회: 조기상환으로 완제된 경우, 원래 만기일 대신
// ProductsCancel.vue에서 저장해둔 실제 완제일을 사용한다.
function getCachedRepaidDate(enrollmentId) {
  if (!enrollmentId) return null
  try {
    return localStorage.getItem(`teeny_repaid_date_${enrollmentId}`)
  } catch (e) {
    return null
  }
}

// API 데이터 매핑
function mapEnrolledProduct(p) {
  const isLoan = p.productType === 'LOAN'
  const isSaving = p.productType === 'SAVING'
  const isDeposit = p.productType === 'DEPOSIT'
  const isPending = p.status === 'PENDING'
  const isTerminated = isEnrollmentTerminated(p)
  const isCancelled = p.status === 'CANCELLED' || p.status === 'CANCELED'
  const isFreeSaving = isSaving && p.savingsType === 'FREE'

  const statusInfo = statusMap[p.status] ?? {
    label: isLoan ? '상환 진행 중' : '유지 중',
    color: isLoan ? 'blue' : 'green',
  }

  const paidCount = p.paidCount ?? 0
  const totalCount = p.totalPaymentCount ?? 0
  const currentTotal = p.currentAmount ?? 0

  const maxLimit = p.maximumAmount ?? p.productMaximumAmount ?? null
  const enrollmentId = p.enrollmentId ?? p.id ?? p.loanEnrollmentId ?? p.savingEnrollmentId ?? p.depositEnrollmentId

  // 예금: 목록 조회 API가 신청 금액을 내려주지 않아, 가입 신청(ProductsConfirm.vue)에서
  // localStorage에 캐시해둔 값을 사용한다. 백엔드가 필드를 내려주면 그 값을 우선 사용.
  const explicitDepositAmount = p.principalAmount ?? p.depositAmount ?? p.amount ?? p.appliedAmount ?? p.requestedAmount ?? null
  const depositPrincipal = isDeposit
    ? getOrStoreDepositAmount(enrollmentId, explicitDepositAmount)
    : 0

  // 중도해지 완료: 백엔드가 해지 시점을 내려주지 않아, 해지 실행(ProductsCancel.vue) 시
  // localStorage에 캐시해둔 날짜를 만기일 대신 보여준다.
  const isEarlyTerminated = p.status === 'TERMINATED' || p.status === 'CLOSED'
  const terminatedDate = isEarlyTerminated ? getCachedTerminatedDate(enrollmentId) : null

  // 대출 상환 완료: 조기상환으로 완제된 경우 원래 만기일이 아니라 실제 완제일을 보여준다.
  // 캐시가 없으면(정상 스케줄대로 완납) 기존 만기일이 실제 완제일과 같으므로 그대로 사용.
  const isLoanRepaid = isLoan && p.status === 'REPAID'
  const repaidDate = isLoanRepaid ? getCachedRepaidDate(enrollmentId) : null

  // 1. 대출 총 원금 (대출 신청할 때 넣은 최초 원금)
  // 대출의 경우 p.amount, p.principalAmount, p.loanAmount, p.requestedAmount 등 실제 신청 원금 우선
  let explicitLoanPrincipal =
    p.principalAmount ??
    p.originalPrincipalAmount ??
    p.loanAmount ??
    p.amount ??
    p.requestedAmount ??
    p.appliedAmount ??
    null

  const totalLoanPrincipal = isLoan
    ? getOrStoreOriginalLoanPrincipal(enrollmentId, currentTotal, explicitLoanPrincipal)
    : currentTotal

  // 월 납입/상환 금액
  let monthlyAmount = p.monthlyAmount ?? p.monthlyPaymentAmount ?? p.paymentAmount ?? 0
  if (!monthlyAmount) {
    if (isSaving && !isFreeSaving) {
      monthlyAmount = p.amount ?? p.principalAmount ?? 0
    } else if (isLoan && totalLoanPrincipal > 0 && p.termMonths > 0) {
      monthlyAmount = Math.round(totalLoanPrincipal / p.termMonths)
    }
  }

  const freeGoalAmount = (monthlyAmount > 0 && p.termMonths > 0) ? (monthlyAmount * p.termMonths) : (maxLimit ?? monthlyAmount)

  // 2. 조기상환 후 남은 금액 (앞으로 갚을 돈) & 이미 상환한 금액 산출
  // 백엔드 currentAmount는 현재 남은 잔여 원금 (승인 대기 중이면 아직 대출 실행 전이므로 totalLoanPrincipal 기준)
  const remainingLoanAmount = (p.status === 'REPAID' || p.terminated)
    ? 0
    : isPending
      ? totalLoanPrincipal
      : currentTotal
  const repaidLoanAmount = isPending ? 0 : Math.max(0, totalLoanPrincipal - remainingLoanAmount)

  const loanProgressPercent = totalLoanPrincipal > 0
    ? Math.min(100, Math.round((repaidLoanAmount / totalLoanPrincipal) * 100))
    : 0

  const savingProgressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0
  const progressPercent = isLoan ? loanProgressPercent : savingProgressPercent

  let infoText = ''
  if (isTerminated) {
    infoText = p.status === 'REPAID'
      ? '대출이 모두 상환 완료됐어요.'
      : isCancelled
        ? '신청 취소된 상품이에요.'
        : '중도해지가 완료된 상품이에요.'
  } else if (isPending) {
    infoText = '부모님의 승인을 기다리고 있어요.'
  } else if (isSaving) {
    if (isFreeSaving) {
      infoText = `지금까지 총 ${currentTotal.toLocaleString()}원을 모았어요.`
    } else {
      const nextDue = calcNextDueDate(p.startDate, paidCount)
      infoText = nextDue
        ? `다음 납입일은 ${nextDue.getMonth() + 1}월 ${nextDue.getDate()}일이에요.`
        : ''
    }
  } else if (isDeposit) {
    infoText = `지금 ${(p.currentAmount ?? 0).toLocaleString()}원이 들어 있고 ${formatDateKorean(p.maturityDate)}에 만기가 돼요.`
  } else if (isLoan) {
    const nextDue = calcNextDueDate(p.startDate, paidCount)
    infoText = nextDue ? `다음 상환일은 ${nextDue.getMonth() + 1}월 ${nextDue.getDate()}일이에요.` : ''
  }

  let pendingSummary = ''
  if (isSaving) {
    const interestLabel = interestTypeMap[p.interestCalculationType] ?? p.interestCalculationType ?? '-'
    pendingSummary = `${interestLabel} | ${p.termMonths ?? '-'}개월 | 연 ${p.appliedRate ?? '-'}%`
  } else if (isDeposit) {
    const interestLabel = interestTypeMap[p.interestCalculationType] ?? p.interestCalculationType ?? '-'
    pendingSummary = `${interestLabel} | ${p.termMonths ?? '-'}개월 | 연 ${p.appliedRate ?? '-'}%`
  } else if (isLoan) {
    pendingSummary = `${p.termMonths ?? '-'}개월 | 연 ${p.appliedRate ?? '-'}%`
  } else {
    pendingSummary = `${p.termMonths ?? '-'}개월 | 연 ${p.appliedRate ?? '-'}%`
  }

  const origin = resolveProductOrigin(p)
  const displayTypeLabel = isSaving
    ? (savingsTypeMap[p.savingsType] || '적금')
    : (typeMap[p.productType] ?? p.productType)

  // 정액적금은 상품 납입한도 대신 예상 만기 수령액과 가입기간을 보여준다.
  const isFixedSaving = isSaving && !isFreeSaving
  const fixedSavingMaturity = isFixedSaving
    ? calcFixedSavingMaturity(monthlyAmount, p.termMonths, p.appliedRate, p.interestCalculationType === 'COMPOUND')
    : 0
  const depositMaturity = isDeposit
    ? calcDepositMaturity(depositPrincipal, p.termMonths, p.appliedRate, p.interestCalculationType === 'COMPOUND')
    : 0

  const limitLabel = isFixedSaving
    ? '예상 만기 수령액'
    : isFreeSaving ? '총 목표액' : isLoan ? '신청 대출금' : isDeposit ? '예치금' : '납입한도'
  const limitText = isFixedSaving
    ? (fixedSavingMaturity > 0 ? `${fixedSavingMaturity.toLocaleString()}원` : '-')
    : isFreeSaving
      ? (freeGoalAmount > 0 ? `${freeGoalAmount.toLocaleString()}원` : '-')
      : isLoan
        ? (totalLoanPrincipal > 0 ? `${totalLoanPrincipal.toLocaleString()}원` : (maxLimit ? `${maxLimit.toLocaleString()}원` : '-'))
        : isDeposit
          ? (depositPrincipal > 0 ? `${depositPrincipal.toLocaleString()}원` : '-')
          : (maxLimit ? `${maxLimit.toLocaleString()}원` : '-')

  const transferDay = p.paymentDay ?? p.transferDay ?? p.autoTransferDay ?? parseDateParts(p.startDate)?.d

  let monthlyAmountLabel = isLoan
    ? (isPending ? '월 예상 상환액' : '월 상환금액')
    : isSaving && !isFreeSaving
      ? '월 납입금액'
      : isFreeSaving
        ? (isPending ? '한 달 목표금액' : '현재 모은 금액')
        : ''
  let monthlyAmountText = ''
  if (isFreeSaving) {
    // 승인 대기 중에는 아직 저축이 시작되지 않아 "현재 모은 금액" 대신 신청 시 입력한 한 달 목표금액을 보여준다.
    monthlyAmountText = isPending
      ? (monthlyAmount > 0 ? `${monthlyAmount.toLocaleString()}원` : '')
      : `${currentTotal.toLocaleString()}원`
  } else if (monthlyAmount > 0 && !isDeposit) {
    const daySuffix = transferDay ? ` (매월 ${transferDay}일)` : ''
    monthlyAmountText = `${monthlyAmount.toLocaleString()}원${daySuffix}`
  }

  return {
    id: enrollmentId,
    category: typeMap[p.productType] ?? p.productType,
    displayTypeLabel,
    originType: origin.type,
    originLabel: origin.label,
    title: p.productName,
    status: statusInfo.label,
    statusColor: statusInfo.color,
    isPending,
    isTerminated,
    pendingSummary,
    isLoan,
    productId: p.productId,
    hasDateRange: isEarlyTerminated
      ? Boolean(p.startDate) && Boolean(terminatedDate)
      : !isPending && Boolean(p.startDate) && Boolean(p.maturityDate),
    startDate: formatDateCompact(p.startDate),
    maturityDate: isEarlyTerminated
      ? formatDateCompact(terminatedDate)
      : (isLoanRepaid && repaidDate)
        ? formatDateCompact(repaidDate)
        : formatDateCompact(p.maturityDate),
    hasProgress: !isPending && isSaving && !isFreeSaving,
    progressPercent,
    progressLabel: `납입 ${paidCount}/${totalCount}회 · ${progressPercent}%`,
    progressColor: 'green',
    infoText,
    monthlyAmountLabel,
    monthlyAmountText,
    limitLabel,
    limitText,
    // 대출: 신청 대출금 아래에 앞으로 갚을 돈을, 예금: 예치금 아래에 예상 만기 수령액을 별도로 표시
    remainingLabel: isLoan ? '앞으로 갚을 돈' : isDeposit ? '예상 만기 수령액' : '',
    remainingText: isLoan
      ? `${remainingLoanAmount.toLocaleString()}원`
      : isDeposit
        ? (depositMaturity > 0 ? `${depositMaturity.toLocaleString()}원` : '')
        : '',
    isFixedSaving,
    productType: p.productType,
    savingsType: p.savingsType || '',
    interestCalculationType: p.interestCalculationType || 'SIMPLE',
    repaymentType: '',
    lateFeeRate: 0,
    requiredGradeName: '',
    isFreeSaving,
    principal: isLoan ? totalLoanPrincipal : currentTotal,
    appliedRate: p.appliedRate ?? 0,
    termMonths: p.termMonths ?? 0,
    startDateRaw: p.startDate,
    paidCount,
    totalPaymentCount: totalCount,
  }
}

// 지갑 & 가입 상품 상태
const myProducts = ref([])
const myWalletBalance = ref(0)

async function fetchWalletBalance() {
  try {
    const res = await getMyWallet(authStore.accessToken)
    myWalletBalance.value = res?.data?.balance ?? res?.balance ?? 0
  } catch (e) {
    console.warn('지갑 잔액 조회 실패:', e.message)
  }
}

async function loadProducts() {
  try {
    const [enrolledData, allProductsData] = await Promise.all([
      getMyEnrolledFinancialProducts(authStore.accessToken),
      getFinancialProducts(authStore.accessToken).catch(() => []),
    ])

    const allProductsMap = new Map()
    ;(allProductsData || []).forEach((prod) => {
      allProductsMap.set(`${prod.productType}-${prod.productId}`, prod)
      allProductsMap.set(prod.productId, prod)
    })

    myProducts.value = (enrolledData || []).map((p) => {
      const orig = allProductsMap.get(`${p.productType}-${p.productId}`) || allProductsMap.get(p.productId)
      if (orig) {
        if (!p.maximumAmount && orig.maximumAmount) p.maximumAmount = orig.maximumAmount
        if (!p.interestCalculationType && orig.interestCalculationType) p.interestCalculationType = orig.interestCalculationType
      }
      return mapEnrolledProduct(p)
    })

    // 대출 상품 상세 API 연동
    const loanProducts = myProducts.value.filter((p) => p.isLoan && p.productId)
    await Promise.all(
      loanProducts.map(async (product) => {
        try {
          const detailRes = await getLoanProductDetail(authStore.accessToken, product.productId)
          const detail = detailRes?.data ?? detailRes

          if (detail) {
            product.requiredGradeName = detail.requiredGradeName || ''
            product.repaymentType = formatRepaymentType(detail.repaymentType)
            product.lateFeeRate = detail.lateFeeRate ?? 0

            if (product.isPending) {
              const principalStr = product.principal > 0
                ? `신청 ${product.principal.toLocaleString()}원`
                : (product.requiredGradeName ? `${product.requiredGradeName} 등급 이상` : '')
              const termStr = product.termMonths ? `${product.termMonths}개월` : ''
              const rateStr = product.appliedRate ? `연 ${product.appliedRate}%` : ''
              product.pendingSummary = [principalStr, termStr, rateStr].filter(Boolean).join(' | ')

              if (product.requiredGradeName) {
                product.pendingSummary = `${product.requiredGradeName} 등급 이상 | ${product.termMonths ?? '-'}개월 | 연 ${product.appliedRate ?? '-'}%`
              }
            }
          }
        } catch (e) {
          console.warn('대출 상품 상세 조회 실패:', product.productId, e.message)
        }
      })
    )
  } catch (e) {
    console.error('가입 상품 목록 조회 실패:', e.message)
  }
}

onMounted(() => {
  loadProducts()
  fetchWalletBalance()
})

// 상품 종류(적금/예금/대출) 필터만 적용한 목록
const categoryFilteredProducts = computed(() =>
  activeCategory.value === '전체'
    ? myProducts.value
    : myProducts.value.filter((p) => p.category === activeCategory.value)
)

const pendingProducts = computed(() => categoryFilteredProducts.value.filter((p) => p.isPending))
const activeProducts = computed(() => categoryFilteredProducts.value.filter((p) => !p.isPending && !p.isTerminated))

// 완료(중도해지/만기 등)된 상품 — 진행 중 목록과는 별도로 모아서 보여줌
const completedProducts = computed(() => categoryFilteredProducts.value.filter((p) => p.isTerminated))

// 상태 필터에 따라 어느 그룹을 보여줄지 결정
const showPendingGroup = computed(() => activeStatus.value === '전체' || activeStatus.value === '승인 대기 중')
const showActiveGroup = computed(() => activeStatus.value === '전체' || activeStatus.value === '진행 중')
const showCompletedGroup = computed(() => activeStatus.value === '전체' || activeStatus.value === '완료됨')

const visibleProductCount = computed(() =>
  (showPendingGroup.value ? pendingProducts.value.length : 0) +
  (showActiveGroup.value ? activeProducts.value.length : 0) +
  (showCompletedGroup.value ? completedProducts.value.length : 0)
)

// 승인 대기 신청 취소 모달 상태
const showCancelPendingModal = ref(false)
const showCancelPendingSuccessModal = ref(false)
const cancelTargetProduct = ref(null)
const isCancellingPending = ref(false)
const cancelPendingError = ref('')

function openCancelPendingModal(product) {
  cancelTargetProduct.value = product
  cancelPendingError.value = ''
  showCancelPendingModal.value = true
}

function closeCancelPendingModal() {
  if (isCancellingPending.value) return
  showCancelPendingModal.value = false
  cancelTargetProduct.value = null
}

async function handleCancelPendingSubmit() {
  if (!cancelTargetProduct.value || isCancellingPending.value) return
  isCancellingPending.value = true
  cancelPendingError.value = ''
  try {
    const prod = cancelTargetProduct.value
    await cancelPendingEnrollment(authStore.accessToken, prod.productType, prod.id)

    // 로컬 스토리지 정리
    try {
      localStorage.removeItem(`teeny_loan_principal_${prod.id}`)
    } catch (e) {}

    showCancelPendingModal.value = false
    showCancelPendingSuccessModal.value = true
    await loadProducts()
  } catch (err) {
    console.error('신청 취소 실패:', err)
    cancelPendingError.value = err.message || '신청 취소에 실패했어요. 다시 시도해 주세요.'
  } finally {
    isCancellingPending.value = false
  }
}

function closeCancelPendingSuccessModal() {
  showCancelPendingSuccessModal.value = false
}

// 중도해지 이동
function goToCancel(product) {
  const parts = parseDateParts(product.startDateRaw)
  const startDateIso = parts
    ? `${parts.y}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`
    : ''

  router.push({
    name: 'product-cancel',
    query: {
      id: product.id,
      title: product.title,
      category: product.category,
      productType: product.productType,
      savingsType: product.savingsType,
      interestCalculationType: product.interestCalculationType,
      principal: product.principal,
      appliedRate: product.appliedRate,
      termMonths: product.termMonths,
      startDate: startDateIso,
      paidCount: product.paidCount,
      totalPaymentCount: product.totalPaymentCount,
    },
  })
}

// 자유적금 간편 이체 바텀시트
const showDepositSheet = ref(false)
const showSuccessModal = ref(false)
const selectedProduct = ref(null)
const depositAmount = ref(0)
const lastTransferredAmount = ref(0)
const isSubmitting = ref(false)

const isOverBalance = computed(() => depositAmount.value > myWalletBalance.value)

function openDepositSheet(product) {
  selectedProduct.value = product
  depositAmount.value = 0
  showDepositSheet.value = true
  fetchWalletBalance()
}

function closeDepositSheet() {
  if (isSubmitting.value) return
  showDepositSheet.value = false
  selectedProduct.value = null
  depositAmount.value = 0
}

function addAmount(val) {
  depositAmount.value = (depositAmount.value || 0) + val
}

function setFullAmount() {
  depositAmount.value = myWalletBalance.value
}

function resetAmount() {
  depositAmount.value = 0
}

function onAmountInput(e) {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  depositAmount.value = raw ? parseInt(raw, 10) : 0
}

function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function handleDepositSubmit() {
  if (depositAmount.value <= 0 || isOverBalance.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await createSavingPayment(authStore.accessToken, selectedProduct.value.id, {
      amount: depositAmount.value,
      idempotencyKey: generateIdempotencyKey(),
    })

    lastTransferredAmount.value = depositAmount.value

    const targetItem = myProducts.value.find((p) => p.id === selectedProduct.value.id)
    if (targetItem) {
      targetItem.principal = result.accumulatedAmount
      targetItem.infoText = `지금까지 총 ${targetItem.principal.toLocaleString()}원을 모았어요.`
      targetItem.monthlyAmountText = `${targetItem.principal.toLocaleString()}원`
    }

    myWalletBalance.value = Math.max(0, myWalletBalance.value - depositAmount.value)
    showSuccessModal.value = true
  } catch (e) {
    console.error('이체 실패:', e)
    openTransferErrorModal(e.message || '이체에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

// 이체 실패 커스텀 모달 상태
const showTransferErrorModal = ref(false)
const transferErrorMessage = ref('')

function openTransferErrorModal(msg) {
  transferErrorMessage.value = msg || '이체에 실패했습니다. 다시 시도해주세요.'
  showTransferErrorModal.value = true
}

function closeTransferErrorModal() {
  showTransferErrorModal.value = false
}

function handleSuccessConfirm() {
  showSuccessModal.value = false
  closeDepositSheet()
}

// 머니 리포트의 습관 카드를 눌러 들어온 경우(from=report)는 브라우저 히스토리
// 상태와 무관하게 무조건 리포트로 돌아가고, 그 외(홈/탭 등)에는 기존처럼 홈으로 간다.
function goBack() {
  if (route.query.from === 'report') {
    router.push({ name: 'child-report' })
    return
  }
  router.push({ name: 'child-home' })
}

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'quest')   router.push({ name: 'child-quest-list' })
}

const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    isScrolling.value = false
  }, 800)
}
</script>

<template>
  <div class="product-screen">
    <ChildPageNav title="금융 상품" @back="goBack" />

    <!-- 탭 스위처 — 상단 네비와 이어지도록 흰 배경으로 화면 좌우 끝까지 꽉 차게 -->
    <div class="tab-switcher">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab-btn"
        :class="{ active: tab === activeTab }"
        @click="activeTab = tab"
      >
        <span class="tab-label">{{ tab }}</span>
      </button>
    </div>

    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- 상단 카운트 및 인라인 필터 버튼 -->
      <div class="list-header-row">
        <p class="count-row">상품<span class="count-num">{{ visibleProductCount }}</span></p>

        <button class="filter-chip-btn" :class="{ active: activeFilterCount > 0 }" @click="openFilterSheet">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" class="filter-icon">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="filter-summary-text">{{ filterSummaryText }}</span>
          <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <!-- 승인 대기 중 -->
      <template v-if="showPendingGroup && pendingProducts.length">
        <h2 class="group-title">승인 대기 중</h2>
        <div v-for="product in pendingProducts" :key="product.id" class="card pending">
          <div class="pending-top">
            <div class="title-with-badge">
              <span class="prod-title">{{ product.title }}</span>
              <span class="origin-badge" :class="product.originType">
                {{ product.originLabel }}
              </span>
            </div>
            <span class="pending-badge">{{ product.displayTypeLabel }} · 승인 대기</span>
          </div>
          <p class="pending-summary">{{ product.pendingSummary }}</p>
          <div v-if="product.monthlyAmountText || product.limitText" class="spec-grid pending">
            <div v-if="product.monthlyAmountText" class="spec-item">
              <span class="spec-label">{{ product.monthlyAmountLabel }}</span>
              <span class="spec-val highlight">{{ product.monthlyAmountText }}</span>
            </div>
            <div v-if="product.limitText" class="spec-item">
              <span class="spec-label">{{ product.limitLabel }}</span>
              <span class="spec-val">{{ product.limitText }}</span>
            </div>
            <div v-if="product.remainingText" class="spec-item">
              <span class="spec-label">{{ product.remainingLabel }}</span>
              <span class="spec-val">{{ product.remainingText }}</span>
            </div>
          </div>
          <div class="pending-bottom-row">
            <p class="pending-info-text">{{ product.infoText }}</p>
            <button
              type="button"
              class="btn-cancel-pending"
              @click.stop="openCancelPendingModal(product)"
            >
              신청 취소
            </button>
          </div>
        </div>
      </template>

      <!-- 진행 중 -->
      <template v-if="showActiveGroup && activeProducts.length">
        <h2 class="group-title">진행 중</h2>
        <div v-for="product in activeProducts" :key="product.id" class="card">
          <div class="card-top">
            <div class="title-with-badge">
              <span class="prod-title">{{ product.title }}</span>
              <span class="origin-badge" :class="product.originType">
                {{ product.originLabel }}
              </span>
            </div>
            <span class="type-status-badge" :class="product.statusColor">
              {{ product.displayTypeLabel }} · {{ product.status }}
            </span>
          </div>

          <p v-if="product.pendingSummary" class="pending-summary">{{ product.pendingSummary }}</p>

          <p v-if="product.hasDateRange" class="date-range">{{ product.startDate }} ~ {{ product.maturityDate }}</p>

          <!-- 납입 금액 및 한도 정보 박스 -->
          <div v-if="product.monthlyAmountText || product.limitText" class="spec-grid">
            <div v-if="product.monthlyAmountText" class="spec-item">
              <span class="spec-label">{{ product.monthlyAmountLabel }}</span>
              <span class="spec-val highlight">{{ product.monthlyAmountText }}</span>
            </div>
            <div v-if="product.limitText" class="spec-item">
              <span class="spec-label">{{ product.limitLabel }}</span>
              <span class="spec-val">{{ product.limitText }}</span>
            </div>
            <div v-if="product.remainingText" class="spec-item">
              <span class="spec-label">{{ product.remainingLabel }}</span>
              <span class="spec-val">{{ product.remainingText }}</span>
            </div>
          </div>

          <div v-if="product.hasProgress" class="progress-block">
            <div class="progress-track">
              <div
                class="progress-fill"
                :class="product.progressColor"
                :style="{ width: product.progressPercent + '%' }"
              ></div>
            </div>
            <p class="progress-label">{{ product.progressLabel }}</p>
          </div>

          <p v-if="product.infoText" class="info-text">{{ product.infoText }}</p>

          <!-- 대출 부가 정보 표시 -->
          <div v-if="product.isLoan && (product.repaymentType || product.lateFeeRate > 0)" class="loan-details">
            <span v-if="product.repaymentType" class="meta-tag">{{ product.repaymentType }} 방식</span>
            <span v-if="product.lateFeeRate > 0" class="meta-tag alert">연체 이율 {{ product.lateFeeRate }}%</span>
          </div>

          <!-- 하단 액션 바 -->
          <div class="card-footer" :class="{ 'between': product.isFreeSaving, 'end': !product.isFreeSaving }">
            <!-- [좌측] 자유적금: 플러스(+) 아이콘 적용된 이체하기 버튼 -->
            <button
              v-if="product.isFreeSaving"
              type="button"
              class="btn-deposit-chip"
              @click="openDepositSheet(product)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15171b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>이체하기</span>
            </button>

            <!-- [우측] 중도해지/조기상환 링크 버튼 -->
            <button
              type="button"
              class="btn-cancel-link"
              @click="goToCancel(product)"
            >
              {{ product.isLoan ? '조기상환' : '중도해지' }}
            </button>
          </div>
        </div>
      </template>

      <!-- 완료됨 (중도해지 등으로 종료된 상품) -->
      <template v-if="showCompletedGroup && completedProducts.length">
        <h2 class="group-title">완료됨</h2>
        <div v-for="product in completedProducts" :key="product.id" class="card completed">
          <div class="title-with-badge">
            <span class="prod-title">{{ product.title }}</span>
            <span class="origin-badge" :class="product.originType">
              {{ product.originLabel }}
            </span>
          </div>
          <p class="status-line">
            {{ product.displayTypeLabel }} · <span class="status-text" :class="product.statusColor">{{ product.status }}</span>
          </p>
          <p v-if="product.hasDateRange" class="date-range">{{ product.startDate }} ~ {{ product.maturityDate }}</p>
          <p v-if="product.infoText" class="info-text">{{ product.infoText }}</p>
        </div>
      </template>
    </div>

    <!-- 나의 상품 필터 바텀시트 -->
    <transition name="sheet">
      <div v-if="showFilterSheet" class="sheet-dim" @click.self="closeFilterSheet">
        <div class="sheet">
          <div class="sheet-handle-wrap"><div class="sheet-handle"></div></div>

          <div class="sheet-header">
            <h3 class="sheet-title">상품 필터</h3>
            <button class="sheet-reset-btn" type="button" @click="resetFilter">초기화</button>
          </div>

          <!-- 1. 상품 종류 -->
          <p class="sheet-group-title">상품 종류</p>
          <div class="sheet-chips">
            <button
              v-for="c in categories"
              :key="c"
              type="button"
              class="s-chip"
              :class="{ on: c === tempCategory }"
              @click="tempCategory = c"
            >{{ c }}</button>
          </div>

          <!-- 2. 상태 -->
          <p class="sheet-group-title">상태</p>
          <div class="sheet-chips">
            <button
              v-for="s in statuses"
              :key="s"
              type="button"
              class="s-chip"
              :class="{ on: s === tempStatus }"
              @click="tempStatus = s"
            >{{ s }}</button>
          </div>

          <button class="sheet-apply" type="button" @click="applyFilter">적용하기</button>
        </div>
      </div>
    </transition>

    <!-- 간편 이체 바텀시트 -->
    <div
      v-if="showDepositSheet"
      class="bottomsheet-backdrop"
      @click.self="closeDepositSheet"
    >
      <div class="bottomsheet">
        <div class="sheet-header">
          <div class="sheet-title-group">
            <h3 class="sheet-title">{{ selectedProduct?.title }}</h3>
            <span class="origin-badge" :class="selectedProduct?.originType">
              {{ selectedProduct?.originLabel }}
            </span>
          </div>
          <button type="button" class="sheet-close-btn" @click="closeDepositSheet" aria-label="닫기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="sheet-balance-row">
          <span class="balance-label">내 지갑 잔액</span>
          <span class="balance-val">{{ myWalletBalance.toLocaleString() }}원</span>
        </div>

        <div class="amount-input-box" :class="{ error: isOverBalance }">
          <input
            type="text"
            inputmode="numeric"
            class="amount-input"
            placeholder="0"
            :value="depositAmount ? depositAmount.toLocaleString() : ''"
            @input="onAmountInput"
          />
          <span class="currency">원</span>
          <button v-if="depositAmount > 0" type="button" class="btn-clear" @click="resetAmount">×</button>
        </div>

        <p v-if="isOverBalance" class="error-msg">지갑 잔액보다 큰 금액은 넣을 수 없어요.</p>

        <div class="quick-amounts">
          <button type="button" class="quick-btn" @click="addAmount(1000)">+1천원</button>
          <button type="button" class="quick-btn" @click="addAmount(5000)">+5천원</button>
          <button type="button" class="quick-btn" @click="addAmount(10000)">+1만원</button>
          <button type="button" class="quick-btn full" @click="setFullAmount">전액</button>
        </div>

        <button
          type="button"
          class="btn-sheet-submit"
          :disabled="depositAmount <= 0 || isOverBalance || isSubmitting"
          @click="handleDepositSubmit"
        >
          <span v-if="isSubmitting">이체 진행 중...</span>
          <span v-else-if="isOverBalance">잔액이 부족해요</span>
          <span v-else>{{ depositAmount > 0 ? `${depositAmount.toLocaleString()}원 넣기` : '금액을 입력해주세요' }}</span>
        </button>
      </div>
    </div>

    <!-- 이체 완료 알림 모달 -->
    <div v-if="showSuccessModal" class="success-backdrop">
      <div class="success-dialog">
        <div class="success-icon-wrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h4 class="success-title">이체가 완료되었어요!</h4>
        <p class="success-amount">
          <strong>{{ (lastTransferredAmount || 0).toLocaleString() }}원</strong>이 적금 통장에 쏙 들어갔어요.
        </p>
        <button type="button" class="btn-success-confirm" @click="handleSuccessConfirm">
          확인
        </button>
      </div>
    </div>

    <!-- 이체 실패 알림 모달 -->
    <div v-if="showTransferErrorModal" class="custom-modal-backdrop" @click.self="closeTransferErrorModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2.2"/>
            <path d="M12 8v5M12 16h.01" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="modal-title">이체 안내</h4>
        <p class="modal-desc">{{ transferErrorMessage }}</p>
        <button type="button" class="btn-modal-confirm" @click="closeTransferErrorModal">
          확인
        </button>
      </div>
    </div>

    <!-- 승인 대기 신청 취소 확인 모달 -->
    <div v-if="showCancelPendingModal" class="custom-modal-backdrop" @click.self="closeCancelPendingModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="modal-title">가입 신청을 취소할까요?</h4>
        <p class="modal-desc">
          <strong>{{ cancelTargetProduct?.title }}</strong> 신청을 취소하면<br/>
          부모님 승인 대기가 종료돼요.
        </p>
        <p v-if="cancelPendingError" class="modal-error-text">{{ cancelPendingError }}</p>
        <div class="modal-btn-row">
          <button type="button" class="btn-modal-sub" :disabled="isCancellingPending" @click="closeCancelPendingModal">
            돌아가기
          </button>
          <button type="button" class="btn-modal-danger" :disabled="isCancellingPending" @click="handleCancelPendingSubmit">
            {{ isCancellingPending ? '취소 중...' : '신청 취소하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 승인 대기 신청 취소 완료 모달 -->
    <div v-if="showCancelPendingSuccessModal" class="custom-modal-backdrop" @click.self="closeCancelPendingSuccessModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h4 class="modal-title">신청이 취소되었어요</h4>
        <p class="modal-desc">
          가입 신청이 정상적으로 취소되었어요.<br/>
          언제든지 다시 신청할 수 있어요!
        </p>
        <button type="button" class="btn-modal-confirm" @click="closeCancelPendingSuccessModal">
          확인
        </button>
      </div>
    </div>

    <BottomTabBar active="finance" @select="onTabSelect" />

    <Chatbot :hide-for-modal="showDepositSheet || showSuccessModal || showTransferErrorModal || showCancelPendingModal || showCancelPendingSuccessModal || showFilterSheet" hint-text="가입한 상품이 궁금하세요?" />
  </div>
</template>

<style scoped>
.product-screen {
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

/* 상단 네비 — 화면 좌우 끝까지 꽉 차게 */
.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 44px 20px 10px;
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
  font-weight: 700;
  font-size: 18px;
  color: #15171b;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 90px;
  background: #f8fafc;
}
.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb { background: #d8dbdf; }

/* 탭 스위처 — 상단 네비에 이어붙는 흰 영역 */
.tab-switcher {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  background: #ffffff;
  border-bottom: 1.2px solid #e2e8f0;
  padding: 0 16px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 12px 0 11px;
  cursor: pointer;
  position: relative;
  min-height: 43px;
}

.tab-label {
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  color: #8b9097;
  transition: color 0.15s ease;
}

.tab-btn.active .tab-label {
  color: #191b1e;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -1px;
  height: 2.5px;
  background: #ffbc00;
  border-radius: 999px;
}

/* 상단 카운트 및 인라인 필터 버튼 */
.list-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
}

.count-row {
  font-weight: 800;
  font-size: 16px;
  color: #15171b;
  margin: 0;
  white-space: nowrap;
}

.count-num {
  color: #2e7bf0;
  margin-left: 6px;
}

.filter-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1.2px solid #e2e8f0;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  color: #475569;
  max-width: 220px;
  transition: all 0.2s ease;
}
.filter-chip-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.filter-chip-btn.active {
  background: #fffdf2;
  border-color: #ffbc00;
  color: #b45309;
}

.filter-icon {
  flex-shrink: 0;
}

.filter-summary-text {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  flex-shrink: 0;
  color: #727e8e;
}
.filter-chip-btn.active .chevron-icon {
  color: #d97706;
}

.filter-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffbc00;
  color: #15171b;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

/* 필터 바텀시트 */
.sheet-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 105;
  backdrop-filter: blur(2px);
}

.sheet {
  box-sizing: border-box;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 16px 20px 28px;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
}

.sheet-handle-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
}

.sheet-reset-btn {
  border: none;
  background: transparent;
  padding: 4px 6px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #727e8e;
  cursor: pointer;
  transition: color 0.15s;
}
.sheet-reset-btn:hover {
  color: #4d596b;
}

.sheet-group-title {
  margin: 16px 0 10px;
  font-weight: 700;
  font-size: 13px;
  color: #6b7077;
}

.sheet-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.s-chip {
  padding: 8px 16px;
  border: 1px solid #e7e9ec;
  border-radius: 999px;
  background: #ffffff;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  color: #73777e;
  cursor: pointer;
  transition: all 0.15s ease;
}
.s-chip.on {
  background: #fff8e6;
  border-color: #ffbc00;
  color: #d97706;
}

.sheet-apply {
  width: 100%;
  height: 48px;
  margin-top: 24px;
  border: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #191b1e;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s ease;
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.25);
}
.sheet-apply:hover {
  background: #f5b300;
}

.sheet-enter-active, .sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .sheet, .sheet-leave-active .sheet {
  transition: transform 0.25s ease;
}
.sheet-enter-from, .sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet, .sheet-leave-to .sheet {
  transform: translateY(100%);
}

.group-title {
  font-weight: 800;
  font-size: 14px;
  color: #525863;
  text-align: left;
  margin: 0 0 10px;
}
.group-title:not(:first-child) {
  margin-top: 18px;
}

.card {
  border: 1.3px solid #f0f1f3;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: #ffffff;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.prod-title {
  font-weight: 800;
  font-size: 15.5px;
  color: #15171b;
}

.origin-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 10.5px;
  white-space: nowrap;
}

.origin-badge.family {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}

.origin-badge.bank {
  background: #eef4fc;
  color: #3b74b8;
  border: 1px solid #dce8f8;
}

.status-line {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 12.5px;
  color: #6b7077;
}

.status-text {
  font-weight: 800;
}
.status-text.green { color: #ffbc00; }
.status-text.blue  { color: #4d8ad6; }
.status-text.red   { color: #e0554f; }
.status-text.orange { color: #f57c00; }
.status-text.gray  { color: #8b9097; }

.card.pending {
  padding: 14px 16px;
}

.card.completed {
  opacity: 0.65;
  background: #f7f8fa;
}

.pending-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pending-badge {
  flex: none;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef1f4;
  color: #525863;
  font-weight: 700;
  font-size: 11px;
  white-space: nowrap;
}

.type-status-badge {
  flex: none;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef1f4;
  color: #6b7077;
  font-weight: 700;
  font-size: 11px;
  white-space: nowrap;
}
.type-status-badge.green  { color: #b5810a; background: #fff8e6; }
.type-status-badge.blue   { color: #4d8ad6; background: #eef4fc; }
.type-status-badge.red    { color: #e0554f; background: #fdeceb; }
.type-status-badge.orange { color: #f57c00; background: #fff3e0; }
.type-status-badge.gray   { color: #8b9097; background: #f3f4f6; }

.pending-summary {
  margin: 6px 0 0;
  font-weight: 500;
  font-size: 12.5px;
  color: #777b81;
}

/* 납입금액 및 한도 정보 박스 */
.spec-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 9px 12px;
  margin: 8px 0 12px;
  border: 1px solid #f1f5f9;
}

.spec-grid.pending {
  margin-top: 10px;
  margin-bottom: 0;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
}

.spec-label {
  font-weight: 600;
  color: #4d596b;
}

.spec-val {
  font-weight: 700;
  color: #1e293b;
}

.spec-val.highlight {
  color: #15171b;
  font-weight: 800;
}

.date-range {
  margin: 8px 0 10px;
  font-weight: 500;
  font-size: 12px;
  color: #8b9097;
}

.progress-block {
  margin-bottom: 10px;
}

.progress-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: #eef1f4;
  overflow: hidden;
  margin-bottom: 6px;
}
.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
.progress-fill.green { background: #ffbc00; }
.progress-fill.blue  { background: #4d8ad6; }

.progress-label {
  margin: 0;
  font-weight: 700;
  font-size: 12px;
  color: #4a4e55;
}

.info-text {
  margin: 0 0 10px;
  font-weight: 500;
  font-size: 12.5px;
  color: #4a4e55;
  line-height: 1.5;
  white-space: pre-line;
}

.loan-details {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.meta-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f1f3f5;
  color: #4b4f54;
}

.meta-tag.alert {
  background: #fef2f2;
  color: #ef4444;
}

.card-footer {
  display: flex;
  align-items: center;
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px dashed #f0f2f4;
}

.card-footer.between {
  justify-content: space-between;
}

.card-footer.end {
  justify-content: flex-end;
}

.btn-deposit-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.15s ease;
}
.btn-deposit-chip:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.btn-cancel-link {
  background: none;
  border: none;
  padding: 4px 2px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: #777b81;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: #d1d5db;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}
.btn-cancel-link:hover {
  color: #525863;
  text-decoration-color: #525863;
}

.bottomsheet-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 105;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.2s ease-out;
}

.bottomsheet {
  width: 100%;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 20px 20px 28px;
  box-sizing: border-box;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sheet-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sheet-title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 800;
  color: #15171b;
}

.sheet-close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
}

.sheet-balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
}

.balance-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #6b7077;
}

.balance-val {
  font-size: 13.5px;
  font-weight: 700;
  color: #15171b;
}

.amount-input-box {
  display: flex;
  align-items: center;
  background: #f4f6f8;
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 8px;
}
.amount-input-box.error {
  border-color: #e0554f;
  background: #fff8f8;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 20px;
  font-weight: 800;
  color: #15171b;
  outline: none;
  width: 100%;
}
.amount-input::placeholder {
  color: #b0b5bc;
}

.currency {
  font-size: 16px;
  font-weight: 700;
  color: #15171b;
  margin-left: 4px;
}

.btn-clear {
  background: #d8dbdf;
  border: none;
  color: #ffffff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-msg {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #e0554f;
  padding-left: 4px;
}

.quick-amounts {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.quick-btn {
  flex: 1;
  background: #ffffff;
  border: 1.2px solid #e5e8eb;
  border-radius: 8px;
  padding: 7px 0;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #4a4e55;
  cursor: pointer;
  transition: all 0.15s;
}
.quick-btn.full {
  color: #d97706;
  border-color: #fde68a;
  background: #fefce8;
  font-weight: 700;
}
.quick-btn:active {
  background: #f4f6f8;
  border-color: #d1d5db;
}

.btn-sheet-submit {
  width: 100%;
  padding: 13px 0;
  border-radius: 12px;
  background: #ffbc00;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  color: #15171b;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-sheet-submit:disabled {
  background: #e5e8eb;
  color: #777b81;
  cursor: not-allowed;
}

.success-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  animation: fadeIn 0.2s ease-out;
}

.success-dialog {
  width: 100%;
  max-width: 290px;
  background: #ffffff;
  border-radius: 20px;
  padding: 26px 20px 20px;
  text-align: center;
  box-sizing: border-box;
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.success-icon-wrap {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 800;
  color: #15171b;
}

.success-amount {
  margin: 0 0 20px;
  font-size: 13.5px;
  color: #525863;
  line-height: 1.4;
}
.success-amount strong {
  color: #15171b;
  font-weight: 700;
}

.btn-success-confirm {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.btn-success-confirm:active {
  opacity: 0.85;
}

/* 커스텀 안내/에러 모달 */
.custom-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  animation: fadeIn 0.2s ease-out;
}

.custom-modal-dialog {
  width: 100%;
  max-width: 290px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px 20px;
  text-align: center;
  box-sizing: border-box;
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-icon-wrap {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-wrap.warning {
  background: #f59e0b;
}

.modal-icon-wrap.danger {
  background: #ef4444;
}

.modal-icon-wrap.info {
  background: #ffbc00;
}

.modal-error-text {
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 600;
  margin: 0 0 10px;
}

.modal-btn-row {
  display: flex;
  gap: 8px;
}

.btn-modal-sub {
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  background: #f1f5f9;
  color: #4d596b;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-modal-danger {
  flex: 1.3;
  padding: 12px 0;
  border-radius: 12px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-modal-danger:hover {
  background: #fecaca;
}

.pending-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

.pending-info-text {
  margin: 0;
  font-size: 12px;
  color: #4d596b;
  line-height: 1.4;
  flex: 1;
}

.btn-cancel-pending {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #4d596b;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.btn-cancel-pending:hover {
  background: #e2e8f0;
  color: #334155;
  border-color: #727e8e;
}

.modal-title {
  margin: 0 0 6px;
  font-size: 16.5px;
  font-weight: 800;
  color: #15171b;
}

.modal-desc {
  margin: 0 0 18px;
  font-size: 13px;
  color: #525863;
  line-height: 1.5;
  white-space: pre-line;
  word-break: keep-all;
}

.btn-modal-confirm {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-modal-confirm:active {
  opacity: 0.85;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>