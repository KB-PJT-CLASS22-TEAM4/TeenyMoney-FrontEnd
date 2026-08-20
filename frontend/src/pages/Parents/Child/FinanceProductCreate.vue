<template>
  <div class="page" @click="openSelect = null">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">새 금융 상품 추가</h1>
      <ParentNavActions />
    </header>

    <div class="scroll-area">
      <div
        v-if="needsChildSelect"
        class="child-select-section"
      >
        <p
          v-if="childrenError"
          class="child-bar-error"
        >
          {{ childrenError }}
        </p>

        <button
          v-else
          type="button"
          class="child-select-box"
          @click="openChildModal"
        >
          <div
            v-if="selectedChildren.length"
            class="selected-child-list"
          >
            <div
              v-for="child in selectedChildren"
              :key="child.id"
              class="selected-child"
            >
              <img
                :src="CHILD_PROFILE_IMAGE"
                alt=""
                class="selected-avatar-img"
              />
              <span class="selected-child-name">
                {{ child.name }}
              </span>
              <span
                class="selected-child-remove"
                role="button"
                aria-label="선택 취소"
                @click.stop="removeChild(child.id)"
              >
                ×
              </span>
            </div>
          </div>

          <span
            v-else
            class="select-placeholder"
          >
            자녀를 선택해주세요
          </span>

          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="select-arrow"
          />
        </button>
      </div>

      <div class="type-tabs">
        <button
          v-for="tab in productTabs"
          :key="tab.value"
          class="type-tab"
          :class="{ active: activeType === tab.value }"
          type="button"
          @click="selectProductType(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <section class="section">
        <div class="section-head">
          <span class="section-icon">📄</span>
          <div>
            <h2 class="section-title">상품 정보 설정</h2>
            <p class="section-desc">{{ sectionDesc }}</p>
          </div>
        </div>

        <div
          class="form-card"
          :class="{
            raised: [
              'savingsType',
              'savingInterest',
              'depositInterest',
              'repaymentType',
            ].includes(openSelect),
          }"
        >
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
              <div class="field half">
                <span class="field-label">적금 유형</span>
                <SelectDropdown
                  v-model="form.savingsType"
                  :options="savingsTypeOptions"
                  :open="openSelect === 'savingsType'"
                  placement="up"
                  @toggle="toggleSelect('savingsType')"
                />
              </div>

              <div class="field half">
                <span class="field-label">금리 계산 방식</span>
                <SelectDropdown
                  v-model="form.interestCalculationType"
                  :options="interestTypeOptions"
                  :open="openSelect === 'savingInterest'"
                  placement="up"
                  @toggle="toggleSelect('savingInterest')"
                />
              </div>
            </div>
          </template>

          <template v-else-if="activeType === 'DEPOSIT'">
            <div class="field">
              <span class="field-label">금리 계산 방식</span>
              <SelectDropdown
                v-model="form.interestCalculationType"
                :options="interestTypeOptions"
                :open="openSelect === 'depositInterest'"
                placement="up"
                @toggle="toggleSelect('depositInterest')"
              />
            </div>
          </template>

          <template v-else-if="activeType === 'LOAN'">
            <div class="field">
              <span class="field-label">상환 방식</span>
              <SelectDropdown
                v-model="form.repaymentType"
                :options="repaymentTypeOptions"
                :open="openSelect === 'repaymentType'"
                placement="up"
                @toggle="toggleSelect('repaymentType')"
              />
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

          <template v-if="activeType === 'DEPOSIT' || activeType === 'SAVING'">
            <p class="field-label">가입 기간별 금리 (연이율)</p>
            <div class="rate-grid">
              <label
                v-for="term in productTerms"
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

          <template v-else>
            <label class="field">
              <span class="field-label">대출 금리 (%)</span>
              <input
                v-model.number="form.loanInterestRate"
                class="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="예: 5"
              />
            </label>

            <label class="field">
              <span class="field-label">연체 이율 (%)</span>
              <input
                v-model.number="form.lateFeeRate"
                class="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="예: 0"
              />
            </label>

            <p class="field-label">이용 가능 기간</p>
            <div class="term-checks">
              <label
                v-for="term in productTerms"
                :key="term.months"
                class="term-check"
              >
                <input
                  v-model="form.availableTerms[term.months]"
                  type="checkbox"
                />
                {{ term.label }}
              </label>
            </div>
          </template>
        </div>

        <div
          class="form-card"
          :class="{ raised: openSelect === 'requiredGrade' }"
        >
          <h3 class="form-card-title">{{ limitCardTitle }}</h3>

          <label class="field">
            <span class="field-label">{{ minAmountLabel }}</span>
            <input
              v-model.number="form.minimumAmount"
              class="field-input"
              type="number"
              min="0"
              placeholder="원"
            />
          </label>

          <label class="field">
            <span class="field-label">{{ maxAmountLabel }}</span>
            <input
              v-model.number="form.maximumAmount"
              class="field-input"
              type="number"
              min="0"
              placeholder="원"
            />
          </label>

          <div v-if="activeType === 'LOAN'" class="field">
            <span class="field-label">가입 가능 최소 등급</span>
            <SelectDropdown
              v-model="form.requiredGradeId"
              :options="gradeOptions"
              :open="openSelect === 'requiredGrade'"
              placement="up"
              @toggle="toggleSelect('requiredGrade')"
            />
          </div>

          <p class="helper-text">{{ helperText }}</p>
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

    <Teleport to="body">
      <div
        v-if="isChildModalOpen"
        class="modal-overlay"
        @click.self="closeChildModal"
      >
        <div class="bottom-sheet">
          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <div>
              <h2 class="sheet-title">자녀 선택</h2>
              <p class="sheet-description">
                상품을 만들 자녀를 선택해주세요. 여러 명을 선택할 수 있어요.
              </p>
            </div>

            <button
              type="button"
              class="sheet-close-btn"
              aria-label="닫기"
              @click="closeChildModal"
            >
              ×
            </button>
          </div>

          <div
            v-if="children.length === 0"
            class="modal-state"
          >
            연결된 자녀가 없습니다.
          </div>

          <div
            v-else
            class="modal-child-list"
          >
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              class="modal-child-item"
              :class="{ selected: selectedChildIds.includes(child.id) }"
              @click="toggleChild(child.id)"
            >
              <div class="modal-child-left">
                <div class="modal-avatar">
                  <img
                    :src="CHILD_PROFILE_IMAGE"
                    alt=""
                    class="modal-avatar-img"
                  />
                </div>
                <span class="modal-child-name">
                  {{ child.name }}
                </span>
              </div>

              <div
                class="check-circle"
                :class="{ checked: selectedChildIds.includes(child.id) }"
              >
                <span
                  v-if="selectedChildIds.includes(child.id)"
                  class="check-mark"
                >
                  ✓
                </span>
              </div>
            </button>
          </div>

          <button
            type="button"
            class="modal-confirm-btn"
            @click="closeChildModal"
          >
            선택 완료
          </button>
        </div>
      </div>
    </Teleport>

    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { createFinancialProduct } from '@/api/financialProducts'
import { getChildren } from '@/api/children'
import { getTeenyScoreGrades } from '@/api/teenyScore'
import AlertHost from '@/components/AlertHost.vue'
import SelectDropdown from '@/components/SelectDropdown.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import { useAlertModal } from '@/composables/useAlertModal'
import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const FALLBACK_GRADES = [
  { gradeId: 1, gradeName: '새싹' },
  { gradeId: 2, gradeName: '스타터' },
  { gradeId: 3, gradeName: '플러스' },
  { gradeId: 4, gradeName: '프로' },
  { gradeId: 5, gradeName: '마스터' },
]

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const routeChildId = Number(route.params.childId)
const needsChildSelect = !routeChildId
const selectedChildIds = ref(routeChildId ? [routeChildId] : [])
const children = ref([])
const childrenError = ref('')
const isChildModalOpen = ref(false)

const selectedChildren = computed(() =>
  children.value.filter((child) => selectedChildIds.value.includes(child.id))
)

function getTargetChildIds() {
  return selectedChildIds.value
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

function openChildModal() {
  isChildModalOpen.value = true
}

function closeChildModal() {
  isChildModalOpen.value = false
}

function toggleChild(childId) {
  if (selectedChildIds.value.includes(childId)) {
    selectedChildIds.value = selectedChildIds.value.filter((id) => id !== childId)
    return
  }

  selectedChildIds.value = [...selectedChildIds.value, childId]
}

function removeChild(childId) {
  selectedChildIds.value = selectedChildIds.value.filter((id) => id !== childId)
}

const productTabs = [
  { label: '예금', value: 'DEPOSIT' },
  { label: '적금', value: 'SAVING' },
  { label: '대출', value: 'LOAN' },
]

const productTerms = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
  { label: '12개월', months: 12 },
]

const activeType = ref('DEPOSIT')
const isSubmitting = ref(false)
const grades = ref([...FALLBACK_GRADES])
const openSelect = ref(null)

const savingsTypeOptions = [
  { value: 'FREE', label: '자유적금' },
  { value: 'FIXED', label: '정액적금' },
]

const interestTypeOptions = [
  { value: 'SIMPLE', label: '단리' },
  { value: 'COMPOUND', label: '복리' },
]

const repaymentTypeOptions = [
  { value: 'EQUAL_PRINCIPAL_AND_INTEREST', label: '원리금 균등상환' },
  { value: 'EQUAL_PRINCIPAL', label: '원금 균등상환' },
  { value: 'BULLET', label: '만기일시상환' },
]

const gradeOptions = computed(() =>
  grades.value.map((grade) => ({
    value: grade.gradeId,
    label: grade.gradeName,
  }))
)

function toggleSelect(name) {
  openSelect.value = openSelect.value === name ? null : name
}

function selectProductType(type) {
  activeType.value = type
  openSelect.value = null
}

const form = reactive({
  productName: '',
  description: '',
  savingsType: 'FREE',
  interestCalculationType: 'SIMPLE',
  repaymentType: 'EQUAL_PRINCIPAL_AND_INTEREST',
  loanInterestRate: null,
  earlyTerminationRate: null,
  lateFeeRate: null,
  termRates: {
    1: null,
    3: null,
    6: null,
    12: null,
  },
  availableTerms: {
    1: true,
    3: true,
    6: true,
    12: true,
  },
  minimumAmount: null,
  maximumAmount: null,
  requiredGradeId: 1,
})

const sectionDesc = computed(() => {
  if (activeType.value === 'LOAN') return '자녀를 위한 새로운 대출 상품을 설계해 보세요.'
  if (activeType.value === 'SAVING') return '자녀를 위한 새로운 적금 상품을 설계해 보세요.'
  return '자녀를 위한 새로운 예금 상품을 설계해 보세요.'
})

const limitCardTitle = computed(() => {
  if (activeType.value === 'DEPOSIT') return '가입 및 한도'
  if (activeType.value === 'LOAN') return '대출 한도 및 자격'
  return '가입 한도 및 자격'
})

const minAmountLabel = computed(() => {
  if (activeType.value === 'DEPOSIT') return '최소 예금액'
  if (activeType.value === 'LOAN') return '최소 대출 금액'
  return '최소 월 납입액'
})

const maxAmountLabel = computed(() => {
  if (activeType.value === 'DEPOSIT') return '최대 예금액'
  if (activeType.value === 'LOAN') return '최대 대출 금액'
  return '최대 월 납입액'
})

const helperText = computed(() => {
  if (activeType.value === 'LOAN') {
    return 'ⓘ 선택한 등급 이상의 자녀만 이 대출에 가입할 수 있습니다.'
  }
  return 'ⓘ 자녀의 티니점수가 보통 등급 이상이어야 가입할 수 있습니다.'
})

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function buildTermRates() {
  return productTerms.map((term) => ({
    termMonths: term.months,
    interestRate: toFiniteNumber(form.termRates[term.months]),
  }))
}

function selectedLoanTerms() {
  return productTerms
    .filter((term) => form.availableTerms[term.months])
    .map((term) => term.months)
}

function buildPayload(targetChildId) {
  const productName = form.productName.trim()
  const description = form.description.trim()
  const minimumAmount = toFiniteNumber(form.minimumAmount)
  const maximumAmount = toFiniteNumber(form.maximumAmount)
  const childId = targetChildId

  if (activeType.value === 'SAVING') {
    return {
      childId,
      productType: 'SAVING',
      productName,
      description,
      savingsType: form.savingsType,
      interestCalculationType: form.interestCalculationType,
      earlyTerminationRate: toFiniteNumber(form.earlyTerminationRate),
      minimumMonthlyAmount: minimumAmount,
      maximumMonthlyAmount: maximumAmount,
      rates: buildTermRates(),
    }
  }

  if (activeType.value === 'DEPOSIT') {
    return {
      childId,
      productType: 'DEPOSIT',
      productName,
      description,
      interestCalculationType: form.interestCalculationType,
      earlyTerminationRate: toFiniteNumber(form.earlyTerminationRate),
      minimumAmount,
      maximumAmount,
      rates: buildTermRates(),
    }
  }

  return {
    childId,
    productType: 'LOAN',
    productName,
    description,
    interestRate: toFiniteNumber(form.loanInterestRate),
    lateFeeRate: toFiniteNumber(form.lateFeeRate),
    minimumAmount,
    maximumAmount,
    repaymentType: form.repaymentType,
    requiredGradeId: toFiniteNumber(form.requiredGradeId, 1),
    availableTerms: selectedLoanTerms(),
  }
}

async function handleSubmit() {
  const targetChildIds = getTargetChildIds()

  if (!targetChildIds.length) {
    alertModal.showAlert('상품을 만들 자녀를 선택해 주세요.')
    return
  }

  if (!form.productName.trim()) {
    alertModal.showAlert('상품 이름을 입력해 주세요.')
    return
  }

  if (activeType.value === 'LOAN' && selectedLoanTerms().length === 0) {
    alertModal.showAlert('이용 가능 기간을 하나 이상 선택해 주세요.')
    return
  }

  isSubmitting.value = true

  try {
    for (const childId of targetChildIds) {
      await createFinancialProduct(
        authStore.accessToken,
        buildPayload(childId)
      )
    }

    alertModal.showAlert('금융 상품이 등록되었습니다.')

    if (targetChildIds.length === 1) {
      router.replace(`/parents/children/${targetChildIds[0]}/finance`)
    } else {
      router.replace('/parents/home')
    }
  } catch (error) {
    alertModal.showAlert(error.message || '상품 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

async function loadChildren() {
  if (!needsChildSelect) return

  childrenError.value = ''

  try {
    const result = await getChildren(authStore.accessToken)
    const list = Array.isArray(result?.data)
      ? result.data
      : result?.data?.children || []

    children.value = list.map((child) => ({
      id: child.childId ?? child.id,
      name: child.name,
    }))
  } catch (error) {
    childrenError.value = error.message || '자녀 목록을 불러오지 못했습니다.'
  }
}

onMounted(async () => {
  await loadChildren()

  try {
    const result = await getTeenyScoreGrades(authStore.accessToken)
    const list = Array.isArray(result?.data) ? result.data : []
    if (!list.length) return

    grades.value = [...list].sort((a, b) => a.minScore - b.minScore)
    form.requiredGradeId = grades.value[0]?.gradeId ?? 1
  } catch {
    grades.value = [...FALLBACK_GRADES]
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

.child-select-section {
  margin-bottom: 14px;
}

.child-select-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 56px;
  padding: 10px 14px;
  border: none;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.selected-child-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-child {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 4px;
  border: 1px solid #ffe7a7;
  border-radius: 999px;
  background: #fff9e8;
}

.selected-avatar-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: contain;
  background: #f4f5f7;
}

.selected-child-name {
  color: #191b1e;
  font-size: 13px;
  font-weight: 700;
}

.selected-child-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #8b9097;
  font-size: 14px;
  line-height: 1;
}

.select-placeholder {
  color: #8b9097;
  font-size: 14px;
}

.select-arrow {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  flex-shrink: 0;
}

.child-bar-error {
  margin: 0;
  font-size: 12px;
  color: #d14343;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.38);
}

.bottom-sheet {
  width: 360px;
  max-height: 75vh;
  padding: 10px 16px 24px;
  border-radius: 22px 22px 0 0;
  background: #ffffff;
}

.sheet-handle {
  width: 38px;
  height: 4px;
  margin: 0 auto 18px;
  border-radius: 20px;
  background: #d9dce1;
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.sheet-title {
  margin: 0 0 5px;
  color: #191b1e;
  font-size: 19px;
  font-weight: 800;
}

.sheet-description {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
}

.sheet-close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #8b9097;
  font-size: 27px;
  font-weight: 300;
  cursor: pointer;
}

.modal-child-list {
  display: flex;
  max-height: 310px;
  flex-direction: column;
  overflow-y: auto;
  border-top: 1px solid #f0f1f3;
}

.modal-child-item {
  display: flex;
  width: 100%;
  min-height: 74px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  border: none;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;
  cursor: pointer;
}

.modal-child-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.modal-avatar {
  width: 46px;
  height: 46px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 50%;
}

.modal-child-item.selected .modal-avatar {
  border-color: #ffbc00;
}

.modal-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f4f5f7;
}

.modal-child-name {
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
}

.check-circle {
  display: flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #d7dae0;
  border-radius: 50%;
  background: #ffffff;
}

.check-circle.checked {
  border-color: #ffbc00;
  background: #ffbc00;
}

.check-mark {
  color: #191b1e;
  font-size: 13px;
  font-weight: 900;
}

.modal-confirm-btn {
  width: 100%;
  height: 50px;
  margin-top: 18px;
  border: none;
  border-radius: 11px;
  color: #191b1e;
  background: #ffbc00;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.modal-state {
  padding: 45px 10px;
  color: #8b9097;
  font-size: 13px;
  text-align: center;
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
  font-size: 13px;
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
  position: relative;
  z-index: 1;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #f4f5f7;
  overflow: visible;
}

.form-card.raised {
  z-index: 5;
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

.term-checks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.term-check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #4a4e55;
}

.term-check input {
  width: 16px;
  height: 16px;
  accent-color: #ffbc00;
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
