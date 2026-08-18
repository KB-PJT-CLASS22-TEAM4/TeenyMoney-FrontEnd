import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { requestFcmToken } from '@/firebase'
import { updateFcmToken } from '@/api/notification'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken'))
  const memberId = ref(localStorage.getItem('memberId'))
  const role = ref(localStorage.getItem('role'))
  const name = ref(localStorage.getItem('name'))

  const loginModalVisible = ref(false)
  const loginModalMessage = ref('서비스를 이용하려면 로그인해 주세요.')

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function setUser(data) {
    accessToken.value = data.accessToken
    memberId.value = data.memberId
    role.value = data.role
    name.value = data.name

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('memberId', String(data.memberId))
    localStorage.setItem('role', data.role)
    localStorage.setItem('name', data.name)

    closeLoginModal()

    // 로그인 성공 후 FCM 토큰 발급 + 서버 등록 (실패해도 로그인 흐름에는 영향 없음)
    registerFcmToken()
  }

  async function registerFcmToken() {
    try {
      const fcmToken = await requestFcmToken()
      if (!fcmToken) return
      await updateFcmToken(accessToken.value, fcmToken)
    } catch (e) {
      console.log('FCM 토큰 등록 실패:', e.message)
    }
  }

  function clearUser() {
    accessToken.value = null
    memberId.value = null
    role.value = null
    name.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('memberId')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
  }

  function openLoginModal(
    message = '서비스를 이용하려면 로그인해 주세요.'
  ) {
    loginModalMessage.value = message
    loginModalVisible.value = true
  }

  function closeLoginModal() {
    loginModalVisible.value = false
  }

  function handleUnauthorized(
    message = '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
  ) {
    clearUser()
    openLoginModal(message)
  }

  return {
    accessToken,
    memberId,
    role,
    name,
    loginModalVisible,
    loginModalMessage,
    isAuthenticated,
    setUser,
    clearUser,
    openLoginModal,
    closeLoginModal,
    handleUnauthorized,
  }
})