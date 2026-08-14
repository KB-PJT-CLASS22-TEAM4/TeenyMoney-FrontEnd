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

// 부모 금융상품 등록
export async function createFinancialProduct(accessToken, payload) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products`,
    {
      method: 'POST',
      headers: authHeaders(accessToken, true),
      body: JSON.stringify(payload),
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
