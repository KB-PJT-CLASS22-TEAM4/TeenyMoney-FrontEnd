<template>
  <div class="pay-pw-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">결제 비밀번호 변경</h1>
    </div>

    <!-- 자물쇠 + 안내 -->
    <div class="lock-area">
      <div class="lock-icon">
        <svg :class="{ shake: isError }" viewBox="0 0 24 24" width="40" height="40" fill="none">
          <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#ffffff" stroke-width="1.8"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="12" cy="15" r="1.3" fill="#ffffff"/>
        </svg>
      </div>
      <!-- 단계에 따라 문구 변경 -->
      <p class="lock-text">{{ guideText }}</p>

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
      <button v-for="k in ['1','2','3','4','5','6','7','8','9']" :key="k" class="key" @click="press(k)">
        {{ k }}
      </button>
      <span class="key empty"></span>
      <button class="key" @click="press('0')">0</button>
      <button class="key" @click="remove" aria-label="지우기">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" stroke="#15171b" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M13 9l4 4M17 9l-4 4" stroke="#15171b" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const pin = ref('')
const isError = ref(false)
const errorMsg = ref('')
const PIN_LENGTH = 6

// 단계: 'current'(기존 비번 확인) → 'new'(새 비번 입력)
const step = ref('current')

// 더미: 기존 비번이 123456이라고 가정 (나중에 API 검증으로 교체)
const DUMMY_CURRENT = '123456'

// 단계별 안내 문구
const guideText = computed(() =>
  step.value === 'current'
    ? '기존 비밀번호를 입력해 주세요'
    : '새 비밀번호 6자리를 입력해 주세요'
)

function press(num) {
  if (pin.value.length >= PIN_LENGTH) return
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

// 6자리 다 채워지면 단계별 처리
watch(pin, (val) => {
  if (val.length === PIN_LENGTH) {
    handleSubmit()
  }
})

function handleSubmit() {
  if (step.value === 'current') {
    // 1단계: 기존 비번 확인
    // TODO: [API] 기존 비번 검증 (지금은 더미 123456)
    if (pin.value === DUMMY_CURRENT) {
      pin.value = ''          // 입력 초기화
      step.value = 'new'      // 새 비번 입력 단계로
    } else {
      handleError('기존 비밀번호가 일치하지 않습니다')
    }
  } else {
    // 2단계: 새 비번 입력 완료
    // TODO: [API] 새 비번 저장
    //   POST /api/v1/... { paymentPassword: pin.value }
    //   headers: { Authorization: `Bearer ${accessToken}` }
    console.log('새 결제 비밀번호:', pin.value)

    // 완료 화면 재사용 (설정 완료 화면과 동일)
    router.push({ name: 'child-password-setting-done' })
  }
}

// 실패 시: 문구 + 흔들림 + 초기화
function handleError(msg = '다시 시도해 주세요') {
  errorMsg.value = msg
  isError.value = true
  setTimeout(() => {
    pin.value = ''
    isError.value = false
  }, 500)
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
  background: #ffffff;
  border: 1px solid #eceef1;
}

/* 상단 네비 */
.nav {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 12px 20px;
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
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
}

/* 자물쇠 + 안내 */
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
}

/* 6자리 점 */
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

/* 흔들림 (점 + 자물쇠) */
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