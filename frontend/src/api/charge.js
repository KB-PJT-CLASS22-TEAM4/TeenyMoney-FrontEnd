const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 결제수단 목록 조회
// GET /api/v1/charge-methods
export async function getChargeMethods(accessToken) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/charge-methods`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '결제수단을 불러오지 못했습니다.')
  }

  return result
}

// 카드로 지갑 충전
// POST /api/v1/charge
export async function chargeWallet(accessToken, amount, paymentMethodId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const idempotencyKey = crypto.randomUUID()

  const response = await fetch(
    `${API_BASE_URL}/api/v1/charge`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount,
        idempotencyKey,
        paymentMethodId,
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
    throw new Error(result.message || '충전에 실패했습니다.')
  }

  return result
}