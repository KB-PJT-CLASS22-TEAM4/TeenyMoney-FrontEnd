import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getPermissions,
  requestPermission,
  updatePermission,
  cancelPermission,
  getPermissionStatus,
} from '@/api/permissions'

export const useAllowRequestStore = defineStore('allowRequest', () => {
  const categoryIds    = ref([])
  const categoryLabels = ref([])
  const reason         = ref('')

  // 오늘 신청한 오늘만 허용 요청 목록 (카테고리별로 항목이 존재, 없으면 빈 배열)
  const todayPermission = ref([])

  // 이번 달 요청 현황
  const monthlyUsedCount      = ref(0)
  const monthlyRemainingCount = ref(0)

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

async function fetchTodayPermission(accessToken , childId) {
  const result = await getPermissions(accessToken , childId)
  console.log('GET 재조회 응답:', JSON.stringify(result))   // ← 추가
  todayPermission.value = result.data ?? []
  return todayPermission.value
}

  async function fetchPermissionStatus(accessToken, childId) {
    const result = await getPermissionStatus(accessToken, childId)
    monthlyUsedCount.value      = result.data?.monthlyUsedCount ?? 0
    monthlyRemainingCount.value = result.data?.monthlyRemainingCount ?? 0
    return result.data
  }

  async function submitPermissionRequest(accessToken, categories, reasonText) {
    const result = await requestPermission(accessToken, { categories, reason: reasonText })
    todayPermission.value = result.data ?? []
    return todayPermission.value
  }

  async function editPermissionRequest(accessToken, permissionId, reasonText) {
  const result = await updatePermission(accessToken, permissionId, reasonText)
  console.log('PATCH 수정 응답:', JSON.stringify(result))   // ← 추가
  if (result.data) {
    todayPermission.value = result.data
  }
  return result.data
}


  async function cancelPermissionRequest(accessToken, permissionId) {
    await cancelPermission(accessToken, permissionId)
    todayPermission.value = []
  }

  return {
    categoryIds, categoryLabels, reason,
    todayPermission,
    monthlyUsedCount, monthlyRemainingCount,
    set, reset,
    fetchTodayPermission, fetchPermissionStatus,
    submitPermissionRequest, editPermissionRequest, cancelPermissionRequest,
  }
})