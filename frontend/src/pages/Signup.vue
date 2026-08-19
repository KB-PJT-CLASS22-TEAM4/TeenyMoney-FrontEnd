<template>
  <div class="page">
    <div class="scroll">
      <header class="nav">
        <button
          class="back-btn"
          type="button"
          aria-label="뒤로 가기"
          @click="goBack"
        >
          <img
            src="@/assets/icons/icon-back.svg"
            alt=""
            class="back-icon"
          />
        </button>

        <h1 class="nav-title">회원가입</h1>
      </header>

      <div class="content">
        <h2 class="heading">정보를 입력해 주세요</h2>

        <!-- 이름 -->
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

        <!-- 생년월일 -->
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

          <p class="helper">
            만 14세 미만의 경우 개인정보보호법에 따라 법정대리인의 인증이
            필요합니다
          </p>

          <p
            v-if="errors.birthDate"
            class="error-text"
          >
            {{ errors.birthDate }}
          </p>
        </div>

        <!-- 휴대폰 번호 -->
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
              maxlength="13"
              @input="formatPhoneNumberInput"
            />

            <button
              class="verify-btn"
              type="button"
              @click="requestVerification"
            >
              인증
            </button>
          </div>
        </div>

        <!-- 본인 인증번호 -->
        <div class="field">
          <label class="label" for="code">인증번호</label>

          <div class="input-row">
            <input
              id="code"
              :value="form.verificationCode"
              class="input input-inline"
              type="text"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              placeholder="인증번호 6자리 입력"
              @input="formatVerificationCodeInput"
            />

            <span
              v-if="timerActive"
              class="timer"
            >
              {{ formattedTimer }}
            </span>

            <button
              class="confirm-btn"
              type="button"
              :disabled="phoneVerified || isPhoneVerifying"
              @click="verifyPhoneCode"
            >
              인증
            </button>
          </div>

          <p
            v-if="phoneCodeSent && !phoneVerifyStatus"
            class="sent-text"
          >
            인증번호가 발송되었습니다
          </p>

          <p
            v-if="phoneVerifyStatus === 'match'"
            class="verify-status match"
          >
            일치
          </p>

          <p
            v-else-if="phoneVerifyStatus === 'mismatch'"
            class="verify-status mismatch"
          >
            불일치
          </p>

          <p
            v-else
            class="helper"
          >
            문자로 받은 6자리 숫자를 입력해 주세요
          </p>
        </div>

        <!-- 이메일 -->
        <div class="field">
          <label class="label" for="email">이메일</label>

          <input
            id="email"
            v-model="form.email"
            class="input"
            type="email"
            autocomplete="email"
          />

          <p
            v-if="errors.email"
            class="error-text"
          >
            {{ errors.email }}
          </p>
        </div>

        <!-- 비밀번호 -->
        <div class="field">
          <label class="label" for="password">비밀번호</label>

          <div class="input-row">
            <input
              id="password"
              v-model="form.password"
              class="input input-inline"
              :type="isPasswordVisible ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="비밀번호 입력 (10자 이상, 영문+숫자+특수문자)"
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

          <p
            v-if="errors.password"
            class="error-text"
          >
            {{ errors.password }}
          </p>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="field">
          <label
            class="label"
            for="passwordConfirm"
          >
            비밀번호 확인
          </label>

          <div class="input-row">
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              class="input input-inline"
              :type="isPasswordConfirmVisible ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="비밀번호 재입력"
            />
            <button
              class="toggle-password"
              type="button"
              :aria-label="isPasswordConfirmVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
              @click="isPasswordConfirmVisible = !isPasswordConfirmVisible"
            >
              <svg v-if="isPasswordConfirmVisible" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
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

          <p
            v-if="errors.passwordConfirm"
            class="error-text"
          >
            {{ errors.passwordConfirm }}
          </p>
        </div>

        <!-- 약관 동의 -->
        <button
          class="terms"
          type="button"
          @click="toggleTerms"
        >
          <span
            class="checkbox"
            :class="{ checked: form.agreedToTerms }"
          >
            <img
              v-if="form.agreedToTerms"
              src="@/assets/icons/icon-check.svg"
              alt=""
              class="check-icon"
            />
          </span>

          <span class="terms-text">
            서비스 이용약관·개인정보 동의
            <span class="required">(필수)</span>
            <span
              v-if="guardianVerified"
              class="guardian-done"
            >
              · 보호자 인증 완료
            </span>
          </span>

          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="chevron-icon"
          />
        </button>

        <!-- 보호자 인증 모달 -->
        <div
          v-if="showGuardianModal"
          class="modal-overlay"
          @click.self="closeGuardianModal"
        >
          <div class="modal">
            <div class="modal-title-wrap">
              <div class="modal-bar"></div>

              <h2 class="modal-title">
                법정대리인(보호자) 인증
              </h2>
            </div>

            <!-- 보호자 이름 -->
            <div class="field">
              <label
                class="label"
                for="guardianName"
              >
                보호자명
              </label>

              <input
                id="guardianName"
                v-model="guardian.name"
                class="input"
                type="text"
                placeholder="보호자 이름 입력"
              />
            </div>

            <!-- 보호자 관계 -->
            <div class="field">
              <label
                class="label"
                for="guardianRelationship"
              >
                관계
              </label>

              <select
                id="guardianRelationship"
                v-model="guardian.relationship"
                class="input select"
              >
                <option
                  v-for="option in relationshipOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- 보호자 휴대전화 -->
            <div class="field">
              <label
                class="label"
                for="guardianPhone"
              >
                휴대전화
              </label>

              <div class="input-row">
                <input
                  id="guardianPhone"
                  v-model="guardian.phone"
                  class="input input-inline"
                  type="tel"
                  inputmode="numeric"
                  placeholder="010-0000-0000"
                  maxlength="13"
                  @input="formatGuardianPhoneInput"
                />

                <button
                  class="verify-btn"
                  type="button"
                  @click="requestGuardianVerification"
                >
                  인증
                </button>
              </div>

              <p
                v-if="guardianCodeSent"
                class="sent-text"
              >
                인증번호가 발송되었습니다
              </p>
            </div>

            <!-- 보호자 인증번호 -->
            <div class="field">
              <label
                class="label"
                for="guardianCode"
              >
                인증번호
              </label>

              <div class="input-row">
                <input
                  id="guardianCode"
                  :value="guardian.code"
                  class="input input-inline"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  autocomplete="one-time-code"
                  placeholder="인증번호 6자리 입력"
                  @input="formatGuardianCodeInput"
                />

                <button
                  class="confirm-btn"
                  type="button"
                  :disabled="guardianVerified || isGuardianVerifying"
                  @click="verifyGuardianCode"
                >
                  확인
                </button>
              </div>

              <p
                v-if="guardianVerifyStatus === 'match'"
                class="verify-status match"
              >
                일치
              </p>

              <p
                v-else-if="guardianVerifyStatus === 'mismatch'"
                class="verify-status mismatch"
              >
                불일치
              </p>

              <p
                v-else
                class="helper"
              >
                문자로 받은 6자리 숫자를 입력해 주세요
              </p>
            </div>
          </div>
        </div>

        <!-- 가입 완료 -->
        <div class="footer">
          <p
            v-if="submitBlockReason"
            class="block-reason"
          >
            {{ submitBlockReason }}
          </p>

          <button
            class="submit-btn"
            type="button"
            :disabled="!canSubmit || signupLoading"
            @click="submit"
          >
            {{ signupLoading ? '가입 처리 중...' : '가입 완료' }}
          </button>
        </div>
      </div>
    </div>

    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import {
  computed,
  onUnmounted,
  reactive,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import {
  confirmGuardianVerification,
  confirmPhoneVerificationCode,
  sendGuardianVerificationCode,
  sendPhoneVerificationCode,
  signup,
} from '@/api/auth'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'

const router = useRouter()
const alertModal = useAlertModal()

const form = reactive({
  name: '',
  birthDate: '',
  phoneNumber: '',
  verificationCode: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreedToTerms: true,
})

const errors = reactive({
  birthDate: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const guardian = reactive({
  name: '',
  phone: '',
  code: '',
  relationship: 'MOTHER',
})

const relationshipOptions = [
  {
    value: 'MOTHER',
    label: '어머니',
  },
  {
    value: 'FATHER',
    label: '아버지',
  },
  {
    value: 'OTHER',
    label: '기타',
  },
]

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)

const showGuardianModal = ref(false)
const guardianVerified = ref(false)
const guardianCodeSent = ref(false)
const guardianVerifyStatus = ref('')
const phoneCodeSent = ref(false)
const phoneVerified = ref(false)
const phoneVerifyStatus = ref('')
const isPhoneVerifying = ref(false)
const isGuardianVerifying = ref(false)
const signupLoading = ref(false)

/* 보호자 인증 성공 후 백엔드에서 받은 동의 토큰 */
const legalGuardianConsentToken = ref('')

const timerSeconds = ref(180)
const timerActive = ref(false)

let timerInterval = null

/*
 * 생년월일 자동 포맷
 */
function formatBirthDateInput(event) {
  const digits = event.target.value
    .replace(/\D/g, '')
    .slice(0, 8)

  let formatted = ''

  if (digits.length <= 4) {
    formatted = digits
  } else if (digits.length <= 6) {
    formatted =
      `${digits.slice(0, 4)}-${digits.slice(4)}`
  } else {
    formatted =
      `${digits.slice(0, 4)}-` +
      `${digits.slice(4, 6)}-` +
      `${digits.slice(6, 8)}`
  }

  form.birthDate = formatted

  if (digits.length === 8) {
    validateBirthDate()
  } else {
    errors.birthDate = ''
  }

  console.log(
    '🟡 생년월일 input / guardianVerified:',
    guardianVerified.value,
  )
}

/*
 * 생년월일 유효성 검사
 */
function validateBirthDate() {
  const digits =
    form.birthDate.replace(/-/g, '')

  if (digits.length !== 8) {
    errors.birthDate =
      '생년월일을 완전히 입력해 주세요.'

    return false
  }

  const year =
    Number(digits.slice(0, 4))

  const month =
    Number(digits.slice(4, 6))

  const day =
    Number(digits.slice(6, 8))

  const birthDate =
    new Date(
      year,
      month - 1,
      day,
    )

  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0,
  )

  const isInvalidDate =
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() + 1 !== month ||
    birthDate.getDate() !== day

  if (isInvalidDate) {
    errors.birthDate =
      '올바른 날짜를 입력해 주세요.'

    return false
  }

  if (birthDate > today) {
    errors.birthDate =
      '미래 날짜는 입력할 수 없어요.'

    return false
  }

  errors.birthDate = ''

  return true
}

/*
 * 전화번호 포맷
 */
function applyPhoneFormat(value) {
  const digits = value
    .replace(/\D/g, '')
    .slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 7) {
    return (
      `${digits.slice(0, 3)}-` +
      `${digits.slice(3)}`
    )
  }

  return (
    `${digits.slice(0, 3)}-` +
    `${digits.slice(3, 7)}-` +
    `${digits.slice(7, 11)}`
  )
}

function formatPhoneNumberInput(event) {
  form.phoneNumber =
    applyPhoneFormat(
      event.target.value,
    )
  phoneCodeSent.value = false
  phoneVerified.value = false
  phoneVerifyStatus.value = ''
}

function formatGuardianPhoneInput(event) {
  guardian.phone =
    applyPhoneFormat(
      event.target.value,
    )

  console.log(
    '🟡 보호자 전화번호 input / guardianVerified:',
    guardianVerified.value,
  )
}

function formatVerificationCodeInput(event) {
  const next = event.target.value
    .replace(/\D/g, '')
    .slice(0, 6)

  if (next === form.verificationCode) {
    return
  }

  form.verificationCode = next
  phoneVerified.value = false
  phoneVerifyStatus.value = ''
}

function formatGuardianCodeInput(event) {
  const next = event.target.value
    .replace(/\D/g, '')
    .slice(0, 6)

  if (next === guardian.code) {
    return
  }

  guardian.code = next
  guardianVerified.value = false
  guardianVerifyStatus.value = ''
}

/*
 * API 전송용 전화번호
 */
function formatPhone(value) {
  return String(value ?? '')
    .replace(/\D/g, '')
}

/*
 * 만 14세 미만 여부
 */
function isUnder14() {
  if (!validateBirthDate()) {
    return false
  }

  const digits =
    form.birthDate.replace(/-/g, '')

  const birthYear =
    Number(digits.slice(0, 4))

  const birthMonth =
    Number(digits.slice(4, 6))

  const birthDay =
    Number(digits.slice(6, 8))

  const today =
    new Date()

  let age =
    today.getFullYear() -
    birthYear

  const hasBirthdayPassed =
    today.getMonth() + 1 > birthMonth ||
    (
      today.getMonth() + 1 === birthMonth &&
      today.getDate() >= birthDay
    )

  if (!hasBirthdayPassed) {
    age -= 1
  }

  const result =
    age < 14

  console.log(
    '🔵 만 14세 미만 여부:',
    result,
    '/ 계산 나이:',
    age,
  )

  return result
}

/*
 * 이메일 유효성 검사
 */
function validateEmail() {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (
    !emailRegex.test(
      form.email.trim(),
    )
  ) {
    errors.email =
      '이메일 형식이 올바르지 않아요.'

    return false
  }

  errors.email = ''

  return true
}

/*
 * 비밀번호 유효성 검사
 */
function validatePassword() {
  const password =
    form.password

  const phoneNumber =
    formatPhone(
      form.phoneNumber,
    )

  if (
    password.length < 10 ||
    password.length > 64
  ) {
    errors.password =
      '비밀번호는 10~64자여야 합니다.'

    return false
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.password =
      '영문자를 포함해야 합니다.'

    return false
  }

  if (!/[0-9]/.test(password)) {
    errors.password =
      '숫자를 포함해야 합니다.'

    return false
  }

  if (
    !/[!@#$%^&*(),.?":{}|<>]/.test(
      password,
    )
  ) {
    errors.password =
      '특수문자를 포함해야 합니다.'

    return false
  }

  if (
    form.email &&
    password.includes(
      form.email,
    )
  ) {
    errors.password =
      '이메일을 포함할 수 없습니다.'

    return false
  }

  if (
    phoneNumber &&
    password.includes(
      phoneNumber,
    )
  ) {
    errors.password =
      '전화번호를 포함할 수 없습니다.'

    return false
  }

  errors.password = ''

  return true
}

/*
 * 비밀번호 확인
 */
function validatePasswordConfirm() {
  if (
    form.password !==
    form.passwordConfirm
  ) {
    errors.passwordConfirm =
      '비밀번호가 일치하지 않아요.'

    return false
  }

  errors.passwordConfirm = ''

  return true
}

/*
 * 인증 타이머
 */
const formattedTimer =
  computed(() => {
    const minutes =
      Math.floor(
        timerSeconds.value / 60,
      )

    const seconds =
      timerSeconds.value % 60

    return (
      `${minutes}:` +
      String(seconds)
        .padStart(2, '0')
    )
  })

/*
 * 가입 버튼 비활성화 이유
 */
const submitBlockReason =
  computed(() => {
    if (!form.name.trim()) {
      return '이름을 입력해 주세요.'
    }

    if (
      !form.birthDate.trim() ||
      form.birthDate.length !== 10
    ) {
      return '생년월일을 입력해 주세요. (YYYY-MM-DD)'
    }

    if (errors.birthDate) {
      return errors.birthDate
    }

    if (
      formatPhone(
        form.phoneNumber,
      ).length !== 11
    ) {
      return '휴대폰 번호를 정확히 입력해 주세요.'
    }

    if (
      form.verificationCode
        .trim()
        .length !== 6
    ) {
      return '인증번호 6자리를 입력해 주세요.'
    }

    if (!form.email.trim()) {
      return '이메일을 입력해 주세요.'
    }

    if (
      form.password.length < 10
    ) {
      return (
        `비밀번호가 ${form.password.length}자예요. ` +
        '(10자 이상 필요)'
      )
    }

    if (
      form.password !==
      form.passwordConfirm
    ) {
      return '비밀번호가 일치하지 않아요.'
    }

    return null
  })

const canSubmit =
  computed(() => {
    return Boolean(
      form.name.trim() &&
      form.birthDate.trim().length === 10 &&
      !errors.birthDate &&
      formatPhone(
        form.phoneNumber,
      ).length === 11 &&
      form.verificationCode
        .trim()
        .length === 6 &&
      form.email.trim() &&
      form.password.length >= 10 &&
      form.password ===
        form.passwordConfirm
    )
  })

/*
 * 사용자 인증번호 발송
 */
async function requestVerification() {
  const phoneNumber =
    formatPhone(
      form.phoneNumber,
    )

  if (
    phoneNumber.length !== 11
  ) {
    alertModal.showAlert(
      '휴대폰 번호를 정확히 입력해 주세요.',
    )

    return
  }

  try {
    const response =
      await sendPhoneVerificationCode(
        phoneNumber,
      )

    console.log(
      '본인 인증번호 발송 응답:',
      response,
    )

    if (!response.success) {
      alertModal.showAlert(
        response.message ||
        '인증번호 발송에 실패했어요.',
      )

      return
    }

    phoneCodeSent.value = true
    phoneVerified.value = false
    phoneVerifyStatus.value = ''
    startTimer()
  } catch (error) {
    console.error(
      '본인 인증번호 발송 실패:',
      error,
    )

    alertModal.showAlert(
      '인증번호 발송에 실패했어요.',
    )
  }
}

async function verifyPhoneCode() {
  if (phoneVerified.value || isPhoneVerifying.value) {
    return
  }

  const phoneNumber =
    formatPhone(
      form.phoneNumber,
    )

  if (phoneNumber.length !== 11) {
    alertModal.showAlert(
      '휴대폰 번호를 정확히 입력해 주세요.',
    )
    return
  }

  if (!phoneCodeSent.value) {
    alertModal.showAlert(
      '먼저 인증번호를 발송해 주세요.',
    )
    return
  }

  if (form.verificationCode.trim().length !== 6) {
    phoneVerifyStatus.value = 'mismatch'
    phoneVerified.value = false
    return
  }

  isPhoneVerifying.value = true

  try {
    await confirmPhoneVerificationCode(
      phoneNumber,
      form.verificationCode.trim(),
    )

    phoneVerifyStatus.value = 'match'
    phoneVerified.value = true
    stopTimer()
  } catch (error) {
    console.error(
      '본인 인증번호 확인 실패:',
      error,
    )
    phoneVerifyStatus.value = 'mismatch'
    phoneVerified.value = false
  } finally {
    isPhoneVerifying.value = false
  }
}

function startTimer() {
  if (timerInterval) {
    clearInterval(
      timerInterval,
    )
  }

  timerSeconds.value = 180
  timerActive.value = true

  timerInterval =
    setInterval(() => {
      timerSeconds.value -= 1

      if (
        timerSeconds.value <= 0
      ) {
        stopTimer()
      }
    }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(
      timerInterval,
    )

    timerInterval = null
  }

  timerSeconds.value = 0
  timerActive.value = false
}

/*
 * 보호자 인증번호 발송
 */
async function requestGuardianVerification() {
  const legalGuardianName =
    guardian.name.trim()

  const guardianPhone =
    formatPhone(
      guardian.phone,
    )

  if (!legalGuardianName) {
    alertModal.showAlert(
      '보호자 이름을 입력해 주세요.',
    )

    return
  }

  if (
    guardianPhone.length !== 11
  ) {
    alertModal.showAlert(
      '보호자 휴대전화 번호를 정확히 입력해 주세요.',
    )

    return
  }

  try {
    /*
     * 새 인증을 시작하면
     * 기존 보호자 인증 결과와 토큰은 무효화
     */
    guardianVerified.value = false
    guardianVerifyStatus.value = ''
    legalGuardianConsentToken.value = ''

    const response =
      await sendGuardianVerificationCode(
        guardianPhone,
      )

    console.log(
      '🔵 보호자 인증번호 발송 응답:',
      response,
    )

    if (!response.success) {
      alertModal.showAlert(
        response.message ||
        '보호자 인증번호 발송에 실패했어요.',
      )

      return
    }

    guardianCodeSent.value = true
    guardianVerifyStatus.value = ''
  } catch (error) {
    console.error(
      '🔴 보호자 인증번호 발송 실패:',
      error,
    )

    alertModal.showAlert(
      '보호자 인증번호 발송에 실패했어요.',
    )
  }
}

/*
 * 보호자 인증번호 확인
 */
async function verifyGuardianCode() {
  if (guardianVerified.value || isGuardianVerifying.value) {
    return
  }

  console.log(
    '================ 보호자 인증 시작 ================',
  )

  const legalGuardianName =
    guardian.name.trim()

  const guardianPhone =
    formatPhone(
      guardian.phone,
    )

  if (!legalGuardianName) {
    alertModal.showAlert(
      '보호자 이름을 입력해 주세요.',
    )

    return
  }

  if (
    guardianPhone.length !== 11
  ) {
    alertModal.showAlert(
      '보호자 휴대전화 번호를 정확히 입력해 주세요.',
    )

    return
  }

  if (
    !guardianCodeSent.value
  ) {
    alertModal.showAlert(
      '먼저 보호자 인증번호를 발송해 주세요.',
    )

    return
  }

  if (
    guardian.code.length !== 6
  ) {
    guardianVerifyStatus.value = 'mismatch'
    guardianVerified.value = false
    return
  }

  isGuardianVerifying.value = true

  try {
    const requestData = {
      legalGuardianName,

      legalGuardianTermsAgreed:
        true,

      phoneNumber:
        guardianPhone,

      privacyTermsVersion:
        '1.0',

      serviceTermsVersion:
        '1.0',

      relationship:
        guardian.relationship,

      verificationCode:
        guardian.code,
    }

    console.log(
      '🔵 보호자 인증 확인 요청:',
      requestData,
    )

    const response =
      await confirmGuardianVerification(
        requestData,
      )

    console.log(
      '🟢 보호자 인증 확인 응답 전체:',
      response,
    )

    console.log(
      '🟢 보호자 인증 response.data:',
      response?.data,
    )

    legalGuardianConsentToken.value =
      pickGuardianConsentToken(response)

    console.log(
      '🟢 저장된 legalGuardianConsentToken:',
      legalGuardianConsentToken.value,
    )

    /*
     * 성공 응답인데 토큰이 없으면
     * signup을 진행시키지 않음
     */
    if (
      !legalGuardianConsentToken.value
    ) {
      console.error(
        '🔴 보호자 인증은 성공했지만 legalGuardianConsentToken이 없습니다.',
        response,
      )

      alertModal.showAlert(
        '보호자 인증 토큰을 확인할 수 없습니다. 다시 인증해 주세요.',
      )

      guardianVerified.value = false
      guardianVerifyStatus.value = 'mismatch'

      return
    }

    guardianVerified.value = true
    guardianVerifyStatus.value = 'match'
    form.agreedToTerms = true

    window.setTimeout(() => {
      showGuardianModal.value = false
    }, 400)

  } catch (error) {
    console.error(
      '🔴 보호자 인증 확인 실패:',
      error,
    )

    guardianVerifyStatus.value = 'mismatch'
    guardianVerified.value = false
  } finally {
    isGuardianVerifying.value = false
  }
}

/*
 * 약관 동의
 */
function toggleTerms() {
  form.agreedToTerms = true

  const under14 =
    isUnder14()

  if (
    under14 &&
    (
      !guardianVerified.value ||
      !legalGuardianConsentToken.value
    )
  ) {
    showGuardianModal.value = true
  }
}

function pickGuardianConsentToken(response) {
  const data = response?.data

  if (typeof data === 'string' && data.trim()) {
    return data.trim()
  }

  return (
    data?.legalGuardianConsentToken ||
    data?.consentToken ||
    data?.token ||
    response?.legalGuardianConsentToken ||
    ''
  )
}

function closeGuardianModal() {
  showGuardianModal.value = false
}

/*
 * 가입 완료
 */
async function submit() {
  console.log(
    '================ 가입 완료 버튼 클릭 ================',
  )

  console.log(
    '🔵 guardianVerified:',
    guardianVerified.value,
  )

  console.log(
    '🔵 legalGuardianConsentToken:',
    legalGuardianConsentToken.value,
  )

  if (
    !canSubmit.value ||
    signupLoading.value
  ) {
    return
  }

  const isValidBirthDate =
    validateBirthDate()

  const isValidEmail =
    validateEmail()

  const isValidPassword =
    validatePassword()

  const isValidPasswordConfirm =
    validatePasswordConfirm()

  if (
    !isValidBirthDate ||
    !isValidEmail ||
    !isValidPassword ||
    !isValidPasswordConfirm
  ) {
    return
  }

  const under14 =
    isUnder14()

  console.log(
    '🔵 만 14세 미만:',
    under14,
  )

  /*
   * ★ 핵심
   * 만 14세 미만이면
   * guardianVerified와 consent token 둘 다 있어야 가입 가능
   */
  if (
    under14 &&
    (
      !guardianVerified.value ||
      !legalGuardianConsentToken.value
    )
  ) {
    console.log(
      '🔴 보호자 인증 또는 legalGuardianConsentToken 없음',
    )

    showGuardianModal.value = true

    return
  }

  console.log(
    '🟢 보호자 인증 조건 통과',
  )

  await doSignup()
}

/*
 * 회원가입 API
 */
async function doSignup() {
  signupLoading.value = true

  console.log(
    '================ 회원가입 API 시작 ================',
  )

  try {
    const under14 =
      isUnder14()

    const requestData = {
      name:
        form.name.trim(),

      birthDate:
        form.birthDate,

      phoneNumber:
        formatPhone(
          form.phoneNumber,
        ),

      verificationCode:
        form.verificationCode,

      email:
        form.email.trim(),

      password:
        form.password,

      passwordConfirm:
        form.passwordConfirm,

      serviceTermsAgreed:
        true,

      privacyAgreed:
        true,

      serviceTermsVersion:
        '1.0',

      privacyTermsVersion:
        '1.0',

      /*
       * ★ 핵심
       * 보호자 인증 성공 후 받은 토큰을
       * signup body에 함께 전송
       *
       * 14세 이상이면 null
       */
      legalGuardianConsentToken:
        under14
          ? legalGuardianConsentToken.value
          : null,
    }

    console.log(
      '🔵 회원가입 요청 데이터:',
      requestData,
    )

    console.log(
      '🔵 signup에 전달하는 보호자 토큰:',
      requestData.legalGuardianConsentToken,
    )

    const response =
      await signup(
        requestData,
      )

    console.log(
      '🟢 회원가입 응답 전체:',
      response,
    )

    if (!response.success) {
      console.error(
        '🔴 회원가입 실패:',
        response.code,
        response.message,
      )

      alertModal.showAlert(
        response.message ||
        '회원가입에 실패했어요.',
      )

      return
    }

    alertModal.showAlert(
      '회원가입이 완료됐어요!',
    )
    await router.push('/login')
    
  } catch (error) {
    console.error(
      '🔴 회원가입 요청 예외:',
      error,
    )

    alertModal.showAlert(
      '회원가입에 실패했어요.',
    )
  } finally {
    signupLoading.value = false
  }
}

function goBack() {
  router.back()
}

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(
      timerInterval,
    )

    timerInterval = null
  }
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
  box-sizing: border-box;
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
  padding-bottom: 13px;
  border-bottom: 1px solid #f0f1f3;
}

.input-inline {
  flex: 1;
  min-width: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.toggle-password {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #b9bec5;
  cursor: pointer;
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
  line-height: 1.5;
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

.guardian-done {
  color: #16a34a;
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
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 360px;
  max-height: 90dvh;
  padding: 20px 20px 40px;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  background-color: #ffffff;
  box-sizing: border-box;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-bar {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background-color: #ffbc00;
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

.verify-status {
  margin: -3px 0 0;
  font-size: 12px;
  font-weight: 700;
}

.verify-status.match {
  color: #16a34a;
}

.verify-status.mismatch {
  color: #e5484d;
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

.confirm-btn:disabled {
  cursor: default;
  opacity: 0.45;
}

.select {
  appearance: none;
  cursor: pointer;
  color: #191b1e;
}
</style>