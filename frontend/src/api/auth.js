const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth`

// 이메일 중복 확인
export async function checkEmail(email) {
    const res = await fetch(`${BASE_URL}/check-email?email=${email}`)
    return res.json()
}


// 휴대폰 인증 번호 발송
export async function sendPhoneVerificationCode(phone){
    const res = await fetch(`${BASE_URL}/send-phone-verification-code?phone=${phone}`, {
        method: 'POST',
        headers : { 'Content-Type': 'application/json' },
        body : JSON.stringify({ phone })
    })
    return res.json()
}

// 회원가입
export async function signup(form) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  })
  return res.json()
}



// 로그인
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

