<template>
  <div class="page">
    <div class="scroll">
      <header class="nav">
        <button class="back-btn" type="button" aria-label="뒤로 가기" @click="goBack">
          <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
        </button>
        <h1 class="nav-title">회원가입</h1>
      </header>

      <div class="content">
        <h2 class="heading">정보를 입력해 주세요</h2>

        <div class="field field-active">
          <label class="label" for="name">이름</label>
          <input
            id="name"
            v-model="form.name"
            class="input"
            type="text"
            autocomplete="name"
          />
        </div>

        <div class="field">
          <label class="label" for="birthdate">생년월일</label>
          <input
            id="birthdate"
            v-model="form.birthdate"
            class="input"
            type="text"
            inputmode="numeric"
            placeholder="YYYYMMDD"
          />
        </div>

        <div class="field field-phone">
          <label class="label" for="phone">휴대폰 번호</label>
          <div class="input-row">
            <input
              id="phone"
              v-model="form.phone"
              class="input input-inline"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
            />
            <button class="verify-btn" type="button" @click="requestVerification">
              인증
            </button>
          </div>
        </div>

        <div class="field">
          <label class="label" for="code">인증번호</label>
          <div class="input-row">
            <input
              id="code"
              v-model="form.verificationCode"
              class="input input-inline"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="인증번호 6자리 입력"
            />
            <span v-if="timerActive" class="timer">{{ formattedTimer }}</span>
          </div>
          <p class="helper">문자로 받은 6자리 숫자를 입력해 주세요</p>
        </div>

        <div class="field">
          <label class="label" for="email">이메일</label>
          <input
            id="email"
            v-model="form.email"
            class="input"
            type="email"
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label class="label" for="password">비밀번호</label>
          <input
            id="password"
            v-model="form.password"
            class="input"
            type="password"
            autocomplete="new-password"
            placeholder="비밀번호 입력 (8자 이상)"
          />
        </div>

        <div class="field">
          <label class="label" for="passwordConfirm">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            v-model="form.passwordConfirm"
            class="input"
            type="password"
            autocomplete="new-password"
            placeholder="비밀번호 재입력"
          />
        </div>

        <button class="terms" type="button" @click="toggleTerms">
          <span class="checkbox" :class="{ checked: form.agreedToTerms }">
            <img
              v-if="form.agreedToTerms"
              src="@/assets/icons/icon-check.svg"
              alt=""
              class="check-icon"
            />
          </span>
          <span class="terms-text">
            서비스 이용약관·개인정보 동의 <span class="required">(필수)</span>
          </span>
          <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
        </button>
      </div>
    </div>

    <div class="footer">
      <button class="submit-btn" type="button" :disabled="!canSubmit" @click="submit">
        가입 완료
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {checkEmail , sendPhoneVerificationCode, signup} from '@/api/auth'; // API 호출 함수 임포트

const router = useRouter();

const form = reactive({
  name: '',
  birthdate: '',
  phone: '',
  verificationCode: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreedToTerms: false, // 서비스 이용약관·개인정보 동의 여부
});

// 휴대폰: 10~11자리 숫자, 하이픈 제거
function formatPhone(value) {
  return value.replace(/-/g, '').replace(/[^0-9]/g, '')
}

// 1단계: 이메일 중복 확인
async function handleCheckEmail() {
  const res = await checkEmail(form.value.email)
  if (res.success) {
    alert('사용 가능한 이메일이에요!')
  }
}

// 이메일 형식 검증
function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = '이메일 형식이 올바르지 않아요'
    return false
  }
  errors.value.email = ''
  return true
}

// 비밀번호 검증
// 10~64자, 영문+숫자+특수문자 포함, 이메일·전화번호와 동일하거나 포함되는 값 제한
function validatePassword() {
  const pw = form.value.password
  const phone = formatPhone(form.value.phone)

  if (pw.length < 10 || pw.length > 64) {
    errors.value.password = '비밀번호는 10~64자여야 합니다'
    return false
  }
  if (!/[a-zA-Z]/.test(pw)) {
    errors.value.password = '영문자를 포함해야 합니다'
    return false
  }
  if (!/[0-9]/.test(pw)) {
    errors.value.password = '숫자를 포함해야 합니다'
    return false
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) {
    errors.value.password = '특수문자를 포함해야 합니다'
    return false
  }
  if (form.value.email && pw.includes(form.value.email)) {
    errors.value.password = '이메일을 포함할 수 없어요'
    return false
  }
  if (phone && pw.includes(phone)) {
    errors.value.password = '전화번호를 포함할 수 없어요'
    return false
  }
  errors.value.password = ''
  return true
}

// 비밀번호 확인 (일치 여부만)
function validatePasswordConfirm() {
  if (form.value.password !== form.value.passwordConfirm) {
    errors.value.passwordConfirm = '비밀번호가 일치하지 않아요'
    return false
  }
  errors.value.passwordConfirm = ''
  return true
}

const timerSeconds = ref(167);
const timerActive = ref(false);
let timerInterval = null;

const formattedTimer = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60);
  const seconds = timerSeconds.value % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
});

const canSubmit = computed(
  () =>
    form.name.trim() &&
    form.birthdate.trim() &&
    form.phone.trim() &&
    form.verificationCode.trim().length === 6 &&
    form.email.trim() &&
    form.password.length >= 8 &&
    form.password === form.passwordConfirm &&
    form.agreedToTerms,
);

function goBack() {
  router.back();
}

async function re() {
  if (!form.phone.trim()) {
    return;
  }

  // TODO: 인증번호 발송 API 호출
  // POST  ~
  // body: 
  // 성공 시 타이머 시작, 실패 시 에러 메시지 표시
  // 휴대폰 인증번호 발송
  async function handleSendPhone() {
  if (!validatePhone()) return
  const phone = formatPhone(form.value.phone)
  const res = await sendPhoneVerification(phone)
  if (res.success) alert('인증번호가 발송됐어요!')
}
  

  timerSeconds.value = 167;
  timerActive.value = true;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (timerSeconds.value <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerActive.value = false;
      return;
    }

    timerSeconds.value -= 1;
  }, 1000);
}

function toggleTerms() {
  form.agreedToTerms = !form.agreedToTerms;
}

async function submit() {
  if (!canSubmit.value) {
    return;
  }

  // TODO: 회원가입 API 호출
  // POST /auth/signup
  // body: {
  //   name: form.name,
  //   birthdate: form.birthdate,
  //   phone: form.phone,
  //   verificationCode: form.verificationCode,  // 백엔드에서 인증코드 일치 여부 검증
  //   email: form.email,
  //   password: form.password,
  //   agreedToTerms: form.agreedToTerms,
  // }
  // 가입완료 → 로그인 페이지로 이동 , 실패 시 → 에러 메시지 표시
  
  // 최종 회원가입
  async function handleSignup() {
  const isValid =
    validateEmail() &&
    validatePhone() &&
    validatePassword() &&
    validatePasswordConfirm()

  if (!isValid) return

  const res = await signup({
    email: form.value.email,
    password: form.value.password,
    phone: formatPhone(form.value.phone),  // 하이픈 제거 후 전송
    name: form.value.name
    // passwordConfirm은 DB 저장 안 하니까 전송 안 함
  })

  if (res.success) {
    alert('회원가입 완료!')
    router.push('/login')
  }
}

  async function submit() {
  if (!canSubmit.value) return;

  try {
    await api.post('/auth/signup', { ...form })
    router.push('/login') // 성공 후 이동
  } catch (error) {
    alert('회원가입에 실패했습니다.')
  }
 }
}

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
.page {
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  border: 1px solid #eceef1;
}

.scroll {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-bottom: 97px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 6px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 22px;
  height: 22px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
  letter-spacing: -0.32px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 10px 20px 0;
}

.heading {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
  letter-spacing: -0.38px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: #8b9097;
  letter-spacing: -0.13px;
}

.input {
  width: 100%;
  padding: 0 0 13px;
  border: none;
  border-bottom: 1px solid #f0f1f3;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #191b1e;
  outline: none;
}

.input::placeholder {
  color: #8b9097;
}

.field-active .input,
.field-active .input-row {
  border-bottom-color: #eaedf1;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f1f3;
  padding-bottom: 13px;
}

.input-inline {
  flex: 1;
  min-width: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.verify-btn {
  flex-shrink: 0;
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  background-color: #f4b400;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
}

.timer {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: #8b9097;
  letter-spacing: -0.28px;
}

.helper {
  margin: -3px 0 0;
  font-size: 12px;
  font-weight: 500;
  color: #b9bec5;
}

.terms {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 17px 0 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background-color: #f0f1f3;
}

.checkbox.checked {
  background-color: #ffbc00;
}

.check-icon {
  width: 15px;
  height: 15px;
}

.terms-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  color: #191b1e;
}

.required {
  color: #8b9097;
}

.chevron-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.footer {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 360px;
  padding: 6px 20px 22px;
  background-color: #ffffff;
}

.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 8px;
  background-color: #ffbc00;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
  letter-spacing: -0.14px;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
