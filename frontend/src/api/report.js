import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 월간 머니 리포트 조회
// 자녀: childId에 본인 memberId, 부모: 자녀 관리 화면의 childId
// month를 생략하면 Asia/Seoul 기준 현재 월
export async function getChildMoneyReport(accessToken, childId, month) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  const params = new URLSearchParams()
  if (month) params.set('month', month)

  const query = params.toString() ? `?${params.toString()}` : ''

  const response = await fetch(
    `${API_BASE_URL}/api/v1/reports/money/children/${childId}${query}`,
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
      result.message || '머니 리포트를 불러오지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}