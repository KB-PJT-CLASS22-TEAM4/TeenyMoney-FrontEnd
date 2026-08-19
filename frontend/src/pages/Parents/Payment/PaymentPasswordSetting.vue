<template>
  <div class="pay-pw-screen">
    <header class="nav">
      <button class="icon-btn" type="button" aria-label="뒤로" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">결제 비밀번호 설정</h1>
      <ParentNavActions />
    </header>

    <div class="lock-area">
      <div class="lock-icon">
        <svg :class="{ shake: isError }" viewBox="0 0 24 24" width="40" height="40" fill="none">
          <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#ffffff" stroke-width="1.8"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="12" cy="15" r="1.3" fill="#ffffff"/>
        </svg>
      </div>
      <p class="lock-text">새로운 결제 비밀번호 6자리를 입력해 주세요</p>
      <p class="lock-sub">이 비밀번호는 자녀 결제에도 적용돼요</p>

      <div class="dots" :class="{ shake: isError }">
        <span
          v-for="n in 6"
          :key="n"
          class="dot"
          :class="{ filled: pin.length >= n, error: isError }"
        ></span>
      </div>

      <p class="error-text" :class="{ show: isError }">{{ errorMsg }}</p>
    </div>

    <div class="keypad">
      <button
        v-for="k in ['1','2','3','4','5','6','7','8','9']"
        :key="k"
        class="key"
        type="button"
        @click="press(k)"
      >
        {{ k }}
      </button>
      <span class="key empty"></span>
      <button class="key" type="button" @click="press('0')">0</button>
      <button class="key" type="button" aria-label="지우기" @click="remove">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" stroke="#15171b" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M13 9l4 4M17 9l-4 4" stroke="#15171b" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { registerPaymentPassword } from '@/api/password'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

const router = useRouter()
const authStore = useAuthStore()

const pin = ref('')
const isError = ref(false)
const errorMsg = ref('')
const submitting = ref(false)
const PIN_LENGTH = 6

function press(num) {
  if (pin.value.length >= PIN_LENGTH || submitting.value) return
  isError.value = false
  pin.value += num
}

function remove() {
  isError.value = false
  pin.value = pin.value.slice(0, -1)
}

watch(pin, (val) => {
  if (val.length === PIN_LENGTH && !submitting.value) {
    submitPin()
  }
})

async function submitPin() {
  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    pin.value = ''
    return
  }

  submitting.value = true
  try {
    await registerPaymentPassword(authStore.accessToken, pin.value)
    router.replace({ name: 'parents-payment-password-done' })
  } catch (e) {
    errorMsg.value = e.message || '결제 비밀번호 등록에 실패했습니다.'
    isError.value = true
    setTimeout(() => {
      pin.value = ''
      isError.value = false
    }, 500)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.pay-pw-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
}

.nav {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  padding: 0 8px 0 4px;
}

.icon-btn {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 22px;
  height: 22px;
}

.nav-title {
  flex: 1;
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
  text-align: center;
}

.lock-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
}

.lock-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 76px;
  height: 76px;
  background: #ffbc00;
  border-radius: 50%;
}

.lock-text {
  margin: 30px 0 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
  text-align: center;
}

.lock-sub {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
}

.dots {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: background 0.15s;
}

.dot.filled {
  background: #ffbc00;
}

.dot.error {
  background: #e5484d;
}

.dots.shake,
.lock-icon svg.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.error-text {
  margin: 16px 0 0;
  font-weight: 600;
  font-size: 13px;
  color: #e5484d;
  opacity: 0;
  transition: opacity 0.2s;
}

.error-text.show {
  opacity: 1;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 24px;
  width: 260px;
  margin-top: 40px;
}

.key {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 56px;
  border: none;
  background: transparent;
  font-weight: 500;
  font-size: 26px;
  color: #15171b;
  cursor: pointer;
  border-radius: 12px;
}

.key:active {
  background: #f4f5f6;
}

.key.empty {
  cursor: default;
}

.key.empty:active {
  background: transparent;
}
</style>
