import { formatKstDate } from '@/utils/datetime'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/terms`

async function parseJsonSafe(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function assertSuccess(response, result, fallbackMessage) {
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || fallbackMessage)
  }
}

export async function getTerms() {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const result = await parseJsonSafe(response)
  assertSuccess(response, result, '약관 목록을 불러오지 못했습니다.')

  return Array.isArray(result?.data) ? result.data : []
}

export async function getTermByCode(code) {
  if (!code) {
    throw new Error('약관 코드가 없습니다.')
  }

  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(code)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  const result = await parseJsonSafe(response)
  assertSuccess(response, result, '약관 내용을 불러오지 못했습니다.')

  return result?.data ?? null
}

export function isRequiredTerm(term) {
  return Boolean(term?.isRequired)
}

export function formatTermsVersion(term) {
  if (term?.version == null || term.version === '') {
    return '1.0'
  }

  return String(term.version)
}

export function formatEffectiveAt(value) {
  if (!value) {
    return ''
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }

  if (typeof value === 'string') {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('.')
  }

  return ''
}

export function findServiceTerm(terms = []) {
  return (
    terms.find((term) => /SERVICE/i.test(term.code || '')) ||
    terms.find((term) => /이용약관/.test(term.title || '')) ||
    terms.find((term) => isRequiredTerm(term)) ||
    null
  )
}

export function findPrivacyTerm(terms = []) {
  return (
    terms.find((term) => /PRIVACY|PERSONAL/i.test(term.code || '')) ||
    terms.find((term) => /개인정보/.test(term.title || '')) ||
    terms.filter((term) => isRequiredTerm(term))[1] ||
    null
  )
}
