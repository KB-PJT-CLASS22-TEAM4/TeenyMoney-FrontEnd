import { useAuthStore } from '@/stores/auth'
import {
  isAuthApiUrl,
  shouldAttemptTokenReissue,
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
  if (input instanceof URL) return input.href
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

function withAccessToken(init = {}, token, extra = {}) {
  const headers = new Headers(init.headers || {})
  headers.set('Authorization', `Bearer ${token}`)

  return {
    ...init,
    ...extra,
    headers,
  }
}

export function setupFetchAuthInterceptor() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init = {}) => {
    const url = getRequestUrl(input)
    const alreadyRetried = init.__authRetried === true
    const safeInit = { ...init }
    delete safeInit.__authRetried

    let nextInit = shouldOmitLoginSession(url)
      ? withoutLoginSession(input, safeInit)
      : safeInit

    const authStore = useAuthStore()

    if (
      !shouldOmitLoginSession(url)
      && isAuthApiUrl(url)
      && authStore.accessToken
    ) {
      nextInit = withAccessToken(nextInit, authStore.accessToken)
    }

    const response = await originalFetch(input, nextInit)

    if (alreadyRetried || !shouldAttemptTokenReissue(response, url)) {
      return response
    }

    if (!authStore.isAuthenticated) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
      return response
    }

    try {
      const token = await authStore.refreshAccessToken()
      const retryInput = input instanceof Request ? input.url : input
      return originalFetch(
        retryInput,
        withAccessToken(nextInit, token, { __authRetried: true }),
      )
    } catch (error) {
      if (error?.status === 401) {
        await authStore.handleUnauthorized(
          '로그인이 만료되었습니다.\n다시 로그인해 주세요.',
        )
      }
      return response
    }
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
