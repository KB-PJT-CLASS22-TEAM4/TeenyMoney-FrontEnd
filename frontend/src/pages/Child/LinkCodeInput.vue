<template>
  <div class="link-screen">
    <!-- 상단 네비 (중앙 타이틀 + 우측 X 닫기 버튼) -->
    <div class="nav">
      <div class="nav-placeholder"></div>
      <h1 class="nav-title">부모님 연동</h1>
      <button class="icon-btn close-btn" type="button" @click="goBack" aria-label="닫기">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 아이콘 + 안내 -->
    <div class="lock-area">
      <div class="lock-icon">
        <svg :class="{ shake: isError }" viewBox="0 0 24 24" width="34" height="34" fill="none">
          <path d="M9 15l6-6" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M10.5 7.5l1-1a3.5 3.5 0 0 1 5 5l-1 1" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M13.5 16.5l-1 1a3.5 3.5 0 0 1-5-5l1-1" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="lock-text">부모님 앱에서 발급한 6자리 코드를 입력해 주세요</p>

      <!-- 6자리 코드 박스 (입력한 숫자를 그대로 보여줌) -->
      <div class="code-row" :class="{ shake: isError }">
        <div
          v-for="n in CODE_LENGTH"
          :key="n"
          class="code-box"
          :class="{ filled: code.length >= n, error: isError }"
        >
          {{ code[n - 1] ?? '' }}
        </div>
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
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { connectFamilyCode } from '@/api/families'
import { useAuthStore } from '@/stores/auth'

const router = useRouter();
const authStore = useAuthStore()

const CODE_LENGTH = 6;
const code = ref('');
const isError = ref(false)
const errorMsg = ref('');
const submitting = ref(false)

function press(num) {
  if (code.value.length >= CODE_LENGTH || submitting.value) return
  isError.value = false
  code.value += num;
}

function remove() {
  isError.value = false
  code.value = code.value.slice(0, -1);
}

function goBack() {
  router.back()
}

// 6자리 다 채워지면 인증 실행
watch(code, (val) => {
  if (val.length === CODE_LENGTH && !submitting.value) {
    verifyCode();
  }
})

async function verifyCode() {
  submitting.value = true
  try {
    const res = await connectFamilyCode(authStore.accessToken, code.value)
    console.log('연동 성공:', res)
    router.push({ name: 'child-link-confirm' })
  } catch (e) {
    console.log('연동 실패:', e.message)
    errorMsg.value = e.message || '코드가 일치하지 않아요'
    isError.value = true
    setTimeout(() => {
      code.value = ''
      isError.value = false
    }, 500)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.link-screen {
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

/* 상단 네비 — 화면 배경과 동일한 색으로 이어지도록 */
.nav {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 20px;
  background: #f8fafc;
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

/* 아이콘 + 안내 */
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
  font-size: 17px;
  color: #0f172a;
  letter-spacing: -0.3px;
  text-align: center;
  padding: 0 32px;
}

/* 6자리 코드 박스 */
.code-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  width: 100%;
  margin-top: 40px;
}

.code-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 52px;
  border: 1px solid #ccd3dd;
  border-radius: 8px;
  font-weight: 800;
  font-size: 22px;
  color: #15171b;
  background: #ffffff;
  transition: border-color 0.15s ease;
}

.code-box.filled {
  border-color: #ffbc00;
}

.code-box.error {
  border-color: #e5484d;
}

/* 흔들림 (코드 박스 + 아이콘)*/
.code-row.shake,
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
