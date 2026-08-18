<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">잔액 부족</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <div class="content">
      <img src="@/assets/logo.svg" alt="" class="logo" />
      <h2 class="title">잔액이 부족합니다</h2>
      <p class="desc">현재 지갑의 잔액이 결제 금액보다 적습니다.<br />결제 수단을 변경하거나 충전해 주세요.</p>

      <!-- 잔액 카드 -->
      <div class="balance-card">
        <p class="bank-name">국민은행</p>
        <p class="account-number">4225 9765 0008 6141</p>
        <div class="balance-row">
          <span class="balance-label">현재 잔액</span>
          <!-- TODO: API 연동 후 실제 잔액으로 교체 -->
          <span class="balance-amount">{{ Number(route.query.balance).toLocaleString() }}원</span>
        </div>
      </div>

      <!-- 버튼 -->
      <button class="btn btn-secondary" @click="router.push('/parents/payment/change')">결제수단 변경하기</button>
      <button class="btn btn-primary" @click="router.push('/parents/charge')">금액 충전하기</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn, .alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon, .alarm-icon { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 16px 20px;
}

.logo {
  width: 64px;
  height: 64px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #191b1e;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
  text-align: center;
  line-height: 1.6;
}

.balance-card {
  width: 100%;
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0;
}

.bank-name {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.account-number {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8b9097;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 16px;
  font-weight: 600;
  color: #191b1e;
}

.balance-amount {
  font-size: 22px;
  font-weight: 700;
  color: #191b1e;
}

.btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background-color: #f4f5f7;
  color: #191b1e;
}
</style>