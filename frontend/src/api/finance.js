const BASE_URL = '/api/v1';

/**
 * 전체 금융상품 목록 조회 (예금/적금/대출 + 자녀 가입 가능 여부 포함)
 * @param {string} accessToken
 * @returns {Promise<Array>} data 배열 (productType: DEPOSIT | SAVINGS | LOAN 등)
 */
export async function getFinancialProducts(accessToken) {
  const res = await fetch(`${BASE_URL}/financial-products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204: 목록이 비어있는 경우 (상품 없음)
  if (res.status === 204) {
    return [];
  }

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '금융상품 목록 조회에 실패했습니다.');
  }

  return body.data;
}

/**
 * 자녀가 가입한 전체 금융상품 목록 조회 (예금/적금/대출, 거절된 신청 제외)
 * ⚠️ 부모 전용 API — 부모가 특정 자녀(childId)의 가입상품을 조회할 때 사용
 * @param {string} accessToken
 * @param {number|string} childId 자녀 회원 ID
 * @returns {Promise<Array>} data 배열 (enrollmentId, productType, status, currentAmount 등 포함)
 */
export async function getEnrolledFinancialProducts(accessToken, childId) {
  const res = await fetch(`${BASE_URL}/financial-products/children/${childId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204: 가입한 상품이 없는 경우
  if (res.status === 204) {
    return [];
  }

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '가입한 금융상품 목록 조회에 실패했습니다.');
  }

  return body.data;
}

/**
 * 자녀 본인의 전체 금융상품 가입계약 목록 조회 (자녀 로그인 전용, childId 불필요)
 * @param {string} accessToken
 * @returns {Promise<Array>} data 배열 (enrollmentId, productType, status, currentAmount 등 포함)
 */
export async function getMyEnrolledFinancialProducts(accessToken) {
  const res = await fetch(`${BASE_URL}/financial-products/me/enrollments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204: 가입한 상품이 없는 경우
  if (res.status === 204) {
    return [];
  }

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '가입 상품 목록 조회에 실패했습니다.');
  }

  return body.data;
}

/**
 * 적금 가입 요청
 * @param {string} accessToken
 * @param {{ productId: number, monthlyAmount: number, termMonths: number, autoTransfer: boolean, paymentDay: number }} payload
 * @returns {Promise<{ enrollmentId: number, expectedAppliedRate: number, productType: string, status: string }>}
 */
export async function createSavingEnrollment(accessToken, payload) {
  const res = await fetch(`${BASE_URL}/financial-products/saving-enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '적금 가입에 실패했습니다.');
  }

  return body.data;
}

/**
 * 대출 가입 요청
 * @param {string} accessToken
 * @param {{ productId: number, principalAmount: number, termMonths: number, autoTransfer: boolean, paymentDay: number }} payload
 * @returns {Promise<{ enrollmentId: number, expectedAppliedRate: number, productType: string, status: string }>}
 */
export async function createLoanEnrollment(accessToken, payload) {
  const res = await fetch(`${BASE_URL}/financial-products/loan-enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '대출 가입에 실패했습니다.');
  }

  return body.data;
}

/**
 * 예금 가입 요청
 * @param {string} accessToken
 * @param {{ productId: number, amount: number, termMonths: number }} payload
 * @returns {Promise<{ enrollmentId: number, expectedAppliedRate: number, productType: string, status: string }>}
 */
export async function createDepositEnrollment(accessToken, payload) {
  const res = await fetch(`${BASE_URL}/financial-products/deposit-enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '예금 가입에 실패했습니다.');
  }

  return body.data;
}

/**
 * 대출 상품 상세 조회 (요구 등급명(requiredGradeName) 등 확인용)
 * @param {string} accessToken
 * @param {number|string} productId
 * @returns {Promise<Object>} 상품 상세 데이터
 */
export async function getLoanProductDetail(accessToken, productId) {
  const res = await fetch(`${BASE_URL}/financial-products/loan/${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '대출 상품 상세 조회에 실패했습니다.');
  }

  return body.data;
}