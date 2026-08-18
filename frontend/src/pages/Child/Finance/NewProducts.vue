<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getFinancialProducts } from '@/api/finance'
import { getTeenyScore } from '@/api/teenyScore'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

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

// 상품 종류 필터
const activeCategory = ref('전체')
const categories = ['전체', '적금', '예금', '대출']

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

  const scoreValue = isLoan
    ? p.requiredGradeName
      ? `${p.requiredGradeName} 등급 이상`
      : '제한 없음'
    : null
  const scoreColor = isLoan ? gradeColorMap[p.requiredGradeName] ?? 'blue' : ''

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
    details.push({ label: '티니점수 조건', value: scoreValue, color: scoreColor })
  }

  const origin = resolveProductOrigin(p)

  return {
    id: `${p.productType}-${p.productId}`,
    productId: p.productId,
    availableTerms: terms,
    category: typeMap[p.productType] ?? p.productType,
    badgeColor: badgeColorMap[p.productType] ?? 'blue',
    originType: origin.type,
    originLabel: origin.label,
    title: p.productName,
    liked: false,
    eligible: p.eligible,
    ineligibleReason: p.ineligibleReason,
    locked: isLoan && !p.eligible,
    requiredGradeName: p.requiredGradeName,
    gradeColor: scoreColor,
    rates: ratesList,
    baseRate,
    finalAppliedRateNum,
    rangeText,
    combinedRateText,
    details,
  }
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

    // 2. 금융상품 목록 조회
    const data = await getFinancialProducts(authStore.accessToken)
    const mapped = data.map(mapProduct)

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
})

// 필터 + 찜 정렬
const filteredProducts = computed(() => {
  const list =
    activeCategory.value === '전체'
      ? [...products.value]
      : products.value.filter((p) => p.category === activeCategory.value)
  return list.sort((a, b) => Number(b.liked) - Number(a.liked))
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

function goToApply(product) {
  if (!product.eligible) {
    alert('아직은 가입할 수 없는 상품이에요!')
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
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">금융 상품</h1>
    </div>

    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- 신규 상품 / 나의 상품 탭 -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ off: tab !== activeTab }"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>

      <!-- 상품 종류 필터 -->
      <div class="filters">
        <button
          v-for="c in categories"
          :key="c"
          class="chip"
          :class="{ off: c !== activeCategory }"
          @click="activeCategory = c"
        >{{ c }}</button>
      </div>

      <!-- 상품 카운트 -->
      <p class="count-row">상품<span class="count-num">{{ filteredProducts.length }}</span></p>

      <!-- 상품 카드 리스트 -->
      <TransitionGroup name="card-move" tag="div">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="card"
          :class="{ liked: product.liked, disabled: !product.eligible && !product.locked, locked: product.locked }"
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
                <span class="d-label">{{ d.label }}</span>
                <span class="d-value" :class="d.color">{{ d.value }}</span>
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
            <span class="lock-hint-text" :class="product.gradeColor">{{ product.requiredGradeName }} 등급이면 열려요</span>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="finance" @select="onTabSelect" />
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
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 20px 10px;
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
  padding: 8px 20px 20px;
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

/* 신규/나의 상품 탭 */
.tabs {
  display: flex;
  padding: 5px;
  background: #f2f4f6;
  border-radius: 12px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  border: none;
  padding: 8px 0;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
  background: #ffffff;
  border-radius: 9px;
  cursor: pointer;
}

.tab.off {
  background: transparent;
  color: #9ca1a8;
  font-weight: 600;
}

/* 상품 종류 필터 */
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.chip {
  padding: 7px 16px;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  color: #15171b;
  background: #ffbc00;
  cursor: pointer;
}

.chip.off {
  background: #ffffff;
  border: 1.3px solid #e7e9ec;
  color: #4a4e55;
  font-weight: 600;
}

/* 상품 카운트 */
.count-row {
  font-weight: 800;
  font-size: 16px;
  color: #15171b;
  margin: 0 0 14px;
}

.count-num {
  color: #2e7bf0;
  margin-left: 6px;
}

/* 상품 카드 */
.card {
  position: relative;
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

.card-move-move {
  transition: transform 0.45s ease;
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
  color: #8b9097;
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
</style>