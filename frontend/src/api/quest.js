import { ensureAccessToken } from '@/utils/authSession'
import { getExtendedDeadlineIso } from '@/utils/questDeadline'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

function createQuestApiError(
  message,
  status,
) {
  const error = new Error(message)
  error.status = status
  return error
}


// ========================================
// 퀘스트 목록 조회
//
// GET /api/v1/quests?tab=AVAILABLE
// GET /api/v1/quests?tab=ONGOING
// GET /api/v1/quests?tab=COMPLETED
// ========================================
export async function getQuests(
  accessToken,
  tab = 'AVAILABLE',
  childId = null,
  cursor = null
) {
  ensureAccessToken(accessToken)

  const params = new URLSearchParams()

  params.append('tab', tab)

  if (
    childId !== null &&
    childId !== undefined
  ) {
    params.append(
      'childId',
      String(childId)
    )
  }

  if (cursor) {
    params.append(
      'cursor',
      cursor
    )
  }

  const url =
    `${API_BASE_URL}/api/v1/quests?${params.toString()}`

  console.log(
    '퀘스트 목록 요청 URL:',
    url
  )

  console.log(
    '퀘스트 TAB:',
    tab
  )

  const response = await fetch(
    url,
    {
      method: 'GET',

      headers: {
        Accept:
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  )

  let result

  try {
    result =
      await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  console.log(
    '퀘스트 목록 응답:',
    result
  )

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      '퀘스트 목록 조회에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 상세 조회
//
// GET /api/v1/quests/{questId}
// ========================================
export async function getQuestDetail(
  questId,
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}`,
    {
      method: 'GET',

      headers: {
        Accept:
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  )

  let result

  try {
    result =
      await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  console.log(
    '퀘스트 상세 응답:',
    result
  )

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      '퀘스트 상세 조회에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 생성
//
// POST /api/v1/quests
// ========================================
export async function createQuest(
  questData,
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  const creationRequestKey =
    crypto.randomUUID()

  console.log(
    'X-Creation-Request-Key:',
    creationRequestKey
  )

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests`,
    {
      method: 'POST',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,

        'X-Creation-Request-Key':
          creationRequestKey,
      },

      body:
        JSON.stringify(
          questData
        ),
    }
  )

  let result

  try {
    result =
      await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  console.log(
    '퀘스트 생성 응답:',
    result
  )

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      '퀘스트 생성에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 수정
//
// PATCH /api/v1/quests/{questId}
// ========================================
export async function updateQuest(
  questId,
  questData,
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}`,
    {
      method: 'PATCH',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },

      body:
        JSON.stringify(
          questData
        ),
    }
  )

  let result

  try {
    result =
      await response.json()
  } catch {
    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      '퀘스트 수정에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 삭제
//
// DELETE /api/v1/quests/{questId}
// ========================================
export async function deleteQuest(
  questId,
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}`,
    {
      method: 'DELETE',

      headers: {
        Accept:
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  )

  if (
    response.status === 204
  ) {
    return {
      success: true,
      data: null,
    }
  }

  let result

  try {
    result =
      await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      '퀘스트 삭제에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 부모 - 퀘스트 인증 승인
//
// PATCH
// /api/v1/quests/{questId}/verifications/{verificationId}/approve
// ========================================
export async function approveQuestVerification(
  questId,
  verificationId,
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  if (
    verificationId === null ||
    verificationId === undefined
  ) {
    throw new Error(
      'verificationId가 필요합니다.'
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/verifications/${verificationId}/approve`,
    {
      method: 'PATCH',

      headers: {
        Accept:
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  )

  if (
    response.status === 204
  ) {
    return {
      success: true,
      data: null,
    }
  }

  let result

  try {
    result =
      await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  console.log(
    '인증 승인 응답:',
    result
  )

  if (
    !response.ok ||
    !result.success
  ) {
    throw createQuestApiError(
      result.message ||
      '퀘스트 인증 승인에 실패했습니다.',
      response.status,
    )
  }

  return result
}


// ========================================
// 부모 - 퀘스트 인증 거절
//
// PATCH
// /api/v1/quests/{questId}/verifications/{verificationId}/reject
//
// body:
// {
//   "rejectionReason": "거절 사유"
// }
// ========================================
export async function rejectQuestVerification(
  questId,
  verificationId,
  rejectionReason,
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  if (
    verificationId === null ||
    verificationId === undefined
  ) {
    throw new Error(
      'verificationId가 필요합니다.'
    )
  }

  if (
    typeof rejectionReason !==
      'string' ||
    !rejectionReason.trim()
  ) {
    throw new Error(
      '거절 사유를 입력해주세요.'
    )
  }

  const requestBody = {
    rejectionReason:
      rejectionReason.trim(),
  }

  console.log(
    '퀘스트 인증 거절 요청:',
    {
      questId,
      verificationId,
      rejectionReason:
        requestBody.rejectionReason,
    }
  )

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/verifications/${verificationId}/reject`,
    {
      method: 'PATCH',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },

      body:
        JSON.stringify(
          requestBody
        ),
    }
  )

  if (
    response.status === 204
  ) {
    return {
      success: true,
      data: null,
    }
  }

  let result

  try {
    result =
      await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  console.log(
    '인증 거절 응답:',
    result
  )

  if (
    !response.ok ||
    !result.success
  ) {
    throw createQuestApiError(
      result.message ||
      '퀘스트 인증 거절에 실패했습니다.',
      response.status,
    )
  }

  return result
}


// ========================================
// 부모 - 퀘스트 기한 연장
//
// PATCH /api/v1/quests/{questId}
// ========================================
export async function extendQuestDeadline(
  questId,
  accessToken,
  currentDeadline,
  extensionDays = 7,
) {
  return updateQuest(
    questId,
    {
      deadline: getExtendedDeadlineIso(
        currentDeadline,
        extensionDays,
      ),
    },
    accessToken,
  )
}


// ========================================
// 자녀 - 퀘스트 수락
//
// AVAILABLE → IN_PROGRESS
// PATCH /api/v1/quests/{questId}/accept
// ========================================
export async function acceptQuest(
  accessToken,
  questId
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/accept`,
    {
      method: 'PATCH',

      headers: {
        Accept:
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  )

  if (
    response.status === 204
  ) {
    return {
      success: true,
      data: null,
    }
  }

  let result

  try {
    result =
      await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (
    !response.ok ||
    result.success === false
  ) {
    throw new Error(
      result.message ||
      '퀘스트 수락에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 자녀 - 퀘스트 거절
//
// AVAILABLE → DECLINED
// PATCH /api/v1/quests/{questId}/decline
// ========================================
export async function declineQuest(
  accessToken,
  questId,
  {
    reasonCode,
    reasonDetail,
  } = {}
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/decline`,
    {
      method: 'PATCH',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },

      body:
        JSON.stringify({
          reasonCode,
          reasonDetail,
        }),
    }
  )

  if (
    response.status === 204
  ) {
    return {
      success: true,
      data: null,
    }
  }

  let result

  try {
    result =
      await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (
    !response.ok ||
    result.success === false
  ) {
    throw new Error(
      result.message ||
      '퀘스트 거절에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 자녀 - 퀘스트 인증 제출
//
// IN_PROGRESS → PENDING
// POST /api/v1/quests/{questId}/verifications
//
// multipart/form-data
// content: 선택
// image: 선택
// ========================================
export async function submitQuestVerification(
  accessToken,
  questId,
  {
    content,
    image,
  } = {}
) {
  if (!accessToken) {
    throw new Error(
      '로그인이 필요합니다.'
    )
  }

  if (
    questId === null ||
    questId === undefined
  ) {
    throw new Error(
      'questId가 필요합니다.'
    )
  }

  const formData =
    new FormData()

  if (
    content &&
    content.trim()
  ) {
    formData.append(
      'content',
      content.trim()
    )
  }

  if (image) {
    formData.append(
      'image',
      image
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/verifications`,
    {
      method: 'POST',

      headers: {
        Accept:
          'application/json',

        Authorization:
          `Bearer ${accessToken}`,
      },

      // multipart/form-data는
      // Content-Type 직접 설정하면 안 됨
      body: formData,
    }
  )

  let result

  try {
    result =
      await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error(
      '서버 응답을 읽을 수 없습니다.'
    )
  }

  if (
    !response.ok ||
    result.success === false
  ) {
    throw new Error(
      result.message ||
      '퀘스트 인증 제출에 실패했습니다.'
    )
  }

  return result
}

// 퀘스트 수락 (AVAILABLE → IN_PROGRESS)
// PATCH /api/v1/quests/{questId}/accept
export async function acceptQuest(accessToken, questId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/accept`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) return { success: true }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '퀘스트 수락에 실패했습니다.')
  }

  return result
}

// 퀘스트 거절 (AVAILABLE → DECLINED, 티니점수 차감 없음)
// PATCH /api/v1/quests/{questId}/decline
export async function declineQuest(accessToken, questId, { reasonCode, reasonDetail } = {}) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/decline`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reasonCode, reasonDetail }),
    }
  )

  if (response.status === 204) return { success: true }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '퀘스트 거절에 실패했습니다.')
  }

  return result
}

// 퀘스트 인증 제출 (IN_PROGRESS 상태, 새 시도 추가 → PENDING)
// 사진 1장(jpg/jpeg/png/webp, 5MB 이하) + 텍스트(선택)
// POST /api/v1/quests/{questId}/verifications
export async function submitQuestVerification(accessToken, questId, { content, image } = {}) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const formData = new FormData()
  if (content && content.trim()) formData.append('content', content)
  if (image) formData.append('image', image)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/verifications`,
    {
      method: 'POST',
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
    throw new Error(result.message || '퀘스트 인증 제출에 실패했습니다.')
  }

  return result
}