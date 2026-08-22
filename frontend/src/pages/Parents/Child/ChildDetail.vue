<template>
  <div class="child-detail">

    <!-- =========================
         스크롤 영역
    ========================== -->
    <div class="scroll-area">

      <!-- =========================
           히어로 영역
      ========================== -->
      <section class="hero-section">

        <!-- 상단 네비 -->
        <header class="top-nav">
          <button
            class="back-btn"
            type="button"
            aria-label="뒤로가기"
            @click="router.back()"
          >
            <img
              src="@/assets/icons/icon-back.svg"
              alt=""
              class="back-icon"
            />
          </button>

          <span class="nav-title">
            자녀 관리
          </span>

          <ParentNavActions />
        </header>


        <!-- 자녀 소개 -->
        <div class="hero-text">

          <span class="hero-eyebrow">
            자녀 금융 현황
          </span>

          <h2 class="hero-title">
            <span class="highlight-blue">
              {{ child.name }}
            </span>
            님의<br />
            금융 생활을 확인해보세요
          </h2>

          <p class="hero-sub">
            티니머니와 함께 성장하고 있어요!
          </p>

        </div>


        <!-- 캐릭터 -->
        <div class="hero-mascot-wrap">

          <img
            :src="CHILD_DETAIL_MASCOT"
            class="hero-mascot"
            alt="티니"
          />

          <div class="mascot-shadow"></div>

        </div>


        <!-- 티니점수 카드 -->
        <div
          class="hero-score-card"
          @click="
            router.push(
              `/parents/children/${childId}/teeny-score`
            )
          "
        >

          <div class="score-card-top">

            <div class="score-card-left">

              <span class="score-card-title">
                티니점수
              </span>

              <div class="score-value-row">

                <span class="score-num">
                  {{ child.score }}
                </span>

                <span class="score-unit">
                  점
                </span>

              </div>

            </div>


            <div class="score-card-right">

              <div class="grade-badge">

                <span class="badge-icon">
                  🎖️
                </span>

                <span class="badge-text">
                  {{ child.grade }}
                </span>

              </div>

            </div>

          </div>


          <div class="score-progress-wrap">

            <div class="progress-text-row">

              <span class="progress-label">
                성장 점수
              </span>

              <span class="progress-target">
                {{ child.score }} / {{ child.maxScore || 1000 }}점
              </span>

            </div>


            <div class="progress-bar-bg">

              <div
                class="progress-bar-fill"
                :style="{
                  width: scorePercent + '%'
                }"
              ></div>

            </div>

          </div>

        </div>

      </section>


      <!-- =========================
           잔액
      ========================== -->
      <section class="wallet-section">

        <div class="balance-row">

          <div class="balance-info">

            <span class="balance-label">
              {{ child.name }}님의 티니머니 잔액
            </span>

            <p
              v-if="isWalletLoading"
              class="balance-amount"
            >
              조회 중...
            </p>

            <p
              v-else
              class="balance-amount"
            >
              {{ child.balance.toLocaleString() }}원
            </p>

          </div>


          <button
            class="history-btn"
            type="button"
            @click="goToTransactions"
          >
            내역조회
          </button>

        </div>

      </section>


      <!-- =========================
           자녀 관리 카드
      ========================== -->
      <section class="manage-section">

        <div class="section-head">

          <span class="section-title">
            자녀 관리
          </span>
        </div>


        <div class="manage-slide">

          <!-- 소비 리포트 -->
          <div
            class="manage-card"
            @click="goToReport"
          >

            <div class="manage-card-content">

              <div class="manage-card-badge report-badge">
                소비 분석
              </div>

              <div class="manage-card-title">
                머니 리포트
              </div>

              <div class="manage-card-sub large-sub">
                리포트 보기<br />
                한 달 소비를 한눈에
              </div>

            </div>


            <div class="manage-decoration report-decoration">
              ▤
            </div>

          </div>


          <!-- 유해 업종 설정 -->
          <div
            class="manage-card"
            @click="goToHarmfulCategory"
          >

            <div class="manage-card-content">

              <div class="manage-card-badge setting-badge">
                설정
              </div>

              <div class="manage-card-title">
                업종별 결제 제한
              </div>

              <div class="manage-card-sub large-sub">
                이용 제한 업종을<br />
                직접 관리해요
              </div>

            </div>


            <div class="manage-decoration setting-decoration">
              🛡
            </div>

          </div>

        </div>

      </section>


      <!-- =========================
           금융 상품
      ========================== -->
      <section class="finance">

        <div
          class="finance-head"
          @click="
            router.push(
              `/parents/children/${childId}/finance`
            )
          "
        >

          <span class="finance-section-title">
            금융 상품
          </span>

          <span class="finance-all">
            전체보기 ›
          </span>

        </div>


        <!-- 가로 슬라이드 -->
        <div
          ref="scrollRef"
          class="finance-scroll"
          @scroll="onScroll"
        >
          <div
            v-for="card in financePreviewCards"
            :key="card.key"
            class="finance-product-card"
          >
            <div class="finance-product-top">
              <div class="product-tag" :class="card.tagClass">
                {{ card.tagLabel }}
              </div>

              <span
                v-if="card.badge"
                class="product-rate"
                :class="card.badgeClass"
              >
                {{ card.badge }}
              </span>
            </div>

            <p class="product-name">
              {{ card.title }}
            </p>

            <p class="product-sub">
              {{ card.subtitle }}
            </p>

            <div class="product-bottom">
              <span class="product-label">
                {{ card.amountLabel }}
              </span>

              <strong class="product-amount">
                {{ card.amountText }}
              </strong>
            </div>
          </div>

          <div
            v-if="!financePreviewCards.length"
            class="finance-empty-card"
          >
            등록된 금융 상품이 없습니다
          </div>
        </div>


        <!-- 슬라이드 인디케이터 -->
        <div
          v-if="financePreviewCards.length > 1"
          class="indicator"
        >

          <span
            v-for="(_, index) in financePreviewCards"
            :key="index"
            class="dot"
            :class="{
              active:
                index === activeCard
            }"
          ></span>

        </div>

      </section>

      <section class="history">
        <div class="history-head">
          <span class="history-title">최근 이용내역</span>

          <button
            type="button"
            class="more-button"
            aria-label="전체 거래내역 보기"
            @click="goToTransactions"
          >
            <img
              src="@/assets/icons/icon-chevron.svg"
              alt=""
              class="chevron-icon"
            />
          </button>
        </div>

        <div
          v-if="isWalletLoading"
          class="transaction-state"
        >
          거래내역을 불러오는 중입니다.
        </div>

        <div
          v-else-if="walletError"
          class="transaction-state error-message"
        >
          <p>{{ walletError }}</p>

          <button
            type="button"
            class="retry-button"
            @click="fetchWallet"
          >
            다시 시도
          </button>
        </div>

        <template v-else-if="recentTransactions.length > 0">
          <div
            v-for="item in recentTransactions"
            :key="item.id"
            class="tx-item"
          >
            <div class="tx-info">
              <span class="tx-date">
                {{ formatTransactionDate(item.createdAt) }}
              </span>
              <span class="tx-name">
                {{ item.description || '거래내역' }}
              </span>
              <span class="tx-balance">
                잔액 : {{ Number(item.balanceAfter || 0).toLocaleString() }}원
              </span>
            </div>

            <span
              class="tx-amount"
              :class="{
                plus: item.direction === 'CREDIT',
                minus: item.direction === 'DEBIT',
              }"
            >
              {{ getAmountText(item) }}
            </span>
          </div>
        </template>

        <div
          v-else
          class="transaction-state"
        >
          최근 이용내역이 없습니다.
        </div>
      </section>

    </div>


    <!-- =========================
         하단 NAV
    ========================== -->
    <ParentBottomNav active="child" />

  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'
import { getChildWallet } from '@/api/wallet'
import { getTeenyScore } from '@/api/teenyScore'
import * as financialProductsApi from '@/api/financialProducts'
import { fetchAllChildFinancialProducts } from '@/utils/financialProductMapper'
import { CHILD_DETAIL_MASCOT } from '@/utils/profileImages'
import { formatKstDateTime } from '@/utils/datetime'


const router =
  useRouter()

const route =
  useRoute()

const authStore = useAuthStore()


// ========================================
// 기존 childId
// ========================================

const childId = computed(() =>
  Number(route.params.childId)
)

console.log(
  '현재 자녀 ID:',
  childId.value
)


// ========================================
// 기존 자녀 데이터
// TODO 상세 API 연동 시 교체
// ========================================

const child =
  ref({
    id: childId.value,

    name: '자녀',

    balance: 0,

    score: 0,

    grade: '-',

    gradeColor: '#3b82f6',

    minScore: 0,

    maxScore: 1000,
  })


// ========================================
// 기존 점수 계산
// ========================================

const scorePercent =
  computed(() => {
    const min = child.value.minScore ?? 0
    const max = child.value.maxScore ?? 1000
    const range = max - min

    if (range <= 0) {
      return Math.min(
        Math.max(child.value.score / 10, 0),
        100
      )
    }

    const current = child.value.score - min

    return Math.min(
      Math.max(
        (current / range) * 100,
        0
      ),
      100
    )
  })


// ========================================
// 기존 유해 업종 설정 이동
// ========================================

function goToHarmfulCategory() {

  router.push({
    path:
      '/parents/harmfulcategory',

    query: {
      childId:
        childId.value,
    },
  })
}

function goToReport() {
  router.push({
    name: 'parents-child-report',
    params: { childId: childId.value },
  })
}

function goToTransactions() {
  router.push({
    name: 'parents-child-transaction',
    params: { childId: childId.value },
  })
}

const isWalletLoading = ref(false)
const walletError = ref('')
const recentTransactions = ref([])

async function fetchWallet() {
  isWalletLoading.value = true
  walletError.value = ''

  try {
    if (!authStore.accessToken) {
      walletError.value = '로그인이 필요합니다.'
      return
    }

    const res = await getChildWallet(authStore.accessToken, childId.value)

    if (res.success) {
      child.value.balance = res.data.balance ?? 0
      recentTransactions.value = res.data.recentTransactions || []
    }
  } catch (error) {
    console.error('자녀 지갑 조회 실패:', error)

    if (error.status === 401) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
      return
    }

    walletError.value =
      error.message || '자녀 지갑 정보를 불러오지 못했습니다.'
  } finally {
    isWalletLoading.value = false
  }
}

function getAmountText(item) {
  const amount = Math.abs(Number(item.amount || 0))

  if (item.direction === 'CREDIT') {
    return `+${amount.toLocaleString()}원`
  }

  if (item.direction === 'DEBIT') {
    return `-${amount.toLocaleString()}원`
  }

  return `${amount.toLocaleString()}원`
}

function formatTransactionDate(createdAt) {
  return formatKstDateTime(createdAt)
}


// ========================================
// 금융상품 슬라이드 UI
// ========================================

const financeProducts = ref([])

const financePreviewCards = computed(() => {
  const activeItems = financeProducts.value.filter(
    (item) => !item.isPending && item.status !== 'REJECTED'
  )

  const groups = [
    {
      key: 'saving-deposit',
      tagLabel: '예적금',
      tagClass: 'saving-tag',
      categories: ['적금', '예금'],
      amountLabel: '보유 금액',
    },
    {
      key: 'loan',
      tagLabel: '빌리기',
      tagClass: 'loan-tag',
      categories: ['대출'],
      amountLabel: '남은 금액',
    },
  ]

  return groups
    .map((group) => {
      const items = activeItems.filter((item) =>
        group.categories.includes(item.category)
      )

      if (!items.length) return null

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.accumulatedAmount || 0),
        0
      )

      return {
        key: group.key,
        tagLabel: group.tagLabel,
        tagClass: group.tagClass,
        title: items[0].title,
        subtitle: items.length > 1 ? `외 ${items.length - 1}건` : items[0].rateText,
        amountLabel: group.amountLabel,
        amountText: `${totalAmount.toLocaleString()}원`,
        badge: group.key === 'loan' ? items[0].maturityDate : items[0].rateText,
        badgeClass: group.key === 'loan' ? 'product-dday' : '',
      }
    })
    .filter(Boolean)
})

async function fetchTeenyScore() {
  try {
    const res = await getTeenyScore(authStore.accessToken, childId.value)

    if (!res.success) return

    const data = res.data

    child.value.score = data.teenyScore ?? 0
    child.value.grade = data.gradeName
      ? `${data.gradeName} 등급`
      : '-'
    child.value.gradeColor = data.color ?? '#3b82f6'
    child.value.minScore = data.minScore ?? 0
    child.value.maxScore = data.maxScore ?? 1000
  } catch (error) {
    console.error('티니점수 조회 실패:', error)
  }
}

async function fetchChildInfo() {
  try {
    const res = await getChildren(authStore.accessToken)
    const matched = res.data?.find(
      (item) => Number(item.childId) === childId.value
    )

    if (matched) {
      child.value.name = matched.name
    }
  } catch (error) {
    console.error('자녀 정보 조회 실패:', error)
  }
}

async function fetchFinancePreview() {
  try {
    financeProducts.value = await fetchAllChildFinancialProducts(
      authStore.accessToken,
      childId.value,
      financialProductsApi
    )
  } catch (error) {
    console.error('금융 상품 미리보기 조회 실패:', error)
    financeProducts.value = []
  }
}

async function loadChildDetail() {
  if (!authStore.accessToken) return

  child.value.id = childId.value

  await Promise.all([
    fetchChildInfo(),
    fetchTeenyScore(),
    fetchFinancePreview(),
    fetchWallet(),
  ])
}

watch(childId, (id, prev) => {
  if (!Number.isFinite(id) || id === prev) return
  loadChildDetail()
})

onMounted(loadChildDetail)
const activeCard =
  ref(0)

const scrollRef =
  ref(null)


function onScroll() {

  const el =
    scrollRef.value

  if (!el) {
    return
  }

  const cardCount = financePreviewCards.value.length

  if (cardCount <= 1) {
    activeCard.value = 0
    return
  }

  const maxScroll =
    el.scrollWidth -
    el.clientWidth

  const ratio =
    maxScroll > 0
      ? el.scrollLeft /
        maxScroll
      : 0

  activeCard.value =
    Math.round(
      ratio *
      (
        cardCount -
        1
      )
    )
}


</script>


<style scoped>
* {
  box-sizing: border-box;
}


/* =====================================
   전체 화면
===================================== */

.child-detail {
  display: flex;
  flex-direction: column;

  width: 360px;

  /* nav까지 화면을 꽉 채움 */
  height: 100dvh;
  min-height: 100dvh;

  margin: 0 auto;

  overflow: hidden;

  border-left:
    1px solid #eceef1;

  border-right:
    1px solid #eceef1;

  background: #f8fafc;
}


.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* 마지막 카드와 nav 사이 최소 여백 */
  padding-bottom: 80px;

  background: #f8fafc;

  scrollbar-width: none;
}


.scroll-area::-webkit-scrollbar {
  display: none;
}


/* =====================================
   HERO
===================================== */

.hero-section {
  position: relative;

  overflow: hidden;

  padding:
    0 18px 24px;

  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;

  background:
    linear-gradient(
      180deg,
      #eef7ff 0%,
      #fffbe8 100%
    );
}


/* =====================================
   상단 NAV
===================================== */

.top-nav {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: 0 -18px 16px;
}


.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}


.back-icon {
  width: 22px;
  height: 22px;
}


.nav-title {
  color: #1c1e22;

  font-size: 16px;
  font-weight: 900;
}


.bell-btn {
  position: absolute;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}


.alarm-icon {
  width: 22px;
  height: 22px;
}


/* =====================================
   HERO TEXT
===================================== */

.hero-text {
  position: relative;

  z-index: 2;

  margin-bottom: 16px;
}


.hero-eyebrow {
  display: block;

  margin-bottom: 4px;

  color: #64748b;

  font-size: 10.5px;
  font-weight: 700;
}


.hero-title {
  margin: 0 0 6px;

  color: #191b1e;

  font-size: 21px;
  font-weight: 900;

  line-height: 1.35;

  letter-spacing: -0.5px;
}


.highlight-blue {
  color: #2563eb;
}


.hero-sub {
  margin: 0;

  color: #71717a;

  font-size: 11.5px;
  font-weight: 600;
}


/* =====================================
   캐릭터
===================================== */

.hero-mascot-wrap {
  position: absolute;

  right: -8px;
  top: 125px;

  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;

  pointer-events: none;
}


.hero-mascot {
  width: 165px;
  height: 165px;

  object-fit: contain;
}


.mascot-shadow {
  width: 105px;
  height: 12px;

  margin-top: -18px;

  border-radius: 50%;

  background:
    rgba(
      220,
      190,
      80,
      0.32
    );

  filter: blur(5px);
}


/* =====================================
   티니점수
===================================== */

.hero-score-card {
  position: relative;

  z-index: 3;

  display: flex;
  flex-direction: column;

  width: 170px;

  padding: 12px;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 8px 24px
    rgba(
      0,
      0,
      0,
      0.06
    );

  cursor: pointer;
}


.score-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}


.score-card-left {
  display: flex;
  flex-direction: column;

  gap: 1px;
}


.score-card-title {
  color: #27272a;

  font-size: 11px;
  font-weight: 800;
}


.score-value-row {
  display: flex;
  align-items: baseline;

  gap: 2px;

  margin-top: 1px;
}


.score-num {
  color: #0f172a;

  font-size: 26px;
  font-weight: 900;

  letter-spacing: -1px;

  line-height: 1;
}


.score-unit {
  color: #0f172a;

  font-size: 14px;
  font-weight: 800;
}


.score-card-right {
  display: flex;
  align-items: center;
}


.grade-badge {
  display: inline-flex;
  align-items: center;

  gap: 2px;

  padding: 2px 6px;

  border:
    1px solid #fde68a;

  border-radius: 999px;

  background: #fffbe8;
}


.badge-icon {
  font-size: 9px;
}


.badge-text {
  color: #b77900;

  font-size: 9px;
  font-weight: 800;

  white-space: nowrap;
}


.score-progress-wrap {
  margin-top: 8px;

  padding-top: 6px;

  border-top:
    1px solid #f1f5f9;
}


.progress-text-row {
  display: flex;
  justify-content: space-between;

  margin-bottom: 4px;

  color: #64748b;

  font-size: 9px;
  font-weight: 700;
}


.progress-bar-bg {
  width: 100%;
  height: 7px;

  overflow: hidden;

  border-radius: 999px;

  background: #f1f5f9;
}


.progress-bar-fill {
  height: 100%;

  border-radius: 999px;

  background: #facc15;

  transition:
    width 0.4s ease-out;
}


/* =====================================
   잔액
===================================== */

.wallet-section {
  padding:
    14px 18px 0;
}


.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 18px;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 2px 8px
    rgba(
      0,
      0,
      0,
      0.03
    );
}


.balance-label {
  color: #71717a;

  font-size: 11.5px;
  font-weight: 700;
}


.balance-amount {
  margin: 2px 0 0;

  color: #0f172a;

  font-size: 21px;
  font-weight: 900;
}


.history-btn {
  padding: 9px 14px;

  border: none;

  border-radius: 12px;

  background: #facc15;

  color: #18181b;

  font-size: 12.5px;
  font-weight: 800;

  cursor: pointer;
}

.history {
  margin: 12px 18px 16px;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.chevron-icon {
  width: 18px;
  height: 18px;
}

.tx-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.tx-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.tx-date {
  font-size: 10px;
  font-weight: 600;
  color: #8b9097;
}

.tx-name {
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.tx-balance {
  font-size: 10px;
  font-weight: 600;
  color: #8b9097;
}

.tx-amount {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
  white-space: nowrap;
}

.tx-amount.plus {
  color: #3178c6;
}

.tx-amount.minus {
  color: #ef4444;
}

.transaction-state {
  padding: 28px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
  text-align: center;
}

.error-message {
  color: #d14343;
}

.error-message p {
  margin: 0;
}

.retry-button {
  margin-top: 12px;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: #facc15;
  color: #191b1e;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}


/* =====================================
   공통 제목
===================================== */

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 20px;

  margin-bottom: 10px;
}


.section-title {
  color: #0f172a;

  font-size: 15px;
  font-weight: 800;
}


.section-description {
  color: #a0a5b1;

  font-size: 11px;
  font-weight: 600;
}


/* =====================================
   자녀 관리 카드
===================================== */

.manage-section {
  padding: 20px 0 0;
}


.manage-slide {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 2px 18px 8px;
}


.manage-card {
  position: relative;

  width: 100%;
  height: 118px;

  box-sizing: border-box;

  overflow: hidden;

  padding: 12px 14px;

  border:
    1px solid #eaedf1;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 4px 12px
    rgba(
      0,
      0,
      0,
      0.03
    );

  cursor: pointer;

  transition:
    transform 0.2s ease;
}


.manage-card:active {
  transform: scale(0.97);
}


.manage-card-content {
  position: relative;

  z-index: 2;

  display: flex;
  flex-direction: column;

  height: 100%;
}


.manage-card-badge {
  align-self: flex-start;

  padding: 3px 7px;

  margin-bottom: 8px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 800;

  line-height: 1;
}


.report-badge {
  color: #d98200;

  background: #fff8e6;
}


.setting-badge {
  color: #2563eb;

  background: #eff6ff;
}


.manage-card-title {
  margin-bottom: 8px;

  color: #22252a;

  font-size: 14px;
  font-weight: 800;
}


.manage-card-sub {
  margin-top: 3px;

  color: #8b9097;

  font-size: 10px;
  font-weight: 600;

  line-height: 1.35;
}


.large-sub {
  margin-top: 3px;
}


.manage-decoration {
  position: absolute;

  right: 10px;
  bottom: 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border-radius: 14px;

  font-size: 19px;
  font-weight: 900;
}


.report-decoration {
  color: #d98200;

  background: #fff8e6;
}


.setting-decoration {
  background: #eff6ff;
}


/* =====================================
   금융 상품
===================================== */

.finance {
  margin:
    12px 18px 0;

  padding:
    16px 0 12px;

  overflow: hidden;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 2px 8px
    rgba(
      0,
      0,
      0,
      0.03
    );
}


/* 헤더 */
.finance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:
    0 16px 12px;

  border-bottom:
    1px solid #f1f5f9;

  cursor: pointer;
}


.finance-section-title {
  color: #0f172a;

  font-size: 15px;
  font-weight: 800;
}


.finance-all {
  color: #a1a1aa;

  font-size: 12px;
  font-weight: 700;
}


/*
 * 여기 수정 핵심
 * 바깥 테두리와 첫 카드 사이
 * 좌우 16px 공간 확보
 */
.finance-scroll {
  display: flex;

  gap: 12px;

  padding:
    16px 16px 14px;

  overflow-x: auto;

  scroll-snap-type:
    x mandatory;

  scroll-padding-left:
    16px;

  scrollbar-width: none;
}


.finance-scroll::-webkit-scrollbar {
  display: none;
}


/* 금융 상품 카드 */
.finance-product-card {
  flex:
    0 0 244px;

  min-height: 125px;

  padding: 14px;

  border:
    1px solid #e8edf3;

  border-radius: 16px;

  background: #ffffff;

  scroll-snap-align: start;
}

.finance-empty-card {
  flex: 0 0 244px;
  min-height: 125px;
  padding: 14px;
  border: 1px dashed #e8edf3;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b9097;
  font-size: 13px;
}


.finance-product-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.product-tag {
  padding: 4px 8px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 800;
}


.saving-tag {
  color: #059669;

  background: #ecfdf5;
}


.loan-tag {
  color: #ef4444;

  background: #fff1f2;
}


.investment-tag {
  color: #2563eb;

  background: #eff6ff;
}


.product-rate {
  color: #16a34a;

  font-size: 10px;
  font-weight: 800;
}


.product-dday {
  padding: 3px 7px;

  border-radius: 999px;

  color: #ef4444;

  background: #fff1f2;

  font-size: 9px;
  font-weight: 800;
}


.product-name {
  margin:
    12px 0 2px;

  color: #18181b;

  font-size: 15px;
  font-weight: 800;
}


.product-sub {
  margin: 0;

  color: #a1a1aa;

  font-size: 10.5px;
  font-weight: 600;
}


.product-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-top: 18px;
}


.product-label {
  color: #a1a1aa;

  font-size: 10px;
  font-weight: 600;
}


.product-amount {
  color: #15171b;

  font-size: 15px;
  font-weight: 900;
}


/* =====================================
   금융상품 인디케이터
===================================== */

.indicator {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;
}


.dot {
  width: 6px;
  height: 6px;

  border-radius: 3px;

  background: #e2e8f0;

  transition:
    all 0.2s;
}


.dot.active {
  width: 16px;

  background: #0f172a;
}

/* =====================================
   버튼 공통
===================================== */

button {
  font-family: inherit;
}
</style>