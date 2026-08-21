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

export function isSignupPagePath(pathname = window.location.pathname) {
  return pathname === '/signup' || pathname.startsWith('/signup/')
}

export function shouldOmitLoginSession(url, pathname = window.location.pathname) {
  return isPublicAuthApiUrl(url) || isSignupPagePath(pathname)
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

export function shouldAttemptTokenReissue(response, url) {
  if (shouldOmitLoginSession(url) || !isAuthApiUrl(url)) return false
  if (response.status !== 401) return false
  if (isPublicPagePath()) return false
  return true
}

export function isAccessTokenExpired(token, skewMs = 15000) {
  if (!token || typeof token !== 'string') return true

  const parts = token.split('.')
  if (parts.length < 2) return false

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded))
    if (!payload.exp) return false
    return payload.exp * 1000 <= Date.now() + skewMs
  } catch {
    return false
  }
}
