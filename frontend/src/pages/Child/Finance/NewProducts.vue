<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getFinancialProducts } from '@/api/financialProduct'
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
const typeMap       = { DEPOSIT: '예금', SAVING: '적금', LOAN: '대출' }
const badgeColorMap = { DEPOSIT: 'blue', SAVING: 'blue', LOAN: 'orange' }

// 티니점수 → 등급 변환 (600~1000 5등분, 80점 간격)
function scoreToGrade(score) {
  if (score >= 920) return '우수'
  if (score >= 840) return '양호'
  if (score >= 760) return '보통'
  if (score >= 680) return '주의'
  return '회복필요'
}

// 등급 → 색상
const gradeColorMap = {
  '우수':    'blue',
  '양호':    'green',
  '보통':    'yellow',
  '주의':    'orange',
  '회복필요': 'red',
}

// API 데이터 → 기존 구조 변환
function mapProduct(p) {
  const terms = p.availableTerms ?? []
  const periodValue = terms.length === 1
    ? `${terms[0]}개월`
    : terms.length > 1
      ? `${Math.min(...terms)}~${Math.max(...terms)}개월`
      : '-'

  const minRate = p.rates?.length ? Math.min(...p.rates.map(r => r.baseRate)) : null
  const maxRate = p.rates?.length ? Math.max(...p.rates.map(r => r.expectedAppliedRate)) : null
  const rateValue = minRate !== null ? `연 ${minRate}~${maxRate}%` : '-'

  const limitLabel = p.productType === 'LOAN' ? '대출한도'
    : p.productType === 'DEPOSIT' ? '예치한도' : '납입한도'

  const scoreValue = p.minimumTeenyScore > 0
    ? `${scoreToGrade(p.minimumTeenyScore)}등급 이상`
    : '제한 없음'

  const gradeName  = p.minimumTeenyScore > 0 ? scoreToGrade(p.minimumTeenyScore) : '회복필요'
  const scoreColor = p.eligible ? gradeColorMap[gradeName] : 'red'

  return {
    id: p.productId,
    category: typeMap[p.productType] ?? p.productType,
    badgeColor: badgeColorMap[p.productType] ?? 'blue',
    title: p.productName,
    desc: p.financialCompanyName,
    liked: false,
    details: [
      { label: '기간',         value: periodValue, color: '' },
      { label: limitLabel,     value: '-',         color: '' },  // TODO: API에 한도 필드 없음 → 상세 API의 maximumAmount 활용 예정
      { label: '금리',          value: rateValue,   color: 'blue' },
      { label: '티니점수 조건',  value: scoreValue,  color: scoreColor },
    ],
  }
}

// [API] 금융상품 목록 조회
const products = ref([])

onMounted(async () => {
  try {
    const data = await getFinancialProducts(authStore.accessToken)
console.log('점수 조건들:', data.map(p => ({ name: p.productName, score: p.minimumTeenyScore })))
    products.value = data.map(mapProduct)
  } catch (e) {
    console.error('금융상품 조회 실패:', e.message)
  }
})

// 필터 + 찜 정렬
const filteredProducts = computed(() => {
  const list = activeCategory.value === '전체'
    ? [...products.value]
    : products.value.filter((p) => p.category === activeCategory.value)
  return list.sort((a, b) => Number(b.liked) - Number(a.liked))
})

// 찜 토글
function toggleLike(product) {
  product.liked = !product.liked
  // TODO: POST /api/v1/financial-products/{id}/like
}

function goBack() {
  router.push({ name: 'child-home' })
}

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'report')  router.push({ name: 'child-report' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
}

const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}

function goToApply(product) {
  if (product.category === '대출') return

  const detail = (label) => product.details.find((d) => d.label === label)
  router.push({
    name: 'child-finance-join',
    query: {
      category:   product.category,
      title:      product.title,
      rate:       detail('금리')?.value ?? '',
      periodInfo: detail('기간')?.value ?? '',
      limit:      detail('납입한도')?.value || detail('예치한도')?.value || '',
      scoreReq:   detail('티니점수 조건')?.value ?? '',
      scoreColor: detail('티니점수 조건')?.color ?? 'green',
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
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
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

      <!-- 상품 카드 리스트 (찜한 것 위로 정렬 + 부드러운 이동) -->
      <TransitionGroup name="card-move" tag="div">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="card"
          :class="{ liked: product.liked }"
          @click="goToApply(product)"
          style="cursor: pointer;"
        >
          <div class="card-top">
            <div class="card-info">
              <div class="title-row">
                <span class="badge" :class="product.badgeColor">{{ product.category }}</span>
                <span class="prod-title">{{ product.title }}</span>
              </div>
              <span class="prod-desc">{{ product.desc }}</span>
            </div>
            <button class="star-btn"  @click.stop="toggleLike(product)" aria-label="찜하기">
              <svg
                class="star"
                :class="{ on: product.liked }"
                viewBox="0 0 24 24"
                :fill="product.liked ? '#ffbc00' : 'none'"
              >
                <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"
                      :stroke="product.liked ? '#ffbc00' : '#c6cbd2'"
                      stroke-width="1.6" stroke-linejoin="round"/>
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
      </TransitionGroup>
    </div>

    <!-- 하단 탭바 (고정) -->
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

/* 스크롤 영역 (좌우 20px 통일) */
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
  border: 1.3px solid #eaedf1;
  border-radius: 14px;
  padding: 17px;
  margin-bottom: 14px;
  transition: border-color 0.3s, background 0.3s;
}

/* 찜한 카드 강조 (살짝 노란 배경/테두리) */
.card.liked {
  border-color: #ffe08a;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

.prod-desc {
  font-weight: 500;
  font-size: 11.5px;
  color: #b9bec5;
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

/* 별 누를 때 통통 튀는 효과 */
.star.on {
  animation: pop 0.35s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.35); }
  100% { transform: scale(1); }
}

/* ===== 카드 이동 애니메이션 (찜하면 위로 부드럽게) ===== */
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

.d-value.blue {
  color: #4d8ad6;
}

.d-value.green {
  color: #62b24a;
}

.d-value.yellow {
  color: #ffbc00;
}
</style>