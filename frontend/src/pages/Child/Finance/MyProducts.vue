<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyEnrolledFinancialProducts } from '@/api/finance'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('나의 상품')
const tabs = ['신규 상품', '나의 상품']

watch(activeTab, (val) => {
  if (val === '신규 상품') {
    router.push({ name: 'child-finance-newproducts' })
  }
})

const activeCategory = ref('전체')
const categories = ['전체', '적금', '예금', '대출']

// 상품 타입 매핑 (신규 상품 화면과 동일)
const typeMap       = { DEPOSIT: '예금', SAVING: '적금', LOAN: '대출' }
const badgeColorMap = { DEPOSIT: 'blue', SAVING: 'blue', LOAN: 'orange' }

// 가입 상태 → 한글 라벨/색상
// TODO: 실제 status 값(enum)을 백엔드에 확인 후 채워넣기 — 매핑 안 된 값은 영어 원문 대신 상품타입 기준 기본값으로 표시
const statusMap = {
  // ACTIVE: { label: '가입 중', color: 'blue' },
  // IN_PROGRESS: { label: '이용 중', color: 'orange' },
  // COMPLETED: { label: '만기 완료', color: 'green' },
  // CANCELLED: { label: '중도 해지', color: 'red' },
}

// startDate가 문자열("2024-03-15")이거나, LocalDateTime이 배열([2024,3,15,...])로 오는 경우 모두 처리
function formatJoinDate(raw) {
  if (!raw) return '-'

  let y, m, d
  if (Array.isArray(raw)) {
    [y, m, d] = raw
  } else {
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return '-'
    y = parsed.getFullYear()
    m = parsed.getMonth() + 1
    d = parsed.getDate()
  }

  const pad = (n) => String(n).padStart(2, '0')
  return `${y}. ${pad(m)}. ${pad(d)}`
}

// API 데이터 → 화면 표시 구조로 변환
function mapEnrolledProduct(p) {
  const isLoan = p.productType === 'LOAN'
  const isSaving = p.productType === 'SAVING'

  const amountLabel = isLoan ? '대출잔액' : isSaving ? '납입금액' : '예치금액'
  const amountValue = isSaving
    ? `월 ${(p.monthlyAmount ?? 0).toLocaleString()}원`
    : `${(p.currentAmount ?? 0).toLocaleString()}원`

  const statusInfo = statusMap[p.status] ?? {
    label: isLoan ? '이용 중' : '가입 중',
    color: isLoan ? 'orange' : 'blue',
  }

  const rateText = isLoan
    ? `금리 연 ${p.appliedRate ?? '-'}%`
    : `${p.termMonths ?? '-'}개월 기준, 연 ${p.appliedRate ?? '-'}%`

  return {
    id: p.enrollmentId,
    category: typeMap[p.productType] ?? p.productType,
    badgeColor: badgeColorMap[p.productType] ?? 'blue',
    title: p.productName,
    desc: p.description || p.financialCompanyName || '',
    joinDate: formatJoinDate(p.startDate),
    amountLabel,
    amountValue,
    status: statusInfo.label,
    statusColor: statusInfo.color,
    rateText,
  }
}

// [API] 나의 가입 상품 목록
const myProducts = ref([])

onMounted(async () => {
  try {
    const data = await getMyEnrolledFinancialProducts(authStore.accessToken)
    myProducts.value = data.map(mapEnrolledProduct)
  } catch (e) {
    console.error('가입 상품 목록 조회 실패:', e.message)
  }
})

const filteredProducts = computed(() => {
  if (activeCategory.value === '전체') return myProducts.value
  return myProducts.value.filter((p) => p.category === activeCategory.value)
})

function handleCancelProduct(product) {
  router.push({
    name: 'product-cancel',
    query: {
      id: product.id,
      title: product.title,
      category: product.category,
    },
  })
}

function goBack() {
  router.push({ name: 'child-home' })
}

function onTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' })
  if (key === 'report') router.push({ name: 'child-report' })
  if (key === 'my') router.push({ name: 'child-mypage' })
  if (key === 'q') router.push({ name: 'qr-scan' })
}

const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}
</script>

<template>
  <div class="product-screen">
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
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ off: tab !== activeTab }"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>

      <div class="filters">
        <button
          v-for="c in categories"
          :key="c"
          class="chip"
          :class="{ off: c !== activeCategory }"
          @click="activeCategory = c"
        >{{ c }}</button>
      </div>

      <p class="count-row">상품<span class="count-num">{{ filteredProducts.length }}</span></p>

      <div v-for="product in filteredProducts" :key="product.id" class="card">
        <div class="card-top">
          <div class="card-info">
            <div class="title-row">
              <span class="badge" :class="product.badgeColor">{{ product.category }}</span>
              <span class="prod-title">{{ product.title }}</span>
            </div>
            <span class="prod-desc">{{ product.desc }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="details">
          <div class="detail-row">
            <span class="d-label">가입일</span>
            <span class="d-value">{{ product.joinDate }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">{{ product.amountLabel }}</span>
            <span class="d-value">{{ product.amountValue }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">상태</span>
            <span class="d-value" :class="product.statusColor">{{ product.status }}</span>
          </div>
        </div>

        <p class="rate-summary">{{ product.rateText }}</p>

        <button type="button" class="cancel-btn" @click="handleCancelProduct(product)">
          중도해지
        </button>
      </div>
    </div>

    <BottomTabBar active="finance" @select="onTabSelect" />
  </div>
</template>

<style scoped>
/* 신규 상품과 동일한 프레임 */
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

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 20px;
}
.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb { background: #d8dbdf; }

/* 탭 — 신규 상품과 동일 */
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
  padding: 8px 0;           /* 신규 상품과 동일 */
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

/* 필터 칩 — 신규 상품과 동일 */
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}
.chip {
  padding: 7px 16px;        /* 신규 상품과 동일 */
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;          /* 신규 상품과 동일 */
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

/* 카운트 — 신규 상품과 동일 */
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

/* 카드 — 신규 상품과 동일 */
.card {
  border: 1.3px solid #eaedf1;
  border-radius: 14px;
  padding: 17px;            /* 신규 상품과 동일 */
  margin-bottom: 14px;
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

/* 뱃지 — 신규 상품과 동일 */
.badge {
  padding: 3px 7px;         /* 신규 상품과 동일 */
  border-radius: 5px;
  font-weight: 700;
  font-size: 11px;          /* 신규 상품과 동일 */
}
.badge.blue   { background: #e8f1fd; color: #2e7bf0; }
.badge.orange { background: #fff3e0; color: #f57c00; }

.prod-title {
  font-weight: 800;
  font-size: 15px;          /* 신규 상품과 동일 */
  color: #15171b;
}
.prod-desc {
  font-weight: 500;
  font-size: 11.5px;        /* 신규 상품과 동일 */
  color: #b9bec5;
}

.divider {
  height: 1px;
  background: #f2f4f6;
  margin: 13px 0;           /* 신규 상품과 동일 */
}

/* 세부 정보 — 신규 상품 details와 동일 */
.details {
  display: flex;
  flex-direction: column;
  gap: 8px;                 /* 신규 상품과 동일 */
  margin-bottom: 12px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.d-label {
  font-weight: 600;
  font-size: 12.5px;        /* 신규 상품과 동일 */
  color: #8b9097;
}
.d-value {
  font-weight: 700;
  font-size: 12.5px;        /* 신규 상품과 동일 */
  color: #15171b;
}
.d-value.blue   { color: #2e7bf0; }
.d-value.orange { color: #f57c00; }
.d-value.green  { color: #62b24a; }
.d-value.red    { color: #e0554f; }

.rate-summary {
  font-weight: 600;
  font-size: 12.5px;        /* d-label과 동일 */
  color: #8b9097;
  margin-bottom: 14px;
}

.cancel-btn {
  width: 100%;
  height: 38px;             /* 신규 상품 카드 높이감에 맞게 축소 */
  background: #f7f8fa;
  border: 1.2px solid #e7e9ec;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  color: #4a4e55;
  cursor: pointer;
}
.cancel-btn:hover {
  background: #f2f4f6;
  color: #15171b;
}
</style>