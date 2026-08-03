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
      <!-- TODO: GET /wallet/account → accountInfo 로 교체 -->
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

        <!-- 빠른 금액 선택 -->
        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            class="quick-btn"
            @click="addAmount(quick.value)"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>

      <!-- 자동 충전 설정 배너 -->
      <button class="auto-charge-banner" @click="goToAutoCharge">
        <div class="banner-left">
          <div class="banner-icon-wrap">
            <!-- <img src="@/assets/icons/icon-refresh.svg" alt="" class="banner-icon" /> -->
          </div>
          <div>
            <p class="banner-title">자동 충전 설정</p>
            <p class="banner-desc">잔액 부족 시 자동으로 충전</p>
          </div>
        </div>
        <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
      </button>
    </div>

    <!-- 하단 충전하기 버튼 -->
    <div class="footer">
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
      <button class="nav-item" type="button" @click="router.push('/parents/Childlist')">
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

// TODO: API 연동 후 하드코딩 제거
// GET /wallet/account → accountInfo 로 교체
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

function addAmount(value) {
  chargeAmount.value = (Number(chargeAmount.value) || 0) + value
}

function goToAutoCharge() {
  router.push('/parent/charge/auto')
}

function goToCharging() {
  router.push({
    path: '/parent/charge/charging',
    query: { amount: chargeAmount.value },
  })
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 140px;
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
}

/* 계좌 카드 */
.account-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
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
  color: #ffbc00;
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
  color: #ffbc00;
}

.won {
  font-size: 20px;
  font-weight: 500;
}

/* 충전 금액 */
.charge-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-icon {
  width: 20px;
  height: 20px;
}

.banner-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.banner-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.chevron-icon {
  width: 18px;
  height: 18px;
}

/* 하단 버튼 */
.footer {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  padding: 10px 16px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

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