import { useAuthStore } from '@/stores/auth'

export function ensureAccessToken(accessToken) {
  if (!accessToken) {
    const authStore = useAuthStore()
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    throw new Error('LOGIN_REQUIRED')
  }

  return accessToken
}

export function isAuthApiUrl(url) {
  return typeof url === 'string'
    && url.includes('/api/v1/')
    && !url.includes('/api/v1/auth/')
}

export function handleUnauthorizedResponse(response, url) {
  if (!isAuthApiUrl(url)) return
  if (response.status !== 401 && response.status !== 403) return

  const publicPaths = ['/login', '/signup', '/']
  if (publicPaths.includes(window.location.pathname)) return

  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    authStore.handleUnauthorized(
      '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
    )
    return
  }

  authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
}
