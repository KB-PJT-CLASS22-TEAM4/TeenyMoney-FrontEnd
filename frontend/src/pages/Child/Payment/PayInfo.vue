<template>
  <div class="pay-info-screen">
    <!-- 상단 네비게이션 (타이틀 + 결제 취소 X 버튼) -->
    <header class="nav">
      <div class="nav-placeholder"></div>
      <h1 class="nav-title">결제 확인</h1>
      <button class="icon-btn close-btn" type="button" @click="cancelPayment" aria-label="결제 취소">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#191b1e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </header>

    <!-- 본문 내용 -->
    <main class="body">
      <!-- 가맹점 + 결제 금액 Hero 카드 -->
      <section class="card store-hero-card">
        <h3 class="store-name">{{ store.name || '가맹점' }}</h3>

        <div class="amount-wrap">
          <span class="amount-number">{{ amount.toLocaleString() }}</span>
          <span class="amount-unit">원</span>
        </div>
      </section>

      <!-- 상세 결제 정보 카드 -->
      <section class="card detail-info-card">
        <div class="info-row">
          <span class="info-label">결제 수단</span>
          <span class="info-value">티니머니</span>
        </div>

        <div class="info-row">
          <span class="info-label">업종</span>
          <span class="info-value cat-value">
            <span class="cat-dot"></span>
            <span class="cat-name">{{ category || '일반' }}</span>
          </span>
        </div>

        <div class="info-row">
          <span class="info-label">결제 상태</span>
          <span class="status-badge" :class="categoryStatus">
            {{ statusLabel }}
          </span>
        </div>

        <div class="info-row no-border">
          <span class="info-label">현재 잔액</span>
          <span class="info-value current-balance">{{ balance.toLocaleString() }}원</span>
        </div>
      </section>
    </main>

    <!-- 하단 결제하기 버튼 -->
    <footer class="footer">
      <button
        class="cta"
        :class="{ 'disabled-cta': balance < amount }"
        :disabled="balance < amount"
        type="button"
        @click="confirmPay"
      >
        <template v-if="balance < amount">
          잔액이 부족해요
        </template>
        <template v-else>
          결제하기
        </template>
      </button>
    </footer>

    <!-- 카테고리 경고 팝업 (주의 / 차단) -->
    <transition name="modal">
      <div v-if="showModal" class="modal-dim" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-icon" :class="categoryStatus">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path d="M12 3L2 20h20L12 3z" :stroke="iconColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M12 10v4" :stroke="iconColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="17" r="1" :fill="iconColor"/>
            </svg>
          </div>

          <p class="modal-title">
            {{ category }} 카테고리는<br />{{ categoryStatus === 'block' ? '차단' : '주의' }} 단계입니다
          </p>

          <!-- 이번 달 주의 결제 횟수 안내 칸 -->
          <div v-if="categoryStatus === 'warn'" class="warn-count-box">
            <span class="count-label">이번 달 주의 결제</span>
            <span class="count-value">{{ monthWarningCount }}회</span>
          </div>

          <p class="modal-desc">
            <template v-if="categoryStatus === 'block'">
              부모님이 설정한 결제 차단 카테고리입니다.
            </template>
            <template v-else>
              주의 단계에서 결제하면 <strong>티니점수가 감소</strong>해요<br />
              필요한 지출인지 다시 한 번 신중하게 고민해 보세요!
            </template>
          </p>

          <div class="modal-btns">
            <template v-if="categoryStatus === 'block'">
              <button class="modal-cancel" type="button" @click="showModal = false">취소</button>
              <button class="modal-request" type="button" @click="requestApproval">부모님께 요청하기</button>
            </template>
            <template v-else>
              <button class="modal-cancel" type="button" @click="proceedAnyway">결제하기</button>
              <button class="modal-request" type="button" @click="requestApproval">부모님께 요청하기</button>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { useAllowRequestStore } from '@/stores/allowRequest'
import { getMyTransactions } from '@/api/wallet'

const router = useRouter()
const authStore = useAuthStore()
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

// 이번 달 주의 등급 결제 횟수 (실시간 계산 또는 백엔드 값 연동)
const monthWarningCount = ref(
  pending?.categoryPolicy?.warningCount ??
  pending?.warningCount ??
  pending?.totalCount ??
  0
)

// 화면 진입 시 실제 이번 달 결제 내역 조회 및 주의 횟수 실시간 계산
onMounted(async () => {
  if (!authStore.accessToken) return
  try {
    const res = await getMyTransactions(authStore.accessToken, { period: 'MONTH', type: 'ALL' })
    const txList = Array.isArray(res.data) ? res.data : []
    
    // 이번 달 거래 중 현재 결제하려는 업종이거나 정책이 WATCH(주의)인 결제 건수 계산
    const matchedCount = txList.filter(tx => {
      const isSameCategory = category.value && (
        tx.categoryName === category.value ||
        tx.categoryPolicy?.categoryName === category.value ||
        tx.title?.includes(category.value)
      )
      const isWatchPolicy = tx.categoryPolicy?.policy === 'WATCH' || tx.policy === 'WATCH'
      return isSameCategory || isWatchPolicy
    }).length

    if (matchedCount > 0) {
      monthWarningCount.value = matchedCount
    }
  } catch (e) {
    console.log('주의 결제 횟수 실시간 조회 완료:', e.message)
  }
})

const showModal = ref(false)

// 아이콘 색: 주의=주황, 차단=빨강
const iconColor = computed(() => (categoryStatus.value === 'block' ? '#e5484d' : '#ff9800'))

function cancelPayment() {
  // 결제 시도 취소 및 홈으로 이동
  paymentStore.reset()
  router.push({ name: 'child-home' })
}

function confirmPay() {
  // 잔액 부족 시 결제 불가
  if (balance.value < amount.value) return

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
  justify-content: space-between;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 24px;
  background: #f8fafc;
  overflow: hidden;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

/* 상단 네비게이션 */
.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  padding: 0 16px;
  background: #f8fafc;
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 10;
}

.nav-placeholder {
  width: 36px;
}

.nav-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
  letter-spacing: -0.3px;
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease;
}

.icon-btn:hover {
  background: #eef2f6;
}

/* 본문 영역 (상단 여백 확보) */
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 60px 20px 24px;
  box-sizing: border-box;
  width: 100%;
}

/* 공통 카드 스타일 */
.card {
  box-sizing: border-box;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

/* 가맹점 + 금액 Hero 카드 */
.store-hero-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 32px 20px 28px;
}

.store-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.store-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.store-name {
  margin: 0;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.4px;
  color: #0f172a;
}

.amount-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-top: 4px;
}

.amount-number {
  font-weight: 800;
  font-size: 40px;
  letter-spacing: -1px;
  color: #0f172a;
  line-height: 1.1;
}

.amount-unit {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

/* 상세 정보 카드 */
.detail-info-card {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.info-row.no-border {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  font-size: 14px;
  color: #64748b;
}

.info-value {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

.current-balance {
  color: #0f172a;
}

/* 결제 상태 뱃지 */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 12px;
}

.status-badge.normal {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}

.status-badge.warn {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.status-badge.block {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

/* 카테고리 값 */
.cat-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffbc00;
}

.cat-name {
  font-weight: 700;
  font-size: 14.5px;
  color: #0f172a;
}

/* 하단 결제 버튼 */
.footer {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.cta {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 188, 0, 0.35);
  transition: all 0.15s ease-in-out;
}

.cta:hover {
  background: #f5b300;
  box-shadow: 0 6px 18px rgba(255, 188, 0, 0.45);
}

.cta:active {
  transform: scale(0.985);
  box-shadow: 0 2px 8px rgba(255, 188, 0, 0.25);
}

.cta.disabled-cta {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* ===== 경고 팝업 ===== */
.modal-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.modal {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 340px;
  padding: 28px 22px 22px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}

.modal-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.modal-icon.warn {
  background: #fef3c7;
}
.modal-icon.block {
  background: #fee2e2;
}

.modal-title {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
  line-height: 1.4;
  color: #0f172a;
  text-align: center;
}

/* 이번 달 주의 결제 횟수 안내 칸 */
.warn-count-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 14px;
  padding: 12px 16px;
  background: #fffdf5;
  border: 1px solid #fef3c7;
  border-radius: 14px;
  box-sizing: border-box;
}

.count-label {
  font-size: 13.5px;
  font-weight: 600;
  color: #78350f;
}

.count-value {
  font-size: 16px;
  font-weight: 800;
  color: #d97706;
}

.modal-desc {
  margin: 12px 0 0;
  font-weight: 500;
  font-size: 13px;
  line-height: 1.45;
  color: #64748b;
  text-align: center;
}

.modal-desc strong {
  font-weight: 700;
  color: #0f172a;
}

.modal-btns {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 24px;
}

.modal-cancel {
  flex: 1;
  height: 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #64748b;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.modal-cancel:hover {
  background: #f8fafc;
}

.modal-request {
  flex: 2;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.modal-request:hover {
  background: #f5b300;
}

.modal-request:active {
  transform: scale(0.98);
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
</style>