<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getFinancialProducts, getMyEnrolledFinancialProducts } from '@/api/finance'
import { getTeenyScore } from '@/api/teenyScore'
import { getFinanceTerm } from '@/constants/financeTerms'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import FinanceTermModal from '@/components/Child/FinanceTermModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// 탭: 신규 상품 / 나의 상품
const activeTab = ref('신규 상품')
const tabs = ['신규 상품', '나의 상품']

watch(activeTab, (val) => {
  if (val === '나의 상품') {
    router.push({ name: 'child-finance-myproducts' })
  }
})

// 필터 옵션 목록
const categories = ['전체', '적금', '예금', '대출']
const interestTypeOptions = ['전체', '단리', '복리']
const originOptions = ['전체', '가족 상품', '금융기관']
const sortOptions = ['기본순', '금리 높은순', '기간 짧은순', '기간 긴순']

const STORAGE_KEY = 'teeny_finance_filter_state'

function loadSavedFilter() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('필터 복원 실패:', e)
  }
  return null
}

const saved = loadSavedFilter()

// 적용된 필터 상태 (이전 저장값 유지)
const appliedCategory = ref(saved?.category || '전체')
const appliedInterestType = ref(saved?.interestType || '전체')
const appliedOrigin = ref(saved?.origin || '전체')
const appliedSort = ref(saved?.sort || '기본순')

function saveFilterState() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        category: appliedCategory.value,
        interestType: appliedInterestType.value,
        origin: appliedOrigin.value,
        sort: appliedSort.value,
      })
    )
  } catch (e) {
    console.warn('필터 저장 실패:', e)
  }
}

// 바텀시트 모달 상태
const showFilterSheet = ref(false)
const tempCategory = ref('전체')
const tempInterestType = ref('전체')
const tempOrigin = ref('전체')
const tempSort = ref('기본순')

function openFilterSheet() {
  tempCategory.value = appliedCategory.value
  tempInterestType.value = appliedInterestType.value
  tempOrigin.value = appliedOrigin.value
  tempSort.value = appliedSort.value
  showFilterSheet.value = true
}

function closeFilterSheet() {
  showFilterSheet.value = false
}

function applyFilter() {
  appliedCategory.value = tempCategory.value
  appliedInterestType.value = tempInterestType.value
  appliedOrigin.value = tempOrigin.value
  appliedSort.value = tempSort.value
  saveFilterState()
  showFilterSheet.value = false
}

function resetFilter() {
  tempCategory.value = '전체'
  tempInterestType.value = '전체'
  tempOrigin.value = '전체'
  tempSort.value = '기본순'
}

// 필터 적용 개수 (기본값 아닌 것)
const activeFilterCount = computed(() => {
  let count = 0
  if (appliedCategory.value !== '전체') count++
  if (appliedInterestType.value !== '전체') count++
  if (appliedOrigin.value !== '전체') count++
  if (appliedSort.value !== '기본순') count++
  return count
})

const filterSummaryText = computed(() => {
  const parts = []
  if (appliedCategory.value !== '전체') parts.push(appliedCategory.value)
  if (appliedInterestType.value !== '전체') parts.push(appliedInterestType.value)
  if (appliedOrigin.value !== '전체') parts.push(appliedOrigin.value)
  if (appliedSort.value !== '기본순') parts.push(appliedSort.value)
  return parts.length > 0 ? parts.join(' · ') : '전체 필터'
})

// 상품 타입 매핑
const typeMap = { DEPOSIT: '예금', SAVING: '적금', LOAN: '대출' }
const badgeColorMap = { DEPOSIT: 'blue', SAVING: 'blue', LOAN: 'orange' }

// 등급명 → 색상 매핑
const gradeColorMap = {
  새싹: 'red',
  스타터: 'orange',
  플러스: 'yellow',
  프로: 'green',
  마스터: 'blue',
}

// 엑셀 정책 기준: 등급별 예·적금 우대금리 (%p)
const GRADE_BONUS_MAP = {
  마스터: 5.0,
  프로: 3.0,
  플러스: 2.0,
  스타터: 1.0,
  새싹: 0.0,
}

// 엑셀 정책 기준: 등급별 대출 적용금리 (%)
const GRADE_LOAN_MAP = {
  마스터: 2.0,
  프로: 3.5,
  플러스: 5.0,
  스타터: 7.0,
  새싹: null,
}

// 이자 계산 방식, 적금 적립 방식 매핑
const interestTypeMap = {
  SIMPLE: '단리',
  COMPOUND: '복리',
}
const savingsTypeMap = {
  FREE: '자유적금',
  FIXED: '정액적금',
}
const repaymentTypeMap = {
  EQUAL_PRINCIPAL_INTEREST: '원리금균등',
  EQUAL_PRINCIPAL: '원금균등',
  BULLET: '만기일시상환',
}

// 내 티니 등급 및 점수
const myGrade = ref('')
const myScore = ref(0)

// 부모 생성 상품 vs 실제 금융기관 상품 판별 유틸
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

// API 데이터 → 기존 구조 변환 (연 1.5% ~ 4% (스타터 2.5% 적용) 형식 생성)
function mapProduct(p) {
  const terms = p.availableTerms ?? []
  const periodValue =
    terms.length === 1
      ? `${terms[0]}개월`
      : terms.length > 1
        ? `${Math.min(...terms)}~${Math.max(...terms)}개월`
        : '-'

  const isLoan = p.productType === 'LOAN'
  const isSaving = p.productType === 'SAVING'
  const ratesList = p.rates || []

  // 기본금리
  const baseRate = p.baseRate ?? (ratesList.length ? Math.min(...ratesList.map((r) => r.baseRate ?? 0)) : 0)

  let rangeText = ''
  let finalAppliedRateNum = null
  let combinedRateText = ''

  if (isLoan) {
    // 1) 대출: 연 2.0% ~ 7.0%
    if (ratesList.length > 0) {
      const allLoanRates = ratesList.map((r) => r.expectedAppliedRate ?? r.appliedRate ?? r.baseRate ?? 0)
      const minL = Math.min(...allLoanRates)
      const maxL = Math.max(...allLoanRates)
      rangeText = minL === maxL ? `연 ${minL}%` : `연 ${minL}% ~ ${maxL}%`

      if (myGrade.value) {
        const matched = ratesList.find((r) => r.gradeName === myGrade.value)
        if (matched) {
          finalAppliedRateNum = matched.expectedAppliedRate ?? matched.appliedRate
        }
      }
    } else {
      rangeText = '연 2.0% ~ 7.0%'
      if (myGrade.value && GRADE_LOAN_MAP[myGrade.value] !== undefined) {
        finalAppliedRateNum = GRADE_LOAN_MAP[myGrade.value]
      }
    }

    if (finalAppliedRateNum != null) {
      combinedRateText = `${rangeText} (${myGrade.value} ${finalAppliedRateNum}%)`
    } else {
      combinedRateText = p.eligible ? rangeText : '대출 불가 (새싹 등급)'
    }
  } else {
    // 2) 예·적금: 기본금리 ~ (기본금리 + 5.0%p)
    const maxBonusRate = ratesList.length
      ? Math.max(...ratesList.map((r) => r.preferentialRate ?? (r.expectedAppliedRate ? r.expectedAppliedRate - baseRate : 0)))
      : (GRADE_BONUS_MAP['마스터'] ?? 5.0)

    const maxRate = Number((baseRate + maxBonusRate).toFixed(2))
    rangeText = maxRate > baseRate ? `연 ${baseRate}% ~ ${maxRate}%` : `연 ${baseRate}%`

    // 내 등급의 우대금리 및 적용금리 계산
    if (ratesList.length > 0 && myGrade.value) {
      const matched = ratesList.find((r) => r.gradeName === myGrade.value)
      if (matched) {
        finalAppliedRateNum = matched.expectedAppliedRate ?? matched.appliedRate
      }
    }

    if (finalAppliedRateNum == null && myGrade.value) {
      const bonus = GRADE_BONUS_MAP[myGrade.value] ?? 0
      finalAppliedRateNum = Number((baseRate + bonus).toFixed(2))
    }

    if (finalAppliedRateNum != null) {
      combinedRateText = `${rangeText} (${myGrade.value || '내 등급'} ${finalAppliedRateNum}%)`
    } else {
      combinedRateText = rangeText
    }
  }

  const limitLabel =
    isLoan ? '대출한도' : p.productType === 'DEPOSIT' ? '예치한도' : '납입한도'
  const limitValue = p.maximumAmount ? `${p.maximumAmount.toLocaleString()}원` : '-'

  const scoreValue = p.requiredGradeName
    ? `${p.requiredGradeName} 등급 이상`
    : isLoan
      ? '제한 없음'
      : null
  const scoreColor = p.requiredGradeName
    ? gradeColorMap[p.requiredGradeName] ?? 'blue'
    : ''

  const details = [
    { label: '기간', value: periodValue, color: '' },
    { label: limitLabel, value: limitValue, color: '' },
    { label: '금리', value: combinedRateText, color: 'blue' },
  ]

  if (!isLoan && interestTypeMap[p.interestCalculationType]) {
    details.push({
      label: '이자방식',
      value: interestTypeMap[p.interestCalculationType],
      color: '',
    })
  }

  if (isSaving && savingsTypeMap[p.savingsType]) {
    details.push({
      label: '적립방식',
      value: savingsTypeMap[p.savingsType],
      color: '',
    })
  }

  if (isLoan) {
    const repDesc = repaymentTypeMap[p.repaymentType] || '원리금균등'
    details.push({
      label: '상환방식',
      value: repDesc,
      color: '',
    })
  }

  if (scoreValue) {
    details.push({ label: '티니점수 조건', value: scoreValue, color: scoreColor })
  }

  const origin = resolveProductOrigin(p)

  return {
    id: `${p.productType}-${p.productId}`,
    productId: p.productId,
    productType: p.productType,
    availableTerms: terms,
    category: typeMap[p.productType] ?? p.productType,
    badgeColor: badgeColorMap[p.productType] ?? 'blue',
    originType: origin.type,
    originLabel: origin.label,
    title: p.productName,
    liked: false,
    eligible: p.eligible,
    ineligibleReason: p.ineligibleReason,
    locked: isLoan ? !p.eligible : p.eligible === false,
    requiredGradeName: p.requiredGradeName,
    gradeColor: scoreColor,
    interestType: interestTypeMap[p.interestCalculationType] || (isLoan ? '단리' : ''),
    rates: ratesList,
    baseRate,
    finalAppliedRateNum,
    rangeText,
    combinedRateText,
    details,
  }
}

function normalizeProductType(type) {
  if (!type) return ''
  const upper = String(type).toUpperCase()
  if (upper === 'SAVING' || upper === 'SAVINGS') return 'SAVING'
  if (upper === 'DEPOSIT' || upper === 'DEPOSITS') return 'DEPOSIT'
  if (upper === 'LOAN' || upper === 'LOANS') return 'LOAN'
  return upper
}

// [API] 금융상품 목록 및 티니점수 조회
const products = ref([])

onMounted(async () => {
  try {
    // 1. 내 티니점수/등급 조회
    if (authStore.memberId) {
      try {
        const scoreRes = await getTeenyScore(authStore.accessToken, authStore.memberId)
        const scoreData = scoreRes?.data ?? scoreRes
        myGrade.value = scoreData?.gradeName ?? '스타터'
        myScore.value = scoreData?.teenyScore ?? 600
      } catch (err) {
        console.warn('티니점수 조회 실패:', err)
        myGrade.value = '스타터'
      }
    }

    // 2. 금융상품 목록 및 내 가입 상품 병렬 조회
    const [data, enrolledData] = await Promise.all([
      getFinancialProducts(authStore.accessToken),
      getMyEnrolledFinancialProducts(authStore.accessToken).catch(() => []),
    ])

    // 활성 가입 상품 맵 (카테고리-상품ID 복합키로만 정확하게 매핑)
    const enrolledMap = new Map()
    ;(enrolledData || []).forEach((item) => {
      const isTerminated = (
        item.terminated === true ||
        item.status === 'TERMINATED' ||
        item.status === 'CANCELLED' ||
        item.status === 'CANCELED' ||
        item.status === 'CLOSED' ||
        item.status === 'REPAID'
      )
      if (!isTerminated && item.productId) {
        const key = `${normalizeProductType(item.productType)}-${item.productId}`
        enrolledMap.set(key, item.status)
      }
    })

    const mapped = (data || []).map((p) => {
      const prod = mapProduct(p)
      const lookupKey = `${normalizeProductType(prod.productType || prod.category)}-${prod.productId}`
      const enrolledStatus = enrolledMap.get(lookupKey)
      if (enrolledStatus) {
        prod.isEnrolled = true
        prod.enrolledStatus = enrolledStatus
      }
      return prod
    })

    const seen = new Set()
    products.value = mapped.filter((p) => {
      if (seen.has(p.id)) {
        console.warn('중복 상품 데이터 감지, 제외됨:', p.id)
        return false
      }
      seen.add(p.id)
      return true
    })
  } catch (e) {
    console.error('금융상품 조회 실패:', e.message)
  }

  await nextTick()
  await precomputeProductListMinHeight()
})

// 필터 + 정렬 로직
const filteredProducts = computed(() => {
  let list = [...products.value]

  // 1. 카테고리 필터
  if (appliedCategory.value !== '전체') {
    list = list.filter((p) => p.category === appliedCategory.value)
  }

  // 2. 이자방식 필터 (단리 / 복리)
  if (appliedInterestType.value !== '전체') {
    list = list.filter((p) => p.interestType === appliedInterestType.value)
  }

  // 3. 출처 필터 (가족 / 금융기관)
  if (appliedOrigin.value === '가족 상품') {
    list = list.filter((p) => p.originType === 'family')
  } else if (appliedOrigin.value === '금융기관') {
    list = list.filter((p) => p.originType === 'bank')
  }

  // 4. 정렬
  if (appliedSort.value === '금리 높은순') {
    list.sort((a, b) => {
      const rateA = a.finalAppliedRateNum ?? a.baseRate ?? 0
      const rateB = b.finalAppliedRateNum ?? b.baseRate ?? 0
      return rateB - rateA
    })
  } else if (appliedSort.value === '기간 짧은순') {
    list.sort((a, b) => {
      const minA = a.availableTerms?.length ? Math.min(...a.availableTerms) : 99
      const minB = b.availableTerms?.length ? Math.min(...b.availableTerms) : 99
      return minA - minB
    })
  } else if (appliedSort.value === '기간 긴순') {
    list.sort((a, b) => {
      const maxA = a.availableTerms?.length ? Math.max(...a.availableTerms) : 0
      const maxB = b.availableTerms?.length ? Math.max(...b.availableTerms) : 0
      return maxB - maxA
    })
  } else {
    // 기본순: 찜 우선
    list.sort((a, b) => Number(b.liked) - Number(a.liked))
  }

  return list
})

// 상품 카드 페이지네이션 — 1~3페이지는 11개씩, 4페이지부터는 10개씩.
function productPageSize(pageNum) {
  return pageNum <= 3 ? 11 : 10
}

const productPage = ref(1)
const totalProductPages = computed(() => {
  const total = filteredProducts.value.length
  let page = 1
  let count = 0
  while (count < total) {
    count += productPageSize(page)
    page += 1
  }
  return Math.max(1, page - 1)
})
const visibleProducts = computed(() => {
  let start = 0
  for (let p = 1; p < productPage.value; p += 1) {
    start += productPageSize(p)
  }
  const size = productPageSize(productPage.value)
  return filteredProducts.value.slice(start, start + size)
})
// 페이지 번호는 6개씩 묶어서 보여준다 — 6페이지에서 다음(>)을 누르면 7페이지로 넘어가면서
// 번호 목록도 7~12로 넘어간다.
const PAGE_NUMBER_WINDOW = 6
const productPageNumbers = computed(() => {
  const windowStart = Math.floor((productPage.value - 1) / PAGE_NUMBER_WINDOW) * PAGE_NUMBER_WINDOW + 1
  const windowEnd = Math.min(windowStart + PAGE_NUMBER_WINDOW - 1, totalProductPages.value)
  return Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i)
})
const scrollEl = ref(null)
const productListEl = ref(null)
// 페이지마다 상품 카드 내용(약관 상세 줄 수 등)이 달라 목록 높이가 들쭉날쭉하다.
// 짧은 페이지로 가면 스크롤 가능 범위가 줄어 scrollTop이 클램프되며 튀고, 반대로
// 아직 안 가본 더 긴 페이지로 처음 갈 때는 그 자리에서 목록이 갑자기 길어지며
// 페이지네이션 위치가 아래로 밀린다. 그래서 실제로 페이지를 눌러보기 전에 모든
// 페이지를 한 번씩 미리 돌며 가장 큰 높이를 재서 최소 높이로 고정해둔다.
const productListMinHeight = ref(0)
const isMeasuringPages = ref(false)

function growProductListMinHeight() {
  const h = productListEl.value?.offsetHeight ?? 0
  if (h > productListMinHeight.value) {
    productListMinHeight.value = h
  }
}

async function precomputeProductListMinHeight() {
  const originalPage = productPage.value
  const pages = totalProductPages.value

  isMeasuringPages.value = true
  for (let p = 1; p <= pages; p++) {
    productPage.value = p
    await nextTick()
    growProductListMinHeight()
  }
  productPage.value = originalPage
  await nextTick()
  isMeasuringPages.value = false
}

// 페이지 버튼을 눌러도 지금 보고 있던 스크롤 위치 그대로 고정한다.
// - 클릭한 버튼에 포커스가 남아있으면 모바일 브라우저가 그 버튼을 다시 화면에 보이도록
//   스크롤을 옮기는 경우가 있어서 먼저 포커스를 뗀다.
// - 페이지를 바꾸기 전에 지금 높이를 최소 높이로 고정해서, 다음 페이지가 더 짧아도
//   목록이 줄어들지 않게 한다.
async function keepScrollPosition(change) {
  const el = scrollEl.value
  const top = el?.scrollTop ?? 0

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  growProductListMinHeight()
  change()
  await nextTick()
  growProductListMinHeight()
  if (el) el.scrollTop = top

  let frames = 0
  const restore = () => {
    if (el) el.scrollTop = top
    frames += 1
    if (frames < 5) requestAnimationFrame(restore)
  }
  requestAnimationFrame(restore)
}

function goProductPage(delta) {
  keepScrollPosition(() => {
    productPage.value = Math.min(
      totalProductPages.value,
      Math.max(1, productPage.value + delta)
    )
  })
}
function goToProductPage(page) {
  keepScrollPosition(() => {
    productPage.value = page
  })
}
// 필터·정렬이 바뀌면 1페이지로 돌아간다 (찜 토글 같은 재정렬은 제외).
// 필터링된 상품 구성 자체가 바뀌므로 페이지별 최소 높이도 다시 잰다.
watch([appliedCategory, appliedInterestType, appliedOrigin, appliedSort], async () => {
  productPage.value = 1
  productListMinHeight.value = 0
  await nextTick()
  await precomputeProductListMinHeight()
})

// 찜 토글
function toggleLike(product) {
  product.liked = !product.liked
}

function goBack() {
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

// 자격 미달 커스텀 모달 상태
const showIneligibleModal = ref(false)
const ineligibleMessage = ref('')

function openIneligibleModal(msg) {
  ineligibleMessage.value = msg || '아직은 가입할 수 없는 상품이에요!\n티니점수를 올려서 등급을 달성해 보세요.'
  showIneligibleModal.value = true
}

function closeIneligibleModal() {
  showIneligibleModal.value = false
}

// 어려운 금융 용어 설명 모달 상태
const showTermModal = ref(false)
const activeTermData = ref(null)

function openTermModal(termName) {
  const data = getFinanceTerm(termName)
  if (data) {
    activeTermData.value = data
    showTermModal.value = true
  }
}

function closeTermModal() {
  showTermModal.value = false
  activeTermData.value = null
}

function hasValueHelp(val) {
  if (!val) return false
  return !!getFinanceTerm(val)
}

function hasTermHelp(label, val) {
  if (label === '티니점수 조건' || label === '이자방식' || label === '적립방식' || label === '상환방식') {
    return !hasValueHelp(val)
  }
  return false
}

function openTermModalByText(label, val) {
  if (val && getFinanceTerm(val)) {
    openTermModal(val)
  } else if (label && getFinanceTerm(label)) {
    openTermModal(label)
  }
}

// 이미 가입된 상품 안내 모달 상태
const showAlreadyEnrolledModal = ref(false)
const alreadyEnrolledProduct = ref(null)

function openAlreadyEnrolledModal(product) {
  alreadyEnrolledProduct.value = product
  showAlreadyEnrolledModal.value = true
}

function closeAlreadyEnrolledModal() {
  showAlreadyEnrolledModal.value = false
}

function goToMyProductsTab() {
  showAlreadyEnrolledModal.value = false
  router.push({ name: 'child-finance-myproducts' })
}

function goToApply(product) {
  if (product.isEnrolled) {
    openAlreadyEnrolledModal(product)
    return
  }

  if (product.productType === 'LOAN' ? !product.eligible : product.eligible === false) {
    openIneligibleModal(
      product.requiredGradeName
        ? `${product.requiredGradeName} 등급 이상부터 가입할 수 있는 상품이에요!\n티니점수를 더 모아보세요.`
        : '아직은 가입할 수 없는 상품이에요!\n티니점수를 올려서 등급을 달성해 보세요.'
    )
    return
  }

  const detail = (label) => product.details.find((d) => d.label === label)

  router.push({
    name: 'child-finance-join',
    query: {
      productId: product.productId,
      category: product.category,
      title: product.title,
      originType: product.originType,
      originLabel: product.originLabel,
      rate: product.combinedRateText || product.rangeText,
      myAppliedRate: product.finalAppliedRateNum,
      periodInfo: detail('기간')?.value ?? '',
      limit:
        detail('납입한도')?.value ||
        detail('예치한도')?.value ||
        detail('대출한도')?.value ||
        '',
      scoreReq: detail('티니점수 조건')?.value ?? '',
      scoreColor: detail('티니점수 조건')?.color ?? 'green',
      interestType: detail('이자방식')?.value ?? '',
      savingsType: detail('적립방식')?.value ?? '',
      terms: product.availableTerms.join(','),
      rates: JSON.stringify(product.rates || []),
    },
  })
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

    <div ref="scrollEl" class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- 은행 상품 모티브 안내 배너 -->
      <div class="bank-disclaimer-banner">
        <div class="banner-icon-wrap">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3l9-7z" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="banner-text">
          은행 상품은 실제 은행과 연결되지 않아요. 실제 금융기관의 금리·이자 방식을 참고해 만든 청소년 금융 체험용입니다.
        </p>
      </div>

      <!-- 상단 카운트 및 인라인 필터 버튼 -->
      <div class="list-header-row">
        <p class="count-row">상품<span class="count-num">{{ filteredProducts.length }}</span></p>

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

      <!-- 상품 카드 리스트 -->
      <div
        ref="productListEl"
        :style="{
          minHeight: productListMinHeight ? productListMinHeight + 'px' : undefined,
          visibility: isMeasuringPages ? 'hidden' : undefined,
        }"
      >
        <div
          v-for="product in visibleProducts"
          :key="product.id"
          class="card"
          :class="{
            liked: product.liked,
            disabled: product.eligible === false && !product.locked,
            locked: product.locked,
            'family-origin': product.originType === 'family',
          }"
          @click="goToApply(product)"
          style="cursor: pointer;"
        >
          <div class="card-content" :class="{ 'is-blurred': product.locked }">
            <div class="card-top">
              <div class="card-info">
                <div class="title-row">
                  <span class="badge" :class="product.badgeColor">{{ product.category }}</span>
                  <span class="prod-title">{{ product.title }}</span>
                  <!-- 가족 상품 / 은행 출처 배지 -->
                  <span class="origin-badge" :class="product.originType">
                    {{ product.originLabel }}
                  </span>
                  <!-- 이미 가입하여 이용 중/승인대기 배지 -->
                  <span v-if="product.isEnrolled" class="enrolled-badge" :class="product.enrolledStatus === 'PENDING' ? 'pending' : 'active'">
                    {{ product.enrolledStatus === 'PENDING' ? '승인 대기 중' : '이용 중' }}
                  </span>
                </div>
              </div>
              <button class="star-btn" @click.stop="toggleLike(product)" aria-label="찜하기">
                <svg
                  class="star"
                  :class="{ on: product.liked }"
                  viewBox="0 0 24 24"
                  :fill="product.liked ? '#ffbc00' : 'none'"
                >
                  <path
                    d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"
                    :stroke="product.liked ? '#ffbc00' : '#c6cbd2'"
                    stroke-width="1.6"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="divider"></div>

            <div class="details">
              <div v-for="(d, i) in product.details" :key="i" class="detail-row">
                <span class="d-label">
                  {{ d.label }}
                  <button
                    v-if="hasTermHelp(d.label, d.value)"
                    type="button"
                    class="btn-help-inline"
                    @click.stop="openTermModalByText(d.label, d.value)"
                    aria-label="도움말 보기"
                  >?</button>
                </span>
                <span class="d-value" :class="d.color">
                  {{ d.value }}
                  <button
                    v-if="hasValueHelp(d.value)"
                    type="button"
                    class="btn-help-inline"
                    @click.stop="openTermModal(d.value)"
                    aria-label="도움말 보기"
                  >?</button>
                </span>
              </div>
            </div>
          </div>

          <!-- 티니점수 미달 잠금 오버레이 -->
          <div v-if="product.locked" class="lock-hint">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none">
              <rect x="4" y="10.5" width="16" height="10.5" rx="3.5" fill="#ffffff"/>
              <rect x="4" y="10.5" width="16" height="10.5" rx="3.5" stroke="#8b9097" stroke-width="1.8"/>
              <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="#8b9097" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="12" cy="15.5" r="1.5" fill="#8b9097"/>
            </svg>
            <span class="lock-hint-text" :class="product.gradeColor">
              {{ product.requiredGradeName ? `${product.requiredGradeName} 등급이면 열려요` : '티니점수를 모으면 열려요' }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="pagination-row"
        v-if="totalProductPages > 1"
        :style="{ visibility: isMeasuringPages ? 'hidden' : undefined }"
      >
        <button
          type="button"
          class="page-nav-btn"
          :disabled="productPage === 1"
          @click="goProductPage(-1)"
          aria-label="이전 페이지"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <div class="page-number-row">
          <button
            v-for="n in productPageNumbers"
            :key="n"
            type="button"
            class="page-number-btn"
            :class="{ active: n === productPage }"
            @click="goToProductPage(n)"
          >
            {{ n }}
          </button>
        </div>
        <button
          type="button"
          class="page-nav-btn"
          :disabled="productPage === totalProductPages"
          @click="goProductPage(1)"
          aria-label="다음 페이지"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="finance" @select="onTabSelect" />

    <Chatbot
      :hide-for-modal="showFilterSheet || showIneligibleModal || showTermModal || showAlreadyEnrolledModal"
      hint-text="금리가 어떻게 계산되는지 궁금하세요?"
    />

    <!-- 신규 상품 필터 바텀시트 -->
    <transition name="sheet">
      <div v-if="showFilterSheet" class="sheet-dim" @click.self="closeFilterSheet">
        <div class="sheet">
          <div class="sheet-handle-wrap"><div class="sheet-handle"></div></div>

          <div class="sheet-header">
            <h3 class="sheet-title">상품 필터 및 정렬</h3>
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

          <!-- 2. 이자 방식 -->
          <p class="sheet-group-title">이자 방식</p>
          <div class="sheet-chips">
            <button
              v-for="it in interestTypeOptions"
              :key="it"
              type="button"
              class="s-chip"
              :class="{ on: it === tempInterestType }"
              @click="tempInterestType = it"
            >{{ it }}</button>
          </div>

          <!-- 3. 상품 출처 -->
          <p class="sheet-group-title">상품 출처</p>
          <div class="sheet-chips">
            <button
              v-for="o in originOptions"
              :key="o"
              type="button"
              class="s-chip"
              :class="{ on: o === tempOrigin }"
              @click="tempOrigin = o"
            >{{ o }}</button>
          </div>

          <!-- 4. 정렬 기준 -->
          <p class="sheet-group-title">정렬</p>
          <div class="sheet-chips">
            <button
              v-for="s in sortOptions"
              :key="s"
              type="button"
              class="s-chip"
              :class="{ on: s === tempSort }"
              @click="tempSort = s"
            >{{ s }}</button>
          </div>

          <button class="sheet-apply" type="button" @click="applyFilter">적용하기</button>
        </div>
      </div>
    </transition>

    <!-- 자격 미달 커스텀 알림 모달 -->
    <div v-if="showIneligibleModal" class="custom-modal-backdrop" @click.self="closeIneligibleModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2.2"/>
            <path d="M12 8v5M12 16h.01" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="modal-title">가입 조건 안내</h4>
        <p class="modal-desc">{{ ineligibleMessage }}</p>
        <button type="button" class="btn-modal-confirm" @click="closeIneligibleModal">
          확인
        </button>
      </div>
    </div>

    <!-- 이미 가입된 상품 안내 모달 -->
    <div v-if="showAlreadyEnrolledModal" class="custom-modal-backdrop" @click.self="closeAlreadyEnrolledModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2.2"/>
            <path d="M12 8v5M12 16h.01" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="modal-title">이미 신청/가입한 상품이에요</h4>
        <p class="modal-desc">
          현재 <strong>{{ alreadyEnrolledProduct?.enrolledStatus === 'PENDING' ? '부모님 승인 대기' : '이용' }} 중</strong>인 금융상품이에요.<br>
          '나의 상품' 탭에서 진행 현황을 확인해 보세요!
        </p>
        <div class="modal-btn-row">
          <button type="button" class="btn-modal-sub" @click="closeAlreadyEnrolledModal">
            닫기
          </button>
          <button type="button" class="btn-modal-main" @click="goToMyProductsTab">
            나의 상품 보기
          </button>
        </div>
      </div>
    </div>

    <!-- 금융 용어 사전 도움말 모달 -->
    <FinanceTermModal
      :show="showTermModal"
      :term-data="activeTermData"
      @close="closeTermModal"
    />
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

/* 스크롤 영역 */
.scroll {
  flex: 1;
  overflow-y: auto;
  overflow-anchor: none;
  padding: 16px 20px 90px;
  background: #f8fafc;
}
.scroll::-webkit-scrollbar {
  width: 3px;
}
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb {
  background: #d8dbdf;
}

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

/* 은행 상품 모티브 안내 배너 */
.bank-disclaimer-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  margin-bottom: 14px;
}

.banner-icon-wrap {
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.45;
  color: #3b82f6;
  word-break: keep-all;
}

.banner-text strong {
  color: #1d4ed8;
  font-weight: 700;
}

/* 상품 목록 페이지네이션 */
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 12px;
  margin-bottom: 40px;
}
.page-nav-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #15171b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}
.page-nav-btn:hover:not(:disabled) { background: #f8f9fa; }
.page-nav-btn:disabled { color: #989ca2; cursor: not-allowed; opacity: 0.5; }
.page-number-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.page-number-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6b7077;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.page-number-btn:hover { background: #f8f9fa; }
.page-number-btn.active {
  background: #ffbc00;
  color: #392b00;
  font-weight: 800;
}

/* 목록 상단 헤더 (카운트 + 인라인 필터 버튼) */
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

/* 커스텀 안내 모달 */
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

.modal-icon-wrap.info {
  background: #3b82f6;
}

.modal-icon-wrap.danger {
  background: #ef4444;
}

.btn-help-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  margin-left: 4px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #4d596b;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  vertical-align: middle;
  padding: 0;
  line-height: 1;
  transition: all 0.15s ease;
}

.btn-help-inline:hover {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #15171b;
  transform: scale(1.18);
}

.enrolled-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: -0.2px;
}

.enrolled-badge.active {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.enrolled-badge.pending {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
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

.btn-modal-main {
  flex: 1.5;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
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

@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
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

/* 상품 카드 */
.card {
  position: relative;
  background: #ffffff;
  border: 1.3px solid #eaedf1;
  border-radius: 14px;
  padding: 17px;
  margin-bottom: 14px;
  transition: border-color 0.3s, background 0.3s;
}

.card.liked {
  border-color: #ffe08a;
}

.card.disabled {
  opacity: 0.55;
}

/* 가족 상품 카드: 연노랑 테두리로 은행 상품과 구분 */
.card.family-origin {
  background: #ffffff;
  border-color: #ffe58a;
}

.card.locked {
  opacity: 1;
  cursor: default;
}

.card.locked .star-btn {
  pointer-events: none;
}

.card-content.is-blurred {
  filter: blur(1px);
  opacity: 0.85;
  user-select: none;
  pointer-events: none;
}

.lock-hint {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.lock-hint-text {
  font-weight: 700;
  font-size: 12.5px;
  color: #4a4e55;
  background: #ffffff;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.3px solid #e2e5e9;
}

.lock-hint-text.blue   { color: #4d8ad6; border-color: #dce8f7; }
.lock-hint-text.green  { color: #62b24a; border-color: #dcf0d6; }
.lock-hint-text.yellow { color: #b8901f; border-color: #ffe9b3; }
.lock-hint-text.orange { color: #f57c00; border-color: #ffe3c9; }
.lock-hint-text.red    { color: #e0554f; border-color: #ffd6d6; }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 7px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 11px;
}

.badge.blue {
  background: #e8f1fd;
  color: #2e7bf0;
}

.badge.orange {
  background: #fff3e0;
  color: #f57c00;
}

.prod-title {
  font-weight: 800;
  font-size: 15px;
  color: #15171b;
}

/* 출처 배지 스타일 (나의 상품과 통일) */
.origin-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 10.5px;
  white-space: nowrap;
}

/* 1. 가족/부모 상품 (피치/오렌지) */
.origin-badge.family {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}

/* 2. 실제 금융기관 상품 (블루/그레이) */
.origin-badge.bank {
  background: #eef4fc;
  color: #3b74b8;
  border: 1px solid #dce8f8;
}

.star-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  flex: none;
}

.star {
  width: 26px;
  height: 26px;
  transition: transform 0.25s;
}

.star.on {
  animation: pop 0.35s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.35); }
  100% { transform: scale(1); }
}

.divider {
  height: 1px;
  background: #f2f4f6;
  margin: 13px 0;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.d-label {
  font-weight: 600;
  font-size: 12.5px;
  color: #6b7077;
}

.d-value {
  font-weight: 700;
  font-size: 12.5px;
  color: #15171b;
}

.d-value.blue { color: #4d8ad6; font-weight: 800; }
.d-value.green { color: #62b24a; }
.d-value.yellow { color: #b8901f; }
.d-value.red { color: #e0554f; }
.d-value.orange { color: #f57c00; }

/* 바텀시트 */
.sheet-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 100;
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

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sheet-title {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
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

/* 찜한 상품 토글 행 */
.sheet-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 24px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
}

.sheet-toggle-label {
  font-size: 13.5px;
  font-weight: 700;
  color: #1e293b;
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

/* 바텀시트 트랜지션 */
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
</style>