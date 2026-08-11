const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 퀘스트 목록 조회
export async function getQuests(accessToken, { tab, cursor } = {}) {
  if (!accessToken) throw new Error('로그인이 필요합니다.')

  const params = new URLSearchParams({ tab })
  if (cursor) params.append('cursor', cursor)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/quests?${params}`,
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
    throw new Error(result.message || '퀘스트 목록을 불러오지 못했습니다.')
  }

  return result.data  // { items, nextCursor }
}