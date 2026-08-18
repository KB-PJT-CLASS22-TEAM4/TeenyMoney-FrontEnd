import { useAuthStore } from '@/stores/auth'
import { handleUnauthorizedResponse } from '@/utils/authSession'

const PUBLIC_ROUTE_NAMES = new Set([
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

    if (isPublicRoute(to) || authStore.isAuthenticated) {
      return true
    }

    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return true
  })
}