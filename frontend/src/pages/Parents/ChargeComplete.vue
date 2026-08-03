<template>
  <div class="page">
    <div class="content">
      <div class="complete-wrap">
        <div class="check-circle">
          <img src="@/assets/icons/icon-check.svg" alt="" class="check-icon" />
        </div>
        <h2 class="title">충전 완료!</h2>
        <p class="amount">{{ Number(route.query.amount).toLocaleString() }}원</p>
        <p class="desc">티니머니 지갑에 충전되었어요</p>
      </div>
    </div>

    <div class="footer">
      <button class="home-btn" @click="router.push('/parent/home')">홈으로 돌아가기</button>
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
  padding-bottom: 90px;
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.check-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #fff8e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 36px;
  height: 36px;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #191b1e;
}

.amount {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #ffbc00;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  padding: 10px 16px 28px;
  background-color: #ffffff;
}

.home-btn {
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