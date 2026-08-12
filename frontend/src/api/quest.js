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

// 퀘스트 상세 조회
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
  try { result = await response.json() } catch { throw new Error('서버 응답을 읽을 수 없습니다.') }
  if (!response.ok || result.success === false) throw new Error(result.message || '퀘스트 상세를 불러오지 못했습니다.')
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

// 퀘스트 수정
export async function updateQuest(accessToken, questId, data) {
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
      body: JSON.stringify(data),
    }
  )

  let result
  try { result = await response.json() } catch { throw new Error('서버 응답을 읽을 수 없습니다.') }
  if (!response.ok || result.success === false) throw new Error(result.message || '퀘스트 수정에 실패했습니다.')
  return result
}

// 퀘스트 삭제
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

  let result
  try { result = await response.json() } catch { throw new Error('서버 응답을 읽을 수 없습니다.') }
  if (!response.ok || result.success === false) throw new Error(result.message || '퀘스트 삭제에 실패했습니다.')
  return result
}