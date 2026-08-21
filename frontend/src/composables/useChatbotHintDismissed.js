import { reactive } from 'vue'

// sessionStorage에 저장해서 새로고침에도 유지되고, 탭/앱을 완전히 닫으면 초기화된다.
// 문구별로 따로 기억해야 탭마다 다른 안내 문구(QuestList 등)가 서로의 닫힘 상태에
// 영향을 주지 않는다.
const STORAGE_KEY = 'chatbotDismissedHints'

function loadDismissedHints() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const dismissedHints = reactive(loadDismissedHints())

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissedHints]))
  } catch {
    // 세션 저장소를 못 쓰는 환경(사생활 보호 모드 등)이면 메모리 상태만으로 동작한다.
  }
}

// 로그아웃 시 auth 스토어의 clearUser()에서 호출한다. 계정이 바뀔 수 있으므로
// 같은 탭 안에서도 로그인 세션이 끝나면 안내 문구를 다시 보여준다.
export function resetDismissedHints() {
  dismissedHints.clear()
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // 세션 저장소를 못 쓰는 환경이면 메모리 상태만 지워도 충분하다.
  }
}

export function useChatbotHintDismissed() {
  function isDismissed(hintText) {
    return dismissedHints.has(hintText)
  }

  function dismiss(hintText) {
    dismissedHints.add(hintText)
    persist()
  }

  return { isDismissed, dismiss }
}
