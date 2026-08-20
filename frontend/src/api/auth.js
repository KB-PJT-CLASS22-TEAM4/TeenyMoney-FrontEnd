const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL;

const BASE_URL = `${API_BASE_URL}/api/v1/auth`;

// console.log(import.meta.env.VITE_API_BASE_URL)

console.log(import.meta.env.VITE_API_BASE_URL);

async function parseJsonSafe(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isApiSuccess(response, result) {
  return response.ok && result?.success !== false;
}

function publicJsonHeaders() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

// CSRF 토큰 먼저 받기
async function getCsrfToken() {
  const res = await fetch(`${BASE_URL}/csrf`, {
    credentials: 'include',
  });
  const data = await res.json();
  return data.data.token;
}

// 이메일 중복 확인
export async function checkEmail(email) {
  const res = await fetch(`${BASE_URL}/check-email?email=${email}`);
  return res.json();
}

// 휴대폰 인증 번호 발송 (회원가입, 로그인 토큰 없음)
export async function sendPhoneVerificationCode(phoneNumber) {
  const res = await fetch(`${BASE_URL}/phone-verification/send`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify({
      phoneNumber,
    }),
  });

  return res.json();
}

// 회원가입
export async function signup(form) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify(form),
  });

  return res.json();
}

// 로그인
export async function login(email, password) {
  const csrfToken = await getCsrfToken();

  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// 로그아웃
export async function logout(accessToken) {
  const csrfToken = await getCsrfToken();

  const res = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-XSRF-TOKEN': csrfToken,
    },
  });
  return res.json();
}

// 재발급: refresh는 쿠키로 가고, 새 access를 받아온다. CSRF 대상 경로다.
export async function reissue() {
  const csrfToken = await getCsrfToken();

  const res = await fetch(`${BASE_URL}/reissue`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-XSRF-TOKEN': csrfToken },
  });
  return res.json();
}

// 법정대리인 인증번호 발송 (로그인 토큰 없음)
export async function sendGuardianVerificationCode(phoneNumber) {
  const res = await fetch(`${BASE_URL}/legal-guardian-verification/send`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify({ phoneNumber }),
  });
  return res.json();
}

// 법정대리인 인증번호 확인 (로그인 토큰 없음, 10분 유효 동의 토큰 발급)
export async function confirmGuardianVerification(data) {
  const res = await fetch(`${BASE_URL}/legal-guardian-verification/confirm`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify(data),
  });

  const result = await parseJsonSafe(res);

  if (!isApiSuccess(res, result)) {
    throw new Error(
      result?.message || '보호자 인증번호가 올바르지 않아요.',
    );
  }

  return result ?? { success: true };
}
