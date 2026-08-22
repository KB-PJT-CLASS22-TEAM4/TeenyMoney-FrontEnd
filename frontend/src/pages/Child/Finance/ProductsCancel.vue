<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getTeenyScore } from '@/api/teenyScore'
import {
  getTerminationQuote,
  terminateEnrollment,
  getEarlyRepaymentQuote,
  executeEarlyRepayment,
} from '@/api/finance'
import { getFinanceTerm } from '@/constants/financeTerms'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import FinanceTermModal from '@/components/Child/FinanceTermModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 어려운 금융 용어 설명 모달 상태
const showTermModal = ref(false)
const activeTermData = ref(null)

function openTermModal(termName) {
  const data = getFinanceTerm(termName)
  if (data) {
    activeTermData.value = data
    showTermModal.value = true
  }
}

function closeTermModal() {
  showTermModal.value = false
  activeTermData.value = null
}

// 스크롤바 제어
const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}

const product = reactive({
  id: route.query.id || '',
  title: route.query.title || '상품',
  category: route.query.category || '', // '적금' | '예금' | '대출'
  productType: route.query.productType || '', // SAVING | DEPOSIT | LOAN
  savingsType: route.query.savingsType || '', // FIXED | FREE
})

const isLoan = computed(() => product.productType === 'LOAN' || product.category === '대출')
const badgeColor = computed(() => (isLoan.value ? 'orange' : 'blue'))
const desc = computed(() => {
  if (isLoan.value) return '대출 상품'
  if (product.savingsType === 'FREE' || product.savingsType === '자유적금') return '원하는 금액을 자유롭게 납입하는 자유적금'
  if (product.productType === 'SAVING' || product.category === '적금') return '매월 정해진 금액을 납입하는 정액적금'
  return '예금 상품'
})

// GET/POST 경로 세그먼트 (saving / deposit)
const productTypePath = computed(() => {
  const t = String(product.productType || product.category).toUpperCase()
  if (t.includes('SAVING') || t.includes('적금')) return 'saving'
  if (t.includes('DEPOSIT') || t.includes('예금')) return 'deposit'
  return ''
})

// ---- 티니점수(현재 점수) 조회 ----
const currentScore = ref(0)

// ================== 예·적금 중도해지 ==================
const quote = ref(null)
const isLoadingQuote = ref(true)
const quoteError = ref('')

async function loadQuote() {
  if (isLoan.value || !productTypePath.value || !product.id) {
    isLoadingQuote.value = false
    return
  }
  isLoadingQuote.value = true
  quoteError.value = ''
  try {
    const res = await getTerminationQuote(authStore.accessToken, productTypePath.value, product.id)
    quote.value = res?.data ?? res
  } catch (e) {
    console.error('중도해지 예상 조회 실패:', e.message)
    quoteError.value = '예상 금액을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoadingQuote.value = false
  }
}

// 경과율 구간별 적용 이율 비율 (약정금리 대비 비율)
function getTerminationTierRate(progress) {
  const p = Number(progress ?? 0)
  if (p < 25) return 10
  if (p < 50) return 30
  if (p < 75) return 60
  if (p < 100) return 80
  return 100
}

const progressPercent = computed(() => quote.value?.progressPercent ?? 0)

// 항상 명세 규칙(25% 미만 -> 10%, 25~49% -> 30%, 50~74% -> 60%, 75%이상 -> 80%)에 따라 산출
const appliedRatePercent = computed(() => {
  return getTerminationTierRate(progressPercent.value)
})

const totalRefund = computed(() => quote.value?.finalAmount ?? 0)
const principalAmount = computed(() => quote.value?.principalAmount ?? 0)
const interestAmount = computed(() => quote.value?.interestAmount ?? 0)
const scorePenalty = computed(() => Math.abs(quote.value?.scoreChange ?? 0))

const estimatedScore = computed(() => Math.max(0, currentScore.value - scorePenalty.value))
const scorePercentage = computed(() => Math.min(100, Math.max(0, (estimatedScore.value / 1000) * 100)))

// 동의 체크박스 및 모달 상태
const agreeCancel = ref(false)
const showSuccessModal = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const finalResult = ref(null)

function goToMyProducts() {
  router.push({ name: 'child-finance-myproducts' })
}

async function handleTerminationSubmit() {
  if (!agreeCancel.value || isSubmitting.value || !quote.value) return
  isSubmitting.value = true
  submitError.value = ''
  try {
    const res = await terminateEnrollment(authStore.accessToken, productTypePath.value, product.id)
    finalResult.value = res?.data ?? res

    try {
      const today = new Date()
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      localStorage.setItem(`teeny_terminated_date_${product.id}`, iso)
    } catch (e) {
      console.warn('중도해지일 로컬 저장 실패:', e)
    }

    showSuccessModal.value = true
  } catch (e) {
    console.error('중도해지 실행 실패:', e)
    submitError.value =
      e.status === 409
        ? '이미 해지되었거나 만기에 도달한 상품이에요.'
        : (e.message || '중도해지 처리에 실패했어요. 잠시 후 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

function closeModalAndNavigate() {
  showSuccessModal.value = false
  router.push({ name: 'child-finance-myproducts' })
}

// ================== 대출 조기상환 ==================
const repayAmount = ref(0)
const repayQuote = ref(null)
const isLoadingRepayQuote = ref(false)
const repayQuoteError = ref('')
const agreeRepay = ref(false)
const isRepaySubmitting = ref(false)
const repaySubmitError = ref('')
const repayFinalResult = ref(null)
const showRepaySuccessModal = ref(false)

function onRepayAmountInput(e) {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  repayAmount.value = raw ? parseInt(raw, 10) : 0
  // 금액이 바뀌면 이전 조회 결과는 무효화
  repayQuote.value = null
  agreeRepay.value = false
}

const canFetchRepayQuote = computed(() => isLoan.value && repayAmount.value > 0 && !isLoadingRepayQuote.value)

async function fetchRepayQuote() {
  if (!canFetchRepayQuote.value) return
  isLoadingRepayQuote.value = true
  repayQuoteError.value = ''
  repayQuote.value = null
  try {
    const res = await getEarlyRepaymentQuote(authStore.accessToken, product.id, repayAmount.value)
    repayQuote.value = res?.data ?? res
  } catch (e) {
    console.error('조기상환 예상 조회 실패:', e.message)
    repayQuoteError.value = e.message || '예상 금액을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoadingRepayQuote.value = false
  }
}

const repayWillBeFullyPaid = computed(() => repayQuote.value?.remainingOutstandingPrincipal === 0)
const repayScoreDelta = computed(() => repayQuote.value?.scoreChange ?? 0)
const repayEstimatedScore = computed(() => {
  const next = currentScore.value + repayScoreDelta.value
  return Math.max(0, Math.min(1000, next))
})

function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const canSubmitRepay = computed(() =>
  isLoan.value && !!repayQuote.value && agreeRepay.value && !isRepaySubmitting.value
)

async function handleRepaySubmit() {
  if (!canSubmitRepay.value) return
  isRepaySubmitting.value = true
  repaySubmitError.value = ''
  try {
    const res = await executeEarlyRepayment(authStore.accessToken, product.id, {
      amount: repayAmount.value,
      idempotencyKey: generateIdempotencyKey(),
    })
    repayFinalResult.value = res?.data ?? res

    // 이 조기상환으로 대출이 완전히 상환됐다면, 백엔드가 실제 상환 완료일을 내려주지 않으므로
    // 지금 이 시점을 완료일로 캐싱해서 나중에 원래 만기일 대신 보여준다.
    if (repayWillBeFullyPaid.value) {
      try {
        const today = new Date()
        const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        localStorage.setItem(`teeny_repaid_date_${product.id}`, iso)
      } catch (e) {
        console.warn('상환 완료일 로컬 저장 실패:', e)
      }
    }

    showRepaySuccessModal.value = true
  } catch (e) {
    console.error('조기상환 실행 실패:', e)
    repaySubmitError.value =
      e.status === 409
        ? '상환 중인 대출이 아니거나 잔액이 부족해요.'
        : e.status === 400
          ? '남은 상환 금액을 초과했어요. 금액을 다시 확인해주세요.'
          : (e.message || '조기상환 처리에 실패했어요. 잠시 후 다시 시도해주세요.')
  } finally {
    isRepaySubmitting.value = false
  }
}

function closeRepayModalAndNavigate() {
  showRepaySuccessModal.value = false
  router.push({ name: 'child-finance-myproducts' })
}

onMounted(async () => {
  try {
    const res = await getTeenyScore(authStore.accessToken, authStore.memberId)
    currentScore.value = res?.data?.teenyScore ?? res?.teenyScore ?? 0
  } catch (e) {
    console.error('티니점수 조회 실패:', e.message)
  }
  await loadQuote()
})
</script>

<template>
  <div class="product-screen">
    <ChildPageNav :title="isLoan ? '조기상환' : '중도해지'" @back="goToMyProducts" />

    <!-- 스크롤 영역 -->
    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">

      <!-- 상품 헤더 카드 -->
      <section class="card product-card">
        <div class="title-row">
          <span class="badge" :class="badgeColor">{{ product.category }}</span>
          <span class="prod-title">{{ product.title }}</span>
          <button
            type="button"
            class="btn-help-inline"
            @click.stop="openTermModal(isLoan ? '조기상환' : '중도해지')"
            aria-label="도움말 보기"
          >?</button>
        </div>
        <p class="prod-desc">{{ desc }}</p>
      </section>

      <!-- ================== 대출: 조기상환 폼 ================== -->
      <template v-if="isLoan">

        <!-- 금액 입력 카드 -->
        <section class="card">
          <h3 class="card-section-title">상환할 금액</h3>
          <div class="amount-input-box">
            <input
              type="text"
              inputmode="numeric"
              class="amount-input"
              placeholder="0"
              :value="repayAmount ? repayAmount.toLocaleString() : ''"
              @input="onRepayAmountInput"
            />
            <span class="currency">원</span>
          </div>
          <button
            type="button"
            class="quote-btn"
            :disabled="!canFetchRepayQuote"
            @click="fetchRepayQuote"
          >
            {{ isLoadingRepayQuote ? '조회 중...' : '예상 금액 조회' }}
          </button>
          <p v-if="repayQuoteError" class="submit-error">{{ repayQuoteError }}</p>
        </section>

        <!-- 조회 결과 카드 -->
        <template v-if="repayQuote">
          <section class="card summary-card">
            <span class="summary-label">
              {{ repayWillBeFullyPaid ? '완납 후 남는 원금' : '상환 후 남는 원금' }}
            </span>
            <h2 class="summary-amount">{{ repayQuote.remainingOutstandingPrincipal.toLocaleString() }}원</h2>
            <div v-if="repayWillBeFullyPaid" class="paid-off-badge">
              이 대출은 이번 상환으로 완전히 종료돼요
            </div>
          </section>

          <section class="card detail-card">
            <h3 class="card-section-title">상환 내역</h3>
            <div class="detail-rows">
              <div class="detail-row">
                <span class="d-label">연체이자 충당</span>
                <span class="d-value">{{ repayQuote.paidInterestAmount.toLocaleString() }}원</span>
              </div>
              <div class="detail-row">
                <span class="d-label">원금 상환</span>
                <span class="d-value">{{ repayQuote.paidPrincipalAmount.toLocaleString() }}원</span>
              </div>
              <div class="detail-row">
                <span class="d-label">남은 연체이자</span>
                <span class="d-value">{{ repayQuote.remainingOverdueInterest.toLocaleString() }}원</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="detail-row final-row">
              <span class="final-label">남은 원금</span>
              <span class="final-amount">{{ repayQuote.remainingOutstandingPrincipal.toLocaleString() }}원</span>
            </div>
          </section>

          <!-- 티니점수 변화 카드 -->
          <section class="card score-card">
            <h3 class="card-section-title">티니점수 변화</h3>

            <div class="score-status-group">
              <div class="score-col left">
                <span class="s-label">현재 점수</span>
                <span class="s-val">{{ currentScore }}점</span>
              </div>

              <div class="score-col center">
                <span class="up-badge" v-if="repayScoreDelta > 0">▲ {{ repayScoreDelta }}점</span>
                <span class="drop-badge" v-else-if="repayScoreDelta < 0">▼ {{ Math.abs(repayScoreDelta) }}점</span>
                <span class="flat-badge" v-else>변화 없음</span>
                <span class="drop-sub" v-if="repayScoreDelta !== 0">{{ repayScoreDelta > 0 ? '증가' : '감소' }}</span>
              </div>

              <div class="score-col right">
                <span class="s-label">상환 후 예상</span>
                <span class="s-val" :class="{ red: repayScoreDelta < 0, blue: repayScoreDelta > 0 }">{{ repayEstimatedScore }}점</span>
              </div>
            </div>

            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (repayEstimatedScore / 1000) * 100 + '%' }"></div>
              </div>
              <div class="progress-labels">
                <span>0점</span>
                <span>1000점</span>
              </div>
            </div>
          </section>

          <!-- 동의 체크박스 및 액션 버튼 -->
          <section class="action-section">
            <div class="checkbox-wrapper" @click="agreeRepay = !agreeRepay">
              <div class="custom-checkbox" :class="{ checked: agreeRepay }">
                <svg v-if="agreeRepay" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="checkbox-label">위 내용을 확인하였으며, 조기상환에 동의합니다.</span>
            </div>

            <p v-if="repaySubmitError" class="submit-error">{{ repaySubmitError }}</p>

            <button
              type="button"
              class="submit-btn"
              :class="{ active: canSubmitRepay }"
              :disabled="!canSubmitRepay"
              @click="handleRepaySubmit"
            >
              {{ isRepaySubmitting ? '처리 중...' : '조기상환 신청' }}
            </button>

            <button type="button" class="cancel-btn" @click="goToMyProducts">돌아가기</button>
          </section>
        </template>
      </template>

      <!-- ================== 예·적금: 중도해지 (기존 로직) ================== -->
      <template v-else-if="isLoadingQuote">
        <section class="card notice-card">
          <p class="prod-desc">예상 해지 금액을 불러오는 중이에요...</p>
        </section>
      </template>

      <template v-else-if="quoteError">
        <section class="card notice-card">
          <p class="prod-desc error-text">{{ quoteError }}</p>
        </section>
      </template>

      <template v-else-if="quote">
        <!-- 지금 해지하면 받을 금액 요약 카드 -->
        <section class="card summary-card">
          <span class="summary-label">지금 해지하면 받을 금액</span>
          <h2 class="summary-amount">{{ totalRefund.toLocaleString() }}원</h2>
          <div class="score-drop" v-if="scorePenalty > 0">
            <span class="red-text">▼ {{ scorePenalty }}점</span>
            <span class="gray-text">티니점수 감소</span>
          </div>
        </section>

        <!-- 해지 내역 상세 카드 -->
        <section class="card detail-card">
          <h3 class="card-section-title">해지 내역</h3>
          <div class="detail-rows">
            <div class="detail-row">
              <span class="d-label">현재까지 납입한 원금</span>
              <span class="d-value">{{ principalAmount.toLocaleString() }}원</span>
            </div>
            <div class="detail-row">
              <span class="d-label">진행률</span>
              <span class="d-value">{{ quote.progressPercent ?? 0 }}%</span>
            </div>
            <div class="detail-row">
              <span class="d-label">중도해지 적용 이율</span>
              <span class="d-value blue">약정금리의 {{ appliedRatePercent }}%</span>
            </div>
            <div class="detail-row">
              <span class="d-label">받을 이자</span>
              <span class="d-value blue">{{ interestAmount.toLocaleString() }}원</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-row final-row">
            <span class="final-label">최종 지급액</span>
            <span class="final-amount">{{ totalRefund.toLocaleString() }}원</span>
          </div>
        </section>

        <!-- 티니점수 변화 예측 카드 -->
        <section class="card score-card">
          <h3 class="card-section-title">티니점수 변화</h3>

          <div class="score-status-group">
            <div class="score-col left">
              <span class="s-label">현재 점수</span>
              <span class="s-val">{{ currentScore }}점</span>
            </div>

            <div class="score-col center">
              <span class="drop-badge">▼ {{ scorePenalty }}점</span>
              <span class="drop-sub">감소</span>
            </div>

            <div class="score-col right">
              <span class="s-label">해지 후 예상</span>
              <span class="s-val red">{{ estimatedScore }}점</span>
            </div>
          </div>

          <!-- 티니점수 바 -->
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: scorePercentage + '%' }"></div>
            </div>
            <div class="progress-labels">
              <span>0점</span>
              <span>1000점</span>
            </div>
          </div>

          <!-- 경고 박스 -->
          <div class="warning-box">
            중도해지 시 티니점수가 {{ scorePenalty }}점 감소하며, 이후 상품 가입 조건에 영향을 줄 수 있어요.
          </div>
        </section>
      </template>

      <!-- 동의 체크박스 및 액션 버튼 (예·적금) -->
      <section class="action-section" v-if="!isLoan && quote">
        <div class="checkbox-wrapper" @click="agreeCancel = !agreeCancel">
          <div class="custom-checkbox" :class="{ checked: agreeCancel }">
            <svg v-if="agreeCancel" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="checkbox-label">위 내용을 확인하였으며, 중도해지에 동의합니다.</span>
        </div>

        <p v-if="submitError" class="submit-error">{{ submitError }}</p>

        <button
          type="button"
          class="submit-btn"
          :class="{ active: agreeCancel && !isSubmitting }"
          :disabled="!agreeCancel || isSubmitting"
          @click="handleTerminationSubmit"
        >
          {{ isSubmitting ? '처리 중...' : '중도해지 신청' }}
        </button>

        <button type="button" class="cancel-btn" @click="goToMyProducts">돌아가기</button>
      </section>
    </div>

    <!-- 해지 완료 모달 -->
    <Transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModalAndNavigate">
        <div class="modal-card">
          <div class="modal-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="modal-title">중도해지가 완료되었어요</h3>
          <p class="modal-desc">
            해지 금액 <strong>{{ (finalResult?.finalAmount ?? totalRefund).toLocaleString() }}원</strong>이<br/>티니머니 지갑으로 입금되었어요.
          </p>
          <button type="button" class="modal-confirm-btn" @click="closeModalAndNavigate">
            확인
          </button>
        </div>
      </div>
    </Transition>

    <!-- 조기상환 완료 모달 -->
    <Transition name="modal-fade">
      <div v-if="showRepaySuccessModal" class="modal-overlay" @click.self="closeRepayModalAndNavigate">
        <div class="modal-card">
          <div class="modal-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="modal-title">
            {{ repayFinalResult?.remainingOutstandingPrincipal === 0 ? '대출이 모두 상환되었어요' : '조기상환이 완료되었어요' }}
          </h3>
          <p class="modal-desc">
            <strong>{{ (repayFinalResult?.requestedAmount ?? repayAmount).toLocaleString() }}원</strong>을 상환했어요.<br/>
            남은 원금은 <strong>{{ (repayFinalResult?.remainingOutstandingPrincipal ?? 0).toLocaleString() }}원</strong>이에요.
          </p>
          <button type="button" class="modal-confirm-btn" @click="closeRepayModalAndNavigate">
            확인
          </button>
        </div>
      </div>
    </Transition>

    <!-- 금융 용어 사전 도움말 모달 -->
    <FinanceTermModal
      :show="showTermModal"
      :term-data="activeTermData"
      @close="closeTermModal"
    />

    <Chatbot :hide-for-modal="showTermModal || showSuccessModal || showRepaySuccessModal" hint-text="중도해지나 조기상환이 궁금하세요?" />
  </div>
</template>

<style scoped>
.product-screen {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  padding-top: 50px;
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 20px 10px;
  background: #f8fafc;
  flex: none;
}

.icon-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: #15171b;
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 20px 20px;
  background: #f8fafc;
}

.scroll::-webkit-scrollbar {
  width: 3px;
}

.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}

.scroll.scrolling::-webkit-scrollbar-thumb {
  background: #d8dbdf;
}

/* 통일된 화이트 카드 스타일 */
.card {
  background: #ffffff;
  border: 1.3px solid #f0f1f3;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.btn-help-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #4d596b;
  font-size: 10.5px;
  font-weight: 800;
  cursor: pointer;
  vertical-align: middle;
  padding: 0;
  line-height: 1;
  transition: all 0.15s ease;
}

.btn-help-inline:hover {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #15171b;
  transform: scale(1.18);
}

.badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
}

.badge.blue {
  background: #eef4fc;
  color: #3b74b8;
  border: 1px solid #dce8f8;
}

.badge.orange {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}

.prod-title {
  font-weight: 800;
  font-size: 15.5px;
  color: #15171b;
}

.prod-desc {
  margin: 2px 0 0;
  font-weight: 500;
  font-size: 12.5px;
  color: #6b7077;
}

.notice-card {
  text-align: center;
  padding: 24px 16px;
}

.notice-text {
  color: #525863;
  line-height: 1.4;
}

.error-text {
  color: #e0554f;
  font-weight: 600;
}

/* 조기상환 금액 입력 */
.amount-input-box {
  display: flex;
  align-items: center;
  background: #f4f6f8;
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 20px;
  font-weight: 800;
  color: #15171b;
  outline: none;
  width: 100%;
}
.amount-input::placeholder {
  color: #b0b5bc;
}

.currency {
  font-size: 16px;
  font-weight: 700;
  color: #15171b;
  margin-left: 4px;
}

.quote-btn {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  border: 1.3px solid #ffbc00;
  background: #fff9e6;
  color: #a16a00;
  font-family: inherit;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.quote-btn:disabled {
  border-color: #e7e9ec;
  background: #f2f4f6;
  color: #b0b5bc;
  cursor: not-allowed;
}

.paid-off-badge {
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eef8ee;
  color: #2e8540;
  font-weight: 700;
  font-size: 11.5px;
}

/* 요약 카드 */
.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  text-align: center;
  background: #ffffff;
}

.summary-label {
  font-weight: 600;
  font-size: 12.5px;
  color: #6b7077;
  margin-bottom: 4px;
}

.summary-amount {
  margin: 0 0 6px;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.5px;
  color: #15171b;
}

.score-drop {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.red-text {
  font-weight: 700;
  color: #e0554f;
}

.gray-text {
  font-weight: 500;
  color: #777b81;
}

/* 해지/상환 내역 카드 */
.card-section-title {
  margin: 0 0 14px;
  font-weight: 800;
  font-size: 14px;
  color: #15171b;
}

.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.d-label {
  font-weight: 600;
  font-size: 12.5px;
  color: #6b7077;
}

.d-value {
  font-weight: 700;
  font-size: 12.5px;
  color: #15171b;
}

.d-value.blue {
  color: #4d8ad6;
}

.divider {
  height: 1px;
  background: #f0f2f4;
  margin: 14px 0 12px;
}

.final-row {
  padding-top: 2px;
}

.final-label {
  font-weight: 800;
  font-size: 14px;
  color: #15171b;
}

.final-amount {
  font-weight: 800;
  font-size: 16.5px;
  color: #15171b;
}

/* 티니점수 변화 카드 */
.score-status-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.score-col {
  display: flex;
  flex-direction: column;
}

.score-col.left { align-items: flex-start; }
.score-col.center { align-items: center; }
.score-col.right { align-items: flex-end; }

.s-label {
  font-weight: 600;
  font-size: 11.5px;
  color: #6b7077;
  margin-bottom: 2px;
}

.s-val {
  font-weight: 800;
  font-size: 18px;
  color: #15171b;
}

.s-val.red {
  color: #e0554f;
}

.s-val.blue {
  color: #4d8ad6;
}

.drop-badge {
  font-weight: 800;
  font-size: 13px;
  color: #e0554f;
}

.up-badge {
  font-weight: 800;
  font-size: 13px;
  color: #2e8540;
}

.flat-badge {
  font-weight: 700;
  font-size: 12px;
  color: #777b81;
}

.drop-sub {
  font-weight: 500;
  font-size: 10.5px;
  color: #777b81;
}

.progress-container {
  margin-bottom: 14px;
}

.progress-bar {
  width: 100%;
  height: 7px;
  background: #eef1f4;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: #e0554f;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  font-size: 11px;
  color: #8b9097;
}

.warning-box {
  background: #fff8f8;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.45;
  color: #e0554f;
}

/* 액션 영역 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.checkbox-wrapper {
  background: #fdfdfd;
  border: 1.3px solid #f0f1f3;
  border-radius: 12px;
  padding: 13px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid #c6cbd2;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex: none;
}

.custom-checkbox.checked {
  background: #e0554f;
  border-color: #e0554f;
}

.checkbox-label {
  font-weight: 600;
  font-size: 12px;
  color: #4a4e55;
  line-height: 1.4;
}

.submit-error {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #e0554f;
  padding: 0 4px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: #f2f4f6;
  border-radius: 12px;
  border: none;
  font-family: inherit;
  font-weight: 800;
  font-size: 15px;
  color: #777b81;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.submit-btn.active {
  background: #e0554f;
  color: #ffffff;
  cursor: pointer;
}
.submit-btn.active:active {
  opacity: 0.9;
}

.cancel-btn {
  width: 100%;
  height: 48px;
  background: #ffffff;
  border: 1.3px solid #e7e9ec;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14.5px;
  color: #4a4e55;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancel-btn:hover {
  background: #f8fafc;
  color: #15171b;
}

/* 완료 모달 */
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 110;
  padding: 24px;
  box-sizing: border-box;
}

.modal-card {
  width: 100%;
  max-width: 290px;
  background: #ffffff;
  border-radius: 20px;
  padding: 26px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
}

.modal-icon.warning {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.modal-title {
  margin: 0 0 6px;
  font-weight: 800;
  font-size: 17px;
  color: #15171b;
}

.modal-desc {
  margin: 0 0 20px;
  font-weight: 500;
  font-size: 13.5px;
  line-height: 1.45;
  color: #525863;
}

.modal-desc strong {
  color: #15171b;
  font-weight: 700;
}

.modal-confirm-btn {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.modal-confirm-btn:active {
  opacity: 0.85;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>