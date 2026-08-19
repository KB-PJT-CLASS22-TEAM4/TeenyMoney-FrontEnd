import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const PAYMENT_PASSWORD_URL = `${API_BASE_URL}/api/v1/members/me/payment-password`

async function requestPaymentPassword(accessToken, method, password) {
  ensureAccessToken(accessToken)

  const response = await fetch(PAYMENT_PASSWORD_URL, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password: Number(password) }),
  })

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message
        || (method === 'PATCH'
          ? '결제 비밀번호 변경에 실패했습니다.'
          : '결제 비밀번호 등록에 실패했습니다.')
    )
  }

  return result
}

// 결제 비밀번호 최초 등록
// POST /api/v1/members/me/payment-password
export function registerPaymentPassword(accessToken, password) {
  return requestPaymentPassword(accessToken, 'POST', password)
}

// 결제 비밀번호 변경
// PATCH /api/v1/members/me/payment-password
export function updatePaymentPassword(accessToken, password) {
  return requestPaymentPassword(accessToken, 'PATCH', password)
}
