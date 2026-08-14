import { useAuthStore } from '@/stores/auth'
import { handleUnauthorizedResponse } from '@/utils/authSession'

const PUBLIC_ROUTE_NAMES = new Set([
  'home',
  'login',
  'signup',
])

export function isPublicRoute(route) {
  if (!route) return false
  if (route.meta?.public) return true
  return PUBLIC_ROUTE_NAMES.has(route.name)
}

export function setupFetchAuthInterceptor() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init)
    const url = typeof input === 'string'
      ? input
      : input?.url

    handleUnauthorizedResponse(response, url)
    return response
  }
}

export function setupAuthRouterGuard(router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (!isPublicRoute(to) && !authStore.isAuthenticated) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    }
    // 어느 경우든 네비게이션을 막지 않으므로 return 값 없이(undefined) 그대로 통과
  })
}