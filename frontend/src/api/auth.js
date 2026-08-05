const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/auth`

// console.log(import.meta.env.VITE_API_BASE_URL)

console.log(import.meta.env.VITE_API_BASE_URL)

// 이메일 중복 확인
export async function checkEmail(email) {
    const res = await fetch(`${BASE_URL}/check-email?email=${email}`)
    return res.json()
}


// 휴대폰 인증 번호 발송
export async function sendPhoneVerificationCode(phoneNumber) {
  const res = await fetch(`${BASE_URL}/phone-verification/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber,
    }),
  })

  return res.json()
}

// 회원가입
export async function signup(form) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form),
  })

  return res.json()
}



// CSRF 토큰 먼저 받기
async function getCsrfToken() {
  const res = await fetch(`${BASE_URL}/csrf`)
  const data = await res.json()
  return data.data.token
}

// 로그인
export async function login(email, password) {
  
  // 1. CSRF 토큰 먼저 받기
  const csrfToken = await getCsrfToken()

  // 2. 로그인 요청 시 헤더에 CSRF 토큰 추가
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken       // ← 이게 추가된 부분
    },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

// 법정대리인 인증번호 발송
export async function sendGuardianVerificationCode(phoneNumber) {
  const res = await fetch(`${BASE_URL}/legal-guardian-verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  })
  return res.json()
}

// 법정대리인 인증번호 확인
export async function confirmGuardianVerification(data) {
  const res = await fetch(`${BASE_URL}/legal-guardian-verification/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

