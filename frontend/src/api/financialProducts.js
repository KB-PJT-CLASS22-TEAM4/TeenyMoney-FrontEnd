import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

async function parseResponse(response) {
  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '요청을 처리하지 못했습니다.')
  }

  return result
}

function authHeaders(accessToken, withJson = false) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }

  if (withJson) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

// 자녀 가입 전체 금융상품 목록
export async function getChildFinancialProducts(accessToken, childId) {
  ensureAccessToken(accessToken)
  if (!childId) throw new Error('자녀 정보가 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

export async function getChildSavingProducts(accessToken, childId) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/saving`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

export async function getChildDepositProducts(accessToken, childId) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/deposit`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

export async function getChildLoanProducts(accessToken, childId) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/loan`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

function toProductPathSegment(productType) {
  const map = {
    SAVING: 'custom-savings',
    SAVINGS: 'custom-savings',
    saving: 'custom-savings',
    savings: 'custom-savings',
    DEPOSIT: 'custom-deposits',
    deposit: 'custom-deposits',
    deposits: 'custom-deposits',
    LOAN: 'custom-loans',
    loan: 'custom-loans',
    loans: 'custom-loans',
    적금: 'custom-savings',
    예금: 'custom-deposits',
    대출: 'custom-loans',
  }

  return map[productType] || map[String(productType || '').toUpperCase()] || 'custom-savings'
}

// 부모 금융상품 등록
export async function createFinancialProduct(accessToken, payload) {
  ensureAccessToken(accessToken)

  const childId = payload?.childId
  const productType = payload?.productType
  if (!childId) throw new Error('자녀 정보가 필요합니다.')

  const { childId: _childId, productType: _productType, ...body } = payload

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/${toProductPathSegment(productType)}`,
    {
      method: 'POST',
      headers: authHeaders(accessToken, true),
      body: JSON.stringify(body),
    }
  )

  return parseResponse(response)
}

export async function getChildCustomProducts(accessToken, childId, productType) {
  ensureAccessToken(accessToken)
  if (!childId) throw new Error('자녀 정보가 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/${toProductPathSegment(productType)}`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

export async function getAllChildCustomProducts(accessToken, childId) {
  ensureAccessToken(accessToken)
  if (!childId) throw new Error('자녀 정보가 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/custom-products`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

export async function deleteFinancialProduct(
  accessToken,
  childId,
  productType,
  productId
) {
  ensureAccessToken(accessToken)
  if (!childId) throw new Error('자녀 정보가 필요합니다.')
  if (productId == null || productId === '') {
    throw new Error('상품 정보가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/${toProductPathSegment(productType)}/${productId}`,
    {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

function toApiProductType(categoryOrType) {
  const map = {
    적금: 'SAVING',
    SAVINGS: 'SAVING',
    SAVING: 'SAVING',
    예금: 'DEPOSIT',
    DEPOSIT: 'DEPOSIT',
    대출: 'LOAN',
    LOAN: 'LOAN',
  }

  return map[categoryOrType] || categoryOrType
}

// 가입 승인 요청 목록
export async function getFinancialProductApprovalRequests(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/approval-requests`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

// 가입 승인 요청 상세
export async function getFinancialProductApprovalRequestDetail(
  accessToken,
  productType,
  enrollmentId
) {
  ensureAccessToken(accessToken)

  const type = toApiProductType(productType)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/approval-requests/${type}/${enrollmentId}`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

// 가입 승인
export async function approveFinancialProductApprovalRequest(
  accessToken,
  productType,
  enrollmentId
) {
  ensureAccessToken(accessToken)

  const type = toApiProductType(productType)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/approval-requests/${type}/${enrollmentId}/approve`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

// 가입 거절
export async function rejectFinancialProductApprovalRequest(
  accessToken,
  productType,
  enrollmentId
) {
  ensureAccessToken(accessToken)

  const type = toApiProductType(productType)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/approval-requests/${type}/${enrollmentId}/reject`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}

// 가입 승인 / 거절 (legacy wrapper)
export async function approveFinancialEnrollment(
  accessToken,
  childId,
  category,
  enrollmentId
) {
  return approveFinancialProductApprovalRequest(
    accessToken,
    category,
    enrollmentId
  )
}

export async function rejectFinancialEnrollment(
  accessToken,
  childId,
  category,
  enrollmentId
) {
  return rejectFinancialProductApprovalRequest(
    accessToken,
    category,
    enrollmentId
  )
}

function toCompletionProductPath(productType) {
  const raw = String(productType || '').toUpperCase()
  if (raw.includes('LOAN') || raw.includes('대출')) return 'loan'
  if (raw.includes('DEPOSIT') || raw.includes('예금')) return 'deposit'
  return 'saving'
}

// 부모의 자녀 만기 예금·적금 및 완납 대출 이력 상세
export async function getChildFinancialProductCompletionDetail(
  accessToken,
  childId,
  productType,
  enrollmentId
) {
  ensureAccessToken(accessToken)
  if (!childId) throw new Error('자녀 정보가 필요합니다.')
  if (enrollmentId == null || enrollmentId === '') {
    throw new Error('가입 정보가 필요합니다.')
  }

  const type = toCompletionProductPath(productType)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/children/${childId}/${type}/${enrollmentId}/completion-detail`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  return parseResponse(response)
}
