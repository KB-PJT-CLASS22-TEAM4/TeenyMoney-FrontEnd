<script setup>
import { ref, computed } from 'vue'
import logoUrl from '@/assets/logo.svg'  // 지갑 로고: src/assets/logo.svg 에 저장
import { useRouter } from 'vue-router'
const router = useRouter() 
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
 
// 비밀번호 8자 이상인지 검사
const isPasswordValid = computed(() => password.value.length >= 8)
 
// 로그인 버튼 활성 조건: 이메일 입력됨 + 비번 8자 이상
const canSubmit = computed(() => email.value.length > 0 && isPasswordValid.value)
 
// 안내문구: 비번을 입력하기 시작했는데 아직 8자 미만일 때만 표시
const showPasswordHint = computed(
  () => password.value.length > 0 && !isPasswordValid.value
)
 
const authStore = useAuthStore()

async function handleLogin() {
  const res = await login(email.value, password.value)

  console.log('로그인 전체 응답:', res)
  console.log('응답 data:', res.data)
  console.log('Access Token:', res.data?.accessToken)
  console.log('Role:', res.data?.role)

  if (res.success) {
    authStore.setUser(res.data)

    if (res.data.role === 'CHILD') {
      router.push('/child/home')
    } else {
      router.push('/parents/home')
    }
  } else {
    console.log('로그인 실패:', res.message)
  }
}
 
function handleGoogleLogin() {
  // TODO: 구글 OAuth 연동
  console.log('google login')
}




</script>
 
<template>
        
  <div class="login-screen">
    <div class="scroll">
      
      
      <header class="nav">
            <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" @click="router.back()"/>
      </header>

      <div class="pad">
        <img class="logo" :src="logoUrl" alt="티니머니" />
 
        <div class="heading">
          <h1 class="welcome">다시 만나서 반가워요</h1>
          <p class="subtitle">티니머니 계정으로 로그인하세요</p>
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
                type="password"
                placeholder="비밀번호를 입력하세요"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
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

/* back-btn 관련 추가 */
.nav {
  display: flex;
  align-items: center;
  padding: 18px 20px 6px;  /* ← 좌우 20px 여백 추가 */
}
 
.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 0;
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
  line-height: 16px;
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
 
