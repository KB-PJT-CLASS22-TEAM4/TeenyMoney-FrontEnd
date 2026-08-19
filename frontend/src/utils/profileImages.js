export const PARENT_PROFILE_IMAGE = new URL(
  '@/assets/mascot/teeny-parent.png',
  import.meta.url,
).href

export const CHILD_PROFILE_IMAGE = new URL(
  '@/assets/mascot/teeny-child.png',
  import.meta.url,
).href

const REMOTE_DEFAULT_PROFILE_RE =
  /rabbit|bunny|placeholder|mascot|character|dummy|sample|default[-_./]?profile|default[-_./]?image|[/_-]default(\.|[/_-]|$)/i

function isRemoteDefaultProfile(url) {
  return REMOTE_DEFAULT_PROFILE_RE.test(url)
}

export function pickProfileImageUrl(source) {
  if (typeof source === 'string') {
    return source
  }

  if (!source || typeof source !== 'object') {
    return ''
  }

  return (
    source.profileImageUrl
    || source.profileImage
    || source.imageUrl
    || source.profileUrl
    || ''
  )
}

export function profileImageKey(url) {
  const trimmed = String(url || '').trim()
  if (!trimmed) {
    return ''
  }

  try {
    const parsed = new URL(trimmed, 'https://local.invalid')
    return `${parsed.host}${parsed.pathname}`.toLowerCase()
  } catch {
    return trimmed.toLowerCase()
  }
}

export function getSharedDefaultProfileKeys(urls) {
  const counts = new Map()

  for (const url of urls) {
    const key = profileImageKey(url)
    if (!key) {
      continue
    }
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([key]) => key)
}

export function resolveProfileImageUrl(
  url,
  fallback = PARENT_PROFILE_IMAGE,
  sharedDefaultKeys = []
) {
  if (typeof url !== 'string') {
    return fallback
  }

  const trimmed = url.trim()
  if (!trimmed || isRemoteDefaultProfile(trimmed)) {
    return fallback
  }

  const key = profileImageKey(trimmed)
  if (key && sharedDefaultKeys.includes(key)) {
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
