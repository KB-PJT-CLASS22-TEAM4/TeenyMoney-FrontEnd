<script setup>
import { ref, computed } from 'vue'
import logoUrl from '@/assets/logo.svg'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { getMyParent } from '@/api/families'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const showLoginErrorModal = ref(false)
const loginErrorMessage = ref('')
 
// 비밀번호 8자 이상인지 검사
const isPasswordValid = computed(() => password.value.length >= 8)
 
// 로그인 버튼 활성 조건: 이메일 입력됨 + 비번 8자 이상
const canSubmit = computed(() => email.value.length > 0 && isPasswordValid.value)
 
// 안내문구: 비번을 입력하기 시작했는데 아직 8자 미만일 때만 표시
const showPasswordHint = computed(
  () => password.value.length > 0 && !isPasswordValid.value
)

async function handleLogin() {
  if (!canSubmit.value) return

  try {
    const res = await login(email.value, password.value)

    if (res.success) {
      authStore.setUser(res.data)

      if (res.data.role === 'CHILD') {
        try {
          const parentRes = await getMyParent(res.data.accessToken)
          if (parentRes.data === null) {
            router.push({ name: 'child-link' })
          } else {
            router.push({ name: 'child-home' })
          }
        } catch {
          router.push({ name: 'child-link' })
        }
      } else {
        router.push({ name: 'parents-home' })
      }
      return
    }

    loginErrorMessage.value =
      res.message || '이메일 또는 비밀번호가 일치하지 않습니다.'
    showLoginErrorModal.value = true
  } catch (error) {
    console.error('로그인 실패:', error)
    loginErrorMessage.value = '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    showLoginErrorModal.value = true
  }
}

function closeLoginErrorModal() {
  showLoginErrorModal.value = false
}

function handleGoogleLogin() {
  // TODO: 구글 OAuth 연동
  console.log('google login')
}

</script>
 
<template>
        
  <div class="login-screen">
    <div class="scroll">
      <div class="pad">
        <img class="logo" :src="logoUrl" alt="티니머니" />

        <div class="heading">
          <h1 class="welcome">티니머니에 오신 걸 환영해요</h1>
          <p class="subtitle">
            용돈을 충전하고 목표를 모아요.<br />
            로그인하고 자녀와 함께 시작해 보세요.
          </p>
        </div>
 
        <div class="form">
          <div class="field">
            <label class="eyebrow" for="email">이메일</label>
            <div class="input-wrap">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="이메일을 입력하세요"
                autocomplete="email"
              />
            </div>
          </div>
 
           <div class="field">
            <label class="eyebrow" for="password">비밀번호</label>
            <!-- 경고 시 input-wrap 에 has-error 클래스가 붙어 빨간 박스로 바뀜 -->
            <div class="input-wrap" :class="{ 'has-error': showPasswordHint }">
              <input
                id="password"
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
              <button
                class="toggle-password"
                type="button"
                :aria-label="isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
                @click="isPasswordVisible = !isPasswordVisible"
              >
                <svg v-if="isPasswordVisible" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M4 4l16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <!-- 8자 미만일 때만 경고 문구 (아이콘 + 빨간 글씨) -->
            <p v-if="showPasswordHint" class="hint">
              <span class="hint-icon">!</span>
              비밀번호는 8자 이상 입력해주세요
            </p>
          </div>
 
          <button class="cta" type="button" :disabled="!canSubmit" @click="handleLogin">로그인</button>
 
          <div class="links">
            <span class="link">아이디 찾기</span>
            <span class="sep">|</span>
            <span class="link">비밀번호 찾기</span>
            <span class="sep">|</span>
            <span class="link" @click="router.push('/signup')">회원가입</span>
          </div>
 
          <div class="divider">
            <span class="line"></span>
            <span class="or">또는</span>
            <span class="line"></span>
          </div>
 
          <button class="google-btn" type="button" @click="handleGoogleLogin">
            <!-- 구글 로고: 파일 없이 SVG 인라인 (색상까지 표준 로고 그대로) -->
            <svg class="google-logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span class="google-text">Google로 로그인 하기</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    :show="showLoginErrorModal"
    title="로그인에 실패했어요"
    :description="loginErrorMessage"
    confirm-text="확인"
    hide-cancel
    @confirm="closeLoginErrorModal"
    @cancel="closeLoginErrorModal"
  />
    </template>
 
<style scoped>
 
.login-screen {
  box-sizing: border-box;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #ffffff;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
}
 
.scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 0;
  gap: 20px;
}
 
.logo {
  width: 70px;
  height: 63px;
  object-fit: contain;   /* 비율 유지 */
  flex: none;
}
 
.heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  width: 318px;
  padding-top: 2px;
}
 
.welcome {
  margin: 0;
  font-weight: 800;
  font-size: 20.8px;
  line-height: 25px;
  letter-spacing: -0.66px;
  color: #191b1e;
}
 
.subtitle {
  margin: 0;
  font-weight: 500;
  font-size: 13.3px;
  line-height: 1.5;
  text-align: center;
  color: #8b9097;
}
 
.form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;
  width: 318px;
  padding: 24px 0 20px;
}
 
.field {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
 
.eyebrow {
  font-weight: 600;
  font-size: 12.2px;
  line-height: 15px;
  letter-spacing: -0.13px;
  color: #8b9097;
}
 
.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eceef1;
}

/* 경고 상태: 밑줄 대신 빨간 네모 박스로 감싸기 */
.input-wrap.has-error {
  padding: 12px 14px;
  border: 1px solid #e5484d;
  border-radius: 8px;
}
 
.input-wrap input {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  padding: 0;
  font-family: inherit;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5;
  color: #191b1e;
  background: transparent;
}

.toggle-password {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #b9bec5;
  cursor: pointer;
}
 
.input-wrap input::placeholder {
  color: #8b9097;
}
 /* 비밀번호 경고 문구 (아이콘 + 빨간 글씨) */
.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #e5484d;
}
 
/* 동그란 ! 아이콘 */
.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e5484d;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  flex: none;
}
.cta {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  padding: 16px;
  background: #ffbc00;
  border: none;
  border-radius: 3px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14.5px;
  letter-spacing: -0.145px;
  color: #191b1e;
  cursor: pointer;
}
 
.cta:hover {
  filter: brightness(0.97);
}
/* 비활성화 상태: 회색 + 클릭 불가 */
.cta:disabled {
  background: #ecedf0;
  color: #b9bec5;
  cursor: not-allowed;
  filter: none;
}
 
.links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding-top: 4px;
}
 
.link {
  font-weight: 500;
  font-size: 12.7px;
  line-height: 15px;
  color: #8b9097;
  cursor: pointer;
}
 
.sep {
  font-weight: 400;
  font-size: 11px;
  color: #b9bec5;
}
 
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
}
 
.divider .line {
  flex: 1;
  height: 1px;
  background: #f0f1f3;
}
 
.divider .or {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
}
 
.google-btn {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 51px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
}
 
.google-btn:hover {
  background: #fafbfc;
}
 
.google-logo {
  width: 19px;
  height: 19px;
  flex: none;
}
 
.google-text {
  font-weight: 500;
  font-size: 14.4px;
  line-height: 17px;
  color: #191b1e;
}
</style>
 
