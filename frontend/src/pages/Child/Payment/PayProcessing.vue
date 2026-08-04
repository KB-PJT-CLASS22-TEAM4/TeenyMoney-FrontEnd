<template>
  <div class="processing-screen">
    <div class="center">
      <!-- 캐릭터 -->
      <img src="@/assets/rabbitrun.png" class="character" alt="결제 진행중" />

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
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const code = route.query.code || ''

// ============================================================
//   [API] 결제 실행 (이 화면에서 결제 API 호출)
//   PayPassword는 비밀번호 입력만 받고 이 화면으로 넘김.
//   실제 결제 실행은 여기서 하고, 응답을 기다리는 동안 로딩을 보여줌.
//
//   POST /api/child/payment/pay
//   body: { code, pin }
//     ※ pin은 URL query로 넘기면 안 됨(노출). pinia 스토어 등으로 전달받기.
//   → 성공: 결제 완료 화면(pay-done)으로 이동
//   → 실패: 사유별 처리
//       - 비밀번호 불일치 → 비밀번호 화면으로 되돌리기
//       - 잔액 부족       → 잔액 부족 안내
//
//   ※ 최소 표시 시간: 응답이 너무 빨리 와도 로딩을 최소 1.5초는 유지
// ============================================================
let timer = null
onMounted(() => {
    // UI 확인용 -> 2초 뒤 완료 화면으로 이동 (삭제 예정)
  timer = setTimeout(() => {
    router.push({ name: 'pay-done', query: { code } })
  }, 2000)
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