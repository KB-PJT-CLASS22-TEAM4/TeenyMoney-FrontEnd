<template>
  <div class="pay-pw-screen">
    <!-- 상단 네비 (중앙 타이틀 + 우측 X 닫기 버튼) -->
    <div class="nav">
      <div class="nav-placeholder"></div>
      <h1 class="nav-title">결제 비밀번호 설정</h1>
      <button class="icon-btn close-btn" type="button" @click="goBack" aria-label="닫기">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 자물쇠 + 안내 -->
    <div class="lock-area">
      <div class="lock-icon">
        <svg :class="{ shake: isError }" viewBox="0 0 24 24" width="34" height="34" fill="none">
          <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#ffffff" stroke-width="1.8"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="12" cy="15" r="1.3" fill="#ffffff"/>
        </svg>
      </div>
      <p class="lock-text">새로운 결제 비밀번호를 입력해 주세요</p>

      <!-- 6자리 점 -->
      <div class="dots" :class="{ shake: isError }">
        <span
          v-for="n in 6"
          :key="n"
          class="dot"
          :class="{ filled: pin.length >= n, error: isError }"
        ></span>
      </div>

      <!-- 에러 문구 -->
      <p class="error-text" :class="{ show: isError }">{{ errorMsg }}</p>
    </div>

    <!-- 숫자 키패드 -->
    <div class="keypad">
      <button v-for="k in ['1','2','3','4','5','6','7','8','9']" :key="k" type="button" class="key" @click="press(k)">
        {{ k }}
      </button>
      <span class="key empty"></span>
      <button type="button" class="key" @click="press('0')">0</button>
      <button class="key" type="button" @click="remove" aria-label="지우기">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M13 9l4 4M17 9l-4 4" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/>
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

function goBack() {
  router.back()
}

// 6자리 다 채워지면 등록 실행
watch(pin, (val) => {
  if (val.length === PIN_LENGTH && !submitting.value) {
    submitPin()
  }
})

async function submitPin() {
  submitting.value = true
  try {
    await registerPaymentPassword(authStore.accessToken, pin.value)
    router.push({ name: 'child-password-setting-done' })
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
  min-height: 730px;
  margin: 0 auto;
  padding: 40px 0 30px;
  background: #f8fafc;
}

/* 상단 네비 */
.nav {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 20px;
}

.nav-placeholder {
  width: 30px;
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  z-index: 2;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
}

/* 자물쇠 + 안내 */
.lock-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 54px;
}

.lock-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 66px;
  height: 66px;
  background: #ffbc00;
  border-radius: 50%;
}

.lock-text {
  margin: 28px 0 0;
  font-weight: 600;
  font-size: 19px;
  color: #0f172a;
  letter-spacing: -0.4px;
  text-align: center;
}

/* 6자리 점 */
.dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-top: 40px;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: background 0.15s ease, transform 0.15s ease;
}

.dot.filled {
  background: #ffbc00;
  transform: scale(1.05);
}

.dot.error {
  background: #e5484d; 
}

/* 흔들림 (점 + 자물쇠)*/
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

/* 에러 문구 */
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

/* 숫자 키패드 */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  align-items: center;
  width: 100%;
  max-width: 320px;
  margin: 54px auto 0;
  padding: 0;
  gap: 8px 0;
  box-sizing: border-box;
}

.key {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 56px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 26px;
  line-height: 1;
  text-align: center;
  color: #0f172a;
  cursor: pointer;
  border-radius: 12px;
  appearance: none;
  -webkit-appearance: none;
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