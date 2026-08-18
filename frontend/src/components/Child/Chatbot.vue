<template>
  <!-- 진입 버튼 (FAB) + 화면별 안내 말풍선 -->
  <div v-if="!isOpen" class="fab-wrap">
    <!-- hintText가 있을 때만 말풍선 표시 -->
    <div v-if="showHint && hintText" class="fab-hint">
      <button
        class="fab-hint-close"
        type="button"
        aria-label="안내 닫기"
        @click.stop="dismissHint"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
          <path d="M6 6L18 18M18 6L6 18" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/>
        </svg>
      </button>
      <p class="fab-hint-text" @click="openChat">{{ hintText }}</p>
    </div>

    <button
      class="chatbot-fab"
      type="button"
      aria-label="티니코치에게 물어보기"
      @click="openChat"
    >
      <img :src="fabMascotImg" alt="" class="fab-mascot" />
    </button>
  </div>

  <!-- 대화창 -->
  <transition name="chat-pop">
    <div v-if="isOpen" class="chatbot-panel" role="dialog" aria-label="티니코치 챗봇">
      <header class="chatbot-header">
        <span class="header-title">챗봇 상담</span>
        <button class="close-btn" type="button" aria-label="닫기" @click="closeChat">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <div ref="scrollArea" class="chatbot-body">
        <div v-if="messages.length === 0" class="empty-state">
          <img :src="panelMascotImg" alt="" class="intro-avatar" />

          <div class="intro-bubble">
            <p>
              안녕하세요! <strong>티니코치</strong>입니다.<br />
              티니머니 이용 관련 궁금한 점이 생기면
              언제든지 물어보세요!
            </p>
          </div>

          <div class="intro-bubble">
            <p>궁금하신 내용을 직접 입력하시거나,<br />아래에서 선택해 주세요.</p>
          </div>

          <div class="quick-reply-list">
            <button
              v-for="q in quickQuestions"
              :key="q"
              type="button"
              class="quick-reply-chip"
              :disabled="isSending"
              @click="askQuickQuestion(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="msg-row"
          :class="msg.role"
        >
          <img
            v-if="msg.role === 'bot'"
            :src="panelMascotImg"
            alt=""
            class="msg-avatar"
          />
          <div class="msg-bubble" :class="msg.role">
            <template v-if="msg.role === 'bot' && msg.status === 'loading'">
              <span class="typing-dot" />
              <span class="typing-dot" />
              <span class="typing-dot" />
            </template>
            <template v-else-if="msg.status === 'error'">
              <p class="error-text">{{ msg.text }}</p>
              <button class="retry-btn" type="button" @click="retryMessage(idx)">
                다시 시도
              </button>
            </template>
            <template v-else>
              <p
                v-for="(line, i) in splitAnswer(msg.text)"
                :key="i"
                :class="{ 'bullet-line': line.isBullet }"
              >{{ line.text }}</p>
            </template>
          </div>
        </div>
      </div>

      <form class="chatbot-input-row" @submit.prevent="handleSubmit">
        <span class="input-hash">#</span>
        <input
          v-model="draft"
          type="text"
          class="chatbot-input"
          placeholder="티니코치에게 물어보세요"
          :disabled="isSending"
          @keydown.enter.exact.prevent="handleSubmit"
        />
        <button
          class="send-btn-icon"
          type="submit"
          :disabled="isSending || !draft.trim()"
          aria-label="전송"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  </transition>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { sendChatbotMessage } from '@/api/chatbot'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  hintText: {
    type: String,
    default: '궁금한 게 있으면 티니코치에게 물어보세요!',
  },
})

const authStore = useAuthStore()

const fabMascotImg = new URL('../../assets/mascot/teeny-chatbot.png', import.meta.url).href
const panelMascotImg = new URL('../../assets/mascot/teeny-coach.png', import.meta.url).href

const isOpen = ref(false)
const showHint = ref(true)
const draft = ref('')
const isSending = ref(false)
const messages = ref([])
const conversationId = ref(null)
const scrollArea = ref(null)

watch(() => props.hintText, (newVal) => {
  if (newVal) {
    showHint.value = true
  }
})

function dismissHint() {
  showHint.value = false
}

const quickQuestions = [
  '이자가 뭐야?',
  '적금이랑 예금 차이는?',
  '티니점수가 뭐야?',
  '오늘만 허용이 뭐야?',
  '퀘스트는 어떻게 해?',
  '티니머니는 어떻게 충전해?',
]

function openChat() {
  isSending.value = false
  isOpen.value = true
  scrollToBottom()
}

function closeChat() {
  isOpen.value = false
  isSending.value = false
  messages.value = []           // 대화 기록 초기화 -> 다시 열었을 때 첫 화면 노출
  conversationId.value = null   // 세션 초기화
  draft.value = ''              // 인풋 초기화
}

async function scrollToBottom() {
  await nextTick()
  if (scrollArea.value) {
    scrollArea.value.scrollTop = scrollArea.value.scrollHeight
  }
}

function splitAnswer(text) {
  if (!text) return [{ text: '', isBullet: false }]
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const isBullet = /^[-•]\s*/.test(line)
      return {
        text: isBullet ? line.replace(/^[-•]\s*/, '') : line,
        isBullet,
      }
    })
}

async function askQuickQuestion(question) {
  if (isSending.value) return
  draft.value = question
  await handleSubmit()
}

function errorMessageFor(result) {
  switch (result.code) {
    case 'EMPTY_QUERY':
    case 'BAD_REQUEST':
      return '질문을 입력해주세요.'
    case 'UNAUTHORIZED':
      return '로그인이 필요해요. 다시 로그인해주세요.'
    case 'FORBIDDEN':
      return '이 대화에 접근할 수 없어요.'
    case 'BAD_GATEWAY':
      return '티니코치가 잠시 답변하지 못했어요. 다시 시도해주세요.'
    default:
      return result.message || '오류가 발생했어요. 잠시 후 다시 시도해주세요.'
  }
}

async function askBot(query) {
  const loadingIndex = messages.value.length
  messages.value.push({ role: 'bot', text: '', status: 'loading' })
  scrollToBottom()

  try {
    const result = await sendChatbotMessage(
      authStore.accessToken,
      query,
      conversationId.value,
    )

    if (!result.success) {
      if (result.code === 'UNAUTHORIZED') {
        messages.value.splice(loadingIndex, 1)
        authStore.handleUnauthorized('로그인이 필요해요.\n다시 로그인해 주세요.')
        return
      }

      messages.value[loadingIndex] = {
        role: 'bot',
        text: errorMessageFor(result),
        status: 'error',
        query,
      }
      return
    }

    conversationId.value = result.data.conversationId
    messages.value[loadingIndex] = { role: 'bot', text: result.data.answer }
  } catch (err) {
    messages.value[loadingIndex] = {
      role: 'bot',
      text: '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      status: 'error',
      query,
    }
  } finally {
    isSending.value = false
    scrollToBottom()
  }
}

async function handleSubmit() {
  const query = draft.value.trim()
  if (!query || isSending.value) return

  messages.value.push({ role: 'user', text: query })
  draft.value = ''
  isSending.value = true
  scrollToBottom()

  await askBot(query)
}

async function retryMessage(idx) {
  const target = messages.value[idx]
  if (!target || isSending.value) return

  isSending.value = true
  messages.value[idx] = { role: 'bot', text: '', status: 'loading' }
  scrollToBottom()

  await askBot(target.query)
}
</script>

<style scoped>
.fab-wrap {
  position: absolute;
  right: 12px;
  bottom: 78px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.chatbot-fab {
  margin-right: -18px;
  width: 64px;
  height: 64px;
  border-radius: 0;
  background: none;
  border: none;
  box-shadow: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-mascot {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.18));
}

.fab-hint {
  position: relative;
  width: max-content;
  max-width: 220px;
  background: #fff;
  border-radius: 14px;
  border-bottom-right-radius: 4px;
  padding: 10px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.fab-hint::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 14px;
  width: 12px;
  height: 12px;
  background: #fff;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  transform: rotate(0deg);
  border-bottom-right-radius: 3px;
}

.fab-hint-text {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
  word-break: keep-all;
  cursor: pointer;
}

.fab-hint-close {
  position: absolute;
  top: -8px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #cbd5e1;
  border: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.fab-hint-close svg {
  width: 16px;
  height: 16px;
}

.fab-hint-close svg path {
  stroke: #fff;
}

.chatbot-panel {
  position: absolute;
  right: 16px;
  bottom: 78px;
  width: min(330px, calc(100% - 24px));
  height: min(490px, calc(100% - 90px));
  background: #fffaf0;
  border: 1px solid #eaedf1;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  font-family: 'Pretendard', sans-serif;
}

.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #eaedf1;
  flex-shrink: 0;
}

.header-title {
  font-weight: 700;
  font-size: 14px;
  color: #1e2124;
}

.close-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  display: flex;
  cursor: pointer;
}

.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
  scrollbar-width: none;
}

.chatbot-body::-webkit-scrollbar {
  display: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.intro-avatar {
  width: 44px;
  height: 44px;
  object-fit: contain;
  margin-bottom: 2px;
}

.intro-bubble {
  max-width: 90%;
  min-width: 0;
  background: #fff;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  word-break: break-word;
  overflow-wrap: anywhere;
}

.intro-bubble p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #334155;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.quick-reply-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.quick-reply-chip {
  background: #fff;
  border: 1px solid #dbe0e6;
  color: #334155;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.quick-reply-chip:active {
  background: #f8fafc;
}

.quick-reply-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.msg-row.user {
  justify-content: flex-end;
}

.msg-row.bot {
  justify-content: flex-start;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 2px;
}

.msg-bubble {
  position: relative;
  max-width: 85%;
  min-width: 0;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
  overflow-wrap: anywhere;
  box-sizing: border-box;
}

.msg-bubble p {
  margin: 0;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.msg-bubble p + p {
  margin-top: 6px;
}

.msg-bubble p.bullet-line {
  position: relative;
  padding-left: 12px;
}

.msg-bubble p.bullet-line::before {
  content: '·';
  position: absolute;
  left: 0;
  color: #94a3b8;
  font-weight: 800;
}

.msg-bubble.user {
  max-width: 78%;
  background: #ffbc00;
  color: #0f172a;
  border-radius: 16px;
  border-top-right-radius: 4px;
}

.msg-bubble.bot {
  background: #fff;
  color: #0f172a;
  border: 1px solid #eaedf1;
  border-radius: 16px;
  border-top-left-radius: 4px;
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 3px;
  border-radius: 50%;
  background: #64748b;
  animation: bounce 1.2s infinite;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.error-text {
  color: #e0554f;
  margin: 0 0 6px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.retry-btn {
  border: 1px solid #e0554f;
  color: #e0554f;
  background: none;
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.chatbot-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #eaedf1;
  flex-shrink: 0;
}

.input-hash {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  font-weight: 700;
  color: #94a3b8;
}

.chatbot-input {
  flex: 1;
  min-width: 0;
  border: 1px solid #dbe0e6;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 13px;
  outline: none;
  background: #f8fafc;
}

.chatbot-input:focus {
  border-color: #ffbc00;
  background: #fff;
}

.send-btn-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ffbc00;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.chat-pop-leave-active {
  pointer-events: none;
}
.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 다크모드 대응 */
:global(.dark) .chatbot-panel {
  background: #1e1e24;
  border-color: #33333a;
}
:global(.dark) .chatbot-header {
  background: #1e1e24;
  border-color: #33333a;
}
:global(.dark) .header-title {
  color: #f1f5f9;
}
:global(.dark) .chatbot-body {
  background: #17171b;
}
:global(.dark) .chatbot-input-row {
  background: #1e1e24;
  border-color: #33333a;
}
:global(.dark) .intro-bubble {
  background: #2a2a32;
  color: #f1f5f9;
}
:global(.dark) .intro-bubble p {
  color: #f1f5f9;
}
:global(.dark) .msg-bubble.bot {
  background: #2a2a32;
  border-color: #33333a;
  color: #f1f5f9;
}
:global(.dark) .chatbot-input {
  background: #2a2a32;
  border-color: #33333a;
  color: #f1f5f9;
}
</style>