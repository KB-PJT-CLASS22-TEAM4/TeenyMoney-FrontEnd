const CATEGORY_MAP = {
  SAVING: '적금',
  SAVINGS: '적금',
  DEPOSIT: '예금',
  LOAN: '대출',
  적금: '적금',
  예금: '예금',
  대출: '대출',
}

const STATUS_NORMALIZE = {
  PENDING: 'PENDING',
  WAITING: 'PENDING',
  PENDING_APPROVAL: 'PENDING',
  '승인대기': 'PENDING',
  '승인 대기': 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  '승인': 'APPROVED',
  '거절': 'REJECTED',
}

const PENDING_STATUSES = new Set([
  'PENDING',
  'WAITING',
  'PENDING_APPROVAL',
  '승인대기',
  '승인 대기',
])

const COMPLETED_STATUSES = new Set([
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'ACTIVE',
  'CANCELLED',
  '승인',
  '거절',
])

function toCategoryLabel(value) {
  if (!value) return '적금'
  return CATEGORY_MAP[value] || value
}

function formatRate(value) {
  if (value == null || value === '') return '-'
  if (typeof value === 'string' && value.includes('%')) return value
  return `연 ${value}%`
}

function formatDate(value) {
  if (!value) return '-'

  if (Array.isArray(value)) {
    const [year, month, day] = value
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }

  if (typeof value === 'string') {
    return value.slice(0, 10).replace(/-/g, '.')
  }

  return '-'
}

function calcProgress(current, target) {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)))
}

export function normalizeFinancialProduct(item, fallbackCategory = '적금') {
  const category = toCategoryLabel(
    item?.category
      ?? item?.productCategory
      ?? item?.productType
      ?? fallbackCategory
  )

  const accumulatedAmount =
    item?.accumulatedAmount
    ?? item?.balance
    ?? item?.currentAmount
    ?? item?.paidAmount
    ?? 0

  const appliedRate =
    item?.appliedRate
    ?? item?.interestRate
    ?? item?.rate
    ?? item?.expectedRate

  const targetAmount =
    item?.targetAmount
    ?? item?.maturityAmount
    ?? item?.goalAmount
    ?? item?.maxAmount
    ?? 0

  const rawStatus = String(
    item?.status
      ?? item?.statusLabel
      ?? item?.enrollmentStatus
      ?? item?.approvalStatus
      ?? 'ACTIVE'
  )

  const status = (
    STATUS_NORMALIZE[rawStatus]
    ?? STATUS_NORMALIZE[rawStatus.toUpperCase()]
    ?? rawStatus.toUpperCase()
  )

  return {
    id: item?.enrollmentId ?? item?.id,
    enrollmentId: item?.enrollmentId ?? item?.id,
    category,
    title:
      item?.productName
      ?? item?.name
      ?? item?.title
      ?? '금융 상품',
    description:
      item?.description
      ?? item?.productDescription
      ?? '',
    rateText: formatRate(appliedRate),
    monthlyAmount:
      item?.monthlyPaymentAmount
      ?? item?.monthlyAmount
      ?? item?.monthlyPayment
      ?? item?.monthlyDepositAmount
      ?? 0,
    periodMonths:
      item?.termMonths
      ?? item?.periodMonths
      ?? item?.period
      ?? 0,
    paymentCount: item?.paidCount ?? item?.paymentCount ?? 0,
    totalPayments: item?.totalPaymentCount ?? item?.totalPayments ?? 0,
    accumulatedAmount,
    targetAmount,
    progress: item?.progressPercent ?? calcProgress(accumulatedAmount, targetAmount),
    maturityDate: formatDate(
      item?.maturityDate
        ?? item?.endDate
        ?? item?.expiresAt
    ),
    status,
    statusLabel: item?.statusLabel ?? status,
    isPending: PENDING_STATUSES.has(status) || PENDING_STATUSES.has(item?.statusLabel),
    isCompleted: COMPLETED_STATUSES.has(status),
  }
}

export function extractFinancialProductList(payload) {
  if (!payload) return []

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.enrollments)) return payload.enrollments
  if (Array.isArray(payload.products)) return payload.products
  if (Array.isArray(payload.data)) return payload.data

  return []
}

export async function fetchAllChildFinancialProducts(accessToken, childId, api) {
  const merged = []

  try {
    const allRes = await api.getChildFinancialProducts(accessToken, childId)
    const allItems = extractFinancialProductList(allRes.data)
    if (allItems.length) {
      return allItems.map((item) => normalizeFinancialProduct(item))
    }
  } catch {
    // fallback to category APIs
  }

  const requests = [
    api.getChildSavingProducts(accessToken, childId).then((res) => ({
      items: extractFinancialProductList(res.data),
      category: '적금',
    })),
    api.getChildDepositProducts(accessToken, childId).then((res) => ({
      items: extractFinancialProductList(res.data),
      category: '예금',
    })),
    api.getChildLoanProducts(accessToken, childId).then((res) => ({
      items: extractFinancialProductList(res.data),
      category: '대출',
    })),
  ]

  const results = await Promise.allSettled(requests)

  results.forEach((result) => {
    if (result.status !== 'fulfilled') return

    result.value.items.forEach((item) => {
      merged.push(
        normalizeFinancialProduct(item, result.value.category)
      )
    })
  })

  return merged
}

export function extractApprovalRequestList(payload) {
  return extractFinancialProductList(payload)
}

function normalizeApprovalStatus(rawStatus) {
  const raw = String(rawStatus ?? 'PENDING')

  return (
    STATUS_NORMALIZE[raw]
    ?? STATUS_NORMALIZE[raw.toUpperCase()]
    ?? raw.toUpperCase()
  )
}

export function normalizeApprovalRequest(item) {
  const productType = item?.productType ?? 'SAVING'
  const category = toCategoryLabel(productType)
  const status = normalizeApprovalStatus(item?.status)

  return {
    enrollmentId: item?.enrollmentId ?? item?.id,
    productType,
    category,
    title: item?.productName ?? '금융 상품',
    childId: item?.childId,
    childName: item?.childName ?? '자녀',
    requestedAmount: item?.requestedAmount ?? 0,
    monthlyAmount: item?.requestedAmount ?? 0,
    termMonths: item?.termMonths ?? 0,
    expectedAppliedRate: item?.expectedAppliedRate,
    rateText: formatRate(item?.expectedAppliedRate),
    requestedAt: item?.requestedAt,
    autoTransfer: item?.autoTransfer ?? false,
    interestCalculationType: item?.interestCalculationType,
    earlyTerminationRate: item?.earlyTerminationRate,
    lateFeeRate: item?.lateFeeRate,
    paymentDay: item?.paymentDay,
    repaymentType: item?.repaymentType,
    savingsType: item?.savingsType,
    productId: item?.productId,
    status,
    statusLabel:
      status === 'PENDING'
        ? '승인 대기'
        : status === 'APPROVED'
          ? '승인'
          : status === 'REJECTED'
            ? '거절'
            : status,
    isPending: PENDING_STATUSES.has(status),
    isCompleted: status === 'APPROVED' || status === 'REJECTED',
  }
}

export async function fetchChildApprovalRequests(accessToken, childId, api) {
  const res = await api.getFinancialProductApprovalRequests(accessToken)
  const items = extractApprovalRequestList(res.data)

  return items
    .filter((item) => Number(item?.childId) === Number(childId))
    .map((item) => normalizeApprovalRequest(item))
}
