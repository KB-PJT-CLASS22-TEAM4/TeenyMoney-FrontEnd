<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">잔액 부족</h1>
      <ParentNavActions />
    </header>

    <div class="content">
      <img src="@/assets/logo.svg" alt="" class="logo" />
      <h2 class="title">잔액이 부족합니다</h2>
      <p class="desc">현재 지갑의 잔액이 보낼 금액보다 적습니다.<br />결제 수단을 변경하거나 충전해 주세요.</p>

      <div class="balance-card">
        <p
          v-if="isLoading"
          class="bank-name"
        >
          결제수단을 불러오는 중...
        </p>
        <template v-else>
          <p class="bank-name">
            {{ paymentName }}
          </p>
          <p class="account-number">
            {{ paymentNumber }}
          </p>
        </template>
        <div class="balance-row">
          <span class="balance-label">현재 잔액</span>
          <span class="balance-amount">
            {{ isLoading ? '조회 중...' : `${Number(walletBalance || 0).toLocaleString()}원` }}
          </span>
        </div>
      </div>

      <button class="btn btn-secondary" type="button" @click="router.push('/parents/payment/change')">결제수단 변경하기</button>
      <button class="btn btn-primary" type="button" @click="router.push('/parents/charge')">금액 충전하기</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import { useAuthStore } from '@/stores/auth'
import { getChargeMethods } from '@/api/charge'
import { getMyWallet } from '@/api/wallet'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const walletBalance = ref(0)
const paymentName = ref('등록된 결제수단 없음')
const paymentNumber = ref('-')

function pickCurrentMethod(methods) {
  const list = Array.isArray(methods) ? methods : []
  const usable = list.filter(
    (method) => method.type === 'CARD' && method.status === 'ACTIVE'
  )
  return usable.find((method) => method.primary) || usable[0] || null
}

function getPaymentName(payment) {
  if (!payment) return '등록된 결제수단 없음'
  return payment.cardCompany || payment.bankName || payment.accountBank || '카드'
}

function getPaymentNumber(payment) {
  if (!payment) return '-'
  return payment.maskedCardNumber || payment.accountNumber || '-'
}

onMounted(async () => {
  if (!authStore.accessToken) {
    isLoading.value = false
    return
  }

  try {
    const [methodsRes, walletRes] = await Promise.allSettled([
      getChargeMethods(authStore.accessToken),
      getMyWallet(authStore.accessToken),
    ])

    if (methodsRes.status === 'fulfilled') {
      const method = pickCurrentMethod(methodsRes.value.data)
      paymentName.value = getPaymentName(method)
      paymentNumber.value = getPaymentNumber(method)
    }

    if (walletRes.status === 'fulfilled') {
      walletBalance.value = walletRes.value.data?.balance ?? 0
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;

}

.back-btn, .alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon, .alarm-icon { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 16px;
  padding: 32px 20px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.logo {
  width: 64px;
  height: 64px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #191b1e;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
  text-align: center;
  line-height: 1.6;
}

.balance-card {
  width: 100%;
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0;
}

.bank-name {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.account-number {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8b9097;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 16px;
  font-weight: 600;
  color: #191b1e;
}

.balance-amount {
  font-size: 22px;
  font-weight: 700;
  color: #191b1e;
}

.btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background-color: #f4f5f7;
  color: #191b1e;
}
</style>
