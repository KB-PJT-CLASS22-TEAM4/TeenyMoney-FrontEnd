import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { isAccessTokenExpired } from '@/utils/authSession'

// 앱이 다시 앞으로 나올 때, access가 만료된 경우에만 재발급하고 화면을 다시 부른다.
// 아직 유효하면 reissue를 치지 않는다. 탭 전환마다 쿠키 재발급이 401 나는 것을 막는다.
export function useRefreshOnVisible(load) {
  const authStore = useAuthStore()

  const onVisible = async () => {
    if (document.visibilityState !== 'visible') return
    if (!authStore.isAuthenticated) return

    if (isAccessTokenExpired(authStore.accessToken)) {
      await authStore.refreshAccessToken().catch(() => {})
    }

    load()
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisible))
  onUnmounted(() => document.removeEventListener('visibilitychange', onVisible))
}
