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

      <h1 class="nav-title">자동 충전 설정</h1>
    </header>

    <div class="content">
      <!-- =========================
           내 지갑 잔액
      ========================== -->
      <div class="wallet-card">
        <p class="wallet-label">내 지갑 잔액</p>

        <p class="wallet-amount">
          {{ walletBalance.toLocaleString() }}원
        </p>
      </div>

      <!-- =========================
           자동 충전 활성화
      ========================== -->
      <div class="setting-row">
        <div>
          <p class="setting-title">
            자동 충전 활성화
          </p>

          <p class="setting-desc">
            잔액이 부족하면 자동으로 충전돼요
          </p>
        </div>

        <button
          type="button"
          class="toggle"
          :class="{ active: autoChargeEnabled }"
          @click="toggleAutoCharge"
        >
          <div class="toggle-thumb"></div>
        </button>
      </div>

      <div class="divider"></div>

      <!-- =========================
           잔액 기준
      ========================== -->
      <div class="threshold-section">
        <p class="setting-label">
          잔액이
        </p>

        <div class="threshold-input-wrap">
          <input
            v-model.number="thresholdAmount"
            type="number"
            class="threshold-input"
            inputmode="numeric"
          />

          <span class="threshold-unit">
            원 이하일 때
          </span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- =========================
           자동 충전 금액
      ========================== -->
      <div class="charge-amount-section">
        <p class="setting-label">
          충전 금액
        </p>

        <div class="amount-row">
          <p class="setting-value-large">
            {{ chargeAmount.toLocaleString() }}원
          </p>

          <span class="auto-label">
            자동으로 충전
          </span>
        </div>

        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            type="button"
            class="quick-btn"
            :class="{
              selected: chargeAmount === quick.value
            }"
            @click="chargeAmount = quick.value"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <!-- =========================
           결제수단
      ========================== -->
      <div class="payment-section">
        <div class="payment-title-area">
          <p class="setting-title">
            자동충전 결제수단
          </p>

          <p class="setting-desc">
            자동 충전에 사용할 결제수단을 선택해주세요
          </p>
        </div>

        <!-- 로딩 -->
        <div
          v-if="isPaymentLoading"
          class="payment-state"
        >
          결제수단을 불러오는 중...
        </div>

        <!-- 결제수단 없음 -->
        <div
          v-else-if="paymentMethods.length === 0"
          class="payment-empty"
        >
          <p class="empty-title">
            등록된 결제수단이 없습니다.
          </p>

          <p class="empty-desc">
            아래에서 새로운 카드를 등록해주세요.
          </p>
        </div>

        <!-- =========================
             결제수단 목록
        ========================== -->
        <div
          v-else
          class="payment-list"
        >
          <div
            v-for="payment in paymentMethods"
            :key="payment.id"
            class="payment-item"
            :class="{
              selected:
                selectedPaymentMethodId === payment.id
            }"
            @click="selectPaymentMethod(payment.id)"
          >
            <!-- 왼쪽 카드 정보 -->
            <div class="payment-left">
              <div class="card-icon-wrap">
                <img
                  src="@/assets/logo.svg"
                  alt=""
                  class="card-icon"
                />
              </div>

              <div class="payment-info">
                <div class="payment-name-row">
                  <p class="payment-name">
                    {{ getPaymentName(payment) }}
                  </p>

                  <span
                    v-if="payment.primary"
                    class="primary-badge"
                  >
                    주 결제수단
                  </span>
                </div>

                <p class="payment-number">
                  {{ getPaymentNumber(payment) }}
                </p>
              </div>
            </div>

            <!-- 오른쪽 -->
            <div class="payment-right">
              <!-- 삭제 버튼 -->
              <button
                type="button"
                class="delete-btn"
                :disabled="deletingId === payment.id"
                @click.stop="handleDeletePayment(payment)"
              >
                {{
                  deletingId === payment.id
                    ? '삭제 중'
                    : '삭제'
                }}
              </button>

              <!-- 라디오 버튼 -->
              <div
                class="radio"
                :class="{
                  active:
                    selectedPaymentMethodId === payment.id
                }"
              >
                <div
                  v-if="
                    selectedPaymentMethodId === payment.id
                  "
                  class="radio-dot"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- =========================
             결제수단 추가 버튼
        ========================== -->
        <button
          type="button"
          class="add-payment-btn"
          @click="toggleAddPaymentForm"
        >
          <span class="add-circle">
            {{ showAddPaymentForm ? '−' : '+' }}
          </span>

          <span class="add-payment-text">
            새로운 결제수단 추가
          </span>

          <span
            class="add-chevron"
            :class="{ opened: showAddPaymentForm }"
          >
            ›
          </span>
        </button>

        <!-- =========================
             카드 등록 폼
        ========================== -->
        <div
          v-if="showAddPaymentForm"
          class="card-form"
        >
          <div class="form-header">
            <p class="form-title">
              카드 정보 입력
            </p>

            <button
              type="button"
              class="form-close"
              @click="showAddPaymentForm = false"
            >
              ✕
            </button>
          </div>

          <!-- 카드번호 -->
          <div class="form-group">
            <label class="form-label">
              카드번호
            </label>

            <input
              v-model="cardForm.cardNumber"
              type="text"
              class="form-input"
              inputmode="numeric"
              placeholder="카드번호를 입력해주세요"
            />
          </div>

          <!-- 유효기간 -->
          <div class="expiration-row">
            <div class="form-group">
              <label class="form-label">
                유효기간 월
              </label>

              <input
                v-model="cardForm.cardExpirationMonth"
                type="text"
                class="form-input"
                maxlength="2"
                inputmode="numeric"
                placeholder="MM"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                유효기간 년
              </label>

              <input
                v-model="cardForm.cardExpirationYear"
                type="text"
                class="form-input"
                maxlength="2"
                inputmode="numeric"
                placeholder="YY"
              />
            </div>
          </div>

          <!-- 카드 비밀번호 -->
          <div class="form-group">
            <label class="form-label">
              카드 비밀번호
            </label>

            <input
              v-model="cardForm.cardPassword"
              type="password"
              class="form-input"
              inputmode="numeric"
              placeholder="카드 비밀번호"
            />
          </div>

          <!-- 본인 확인 번호 -->
          <div class="form-group">
            <label class="form-label">
              본인 확인 번호
            </label>

            <input
              v-model="cardForm.customerIdentityNumber"
              type="password"
              class="form-input"
              inputmode="numeric"
              placeholder="본인 확인 번호"
            />
          </div>

          <!-- 카드 등록 -->
          <button
            type="button"
            class="register-card-btn"
            :disabled="
              !canRegisterCard ||
              isRegistering
            "
            @click="handleAddPayment"
          >
            {{
              isRegistering
                ? '등록 중...'
                : '카드 등록하기'
            }}
          </button>
        </div>
      </div>

      <!-- =========================
           자동 충전 설정 저장
           fixed 아님 / 화면 안에 위치
      ========================== -->
      <div class="submit-area">
        <button
          class="submit-btn"
          type="button"
          :disabled="
            isSaving ||
            (
              autoChargeEnabled &&
              !selectedPaymentMethodId
            )
          "
          @click="saveAutoCharge"
        >
          {{
            isSaving
              ? '저장 중...'
              : '자동 충전 설정 저장'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { getMyWallet } from '@/api/wallet'

import {
  getChargeMethods,
  addCardChargeMethod,
  deleteChargeMethod,
} from '@/api/charge'

const router = useRouter()
const authStore = useAuthStore()

/* =========================
   자동충전
========================= */

const walletBalance = ref(0)

const autoChargeEnabled = ref(true)

const thresholdAmount = ref(10000)

const chargeAmount = ref(30000)

const isSaving = ref(false)

/* =========================
   결제수단
========================= */

const paymentMethods = ref([])

const selectedPaymentMethodId = ref(null)

const isPaymentLoading = ref(false)

const deletingId = ref(null)

/* =========================
   카드 추가
========================= */

const showAddPaymentForm = ref(false)

const isRegistering = ref(false)

const cardForm = ref({
  cardNumber: '',
  cardExpirationMonth: '',
  cardExpirationYear: '',
  cardPassword: '',
  customerIdentityNumber: '',
})

/* =========================
   빠른 금액
========================= */

const quickAmounts = [
  {
    label: '1천원',
    value: 1000,
  },
  {
    label: '3천원',
    value: 3000,
  },
  {
    label: '5천원',
    value: 5000,
  },
  {
    label: '10만원',
    value: 100000,
  },
]

/* =========================
   카드 등록 가능 여부
========================= */

const canRegisterCard = computed(() => {
  return Boolean(
    cardForm.value.cardNumber &&
    cardForm.value.cardExpirationMonth &&
    cardForm.value.cardExpirationYear &&
    cardForm.value.cardPassword &&
    cardForm.value.customerIdentityNumber
  )
})

/* =========================
   페이지 진입
========================= */

onMounted(async () => {
  await Promise.all([
    loadWallet(),
    loadPaymentMethods(),
  ])
})

/* =========================
   지갑 조회
========================= */

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
      '지갑 조회 실패:',
      error
    )
  }
}

/* =========================
   결제수단 목록 조회
========================= */

async function loadPaymentMethods() {
  isPaymentLoading.value = true

  try {
    const res = await getChargeMethods(
      authStore.accessToken
    )

    if (res.success) {
      paymentMethods.value =
        res.data ?? []

      const primary =
        paymentMethods.value.find(
          (payment) => payment.primary
        )

      if (primary) {
        selectedPaymentMethodId.value =
          primary.id
      } else if (
        paymentMethods.value.length > 0
      ) {
        selectedPaymentMethodId.value =
          paymentMethods.value[0].id
      } else {
        selectedPaymentMethodId.value =
          null
      }
    }
  } catch (error) {
    console.error(
      '결제수단 조회 실패:',
      error
    )

    alert(
      error.message ||
        '결제수단을 불러오지 못했습니다.'
    )
  } finally {
    isPaymentLoading.value = false
  }
}

/* =========================
   결제수단 선택
========================= */

function selectPaymentMethod(id) {
  selectedPaymentMethodId.value = id
}

/* =========================
   이름
========================= */

function getPaymentName(payment) {
  if (!payment) return ''

  return (
    payment.cardCompany ||
    payment.accountBankName ||
    '결제수단'
  )
}

/* =========================
   번호
========================= */

function getPaymentNumber(payment) {
  if (!payment) return ''

  return (
    payment.maskedCardNumber ||
    payment.accountNumber ||
    ''
  )
}

/* =========================
   카드 추가 폼 토글
========================= */

function toggleAddPaymentForm() {
  showAddPaymentForm.value =
    !showAddPaymentForm.value
}

/* =========================
   카드 추가
========================= */

async function handleAddPayment() {
  if (
    !canRegisterCard.value ||
    isRegistering.value
  ) {
    return
  }

  isRegistering.value = true

  try {
    const res =
      await addCardChargeMethod(
        authStore.accessToken,
        {
          cardNumber:
            cardForm.value.cardNumber.replace(
              /[^0-9]/g,
              ''
            ),

          cardExpirationMonth:
            cardForm.value.cardExpirationMonth,

          cardExpirationYear:
            cardForm.value.cardExpirationYear,

          cardPassword:
            Number(
              cardForm.value.cardPassword
            ),

          customerIdentityNumber:
            Number(
              cardForm.value.customerIdentityNumber
            ),
        }
      )

    if (res.success) {
      alert('결제수단이 등록되었습니다.')

      resetCardForm()

      showAddPaymentForm.value = false

      await loadPaymentMethods()
    }
  } catch (error) {
    console.error(
      '결제수단 등록 실패:',
      error
    )

    alert(
      error.message ||
        '결제수단 등록에 실패했습니다.'
    )
  } finally {
    isRegistering.value = false
  }
}

/* =========================
   카드 폼 초기화
========================= */

function resetCardForm() {
  cardForm.value = {
    cardNumber: '',
    cardExpirationMonth: '',
    cardExpirationYear: '',
    cardPassword: '',
    customerIdentityNumber: '',
  }
}

/* =========================
   결제수단 삭제
========================= */

async function handleDeletePayment(payment) {
  if (!payment) return

  if (deletingId.value !== null) {
    return
  }

  const paymentName =
    getPaymentName(payment)

  const confirmed = window.confirm(
    `${paymentName} 결제수단을 삭제하시겠습니까?`
  )

  if (!confirmed) {
    return
  }

  deletingId.value = payment.id

  try {
    const res =
      await deleteChargeMethod(
        authStore.accessToken,
        payment.id
      )

    if (res.success) {
      alert('결제수단이 삭제되었습니다.')

      // 현재 선택된 결제수단을 삭제했다면 초기화
      if (
        selectedPaymentMethodId.value ===
        payment.id
      ) {
        selectedPaymentMethodId.value =
          null
      }

      // 서버 기준 목록 다시 받아오기
      await loadPaymentMethods()
    }
  } catch (error) {
    console.error(
      '결제수단 삭제 실패:',
      error
    )

    alert(
      error.message ||
        '결제수단 삭제에 실패했습니다.'
    )
  } finally {
    deletingId.value = null
  }
}

/* =========================
   자동충전 ON/OFF
========================= */

function toggleAutoCharge() {
  autoChargeEnabled.value =
    !autoChargeEnabled.value
}

/* =========================
   자동충전 설정 저장
========================= */

async function saveAutoCharge() {
  if (isSaving.value) return

  if (
    autoChargeEnabled.value &&
    !selectedPaymentMethodId.value
  ) {
    alert(
      '자동충전에 사용할 결제수단을 선택해주세요.'
    )

    return
  }

  isSaving.value = true

  try {
    /*
     * TODO:
     * 자동충전 설정 API 연결
     *
     * 예:
     *
     * await saveAutoChargeSetting(
     *   authStore.accessToken,
     *   {
     *     enabled: autoChargeEnabled.value,
     *     thresholdAmount:
     *       thresholdAmount.value,
     *     chargeAmount:
     *       chargeAmount.value,
     *     paymentMethodId:
     *       selectedPaymentMethodId.value,
     *   }
     * )
     */

    router.push({
      path: '/parents/charge/charging',

      query: {
        amount: chargeAmount.value,

        paymentMethodId:
          selectedPaymentMethodId.value,
      },
    })
  } catch (error) {
    console.error(
      '자동충전 설정 실패:',
      error
    )

    alert(
      error.message ||
        '자동충전 설정에 실패했습니다.'
    )
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;

  margin: 0 auto;

  background-color: #ffffff;

  display: flex;
  flex-direction: column;

  box-sizing: border-box;
}

/* =========================
   헤더
========================= */

.nav {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 18px 20px;

  border-bottom: 1px solid #f0f1f3;
}

.back-btn {
  padding: 0;

  background: transparent;

  border: none;

  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;

  font-size: 16px;
  font-weight: 700;

  color: #191b1e;
}

/* =========================
   콘텐츠
========================= */

.content {
  display: flex;
  flex-direction: column;

  padding: 16px 16px 40px;

  box-sizing: border-box;
}

/* =========================
   지갑
========================= */

.wallet-card {
  padding: 20px;

  margin-bottom: 24px;

  background-color: #f4f5f7;

  border-radius: 16px;
}

.wallet-label {
  margin: 0 0 8px;

  font-size: 12px;

  color: #8b9097;
}

.wallet-amount {
  margin: 0;

  font-size: 28px;
  font-weight: 700;

  color: #191b1e;
}

/* =========================
   공통 설정
========================= */

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 0;
}

.setting-title {
  margin: 0 0 4px;

  font-size: 15px;
  font-weight: 700;

  color: #191b1e;
}

.setting-desc {
  margin: 0;

  font-size: 12px;

  color: #8b9097;
}

.setting-label {
  margin: 0;

  font-size: 14px;

  color: #8b9097;
}

.divider {
  width: 100%;
  height: 1px;

  background-color: #f0f1f3;
}

/* =========================
   잔액 기준
========================= */

.threshold-section {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 0;
}

.threshold-input-wrap {
  display: flex;
  align-items: center;

  gap: 5px;
}

.threshold-input {
  width: 80px;

  padding: 8px;

  border: 1px solid #e0e2e6;

  border-radius: 8px;

  outline: none;

  text-align: right;

  font-size: 14px;
  font-weight: 700;

  color: #191b1e;

  box-sizing: border-box;
}

.threshold-input:focus {
  border-color: #ffbc00;
}

.threshold-unit {
  font-size: 14px;
  font-weight: 600;

  color: #191b1e;
}

/* =========================
   토글
========================= */

.toggle {
  position: relative;

  width: 48px;
  height: 28px;

  padding: 0;

  border: none;

  border-radius: 14px;

  background-color: #e0e2e6;

  cursor: pointer;

  transition: background-color 0.2s;
}

.toggle.active {
  background-color: #ffbc00;
}

.toggle-thumb {
  position: absolute;

  top: 3px;
  left: 3px;

  width: 22px;
  height: 22px;

  background-color: #ffffff;

  border-radius: 50%;

  transition: transform 0.2s;
}

.toggle.active .toggle-thumb {
  transform: translateX(20px);
}

/* =========================
   충전 금액
========================= */

.charge-amount-section {
  display: flex;
  flex-direction: column;

  gap: 12px;

  padding: 16px 0;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-value-large {
  margin: 0;

  font-size: 22px;
  font-weight: 700;

  color: #191b1e;
}

.auto-label {
  font-size: 12px;

  color: #8b9097;
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

  background-color: #ffffff;

  font-size: 13px;
  font-weight: 600;

  color: #191b1e;

  cursor: pointer;
}

.quick-btn.selected {
  border-color: #ffbc00;

  background-color: #fff8e1;
}

/* =========================
   결제수단
========================= */

.payment-section {
  display: flex;
  flex-direction: column;

  gap: 12px;

  padding: 20px 0;
}

.payment-title-area {
  margin-bottom: 2px;
}

.payment-state,
.payment-empty {
  padding: 20px;

  background-color: #f7f8fa;

  border-radius: 14px;

  text-align: center;

  font-size: 13px;

  color: #8b9097;
}

.empty-title {
  margin: 0 0 5px;

  font-size: 13px;
  font-weight: 700;

  color: #555b63;
}

.empty-desc {
  margin: 0;

  font-size: 11px;

  color: #8b9097;
}

/* =========================
   결제수단 목록
========================= */

.payment-list {
  overflow: hidden;

  border: 1px solid #e7e9ec;

  border-radius: 16px;

  background-color: #ffffff;
}

.payment-item {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;

  padding: 14px;

  border-bottom: 1px solid #f0f1f3;

  cursor: pointer;

  box-sizing: border-box;

  transition: background-color 0.15s ease;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-item.selected {
  background-color: #fffaf0;
}

.payment-left {
  flex: 1;

  min-width: 0;

  display: flex;
  align-items: center;

  gap: 10px;
}

.card-icon-wrap {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #f4f5f7;

  border-radius: 9px;
}

.card-icon {
  width: 22px;
  height: 22px;
}

.payment-info {
  min-width: 0;
}

.payment-name-row {
  display: flex;
  align-items: center;

  gap: 5px;

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

  padding: 2px 5px;

  background-color: #fff3c4;

  border-radius: 8px;

  font-size: 9px;
  font-weight: 700;

  color: #a86f00;
}

.payment-right {
  display: flex;
  align-items: center;

  gap: 9px;

  flex-shrink: 0;
}

/* =========================
   삭제 버튼
========================= */

.delete-btn {
  min-width: 42px;

  height: 28px;

  padding: 0 9px;

  border: 1px solid #eceef1;

  border-radius: 7px;

  background-color: #ffffff;

  font-size: 11px;
  font-weight: 600;

  color: #e15252;

  cursor: pointer;

  box-sizing: border-box;
}

.delete-btn:hover {
  background-color: #fff4f4;

  border-color: #ffdede;
}

.delete-btn:disabled {
  opacity: 0.45;

  cursor: not-allowed;
}

/* =========================
   라디오
========================= */

.radio {
  width: 20px;
  height: 20px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid #e0e2e6;

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

/* =========================
   결제수단 추가 버튼
========================= */

.add-payment-btn {
  width: 100%;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 14px 15px;

  border: 1px solid #e7e9ec;

  border-radius: 14px;

  background-color: #ffffff;

  cursor: pointer;

  box-sizing: border-box;
}

.add-circle {
  width: 24px;
  height: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background-color: #f4f5f7;

  border-radius: 50%;

  font-size: 17px;

  color: #555b63;
}

.add-payment-text {
  flex: 1;

  text-align: left;

  font-size: 13px;
  font-weight: 600;

  color: #555b63;
}

.add-chevron {
  font-size: 20px;

  color: #b0b4ba;

  transition: transform 0.2s;
}

.add-chevron.opened {
  transform: rotate(90deg);
}

/* =========================
   카드 등록
========================= */

.card-form {
  display: flex;
  flex-direction: column;

  gap: 14px;

  padding: 16px;

  background-color: #f7f8fa;

  border-radius: 16px;

  box-sizing: border-box;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-title {
  margin: 0;

  font-size: 15px;
  font-weight: 700;

  color: #191b1e;
}

.form-close {
  padding: 4px;

  border: none;

  background: transparent;

  color: #8b9097;

  cursor: pointer;
}

.form-group {
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;

  color: #555b63;
}

.form-input {
  width: 100%;
  height: 44px;

  padding: 0 12px;

  border: 1px solid #e0e2e6;

  border-radius: 10px;

  background-color: #ffffff;

  outline: none;

  font-size: 14px;

  color: #191b1e;

  box-sizing: border-box;
}

.form-input:focus {
  border-color: #ffbc00;
}

.expiration-row {
  display: flex;

  gap: 10px;
}

.register-card-btn {
  width: 100%;
  height: 46px;

  border: none;

  border-radius: 10px;

  background-color: #191b1e;

  color: #ffffff;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.register-card-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}

/* =========================
   설정 저장
   화면 내부
========================= */

.submit-area {
  width: 100%;

  margin-top: 4px;
  margin-bottom: 10px;
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
  opacity: 0.4;

  cursor: not-allowed;
}
</style>