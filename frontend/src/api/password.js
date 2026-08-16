import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/members/me`

// 결제 비밀번호 최초 등록
// POST /api/v1/members/me/payment-password
export async function registerPaymentPassword(accessToken, password) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${BASE_URL}/payment-password`,
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