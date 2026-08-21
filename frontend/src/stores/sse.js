import { defineStore } from 'pinia'
import { ref } from 'vue'
import { issueSseTicket } from '@/api/sse'
import { useAuthStore } from '@/stores/auth'
import { createLatestRequestGuard } from '@/utils/latestRequestGuard'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 서버가 보내는 이벤트 이름. 백엔드 NotificationReferenceType 값 그대로다.
// 이름 있는 이벤트는 onmessage로 오지 않으므로 하나씩 등록해야 한다.
export const SSE_EVENT_TYPES = [
  'QUEST',
  'TODAY_PERMISSION',
  'CONNECTION',
  'TRANSFER',
  'PAYMENT',
  'CHARGE',
  'DEPOSIT_ENROLLMENT',
  'SAVING_ENROLLMENT',
  'LOAN_ENROLLMENT',
]

// 재연결 백오프. 서버가 죽어 있을 때 재연결 폭주를 막는다.
const RECONNECT_MIN_MS = 1000
const RECONNECT_MAX_MS = 30000

// 이만큼 유지된 연결이 끊긴 것만 '정상적인 재연결'로 본다.
// 붙자마자 끊기는 상황(프록시 오설정 등)에서 백오프가 매번 초기화되면
// 1초 간격 무한 재시도가 된다.
const STABLE_CONNECTION_MS = 10000

/**
 * 실시간 화면 동기화 연결.
 *
 * 서버는 "무엇이 바뀌었다"는 신호만 보내고 데이터는 싣지 않는다. 그래서 이 스토어는
 * 받은 이벤트 이름을 lastEvent에 기록만 하고, 실제 갱신은 각 화면이 자기 조회 API를
 * 다시 호출해서 한다(useServerEvents 참고).
 *
 * 연결은 앱 전체에서 하나만 유지한다. 화면마다 열면 회원 한 명이 연결을 여러 개 잡는다.
 */
export const useSseStore = defineStore('sse', () => {
  // 마지막으로 받은 이벤트. seq를 함께 올리는 이유는 같은 타입이 연속으로 와도
  // watch가 걸려야 하기 때문이다. type만 두면 두 번째부터 값이 안 바뀌어 무시된다.
  const lastEvent = ref({ type: null, seq: 0 })
  const connected = ref(false)

  let source = null
  let reconnectTimer = null
  let reconnectDelayMs = RECONNECT_MIN_MS
  const connectGuard = createLatestRequestGuard()
  // 티켓 발급은 비동기라, 응답을 기다리는 사이에 connect()가 또 불릴 수 있다.
  // source만 보고 판단하면 그 틈에 연결이 두 개 만들어진다.
  let connecting = false

  async function connect() {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) return
    if (source || connecting) return

    const request = connectGuard.begin()
    const memberId = authStore.memberId
    connecting = true

    try {
      const result = await issueSseTicket(authStore.accessToken)
      const ticket = result?.data?.ticket

      if (!ticket) {
        throw new Error('티켓이 비어 있습니다.')
      }

      // 티켓을 받는 사이에 로그아웃하거나 계정이 바뀌었으면 이전 티켓을 버린다.
      if (
        !authStore.isAuthenticated ||
        !connectGuard.isLatest(request) ||
        authStore.memberId !== memberId
      ) return

      openStream(ticket)
    } catch (e) {
      if (!connectGuard.isLatest(request)) return
      console.log('SSE 연결 실패:', e.message)
      scheduleReconnect()
    } finally {
      if (connectGuard.isLatest(request)) connecting = false
    }
  }

  function openStream(ticket) {
    let openedAt = 0

    const stream = new EventSource(
      `${API_BASE_URL}/api/v1/sse/subscribe?ticket=${encodeURIComponent(ticket)}`
    )

    stream.onopen = () => {
      connected.value = true
      openedAt = Date.now()
    }

    // 서버 타임아웃(30분)으로 끊길 때도, 네트워크가 끊길 때도 여기로 온다.
    //
    // EventSource는 스스로 재연결하지만 티켓이 1회용이라 그 재연결은 반드시 실패한다.
    // 같은 URL(= 이미 소비된 티켓)로 다시 붙기 때문이다. 그래서 직접 닫고
    // 티켓부터 새로 받는다. 이걸 브라우저에 맡기면 첫 타임아웃 이후 실시간성이
    // 조용히 사라진다.
    stream.onerror = () => {
      if (openedAt && Date.now() - openedAt > STABLE_CONNECTION_MS) {
        reconnectDelayMs = RECONNECT_MIN_MS
      }

      closeStream()
      scheduleReconnect()
    }

    SSE_EVENT_TYPES.forEach((type) => {
      stream.addEventListener(type, () => {
        lastEvent.value = { type, seq: lastEvent.value.seq + 1 }
      })
    })

    source = stream
  }

  function closeStream() {
    if (!source) return

    // 핸들러를 먼저 떼야 close()가 부르는 error 이벤트로 재연결이 또 예약되지 않는다.
    source.onopen = null
    source.onerror = null
    source.close()
    source = null
    connected.value = false
  }

  function scheduleReconnect() {
    const authStore = useAuthStore()

    // 로그아웃 상태면 재연결하지 않는다. 여기서 멈추지 않으면 로그인 화면에서
    // 티켓 요청이 계속 나간다.
    if (!authStore.isAuthenticated) return
    if (reconnectTimer) return

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, reconnectDelayMs)

    reconnectDelayMs = Math.min(reconnectDelayMs * 2, RECONNECT_MAX_MS)
  }

  function disconnect() {
    connectGuard.invalidate()
    connecting = false

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    reconnectDelayMs = RECONNECT_MIN_MS
    closeStream()
  }

  return { lastEvent, connected, connect, disconnect }
})
