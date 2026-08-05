import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken'))
  const memberId = ref(localStorage.getItem('memberId'))
  const role = ref(localStorage.getItem('role'))
  const name = ref(localStorage.getItem('name'))

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

  return {
    accessToken,
    memberId,
    role,
    name,
    isAuthenticated,
    setUser,
    clearUser,
  }
})