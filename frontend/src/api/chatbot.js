const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/chatbot`

/**
 * 금융 지식 챗봇에게 질문을 보내고 답변을 받습니다.
 *
 * - conversationId를 함께 보내면 이전 대화에 이어서 답변합니다.
 * - conversationId가 없으면 새 대화로 시작합니다.
 * - 대화 내용은 서버에 저장되지 않으므로, 대화를 이어가려면
 *   프론트에서 응답으로 받은 conversationId를 직접 저장해두었다가
 *   다음 요청에 다시 전달해야 합니다.
 *
 * @param {string} accessToken
 * @param {string} query - 사용자 질문
 * @param {string|null} [conversationId] - 이전 대화 ID. 없으면 새 대화 시작
 * @returns {Promise<{ code, data: { answer, conversationId }, message, success }>}
 */
export async function sendChatbotMessage(accessToken, query, conversationId = null) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      conversationId: conversationId ?? undefined,
      query,
    }),
  })

  return res.json()
}