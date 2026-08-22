<template>
  <div class="product-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">{{ pageTitle }}</h1>
      <ChildNavActions />
    </div>

    <!-- 스크롤 영역 -->
    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- 1. 가입 상품 헤더 -->
      <section class="product-header">
        <span class="sub-title">{{ categoryHeaderLabel }}</span>
        <h2 class="product-title">{{ confirmData.title }}</h2>
        <p class="product-sub">{{ confirmData.productTypeDesc }}</p>
      </section>

      <!-- 2. 신청 내용 상세 목록 -->
      <section class="detail-section">
        <label class="section-label">신청 내용</label>

        <div class="row">
          <span class="row-label">{{ confirmData.amountLabel }}</span>
          <span class="row-value">{{ confirmData.amount.toLocaleString() }}원</span>
        </div>

        <div class="row border-top">
          <span class="row-label">{{ confirmData.periodLabel }}</span>
          <span class="row-value">{{ confirmData.period }}개월</span>
        </div>

        <!-- 대출 상환 방식 표시 (대출일 때만) -->
        <div class="row border-top" v-if="isLoan">
          <span class="row-label">
            상환 방식
            <button type="button" class="btn-help-inline" @click.stop="openTermModal(confirmData.repaymentTypeDesc)" aria-label="도움말 보기">?</button>
          </span>
          <span class="row-value">{{ confirmData.repaymentTypeDesc }}</span>
        </div>

        <div class="row border-top multiline">
          <span class="row-label">
            적용금리
            <button type="button" class="btn-help-inline" @click.stop="openTermModal(interestType)" aria-label="도움말 보기">?</button>
          </span>
          <div class="row-value-group">
            <span class="row-value highlight-blue">{{ confirmData.appliedRate }}</span>
            <span class="row-subtext">{{ confirmData.cancelPenaltyNote }}</span>
          </div>
        </div>

        <div class="row border-top" v-if="confirmData.autoTransfer">
          <span class="row-label">{{ isLoan ? '자동상환일' : '자동이체일' }}</span>
          <span class="row-value">매월 {{ confirmData.transferDay }}일</span>
        </div>

        <div class="row border-top" v-if="confirmData.autoTransfer">
          <span class="row-label">출금계좌</span>
          <span class="row-value">{{ confirmData.debitAccount }}</span>
        </div>

        <div class="row border-top">
          <span class="row-label">{{ isLoan ? '만기 상환일' : '만기일' }}</span>
          <span class="row-value">{{ confirmData.maturityDate }}</span>
        </div>
      </section>

      <!-- 3. 예상 만기 수령액/상환액 요약 박스 -->
      <section class="maturity-summary-box">
        <div class="maturity-top">
          <span class="maturity-title">{{ isLoan ? '총 상환 예정 금액' : '예상 만기 수령액' }}</span>
          <span class="maturity-total">{{ confirmData.totalReturn.toLocaleString() }}원</span>
        </div>
        <p class="maturity-detail">
          <template v-if="isLoan">
            원금 {{ confirmData.principal.toLocaleString() }}원 + 총 이자 {{ confirmData.interest.toLocaleString() }}원
            <template v-if="confirmData.score > 0">
              <br>(정상 완납 시 티니점수 +{{ confirmData.score }}점)
            </template>
          </template>
          <template v-else>
            <template v-if="isSavings && isFreeSaving">
              (매월 한 달 목표금액만큼 입금 시)<br>
            </template>
            원금 {{ confirmData.principal.toLocaleString() }}원 + 이자 {{ confirmData.interest.toLocaleString() }}원
            <template v-if="confirmData.score > 0">
              + 티니점수 {{ confirmData.score }}점
            </template>
          </template>
        </p>
      </section>

      <!-- 4. 약관 및 필수 동의 체크박스 리스트 -->
      <section class="terms-section">
        <div class="check-item" @click="agreeConfirm = !agreeConfirm">
          <div class="check-circle" :class="{ checked: agreeConfirm }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#15171b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="check-label">
            {{ isLoan ? '총 상환 예정 금액 및 이자를 확인했어요' : '예상 만기 수령액 및 금리를 확인했어요' }}
            <span class="required">(필수)</span>
          </span>
        </div>

        <div class="check-item border-top" v-if="confirmData.autoTransfer" @click="agreeAutoTransfer = !agreeAutoTransfer">
          <div class="check-circle" :class="{ checked: agreeAutoTransfer }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#15171b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="check-label">
            {{ isLoan ? '자동상환 출금에 동의해요' : '자동이체 출금에 동의해요' }}
            <span class="required">(필수)</span>
          </span>
        </div>
      </section>

      <!-- 가입/신청 완료 버튼 (스크롤에 포함) -->
      <div class="footer">
        <div class="submit-wrapper">
          <button
            type="button"
            class="submit-btn"
            :class="{ active: isAllAgreed && !isSubmitting }"
            :disabled="!isAllAgreed || isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? '처리 중...' : (isLoan ? '대출 신청 완료' : '가입 완료') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 가입/신청 완료 모달 -->
    <Transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModalAndNavigate">
        <div class="modal-card">
          <div class="modal-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#15171b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="modal-title">{{ isLoan ? '대출 신청 완료!' : '가입 신청 완료!' }}</h3>
          <p class="modal-desc">
            <strong>{{ confirmData.title }}</strong> {{ isLoan ? '신청이 성공적으로 완료되었어요.' : '가입 신청이 성공적으로 완료되었어요.' }}
          </p>
          <button type="button" class="modal-confirm-btn" @click="closeModalAndNavigate">
            확인
          </button>
        </div>
      </div>
    </Transition>

    <!-- 에러 / 알림 커스텀 모달 -->
    <div v-if="errorModalVisible" class="error-backdrop" @click.self="closeErrorModal">
      <div class="error-dialog">
        <div class="error-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5M12 16.5h.01" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="error-title">가입 신청 안내</h4>
        <p class="error-desc">{{ errorMessage }}</p>
        <button type="button" class="btn-error-confirm" @click="closeErrorModal">
          확인
        </button>
      </div>
    </div>

    <!-- 금융 용어 사전 도움말 모달 -->
    <FinanceTermModal
      :show="showTermModal"
      :term-data="activeTermData"
      @close="closeTermModal"
    />

    <!-- 확인/제출 단계라 말풍선 없이 캐릭터만 노출 -->
    <Chatbot :hide-for-modal="showTermModal || showSuccessModal || errorModalVisible" hint-text="금융 계약 내용이 궁금하세요?" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getFinanceTerm } from '@/constants/financeTerms';
import { useAuthStore } from '@/stores/auth'
import { createSavingEnrollment, createLoanEnrollment, createDepositEnrollment } from '@/api/finance'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import FinanceTermModal from '@/components/Child/FinanceTermModal.vue';
import { formatRepaymentType } from '@/utils/financialProductMapper'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore()

// 어려운 금융 용어 설명 모달 상태
const showTermModal = ref(false);
const activeTermData = ref(null);

function openTermModal(termName) {
  const data = getFinanceTerm(termName);
  if (data) {
    activeTermData.value = data;
    showTermModal.value = true;
  }
}

function closeTermModal() {
  showTermModal.value = false;
  activeTermData.value = null;
}

const isScrolling = ref(false);
let scrollTimer = null;
function onScroll() {
  isScrolling.value = true;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => { isScrolling.value = false; }, 800);
}

const rawCategory = route.query.category || '적금'
const isSavings   = rawCategory === '적금'
const isDeposit   = rawCategory === '예금'
const isLoan      = rawCategory === '대출'

const savingsType = route.query.savingsType || ''
const isFreeSaving = savingsType === '자유적금'
const interestType = route.query.interestType || '단리'

// 만기일 계산 (사용자가 선택한 상환일/이체일 반영)
function calcMaturityDate(periodMonths, customDay) {
  const d = new Date()
  const monthsToAdd = Number(periodMonths || 0)
  const targetMonthIndex = d.getMonth() + monthsToAdd
  const targetYear = d.getFullYear() + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12

  const preferredDay = Number(customDay) || d.getDate()
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const finalDay = Math.min(preferredDay, lastDayOfTargetMonth)

  const pad = (n) => String(n).padStart(2, '0')
  return `${targetYear}.${pad(targetMonth + 1)}.${pad(finalDay)}`
}

const productId = Number(route.query.productId)
const amount    = Number(route.query.amount)    || 0
const period    = Number(route.query.period)    || 0
const total     = Number(route.query.total)     || 0
const interest  = Number(route.query.interest)  || 0
const principal = isSavings ? amount * period : amount

// 실제 자동이체/상환일 선택값 (신청 화면에서 넘어온 값 그대로, 표시용 confirmData.autoTransfer와는 별개)
const rawAutoTransfer = route.query.autoTransfer === 'true' || route.query.autoTransfer === true

const repaymentTypeDesc = formatRepaymentType(route.query.repaymentType, '원리금균등상환')

// 엑셀 정책 표 기반 예상 티니점수 가점
const DEPOSIT_SCORE = { 1: 6, 3: 19, 6: 39, 12: 79 }
const FIXED_SAVING_SCORE = { 1: 7, 3: 22, 6: 45, 12: 91 }
const FREE_SAVING_SCORE = { 1: 8, 3: 24, 6: 48, 12: 96 }

const expectedScore = computed(() => {
  if (isLoan) return 6 // 만기 완납 시 +6점
  if (isDeposit) return DEPOSIT_SCORE[period] || 0
  if (isSavings) return isFreeSaving ? (FREE_SAVING_SCORE[period] || 0) : (FIXED_SAVING_SCORE[period] || 0)
  return 0
})

// 금리 포맷 (백엔드 expectedAppliedRate는 이미 퍼센트 값, 예: 3.5 = 3.5%. ×100 하면 안 됨)
const appliedRate = route.query.appliedRate 
  ? `${Number(route.query.appliedRate).toFixed(1)}%` 
  : (route.query.rate || '')

// 페널티 안내문구 (엑셀 정책 반영)
const cancelPenaltyNote = computed(() => {
  if (isLoan) return '상환 지연 시 연체이율 적용 및 티니점수 최대 -20점 감점'
  if (isSavings) return '중도 해지 시 진행률별 차등 이율 적용 및 티니점수 감점'
  return '중도 해지 시 약정금리의 10~80% 적용 및 티니점수 감점'
})

const pageTitle = computed(() => isLoan ? '대출 신청 확인' : '가입 신청 확인')
const categoryHeaderLabel = computed(() => {
  if (isLoan) return '신청 상품'
  return '가입 상품'
})

// 금액 라벨 분기
const amountLabel = computed(() => {
  if (isLoan) return '대출 신청금액'
  if (isDeposit) return '예치 금액'
  return isFreeSaving ? '한 달 목표금액' : '월 약정 납입금액'
})

// 상품 종류 설명 분기
const productTypeDesc = computed(() => {
  if (isLoan) return '소액대출 · 필요할 때 빌리고 매월 갚아요'
  if (isDeposit) return '정기예금 · 목표까지 안전하게 저축'
  return isFreeSaving ? '자유적립식 · 원할 때 자유롭게 저축' : '정액적립식 · 매월 정기 저축'
})

const selectedPaymentDay = Number(route.query.paymentDay) || 1

const confirmData = reactive({
  title:            route.query.title || '금융 상품',
  productTypeDesc,
  amountLabel,
  amount,
  periodLabel:      isLoan ? '상환기간' : (isDeposit ? '예치기간' : '가입기간'),
  period,
  repaymentTypeDesc,
  appliedRate,
  cancelPenaltyNote,
  autoTransfer:     route.query.autoTransfer === 'true' || route.query.autoTransfer === true || isLoan,
  transferDay:      selectedPaymentDay,
  debitAccount:     '티니머니 지갑',
  maturityDate:     calcMaturityDate(period, selectedPaymentDay),
  principal,
  interest,
  score:            expectedScore.value,
  totalReturn:      total || principal + interest,
})

const agreeConfirm = ref(false);
const agreeAutoTransfer = ref(false);

// 자동이체가 미설정되었거나 예금인 경우 1개만 동의하면 제출 가능
const isAllAgreed = computed(() =>
  confirmData.autoTransfer
    ? agreeConfirm.value && agreeAutoTransfer.value
    : agreeConfirm.value
)

const showSuccessModal = ref(false);
const isSubmitting = ref(false);

// 에러 모달 상태 관리
const errorModalVisible = ref(false);
const errorMessage = ref('');

function showErrorModal(msg) {
  errorMessage.value = msg || '신청에 실패했어요. 다시 시도해 주세요.';
  errorModalVisible.value = true;
}

function closeErrorModal() {
  errorModalVisible.value = false;
}

const goBack = () => { router.back(); };

// "가입 완료"를 눌렀을 때 실제로 가입 신청 API를 호출한다.
const handleSubmit = async () => {
  if (!isAllAgreed.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    if (isSavings) {
      await createSavingEnrollment(authStore.accessToken, {
        productId,
        monthlyAmount: amount,
        termMonths: period,
        autoTransfer: isFreeSaving ? false : rawAutoTransfer,
        paymentDay: isFreeSaving ? 1 : selectedPaymentDay,
      })
    } else if (isDeposit) {
      await createDepositEnrollment(authStore.accessToken, {
        productId,
        amount,
        termMonths: period,
      })
    } else if (isLoan) {
      const result = await createLoanEnrollment(authStore.accessToken, {
        productId,
        principalAmount: amount,
        termMonths: period,
        autoTransfer: rawAutoTransfer,
        paymentDay: selectedPaymentDay,
      })

      if (result?.enrollmentId) {
        try {
          localStorage.setItem(`teeny_loan_principal_${result.enrollmentId}`, String(amount))
        } catch (e) {
          console.warn('대출 원금 로컬 저장 실패:', e)
        }
      }
    }

    showSuccessModal.value = true;
  } catch (e) {
    console.error('금융상품 신청 실패:', e.message);
    showErrorModal(e.message || '신청에 실패했어요. 다시 시도해 주세요.');
  } finally {
    isSubmitting.value = false;
  }
};

const closeModalAndNavigate = () => {
  showSuccessModal.value = false;
  router.push({ name: 'child-finance-myproducts' })
};
</script>

<style scoped>
/* 메인 프레임 */
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

/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 10px;
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

/* 스크롤 영역 */
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 16px;
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

/* 1. 가입 상품 헤더 */
.product-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
}

.sub-title {
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: #6a6f76;
  margin-bottom: 6px;
}

.product-title {
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
  margin-bottom: 4px;
  word-break: keep-all;
}

.product-sub {
  font-weight: 500;
  font-size: 12px;
  color: #8b9097;
  word-break: keep-all;
}

/* 2. 상세 내역 */
.detail-section {
  box-sizing: border-box;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
}

.section-label {
  display: block;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  color: #6a6f76;
  margin-bottom: 8px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.row.border-top {
  border-top: 1.3px solid #f0f1f3;
}

.row.multiline {
  align-items: flex-start;
}

.row-label {
  font-size: 14px;
  color: #4d596b;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.btn-help-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  margin-left: 4px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #4d596b;
  font-size: 10px;
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

.row-value {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
  text-align: right;
}

.row-value.highlight-blue {
  color: #4d8ad6;
}

.row-value-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.row-subtext {
  font-weight: 500;
  font-size: 11px;
  color: #6a6f76;
  text-align: right;
  line-height: 1.35;
  word-break: keep-all;
}

/* 3. 만기 예상 수령액 박스 */
.maturity-summary-box {
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.maturity-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.maturity-title {
  font-weight: 700;
  font-size: 13px;
  color: #4a4e55;
}

.maturity-total {
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
  letter-spacing: -0.4px;
}

.maturity-detail {
  font-weight: 500;
  font-size: 11px;
  color: #6b7077;
  line-height: 1.4;
  word-break: keep-all;
}

/* 4. 약관 체크박스 */
.terms-section {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  padding: 4px 16px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  cursor: pointer;
}

.check-item.border-top {
  border-top: 1.3px solid #f0f1f3;
}

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e7e9ec;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.check-circle.checked {
  background: #ffbc00;
}

.check-label {
  font-weight: 500;
  font-size: 12.5px;
  color: #15171b;
  word-break: keep-all;
}

.required {
  color: #6a6f76;
  font-weight: 400;
}

/* 하단 버튼 영역 */
.footer {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 0 8px;
}

.submit-wrapper {
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: #f2f4f6;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  color: #787c81;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.submit-btn.active {
  background: #ffbc00;
  color: #15171b;
  cursor: pointer;
}

/* 모달 CSS 스타일링 */
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 0 28px;
  box-sizing: border-box;
}

.modal-card {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-icon {
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
  font-weight: 800;
  font-size: 18px;
  color: #15171b;
  margin-bottom: 8px;
}

.modal-desc {
  font-weight: 500;
  font-size: 13px;
  line-height: 19px;
  color: #525863;
  margin-bottom: 20px;
  word-break: keep-all;
}

.modal-desc strong {
  color: #15171b;
  font-weight: 700;
}

.modal-confirm-btn {
  width: 100%;
  height: 46px;
  background: #ffbc00;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-confirm-btn:active {
  background: #e5a900;
}

/* 모달 애니메이션 효과 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 에러/알림 모달 */
.error-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.error-dialog {
  width: 100%;
  max-width: 290px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px 20px;
  text-align: center;
  box-sizing: border-box;
}

.error-icon-wrap {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  margin: 0 0 6px;
  font-size: 16.5px;
  font-weight: 800;
  color: #15171b;
}

.error-desc {
  margin: 0 0 18px;
  font-size: 13px;
  color: #525863;
  line-height: 1.5;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.btn-error-confirm {
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
.btn-error-confirm:active {
  opacity: 0.85;
}
</style>