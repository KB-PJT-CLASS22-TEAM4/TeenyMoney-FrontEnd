<template>
  <div class="pay-pw-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">결제 비밀번호</h1>
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
      <p class="lock-text">결제 비밀번호를 입력해 주세요</p>

      <!-- 6자리 점  -->
      <div class="dots" :class="{ shake: isError }">
        <span
          v-for="n in 6"
          :key="n"
          class="dot"
          :class="{ filled: pin.length >= n, error: isError }"
        ></span>
      </div>

      <!-- 에러 문구 -->
      <p class="error-text" :class="{ show: isError }">비밀번호가 일치하지 않습니다</p>
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
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 결제정보에서 넘어온 QR 값
const code = route.query.code || ''

const pin = ref('')
const isError = ref(false)   // 비밀번호 틀림 상태
const PIN_LENGTH = 6

// [더미] 지금은 '123456'을 정답으로 가정
const DUMMY_CORRECT = '123456'

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
  router.push({ name: 'qr-scan' })
}

// 6자리 다 채워지면 결제 실행
watch(pin, (val) => {
  if (val.length === PIN_LENGTH) {
    if (val === DUMMY_CORRECT) {
      router.push({ name: 'pay-processing', query: { code } })
    } else {
      handleError()
    }
  }
})

function submitPin() {
  // ============================================================
  // [API] 입력한 비밀번호로 결제 실행
  //   POST /api/child/payment/pay
  //   body: { code, pin: pin.value }
  //   → 성공: 결제 진행중/완료 화면으로 이동
  //   → 실패(비번 불일치): 서버가 에러 응답 → 아래 handleError()
  //   → 잔액 부족 : 잔액 부족 안내 (TODO)
  // ============================================================

  // 지금은 더미로 검증 (API 붙이면 위 코드로 교체)
  if (pin.value === DUMMY_CORRECT) {
    // 성공 → 다음 화면
    // router.push({ name: 'pay-processing', query: { code } })
    console.log('비밀번호 일치 (성공)')
  } else {
    handleError()
  }
}

// 비밀번호 틀렸을 때: 문구 + 흔들림 + 초기화
function handleError() {
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