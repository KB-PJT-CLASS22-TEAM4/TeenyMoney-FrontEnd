import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

  
export async function sendAllowance(
  childId,
  amount,
  accessToken,
  idempotencyKey
) {
  ensureAccessToken(accessToken)

  if (!childId) {
    throw new Error('자녀 정보가 없습니다.')
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error('올바른 금액을 입력해주세요.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/children/${childId}`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': idempotencyKey,
      },

      body: JSON.stringify({
        amount: Number(amount),
      }),
    }
  )

  let result

  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok || result?.success === false) {
    const error = new Error(
      result?.message ||
      '용돈 보내기에 실패했습니다.'
    )

    error.status = response.status
    error.code = result?.code
    error.data = result?.data

    throw error
  }

  return result
}

function parseAllowanceResult(response, result, fallbackMessage) {
  if (!response.ok || result?.success === false) {
    const error = new Error(
      result?.message || fallbackMessage
    )
    error.status = response.status
    error.code = result?.code
    error.data = result?.data
    throw error
  }

  return result
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function authHeaders(accessToken) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }
}

// 정기 용돈 스케줄 목록 조회
export async function getAllowanceSchedules(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/schedule`,
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    }
  )

  const result = await parseJsonSafe(response)
  return parseAllowanceResult(
    response,
    result,
    '정기 용돈 스케줄을 불러오지 못했습니다.'
  )
}

// 정기 용돈 스케줄 생성
export async function createAllowanceSchedule(accessToken, payload) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/schedule`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    }
  )

  const result = await parseJsonSafe(response)
  return parseAllowanceResult(
    response,
    result,
    '정기 용돈 스케줄 생성에 실패했습니다.'
  )
}

// 정기 용돈 스케줄 전체 수정
export async function updateAllowanceSchedule(accessToken, scheduleId, payload) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/schedule/${scheduleId}`,
    {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    }
  )

  const result = await parseJsonSafe(response)
  return parseAllowanceResult(
    response,
    result,
    '정기 용돈 스케줄 수정에 실패했습니다.'
  )
}

// 정기 용돈 스케줄 삭제
export async function deleteAllowanceSchedule(accessToken, scheduleId) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/schedule/${scheduleId}`,
    {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    }
  )

  if (response.status === 204) {
    return { success: true }
  }

  const result = await parseJsonSafe(response)
  return parseAllowanceResult(
    response,
    result,
    '정기 용돈 스케줄 삭제에 실패했습니다.'
  )
}

// 정기 용돈 스케줄 활성화/비활성화
export async function updateAllowanceScheduleStatus(
  accessToken,
  scheduleId,
  isActive
) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/allowance/schedule/${scheduleId}/status`,
    {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ isActive }),
    }
  )

  const result = await parseJsonSafe(response)
  return parseAllowanceResult(
    response,
    result,
    '정기 용돈 상태 변경에 실패했습니다.'
  )
}