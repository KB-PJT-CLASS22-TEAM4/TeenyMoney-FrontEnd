import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// SSE 구독용 1회용 티켓 발급
//
// EventSource는 Authorization 헤더를 붙일 수 없어서 구독은 쿼리 파라미터로 인증한다.
// 액세스 토큰을 거기 넣지 않으려고 서버가 유효기간 30초짜리 티켓을 따로 내준다.
// 이 API 자체는 평소대로 Bearer 헤더로 인증한다.
export async function issueSseTicket(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/sse/ticket`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '실시간 연결 티켓을 발급받지 못했습니다.'
    )

    error.status = response.status
    throw error
  }

  return result
}
