import { useAuthStore } from '@/stores/auth'
import {
  handleUnauthorizedResponse,
  shouldOmitLoginSession,
} from '@/utils/authSession'

const PUBLIC_ROUTE_NAMES = new Set([
  'login',
  'signup',
])

export function isPublicRoute(route) {
  if (!route) return false
  if (route.meta?.public) return true
  return PUBLIC_ROUTE_NAMES.has(route.name)
}

function getRequestUrl(input) {
  if (typeof input === 'string') return input
  return input?.url
}

function withoutLoginSession(input, init = {}) {
  const headers = new Headers(
    init.headers || (input instanceof Request ? input.headers : undefined),
  )
  headers.delete('Authorization')

  return {
    ...init,
    headers,
    credentials: 'omit',
  }
}

export function setupFetchAuthInterceptor() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const url = getRequestUrl(input)
    const nextInit = shouldOmitLoginSession(url)
      ? withoutLoginSession(input, init)
      : init
    const response = await originalFetch(input, nextInit)

    if (!shouldOmitLoginSession(url)) {
      handleUnauthorizedResponse(response, url)
    }

    return response
  }
}

export function setupAuthRouterGuard(router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.name === 'signup') {
      authStore.clearUser()
      authStore.closeLoginModal()
    }

    if (isPublicRoute(to) || authStore.isAuthenticated) {
      return true
    }

    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return true
  })
}