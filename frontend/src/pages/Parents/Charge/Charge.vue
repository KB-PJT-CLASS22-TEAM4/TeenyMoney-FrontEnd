<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">충전</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <div class="content">
      <!-- 연결된 계좌 카드 -->
      <div class="account-card">
        <p class="account-label">연결된 계좌</p>
        <p class="account-number">{{ accountInfo.bank }} {{ accountInfo.number }}</p>
        <p class="balance-label">현재 잔액</p>
        <p class="balance-amount">{{ accountInfo.balance.toLocaleString() }}<span class="won">원</span></p>
      </div>

      <!-- 충전 금액 입력 -->
      <div class="charge-section">
        <p class="section-label">충전할 금액</p>
        <div class="amount-input-wrap">
          <input
            v-model="chargeAmount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />
          <span class="won-unit">원</span>
        </div>

        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            class="quick-btn"
            @click="chargeAmount = quick.value"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>

      <!-- 자동 충전 설정 배너 -->
      <button class="auto-charge-banner" @click="goToAutoCharge">
        <div class="banner-left">
          <div>
            <p class="banner-title">자동 충전 설정</p>
            <p class="banner-desc">잔액 부족 시 자동으로 충전</p>
          </div>
        </div>
        <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
      </button>

      <!-- 충전하기 버튼 -->
      <button
        class="submit-btn"
        :disabled="!chargeAmount || chargeAmount <= 0"
        @click="goToCharging"
      >
        + 충전하기
      </button>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item nav-item-active" type="button" @click="router.push('/parents/home')">
        <img src="@/assets/icons/icon-home-alive.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item" type="button" @click="router.push('/parents/childlist')">
        <img src="@/assets/icons/icon-child.svg" alt="" class="nav-icon" />
        <span class="nav-label">자녀관리</span>
      </button>
      <button class="nav-item" type="button" @click="router.push('/parents/mypage')">
        <img src="@/assets/icons/icon-mypage.svg" alt="" class="nav-icon" />
        <span class="nav-label">마이페이지</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const accountInfo = ref({
  bank: '국민은행',
  number: '123-456-7890',
  balance: 12400,
})

const chargeAmount = ref('')

const quickAmounts = [
  { label: '+1만', value: 10000 },
  { label: '+3만', value: 30000 },
  { label: '+5만', value: 50000 },
  { label: '+10만', value: 100000 },
]

function goToAutoCharge() {
  router.push('/parents/charge/auto')
}

function goToCharging() {
  router.push({
    path: '/parents/charge/charging',
    query: { amount: chargeAmount.value },
  })
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
  box-sizing: border-box;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn,
.alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
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

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
}

/* 계좌 카드 */
.account-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-sizing: border-box;
}

.account-label {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8b9097;
}

.account-number {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: black;
}

.balance-label {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8b9097;
}

.balance-amount {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #191b1e;
}

.won {
  font-size: 20px;
  font-weight: 500;
}

/* 충전 금액 */
.charge-section {
  width: 100%;
  background-color: transperent;
  border-radius: 16px;
  padding: 0px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

.section-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  background-color: #f4f5f7;
  border-radius: 10px;
  padding: 14px 16px;
  width: 100%;
  box-sizing: border-box;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
  text-align: right;
  outline: none;
  width: 100%;
}

.amount-input::placeholder {
  color: #b9bec5;
}

.won-unit {
  font-size: 16px;
  font-weight: 500;
  color: #191b1e;
}

.quick-btns {
  display: flex;
  gap: 8px;
  width: 100%;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

/* 자동 충전 배너 */
.auto-charge-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff8e1;
  border-radius: 16px;
  padding: 16px;
  border: none;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  text-align: left;  

}

.banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;  /* ← 볼드 */
  color: #191b1e;
}

.banner-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  font-weight: 400;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* 충전하기 버튼 */
.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
  box-sizing: border-box;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>