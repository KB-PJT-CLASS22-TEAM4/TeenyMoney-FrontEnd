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
 * 자녀 본인의 완료 금융상품 상세 조회 (만기된 예·적금 또는 완납된 대출의
 * 실제 정산 합계와 회차별 이력)
 * @param {string} accessToken
 * @param {string} productType - 'deposit' | 'saving' | 'loan' (소문자, 경로 세그먼트)
 * @param {number|string} enrollmentId
 * @returns {Promise<{
 *   enrollmentId: number,
 *   productName: string,
 *   productType: string,
 *   status: string,
 *   completionType: string,
 *   completedAt: string,
 *   startDate: string,
 *   maturityDate: string,
 *   termMonths: number,
 *   appliedRate: number,
 *   principalAmount: number,
 *   interestAmount: number,
 *   totalAmount: number,
 *   depositPeriods?: Array,
 *   savingPayments?: Array,
 *   loanRepayments?: Array,
 * }>}
 */
export async function getMyFinancialProductCompletionDetail(accessToken, productType, enrollmentId) {
  const res = await fetch(
    `${BASE_URL}/financial-products/me/enrollments/${productType}/${enrollmentId}/completion-detail`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '완료 상품 상세 조회에 실패했습니다.');
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

/**
 * 예·적금 중도해지 예상 조회 (진행률/적용금리/원금/이자/최종지급액/점수변화)
 * @param {string} accessToken
 * @param {string} productType - 'saving' | 'deposit' (소문자, 경로 세그먼트)
 * @param {number|string} enrollmentId
 * @returns {Promise<{
 *   appliedEarlyTerminationRate: number,
 *   enrollmentId: number,
 *   finalAmount: number,
 *   interestAmount: number,
 *   principalAmount: number,
 *   productType: string,
 *   progressPercent: number,
 *   scoreChange: number,
 *   terminated: boolean,
 * }>}
 */
export async function getTerminationQuote(accessToken, productType, enrollmentId) {
  const res = await fetch(
    `${BASE_URL}/financial-products/${productType}-enrollments/${enrollmentId}/termination-quote`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '중도해지 예상 조회에 실패했습니다.');
  }

  return body.data;
}

/**
 * 예·적금 중도해지 실행 (부모 승인 없이 즉시 처리, 원금+이자 지급 및 티니점수 1회 반영)
 * @param {string} accessToken
 * @param {string} productType - 'saving' | 'deposit' (소문자, 경로 세그먼트)
 * @param {number|string} enrollmentId
 * @returns {Promise<object>} termination-quote와 동일한 응답 구조(data)
 */
export async function terminateEnrollment(accessToken, productType, enrollmentId) {
  const res = await fetch(
    `${BASE_URL}/financial-products/${productType}-enrollments/${enrollmentId}/terminate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await res.json();

  if (!body.success) {
    // 409: 비활성 또는 만기 도달 계약, 404: 본인 가입 계약 아님 등
    const error = new Error(body.message || '중도해지 처리에 실패했습니다.');
    error.status = res.status;
    throw error;
  }

  return body.data;
}

/**
 * 승인 대기(PENDING) 중인 본인의 금융상품 가입 신청 취소
 * @param {string} accessToken
 * @param {string} productType - 'SAVING' | 'DEPOSIT' | 'LOAN' (대소문자 무관)
 * @param {number|string} enrollmentId
 */
export async function cancelPendingEnrollment(accessToken, productType, enrollmentId) {
  const t = String(productType || '').toUpperCase()
  let typeSegment = 'saving'
  if (t.includes('DEPOSIT')) typeSegment = 'deposit'
  else if (t.includes('LOAN')) typeSegment = 'loan'

  const res = await fetch(
    `${BASE_URL}/financial-products/${typeSegment}-enrollments/${enrollmentId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await res.json();

  if (!body.success) {
    // 403: 자녀 회원이 아님, 404: 본인 가입 신청 아님, 409: 이미 승인·거절되어 대기 중이 아님
    const error = new Error(body.message || '신청 취소에 실패했습니다.');
    error.status = res.status;
    throw error;
  }

  return body.data;
}

/**
 * 자유적금 직접납입 (자녀 지갑 → 자유적금으로 이체)
 * idempotencyKey는 호출부에서 매 요청마다 새로 생성해서 넘겨야 함(재시도 시 같은 키를 쓰면
 * 서버가 중복 출금을 막아줌 — 같은 이체를 두 번 보내려는 게 아니라면 항상 새 UUID를 써야 함).
 * @param {string} accessToken
 * @param {number|string} enrollmentId
 * @param {{ amount: number, idempotencyKey: string }} payload
 * @returns {Promise<{ accumulatedAmount: number, paidAmount: number, transferId: number }>}
 */
export async function createSavingPayment(accessToken, enrollmentId, payload) {
  const res = await fetch(
    `${BASE_URL}/financial-products/saving-enrollments/${enrollmentId}/payments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const body = await res.json();

  if (!body.success) {
    // 400: 정기적금이거나 월 한도 초과, 409: 비활성 가입 또는 멱등성 키 충돌
    const error = new Error(body.message || '적금 납입에 실패했습니다.');
    error.status = res.status;
    throw error;
  }

  return body.data;
}

/**
 * 대출 조기상환 예상 조회 (연체이자/원금 충당 내역, 완제 여부, 점수 변화)
 * @param {string} accessToken
 * @param {number|string} enrollmentId
 * @param {number} amount - 상환하려는 금액
 * @returns {Promise<{
 *   currentOutstandingPrincipal: number,
 *   currentOverdueInterest: number,
 *   enrollmentId: number,
 *   executed: boolean,
 *   paidInterestAmount: number,
 *   paidPrincipalAmount: number,
 *   remainingOutstandingPrincipal: number,
 *   remainingOverdueInterest: number,
 *   requestedAmount: number,
 *   scoreChange: number,
 *   status: string,
 * }>}
 */
export async function getEarlyRepaymentQuote(accessToken, enrollmentId, amount) {
  const res = await fetch(
    `${BASE_URL}/financial-products/loan-enrollments/${enrollmentId}/early-repayment-quote?amount=${encodeURIComponent(amount)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await res.json();

  if (!body.success) {
    throw new Error(body.message || '조기상환 예상 조회에 실패했습니다.');
  }

  return body.data;
}

/**
 * 대출 조기상환 실행 (요청 금액을 연체이자 → 원금 순으로 충당, 잔여 원금 0원이면 자동 종료)
 * idempotencyKey는 호출부에서 매 요청마다 새로 생성해서 넘겨야 함(재시도 시 같은 키를 쓰면
 * 서버가 중복 출금을 막아줌 — 같은 상환을 두 번 보내려는 게 아니라면 항상 새 UUID를 써야 함).
 * @param {string} accessToken
 * @param {number|string} enrollmentId
 * @param {{ amount: number, idempotencyKey: string }} payload
 * @returns {Promise<object>} early-repayment-quote와 동일한 응답 구조(data)
 */
export async function executeEarlyRepayment(accessToken, enrollmentId, payload) {
  const res = await fetch(
    `${BASE_URL}/financial-products/loan-enrollments/${enrollmentId}/early-repayment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const body = await res.json();

  if (!body.success) {
    // 400: 요청 형식 오류 또는 남은 상환 금액 초과
    // 409: 상환 중인 대출이 아니거나 잔액 부족, 멱등성 키 충돌
    const error = new Error(body.message || '조기상환 처리에 실패했습니다.');
    error.status = res.status;
    throw error;
  }

  return body.data;
}

