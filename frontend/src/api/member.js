import { ensureAccessToken } from '@/utils/authSession'

// 마이페이지 조회 API

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/auth`

// console.log(import.meta.env.VITE_API_BASE_URL)

console.log(import.meta.env.VITE_API_BASE_URL)


// 부모 마이페이지 조회
export async function getMyInfo(accessToken) {
  ensureAccessToken(accessToken)

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

// 프로필 이미지 변경
// PATCH /api/v1/members/me
export async function updateMyProfileImage(accessToken, file) {
  ensureAccessToken(accessToken)

  if (!file) {
    throw new Error('프로필 이미지를 선택해 주세요.')
  }

  const formData = new FormData()
  formData.append('profileImage', file)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/members/me`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
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
      result.message || '프로필 이미지를 변경하지 못했습니다.'
    )
  }

  return result.data
}

// 연동된 부모 조회
export async function getLinkedParent(accessToken) {
  ensureAccessToken(accessToken)
 
  const API_BASE_URL = import.meta.env.DEV
    ? ''
    : import.meta.env.VITE_API_BASE_URL
 
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
 
  if (!response.ok || result.success === false) {
    throw new Error(result.message || '연동된 부모 정보를 불러오지 못했습니다.')
  }
 
  return result
}
 