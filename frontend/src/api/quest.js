const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 퀘스트 목록 조회
export async function getQuests(accessToken, params = {}) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const query = new URLSearchParams(params).toString()
  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  let result
  try { result = await response.json() } catch { throw new Error('서버 응답을 읽을 수 없습니다.') }
  if (!response.ok || result.success === false) throw new Error(result.message || '퀘스트 목록을 불러오지 못했습니다.')
  return result
}

// 퀘스트 생성
export async function createQuest(accessToken, questData) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const creationKey = crypto.randomUUID()

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Creation-Request-Key': creationKey,
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

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '퀘스트 생성에 실패했습니다.')
  }

  return result
}

// 퀘스트 상세 조회
// GET /api/v1/quests/{questId}
export async function getQuestDetail(accessToken, questId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

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

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '퀘스트를 불러오지 못했습니다.')
  }

  return result
}

// 퀘스트 수정
// PATCH /api/v1/quests/{questId}
export async function updateQuest(accessToken, questId, questData) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

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

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '퀘스트 수정에 실패했습니다.')
  }

  return result
}

// 퀘스트 삭제
// DELETE /api/v1/quests/{questId}
export async function deleteQuest(accessToken, questId) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

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

  if (response.status === 204) return { success: true }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || '퀘스트 삭제에 실패했습니다.')
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