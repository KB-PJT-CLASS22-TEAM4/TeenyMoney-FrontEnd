<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">충전</h1>

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

    <div class="content">
      <!-- 현재 잔액 -->
      <div class="account-card">
        <p class="balance-label">
          현재 잔액
        </p>

        <p class="balance-amount">
          {{ walletBalance.toLocaleString() }}
          <span class="won">
            원
          </span>
        </p>
      </div>

      <!-- 충전 금액 -->
      <div class="charge-section">
        <p class="section-label">
          충전할 금액
        </p>

        <div class="amount-input-wrap">
          <input
            v-model="chargeAmount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />

          <span class="won-unit">
            원
          </span>
        </div>

        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            type="button"
            class="quick-btn"
            @click="addQuickAmount(quick.value)"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>

      <!-- 카드 선택 -->
      <div class="payment-method-section">
        <p class="section-label">
          결제 카드
        </p>

        <!-- 선택된 카드 -->
        <button
          type="button"
          class="payment-selector"
          :class="{ opened: isPaymentOpen }"
          @click="togglePaymentList"
        >
          <div
            v-if="selectedPaymentMethod"
            class="selected-payment-info"
          >
            <div class="payment-icon-wrap">
              <img
                src="@/assets/logo.svg"
                alt=""
                class="payment-icon"
              />
            </div>

            <div class="selected-payment-text">
              <div class="payment-name-row">
                <p class="payment-name">
                  {{
                    getPaymentName(
                      selectedPaymentMethod
                    )
                  }}
                </p>

                <span
                  v-if="
                    selectedPaymentMethod.primary
                  "
                  class="primary-badge"
                >
                  주 결제수단
                </span>
              </div>

              <p class="payment-number">
                {{
                  getPaymentNumber(
                    selectedPaymentMethod
                  )
                }}
              </p>
            </div>
          </div>

          <!-- 카드 없음 -->
          <div
            v-else
            class="payment-placeholder-wrap"
          >
            <div class="payment-icon-wrap">
              <img
                src="@/assets/logo.svg"
                alt=""
                class="payment-icon"
              />
            </div>

            <span class="payment-placeholder">
              카드를 선택해주세요
            </span>
          </div>

          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="payment-chevron"
            :class="{ open: isPaymentOpen }"
          />
        </button>

        <!-- 카드 목록 -->
        <div
          v-if="isPaymentOpen"
          class="payment-dropdown"
        >
          <div
            v-if="isMethodLoading"
            class="payment-state"
          >
            카드를 불러오는 중...
          </div>

          <div
            v-else-if="
              paymentMethods.length === 0
            "
            class="payment-state"
          >
            등록된 카드가 없습니다.
          </div>

          <template v-else>
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              type="button"
              class="payment-option"
              :class="{
                selected:
                  selectedMethodId === method.id
              }"
              @click="
                selectPaymentMethod(method.id)
              "
            >
              <div class="payment-info">
                <div class="payment-icon-wrap">
                  <img
                    src="@/assets/logo.svg"
                    alt=""
                    class="payment-icon"
                  />
                </div>

                <div class="payment-text">
                  <div class="payment-name-row">
                    <p class="payment-name">
                      {{ getPaymentName(method) }}
                    </p>

                    <span
                      v-if="method.primary"
                      class="primary-badge"
                    >
                      주 결제수단
                    </span>
                  </div>

                  <p class="payment-number">
                    {{ getPaymentNumber(method) }}
                  </p>
                </div>
              </div>

              <div
                class="radio"
                :class="{
                  active:
                    selectedMethodId === method.id
                }"
              >
                <div
                  v-if="
                    selectedMethodId === method.id
                  "
                  class="radio-dot"
                ></div>
              </div>
            </button>
          </template>
        </div>

        <!-- 카드 관리 -->
        <button
          type="button"
          class="payment-manage-btn"
          @click="goToPaymentChange"
        >
          <span>
            카드 추가/삭제하기
          </span>

          <span class="payment-manage-arrow">
            ›
          </span>
        </button>
      </div>

      <!-- 자동 충전 -->
      <button
        type="button"
        class="auto-charge-banner"
        @click="goToAutoCharge"
      >
        <div class="banner-left">
          <div>
            <p class="banner-title">
              자동 충전 설정
            </p>

            <p class="banner-desc">
              잔액 부족 시 자동으로 충전
            </p>
          </div>
        </div>

        <img
          src="@/assets/icons/icon-chevron.svg"
          alt=""
          class="chevron-icon"
        />
      </button>

      <!-- 충전 -->
      <button
        class="submit-btn"
        type="button"
        :disabled="isChargeDisabled"
        @click="handleCharge"
      >
        {{
          isCharging
            ? '충전 중...'
            : '+ 충전하기'
        }}
      </button>
    </div>

    <ParentBottomNav active="home" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import {
  getChargeMethods,
  chargeWallet,
} from '@/api/charge'

import { getMyWallet } from '@/api/wallet'

const router = useRouter()
const authStore = useAuthStore()

const walletBalance = ref(0)

const chargeAmount = ref('')

const paymentMethods = ref([])

const selectedMethodId = ref(null)

const isPaymentOpen = ref(false)

const isMethodLoading = ref(false)

const isCharging = ref(false)

const quickAmounts = [
  {
    label: '+1만',
    value: 10000,
  },
  {
    label: '+3만',
    value: 30000,
  },
  {
    label: '+5만',
    value: 50000,
  },
  {
    label: '+10만',
    value: 100000,
  },
]

const selectedPaymentMethod = computed(() => {
  return (
    paymentMethods.value.find(
      (method) =>
        method.id === selectedMethodId.value
    ) ?? null
  )
})

const isChargeDisabled = computed(() => {
  return (
    !chargeAmount.value ||
    Number(chargeAmount.value) <= 0 ||
    !selectedMethodId.value ||
    !selectedPaymentMethod.value ||
    isCharging.value
  )
})

onMounted(async () => {
  await Promise.all([
    loadWallet(),
    loadPaymentMethods(),
  ])
})

async function loadWallet() {
  try {
    const res = await getMyWallet(
      authStore.accessToken
    )

    if (res.success) {
      walletBalance.value =
        res.data?.balance ?? 0
    }
  } catch (error) {
    console.error(
      '지갑 잔액 조회 실패:',
      error
    )
  }
}

async function loadPaymentMethods() {
  isMethodLoading.value = true

  try {
    const res = await getChargeMethods(
      authStore.accessToken
    )

    if (res.success) {
      /*
       * CARD이면서 ACTIVE인 결제수단만 사용
       * ACCOUNT / INACTIVE 모두 제외
       */
      paymentMethods.value = (
        res.data ?? []
      ).filter(
        (method) =>
          method.type === 'CARD' &&
          method.status === 'ACTIVE'
      )

      const primary =
        paymentMethods.value.find(
          (method) => method.primary
        )

      if (primary) {
        selectedMethodId.value =
          primary.id
      } else if (
        paymentMethods.value.length > 0
      ) {
        selectedMethodId.value =
          paymentMethods.value[0].id
      } else {
        selectedMethodId.value = null
      }
    }
  } catch (error) {
    console.error(
      '카드 목록 조회 실패:',
      error
    )

    paymentMethods.value = []
    selectedMethodId.value = null
  } finally {
    isMethodLoading.value = false
  }
}

function getPaymentName(payment) {
  if (!payment) return ''

  return payment.cardCompany || '카드'
}

function getPaymentNumber(payment) {
  if (!payment) return ''

  return payment.maskedCardNumber || ''
}

function addQuickAmount(amount) {
  chargeAmount.value =
    (Number(chargeAmount.value) || 0) +
    amount
}

function togglePaymentList() {
  isPaymentOpen.value =
    !isPaymentOpen.value
}

function selectPaymentMethod(methodId) {
  const method =
    paymentMethods.value.find(
      (item) => item.id === methodId
    )

  if (!method) {
    alert(
      '사용할 수 없는 카드입니다.'
    )
    return
  }

  selectedMethodId.value = methodId
  isPaymentOpen.value = false
}

function goToPaymentChange() {
  router.push(
    '/parents/payment/change'
  )
}

function goToAutoCharge() {
  router.push(
    '/parents/charge/auto'
  )
}

async function handleCharge() {
  if (isCharging.value) {
    return
  }

  if (
    !chargeAmount.value ||
    Number(chargeAmount.value) <= 0
  ) {
    alert(
      '충전할 금액을 입력해주세요.'
    )
    return
  }

  if (!selectedMethodId.value) {
    alert(
      '충전에 사용할 카드를 선택해주세요.'
    )
    return
  }

  const selectedMethod =
    paymentMethods.value.find(
      (method) =>
        method.id ===
        selectedMethodId.value
    )

  if (!selectedMethod) {
    alert(
      '선택한 카드를 찾을 수 없습니다.'
    )

    await loadPaymentMethods()
    return
  }

  if (
    selectedMethod.type !== 'CARD' ||
    selectedMethod.status !== 'ACTIVE'
  ) {
    alert(
      '사용할 수 없는 카드입니다.'
    )

    await loadPaymentMethods()
    return
  }

  isCharging.value = true

  try {
    const res = await chargeWallet(
      authStore.accessToken,
      Number(chargeAmount.value),
      selectedMethod.id
    )

    if (res.success) {
      router.push({
        path:
          '/parents/charge/complete',

        query: {
          amount:
            chargeAmount.value,
        },
      })
    }
  } catch (error) {
    console.error(
      '충전 실패:',
      error
    )

    await loadPaymentMethods()

    alert(
      error.message ||
        '충전에 실패했습니다.'
    )
  } finally {
    isCharging.value = false
  }
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
  box-sizing: border-box;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn,
.alarm-btn {
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon,
.alarm-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
}

.account-card {
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 16px;
  box-sizing: border-box;
}

.balance-label {
  margin: 0 0 8px;
  font-size: 13px;
  color: #8b9097;
}

.balance-amount {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #191b1e;
}

.won {
  margin-left: 2px;
  font-size: 20px;
  font-weight: 500;
}

.charge-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.amount-input-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background-color: #ffffff;
  border-radius: 10px;
  box-sizing: border-box;
}

.amount-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  text-align: right;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
  -moz-appearance: textfield;
}

.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input::placeholder {
  color: #b9bec5;
}

.won-unit {
  font-size: 16px;
  font-weight: 500;
  color: #191b1e;
}

.quick-btns {
  width: 100%;
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.payment-method-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-selector {
  width: 100%;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1.5px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  transition: 0.2s ease;
}

.payment-selector.opened {
  border-color: #e8e9eb;
  border-radius: 14px 14px 8px 8px;
}

.selected-payment-info,
.payment-placeholder-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-payment-text,
.payment-text {
  min-width: 0;
}

.payment-icon-wrap {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f5f7;
  border-radius: 10px;
}

.payment-icon {
  width: 22px;
  height: 22px;
}

.payment-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.payment-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-number {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.primary-badge {
  flex-shrink: 0;
  padding: 3px 6px;
  background-color: #fff3c4;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #a86f00;
}

.payment-placeholder {
  font-size: 14px;
  font-weight: 500;
  color: #8b9097;
}

.payment-chevron {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.payment-chevron.open {
  transform: rotate(90deg);
}

.payment-dropdown {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  margin-top: -4px;
  background-color: #ffffff;
  border: 1px solid #e8e9eb;
  border-radius: 8px 8px 14px 14px;
  box-sizing: border-box;
}

.payment-option {
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
}

.payment-option:hover {
  background-color: #f7f7f8;
}

.payment-option.selected {
  background-color: #fff8e1;
}

.payment-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-state {
  padding: 20px 12px;
  text-align: center;
  font-size: 13px;
  color: #8b9097;
}

.radio {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d9dce1;
  border-radius: 50%;
  box-sizing: border-box;
}

.radio.active {
  border-color: #ffbc00;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background-color: #ffbc00;
  border-radius: 50%;
}

.payment-manage-btn {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 2px;
  margin-top: 1px;
  border: none;
  background-color: transparent;
  font-size: 11px;
  font-weight: 500;
  color: #8b9097;
  cursor: pointer;
}

.payment-manage-btn:hover {
  color: #555b63;
}

.payment-manage-arrow {
  position: relative;
  top: -1px;
  font-size: 16px;
  line-height: 1;
}

.auto-charge-banner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background-color: #fff8e1;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.banner-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
  box-sizing: border-box;
}

.submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
  box-sizing: border-box;
  z-index: 50;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>