<template>
  <div class="parent-home">
    <div class="scroll-area">

      <section class="hero-section">
        <header class="top-nav">
          <div class="brand">
            <img src="@/assets/logo.svg" class="brand-logo" alt="티니머니" />
            <span class="brand-title">티니머니</span>
          </div>

          <ParentNavActions />
        </header>

        <div class="hero-body">
          <div class="hero-text">
            <h2 class="hero-title">
              안녕하세요!<br />
              <span class="highlight-blue">
                {{ authStore.name ? `${authStore.name}님` : '보호자님' }}
              </span>
            </h2>
            <p class="hero-sub">티니와 함께 자녀의 금융 생활을 관리해 보세요</p>
          </div>

          <div class="hero-mascot-wrap" aria-hidden="true">
            <img :src="parentMascot" class="hero-mascot" alt="" />
            <div class="mascot-shadow"></div>
          </div>
        </div>
      </section>

      <section class="wallet-section">
        <div class="wallet-card">
          <div class="wallet-main">
            <p class="wallet-label">티니머니</p>

            <div class="wallet-row">
              <img
                src="@/assets/logo.svg"
                alt="티니머니 로고"
                class="wallet-logo"
              />

              <p
                v-if="isWalletLoading"
                class="wallet-amount loading-text"
              >
                조회 중...
              </p>

              <p
                v-else-if="walletError"
                class="wallet-amount error-text"
              >
                조회 실패
              </p>

              <p
                v-else
                class="wallet-amount"
              >
                {{ wallet.balance.toLocaleString() }}원
              </p>
            </div>
          </div>

          <div class="wallet-btns">
            <button
              class="btn-pill btn-yellow"
              type="button"
              @click="router.push('/parents/charge')"
            >
              충전
            </button>

            <button
              class="btn-pill btn-gray"
              type="button"
              @click="router.push('/parents/send-allowance')"
            >
              용돈 지급
            </button>
          </div>
        </div>
      </section>

      <section class="allowance-section">
        <button
          class="allowance-card"
          type="button"
          @click="router.push({ name: 'parents-request-list' })"
        >
          <div class="allowance-left">
            <div class="allowance-icon-wrap">
              <img
                src="@/assets/icons/icon-notification.svg"
                alt=""
                class="clock-icon"
              />
              <span
                v-if="requests.length"
                class="request-badge"
              >
                {{ requests.length > 9 ? '9+' : requests.length }}
              </span>
            </div>

            <div>
              <p class="allowance-main">요청 목록 확인하기</p>
            </div>
          </div>

          <span class="chev">›</span>
        </button>
      </section>

      <section class="history">
        <div class="history-head">
          <span class="history-title">최근 이용내역</span>

          <button
            type="button"
            class="more-button"
            aria-label="전체 거래내역 보기"
            @click="router.push('/parents/transaction')"
          >
            <span class="chev">›</span>
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

        <div
          v-else-if="recentTransactions.length > 0"
        >
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
                잔액 : {{ item.balanceAfter.toLocaleString() }}원
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
        </div>

      </section>
    </div>

    <ParentBottomNav active="home" />
  </div>
</template>


<script setup>
import {
  onActivated,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyWallet } from '@/api/wallet'
import { useParentRequests } from '@/composables/useParentRequests'
import { PARENT_PROFILE_IMAGE } from '@/utils/profileImages'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

const router = useRouter()
const authStore = useAuthStore()

const {
  requests,
  fetchPendingRequests,
} = useParentRequests()

const parentMascot = PARENT_PROFILE_IMAGE

const isWalletLoading = ref(false)
const walletError = ref('')

const wallet = reactive({
  walletId: null,
  balance: 0,
  updatedAt: '',
})

const recentTransactions = ref([])

async function fetchWallet() {
  isWalletLoading.value = true
  walletError.value = ''

  try {
    if (!authStore.accessToken) {
      walletError.value = '로그인이 필요합니다.'
      return
    }

    const res = await getMyWallet(authStore.accessToken)

    if (res.success) {
      wallet.walletId = res.data.walletId
      wallet.balance = res.data.balance ?? 0
      wallet.updatedAt = res.data.updatedAt || ''
      recentTransactions.value = res.data.recentTransactions || []
    }
  } catch (error) {
    console.error('지갑 정보 조회 실패:', error)

    if (error.status === 401) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
      return
    }

    walletError.value =
      error.message || '지갑 정보를 불러오지 못했습니다.'
  } finally {
    isWalletLoading.value = false
  }
}

function getAmountText(item) {
  const amount = Math.abs(Number(item.amount || 0))

  if (item.direction === 'CREDIT') {
    return `+${amount.toLocaleString()} 원`
  }

  if (item.direction === 'DEBIT') {
    return `-${amount.toLocaleString()} 원`
  }

  return `${Number(item.amount || 0).toLocaleString()} 원`
}

function formatTransactionDate(createdAt) {
  if (!createdAt) {
    return ''
  }

  const date = new Date(createdAt)

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(() => {
  fetchWallet()
  fetchPendingRequests()
})

onActivated(() => {
  fetchPendingRequests()
})
</script>


<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.parent-home {
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  color: #191b1e;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
  scrollbar-width: none;
}

.scroll-area::-webkit-scrollbar {
  display: none;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 36px 18px 28px;
  background: linear-gradient(180deg, #eef7ff 0%, #fffbe8 100%);
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
}

.hero-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.hero-text {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 0;
}

.hero-mascot-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 118px;
  height: 118px;
  overflow: hidden;
  pointer-events: none;
}

.hero-mascot {
  width: 100%;
  height: 100%;
  max-width: 118px;
  max-height: 118px;
  object-fit: contain;
  object-position: bottom center;
}

.mascot-shadow {
  width: 72px;
  height: 8px;
  margin-top: -10px;
  border-radius: 50%;
  background: rgba(220, 190, 80, 0.28);
  filter: blur(4px);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-logo {
  width: 26px;
  height: 26px;
}

.brand-title {
  font-size: 17px;
  font-weight: 900;
  color: #1c1e22;
}

.bell-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.bell-icon {
  width: 22px;
  height: 22px;
}

.hero-title {
  margin: 0 0 6px;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.35;
  color: #191b1e;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}

.highlight-blue {
  color: #2563eb;
}

.hero-sub {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #71717a;
}

.wallet-section {
  position: relative;
  z-index: 2;
  margin-top: -10px;
  padding: 0 18px;
}

.wallet-card {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.wallet-main {
  min-width: 0;
}

.wallet-label {
  margin: 0 0 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: #71717a;
}

.wallet-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wallet-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.wallet-amount {
  margin: 0;
  min-width: 0;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-text {
  font-size: 14px;
  font-weight: 700;
  color: #8b9097;
}

.error-text {
  font-size: 14px;
  font-weight: 700;
  color: #d14343;
}

.wallet-btns {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
}

.btn-pill {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
}

.btn-yellow {
  background: #facc15;
  color: #18181b;
}

.btn-gray {
  background: #f4f4f5;
  color: #27272a;
}

.allowance-section {
  padding: 16px 18px 0;
}

.allowance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.allowance-left {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.allowance-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #fff8e6;
}

.clock-icon {
  width: 22px;
  height: 22px;
}

.allowance-main {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.request-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #ff4d4f;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  border: 1.5px solid #ffffff;
  box-sizing: border-box;
}

.chev {
  font-size: 18px;
  color: #a1a1aa;
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
</style>
