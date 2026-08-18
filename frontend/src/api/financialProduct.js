import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// ── 목록 공통 ──
async function fetchProducts(accessToken, path) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/${path}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  let result
  try { result = await response.json() }
  catch { throw new Error('서버 응답을 읽을 수 없습니다.') }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '금융상품 목록을 불러오지 못했습니다.')
  }

  return result.data
}

// ── 상세 공통 ──
async function fetchProductDetail(accessToken, path, productId) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-products/${path}/${productId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  let result
  try { result = await response.json() }
  catch { throw new Error('서버 응답을 읽을 수 없습니다.') }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '상품 상세를 불러오지 못했습니다.')
  }

  return result.data
}

// ── 목록 조회 ──
export async function getSavingProducts(accessToken) {
  return fetchProducts(accessToken, 'saving')
}

export async function getDepositProducts(accessToken) {
  return fetchProducts(accessToken, 'deposit')
}

export async function getLoanProducts(accessToken) {
  return fetchProducts(accessToken, 'loan')
}

// 전체 목록 (세 개 병렬 호출)
export async function getFinancialProducts(accessToken) {
  const [saving, deposit, loan] = await Promise.all([
    getSavingProducts(accessToken),
    getDepositProducts(accessToken),
    getLoanProducts(accessToken),
  ])
  return [...saving, ...deposit, ...loan]
}

// ── 상세 조회 ──
export async function getSavingProductDetail(accessToken, productId) {
  return fetchProductDetail(accessToken, 'saving', productId)
}

export async function getDepositProductDetail(accessToken, productId) {
  return fetchProductDetail(accessToken, 'deposit', productId)
}

export async function getLoanProductDetail(accessToken, productId) {
  return fetchProductDetail(accessToken, 'loan', productId)
}