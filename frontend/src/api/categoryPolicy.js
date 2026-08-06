// src/api/categoryPolicy.js

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 단계별 카테고리 정책 조회
export async function getCategoryPolicyGroups(accessToken) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/category-policies/groups`,
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
      result.message || '카테고리 정책을 불러오지 못했습니다.'
    )
  }

  return result
}