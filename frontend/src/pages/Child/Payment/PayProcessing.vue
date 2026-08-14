<template>
  <div class="processing-screen">
    <div class="center">
      <!-- 캐릭터 -->
      <img src="@/assets/mascot/teeny-run.png" class="character" alt="결제 진행중" />

      <!-- 안내 문구 -->
      <p class="guide-title">결제 정보를 확인하고 있어요</p>
      <p class="guide-sub">잠시만 기다려 주세요!</p>

      <!-- 로딩 점 3개 -->
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'

const router = useRouter()
const paymentStore = usePaymentStore()

// 결제 API는 PayPassword.vue에서 이미 성공적으로 실행되고,
// 그 결과가 paymentStore.lastResult에 저장된 상태로 이 화면에 도착함.
// 여기서는 최소 로딩 시간(1.5초)만 채운 뒤 결제 완료 화면으로 이동.
let timer = null
onMounted(() => {
  // 결과 없이 이 화면에 직접 진입한 경우(새로고침 등) 방어 처리
  if (!paymentStore.lastResult) {
    router.replace({ name: 'qr-scan' })
    return
  }

  timer = setTimeout(() => {
    router.push({ name: 'pay-done' })
  }, 1500)
})
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.processing-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding: 50px 0 30px;
  background: #ffffff;
  border: 1px solid #eceef1;
}

/* 가운데 영역 */
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto 0;
}

/* 캐릭터 움직이기*/
.character {
  width: 150px;
  height: 150px;
  object-fit: contain;
  animation: run 0.7s ease-in-out infinite;
}

@keyframes run {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
}

/* 안내 문구 */
.guide-title {
  margin: 10px 0 0;
  font-weight: 700;
  font-size: 19px;
  color: #15171b;
}

.guide-sub {
  margin: 8px 0 0;
  font-weight: 500;
  font-size: 14px;
  color: #b9bec5;
}

/* 로딩 점 3개 */
.loading-dots {
  display: flex;
  gap: 8px;
  margin-top: 28px;
}

.loading-dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ffbc00;
  animation: blink 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-5px); }
}
</style>