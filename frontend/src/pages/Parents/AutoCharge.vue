<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">자동 충전 설정</h1>
    </header>

    <div class="content">
      <!-- 내 지갑 잔액 -->
      <!-- TODO: GET /wallet/balance → walletBalance 로 교체 -->
      <div class="wallet-card">
        <p class="wallet-label">내 지갑 잔액</p>
        <p class="wallet-amount">{{ walletBalance.toLocaleString() }}원</p>
      </div>

      <!-- 자동 충전 활성화 -->
      <div class="setting-row">
        <div>
          <p class="setting-title">자동 충전 활성화</p>
          <p class="setting-desc">잔액이 부족하면 자동으로 충전돼요</p>
        </div>
        <div
          class="toggle"
          :class="{ active: autoChargeEnabled }"
          @click="toggleAutoCharge"
        >
          <div class="toggle-thumb"></div>
        </div>
      </div>

      <div class="divider" />

      <!-- 잔액 기준 -->
      <div class="setting-row">
        <p class="setting-label">잔액이</p>
        <p class="setting-value">{{ thresholdAmount.toLocaleString() }}원 이하일 때</p>
      </div>

      <div class="divider" />

      <!-- 충전 금액 -->
      <div class="charge-amount-section">
        <p class="setting-label">충전 금액</p>
        <div class="amount-row">
          <p class="setting-value-large">{{ chargeAmount.toLocaleString() }}원</p>
          <span class="auto-label">자동으로 충전</span>
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
        <p class="account-notice">
          <img src="@/assets/icons/icon-shield.svg" alt="" class="shield-icon" />
          충전 계좌: 국민은행 123-456-780002
        </p>
      </div>
    </div>

    <!-- 충전하기 버튼 -->
    <div class="footer">
      <button class="submit-btn" @click="saveAutoCharge">충전하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// TODO: API 연동 후 하드코딩 제거
// GET /wallet/auto-charge → 설정값 불러오기
const walletBalance = ref(45200)
const autoChargeEnabled = ref(true)
const thresholdAmount = ref(10000)
const chargeAmount = ref(30000)

const quickAmounts = [
  { label: '+1천', value: 1000 },
  { label: '+3천', value: 3000 },
  { label: '+5천', value: 5000 },
  { label: '+10만', value: 100000 },
]

function toggleAutoCharge() {
  autoChargeEnabled.value = !autoChargeEnabled.value
}

async function saveAutoCharge() {
  // TODO: API 연동
  // PUT /wallet/auto-charge
  // body: { enabled: autoChargeEnabled.value, threshold: thresholdAmount.value, amount: chargeAmount.value }
  // 성공 시 → ChargingPage 로 이동
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
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon {
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
  padding: 16px;
}

/* 지갑 카드 */
.wallet-card {
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.wallet-label {
  margin: 0 0 8px;
  font-size: 12px;
  color: #8b9097;
}

.wallet-amount {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #191b1e;
}

/* 설정 행 */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.setting-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.setting-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.setting-label {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
}

.setting-value {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #191b1e;
}

/* 토글 */
.toggle {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background-color: #e0e2e6;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle.active {
  background-color: #ffbc00;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #ffffff;
  transition: transform 0.2s;
}

.toggle.active .toggle-thumb {
  transform: translateX(20px);
}

.divider {
  height: 1px;
  background-color: #f0f1f3;
}

/* 충전 금액 */
.charge-amount-section {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-value-large {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #191b1e;
}

.auto-label {
  font-size: 12px;
  color: #8b9097;
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

.account-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.shield-icon {
  width: 14px;
  height: 14px;
}

/* 하단 버튼 */
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  padding: 10px 16px 28px;
  background-color: #ffffff;
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
</style>