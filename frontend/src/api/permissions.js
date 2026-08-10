const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 오늘만 허용 요청 조회
export async function getPermissions(accessToken) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions`,
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
    throw new Error(result.message || '오늘만 허용 요청을 불러오지 못했습니다.')
  }

  return result
}

// 오늘만 허용 요청 승인
export async function approvePermission(accessToken, permissionId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/${permissionId}/approve`,
    {
      method: 'PATCH',
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
    throw new Error(result.message || '승인에 실패했습니다.')
  }

  return result
}

// 오늘만 허용 요청 거절
export async function rejectPermission(accessToken, permissionId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/${permissionId}/reject`,
    {
      method: 'PATCH',
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
    throw new Error(result.message || '거절에 실패했습니다.')
  }

  return result
}