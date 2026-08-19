<template>
  <div class="page">

    <!-- 헤더 -->
    <header class="nav">
      <img
        src="@/assets/icons/icon-back.svg"
        alt=""
        class="back-icon"
        @click="router.push('/parents/home')"
      />

      <h1 class="nav-title">거래 내역</h1>

      <ParentNavActions />
    </header>


    <main class="content">

      <!-- 지갑 카드 -->
      <div class="wallet-card">

        <img
          src="@/assets/logo.svg"
          alt="티니머니 로고"
          class="wallet-logo"
        />

        <div class="wallet-info">

          <p class="wallet-label">
            티니머니 지갑
          </p>

          <p
            v-if="isWalletLoading"
            class="wallet-amount wallet-loading"
          >
            조회 중...
          </p>

          <p
            v-else
            class="wallet-amount"
          >
            {{ walletBalance.toLocaleString() }}원
          </p>

        </div>
      </div>


      <!-- 필터 탭 -->
      <div class="filter-tabs">

        <!-- 전체 -->
        <button
          type="button"
          class="tab"
          :class="{ 'tab-active': selectedType === 'ALL' }"
          @click="changeType('ALL')"
        >
          전체
        </button>

        <!-- 입금 -->
        <button
          type="button"
          class="tab"
          :class="{ 'tab-active': selectedType === 'CREDIT' }"
          @click="changeType('CREDIT')"
        >
          입금
        </button>

        <!-- 출금 -->
        <button
          type="button"
          class="tab"
          :class="{ 'tab-active': selectedType === 'DEBIT' }"
          @click="changeType('DEBIT')"
        >
          출금
        </button>


        <!-- 기간 -->
        <button
          type="button"
          class="tab tab-period"
          :class="{ 'tab-active': isPeriodMenuOpen }"
          @click="togglePeriodMenu"
        >
          <img
            src="@/assets/icons/icon-calendar.svg"
            alt=""
            class="calendar-icon"
          />

          {{ periodLabel }}
        </button>

      </div>


      <!-- 기간 선택 -->
      <div
        v-if="isPeriodMenuOpen"
        class="period-menu"
      >

        <button
          type="button"
          class="period-option"
          :class="{ active: selectedPeriod === 'WEEK' }"
          @click="changePeriod('WEEK')"
        >
          1주
        </button>

        <button
          type="button"
          class="period-option"
          :class="{ active: selectedPeriod === 'MONTH' }"
          @click="changePeriod('MONTH')"
        >
          1개월
        </button>

        <button
          type="button"
          class="period-option"
          :class="{ active: selectedPeriod === 'THREE_MONTHS' }"
          @click="changePeriod('THREE_MONTHS')"
        >
          3개월
        </button>

        <button
          type="button"
          class="period-option"
          :class="{ active: selectedPeriod === 'SIX_MONTHS' }"
          @click="changePeriod('SIX_MONTHS')"
        >
          6개월
        </button>

      </div>


      <!-- 정렬 -->
      <div class="sort-area">
        <button
          type="button"
          class="sort-button"
          @click="toggleSort"
        >
          <span class="sort-label">
            {{ selectedSort === 'DESC' ? '최신순' : '과거순' }}
          </span>
          <svg
            class="sort-switch-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 10l5-5 5 5M7 14l5 5 5-5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>


      <!-- 거래내역 로딩 -->
      <div
        v-if="isTransactionLoading"
        class="state-box"
      >
        거래 내역을 불러오는 중입니다.
      </div>


      <!-- 거래내역 조회 실패 -->
      <div
        v-else-if="transactionError"
        class="state-box error-state"
      >
        <p>
          {{ transactionError }}
        </p>

        <button
          type="button"
          class="retry-button"
          @click="fetchTransactions"
        >
          다시 시도
        </button>
      </div>


      <!-- 거래내역 -->
      <div
        v-else-if="groupedTransactions.length > 0"
        class="transaction-list"
      >

        <div
          v-for="group in groupedTransactions"
          :key="group.date"
          class="transaction-group"
        >

          <p class="date-label">
            {{ group.date }}
          </p>


          <div class="transaction-card">

            <div
              v-for="item in group.items"
              :key="item.id"
              class="transaction-item"
            >

              <div class="transaction-left">

                <p class="transaction-name">
                  {{ item.description || '거래내역' }}
                </p>

                <p class="transaction-meta">
                  {{ formatTime(item.createdAt) }}
                  ·
                  {{ getDirectionLabel(item.direction) }}
                </p>

              </div>


              <div class="transaction-right">

                <p
                  class="transaction-amount"
                  :class="{
                    positive: item.direction === 'CREDIT',
                    negative: item.direction === 'DEBIT'
                  }"
                >
                  {{ getAmountText(item) }}
                </p>

                <p class="transaction-balance">

                  잔액
                  {{ Number(item.balanceAfter || 0).toLocaleString() }}원

                  <img
                    src="@/assets/icons/icon-chevron.svg"
                    alt=""
                    class="chevron-icon"
                  />

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      <!-- 거래내역 없음 -->
      <div
        v-else
        class="state-box"
      >
        조회된 거래 내역이 없습니다.
      </div>

    </main>

    <ParentBottomNav active="home" />

  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import {
  getMyWallet,
  getMyTransactions,
} from '@/api/wallet'


const router = useRouter()
const authStore = useAuthStore()


/* =========================
   지갑 잔액
========================= */

const walletBalance = ref(0)

const isWalletLoading = ref(false)


/* =========================
   거래내역
========================= */

const transactions = ref([])

const isTransactionLoading = ref(false)

const transactionError = ref('')


/* =========================
   필터 상태
========================= */

const selectedType = ref('ALL')

const selectedPeriod = ref('MONTH')

const selectedSort = ref('DESC')

const isPeriodMenuOpen = ref(false)


/* =========================
   기간 이름
========================= */

const periodLabel = computed(() => {

  switch (selectedPeriod.value) {

    case 'WEEK':
      return '1주'

    case 'MONTH':
      return '1개월'

    case 'THREE_MONTHS':
      return '3개월'

    case 'SIX_MONTHS':
      return '6개월'

    default:
      return '기간'
  }

})


/* =========================
   날짜별 그룹핑
========================= */

const groupedTransactions = computed(() => {

  const groups = {}

  transactions.value.forEach((item) => {

    const date =
      formatDate(item.createdAt)

    if (!groups[date]) {

      groups[date] = []

    }

    groups[date].push(item)

  })


  return Object.entries(groups).map(
    ([date, items]) => ({
      date,
      items,
    })
  )

})


/* =========================
   지갑 조회
========================= */

async function fetchWallet() {

  isWalletLoading.value = true

  try {

    if (!authStore.accessToken) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
      return
    }


    const res = await getMyWallet(
      authStore.accessToken
    )


    if (res.success) {

      walletBalance.value =
        res.data.balance ?? 0

    }

  } catch (error) {

    console.error(
      '지갑 조회 실패:',
      error
    )


    if (error.status === 401) {

      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')

    }

  } finally {

    isWalletLoading.value = false

  }

}


/* =========================
   거래내역 조회
========================= */

async function fetchTransactions() {

  isTransactionLoading.value = true

  transactionError.value = ''

  try {

    if (!authStore.accessToken) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
      return
    }


    const res =
      await getMyTransactions(
        authStore.accessToken,
        {
          period:
            selectedPeriod.value,

          sort:
            selectedSort.value,

          type:
            selectedType.value,
        }
      )


    if (res.success) {

      transactions.value =
        res.data || []

    }

  } catch (error) {

    console.error(
      '거래내역 조회 실패:',
      error
    )


    if (error.status === 401) {

      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')

      return

    }


    transactionError.value =
      error.message
      || '거래 내역을 불러오지 못했습니다.'

  } finally {

    isTransactionLoading.value = false

  }

}


/* =========================
   거래 유형 변경
========================= */

function changeType(type) {

  if (
    selectedType.value === type
  ) {
    return
  }

  selectedType.value = type

  fetchTransactions()

}


/* =========================
   기간 선택창
========================= */

function togglePeriodMenu() {

  isPeriodMenuOpen.value =
    !isPeriodMenuOpen.value

}


/* =========================
   기간 변경
========================= */

function changePeriod(period) {

  selectedPeriod.value = period

  isPeriodMenuOpen.value = false

  fetchTransactions()

}


/* =========================
   정렬 변경
========================= */

function toggleSort() {

  selectedSort.value =
    selectedSort.value === 'DESC'
      ? 'ASC'
      : 'DESC'

  fetchTransactions()

}


/* =========================
   금액 표시
========================= */

function getAmountText(item) {

  const amount =
    Math.abs(
      Number(item.amount || 0)
    )


  if (
    item.direction === 'CREDIT'
  ) {

    return `+${amount.toLocaleString()}원`

  }


  if (
    item.direction === 'DEBIT'
  ) {

    return `-${amount.toLocaleString()}원`

  }


  return `${amount.toLocaleString()}원`

}


/* =========================
   거래 종류
========================= */

function getDirectionLabel(direction) {

  if (direction === 'CREDIT') {

    return '입금'

  }

  if (direction === 'DEBIT') {

    return '출금'

  }

  return '거래'

}


/* =========================
   날짜 포맷
========================= */

function formatDate(createdAt) {

  if (!createdAt) {
    return ''
  }


  const date =
    new Date(createdAt)


  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getDate()
    ).padStart(2, '0')


  return `${year}.${month}.${day}`

}


/* =========================
   시간 포맷
========================= */

function formatTime(createdAt) {

  if (!createdAt) {
    return ''
  }


  const date =
    new Date(createdAt)


  const hour =
    String(
      date.getHours()
    ).padStart(2, '0')


  const minute =
    String(
      date.getMinutes()
    ).padStart(2, '0')


  return `${hour}:${minute}`

}


/* =========================
   화면 진입
========================= */

onMounted(() => {

  fetchWallet()

  fetchTransactions()

})
</script>


<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}


/* =========================
   전체 화면
========================= */

.page {
  position: relative;

  width: 360px;
  min-height: 100dvh;

  margin: 0 auto;

  padding-bottom: 85px;

  color: #191b1e;

  background: #f8fafc;
}


/* =========================
   헤더
========================= */

.nav {
  position: relative;

  display: flex;

  align-items: center;
  justify-content: space-between;

  height: 64px;

  padding: 0 20px 4px;

  border-bottom: 1px solid #f0f1f3;

  background-color: #ffffff;
}

.back-icon {
  width: 24px;
  height: 24px;

  cursor: pointer;
}

.nav-title {
  position: absolute;

  left: 50%;

  margin: 0;

  font-size: 18px;
  font-weight: 700;

  transform: translateX(-50%);
}

.alarm-btn {
  display: flex;

  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}

.alarm-icon {
  width: 24px;
  height: 24px;
}


/* =========================
   내용
========================= */

.content {
  padding: 10px 16px 30px;
}


/* =========================
   지갑
========================= */

.wallet-card {
  display: flex;

  align-items: center;

  gap: 14px;

  padding: 18px;

  border-radius: 16px;

  background-color: #ffffff;

  border: 1px solid #eaedf1;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.wallet-logo {
  width: 48px;
  height: 48px;

  object-fit: contain;
}

.wallet-info {
  display: flex;

  flex-direction: column;

  gap: 4px;
}

.wallet-label {
  margin: 0;

  color: #8b9097;

  font-size: 12px;
}

.wallet-amount {
  margin: 0;

  color: #191b1e;

  font-size: 23px;
  font-weight: 800;
}

.wallet-loading {
  color: #8b9097;

  font-size: 15px;
}


/* =========================
   필터
========================= */

.filter-tabs {
  display: flex;

  gap: 7px;

  margin-top: 18px;

  overflow-x: auto;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  flex-shrink: 0;

  height: 34px;

  padding: 0 13px;

  border: 1px solid #e0e3e7;

  border-radius: 18px;

  color: #8b9097;

  font-size: 12px;
  font-weight: 600;

  background-color: #ffffff;

  cursor: pointer;
}

.tab-active {
  border-color: #ffbc00;

  color: #191b1e;

  background-color: #ffbc00;
}

.tab-period {
  display: flex;

  align-items: center;

  gap: 5px;
}

.calendar-icon {
  width: 15px;
  height: 15px;
}


/* =========================
   기간 메뉴
========================= */

.period-menu {
  display: flex;

  gap: 7px;

  margin-top: 10px;

  padding: 10px;

  border-radius: 10px;

  background-color: #ffffff;
}

.period-option {
  flex: 1;

  height: 32px;

  border: none;

  border-radius: 7px;

  color: #8b9097;

  font-size: 11px;

  background-color: #f4f5f7;

  cursor: pointer;
}

.period-option.active {
  color: #191b1e;

  font-weight: 700;

  background-color: #ffbc00;
}


/* =========================
   정렬
========================= */

.sort-area {
  display: flex;

  justify-content: flex-end;

  margin: 13px 2px 8px;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  padding: 4px 6px;

  border: none;

  color: #8b9097;

  font-size: 11px;

  background: transparent;

  cursor: pointer;
}

.sort-label {
  line-height: 1;
}

.sort-switch-icon {
  flex-shrink: 0;
  color: #8b9097;
}


/* =========================
   거래 그룹
========================= */

.transaction-list {
  display: flex;

  flex-direction: column;

  gap: 18px;
}

.transaction-group {
  width: 100%;
}

.date-label {
  margin: 0 0 8px 3px;

  color: #8b9097;

  font-size: 12px;
  font-weight: 600;
}

.transaction-card {
  overflow: hidden;

  border-radius: 16px;

  background-color: #ffffff;

  border: 1px solid #eaedf1;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}


/* =========================
   거래 항목
========================= */

.transaction-item {
  display: flex;

  align-items: center;
  justify-content: space-between;

  min-height: 76px;

  padding: 14px;

  border-bottom:
    1px solid #f0f1f3;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-left {
  min-width: 0;
}

.transaction-name {
  margin: 0 0 5px;

  overflow: hidden;

  max-width: 140px;

  color: #191b1e;

  font-size: 14px;
  font-weight: 700;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-meta {
  margin: 0;

  color: #8b9097;

  font-size: 10px;
}

.transaction-right {
  flex-shrink: 0;

  margin-left: 10px;

  text-align: right;
}

.transaction-amount {
  margin: 0 0 5px;

  font-size: 14px;
  font-weight: 700;
}

.transaction-amount.positive {
  color: #3178c6;
}

.transaction-amount.negative {
  color: #ef4444;
}

.transaction-balance {
  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 2px;

  margin: 0;

  color: #8b9097;

  font-size: 10px;
}

.chevron-icon {
  width: 14px;
  height: 14px;
}


/* =========================
   상태
========================= */

.state-box {
  margin-top: 12px;

  padding: 60px 16px;

  border-radius: 14px;

  color: #8b9097;

  font-size: 13px;

  text-align: center;

  background-color: #ffffff;
}

.error-state {
  color: #d14343;
}

.error-state p {
  margin: 0;
}

.retry-button {
  margin-top: 13px;

  padding: 8px 14px;

  border: none;

  border-radius: 7px;

  color: #191b1e;

  font-size: 12px;
  font-weight: 700;

  background-color: #ffbc00;

  cursor: pointer;
}



</style>