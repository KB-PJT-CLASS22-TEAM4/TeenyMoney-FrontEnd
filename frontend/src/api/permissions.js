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

// 오늘만 허용 요청 현황 조회 (이번 달 요청 일수, 남은 일수, 카테고리별 상태)
export async function getPermissionStatus(accessToken, childId) {
  ensureAccessToken(accessToken)

  const params = new URLSearchParams()
  if (childId) {
    params.set('childId', String(childId))
  }

  const query = params.toString()
  const url = query
    ? `${API_BASE_URL}/api/v1/permissions/status?${query}`
    : `${API_BASE_URL}/api/v1/permissions/status`

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
    throw new Error(result.message || '오늘만 허용 현황을 불러오지 못했습니다.')
  }

  return result
}

async function parsePermissionAction(response, fallbackMessage) {
  if (response.status === 204) {
    return { success: true }
  }

  let result

  try {
    const text = await response.text()
    result = text ? JSON.parse(text) : null
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || fallbackMessage)
  }

  return result ?? { success: true }
}

function buildPermissionActionInit(accessToken, categories) {
  const hasBody = Array.isArray(categories) && categories.length > 0
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }

  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  return {
    method: 'PATCH',
    headers,
    ...(hasBody ? { body: JSON.stringify({ categories }) } : {}),
  }
}

// 오늘만 허용 요청 승인
export async function approvePermission(accessToken, permissionId, categories) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/${permissionId}/approve`,
    buildPermissionActionInit(accessToken, categories)
  )

  return parsePermissionAction(response, '승인에 실패했습니다.')
}

// 오늘만 허용 요청 거절
export async function rejectPermission(accessToken, permissionId, categories) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/permissions/${permissionId}/reject`,
    buildPermissionActionInit(accessToken, categories)
  )

  return parsePermissionAction(response, '거절에 실패했습니다.')
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

// 오늘만 허용 요청 수정 (사유만 수정 가능)
export async function updatePermission(accessToken, permissionId, reason) {
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
      body: JSON.stringify({ reason }),
    }
  )

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

function monthlyLimitUrl(childId) {
  return `${API_BASE_URL}/api/v1/permissions/children/${childId}/monthly-limit`
}

async function parseMonthlyLimitResponse(response, fallbackMessage) {
  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || fallbackMessage)
  }

  return result.data ?? result
}

// 자녀의 오늘만 허용 월간 한도 조회
export async function getChildMonthlyLimit(accessToken, childId) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  const response = await fetch(monthlyLimitUrl(childId), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseMonthlyLimitResponse(
    response,
    '오늘만 허용 한도를 불러오지 못했습니다.'
  )
}

// 자녀의 오늘만 허용 월간 한도 설정
export async function updateChildMonthlyLimit(
  accessToken,
  childId,
  monthlyAllowedDays
) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  const response = await fetch(monthlyLimitUrl(childId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ monthlyAllowedDays }),
  })

  return parseMonthlyLimitResponse(
    response,
    '오늘만 허용 한도를 저장하지 못했습니다.'
  )
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