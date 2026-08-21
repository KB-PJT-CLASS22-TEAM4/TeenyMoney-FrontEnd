<template>
  <div class="pay-done-screen">
    <div class="body">
      <!-- 상단 체크 아이콘 & 축하 모션 -->
      <div class="icon-container">
        <span v-for="n in 6" :key="n" :class="`spark spark-${n}`"></span>
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7" stroke="#15171b" stroke-width="2.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 타이틀 & 결제 금액 -->
      <div class="head-area">
        <p class="done-msg">결제가 완료되었어요</p>
        <h2 class="amount">{{ amount.toLocaleString() }}<span class="unit">원</span></h2>
      </div>

      <!-- 결제 상세 정보 카드 -->
      <div class="card info-card">
        <!-- 가맹점 -->
        <div class="info-row">
          <span class="info-label">사용처</span>
          <span class="info-value store-name">{{ store.name }}</span>
        </div>

        <!-- 결제 일시 -->
        <div class="info-row">
          <span class="info-label">결제 일시</span>
          <span class="info-value">{{ paidAt }}</span>
        </div>

        <!-- 업종 / 카테고리 -->
        <div v-if="category" class="info-row">
          <span class="info-label">업종</span>
          <span class="info-value cat-badge">
            <span class="cat-dot"></span>
            {{ category }}
          </span>
        </div>

        <!-- 결제 후 잔액 -->
        <div class="info-row no-border balance-row">
          <span class="info-label">결제 후 잔액</span>
          <span class="info-value balance-value">{{ balance.toLocaleString() }}원</span>
        </div>
      </div>

      <!-- 하단 버튼 영역 -->
      <div class="btns">
        <button class="btn-primary" type="button" @click="goHome">
          확인
        </button>
        <button class="btn-secondary" type="button" @click="goHistory">
          결제내역 보기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'
import { formatKstDateTimeWithWeekday } from '@/utils/datetime'

const router = useRouter()
const paymentStore = usePaymentStore()

// PayPassword.vue에서 pay() 성공 후 저장해둔 결제 결과
const result = paymentStore.lastResult

const store = ref({ name: result?.merchantName ?? '' })
const amount = ref(result?.amount ?? 0)
const category = ref(result?.categoryPolicy?.categoryName ?? '')
const balance = ref(result?.balance ?? 0)

// createdAt 포맷팅
const paidAt = ref(formatPaidAt(result?.createdAt))

function formatPaidAt(value) {
  return formatKstDateTimeWithWeekday(value)
}

function goHome() {
  paymentStore.reset()
  router.push({ name: 'child-home' })
}

function goHistory() {
  paymentStore.reset()
  router.push({ name: 'child-transaction' })
}
</script>

<style scoped>
.pay-done-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

.body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 130px 20px 28px;
}

/* 상단 완료 아이콘 + 파티클 */
.icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 90px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 68px;
  height: 68px;
  background: #ffbc00;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(255, 188, 0, 0.35);
  animation: pop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  z-index: 1;
}

@keyframes pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.spark {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0;
  animation: burst 0.7s ease-out 0.25s forwards;
}

.spark-1 { background: #ffbc00; --tx: 0px;   --ty: -55px; }
.spark-2 { background: #3b82f6; --tx: 44px;  --ty: -35px; }
.spark-3 { background: #10b981; --tx: 50px;  --ty: 20px;  }
.spark-4 { background: #f59e0b; --tx: 0px;   --ty: 55px;  }
.spark-5 { background: #3b82f6; --tx: -44px; --ty: 35px;  }
.spark-6 { background: #10b981; --tx: -50px; --ty: -20px; }

@keyframes burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 0; }
  25%  { transform: translate(calc(var(--tx) * 0.4), calc(var(--ty) * 0.4)) scale(1.2); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

/* 타이틀 & 금액 영역 */
.head-area {
  text-align: center;
  margin-bottom: 24px;
}

.done-msg {
  margin: 0 0 6px;
  font-weight: 600;
  font-size: 15px;
  color: #64748b;
  letter-spacing: -0.3px;
}

.amount {
  margin: 0;
  font-weight: 800;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -1px;
  color: #0f172a;
}

.amount .unit {
  font-size: 24px;
  font-weight: 700;
  margin-left: 2px;
}

/* 상세 정보 카드 */
.card {
  box-sizing: border-box;
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
}

.info-card {
  display: flex;
  flex-direction: column;
  padding: 4px 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 4px;
  border-bottom: 1px solid #f8fafc;
}

.info-row.no-border {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  font-size: 14px;
  color: #64748b;
  letter-spacing: -0.2px;
}

.info-value {
  font-weight: 600;
  font-size: 14.5px;
  color: #0f172a;
  letter-spacing: -0.2px;
  text-align: right;
}

.store-name {
  font-weight: 700;
  color: #0f172a;
}

.cat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  background: #fffdf2;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #b45309;
}

.cat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffbc00;
}

.balance-row {
  padding-top: 16px;
  padding-bottom: 16px;
  margin-top: 2px;
  border-top: 1px dashed #e2e8f0;
}

.balance-value {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

/* 하단 버튼 영역 */
.btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: auto;
}

.btn-primary {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 15.5px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 188, 0, 0.3);
  transition: background-color 0.15s ease, transform 0.08s ease;
}

.btn-primary:active {
  background: #f5b300;
  transform: scale(0.98);
}

.btn-secondary {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: #edf2f7;
  color: #475569;
  font-weight: 600;
  font-size: 14.5px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.08s ease;
}

.btn-secondary:active {
  background: #e2e8f0;
  transform: scale(0.98);
}
</style>