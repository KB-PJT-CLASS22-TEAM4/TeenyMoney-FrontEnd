import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const memberId = ref(null)
  const role = ref(null)
  const name = ref(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function setUser(data) {
    accessToken.value = data.accessToken
    memberId.value = data.memberId
    role.value = data.role
    name.value = data.name
  }

  function clearUser() {
    accessToken.value = null
    memberId.value = null
    role.value = null
    name.value = null
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