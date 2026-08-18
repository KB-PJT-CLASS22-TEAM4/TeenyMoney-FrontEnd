import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// ========================================
// 카드 결제수단 목록 조회
// GET /api/v1/charge-methods
// ========================================
export async function getChargeMethods(accessToken) {
  ensureAccessToken(accessToken)

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
    throw new Error(
      result.message ||
        '결제수단을 불러오지 못했습니다.'
    )
  }

  return result
}


// ========================================
// 카드 결제수단 등록
// POST /api/v1/charge-methods/card
// ========================================
export async function addCardChargeMethod(
  accessToken,
  cardData
) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/charge-methods/card`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cardExpirationMonth:
          cardData.cardExpirationMonth,

        cardExpirationYear:
          cardData.cardExpirationYear,

        cardNumber:
          cardData.cardNumber,

        cardPassword:
          cardData.cardPassword,

        customerIdentityNumber:
          cardData.customerIdentityNumber,
      }),
    }
  )

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        '카드 등록에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 주 결제수단 지정
// PATCH /api/v1/charge-methods/{id}/primary
// ========================================
export async function setPrimaryChargeMethod(
  accessToken,
  paymentMethodId
) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/charge-methods/${paymentMethodId}/primary`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  // 204 No Content
  if (response.status === 204) {
    return {
      success: true,
    }
  }

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        '주 결제수단 변경에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 카드 결제수단 삭제
// DELETE /api/v1/charge-methods/{id}
// ========================================
export async function deleteChargeMethod(
  accessToken,
  paymentMethodId
) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/charge-methods/${paymentMethodId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  // 204 No Content
  if (response.status === 204) {
    return {
      success: true,
    }
  }

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        '카드 삭제에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 카드로 지갑 충전
// POST /api/v1/charge
// ========================================
export async function chargeWallet(
  accessToken,
  amount,
  paymentMethodId
) {
  ensureAccessToken(accessToken)

  if (!paymentMethodId) {
    throw new Error(
      '충전에 사용할 카드를 선택해주세요.'
    )
  }

  const idempotencyKey =
    crypto.randomUUID()

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
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        '충전에 실패했습니다.'
    )
  }

  return result
}