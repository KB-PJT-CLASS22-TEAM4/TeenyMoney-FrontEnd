<template>
  <div class="pay-done-screen">
    <div class="body">
      <!-- 완료 체크 아이콘 + 파티클 애니메이션 -->
      <div class="icon-container">
        <span v-for="n in 8" :key="n" :class="`spark spark-${n}`"></span>
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7" stroke="#ffffff" stroke-width="3"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <p class="done-msg">결제가 완료되었어요!</p>
      <p class="amount">{{ amount.toLocaleString() }}원</p>

      <!-- 가맹점 카드 -->
      <div class="card store-card">
        <span class="store-name">{{ store.name }}</span>
      </div>

      <!-- 정보 카드 -->
      <div class="card info-card">
        <div class="info-row">
          <span class="info-label">결제 일시</span>
          <span class="info-value">{{ paidAt }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">카테고리</span>
          <span class="info-value cat-value">
            <span class="cat-dot"></span>
            <span class="cat-name">{{ category }}</span>
            <span class="cat-auto">자동분류</span>
          </span>
        </div>
        <div class="info-row no-border">
          <span class="info-label">남은 잔액</span>
          <span class="info-value">{{ balance.toLocaleString() }}원</span>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="btns">
        <button class="btn-primary" @click="goHome">확인</button>
        <button class="btn-secondary" @click="goHistory">내역 보기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const code = route.query.code || ''

// [API] 결제 완료 정보 (결제 성공 응답에서 받은 값으로 채움) -> 현재는 더미값
const store = ref({ name: 'CU 강남역점' })
const amount = ref(3500)
const category = ref('식비')
const paidAt = ref('2024.07.20 (토) 14:30')
const balance = ref(26500)

function goHome() {
  router.push({ name: 'child-home' })
}

function goHistory() {
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
  background: #ffffff;
  border: 1px solid #eceef1;
}

.body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 60px 20px 24px;
}

/* 아이콘 + 파티클 */
.icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 180px;
  height: 180px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 72px;
  height: 72px;
  background: #ffbc00;
  border-radius: 50%;
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
  z-index: 1;
}

@keyframes pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.spark {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  opacity: 0;
  animation: burst 0.8s ease-out 0.3s forwards;
}

.spark-1 { background: #ff6b6b; --tx: 0px;   --ty: -75px; }
.spark-2 { background: #ffd93d; --tx: 53px;  --ty: -53px; }
.spark-3 { background: #6bcb77; --tx: 75px;  --ty: 0px;   }
.spark-4 { background: #4d96ff; --tx: 53px;  --ty: 53px;  }
.spark-5 { background: #ff6b6b; --tx: 0px;   --ty: 75px;  }
.spark-6 { background: #ffd93d; --tx: -53px; --ty: 53px;  }
.spark-7 { background: #6bcb77; --tx: -75px; --ty: 0px;   }
.spark-8 { background: #4d96ff; --tx: -53px; --ty: -53px; }

@keyframes burst {
  0%   { transform: translate(0, 0) scale(1);                                          opacity: 0; }
  20%  { transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0);                          opacity: 0; }
}

.done-msg {
  margin: 0 0 6px;
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
}

.amount {
  margin: 0 0 24px;
  font-weight: 600;
  font-size: 34px;
  letter-spacing: -1.5px;
  color: #15171b;
}

/* 공통 카드 */
.card {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #f0f1f3;
  border-radius: 16px;
}

/* 가맹점 카드 */
.store-card {
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 29px;
  margin-bottom: 12px;
}

.store-name {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
}

/* 정보 카드 */
.info-card {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
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
  font-size: 12.5px;
  color: #8a9099;
}

.info-value {
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
}

.cat-value {
  display: flex;
  align-items: center;
  gap: 7px;
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #ffbc00;
}

.cat-name {
  font-weight: 600;
  font-size: 14px;
  color: #191b1e;
}

.cat-auto {
  font-weight: 600;
  font-size: 10.7px;
  color: #b9bec5;
}

/* 하단 버튼 */
.btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: auto;
}

.btn-primary {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #15171b;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.btn-secondary {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: #f3f4f6;
  color: #15171b;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.btn-primary:active,
.btn-secondary:active {
  filter: brightness(0.97);
}
</style>