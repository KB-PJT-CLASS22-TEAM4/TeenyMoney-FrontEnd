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

function toProfileImageFile(file) {
  if (file instanceof File && file.name) {
    return file
  }

  return new File([file], 'profile.jpg', {
    type: file.type || 'image/jpeg',
  })
}

async function compressProfileImage(file) {
  try {
    if (typeof createImageBitmap !== 'function' || !file?.type?.startsWith('image/')) {
      return toProfileImageFile(file)
    }

    const bitmap = await createImageBitmap(file)
    const maxSize = 1024
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return toProfileImageFile(file)
    }

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.85)
    })

    if (!blob) {
      return toProfileImageFile(file)
    }

    return new File([blob], 'profile.jpg', { type: 'image/jpeg' })
  } catch {
    return toProfileImageFile(file)
  }
}

// 프로필 이미지 변경
// PATCH /api/v1/members/me/profile-image
// formData: file (required)
export async function updateMyProfileImage(accessToken, file) {
  ensureAccessToken(accessToken)

  if (!file) {
    throw new Error('프로필 이미지를 선택해 주세요.')
  }

  const imageFile = await compressProfileImage(file)
  const formData = new FormData()
  formData.append('file', imageFile, imageFile.name || 'profile.jpg')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/members/me/profile-image`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  )

  let result = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (response.status === 204) {
    return result?.data ?? null
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || '프로필 이미지를 변경하지 못했습니다.')
  }

  return result?.data ?? result
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
 