<template>
  <div class="product-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">가입 신청 확인</h1>
    </div>

    <!-- 스크롤 영역 -->
    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- 1. 가입 상품 헤더 -->
      <section class="product-header">
        <span class="sub-title">가입 상품</span>
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

        <div class="row border-top multiline">
          <span class="row-label">적용금리</span>
          <div class="row-value-group">
            <span class="row-value">{{ confirmData.appliedRate }}</span>
            <span class="row-subtext">중도 해지 시 3.0% · 티니점수 하락</span>
          </div>
        </div>

        <div class="row border-top" v-if="confirmData.autoTransfer">
          <span class="row-label">자동이체</span>
          <span class="row-value">매월 {{ confirmData.transferDay }}일</span>
        </div>

        <div class="row border-top" v-if="confirmData.autoTransfer">
          <span class="row-label">출금계좌</span>
          <span class="row-value">{{ confirmData.debitAccount }}</span>
        </div>

        <div class="row border-top">
          <span class="row-label">만기일</span>
          <span class="row-value">{{ confirmData.maturityDate }}</span>
        </div>
      </section>

      <!-- 3. 예상 만기 수령액 요약 박스 -->
      <section class="maturity-summary-box">
        <div class="maturity-top">
          <span class="maturity-title">예상 만기 수령액</span>
          <span class="maturity-total">{{ confirmData.totalReturn.toLocaleString() }}원</span>
        </div>
        <p class="maturity-detail">
          원금 {{ confirmData.principal.toLocaleString() }}원 + 이자 {{ confirmData.interest.toLocaleString() }}원 + 티니점수 {{ confirmData.score }}점
        </p>
      </section>

      <!-- 4. 약관 및 필수 동의 체크박스 리스트 -->
      <section class="terms-section">
        <div class="check-item border-top" @click="agreeConfirm = !agreeConfirm">
          <div class="check-circle" :class="{ checked: agreeConfirm }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#15171b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="check-label">예상 만기 수령액을 확인했어요 <span class="required">(필수)</span></span>
        </div>

        <div class="check-item border-top" @click="agreeAutoTransfer = !agreeAutoTransfer">
          <div class="check-circle" :class="{ checked: agreeAutoTransfer }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#15171b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="check-label">자동이체 출금에 동의해요 <span class="required">(필수)</span></span>
        </div>
      </section>
    </div>

    <!-- 하단 고정 가입완료 버튼 -->
    <footer class="footer">
      <div class="submit-wrapper">
        <button 
          type="button" 
          class="submit-btn" 
          :class="{ active: isAllAgreed }"
          :disabled="!isAllAgreed"
          @click="openModal"
        >
          가입 완료
        </button>
      </div>
    </footer>

    <!-- 🌟 가입 완료 모달 (Modal Overlay) -->
    <Transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModalAndNavigate">
        <div class="modal-card">
          <div class="modal-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#15171b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="modal-title">가입 신청 완료!</h3>
          <p class="modal-desc">
            <strong>{{ confirmData.title }}</strong> 가입 신청이 성공적으로 완료되었어요
          </p>
          <button type="button" class="modal-confirm-btn" @click="closeModalAndNavigate">
            확인
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 스크롤 제어
const isScrolling = ref(false);
let scrollTimer = null;
function onScroll() {
  isScrolling.value = true;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => { isScrolling.value = false; }, 800);
}

// 전달 데이터
const confirmData = reactive({
  title: route.query.title || '티니 꿈나무 적금',
  productTypeDesc: '자유적립식 적금 · 최고 연 4.5%',
  amountLabel: '월 납입금액',
  amount: Number(route.query.amount) || 10000,
  periodLabel: '가입기간',
  period: Number(route.query.period) || 6,
  appliedRate: route.query.rate || '4.0%',
  autoTransfer: route.query.autoTransfer !== 'false',
  transferDay: route.query.transferDay || 1,
  debitAccount: '티니머니 지갑',
  maturityDate: '2027.02.06',
  principal: 60000,
  interest: 700,
  score: 5,
  get totalReturn() {
    return this.principal + this.interest;
  }
});

// 체크박스 초기값 (미선택)
const agreeConfirm = ref(false);
const agreeAutoTransfer = ref(false);

const isAllAgreed = computed(() => agreeConfirm.value && agreeAutoTransfer.value);

// 🌟 모달 표시 상태값
const showSuccessModal = ref(false);

const goBack = () => {
  router.back();
};

// 가입완료 버튼 클릭 시 모달 열기
const openModal = () => {
  if (!isAllAgreed.value) return;
  showSuccessModal.value = true;
};

// 모달 확인 버튼 클릭 시 목록으로 이동
const closeModalAndNavigate = () => {
  showSuccessModal.value = false;
  router.push({ name: 'product-list' });
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
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 10px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 10px;
  text-align: center;
}

.sub-title {
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: #8a9099;
  margin-bottom: 6px;
}

.product-title {
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
  margin-bottom: 4px;
}

.product-sub {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
}

/* 2. 상세 내역 */
.detail-section {
  padding: 16px 0;
  border-bottom: 1.3px solid #f0f1f3;
}

.section-label {
  display: block;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  color: #8a9099;
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
  font-weight: 500;
  font-size: 13.5px;
  color: #8b9097;
}

.row-value {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
  text-align: right;
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
  color: #8a9099;
  text-align: right;
}

/* 3. 만기 예상 수령액 박스 */
.maturity-summary-box {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 14px 16px;
  margin: 16px 0;
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
  color: #8b9097;
}

/* 4. 약관 체크박스 */
.terms-section {
  display: flex;
  flex-direction: column;
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
}

.required {
  color: #8a9099;
  font-weight: 400;
}

/* 하단 버튼 영역 */
.footer {
  box-sizing: border-box;
  width: 100%;
  flex: none;
  padding: 8px 20px 16px;
  background: #ffffff;
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
  color: #9ca1a8;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.submit-btn.active {
  background: #ffbc00;
  color: #15171b;
  cursor: pointer;
}

/* 🌟 모달 CSS 스타일링 */
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
  color: #6b7280;
  margin-bottom: 20px;
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
</style>