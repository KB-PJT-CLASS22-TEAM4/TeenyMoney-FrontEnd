import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlertModal } from '@/composables/useAlertModal'
import { getChildren } from '@/api/children'
import {
  getPermissions,
  approvePermission,
  rejectPermission,
} from '@/api/permissions'
import {
  getQuests,
  getQuestDetail,
  approveQuestVerification,
  rejectQuestVerification,
} from '@/api/quest'
import {
  getFinancialProductApprovalRequests,
  approveFinancialProductApprovalRequest,
  rejectFinancialProductApprovalRequest,
} from '@/api/financialProducts'
import {
  extractApprovalRequestList,
  normalizeApprovalRequest,
} from '@/utils/financialProductMapper'
import { parseServerDate } from '@/utils/datetime'

export function useParentRequests() {
  const router = useRouter()
  const authStore = useAuthStore()
  const alertModal = useAlertModal()

  const pendingPermissions = ref([])
  const pendingQuests = ref([])
  const pendingFinances = ref([])
  const processingKey = ref('')
  const rejectTarget = ref(null)
  const rejectReason = ref('')

  function extractPermissionsList(payload) {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.permissions)) return payload.permissions
    if (Array.isArray(payload.items)) return payload.items
    if (payload.isExist && payload.permission) return [payload.permission]
    if (payload.permission) return [payload.permission]
    return []
  }

  function getPermissionId(permission) {
    return permission?.id ?? permission?.permissionId ?? null
  }

  function getPermissionChildId(permission) {
    return permission?.childId
      ?? permission?.child?.childId
      ?? permission?.child?.id
      ?? null
  }

  function getCategoryLabel(category) {
    if (typeof category === 'string') return category
    if (typeof category === 'number') return String(category)

    return category?.category
      ?? category?.categoryName
      ?? category?.merchantCategoryName
      ?? category?.name
      ?? ''
  }

  function extractCategories(permission) {
    if (typeof permission?.category === 'string' && permission.category) {
      return [permission.category]
    }

    if (!Array.isArray(permission?.categories)) {
      const single = getCategoryLabel(permission?.category)
      return single ? [single] : []
    }

    return permission.categories.map(getCategoryLabel).filter(Boolean)
  }

  function parseCreatedAt(createdAt) {
    return parseServerDate(createdAt)
  }

  function formatRelativeTime(createdAt) {
    const date = parseCreatedAt(createdAt)
    if (!date) return ''

    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60)

    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}시간 전`

    const diffDays = Math.floor(diffMinutes / 1440)
    return `${diffDays}일 전`
  }

  function formatFinanceMeta(item) {
    const parts = []

    if (item.requestedAmount) {
      parts.push(`${Number(item.requestedAmount).toLocaleString()}원`)
    } else if (item.monthlyAmount) {
      parts.push(`월 ${Number(item.monthlyAmount).toLocaleString()}원`)
    }

    if (item.termMonths) {
      parts.push(`${item.termMonths}개월`)
    }

    if (item.rateText && item.rateText !== '-') {
      parts.push(item.rateText)
    }

    return parts.join(' · ')
  }

  const requests = computed(() => {
    const permissions = pendingPermissions.value.map((permission) => {
      const categories = extractCategories(permission)
      const categoryTitle = permission.category || categories.join(', ')

      return {
        type: 'permission',
        key: `permission-${getPermissionId(permission)}-${categoryTitle}`,
        badge: '요청',
        childName: permission.child?.name || permission.childName || '',
        childId: getPermissionChildId(permission),
        title: categoryTitle || '오늘만 허용 요청',
        detail: permission.reason || '',
        timeLabel: formatRelativeTime(permission.createdAt),
        id: getPermissionId(permission),
      }
    })

    const quests = pendingQuests.value.map((quest) => ({
      type: 'quest',
      key: `quest-${quest.questId}`,
      badge: '인증 대기',
      childName: quest.child?.name || '',
      title: quest.title || '퀘스트 인증 요청',
      detail: quest.rewardAmount != null
        ? `보상 ${Number(quest.rewardAmount).toLocaleString()}원`
        : '',
      timeLabel: formatRelativeTime(
        quest.submittedAt || quest.updatedAt || quest.createdAt
      ),
      questId: quest.questId,
    }))

    const finances = pendingFinances.value.map((item) => ({
      type: 'finance',
      key: `finance-${item.enrollmentId}`,
      badge: '승인 대기',
      childName: item.childName || '',
      childId: item.childId,
      title: item.title || '금융상품 가입 신청',
      detail: formatFinanceMeta(item),
      timeLabel: formatRelativeTime(item.requestedAt),
      productType: item.productType,
      enrollmentId: item.enrollmentId,
    }))

    return [...permissions, ...quests, ...finances]
  })

  async function fetchPendingRequests() {
    if (!authStore.accessToken) return

    try {
      const childrenRes = await getChildren(authStore.accessToken).catch(() => null)
      const children = Array.isArray(childrenRes?.data) ? childrenRes.data : []

      const [permRes, questRes, financeRes] = await Promise.allSettled([
        children.length
          ? Promise.allSettled(
              children.map((child) =>
                getPermissions(authStore.accessToken, child.childId)
              )
            )
          : getPermissions(authStore.accessToken).then((res) => [
              { status: 'fulfilled', value: res },
            ]),
        getQuests(authStore.accessToken, 'ONGOING'),
        getFinancialProductApprovalRequests(
          authStore.accessToken
        ),
      ])

      let permissions = []

      if (permRes.status === 'fulfilled' && Array.isArray(permRes.value)) {
        permissions = permRes.value.flatMap((result, index) => {
          if (result.status !== 'fulfilled') return []
          return extractPermissionsList(result.value.data).map((permission) => ({
            ...permission,
            childName:
              permission.child?.name
              || permission.childName
              || children[index]?.name,
            childId:
              getPermissionChildId(permission)
              || children[index]?.childId,
          }))
        })
      } else if (permRes.status === 'fulfilled') {
        permissions = extractPermissionsList(permRes.value.data)
      }

      pendingPermissions.value = permissions.filter((permission) => {
        const status = permission.status || 'PENDING'
        return status === 'PENDING' && getPermissionId(permission) != null
      })

      const questItems =
        questRes.status === 'fulfilled' && Array.isArray(questRes.value.data?.items)
          ? questRes.value.data.items
          : []

      pendingQuests.value = questItems.filter(
        (quest) => quest.status === 'PENDING'
      )

      if (financeRes.status === 'fulfilled') {
        pendingFinances.value = extractApprovalRequestList(financeRes.value.data)
          .map((item) => normalizeApprovalRequest(item))
          .filter((item) => item.isPending)
          .map((item) => {
            const matched = children.find(
              (child) => Number(child.childId) === Number(item.childId)
            )
            return {
              ...item,
              childName: item.childName && item.childName !== '자녀'
                ? item.childName
                : (matched?.name || item.childName),
            }
          })
      } else {
        pendingFinances.value = []
      }
    } catch (error) {
      console.error('요청 조회 실패:', error)
    }
  }

  async function findVerificationId(questId) {
    const res = await getQuestDetail(questId, authStore.accessToken)
    const verificationId = res.data?.latestVerification?.verificationId
    if (verificationId == null) {
      throw new Error('인증 요청 정보를 찾을 수 없습니다.')
    }
    return verificationId
  }

  async function openRequestDetail(item) {
    if (item.type === 'permission' && item.childId) {
      router.push({
        name: 'parents-harmful-category',
        query: { childId: item.childId },
      })
      return
    }

    if (item.type === 'quest') {
      if (item.questId == null) {
        alertModal.showAlert('인증 요청을 열 수 없습니다.')
        return
      }

      router.push({
        name: 'quest-detail',
        params: {
          questId: item.questId,
        },
      })
      return
    }

    if (item.type === 'finance' && item.childId) {
      router.push({
        name: 'parents-child-finance',
        params: {
          childId: item.childId,
        },
      })
    }
  }

  async function handleApproveRequest(item) {
    if (processingKey.value) return

    if (item.type === 'quest') {
      const confirmed = await alertModal.showConfirm(
        `"${item.title}" 인증을 승인하시겠습니까?`
      )
      if (!confirmed) return
    }

    if (item.type === 'finance') {
      const confirmed = await alertModal.showConfirm(
        `${item.childName || '자녀'}님의 ${item.title} 가입을 승인할까요?`
      )
      if (!confirmed) return
    }

    processingKey.value = item.key

    try {
      if (item.type === 'permission') {
        await approvePermission(authStore.accessToken, item.id)
        pendingPermissions.value = pendingPermissions.value.filter(
          (permission) => getPermissionId(permission) !== item.id
        )
      } else if (item.type === 'finance') {
        await approveFinancialProductApprovalRequest(
          authStore.accessToken,
          item.productType,
          item.enrollmentId
        )
        pendingFinances.value = pendingFinances.value.filter(
          (finance) => finance.enrollmentId !== item.enrollmentId
        )
      } else {
        const verificationId = await findVerificationId(item.questId)
        await approveQuestVerification(
          item.questId,
          verificationId,
          authStore.accessToken
        )
        pendingQuests.value = pendingQuests.value.filter(
          (quest) => quest.questId !== item.questId
        )
      }
    } catch (error) {
      console.error('요청 승인 실패:', error)
      alertModal.showAlert(error.message || '승인에 실패했습니다.')
    } finally {
      processingKey.value = ''
    }
  }

  async function handleRejectRequest(item) {
    if (item.type === 'quest') {
      rejectTarget.value = item
      rejectReason.value = ''
      return
    }

    if (processingKey.value) return

    if (item.type === 'finance') {
      const confirmed = await alertModal.showConfirm(
        `${item.childName || '자녀'}님의 ${item.title} 가입을 거절할까요?`
      )
      if (!confirmed) return
    }

    processingKey.value = item.key

    try {
      if (item.type === 'finance') {
        await rejectFinancialProductApprovalRequest(
          authStore.accessToken,
          item.productType,
          item.enrollmentId
        )
        pendingFinances.value = pendingFinances.value.filter(
          (finance) => finance.enrollmentId !== item.enrollmentId
        )
      } else {
        await rejectPermission(authStore.accessToken, item.id)
        pendingPermissions.value = pendingPermissions.value.filter(
          (permission) => getPermissionId(permission) !== item.id
        )
      }
    } catch (error) {
      console.error('요청 거절 실패:', error)
      alertModal.showAlert(error.message || '거절에 실패했습니다.')
    } finally {
      processingKey.value = ''
    }
  }

  function closeRejectModal() {
    rejectTarget.value = null
    rejectReason.value = ''
  }

  async function submitQuestReject() {
    const item = rejectTarget.value
    const reason = rejectReason.value.trim()
    if (!item) return

    if (!reason) {
      alertModal.showAlert('거절 사유를 입력해 주세요.')
      return
    }

    processingKey.value = item.key

    try {
      const verificationId = await findVerificationId(item.questId)
      await rejectQuestVerification(
        item.questId,
        verificationId,
        reason,
        authStore.accessToken
      )
      pendingQuests.value = pendingQuests.value.filter(
        (quest) => quest.questId !== item.questId
      )
      closeRejectModal()
    } catch (error) {
      console.error('퀘스트 거절 실패:', error)
      alertModal.showAlert(error.message || '거절에 실패했습니다.')
    } finally {
      processingKey.value = ''
    }
  }

  return {
    alertModal,
    requests,
    processingKey,
    rejectTarget,
    rejectReason,
    fetchPendingRequests,
    openRequestDetail,
    handleApproveRequest,
    handleRejectRequest,
    closeRejectModal,
    submitQuestReject,
  }
}
