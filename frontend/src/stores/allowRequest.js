import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPermissions, requestPermission, updatePermission, cancelPermission } from '@/api/permissions'

export const useAllowRequestStore = defineStore('allowRequest', () => {
  const categoryIds    = ref([])
  const categoryLabels = ref([])
  const reason         = ref('')

  // 오늘 신청한 오늘만 허용 (없으면 null)
  const todayPermission = ref(null)

  function set(ids, labels, text) {
    categoryIds.value    = ids
    categoryLabels.value = labels
    reason.value         = text
  }

  function reset() {
    categoryIds.value    = []
    categoryLabels.value = []
    reason.value         = ''
  }

  async function fetchTodayPermission(accessToken) {
    const result = await getPermissions(accessToken)
    todayPermission.value = result.data.isExist ? result.data.permission : null
    return todayPermission.value
  }

  async function submitPermissionRequest(accessToken, categories, reasonText) {
    const result = await requestPermission(accessToken, { categories, reason: reasonText })
    todayPermission.value = result.data.isExist ? result.data.permission : null
    return todayPermission.value
  }

  async function editPermissionRequest(accessToken, permissionId, categories, reasonText) {
    const result = await updatePermission(accessToken, permissionId, { categories, reason: reasonText })
    if (result.data) {
      todayPermission.value = result.data.isExist ? result.data.permission : null
    }
    return todayPermission.value
  }

  async function cancelPermissionRequest(accessToken, permissionId) {
    await cancelPermission(accessToken, permissionId)
    todayPermission.value = null
  }

  return {
    categoryIds, categoryLabels, reason,
    todayPermission,
    set, reset,
    fetchTodayPermission, submitPermissionRequest, editPermissionRequest, cancelPermissionRequest,
  }
})