const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 자녀 티니 점수 조회
// GET /api/v1/teeny-score/children/{childId}
export async function getTeenyScore(accessToken, childId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/teeny-score/children/${childId}`,
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
    throw new Error(result.message || '티니 점수를 불러오지 못했습니다.')
  }

  return result
}

// 자녀 월별 티니 점수 히스토리 조회
// GET /api/v1/teeny-score/children/{childId}/monthly-history
export async function getTeenyScoreMonthlyHistory(accessToken, childId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/teeny-score/children/${childId}/monthly-history`,
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
    throw new Error(result.message || '월별 히스토리를 불러오지 못했습니다.')
  }

  return result
}

// 등급 기준 조회
// GET /api/v1/teeny-score/grades
export async function getTeenyScoreGrades(accessToken) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/teeny-score/grades`,
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
    throw new Error(result.message || '등급 기준을 불러오지 못했습니다.')
  }

  return result
}