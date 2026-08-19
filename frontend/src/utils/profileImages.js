export const PARENT_PROFILE_IMAGE = new URL(
  '@/assets/mascot/teeny-parent.png',
  import.meta.url,
).href

export const CHILD_PROFILE_IMAGE = new URL(
  '@/assets/mascot/teeny-child.png',
  import.meta.url,
).href

const REMOTE_DEFAULT_PROFILE_RE =
  /rabbit|bunny|placeholder|default[-_./]?profile|default[-_./]?image/i

function isRemoteDefaultProfile(url) {
  return REMOTE_DEFAULT_PROFILE_RE.test(url)
}

export function resolveProfileImageUrl(url, fallback = PARENT_PROFILE_IMAGE) {
  if (typeof url !== 'string') {
    return fallback
  }

  const trimmed = url.trim()
  if (!trimmed || isRemoteDefaultProfile(trimmed)) {
    return fallback
  }

  if (
    trimmed.startsWith('http://')
    || trimmed.startsWith('https://')
    || trimmed.startsWith('blob:')
    || trimmed.startsWith('data:')
  ) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    const apiBase = import.meta.env.DEV
      ? ''
      : (import.meta.env.VITE_API_BASE_URL || '')
    return `${apiBase}${trimmed}`
  }

  return trimmed
}

export const CHILD_DETAIL_MASCOT = new URL(
  '@/assets/mascot/teeny-run.png',
  import.meta.url,
).href
