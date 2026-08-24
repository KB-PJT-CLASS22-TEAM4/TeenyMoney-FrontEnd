<template>
  <div class="page">
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로가기"
        @click="goHome"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">
        충전 완료
      </h1>

      <ParentNavActions />
    </header>

    <div class="content">
      <div class="complete-wrap">
        <div class="check-circle">
          <img
            src="@/assets/icons/icon-check.svg"
            alt=""
            class="check-icon"
          />
        </div>

        <h2 class="title">
          충전 완료!
        </h2>

        <p class="amount">
          {{ formattedAmount }}원
        </p>

        <p class="desc">
          티니머니 지갑에 충전되었어요
        </p>
      </div>
    </div>

    <div class="footer">
      <button
        class="home-btn"
        type="button"
        @click="goHome"
      >
        홈으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

const router = useRouter()
const route = useRoute()

const formattedAmount = computed(() =>
  Number(route.query.amount || 0).toLocaleString()
)

function goHome() {
  router.push('/parents/home')
}
</script>

<style scoped>
.page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
}

.nav {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  width: 100%;
  height: 56px;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #eceef1;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
  transform: translateX(-50%);
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

.complete-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 32px 20px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.check-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #fff8e1;
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
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px 24px;
}

.home-btn {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  background-color: #ffbc00;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}
</style>
