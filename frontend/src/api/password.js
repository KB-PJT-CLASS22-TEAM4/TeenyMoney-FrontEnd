import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

const BASE_URL = `${API_BASE_URL}/api/v1/members/me`
const PASSWORD_SET_KEY = 'teeny.paymentPasswordSet'
const PASSWORD_VALUE_KEY = 'teeny.paymentPasswordValue'

function currentMemberId() {
  return localStorage.getItem('memberId') || ''
}

function passwordValueKey(memberId = currentMemberId()) {
  return memberId
    ? `${PASSWORD_VALUE_KEY}.${memberId}`
    : PASSWORD_VALUE_KEY
}

export function markPaymentPasswordSet() {
  try {
    localStorage.setItem(PASSWORD_SET_KEY, 'true')
  } catch {
    // ignore storage errors
  }
}

export function isPaymentPasswordMarkedSet() {
  try {
    return localStorage.getItem(PASSWORD_SET_KEY) === 'true'
      || Boolean(getStoredPaymentPassword())
  } catch {
    return false
  }
}

export function savePaymentPassword(password, memberId = currentMemberId()) {
  const pin = String(password ?? '')

  try {
    if (pin) {
      localStorage.setItem(passwordValueKey(memberId), pin)
    }
    localStorage.setItem(PASSWORD_SET_KEY, 'true')
  } catch {
    // ignore storage errors
  }
}

export function getStoredPaymentPassword(memberId = currentMemberId()) {
  try {
    const scoped = localStorage.getItem(passwordValueKey(memberId))
    if (scoped) return scoped
    return localStorage.getItem(PASSWORD_VALUE_KEY) || ''
  } catch {
    return ''
  }
}

export function clearStoredPaymentPassword(memberId = currentMemberId()) {
  try {
    localStorage.removeItem(PASSWORD_SET_KEY)
    localStorage.removeItem(PASSWORD_VALUE_KEY)
    if (memberId) {
      localStorage.removeItem(passwordValueKey(memberId))
    }
  } catch {
    // ignore storage errors
  }
}

export function isPasswordNotSetMessage(message) {
  return /설정되지 않았|등록되지 않았|먼저 설정/.test(String(message ?? ''))
}

function extractPasswordFromResponse(data) {
  if (data == null) return ''
  if (typeof data === 'string' || typeof data === 'number') {
    const pin = String(data)
    return /^\d{4,8}$/.test(pin) ? pin : ''
  }

  const value =
    data.password ??
    data.paymentPassword ??
    data.pin ??
    data.currentPassword

  if (value == null) return ''
  const pin = String(value)
  return /^\d{4,8}$/.test(pin) ? pin : ''
}

function readPasswordSetFlag(data) {
  if (typeof data === 'boolean') return data
  if (data == null) return true

  if (typeof data.hasPassword === 'boolean') return data.hasPassword
  if (typeof data.registered === 'boolean') return data.registered
  if (typeof data.exists === 'boolean') return data.exists
  if (typeof data.isRegistered === 'boolean') return data.isRegistered
  if (typeof data.isSet === 'boolean') return data.isSet

  return true
}

function isUnavailableVerifyResponse(status, message) {
  return (
    (status === 404 || status === 405) &&
    !/비밀번호|일치|잘못/.test(String(message ?? ''))
  )
}

// 결제 비밀번호 최초 등록
// POST /api/v1/members/me/payment-password
export async function registerPaymentPassword(accessToken, password) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${BASE_URL}/payment-password`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
        body: JSON.stringify({ password: String(password) }),
    }
  )

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result.success === false) {
    if (/이미/.test(result.message || '')) {
      markPaymentPasswordSet()
    }

    throw new Error(result.message || '결제 비밀번호 등록에 실패했습니다.')
  }

  savePaymentPassword(password)
  return result
}

// 결제 비밀번호 설정 여부
// GET /api/v1/members/me/payment-password
export async function hasPaymentPassword(accessToken) {
  if (getStoredPaymentPassword() || isPaymentPasswordMarkedSet()) {
    return true
  }

  ensureAccessToken(accessToken)

  const response = await fetch(
    `${BASE_URL}/payment-password`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) {
    markPaymentPasswordSet()
    return true
  }

  if (response.status === 404 || response.status === 405) {
    return Boolean(getStoredPaymentPassword())
  }

  let result
  try {
    result = await response.json()
  } catch {
    return Boolean(getStoredPaymentPassword())
  }

  const remotePassword = extractPasswordFromResponse(result.data)
  if (remotePassword) {
    savePaymentPassword(remotePassword)
    return true
  }

  if (!response.ok || result.success === false) {
    if (isPasswordNotSetMessage(result.message)) {
      return false
    }

    return Boolean(getStoredPaymentPassword())
  }

  const isSet = readPasswordSetFlag(result.data)
  if (isSet) markPaymentPasswordSet()
  return isSet
}

// 결제 비밀번호 일치/불일치 검증
export async function verifyPaymentPassword(accessToken, password) {
  ensureAccessToken(accessToken)

  const input = String(password ?? '')
  const stored = getStoredPaymentPassword()

  if (stored) {
    if (stored !== input) {
      throw new Error('결제 비밀번호가 일치하지 않습니다.')
    }
  }

  const response = await fetch(
    `${BASE_URL}/payment-password/verify`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password: input }),
    }
  )

  let result = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (isUnavailableVerifyResponse(response.status, result?.message)) {
    if (stored && stored === input) {
      return { success: true, matched: true }
    }

    if (!stored) {
      throw new Error(
        '등록된 결제 비밀번호를 확인할 수 없습니다. 마이페이지에서 다시 설정해 주세요.'
      )
    }
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || '결제 비밀번호가 일치하지 않습니다.')
  }

  if (!stored) {
    savePaymentPassword(input)
  }

  return result ?? { success: true, matched: true }
}
