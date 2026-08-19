import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

async function requestCategoryPolicies(path, accessToken, childId) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}${path}?childId=${encodeURIComponent(childId)}`,
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

// GET /api/v1/category-policies/policy-groups
export async function getCategoryPolicyGroups(accessToken, childId) {
  return requestCategoryPolicies(
    '/api/v1/category-policies/policy-groups',
    accessToken,
    childId
  )
}

// GET /api/v1/category-policies/parent-groups
export async function getCategoryPolicyParentGroups(accessToken, childId) {
  return requestCategoryPolicies(
    '/api/v1/category-policies/parent-groups',
    accessToken,
    childId
  )
}

// GET /api/v1/category-policies
export async function getCategoryPolicies(accessToken, childId) {
  return requestCategoryPolicies(
    '/api/v1/category-policies',
    accessToken,
    childId
  )
}

// PATCH /api/v1/category-policies
export async function updateCategoryPolicies(
  accessToken,
  childId,
  categoryPolicyList
) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/category-policies?childId=${encodeURIComponent(childId)}`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        categoryPolicyList,
      }),
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
      result.message || '카테고리 정책 수정에 실패했습니다.'
    )
  }

  return result
}
