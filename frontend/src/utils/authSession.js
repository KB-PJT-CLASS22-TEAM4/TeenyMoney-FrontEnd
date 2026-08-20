import { useAuthStore } from '@/stores/auth'

export function ensureAccessToken(accessToken) {
  if (!accessToken) {
    const authStore = useAuthStore()
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    throw new Error('LOGIN_REQUIRED')
  }

  return accessToken
}

const PUBLIC_AUTH_API_PATHS = [
  '/api/v1/auth/phone-verification/',
  '/api/v1/auth/legal-guardian-verification/',
  '/api/v1/auth/check-email',
  '/api/v1/auth/signup',
]

const PUBLIC_PAGE_PATHS = ['/login', '/signup', '/']

export function isPublicAuthApiUrl(url) {
  if (typeof url !== 'string') return false
  return PUBLIC_AUTH_API_PATHS.some((path) => url.includes(path))
}

export function isAuthApiUrl(url) {
  return typeof url === 'string'
    && url.includes('/api/v1/')
    && !url.includes('/api/v1/auth/')
}

export function isPublicPagePath(pathname = window.location.pathname) {
  return PUBLIC_PAGE_PATHS.some((path) => (
    path === '/'
      ? pathname === '/'
      : pathname === path || pathname.startsWith(`${path}/`)
  ))
}

export function handleUnauthorizedResponse(response, url) {
  if (isPublicAuthApiUrl(url) || !isAuthApiUrl(url)) return
  if (response.status !== 401 && response.status !== 403) return
  if (isPublicPagePath()) return

  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    authStore.handleUnauthorized(
      '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
    )
    return
  }

  authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
}
