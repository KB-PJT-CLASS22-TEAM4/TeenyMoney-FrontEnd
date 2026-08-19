<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">
        결제 수단 변경
      </h1>

      <ParentNavActions />
    </header>

    <div class="content">
      <!-- =========================
           현재 결제 수단
      ========================== -->
      <div class="section">
        <p class="section-label">
          현재 결제 수단
        </p>

        <!-- 로딩 -->
        <div
          v-if="isLoading"
          class="state-card"
        >
          결제수단을 불러오는 중...
        </div>

        <!-- 현재 주 결제수단 -->
        <div
          v-else-if="currentPayment"
          class="current-card"
        >
          <img
            src="@/assets/logo.svg"
            alt=""
            class="card-icon"
          />

          <div class="card-info">
            <p class="card-name">
              {{ getPaymentName(currentPayment) }}
            </p>

            <p class="card-number">
              {{ getPaymentNumber(currentPayment) }}
            </p>
          </div>

          <span class="using-badge">
            사용중
          </span>
        </div>

        <!-- 없음 -->
        <div
          v-else
          class="state-card"
        >
          등록된 주 결제수단이 없습니다.
        </div>
      </div>

      <!-- =========================
           결제 수단 선택
      ========================== -->
      <div class="section">
        <p class="section-label">
          결제 수단 선택
        </p>

        <!-- 결제수단 없음 -->
        <div
          v-if="
            !isLoading &&
            paymentMethods.length === 0
          "
          class="empty-card"
        >
          등록된 결제수단이 없습니다.
        </div>

        <!-- 결제수단 목록 -->
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
                selectedId === payment.id
            }"
            @click="selectedId = payment.id"
          >
            <!-- 카드 정보 -->
            <img
              src="@/assets/logo.svg"
              alt=""
              class="card-icon"
            />

            <div class="card-info">
              <div class="card-name-row">
                <p class="card-name">
                  {{ getPaymentName(payment) }}
                </p>

                <span
                  v-if="payment.primary"
                  class="primary-badge"
                >
                  주 결제수단
                </span>
              </div>

              <p class="card-number">
                {{ getPaymentNumber(payment) }}
              </p>
            </div>

            <!-- 삭제 -->
            <button
              type="button"
              class="delete-btn"
              :disabled="
                deletingId === payment.id
              "
              @click.stop="
                handleDeletePayment(payment)
              "
            >
              {{
                deletingId === payment.id
                  ? '삭제 중'
                  : '삭제'
              }}
            </button>

            <!-- 라디오 -->
            <div
              class="radio"
              :class="{
                active:
                  selectedId === payment.id
              }"
            >
              <div
                v-if="
                  selectedId === payment.id
                "
                class="radio-dot"
              ></div>
            </div>
          </div>
        </div>

      </div>

      <div class="action-area">
        <!-- =========================
             새로운 결제수단 추가
        ========================== -->
        <button
          class="add-btn"
          type="button"
          :disabled="isCheckingPassword"
          @click="toggleAddForm"
        >
          <span class="add-icon">
            {{ showAddForm ? '−' : '+' }}
          </span>

          <span class="add-text">
            새로운 결제 수단 추가
          </span>

          <span
            class="add-chevron"
            :class="{ opened: showAddForm }"
          >
            ›
          </span>
        </button>

        <!-- =========================
             카드 등록 폼
        ========================== -->
        <div
          v-if="showAddForm"
          class="add-form"
        >
          <div class="form-header">
            <p class="form-title">
              카드 정보 입력
            </p>

            <button
              type="button"
              class="form-close"
              @click="showAddForm = false"
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
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                유효기간 월
              </label>

              <input
                v-model="
                  cardForm.cardExpirationMonth
                "
                type="text"
                class="form-input"
                inputmode="numeric"
                maxlength="2"
                placeholder="MM"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                유효기간 년
              </label>

              <input
                v-model="
                  cardForm.cardExpirationYear
                "
                type="text"
                class="form-input"
                inputmode="numeric"
                maxlength="2"
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
              v-model="
                cardForm.customerIdentityNumber
              "
              type="password"
              class="form-input"
              inputmode="numeric"
              placeholder="본인 확인 번호"
            />
          </div>

          <!-- 카드 등록 -->
          <button
            class="register-btn"
            type="button"
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

        <button
          class="submit-btn"
          type="button"
          :disabled="isChangeDisabled"
          @click="handleChange"
        >
          {{
            isChanging
              ? '변경 중...'
              : '변경하기'
          }}
        </button>
      </div>
    </div>

    <ParentBottomNav active="child" />
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

import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import {
  getChargeMethods,
  addCardChargeMethod,
  deleteChargeMethod,
  setPrimaryChargeMethod,
} from '@/api/charge'

import {
  hasPaymentPassword,
  isPaymentPasswordMarkedSet,
} from '@/api/password'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertModal = useAlertModal()

/* =========================
   결제수단 상태
========================= */

const paymentMethods = ref([])

const selectedId = ref(null)

const isLoading = ref(false)

const isChanging = ref(false)

const deletingId = ref(null)

/* =========================
   카드 추가
========================= */

const showAddForm = ref(false)

const isRegistering = ref(false)

const isCheckingPassword = ref(false)

const cardForm = ref({
  cardNumber: '',
  cardExpirationMonth: '',
  cardExpirationYear: '',
  cardPassword: '',
  customerIdentityNumber: '',
})

/* =========================
   현재 주 결제수단
========================= */

const currentPayment = computed(() => {
  return (
    paymentMethods.value.find(
      (payment) => payment.primary
    ) ?? null
  )
})

/* =========================
   변경 버튼 비활성화 여부
========================= */

const isChangeDisabled = computed(() => {
  return (
    !selectedId.value ||
    selectedId.value === currentPayment.value?.id ||
    isChanging.value
  )
})

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
  await loadPaymentMethods()

  if (route.query.openAdd === '1' && paymentMethods.value.length === 0) {
    showAddForm.value = true
  }
})

/* =========================
   결제수단 조회
========================= */

async function loadPaymentMethods() {
  isLoading.value = true

  try {
    const res =
      await getChargeMethods(
        authStore.accessToken
      )

    if (res.success) {
      /*
       * 삭제 처리된 INACTIVE는
       * 화면에서 제외
       */
      paymentMethods.value =
        (res.data ?? []).filter(
          (payment) =>
            payment.status !== 'INACTIVE'
        )

      const primary =
        paymentMethods.value.find(
          (payment) =>
            payment.primary
        )

      if (primary) {
        selectedId.value =
          primary.id
      } else if (
        paymentMethods.value.length > 0
      ) {
        selectedId.value =
          paymentMethods.value[0].id
      } else {
        selectedId.value =
          null
      }
    }
  } catch (error) {
    console.error(
      '결제수단 조회 실패:',
      error
    )

    paymentMethods.value = []

    selectedId.value = null

    alertModal.showAlert(
      error.message ||
        '결제수단을 불러오지 못했습니다.'
    )
  } finally {
    isLoading.value = false
  }
}

/* =========================
   표시 이름
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
   표시 번호
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

async function toggleAddForm() {
  if (showAddForm.value) {
    showAddForm.value = false
    return
  }

  if (isCheckingPassword.value) return

  /*
   * 이미 카드가 있으면
   * 첫 등록 때 비밀번호가 설정된 것으로 보고
   * 이후 추가에서는 설정 여부를 다시 확인하지 않는다.
   */
  const hasRegisteredCard = paymentMethods.value.some(
    (payment) => payment.type === 'CARD'
  )

  if (hasRegisteredCard) {
    showAddForm.value = true
    return
  }

  if (isPaymentPasswordMarkedSet()) {
    showAddForm.value = true
    return
  }

  isCheckingPassword.value = true

  try {
    const passwordSet = await hasPaymentPassword(
      authStore.accessToken
    )

    if (!passwordSet) {
      await alertModal.showAlert(
        '결제수단을 등록하려면 결제 비밀번호를 먼저 설정해주세요.',
        '결제 비밀번호 설정'
      )
      router.push({
        name: 'parents-payment-password',
        query: { from: 'payment-change' },
      })
      return
    }

    showAddForm.value = true
  } catch (error) {
    if (error.message === 'LOGIN_REQUIRED') return

    alertModal.showAlert(
      error.message ||
        '결제 비밀번호 확인에 실패했습니다.'
    )
  } finally {
    isCheckingPassword.value = false
  }
}

/* =========================
   카드 등록
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
            cardForm.value
              .cardExpirationMonth,

          cardExpirationYear:
            cardForm.value
              .cardExpirationYear,

          cardPassword:
            Number(
              cardForm.value.cardPassword
            ),

          customerIdentityNumber:
            Number(
              cardForm.value
                .customerIdentityNumber
            ),
        }
      )

    if (res.success) {
      alertModal.showAlert(
        '결제수단이 등록되었습니다.'
      )

      resetCardForm()

      showAddForm.value = false

      await loadPaymentMethods()
    }
  } catch (error) {
    console.error(
      '결제수단 등록 실패:',
      error
    )

    alertModal.showAlert(
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

  const confirmed =
    await alertModal.showConfirm(
      `${getPaymentName(payment)} 결제수단을 삭제하시겠습니까?`
    )

  if (!confirmed) return

  deletingId.value =
    payment.id

  try {
    const res =
      await deleteChargeMethod(
        authStore.accessToken,
        payment.id
      )

    if (res.success) {
      /*
       * 서버는 INACTIVE 처리하므로
       * 화면에서는 즉시 제거
       */
      paymentMethods.value =
        paymentMethods.value.filter(
          (item) =>
            item.id !== payment.id
        )

      /*
       * 현재 선택중인 카드 삭제 시
       * 남은 카드 재선택
       */
      if (
        selectedId.value ===
        payment.id
      ) {
        const primary =
          paymentMethods.value.find(
            (item) => item.primary
          )

        if (primary) {
          selectedId.value =
            primary.id
        } else if (
          paymentMethods.value.length > 0
        ) {
          selectedId.value =
            paymentMethods.value[0].id
        } else {
          selectedId.value =
            null
        }
      }

      alertModal.showAlert(
        '결제수단이 삭제되었습니다.'
      )

      await loadPaymentMethods()
    }
  } catch (error) {
    console.error(
      '결제수단 삭제 실패:',
      error
    )

    /*
     * DELETE가 500이어도
     * 서버에서 INACTIVE 처리되었을 가능성 때문에
     * 목록을 한번 재조회
     */
    try {
      await loadPaymentMethods()

      const stillExists =
        paymentMethods.value.some(
          (item) =>
            item.id === payment.id
        )

      if (!stillExists) {
        alertModal.showAlert(
          '결제수단이 삭제되었습니다.'
        )

        return
      }
    } catch (reloadError) {
      console.error(
        '삭제 후 재조회 실패:',
        reloadError
      )
    }

    alertModal.showAlert(
      error.message ||
        '결제수단 삭제에 실패했습니다.'
    )
  } finally {
    deletingId.value = null
  }
}

/* =========================
   주 결제수단 변경
========================= */

async function handleChange() {
  if (isChangeDisabled.value) {
    return
  }

  isChanging.value = true

  try {
    const res =
      await setPrimaryChargeMethod(
        authStore.accessToken,
        selectedId.value
      )

    if (res.success) {
      alertModal.showAlert(
        '주 결제수단이 변경되었습니다.'
      )

      await loadPaymentMethods()
    }
  } catch (error) {
    console.error(
      '주 결제수단 변경 실패:',
      error
    )

    alertModal.showAlert(
      error.message ||
        '주 결제수단 변경에 실패했습니다.'
    )
  } finally {
    isChanging.value = false
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

  padding-bottom: 90px;

  box-sizing: border-box;
}

/* 헤더 */

.nav {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 18px 20px;

  background-color: #ffffff;

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

/* 콘텐츠 */

.content {
  display: flex;
  flex: 1;
  flex-direction: column;

  gap: 24px;

  padding: 20px 16px 30px;

  box-sizing: border-box;
}

.section {
  width: 100%;
}

.section-label {
  margin: 0 0 12px;

  font-size: 13px;
  font-weight: 600;

  color: #8b9097;
}

/* 상태 */

.state-card,
.empty-card {
  padding: 20px 16px;

  background-color: #f7f8fa;

  border-radius: 16px;

  text-align: center;

  font-size: 13px;

  color: #8b9097;
}

/* 현재 결제수단 */

.current-card {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 16px;

  background-color: #ffffff;

  border: 1px solid #f0f1f3;

  border-radius: 16px;

  box-sizing: border-box;
}

.card-icon {
  width: 36px;
  height: 36px;

  padding: 6px;

  background-color: #f4f5f7;

  border-radius: 8px;

  box-sizing: border-box;
}

.card-info {
  flex: 1;

  min-width: 0;
}

.card-name-row {
  display: flex;
  align-items: center;

  gap: 6px;

  margin-bottom: 4px;
}

.card-name {
  margin: 0;

  font-size: 15px;
  font-weight: 700;

  color: #191b1e;
}

.card-number {
  margin: 0;

  font-size: 13px;

  color: #8b9097;
}

.using-badge {
  padding: 6px 14px;

  background-color: #ffbc00;

  border-radius: 20px;

  font-size: 13px;
  font-weight: 700;

  color: #191b1e;
}

.primary-badge {
  padding: 3px 6px;

  border-radius: 10px;

  background-color: #fff3c4;

  font-size: 10px;
  font-weight: 700;

  color: #a86f00;

  flex-shrink: 0;
}

/* 결제수단 목록 */

.payment-list {
  margin-bottom: 12px;

  overflow: hidden;

  background-color: #ffffff;

  border: 1px solid #f0f1f3;

  border-radius: 16px;
}

.payment-item {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 16px;

  border-bottom: 1px solid #f0f1f3;

  cursor: pointer;

  box-sizing: border-box;

  transition:
    background-color 0.15s ease;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-item.selected {
  background-color: #fffaf0;
}

/* 삭제 */

.delete-btn {
  min-width: 42px;
  height: 28px;

  padding: 0 8px;

  border: 1px solid #eceef1;

  border-radius: 7px;

  background-color: #ffffff;

  color: #e15252;

  font-size: 11px;
  font-weight: 600;

  cursor: pointer;

  flex-shrink: 0;
}

.delete-btn:hover {
  background-color: #fff4f4;
}

.delete-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}

/* 라디오 */

.radio {
  width: 22px;
  height: 22px;

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
  width: 12px;
  height: 12px;

  background-color: #ffbc00;

  border-radius: 50%;
}

/* 추가 버튼 */

.add-btn {
  width: 100%;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 16px;

  background-color: #ffffff;

  border: 1px solid #f0f1f3;

  border-radius: 16px;

  cursor: pointer;

  box-sizing: border-box;
}

.add-icon {
  width: 20px;

  font-size: 20px;

  color: #8b9097;

  text-align: center;
}

.add-text {
  flex: 1;

  text-align: left;

  font-size: 14px;
  font-weight: 600;

  color: #8b9097;
}

.add-chevron {
  font-size: 20px;

  color: #b0b4ba;

  transition:
    transform 0.2s;
}

.add-chevron.opened {
  transform: rotate(90deg);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: auto;
  padding-top: 8px;
}

/* 카드 등록 폼 */

.add-form {
  padding: 16px;

  display: flex;
  flex-direction: column;

  gap: 14px;

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

.form-row {
  display: flex;

  gap: 10px;
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

  box-sizing: border-box;
}

.form-input:focus {
  border-color: #ffbc00;
}

.register-btn {
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

.register-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  height: 52px;

  border: none;

  border-radius: 12px;

  background-color: #ffbc00;

  font-size: 16px;
  font-weight: 700;

  color: #191b1e;

  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}

</style>