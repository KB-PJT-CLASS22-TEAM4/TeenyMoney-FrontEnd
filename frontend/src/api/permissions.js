import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 오늘만 허용 요청 조회
export async function getPermissions(accessToken, childId) {
  ensureAccessToken(accessToken)

  const params = new URLSearchParams()
  if (childId) {
    params.set('childId', String(childId))
  }

  const query = params.toString()
  const url = query
    ? `${API_BASE_URL}/api/v1/permissions?${query}`
    : `${API_BASE_URL}/api/v1/permissions`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

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

// 오늘만 허용 요청 이력 조회
export async function getPermissionHistory(accessToken, childId) {
  ensureAccessToken(accessToken)
  if (!childId) throw new Error('자녀 정보가 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/history?childId=${encodeURIComponent(childId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 404) {
    return { success: true, data: [] }
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '승인 요청 이력을 불러오지 못했습니다.')
  }

  return result
}

// 오늘만 허용 요청 승인
export async function approvePermission(accessToken, permissionId) {
  ensureAccessToken(accessToken)

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
  ensureAccessToken(accessToken)

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

// 오늘만 허용 요청 (자녀)
export async function requestPermission(accessToken, { categories, reason }) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ categories, reason }),
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '오늘만 허용 요청에 실패했습니다.')
  }

  return result
}

// 오늘만 허용 요청 수정
export async function updatePermission(accessToken, permissionId, { categories, reason }) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/${permissionId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ categories, reason }),
    }
  )

  // 204 No Content면 body가 없을 수 있음
  if (response.status === 204) return { success: true, data: null }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '수정에 실패했습니다.')
  }

  return result
}

// 오늘만 허용 요청 취소
export async function cancelPermission(accessToken, permissionId) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/${permissionId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) return { success: true }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '취소에 실패했습니다.')
  }

  return result
}