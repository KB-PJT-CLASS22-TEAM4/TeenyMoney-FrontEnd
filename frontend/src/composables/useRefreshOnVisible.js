import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// 앱이 다시 앞으로 나올 때 토큰을 먼저 갱신하고 화면 데이터를 다시 부른다.
// 순서가 중요하다. 반대면 만료된 토큰으로 요청이 나가 401이 난다.
export function useRefreshOnVisible(load) {
  const authStore = useAuthStore()

  const onVisible = async () => {
    if (document.visibilityState !== 'visible') return
    if (!authStore.isAuthenticated) return
    await authStore.refreshAccessToken().catch(() => {})
    load()
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisible))
  onUnmounted(() => document.removeEventListener('visibilitychange', onVisible))
}
