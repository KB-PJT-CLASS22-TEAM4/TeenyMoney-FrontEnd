<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">새 금융 상품 추가</h1>
      <ParentNavActions />
    </header>

    <div class="scroll-area">
      <div class="type-tabs">
        <button
          v-for="tab in productTabs"
          :key="tab.value"
          class="type-tab"
          :class="{ active: activeType === tab.value }"
          type="button"
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <section class="section">
        <div class="section-head">
          <span class="section-icon">📄</span>
          <div>
            <h2 class="section-title">상품 정보 설정</h2>
            <p class="section-desc">
              자녀를 위한 새로운 저축/예금 상품을 설계해 보세요.
            </p>
          </div>
        </div>

        <div class="form-card">
          <h3 class="form-card-title">기본 정보</h3>

          <label class="field">
            <span class="field-label">
              상품 이름
              <span class="required">*</span>
            </span>
            <input
              v-model="form.productName"
              class="field-input"
              type="text"
              placeholder="상품 이름을 입력하세요"
            />
          </label>

          <template v-if="activeType === 'SAVING'">
            <div class="field-row">
              <label class="field half">
                <span class="field-label">적금 유형</span>
                <select v-model="form.savingsType" class="field-input">
                  <option value="FREE">자유적금</option>
                  <option value="FIXED">정액적금</option>
                </select>
              </label>

              <label class="field half">
                <span class="field-label">금리 계산 방식</span>
                <select v-model="form.interestCalculationType" class="field-input">
                  <option value="SIMPLE">단리</option>
                  <option value="COMPOUND">복리</option>
                </select>
              </label>
            </div>
          </template>

          <label class="field">
            <span class="field-label">상품 설명</span>
            <textarea
              v-model="form.description"
              class="field-textarea"
              rows="3"
              placeholder="상품 설명을 입력하세요"
            ></textarea>
          </label>
        </div>

        <div class="form-card">
          <h3 class="form-card-title">금리 조건</h3>

          <template v-if="activeType === 'DEPOSIT'">
            <label class="field">
              <span class="field-label">1개월~12개월 금리 (%)</span>
              <input
                v-model.number="form.depositRate"
                class="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="예: 2.1"
              />
            </label>

            <label class="field">
              <span class="field-label">중도 해지 금리 (%)</span>
              <input
                v-model.number="form.earlyTerminationRate"
                class="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="예: 0.5"
              />
            </label>
          </template>

          <template v-else>
            <p class="field-label">가입 기간별 금리 (연이율)</p>
            <div class="rate-grid">
              <label
                v-for="term in savingTerms"
                :key="term.months"
                class="field"
              >
                <span class="field-label">{{ term.label }}</span>
                <input
                  v-model.number="form.termRates[term.months]"
                  class="field-input"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="%"
                />
              </label>
            </div>

            <label class="field">
              <span class="field-label">중도 해지 시 적용 금리</span>
              <input
                v-model.number="form.earlyTerminationRate"
                class="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="예: 0.5"
              />
            </label>
          </template>
        </div>

        <div class="form-card">
          <h3 class="form-card-title">
            {{ activeType === 'DEPOSIT' ? '가입 및 한도' : '가입 한도 및 자격' }}
          </h3>

          <label class="field">
            <span class="field-label">
              {{ activeType === 'DEPOSIT' ? '최소 예금액' : '최소 월 납입액' }}
            </span>
            <input
              v-model.number="form.minimumAmount"
              class="field-input"
              type="number"
              min="0"
              placeholder="원"
            />
          </label>

          <label class="field">
            <span class="field-label">
              {{ activeType === 'DEPOSIT' ? '최대 예금액' : '최대 월 납입액' }}
            </span>
            <input
              v-model.number="form.maximumAmount"
              class="field-input"
              type="number"
              min="0"
              placeholder="원"
            />
          </label>

          <label class="field">
            <span class="field-label">가입 요구 최소 티니점수</span>
            <input
              v-model.number="form.requiredMinScore"
              class="field-input"
              type="number"
              min="0"
              max="1000"
              placeholder="예: 450"
            />
          </label>

          <p class="helper-text">
            ⓘ 자녀의 티니점수가 보통 등급 이상이어야 가입할 수 있습니다.
          </p>
        </div>

        <div class="notice-box">
          등록한 상품은 자녀관리 메뉴에서 추천 상품으로 노출됩니다.
        </div>

        <div class="submit-wrap">
          <button
            class="submit-btn"
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            상품 등록하기
          </button>
        </div>
      </section>
    </div>
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { createFinancialProduct } from '@/api/financialProducts'
import AlertHost from '@/components/AlertHost.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import { useAlertModal } from '@/composables/useAlertModal'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const childId = Number(route.params.childId)

const productTabs = [
  { label: '예금', value: 'DEPOSIT' },
  { label: '적금', value: 'SAVING' },
]

const savingTerms = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
  { label: '12개월', months: 12 },
]

const activeType = ref('DEPOSIT')
const isSubmitting = ref(false)

const form = reactive({
  productName: '',
  description: '',
  savingsType: 'FREE',
  interestCalculationType: 'SIMPLE',
  depositRate: null,
  earlyTerminationRate: null,
  termRates: {
    1: null,
    3: null,
    6: null,
    12: null,
  },
  minimumAmount: null,
  maximumAmount: null,
  requiredMinScore: null,
})

function buildRates() {
  if (activeType.value === 'DEPOSIT') {
    if (form.depositRate == null) return []

    return [{
      termMonths: 12,
      baseRate: form.depositRate,
      expectedAppliedRate: form.depositRate,
    }]
  }

  return savingTerms
    .map((term) => ({
      termMonths: term.months,
      baseRate: form.termRates[term.months],
      expectedAppliedRate: form.termRates[term.months],
    }))
    .filter((rate) => rate.baseRate != null)
}

function buildPayload() {
  const rates = buildRates()
  const baseRate = rates.length
    ? Math.min(...rates.map((rate) => rate.baseRate))
    : null
  const expectedAppliedRate = rates.length
    ? Math.max(...rates.map((rate) => rate.expectedAppliedRate))
    : null

  const payload = {
    productType: activeType.value,
    productName: form.productName.trim(),
    description: form.description.trim(),
    minimumAmount: form.minimumAmount ?? 0,
    maximumAmount: form.maximumAmount ?? 0,
    requiredMinScore: form.requiredMinScore ?? 0,
    earlyTerminationRate: form.earlyTerminationRate ?? 0,
    baseRate,
    expectedAppliedRate,
    rates,
    availableTerms: rates.map((rate) => rate.termMonths),
    childId,
  }

  if (activeType.value === 'SAVING') {
    payload.savingsType = form.savingsType
    payload.interestCalculationType = form.interestCalculationType
  } else {
    payload.interestCalculationType = 'SIMPLE'
  }

  return payload
}

async function handleSubmit() {
  if (!form.productName.trim()) {
    alertModal.showAlert('상품 이름을 입력해 주세요.')
    return
  }

  isSubmitting.value = true

  try {
    await createFinancialProduct(
      authStore.accessToken,
      buildPayload()
    )

    alertModal.showAlert('금융 상품이 등록되었습니다.')
    router.replace(`/parents/children/${childId}/finance`)
  } catch (error) {
    alertModal.showAlert(error.message || '상품 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}
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
  justify-content: center;
  position: relative;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;

}

.back-btn,
.alarm-btn {
  position: absolute;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-btn {
  left: 18px;
}

.alarm-btn {
  right: 18px;
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

.scroll-area {
  flex: 1;
  padding: 16px 16px 32px;
}

.section {
  padding: 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.type-tabs {
  display: flex;
  gap: 0;
  padding: 4px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.type-tab {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 999px;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  color: #8b9097;
  cursor: pointer;
}

.type-tab.active {
  background: #ffffff;
  color: #ffbc00;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-head {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: #191b1e;
}

.section-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.form-card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #f4f5f7;
}

.form-card-title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.field {
  display: block;
  margin-bottom: 12px;
}

.field-row {
  display: flex;
  gap: 10px;
}

.field.half {
  flex: 1;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #4a4e55;
}

.required {
  color: #ff3b30;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: 12px;
  background: #ffffff;
  font-size: 14px;
  color: #191b1e;
  box-sizing: border-box;
}

.field-textarea {
  resize: vertical;
  min-height: 88px;
}

.rate-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 4px;
}

.helper-text {
  margin: 0;
  font-size: 11px;
  color: #8b9097;
}

.notice-box {
  padding: 14px 16px;
  margin-top: 4px;
  border-radius: 12px;
  background: #f3f4f6;
  font-size: 12px;
  color: #4a4e55;
  line-height: 1.5;
}

.submit-wrap {
  margin-top: 16px;
}

.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
