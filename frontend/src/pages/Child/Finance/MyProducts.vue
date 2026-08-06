<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

const router = useRouter()

// 상단 탭 (나의 상품 고정 / 필요시 신규 상품 이동 연결 가능)
const activeTab = ref('나의 상품')
const tabs = ['신규 상품', '나의 상품']

// 카테고리 필터
const activeCategory = ref('전체')
const categories = ['전체', '적금', '예금', '대출']

// --- [더미] 나의 가입 상품 목록 (추후 API 연동) ---
const myProducts = ref([
  {
    id: 101,
    category: '적금',
    badgeColor: 'blue',
    title: '티니 꿈나무 적금',
    desc: '매월 자동으로 모으는 목표 적금',
    joinDate: '2024. 03. 15',
    amountLabel: '납입금액',
    amountValue: '월 30,000원',
    status: '가입 중',
    statusColor: 'blue',
    rateText: '12개월 기준, 연 3.0~4.5%',
  },
  {
    id: 102,
    category: '예금',
    badgeColor: 'blue',
    title: '티니 스타 예금',
    desc: '목표까지 안전하게 저축',
    joinDate: '2024. 01. 08',
    amountLabel: '예치금액',
    amountValue: '500,000원',
    status: '가입 중',
    statusColor: 'blue',
    rateText: '12개월 기준, 연 2.0~4.0%',
  },
  {
    id: 103,
    category: '대출',
    badgeColor: 'orange',
    title: '티니 선물 대출',
    desc: '친구 생일선물을 미리 대출',
    joinDate: '2024. 05. 22',
    amountLabel: '대출잔액',
    amountValue: '30,000원',
    status: '이용 중',
    statusColor: 'orange',
    rateText: '대출한도 5만원, 금리 2.0~3.0%',
  },
])

// 카테고리별 필터링
const filteredProducts = computed(() => {
  if (activeCategory.value === '전체') {
    return myProducts.value
  }
  return myProducts.value.filter((p) => p.category === activeCategory.value)
})

// 중도해지 버튼 동작
function handleCancelProduct(product) {
  alert(`${product.title} 중도해지 신청 화면으로 이동합니다.`)
}

function goBack() {
  router.back()
}

function onTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' })
  if (key === 'report') router.push({ name: 'child-report' })
  if (key === 'my') router.push({ name: 'child-mypage' })
  if (key === 'q') router.push({ name: 'qr-scan' })
}

// 스크롤바 제어
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
      <!-- 1. 신규 상품 / 나의 상품 탭 -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ off: tab !== activeTab }"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>

      <!-- 2. 상품 종류 필터 (전체/적금/예금/대출) -->
      <div class="filters">
        <button
          v-for="c in categories"
          :key="c"
          class="chip"
          :class="{ off: c !== activeCategory }"
          @click="activeCategory = c"
        >{{ c }}</button>
      </div>

      <!-- 3. 상품 카운트 -->
      <p class="count-row">상품<span class="count-num">{{ filteredProducts.length }}</span></p>

      <!-- 4. 나의 가입 상품 카드 리스트 -->
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="card my-card"
      >
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

        <!-- 세부 정보 -->
        <div class="my-details">
          <div class="detail-row">
            <span class="d-label">가입일</span>
            <span class="d-value date-val">{{ product.joinDate }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">{{ product.amountLabel }}</span>
            <span class="d-value bold-val">{{ product.amountValue }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">상태</span>
            <span class="d-value status-val" :class="product.statusColor">{{ product.status }}</span>
          </div>
        </div>

        <p class="rate-summary">{{ product.rateText }}</p>

        <!-- 중도해지 버튼 -->
        <button type="button" class="cancel-btn" @click="handleCancelProduct(product)">
          중도해지
        </button>
      </div>
    </div>

    <!-- 하단 고정 탭바 -->
    <BottomTabBar active="finance" @select="onTabSelect" />
  </div>
</template>

<style scoped>
/* 메인 프레임 */
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
  flex: none;
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
  min-height: 0;
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

/* 탭 버튼 */
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
  padding: 12px 0;
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

/* 필터 칩 */
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.chip {
  padding: 9px 20px;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
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

/* 카운트 */
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

/* 카드 공통 스타일 */
.card {
  border: 1.3px solid #eaedf1;
  border-radius: 14px;
  padding: 18px;
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

.badge {
  padding: 4px 9px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 11.5px;
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
  font-size: 16.5px;
  color: #15171b;
}

.prod-desc {
  font-weight: 500;
  font-size: 12.5px;
  color: #b9bec5;
}

.divider {
  height: 1px;
  background: #f2f4f6;
  margin: 16px 0 12px;
}

/* 나의 상품 세부 스타일 */
.my-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.d-label {
  font-weight: 600;
  font-size: 13.5px;
  color: #8b9097;
}

.d-value {
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
}

.date-val {
  font-weight: 600;
  color: #4a4e55;
}

.bold-val {
  font-weight: 800;
  color: #15171b;
}

.status-val.blue {
  color: #2e7bf0;
  font-weight: 700;
}

.status-val.orange {
  color: #f57c00;
  font-weight: 700;
}

.rate-summary {
  font-weight: 600;
  font-size: 12.5px;
  color: #8b9097;
  margin-bottom: 14px;
}

.cancel-btn {
  width: 100%;
  height: 42px;
  background: #f7f8fa;
  border: 1.2px solid #e7e9ec;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #4a4e55;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f2f4f6;
  color: #15171b;
}
</style>