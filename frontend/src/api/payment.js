import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// QR 코드 검증 (가맹점/금액 정보 + 잔액 + 업종 정책 확인)
// POST /api/v1/payments/qrcode
export async function verifyQrPayment(accessToken, qrPayload) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/payments/qrcode`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(qrPayload),
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'QR 코드를 확인할 수 없습니다.')
  }

  return result
}

// 결제 진행 (비밀번호 검증 + 실제 결제)
// POST /api/v1/payments
export async function processPayment(accessToken, { idempotencyKey, orderId, password }) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/payments`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        idempotencyKey,
        orderId,
        password: Number(password), // 문자열 PIN → 숫자 변환
      }),
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '결제에 실패했습니다.')
  }

  return result
}

// 결제 비밀번호 최초 등록
// POST /api/v1/members/me/payment-password
export async function registerPaymentPassword(accessToken, password) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/members/me/payment-password`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password: Number(password) }),
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '결제 비밀번호 등록에 실패했습니다.')
  }

  return result
}