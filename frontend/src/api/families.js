import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 가족 연동 코드 발급
export async function makeFamilyCode(accessToken, idempotencyKey, signal) {
  ensureAccessToken(accessToken)

  // Idempotency-Key: 재발급마다 고유한 UUID 생성
  if (!idempotencyKey) {
    idempotencyKey = crypto.randomUUID()
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/families/make-codes`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': idempotencyKey,
      },
      signal,
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '연동 코드 발급에 실패했습니다.')
  }

  return result
  // { code, data: { code: '6자리코드', expiresAt: '만료시간' }, message, success }
}

// 연동된 부모 조회 (자녀용)
export async function getMyParent(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/members/me/parent`,
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

  if (!response.ok && response.status !== 200) {
    throw new Error(result.message || '부모 정보를 불러오지 못했습니다.')
  }

  return result
  // { data: null } 이면 미연동, data 있으면 연동 완료
}

// 연동 코드 소비 (자녀가 코드 입력)
export async function connectFamilyCode(accessToken, code) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/families/connect-link`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code: Number(code) }),
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '연동에 실패했습니다.')
  }

  return result
}

// 가족 연동 해제 (부모 전용)
export async function unlinkFamily(accessToken, childId) {
  ensureAccessToken(accessToken)

  if (childId == null || childId === '') {
    throw new Error('해제할 자녀를 찾을 수 없습니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/families/unlink/${childId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) {
    return { success: true }
  }

  let result
  try {
    result = await response.json()
  } catch {
    if (response.ok) {
      return { success: true }
    }
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '연동 해제에 실패했습니다.')
  }

  return result
}