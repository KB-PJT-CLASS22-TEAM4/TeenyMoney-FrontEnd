import { ensureAccessToken } from '@/utils/authSession'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL

// 내 알림 최신순 조회 (커서 기반, 10건씩)
export async function getMyNotifications(accessToken, cursor = null) {
  ensureAccessToken(accessToken)

  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  const query = params.toString()

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '알림 목록을 불러오지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 단일 알림 읽음 처리
export async function markNotificationRead(accessToken, notificationId) {
  ensureAccessToken(accessToken)

  if (!notificationId) {
    throw new Error('알림 정보가 없습니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/${notificationId}`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) return { success: true }

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '알림을 읽음 처리하지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 전체 알림 읽음 처리 (현재 페이지에서 가장 최근 알림 id 기준)
export async function markAllNotificationsRead(accessToken, latestNotificationId) {
  ensureAccessToken(accessToken)

  if (!latestNotificationId) {
    throw new Error('알림 정보가 없습니다.')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/${latestNotificationId}/all`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 204) return { success: true }

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '전체 알림을 읽음 처리하지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// FCM 토큰 갱신 (로그인 시 호출)
export async function updateFcmToken(accessToken, fcmToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/fcm-token`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    }
  )

  if (response.status === 204) return { success: true }

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || 'FCM 토큰 갱신에 실패했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 알림 수신 여부 설정 조회
export async function getNotificationSetting(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/setting`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '알림 설정을 불러오지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 알림 수신 여부 설정 변경
export async function updateNotificationSetting(accessToken, settings) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/setting`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(settings),
    }
  )

  if (response.status === 204) return { success: true }

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '알림 설정을 변경하지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 푸시 알림 테스트
export async function sendTestNotification(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/test`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '테스트 알림 전송에 실패했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}

// 읽지 않은 알림 개수 조회
export async function getUnreadNotificationCount(accessToken) {
  ensureAccessToken(accessToken)

  const response = await fetch(
    `${API_BASE_URL}/api/v1/notifications/unread`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const result = await response.json()

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || '읽지 않은 알림 개수를 불러오지 못했습니다.'
    )
    error.status = response.status
    throw error
  }

  return result
}