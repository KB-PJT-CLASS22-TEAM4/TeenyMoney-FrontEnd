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
  }
}

function publicFetch(url, init = {}) {
  return fetch(url, {
    ...init,
    credentials: 'omit',
  })
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
  const res = await publicFetch(`${BASE_URL}/check-email?email=${email}`)
  return res.json()
}

export async function sendPhoneVerificationCode(phoneNumber) {
  const res = await publicFetch(`${BASE_URL}/phone-verification/send`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify({
      phoneNumber,
    }),
  })

  return res.json()
}

export async function signup(form) {
  const res = await publicFetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify(form),
  })

  return res.json()
}

export async function login(email, password) {
  const csrfToken = await getCsrfToken()

  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

// 로그아웃
export async function logout(accessToken) {
  if (!accessToken) {
    throw new Error('로그인 정보가 없습니다.')
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }

  try {
    const csrfToken = await getCsrfToken()
    headers['Content-Type'] = 'application/json'
    headers['X-XSRF-TOKEN'] = csrfToken
  } catch {
    // swagger 명세는 Authorization만 필수
  }

  const res = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers,
  })

  const result = await parseJsonSafe(res)

  if (!isApiSuccess(res, result)) {
    throw new Error(result?.message || '로그아웃에 실패했습니다.')
  }

  return result ?? { success: true }
}

// 재발급: refresh는 쿠키로 가고, 새 access를 받아온다. CSRF 대상 경로다.
export async function reissue() {
  const csrfToken = await getCsrfToken();

  const res = await fetch(`${BASE_URL}/reissue`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
  });

  const result = await parseJsonSafe(res);
  const accessToken = result?.data?.accessToken;

  if (!isApiSuccess(res, result) || !accessToken) {
    const error = new Error(result?.message || '토큰 재발급에 실패했습니다.');
    error.status = res.status;
    throw error;
  }

  return result;
}

// 법정대리인 인증번호 발송 (로그인 토큰 없음)
export async function sendGuardianVerificationCode(phoneNumber) {
  const res = await publicFetch(`${BASE_URL}/legal-guardian-verification/send`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify({ phoneNumber }),
  })
  return res.json()
}

export async function confirmGuardianVerification(data) {
  const res = await publicFetch(`${BASE_URL}/legal-guardian-verification/confirm`, {
    method: 'POST',
    headers: publicJsonHeaders(),
    body: JSON.stringify(data),
  })

  const result = await parseJsonSafe(res);

  if (!isApiSuccess(res, result)) {
    throw new Error(
      result?.message || '보호자 인증번호가 올바르지 않아요.',
    );
  }

  return result ?? { success: true };
}
