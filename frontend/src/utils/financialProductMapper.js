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
