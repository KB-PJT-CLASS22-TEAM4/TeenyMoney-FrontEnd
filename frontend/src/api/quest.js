const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL


export async function getQuests(
  accessToken,
  tab = 'AVAILABLE'
) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  const params = new URLSearchParams()
  params.append('tab', tab)

  const url =
    `${API_BASE_URL}/api/v1/quests?${params.toString()}`

  console.log('퀘스트 조회 URL:', url)
  console.log('퀘스트 조회 TAB:', tab)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  console.log('퀘스트 목록 응답:', result)

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 목록 조회에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 상세 조회
// GET /api/v1/quests/{questId}
// ========================================
export async function getQuestDetail(questId, accessToken) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  if (!questId) {
    throw new Error('questId가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}`,
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

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 상세 조회에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 생성
// POST /api/v1/quests
// ========================================
export async function createQuest(questData, accessToken) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(questData),
    }
  )

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 생성에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 수정
// PATCH /api/v1/quests/{questId}
// ========================================
export async function updateQuest(
  questId,
  questData,
  accessToken
) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  if (!questId) {
    throw new Error('questId가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(questData),
    }
  )

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 수정에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 삭제
// DELETE /api/v1/quests/{questId}
// ========================================
export async function deleteQuest(questId, accessToken) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  if (!questId) {
    throw new Error('questId가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) {
    return {
      success: true,
      data: null,
    }
  }

  let result

  try {
    result = await response.json()
  } catch {
    if (response.ok) {
      return {
        success: true,
        data: null,
      }
    }

    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 삭제에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 인증 승인
// PATCH
// /api/v1/quests/{questId}/verifications/{verificationId}/approve
// ========================================
export async function approveQuestVerification(
  questId,
  verificationId,
  accessToken
) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  if (!questId) {
    throw new Error('questId가 필요합니다.')
  }

  if (!verificationId) {
    throw new Error('verificationId가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/verifications/${verificationId}/approve`,
    {
      method: 'PATCH',
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

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 인증 승인에 실패했습니다.'
    )
  }

  return result
}


// ========================================
// 퀘스트 인증 반려
// PATCH
// /api/v1/quests/{questId}/verifications/{verificationId}/reject
// ========================================
export async function rejectQuestVerification(
  questId,
  verificationId,
  accessToken
) {
  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  if (!questId) {
    throw new Error('questId가 필요합니다.')
  }

  if (!verificationId) {
    throw new Error('verificationId가 필요합니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests/${questId}/verifications/${verificationId}/reject`,
    {
      method: 'PATCH',
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

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || '퀘스트 인증 반려에 실패했습니다.'
    )
  }

  return result
}