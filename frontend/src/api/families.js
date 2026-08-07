const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 가족 연동 코드 발급
export async function makeFamilyCode(accessToken, idempotencyKey, signal) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

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