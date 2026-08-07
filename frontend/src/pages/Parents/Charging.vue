<template>
  <div class="page">
    <div class="content">
      <div class="loading-wrap">
        <div class="spinner"></div>
        <h2 class="title">송금 중</h2>
        <p class="desc">잠시만 기다려주세요</p>
        <p class="amount">{{ Number(route.query.amount).toLocaleString() }}원</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  // TODO: API 연동
  // POST /wallet/charge
  // body: { amount: route.query.amount }
  // 성공 시 → ChargeCompletePage 로 이동
  // 실패 시 → 에러 처리

  // 임시: 2초 후 완료 페이지로 이동
  setTimeout(() => {
    router.push({
      path: '/parents/charge/complete',
      query: { amount: route.query.amount },
    })
  }, 2000)
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 스피너 */
.spinner {
  width: 56px;
  height: 56px;
  border: 5px solid #f0f1f3;
  border-top-color: #ffbc00;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
}

.amount {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffbc00;
}
</style>