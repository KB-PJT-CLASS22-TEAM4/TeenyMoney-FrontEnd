// 마이페이지 조회 API

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/auth`

// console.log(import.meta.env.VITE_API_BASE_URL)

console.log(import.meta.env.VITE_API_BASE_URL)


// 부모 마이페이지 조회
export async function getMyInfo(accessToken) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/members/me`,
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
    throw new Error(
      result.message || '회원 정보를 불러오지 못했습니다.'
    )
  }

  return result.data
}