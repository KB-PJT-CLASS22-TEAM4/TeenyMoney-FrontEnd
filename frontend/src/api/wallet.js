const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 내 지갑 잔액 + 최근 거래내역 3건 조회
export async function getMyWallet(accessToken) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

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
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

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