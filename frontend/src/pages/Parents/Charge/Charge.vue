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

      <ParentNavActions />
    </header>

    <div class="content">
      <!-- 현재 잔액 -->
      <div class="section">
        <p class="section-label">
          현재 잔액
        </p>

        <div class="balance-wrap">
          <span class="balance-amount">
            {{ walletBalance.toLocaleString() }}
          </span>

          <span class="won">
            원
          </span>
        </div>
      </div>

      <!-- 충전 금액 -->
      <div class="section">
        <p class="section-label">
          충전할 금액
        </p>

        <div class="amount-wrap">
          <input
            v-model="chargeAmount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />

          <span class="won">
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
      <div class="section">
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
            : '충전하기'
        }}
      </button>
    </div>

    <ParentBottomNav active="home" />
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'

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
const alertModal = useAlertModal()

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
    alertModal.showAlert(
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

async function handleCharge() {
  if (isCharging.value) {
    return
  }

  if (
    !chargeAmount.value ||
    Number(chargeAmount.value) <= 0
  ) {
    alertModal.showAlert(
      '충전할 금액을 입력해주세요.'
    )
    return
  }

  if (!selectedMethodId.value) {
    alertModal.showAlert(
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
    alertModal.showAlert(
      '선택한 카드를 찾을 수 없습니다.'
    )

    await loadPaymentMethods()
    return
  }

  if (
    selectedMethod.type !== 'CARD' ||
    selectedMethod.status !== 'ACTIVE'
  ) {
    alertModal.showAlert(
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

    alertModal.showAlert(
      error.message ||
        '충전에 실패했습니다.'
    )
  } finally {
    isCharging.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.page {
  display: flex;
  width: 360px;
  min-height: 100dvh;
  flex-direction: column;
  margin: 0 auto;
  padding-bottom: 70px;
  background-color: #ffffff;
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background-color: #ffffff;
}

.back-btn,
.alarm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon,
.alarm-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  transform: translateX(-50%);
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px;
}

.section-label {
  margin: 0 0 12px;
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
}

.balance-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: #f4f5f7;
}

.balance-amount {
  color: #191b1e;
  font-size: 22px;
  font-weight: 700;
}

.won {
  color: #191b1e;
  font-size: 16px;
  font-weight: 600;
}

.amount-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 12px;
  background-color: #f4f5f7;
}

.amount-input {
  min-width: 0;
  flex: 1;
  border: none;
  outline: none;
  color: #191b1e;
  background: transparent;
  font-size: 22px;
  font-weight: 700;
  text-align: right;
  -moz-appearance: textfield;
}

.amount-input::placeholder {
  color: #c6c9ce;
}

.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  color: #191b1e;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-btn:active {
  background-color: #f4f5f7;
}

.payment-selector {
  display: flex;
  width: 100%;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background-color: #f4f5f7;
  cursor: pointer;
  text-align: left;
  transition: border-radius 0.2s ease;
}

.payment-selector.opened {
  border-radius: 12px 12px 8px 8px;
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
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #ffffff;
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
  overflow: hidden;
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payment-number {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
}

.primary-badge {
  flex-shrink: 0;
  padding: 3px 6px;
  border-radius: 10px;
  background-color: #fff3c4;
  color: #a86f00;
  font-size: 10px;
  font-weight: 700;
}

.payment-placeholder {
  color: #8b9097;
  font-size: 14px;
  font-weight: 500;
}

.payment-chevron {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.payment-chevron.open {
  transform: rotate(90deg);
}

.payment-dropdown {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  margin-top: -4px;
  border: 1px solid #e8e9eb;
  border-radius: 8px 8px 12px 12px;
  background-color: #ffffff;
}

.payment-option {
  display: flex;
  width: 100%;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
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
  color: #8b9097;
  font-size: 13px;
  text-align: center;
}

.radio {
  display: flex;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 2px solid #d9dce1;
  border-radius: 50%;
}

.radio.active {
  border-color: #ffbc00;
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ffbc00;
}

.payment-manage-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  align-self: flex-end;
  margin-top: 8px;
  padding: 3px 2px;
  border: none;
  background-color: transparent;
  color: #8b9097;
  font-size: 12px;
  font-weight: 500;
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

.submit-btn {
  width: 100%;
  height: 52px;
  margin-top: auto;
  border: none;
  border-radius: 12px;
  color: #191b1e;
  background-color: #ffbc00;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>