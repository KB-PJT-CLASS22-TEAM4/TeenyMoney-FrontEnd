<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 스크롤바 제어
const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}

// 전달받은 상품 정보 (현재 더미데이터)
const cancelData = reactive({
  title: route.query.title || '티니 꿈나무 적금',
  category: route.query.category || '적금',
  badgeColor: 'blue',
  desc: '매월 자동으로 모으는 목표 적금',
  paidPrincipal: 150000,
  cancelRate: '연 0.5%',
  interest: 375,
  scorePenalty: 30,
  currentScore: 720,
  get totalRefund() {
    return this.paidPrincipal + this.interest
  }
})

// 예상 점수 및 점수 바 비율
const estimatedScore = computed(() => Math.max(0, cancelData.currentScore - cancelData.scorePenalty))
const scorePercentage = computed(() => Math.min(100, Math.max(0, (estimatedScore.value / 1000) * 100)))

// 동의 체크박스 및 모달 상태
const agreeCancel = ref(false)
const showSuccessModal = ref(false)

// 취소 버튼 클릭 시 나의 금융 상품 목록 페이지로 이동
function goToMyProducts() {
  router.push({ name: 'child-finance-myproducts' })
}

// 상단 네비 뒤로가기 버튼과 동일하게 연결
const goBack = goToMyProducts

function openConfirmModal() {
  if (!agreeCancel.value) return
  showSuccessModal.value = true
}

// 중도해지 완료 모달 확인 클릭 시에도 나의 상품 목록으로 이동
function closeModalAndNavigate() {
  showSuccessModal.value = false
  router.push({ name: 'child-finance-myproducts' })
}
</script>

<template>
  <div class="product-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goToMyProducts" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">중도해지</h1>
    </div>

    <!-- 스크롤 영역 -->
    <div class="scroll cancel-bg" :class="{ scrolling: isScrolling }" @scroll="onScroll">

      <!-- 상품 헤더 카드 -->
      <section class="card product-card">
        <div class="title-row">
          <span class="badge" :class="cancelData.badgeColor">{{ cancelData.category }}</span>
          <span class="prod-title">{{ cancelData.title }}</span>
        </div>
        <p class="prod-desc">{{ cancelData.desc }}</p>
      </section>

      <!-- 지금 해지하면 받을 금액 요약 카드 -->
      <section class="card summary-card">
        <span class="summary-label">지금 해지하면 받을 금액</span>
        <h2 class="summary-amount">{{ cancelData.totalRefund.toLocaleString() }}원</h2>
        <div class="score-drop">
          <span class="red-text">▼ {{ cancelData.scorePenalty }}점</span>
          <span class="gray-text">티니점수 감소</span>
        </div>
      </section>

      <!-- 해지 내역 상세 카드 -->
      <section class="card detail-card">
        <h3 class="card-section-title">해지 내역</h3>
        <div class="detail-rows">
          <div class="detail-row">
            <span class="d-label">현재까지 납입한 원금</span>
            <span class="d-value">{{ cancelData.paidPrincipal.toLocaleString() }}원</span>
          </div>
          <div class="detail-row">
            <span class="d-label">중도해지 적용금리</span>
            <span class="d-value blue">{{ cancelData.cancelRate }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">받을 이자</span>
            <span class="d-value blue">{{ cancelData.interest.toLocaleString() }}원</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row final-row">
          <span class="final-label">최종 지급액</span>
          <span class="final-amount">{{ cancelData.totalRefund.toLocaleString() }}원</span>
        </div>
      </section>

      <!-- 티니점수 변화 예측 카드 -->
      <section class="card score-card">
        <h3 class="card-section-title">티니점수 변화</h3>
        
        <div class="score-status-group">
          <div class="score-col left">
            <span class="s-label">현재 점수</span>
            <span class="s-val">{{ cancelData.currentScore }}점</span>
          </div>

          <div class="score-col center">
            <span class="drop-badge">▲ {{ cancelData.scorePenalty }}점</span>
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
          중도해지 시 티니점수가 {{ cancelData.scorePenalty }}점 감소하며, 이후 상품 가입 조건에 영향을 줄 수 있습니다.
        </div>
      </section>

      <!-- 동의 체크박스, 버튼 영역 -->
      <section class="action-section">
        <div class="checkbox-wrapper" @click="agreeCancel = !agreeCancel">
          <div class="custom-checkbox" :class="{ checked: agreeCancel }">
            <svg v-if="agreeCancel" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="checkbox-label">위 내용을 확인하였으며, 중도해지에 동의합니다.</span>
        </div>

        <button 
          type="button" 
          class="submit-btn" 
          :class="{ active: agreeCancel }"
          :disabled="!agreeCancel"
          @click="openConfirmModal">중도해지 신청</button>

        <button type="button" class="cancel-btn" @click="goToMyProducts">취소</button>
      </section>
    </div>

    <!-- 해지 완료 모달 -->
    <Transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModalAndNavigate">
        <div class="modal-card">
          <div class="modal-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M12 3r10 18H2L12 3z" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="modal-title">중도해지가 완료되었어요</h3>
          <p class="modal-desc">
            해지 금액 <strong>{{ cancelData.totalRefund.toLocaleString() }}원</strong>이<br/>출금 계좌로 입금되었습니다.
          </p>
          <button type="button" class="modal-confirm-btn" @click="closeModalAndNavigate">
            확인
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

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
  background: #ffffff;
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

/* 스크롤 영역, 배경색 */
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 20px 20px;
}

.scroll.cancel-bg {
  background: #f7f8fa;
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

/* 공통 카드 스타일 */
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 12px;
}

/* 상품 카드 */
.product-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}

.badge.blue {
  background: #e8f1fd;
  color: #2e7bf0;
}

.badge.orange {
  background: #fff3e0;
  color: #f57c00;
}

.prod-title {
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
}

.prod-desc {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
}

/* 환급금 요약 카드 */
.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.summary-label {
  font-weight: 600;
  font-size: 12px;
  color: #8b9097;
  margin-bottom: 4px;
}

.summary-amount {
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.5px;
  color: #15171b;
  margin-bottom: 6px;
}

.score-drop {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.red-text {
  font-weight: 600;
  color: #d4183d;
}

.gray-text {
  font-weight: 500;
  color: #b9bec5;
}

/* 해지 내역 상세 카드 */
.card-section-title {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
  margin-bottom: 14px;
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
  color: #8b9097;
}

.d-value {
  font-weight: 600;
  font-size: 12.5px;
  color: #15171b;
}

.d-value.blue {
  color: #4d8ad6;
}

.divider {
  height: 1px;
  background: #f2f4f6;
  margin: 14px 0;
}

.final-row {
  padding-top: 2px;
}

.final-label {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
}

.final-amount {
  font-weight: 800;
  font-size: 16px;
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
  color: #8b9097;
  margin-bottom: 2px;
}

.s-val {
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
}

.s-val.red {
  color: #d4183d;
}

.drop-badge {
  font-weight: 700;
  font-size: 13px;
  color: #d4183d;
}

.drop-sub {
  font-weight: 500;
  font-size: 10.5px;
  color: #b9bec5;
}

/* 점수 바 */
.progress-container {
  margin-bottom: 14px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f2f4f6;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: #ffbc00;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  font-size: 10.5px;
  color: #b9bec5;
}

/* 경고 박스 */
.warning-box {
  background: #fff5f5;
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 500;
  font-size: 11.5px;
  line-height: 18px;
  color: #d4183d;
}

/* 액션 버튼 영역 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.checkbox-wrapper {
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid #c6cbd2;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background: #d4183d;
  border-color: #d4183d;
}

.checkbox-label {
  font-weight: 500;
  font-size: 12.5px;
  color: #4a4e55;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: #f2f4f6;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  color: #b9bec5;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

/* 동의 시 빨간색 해지 버튼 활성화 */
.submit-btn.active {
  background: #d4183d;
  color: #ffffff;
  cursor: pointer;
}

.cancel-btn {
  width: 100%;
  height: 52px;
  background: #ffffff;
  border: 1.2px solid #e7e9ec;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  color: #4a4e55;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f2f4f6;
  color: #15171b;
}

/* 모달 스타일 */
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

.modal-icon.warning {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #d4183d;
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
  background: #15171b;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  color: #ffffff;
  cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>