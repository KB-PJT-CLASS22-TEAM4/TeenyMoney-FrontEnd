import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

  
export async function sendAllowance(
  childId,
  amount,
  accessToken,
  idempotencyKey
) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error('올바른 금액을 입력해주세요.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/children/${childId}`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': idempotencyKey,
      },

      body: JSON.stringify({
        amount: Number(amount),
      }),
    }
  )

  let result

  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok || result?.success === false) {
    const error = new Error(
      result?.message ||
      '용돈 보내기에 실패했습니다.'
    )

    error.status = response.status
    error.code = result?.code
    error.data = result?.data

    throw error
  }

  return result
}