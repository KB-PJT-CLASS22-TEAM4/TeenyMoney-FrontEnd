import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 내 지갑 잔액 + 최근 거래내역 3건 조회
export async function getMyWallet(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallet/me`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '지갑 정보를 불러오지 못했습니다.'
    )

    error.status = response.status

    throw error
  }

  return result
}


// 전체 거래내역 조회
export async function getMyTransactions(
  accessToken,
  {
    period = 'MONTH',
    sort = 'DESC',
    type = 'ALL',
  } = {}
) {
  ensureAccessToken(accessToken)

  const params = new URLSearchParams({
    period,
    sort,
    type,
  })

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallet/me/transactions?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '거래내역을 불러오지 못했습니다.'
    )

    error.status = response.status

    throw error
  }

  return result
}

// 자녀 지갑 잔액 + 최근 거래내역 3건 조회 (부모 전용)
export async function getChildWallet(accessToken, childId) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallet/children/${childId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '자녀 지갑 정보를 불러오지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 자녀 거래내역 목록 조회 (부모 전용)
export async function getChildTransactions(
  accessToken,
  childId,
  {
    period = 'MONTH',
    sort = 'DESC',
    type = 'ALL',
  } = {}
) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  const params = new URLSearchParams({
    period,
    sort,
    type,
  })

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallet/children/${childId}/transactions?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '자녀 거래내역을 불러오지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}
