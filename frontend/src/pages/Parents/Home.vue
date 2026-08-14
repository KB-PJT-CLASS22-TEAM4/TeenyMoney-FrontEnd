<template>
  <div class="page">

    <!-- 헤더 -->
    <header class="nav">
      <h1 class="nav-title">
        {{ authStore.name ? `${authStore.name}님` : '티니머니' }}
      </h1>

      <button
        class="alarm-btn"
        type="button"
        aria-label="알림"
      >
        <img
          src="@/assets/icons/icon-notification.svg"
          alt=""
          class="alarm-icon"
        />
      </button>
    </header>

    <main class="content">

      <!-- 지갑 카드 -->
      <div class="wallet-card">

        <p class="wallet-label">
          티니머니
        </p>

        <div class="wallet-row">

          <img
            src="@/assets/logo.svg"
            alt="티니머니 로고"
            class="wallet-logo"
          />

          <!-- 지갑 로딩 -->
          <p
            v-if="isWalletLoading"
            class="wallet-amount loading-text"
          >
            조회 중...
          </p>

          <!-- 지갑 조회 실패 -->
          <p
            v-else-if="walletError"
            class="wallet-amount error-text"
          >
            조회 실패
          </p>

          <!-- 잔액 -->
          <p
            v-else
            class="wallet-amount"
          >
            {{ wallet.balance.toLocaleString() }}원
          </p>

        </div>

        <div class="wallet-btns">

          <button
            class="btn btn-primary"
            type="button"
            @click="router.push('/parents/charge')"
          >
            충전
          </button>

          <button
            class="btn btn-secondary"
            type="button"
            @click="router.push('/parents/send-allowance')"
          >
            용돈 지급
          </button>

        </div>

      </div>


      <!-- 정기 용돈 설정 -->
      <div class="section">

        <h2 class="section-title">
          정기 용돈 설정
        </h2>

        <button
          class="allowance-card"
          type="button"
          @click="router.push('/parents/regular-allowance')"
        >

          <div class="allowance-left">

            <img
              src="@/assets/icons/icon-clock.svg"
              alt=""
              class="clock-icon"
            />

            <div>
              <p class="allowance-main">
                매월 1일 지급
              </p>

              <p class="allowance-sub">
                100,000원 자동 충전
              </p>
            </div>

          </div>

          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="chevron-icon"
          />

        </button>

      </div>


      <!-- 최근 이용내역 -->
      <div class="section">

        <div class="section-header">

          <h2 class="section-title">
            최근 이용내역
          </h2>

          <button
            type="button"
            class="more-button"
            aria-label="전체 거래내역 보기"
            @click="router.push('/parents/transaction')"
          >
            <img
              src="@/assets/icons/icon-chevron.svg"
              alt=""
              class="chevron-icon"
            />
          </button>

        </div>


        <!-- 거래내역 로딩 -->
        <div
          v-if="isWalletLoading"
          class="transaction-state"
        >
          거래내역을 불러오는 중입니다.
        </div>


        <!-- 거래내역 에러 -->
        <div
          v-else-if="walletError"
          class="transaction-state error-message"
        >
          <p>
            {{ walletError }}
          </p>

          <button
            type="button"
            class="retry-button"
            @click="fetchWallet"
          >
            다시 시도
          </button>
        </div>


        <!-- 거래내역 있음 -->
        <template
          v-else-if="recentTransactions.length > 0"
        >

          <div
            v-for="item in recentTransactions"
            :key="item.id"
            class="transaction-item"
          >

            <div class="transaction-left">

              <p class="transaction-date">
                {{ formatTransactionDate(item.createdAt) }}
              </p>

              <p class="transaction-name">
                {{ item.description || '거래내역' }}
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
                잔액 :
                {{ item.balanceAfter.toLocaleString() }}원
              </p>

            </div>

          </div>

        </template>


        <!-- 거래내역 없음 -->
        <div
          v-else
          class="transaction-state"
        >
          최근 이용내역이 없습니다.
        </div>

      </div>

    </main>

    <ParentBottomNav active="home" />

  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'

import {
  onMounted,
  reactive,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyWallet } from '@/api/wallet'


const router = useRouter()
const authStore = useAuthStore()



// 지갑 상태
const isWalletLoading = ref(false)
const walletError = ref('')

const wallet = reactive({
  walletId: null,
  balance: 0,
  updatedAt: '',
})



// 최근 거래 내역
const recentTransactions = ref([])



// 최근 거래 조회
async function fetchWallet() {

  isWalletLoading.value = true
  walletError.value = ''

  try {

    // Pinia Access Token 확인
    if (!authStore.accessToken) {

      walletError.value =
        '로그인이 필요합니다.'

      return
    }


    // GET /api/v1/wallet/me
    const res = await getMyWallet(
      authStore.accessToken
    )


    if (res.success) {

      wallet.walletId =
        res.data.walletId

      wallet.balance =
        res.data.balance ?? 0

      wallet.updatedAt =
        res.data.updatedAt || ''


      /* Swagger 응답의 recentTransactions 그대로 저장 */
      recentTransactions.value =
        res.data.recentTransactions || []

    }

  } catch (error) {

    console.error(
      '지갑 정보 조회 실패:',
      error
    )


    // Access Token 만료 시
    if (error.status === 401) {

      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')

      return
    }


    walletError.value =
      error.message
      || '지갑 정보를 불러오지 못했습니다.'

  } finally {

    isWalletLoading.value = false

  }

}



// 거래 금액 표시
function getAmountText(item) {

  const amount =
    Math.abs(Number(item.amount || 0))

  
  // CREDIT(+) / DEBIT(-) 표시
  if (item.direction === 'CREDIT') {

    return `+${amount.toLocaleString()} 원`

  }


  if (item.direction === 'DEBIT') {

    return `-${amount.toLocaleString()} 원`

  }


  /* 혹시 direction 값이 없을 경우 */
  return `${Number(item.amount || 0).toLocaleString()} 원`

}



// 거래 시간 표시
function formatTransactionDate(createdAt) {

  if (!createdAt) {
    return ''
  }


  const date =
    new Date(createdAt)

  // Intl.DateTimeFormat을 사용하여 한국 시간대에 맞게 포맷팅
  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(date)

}



// 화면 최초 진입 시
onMounted(() => {

  fetchWallet()

})
</script>


<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}



/* 전체 화면 */
.page {
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 80px;
  color: #191b1e;
  background-color : white;
}


/* 헤더 */
.nav {
  display: flex;

  align-items: center;
  justify-content: space-between;

  height: 64px;

  padding: 10px 20px 4px;
}

.nav-title {
  margin: 0;

  font-size: 18px;
  font-weight: 700;

  color: #191b1e;
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



/* 콘텐츠 */
.content {
  display: flex;

  flex-direction: column;

  gap: 20px;

  padding: 14px 16px 30px;
}



/* 지갑 카드 */
.wallet-card {
  padding: 18px 16px;

  border-radius: 16px;

  background-color: #ffffff;
}

.wallet-label {
  margin: 0 0 12px;

  color: #8b9097;

  font-size: 13px;
  font-weight: 600;
}

.wallet-row {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 18px;
}

.wallet-logo {
  width: 38px;
  height: 38px;

  object-fit: contain;
}

.wallet-amount {
  margin: 0;

  color: #191b1e;

  font-size: 25px;
  font-weight: 800;
}

.loading-text {
  color: #8b9097;

  font-size: 16px;
}

.error-text {
  color: #d14343;

  font-size: 16px;
}

.wallet-btns {
  display: flex;

  gap: 8px;
}

.btn {
  flex: 1;

  height: 42px;

  border: none;

  border-radius: 8px;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
}

.btn-primary {
  color: #191b1e;

  background-color: #ffbc00;
}

.btn-secondary {
  color: #191b1e;

  background-color: #f4f5f7;
}



/* 공통 섹션 */
.section {
  width: 100%;
}

.section-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 10px;
}

.section-title {
  margin: 0 0 10px 4px;

  color: #191b1e;

  font-size: 15px;
  font-weight: 700;
}

.section-header .section-title {
  margin-bottom: 0;
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



/* 정기 용돈 */
.allowance-card {
  display: flex;

  align-items: center;
  justify-content: space-between;

  width: 100%;

  padding: 16px;

  border: none;

  border-radius: 16px;

  background-color: #ffffff;

  cursor: pointer;
}

.allowance-left {
  display: flex;

  align-items: center;

  gap: 12px;

  text-align: left;
}

.clock-icon {
  width: 32px;
  height: 32px;
}

.allowance-main {
  margin: 0 0 4px;

  color: #191b1e;

  font-size: 14px;
  font-weight: 700;
}

.allowance-sub {
  margin: 0;

  color: #8b9097;

  font-size: 12px;
}

.chevron-icon {
  width: 20px;
  height: 20px;
}



/* 거래 내역 */
.transaction-item {
  display: flex;

  align-items: center;
  justify-content: space-between;

  min-height: 76px;

  padding: 14px 14px;

  border-bottom: 1px solid #f0f1f3;

  background-color: #ffffff;
}

.transaction-item:first-of-type {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.transaction-item:last-of-type {
  border-bottom: none;

  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 16px;
}

.transaction-left {
  min-width: 0;
}

.transaction-date {
  margin: 0 0 5px;

  color: #8b9097;

  font-size: 10px;
}

.transaction-name {
  margin: 0;

  color: #191b1e;

  font-size: 14px;
  font-weight: 700;
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
  color: #191b1e;
}

.transaction-balance {
  margin: 0;

  color: #8b9097;

  font-size: 10px;
}

.transaction-state {
  padding: 40px 16px;

  border-radius: 16px;

  color: #8b9097;

  font-size: 13px;

  text-align: center;

  background-color: #ffffff;
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

  border-radius: 7px;

  color: #191b1e;

  font-size: 12px;
  font-weight: 700;

  background-color: #ffbc00;

  cursor: pointer;
}


</style>