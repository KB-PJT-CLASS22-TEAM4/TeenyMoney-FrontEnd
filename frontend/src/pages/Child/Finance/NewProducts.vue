<script setup>
import { ref, computed , watch} from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

const router = useRouter()

// ============================================================
//  [API 연동 필요] 금융상품 목록
// 현재는 더미 데이터. 백엔드 API 나오면 products를 교체.
// ============================================================

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

// --- [더미] 상품 목록 → API의 products로 교체 ---
const products = ref([
  {
    id: 1,
    category: '적금',
    badgeColor: 'blue',
    title: '티니 꿈나무 적금',
    desc: '매월 자동으로 모으는 목표 적금',
    liked: false,
    details: [
      { label: '기간', value: '12개월 기준', color: '' },
      { label: '납입한도', value: '월 최대 30만원', color: '' },
      { label: '금리', value: '연 3.0~4.5%', color: 'blue' },
      { label: '티니점수 조건', value: '양호등급 이상', color: 'green' },
    ],
  },
  {
    id: 2,
    category: '적금',
    badgeColor: 'blue',
    title: '티니 첫걸음 적금',
    desc: '처음 시작하는 소액 저축',
    liked: false,
    details: [
      { label: '기간', value: '6개월 기준', color: '' },
      { label: '납입한도', value: '월 최대 10만원', color: '' },
      { label: '금리', value: '연 1.5~3.0%', color: 'blue' },
      { label: '티니점수 조건', value: '보통등급 이상', color: 'yellow' },
    ],
  },
  {
    id: 3,
    category: '예금',
    badgeColor: 'blue',
    title: '티니 스타 예금',
    desc: '목표까지 안전하게 저축',
    liked: false,
    details: [
      { label: '기간', value: '12개월 기준', color: '' },
      { label: '예치한도', value: '최대 100만원', color: '' },
      { label: '금리', value: '연 2.0~4.0%', color: 'blue' },
      { label: '티니점수 조건', value: '보통등급 이상', color: 'yellow' },
    ],
  },
  {
    id: 4,
    category: '대출',
    badgeColor: 'orange',
    title: '티니 선물 대출',
    desc: '친구 생일선물을 미리 대출',
    liked: false,
    details: [
      { label: '기간', value: '최대 3개월', color: '' },
      { label: '대출한도', value: '최대 5만원', color: '' },
      { label: '금리', value: '금리 2.0~3.0%', color: 'blue' },
      { label: '티니점수 조건', value: '우수등급 이상', color: 'blue' },
    ],
  },
])

// 선택한 종류에 맞는 상품만 + 찜한 것 위로 정렬
const filteredProducts = computed(() => {
  // 1) 종류 필터 (전체면 다)
  const list = activeCategory.value === '전체'
    ? [...products.value]
    : products.value.filter((p) => p.category === activeCategory.value)

  // 2) 찜한 것(liked=true)을 위로 정렬
  //    liked끼리는 원래 순서 유지 (sort가 안정적)
  return list.sort((a, b) => Number(b.liked) - Number(a.liked))
})

// 별 찜 토글
function toggleLike(product) {
  product.liked = !product.liked
  // TODO: [API] 찜하기/찜해제 요청
}

function goBack() {
  router.push({ name: 'child-home' })  
}

// 하단 탭 이동
function onTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' })
  if (key === 'report') router.push({ name: 'child-report' })
  if (key === 'my') router.push({ name: 'child-mypage' })
  if (key === 'q') router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' }) 
}

// 스크롤할 때만 스크롤바 보이기
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
        >
          <div class="card-top">
            <div class="card-info">
              <div class="title-row">
                <span class="badge" :class="product.badgeColor">{{ product.category }}</span>
                <span class="prod-title">{{ product.title }}</span>
              </div>
              <span class="prod-desc">{{ product.desc }}</span>
            </div>
            <button class="star-btn" @click="toggleLike(product)" aria-label="찜하기">
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