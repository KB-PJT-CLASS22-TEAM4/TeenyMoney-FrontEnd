<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
    </header>

    <div class="content">
      <img src="@/assets/logo.svg" alt="" class="logo" />
      <h2 class="title">용돈 지급에 성공했어요</h2>
      <p class="desc">자녀에게 용돈이 실시간으로 전달됐어요</p>

      <!-- 거래 정보 -->
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">보낸 금액</span>
          <span class="info-value">{{ Number(route.query.amount).toLocaleString() }}원</span>
        </div>
        <div class="info-row">
          <span class="info-label">받는 분</span>
          <span class="info-value">{{ route.query.childName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">거래 시간</span>
          <!-- TODO: API 연동 후 실제 거래 시간으로 교체 -->
          <span class="info-value">{{ currentTime }}</span>
        </div>
      </div>

      <!-- 버튼 -->
      <button class="btn btn-primary" @click="router.push('/child/home')">
        자녀 지갑으로 가기
      </button>
      <button class="btn btn-secondary" @click="router.push('/parents/home')">
        홈으로 이동
      </button>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item" type="button" @click="router.push('/parents/home')">
        <img src="@/assets/icons/icon-home.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item nav-item-active" type="button">
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
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// TODO: API 연동 후 실제 거래 시간으로 교체
const now = new Date()
const currentTime = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  padding: 18px 20px;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon { width: 24px; height: 24px; }

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
}

.logo {
  width: 64px;
  height: 64px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
}

.info-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #f0f1f3;
  border-bottom: 1px solid #f0f1f3;
  margin: 8px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-label {
  font-size: 14px;
  color: #8b9097;
}

.info-value {
  font-size: 14px;
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
  background-color: transparent;
  color: #8b9097;
  text-decoration: underline;
}

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

.nav-icon { width: 24px; height: 24px; }

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>