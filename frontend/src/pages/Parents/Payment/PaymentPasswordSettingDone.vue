<template>
  <div class="done-screen">
    <div class="center">
      <div class="check-circle">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#ffffff" stroke-width="2.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="done-title">
        {{ isChange ? '결제 비밀번호 변경 완료' : '결제 비밀번호 설정 완료' }}
      </h2>
      <p class="done-msg">이 비밀번호가 자녀 결제에도 적용돼요</p>
    </div>

    <div class="confirm-wrap">
      <button class="confirm-btn" type="button" @click="goNext">확인</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isChange = route.query.mode === 'change'

function goNext() {
  const from = route.query.from

  if (from === 'payment-change') {
    router.replace({
      name: 'payment-change',
      query: { openAdd: '1' },
    })
    return
  }

  if (from === 'charge') {
    router.replace({ name: 'charge' })
    return
  }

  router.replace({ name: 'parents-mypage' })
}
</script>

<style scoped>
.done-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 40px 0 30px;
  background: #ffffff;
}

.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 32px;
}

.check-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 88px;
  height: 88px;
  background: #ffbc00;
  border-radius: 50%;
  margin-bottom: 32px;
}

.done-title {
  margin: 0 0 10px;
  font-weight: 700;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
  color: #191b1e;
}

.done-msg {
  margin: 0;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #8b9097;
}

.confirm-wrap {
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px;
}

.confirm-btn {
  width: 100%;
  height: 54px;
  background: #ffbc00;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
  cursor: pointer;
}
</style>
