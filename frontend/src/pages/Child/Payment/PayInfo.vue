<template>
  <div class="pay-info-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <h1 class="nav-title">결제 확인</h1>
      <button class="icon-btn" @click="goHome" aria-label="닫기">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="#15171b" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="body">
      <!-- 가맹점 + 금액 카드 -->
      <div class="card store-card">
        <div class="store-info">
          <p class="store-name">{{ store.name }}</p>
        </div>

        <div class="divider"></div>

        <div class="amount-block">
          <p class="amount-label">결제 금액</p>
          <p class="amount">{{ amount.toLocaleString() }}원</p>
        </div>
      </div>

      <!-- 업종 / 상태 / 잔액 카드 -->
      <div class="card info-card">
        <div class="info-row">
          <span class="info-label">업종</span>
          <span class="info-value cat-value">
            <span class="cat-dot"></span>
            <span class="cat-name">{{ category }}</span>
          </span>
        </div>

        <div class="info-row">
          <span class="info-label">결제 가능 여부</span>
          <span class="status-badge" :class="categoryStatus">
            {{ statusLabel }}
          </span>
        </div>

        <div class="info-row no-border">
          <span class="info-label">지갑 잔액</span>
          <span class="info-value">{{ balance.toLocaleString() }}원</span>
        </div>
      </div>
    </div>

    <!-- 하단 결제 버튼 -->
    <div class="footer">
      <button class="cta" @click="confirmPay">결제하기</button>
    </div>

    <!-- 카테고리 경고 팝업 (주의 / 차단) -->
    <transition name="modal">
      <div v-if="showModal" class="modal-dim" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-icon" :class="categoryStatus">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <path d="M12 3L2 20h20L12 3z" :stroke="iconColor" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M12 10v4" :stroke="iconColor" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="12" cy="17" r="0.9" :fill="iconColor"/>
            </svg>
          </div>

          <p class="modal-title">
            {{ category }} 카테고리는<br />{{ categoryStatus === 'block' ? '차단' : '주의' }} 단계입니다
          </p>
          <p class="modal-desc">
            {{ categoryStatus === 'block'
              ? '부모님이 설정한 차단 카테고리입니다'
              : '주의 단계에서 결제하면 티니점수가 감소해요!' }}
              <br v-if="categoryStatus !== 'block'" />
              <template v-if="categoryStatus !== 'block'">오늘만 허용을 요청해보는 건 어때요?</template>
          </p>

          <div class="modal-btns">
            <template v-if="categoryStatus === 'block'">
              <button class="modal-cancel" @click="showModal = false">취소</button>
              <button class="modal-request" @click="requestApproval">부모님에게 요청하기</button>
            </template>
            <template v-else>
              <button class="modal-cancel" @click="proceedAnyway">결제하기</button>
              <button class="modal-request" @click="requestApproval">부모님에게 요청하기</button>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'
import { useAllowRequestStore } from '@/stores/allowRequest'

const router = useRouter()
const paymentStore = usePaymentStore()
const allowStore = useAllowRequestStore()

// QR 검증 단계(qr-scan)에서 저장해둔 결제 정보
const pending = paymentStore.pending

const store = ref({ name: pending?.merchantName ?? '' })
const amount = ref(pending?.amount ?? 0)
const balance = ref(pending?.balance ?? 0)
const category = ref(pending?.categoryPolicy?.categoryName ?? '')
const categoryId = pending?.categoryPolicy?.id ?? null

// ALLOW -> normal, WATCH -> warn, BLOCK -> block
const POLICY_STATUS = { ALLOW: 'normal', WATCH: 'warn', BLOCK: 'block' }
const categoryStatus = ref(POLICY_STATUS[pending?.categoryPolicy?.policy] ?? 'normal')

// 상태 뱃지 라벨: 허용 / 주의 / 차단
const STATUS_LABEL = { normal: '허용', warn: '주의', block: '차단' }
const statusLabel = computed(() => STATUS_LABEL[categoryStatus.value] ?? '허용')

const showModal = ref(false)

// 아이콘 색: 주의=주황, 차단=빨강
const iconColor = computed(() => (categoryStatus.value === 'block' ? '#e5484d' : '#ff9800'))

function goHome() {
  router.push({ name: 'child-home' })
}

function confirmPay() {
  // 주의/차단이면 결제 막고 팝업
  if (categoryStatus.value === 'warn' || categoryStatus.value === 'block') {
    showModal.value = true
    return
  }
  // 정상이면 비밀번호 화면으로
  router.push({ name: 'pay-password' })
}

// 주의 단계에서 "그대로 결제하기" 선택 시 — 비밀번호 화면으로 진행 (백엔드에서 티니점수 감소 처리)
function proceedAnyway() {
  showModal.value = false
  router.push({ name: 'pay-password' })
}

function requestApproval() {
  // '오늘만 허용' 요청 화면으로 이 카테고리를 미리 선택한 채 이동
  showModal.value = false
  if (categoryId !== null) {
    allowStore.set([categoryId], [category.value], '')
  }
  // 이 결제 시도는 승인 후 다시 스캔해서 진행해야 하므로 초기화
  paymentStore.reset()
  router.push({ name: 'child-todayallow-request' })
}
</script>

<style scoped>
.pay-info-screen {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding-top: 40px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

/* 상단 네비 */
.nav {
  box-sizing: border-box;  
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding: 14px 24px;
}


.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.nav-title {
  flex: 1;
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
}

/* 본문 */
.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 20px 16px;
}

/* 공통 카드 */
.card {
  box-sizing: border-box;
  border: 1px solid #f0f1f3;
  border-radius: 16px;
}

/* 가맹점 + 금액 카드 */
.store-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.store-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.store-name {
  margin: 0;
  font-weight: 600;
  font-size: 20px;
  letter-spacing: -0.5px;
  color: #15171b;
}

.divider {
  width: 100%;
  height: 1px;
  background: #f0f1f3;
}

.amount-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.amount-label {
  margin: 0;
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
}

.amount {
  margin: 0;
  font-weight: 600;
  font-size: 36px;
  letter-spacing: -1.5px;
  color: #15171b;
}

/* 업종 / 상태 / 잔액 카드 */
.info-card {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f1f3;
}

.info-row.no-border {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  font-size: 13px;
  color: #8a9099;
}

.info-value {
  font-weight: 600;
  font-size: 14px;
  color: #15171b;
}

/* 결제 가능 여부 뱃지 */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 12px;
}

.status-badge.normal {
  background: rgba(76, 175, 80, 0.12);
  color: #4caf50;
}

.status-badge.warn {
  background: rgba(255, 152, 0, 0.15);
  color: #ff9800;
}

.status-badge.block {
  background: rgba(229, 72, 77, 0.12);
  color: #e5484d;
}

/* 하단 결제 버튼 */
.footer {
  margin-top: auto;
  padding: 8px 20px 20px;
}

.cta {
  width: 300px;
  margin: 100px auto 10px;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.cta:active {
  filter: brightness(0.97);
}
/* ===== 경고 팝업 ===== */
.modal-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30px;
  z-index: 50;
}

.modal {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 24px 20px 20px;
  background: #ffffff;
  border-radius: 20px;
}

.modal-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 14px;
}

.modal-icon.warn {
  background: rgba(255, 152, 0, 0.15);
}
.modal-icon.block {
  background: rgba(229, 72, 77, 0.12);
}

.modal-title {
  margin: 0;
  font-weight: 700;
  font-size: 15px;
  line-height: 22px;
  color: #15171b;
  text-align: center;
}

.modal-desc {
  margin: 8px 0 0;
  font-weight: 500;
  font-size: 12.5px;
  line-height: 18px;
  color: #8a9099;
  text-align: center;
}

.modal-btns {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 20px;
}

.modal-cancel {
  flex: 1;
  padding: 13px 0;
  border: 1px solid #eceef1;
  border-radius: 12px;
  background: #ffffff;
  color: #8a9099;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.modal-request {
  flex: 2;
  padding: 13px 0;
  border: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

/* 팝업 애니메이션 */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal, .modal-leave-to .modal {
  transform: scale(0.95);
}

/* 카테고리 값 (점 + 이름) */
.cat-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffbc00;
}

.cat-name {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
}
</style>