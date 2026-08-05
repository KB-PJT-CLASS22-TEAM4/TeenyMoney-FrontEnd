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
            v-model="form.birthDate"
            class="input"
            type="text"
            inputmode="numeric"
            placeholder="YYYY-MM-DD"
            maxlength="10"
            @input="formatBirthDateInput"
          />
          <p class="helper">만 14세 미만의 경우 개인정보보호법에 따라 법적 대리인의 인증이 필요합니다</p>
          <p v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</p>
        </div>

        <div class="field field-phone">
          <label class="label" for="phone">휴대폰 번호</label>
          <div class="input-row">
            <input
              id="phone"
              v-model="form.phoneNumber"
              class="input input-inline"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="010-0000-0000"
              @input="formatPhoneNumberInput"
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
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label class="label" for="password">비밀번호</label>
          <input
            id="password"
            v-model="form.password"
            class="input"
            type="password"
            autocomplete="new-password"
            placeholder="비밀번호 입력 (10자 이상, 영문+숫자+특수문자)"
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
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
          <p v-if="errors.passwordConfirm" class="error-text">{{ errors.passwordConfirm }}</p>
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

        <!-- 보호자 인증 모달 -->
        <div v-if="showGuardianModal" class="modal-overlay">
          <div class="modal">
            <div class="modal-title-wrap">
              <div class="modal-bar"></div>
              <h2 class="modal-title">법정대리인(보호자) 인증</h2>
            </div>

            <div class="field">
              <label class="label">보호자명</label>
              <input
                v-model="guardian.name"
                class="input"
                type="text"
                placeholder="보호자 이름 입력"
              />
            </div>

            <div class="field">
              <label class="label">관계</label>
              <select v-model="guardian.relationship" class="input select">
                <option v-for="opt in relationshipOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>

            <div class="field">
              <label class="label">휴대전화</label>
              <div class="input-row">
                <input
                  v-model="guardian.phone"
                  class="input input-inline"
                  type="tel"
                  inputmode="numeric"
                  placeholder="010-0000-0000"
                  @input="formatGuardianPhoneInput"
                />
                <button class="verify-btn" type="button" @click="requestGuardianVerification">인증</button>
              </div>
              <p v-if="guardianCodeSent" class="sent-text">인증번호가 발송되었습니다</p>
            </div>

            <div class="field">
              <label class="label">인증번호</label>
              <div class="input-row">
                <input
                  v-model="guardian.code"
                  class="input input-inline"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="인증번호 6자리 입력"
                />
                <button class="confirm-btn" type="button" @click="verifyGuardianCode">확인</button>
              </div>
              <p class="helper">문자로 받은 6자리 숫자를 입력해 주세요</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p v-if="submitBlockReason" class="block-reason">
            {{ submitBlockReason }}
          </p>
          <button class="submit-btn" type="button" :disabled="!canSubmit" @click="submit">
            가입 완료
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendPhoneVerificationCode, signup, sendGuardianVerificationCode, confirmGuardianVerification } from '@/api/auth'

const router = useRouter()

const form = reactive({
  name: '',
  birthDate: '',
  phoneNumber: '',
  verificationCode: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreedToTerms: false,
  serviceTermsAgreed: true,
  privacyAgreed: true,
})

const errors = reactive({
  birthDate: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

// ✅ 생년월일 자동 포맷 (YYYY-MM-DD, 숫자만, 미래 날짜 금지)
function formatBirthDateInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 8)

  let formatted = ''
  if (digits.length <= 4) {
    formatted = digits
  } else if (digits.length <= 6) {
    formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`
  } else {
    formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
  }

  form.birthDate = formatted

  // 날짜가 완성됐을 때만 미래 날짜 검증
  if (digits.length === 8) {
    validateBirthDate()
  } else {
    errors.birthDate = ''
  }
}

function validateBirthDate() {
  const digits = form.birthDate.replace(/-/g, '')
  if (digits.length !== 8) {
    errors.birthDate = '생년월일을 완전히 입력해주세요'
    return false
  }

  const year = parseInt(digits.slice(0, 4))
  const month = parseInt(digits.slice(4, 6))
  const day = parseInt(digits.slice(6, 8))

  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 유효하지 않은 날짜 체크 (예: 2월 30일)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    errors.birthDate = '올바른 날짜를 입력해주세요'
    return false
  }

  // 미래 날짜 금지
  if (date > today) {
    errors.birthDate = '미래 날짜는 입력할 수 없어요'
    return false
  }

  errors.birthDate = ''
  return true
}

// ✅ 공통 포맷 함수 (숫자만 추출 후 하이픈 추가)
function applyPhoneFormat(digits) {
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

// ✅ 회원가입 폼 전화번호 (한글/영어 차단 + 하이픈 자동 추가)
function formatPhoneNumberInput(e) {
  const digits = e.target.value.replace(/\D/g, '')
  form.phoneNumber = applyPhoneFormat(digits)
}

// ✅ 보호자 전화번호 (한글/영어 차단 + 하이픈 자동 추가)
function formatGuardianPhoneInput(e) {
  const digits = e.target.value.replace(/\D/g, '')
  guardian.phone = applyPhoneFormat(digits)
}

// API 전송 시 하이픈 제거
function formatPhone(value) {
  return value.replace(/-/g, '').replace(/[^0-9]/g, '')
}

// 만 14세 미만 여부 체크
function isUnder14() {
  if (!form.birthDate || form.birthDate.length !== 10) return false

  const digits = form.birthDate.replace(/-/g, '')
  const birthYear = parseInt(digits.slice(0, 4))
  const birthMonth = parseInt(digits.slice(4, 6))
  const birthDay = parseInt(digits.slice(6, 8))

  const today = new Date()
  const age =
    today.getFullYear() -
    birthYear -
    (today.getMonth() + 1 < birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)
      ? 1
      : 0)

  return age < 14
}

const showGuardianModal = ref(false)

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = '이메일 형식이 올바르지 않아요'
    return false
  }
  errors.email = ''
  return true
}

function validatePassword() {
  const pw = form.password
  const phone = formatPhone(form.phoneNumber)

  if (pw.length < 10 || pw.length > 64) {
    errors.password = '비밀번호는 10~64자여야 합니다.'
    return false
  }
  if (!/[a-zA-Z]/.test(pw)) {
    errors.password = '영문자를 포함해야 합니다.'
    return false
  }
  if (!/[0-9]/.test(pw)) {
    errors.password = '숫자를 포함해야 합니다.'
    return false
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) {
    errors.password = '특수문자를 포함해야 합니다.'
    return false
  }
  if (form.email && pw.includes(form.email)) {
    errors.password = '이메일을 포함할 수 없습니다.'
    return false
  }
  if (phone && pw.includes(phone)) {
    errors.password = '전화번호를 포함할 수 없습니다.'
    return false
  }
  errors.password = ''
  return true
}

function validatePasswordConfirm() {
  if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않아요'
    return false
  }
  errors.passwordConfirm = ''
  return true
}

const timerSeconds = ref(180)
const timerActive = ref(false)
let timerInterval = null

const formattedTimer = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const submitBlockReason = computed(() => {
  if (!form.name.trim()) return '이름을 입력해주세요'
  if (!form.birthDate.trim() || form.birthDate.length !== 10) return '생년월일을 입력해주세요 (YYYY-MM-DD)'
  if (errors.birthDate) return errors.birthDate
  if (!form.phoneNumber.trim()) return '휴대폰 번호를 입력해주세요'
  if (form.verificationCode.trim().length !== 6) return '인증번호 6자리를 입력해주세요'
  if (!form.email.trim()) return '이메일을 입력해주세요'
  if (form.password.length < 10) return `비밀번호가 ${form.password.length}자예요 (10자 이상 필요)`
  if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않아요'
  if (!form.agreedToTerms) return '약관에 동의해주세요'
  return null
})

const canSubmit = computed(
  () =>
    form.name.trim() &&
    form.birthDate.trim().length === 10 &&
    !errors.birthDate &&
    form.phoneNumber.trim() &&
    form.verificationCode.trim().length === 6 &&
    form.email.trim() &&
    form.password.length >= 10 &&
    form.password === form.passwordConfirm &&
    form.agreedToTerms,
)

// 보호자 정보
const guardian = reactive({
  name: '',
  phone: '',
  code: '',
  relationship: 'MOTHER',
})
const guardianCodeSent = ref(false)

const relationshipOptions = [
  { value: 'MOTHER', label: '어머니' },
  { value: 'FATHER', label: '아버지' },
  { value: 'OTHER', label: '기타' },
]

async function requestGuardianVerification() {
  if (!guardian.phone.trim()) return

  try {
    const res = await sendGuardianVerificationCode(guardian.phone)
    if (res.success) {
      guardianCodeSent.value = true
      alert('보호자 인증번호가 발송됐어요!')
    } else {
      alert(res.message || '인증번호 발송에 실패했어요')
    }
  } catch (e) {
    alert('인증번호 발송에 실패했어요')
  }
}

async function verifyGuardianCode() {
  if (guardian.code.length !== 6) return

  try {
    const res = await confirmGuardianVerification({
      legalGuardianName: guardian.name,
      legalGuardianTermsAgreed: true,
      phoneNumber: guardian.phone,
      privacyTermsVersion: 1,
      relationship: guardian.relationship,
      serviceTermsVersion: 1,
      verificationCode: parseInt(guardian.code),
    })

    if (res.success) {
      showGuardianModal.value = false
      await doSignup()
    } else {
      alert(res.message || '인증번호가 올바르지 않아요')
    }
  } catch (e) {
    alert('인증번호가 올바르지 않아요')
  }
}

function goBack() {
  router.back()
}

async function requestVerification() {
  if (!form.phoneNumber.trim()) return

  const phoneNumber = formatPhone(form.phoneNumber)

  try {
    const res = await sendPhoneVerificationCode(phoneNumber)
    if (res.success) {
      alert('인증번호가 발송됐어요!')

      timerSeconds.value = 180
      timerActive.value = true

      if (timerInterval) clearInterval(timerInterval)

      timerInterval = setInterval(() => {
        if (timerSeconds.value <= 0) {
          clearInterval(timerInterval)
          timerInterval = null
          timerActive.value = false
          return
        }
        timerSeconds.value -= 1
      }, 1000)
    }
  } catch (e) {
    alert('인증번호 발송에 실패했어요')
  }
}

function toggleTerms() {
  form.agreedToTerms = !form.agreedToTerms

  // 동의 체크 시 + 14세 미만이면 보호자 모달 표시
  if (form.agreedToTerms && isUnder14()) {
    showGuardianModal.value = true
  }
}

async function submit() {
  if (!canSubmit.value) return

  const isValid = validateBirthDate() && validateEmail() && validatePassword() && validatePasswordConfirm()
  if (!isValid) return

  if (isUnder14()) {
    showGuardianModal.value = true
    return
  }

  await doSignup()
}

async function doSignup() {
  try {
    const res = await signup({
      name: form.name,
      birthDate: form.birthDate.replace(/-/g, ''),  // YYYYMMDD 형식으로 전송
      phoneNumber: formatPhone(form.phoneNumber),
      verificationCode: form.verificationCode,
      email: form.email,
      password: form.password,
      agreedToTerms: form.agreedToTerms,
    })

    if (res.success) {
      alert('회원가입이 완료됐어요!')
      router.push('/login')
    }
  } catch (e) {
    alert('회원가입에 실패했어요')
  }
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.page {
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
}

.scroll {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
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
  box-sizing: border-box;
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

.error-text {
  margin: -8px 0 0;
  font-size: 12px;
  font-weight: 500;
  color: #ff3b30;
}

.block-reason {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: #e5484d;
  text-align: center;
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
  padding: 6px 0 22px;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 360px;
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 20px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-bar {
  width: 4px;
  height: 18px;
  background-color: #ffbc00;
  border-radius: 2px;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.sent-text {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #ffbc00;
}

.confirm-btn {
  flex-shrink: 0;
  padding: 8px 15px;
  border: 1.5px solid #191b1e;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.select {
  appearance: none;
  cursor: pointer;
  color: #191b1e;
}
</style>