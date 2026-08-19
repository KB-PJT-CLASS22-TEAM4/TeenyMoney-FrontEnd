<template>
  <div class="page">

    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">
        유해 업소 설정
      </h1>

      <ParentNavActions />
    </header>


    <div class="content">

      <p class="section-title">
        업종별 결제 정책
      </p>


      <!-- 로딩 -->
      <div
        v-if="isLoading"
        class="state-box"
      >
        <p>불러오는 중입니다...</p>
      </div>


      <!-- 에러 -->
      <div v-else-if="errorMessage">
        <p class="error-text">
          {{ errorMessage }}
        </p>
      </div>


      <!-- 정책 목록: 허용/주의/차단 → 상위 토글 → 하위 조회 -->
      <div v-else>
        <div
          v-for="section in policySections"
          :key="section.key"
          class="policy-card"
        >
          <p
            class="policy-label"
            :class="policyClass(section.key)"
          >
            {{ section.label }}
          </p>

          <p
            v-if="section.groups.length === 0"
            class="empty-policy"
          >
            설정된 업종이 없습니다.
          </p>

          <template
            v-for="group in section.groups"
            :key="group.name"
          >
            <div
              v-if="isFlatGroup(group)"
              class="flat-group"
            >
              <p
                v-for="item in group.items"
                :key="item.id"
                class="flat-item"
              >
                {{ item.categoryName }}
                <span
                  v-if="item.temporaryUntil"
                  class="temp-deadline"
                >
                  {{ formatAllowDeadline(item.temporaryUntil) }}
                </span>
              </p>
            </div>

            <div
              v-else
              class="toggle-group"
            >
              <button
                class="toggle-header"
                type="button"
                :aria-expanded="isPolicyGroupExpanded(section.key, group.name)"
                @click="togglePolicyGroup(section.key, group.name)"
              >
                <span class="toggle-title">
                  {{ group.name }}
                </span>
                <span class="toggle-count">
                  {{ group.items.length }}
                </span>
                <img
                  src="@/assets/icons/icon-chevron.svg"
                  alt=""
                  class="toggle-chevron"
                  :class="{
                    open: isPolicyGroupExpanded(section.key, group.name),
                  }"
                />
              </button>

              <div
                v-if="isPolicyGroupExpanded(section.key, group.name)"
                class="toggle-body"
              >
                <p
                  v-for="item in group.items"
                  :key="item.id"
                  class="policy-item"
                >
                  {{ item.categoryName }}
                  <span
                    v-if="item.temporaryUntil"
                    class="temp-deadline"
                  >
                    {{ formatAllowDeadline(item.temporaryUntil) }}
                  </span>
                </p>
              </div>
            </div>
          </template>
        </div>

      </div>


      <!-- 설정한 업소 목록 조회 -->
      <button
        class="list-btn"
        @click="goToPlaceList"
      >
        <span>
          설정한 업소 목록 조회
        </span>

        <img
          src="@/assets/icons/icon-chevron.svg"
          alt=""
          class="chevron-icon"
        />
      </button>


      <!-- 승인 요청 내역 -->
      <div class="request-section">

        <p class="request-title">
          승인 요청 내역
        </p>

        <div class="request-tabs">
          <button
            v-for="tab in requestTabs"
            :key="tab.value"
            class="request-tab"
            :class="{ active: activeRequestTab === tab.value }"
            type="button"
            @click="activeRequestTab = tab.value"
          >
            {{ tab.label }}
            <span
              v-if="tab.count > 0"
              class="tab-count"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>


        <!-- 요청 로딩 -->
        <div
          v-if="isPermissionLoading"
          class="state-box"
        >
          <p>불러오는 중입니다...</p>
        </div>


        <!-- 요청 대기 탭 -->
        <div
          v-else-if="activeRequestTab === 'pending'"
        >
          <div
            v-if="!pendingRequests.length"
            class="empty-request"
          >
            <p>대기 중인 승인 요청이 없습니다.</p>
          </div>

          <div
            v-for="req in pendingRequests"
            :key="requestKey(req)"
            class="request-card"
          >
            <div class="request-top">
              <span class="request-status block">
                요청
              </span>
              <span
                v-if="req.childName"
                class="request-name"
              >
                {{ req.childName }}
              </span>
              <span class="request-time">
                {{ formatRelativeTime(req.createdAt) }}
              </span>
            </div>

            <p class="request-category-hint">
              허용할 업종을 선택한 뒤 승인을 누르면,<br />선택하지 않은 업종은 자동으로 거절됩니다.
            </p>

            <div
              v-if="req.categoryItems.length"
              class="request-category-list"
            >
              <button
                v-for="item in req.categoryItems"
                :key="categoryKey(item)"
                class="category-check"
                type="button"
                :disabled="processingId === req.id"
                @click="toggleCategory(req, item)"
              >
                <span
                  class="checkbox"
                  :class="{ checked: isCategoryChecked(req, item) }"
                >
                  <img
                    v-if="isCategoryChecked(req, item)"
                    src="@/assets/icons/icon-check.svg"
                    alt=""
                    class="check-icon"
                  />
                </span>
                <span class="category-check-label">
                  {{ item.label }}
                </span>
              </button>
            </div>

            <p
              v-if="req.reason"
              class="request-desc"
            >
              {{ req.reason }}
            </p>

            <div class="request-btns">
              <button
                class="btn btn-secondary"
                :disabled="processingId === req.id"
                type="button"
                @click="handleReject(req)"
              >
                거절
              </button>
              <button
                class="btn btn-primary"
                :disabled="processingId === req.id"
                type="button"
                @click="handleAccept(req)"
              >
                승인
              </button>
            </div>
          </div>
        </div>


        <!-- 처리 완료 탭 -->
        <div v-else>
          <div
            v-if="!completedRequests.length"
            class="empty-request"
          >
            <p>처리 완료된 승인 요청이 없습니다.</p>
          </div>

          <div
            v-for="req in completedRequests"
            :key="requestKey(req)"
            class="request-card"
          >
            <div class="request-top">
              <span
                class="request-status"
                :class="req.status === 'APPROVED' ? 'approved' : 'rejected'"
              >
                {{ req.status === 'APPROVED' ? '승인' : '거절' }}
              </span>
              <span
                v-if="req.childName"
                class="request-name"
              >
                {{ req.childName }}
              </span>
              <span class="request-time">
                {{ formatRelativeTime(req.updatedAt || req.createdAt) }}
              </span>
            </div>

            <div
              v-if="req.categories.length"
              class="request-categories"
            >
              <span
                v-for="name in req.categories"
                :key="name"
                class="category-tag"
              >
                {{ name }}
              </span>
            </div>

            <p
              v-if="req.status === 'APPROVED' && formatAllowDeadline()"
              class="temp-deadline"
            >
              {{ formatAllowDeadline() }}
            </p>

            <p
              v-if="req.reason"
              class="request-desc"
            >
              {{ req.reason }}
            </p>
          </div>
        </div>

      </div>

    </div>

    <ParentBottomNav active="child" />
    <AlertHost :modal="alertModal" />

  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import {
  getCategoryPolicyParentGroups
} from '@/api/categoryPolicy'

import {
  getPermissions,
  approvePermission,
  rejectPermission
} from '@/api/permissions'


const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const alertModal = useAlertModal()


// ========================================
// 현재 선택한 자녀 ID
//
// URL 예:
// /parents/harmfulcategory?childId=3
// ========================================
const childId = ref(
  route.query.childId
    ? Number(route.query.childId)
    : null
)


// ========================================
// 카테고리 정책
// ========================================

const parentGroups = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const POLICY_SECTIONS = [
  { key: 'ALLOW', label: '허용' },
  { key: 'CAUTION', label: '주의' },
  { key: 'BLOCK', label: '차단' },
]

function normalizePolicy(policy) {
  return policy === 'WATCH' ? 'CAUTION' : policy
}

function policyClass(policy) {
  if (policy === 'ALLOW') return 'allow'
  if (policy === 'CAUTION' || policy === 'WATCH') return 'caution'
  if (policy === 'BLOCK') return 'block'
  return ''
}

function isFlatGroup(group) {
  return group.name === '기타'
}

function getTodayEnd() {
  const date = new Date()
  date.setHours(24, 0, 0, 0)
  return date
}

function isSameLocalDay(dateValue) {
  const date = parseCreatedAt(dateValue)
  if (!date) return false

  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function formatAllowDeadline(until = getTodayEnd()) {
  const end = until instanceof Date ? until : parseCreatedAt(until)
  if (!end || end.getTime() <= Date.now()) return ''
  return '오늘 24:00까지 허용'
}

function requestKey(req) {
  return (req.permissionIds || [req.id]).join('-')
}

const temporaryAllowMap = computed(() => {
  const map = new Map()
  const until = getTodayEnd()
  if (until.getTime() <= Date.now()) return map

  normalizedRequests.value.forEach((req) => {
    if (req.status !== 'APPROVED') return
    if (req.updatedAt && !isSameLocalDay(req.updatedAt) && !isSameLocalDay(req.createdAt)) {
      return
    }
    if (req.category) map.set(req.category, until)
    req.categories.forEach((name) => map.set(name, until))
  })

  return map
})

function withEffectivePolicy(item) {
  const untilFromPermission = temporaryAllowMap.value.get(item.categoryName) ?? null
  const untilFromPolicy = parseCreatedAt(
    item.expiresAt ?? item.temporaryUntil ?? item.validUntil ?? null
  )
  const temporaryUntil = untilFromPermission || untilFromPolicy
  const isTemp = temporaryUntil && temporaryUntil.getTime() > Date.now()

  return {
    ...item,
    temporaryUntil: isTemp ? temporaryUntil : null,
    effectivePolicy: isTemp ? 'ALLOW' : normalizePolicy(item.policy),
  }
}

const policySections = computed(() =>
  POLICY_SECTIONS.map((section) => ({
    ...section,
    groups: parentGroups.value
      .map((group) => ({
        name: group.name,
        items: group.items
          .map(withEffectivePolicy)
          .filter((item) => item.effectivePolicy === section.key),
      }))
      .filter((group) => group.items.length > 0),
  }))
)

const expandedPolicyGroups = ref({})

function policyGroupKey(policy, name) {
  return `${policy}:${name}`
}

function isPolicyGroupExpanded(policy, name) {
  const key = policyGroupKey(policy, name)
  if (Object.prototype.hasOwnProperty.call(expandedPolicyGroups.value, key)) {
    return !!expandedPolicyGroups.value[key]
  }

  const group = policySections.value
    .find((section) => section.key === policy)
    ?.groups.find((item) => item.name === name)

  return !!group?.items.some((item) => item.temporaryUntil)
}

function togglePolicyGroup(policy, name) {
  const key = policyGroupKey(policy, name)
  expandedPolicyGroups.value = {
    ...expandedPolicyGroups.value,
    [key]: !isPolicyGroupExpanded(policy, name),
  }
}


// ========================================
// 오늘만 허용 요청
// ========================================

const permissionRequests = ref([])
const isPermissionLoading = ref(false)
const activeRequestTab = ref('pending')
const processingId = ref(null)
const selectedByRequestId = ref({})

const normalizedRequests = computed(() =>
  permissionRequests.value
    .map(normalizePermissionRequest)
    .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))
)

const pendingRequests = computed(() =>
  normalizedRequests.value.filter((req) => req.status === 'PENDING')
)

const completedRequests = computed(() =>
  normalizedRequests.value.filter(
    (req) => req.status === 'APPROVED' || req.status === 'REJECTED'
  )
)

const requestTabs = computed(() => [
  {
    label: '요청 대기',
    value: 'pending',
    count: pendingRequests.value.length,
  },
  {
    label: '처리 완료',
    value: 'completed',
    count: completedRequests.value.length,
  },
])


// ========================================
// 시간 포맷
// ========================================

function parseCreatedAt(createdAt) {
  if (!createdAt) return null

  if (Array.isArray(createdAt)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt
    return new Date(year, month - 1, day, hour, minute, second)
  }

  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? null : date
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

function getTimestamp(dateValue) {
  const date = parseCreatedAt(dateValue)
  return date ? date.getTime() : 0
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

function extractCategoryItems(permission) {
  const raw = Array.isArray(permission?.categories)
    ? permission.categories
    : permission?.category
      ? [permission.category]
      : []

  return raw
    .map((item) => {
      if (item == null || item === '') return null

      if (typeof item === 'string' || typeof item === 'number') {
        return {
          id: item,
          label: String(item),
        }
      }

      const id =
        item.id
        ?? item.categoryId
        ?? item.merchantCategoryId
        ?? item.category
        ?? item.categoryName

      const label = getCategoryLabel(item)
      if (id == null && !label) return null

      return {
        id: id ?? label,
        label: label || String(id),
      }
    })
    .filter(Boolean)
}

function extractCategories(permission) {
  if (Array.isArray(permission?.categoryItems) && permission.categoryItems.length) {
    return permission.categoryItems.map((item) => item.label).filter(Boolean)
  }

  return extractCategoryItems(permission).map((item) => item.label).filter(Boolean)
}

function categoryKey(item) {
  return String(item?.id ?? item?.label ?? '')
}

function isCategoryChecked(req, item) {
  const selected = selectedByRequestId.value[requestKey(req)] || []
  return selected.includes(categoryKey(item))
}

function toggleCategory(req, item) {
  const key = requestKey(req)
  const itemKey = categoryKey(item)
  const current = selectedByRequestId.value[key] || []
  const next = current.includes(itemKey)
    ? current.filter((value) => value !== itemKey)
    : [...current, itemKey]

  selectedByRequestId.value = {
    ...selectedByRequestId.value,
    [key]: next,
  }
}

function resolveCategoryId(item) {
  if (typeof item?.id === 'number') return item.id

  const numericId = Number(item?.id)
  if (Number.isFinite(numericId) && String(item.id) === String(numericId)) {
    return numericId
  }

  const found = parentGroups.value
    .flatMap((group) => group.items)
    .find((policy) =>
      policy.categoryName === item.label
      || String(policy.id) === String(item.id)
    )

  return found?.id ?? item.id ?? item.label
}

function normalizePermissionRequest(permission) {
  const categoryItems = Array.isArray(permission.categoryItems) && permission.categoryItems.length
    ? permission.categoryItems
    : extractCategoryItems(permission).map((item) => ({
        ...item,
        permissionId: permission.id,
      }))

  const categories = categoryItems.map((item) => item.label).filter(Boolean)

  return {
    id: permission.id,
    permissionIds: permission.permissionIds || [permission.id],
    childName: permission.child?.name ?? permission.childName ?? '',
    reason: permission.reason ?? '',
    status: permission.status ?? 'PENDING',
    category: categories[0] || '',
    categories,
    categoryItems,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt ?? null,
  }
}

function extractPermissionsList(payload) {
  if (!payload) return []

  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload.permissions)) {
    return payload.permissions
  }

  if (Array.isArray(payload.items)) {
    return payload.items
  }

  if (payload.isExist && payload.permission) {
    return [payload.permission]
  }

  if (payload.permission) {
    return [payload.permission]
  }

  return []
}

function matchesSelectedChild(permission) {
  if (!childId.value) return true

  const permissionChildId = getPermissionChildId(permission)
  if (permissionChildId == null) return true

  return Number(permissionChildId) === Number(childId.value)
}

function mergePermissionRequests(list) {
  const byId = new Map()

  list.forEach((permission) => {
    if (!permission?.id || !matchesSelectedChild(permission)) return

    const existing = byId.get(permission.id)
    if (!existing) {
      byId.set(permission.id, { ...permission })
      return
    }

    const mergedCategories = [
      ...extractCategoryItems(existing),
      ...extractCategoryItems(permission),
    ]
    existing.categories = mergedCategories
    if (!existing.updatedAt && permission.updatedAt) {
      existing.updatedAt = permission.updatedAt
    }
  })

  const groups = new Map()

  Array.from(byId.values()).forEach((permission) => {
    const items = extractCategoryItems(permission).map((item) => ({
      ...item,
      permissionId: permission.id,
    }))
    const timeBucket = Math.floor(getTimestamp(permission.createdAt) / 60000)
    const key = items.length > 1
      ? `id:${permission.id}`
      : `g:${getPermissionChildId(permission) ?? ''}|${permission.reason ?? ''}|${timeBucket}|${permission.status ?? 'PENDING'}`

    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, {
        ...permission,
        categoryItems: items,
        permissionIds: [permission.id],
      })
      return
    }

    existing.permissionIds = [
      ...new Set([...existing.permissionIds, permission.id]),
    ]

    const seen = new Set(existing.categoryItems.map(categoryKey))
    items.forEach((item) => {
      const itemKey = categoryKey(item)
      if (!seen.has(itemKey)) {
        existing.categoryItems.push(item)
        seen.add(itemKey)
      }
    })
  })

  return Array.from(groups.values())
}


// ========================================
// 카테고리 정책 조회
//
// GET /api/v1/category-policies/parent-groups?childId=...
// data: [{ name, categoryPolicyList: [{ id, categoryName, policy }] }]
// ========================================

async function fetchCategoryPolicies() {

  if (!childId.value) {
    errorMessage.value =
      '선택된 자녀 정보가 없습니다.'
    return
  }

  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {

    console.log(
      '카테고리 정책 조회 childId:',
      childId.value
    )

    const res =
      await getCategoryPolicyParentGroups(
        authStore.accessToken,
        childId.value
      )

    console.log(
      '카테고리 정책 응답:',
      res
    )

    parentGroups.value = Array.isArray(res.data)
      ? res.data.map((group) => ({
          name: group.name,
          items: (group.categoryPolicyList || []).map((item) => ({
            id: item.id,
            categoryName: item.categoryName,
            policy: item.policy,
            expiresAt: item.expiresAt ?? item.temporaryUntil ?? item.validUntil ?? null,
          })),
        }))
      : []

  } catch (error) {

    console.error(
      '카테고리 정책 불러오기 실패:',
      error
    )

    errorMessage.value =
      error.message ||
      '정책 정보를 불러오지 못했습니다.'

  } finally {

    isLoading.value = false

  }
}


// ========================================
// 설정한 업소 목록으로 이동
//
// childId를 그대로 넘겨야 함
// ========================================

function goToPlaceList() {

  if (!childId.value) {
    alertModal.showAlert('선택된 자녀 정보가 없습니다.')
    return
  }

  router.push({
    path: '/parents/place-list',

    query: {
      childId: childId.value
    }
  })
}


// ========================================
// 오늘만 허용 요청 조회
// ========================================

async function fetchPermissions() {
  isPermissionLoading.value = true

  try {
    const result = await getPermissions(
      authStore.accessToken,
      childId.value
    )

    permissionRequests.value = mergePermissionRequests(
      extractPermissionsList(result.data)
    )

  } catch (error) {
    console.error(
      '오늘만 허용 요청 불러오기 실패:',
      error
    )

    permissionRequests.value = []

  } finally {
    isPermissionLoading.value = false
  }
}


async function handleAccept(req) {
  const items = req.categoryItems || []
  const selected = new Set(selectedByRequestId.value[requestKey(req)] || [])
  const approvedItems = items.filter((item) => selected.has(categoryKey(item)))
  const rejectedItems = items.filter((item) => !selected.has(categoryKey(item)))

  if (!items.length) {
    alertModal.showAlert('요청된 업종이 없습니다.')
    return
  }

  if (!approvedItems.length) {
    const confirmed = await alertModal.showConfirm(
      '허용할 업종을 선택하지 않았습니다. 요청한 업종을 모두 거절할까요?'
    )
    if (!confirmed) return
    await handleReject(req)
    return
  }

  processingId.value = req.id

  try {
    const byPermission = new Map()

    items.forEach((item) => {
      const permissionId = item.permissionId ?? req.id
      const bucket = byPermission.get(permissionId) || {
        approved: [],
        rejected: [],
      }

      if (selected.has(categoryKey(item))) {
        bucket.approved.push(item)
      } else {
        bucket.rejected.push(item)
      }

      byPermission.set(permissionId, bucket)
    })

    for (const [permissionId, bucket] of byPermission.entries()) {
      if (bucket.approved.length && !bucket.rejected.length) {
        await approvePermission(authStore.accessToken, permissionId)
        continue
      }

      if (!bucket.approved.length && bucket.rejected.length) {
        await rejectPermission(authStore.accessToken, permissionId)
        continue
      }

      await approvePermission(
        authStore.accessToken,
        permissionId,
        bucket.approved.map(resolveCategoryId)
      )
      await rejectPermission(
        authStore.accessToken,
        permissionId,
        bucket.rejected.map(resolveCategoryId)
      )
    }

    await fetchPermissions()
    await fetchCategoryPolicies()
  } catch (error) {
    console.error('승인 실패:', error)
    alertModal.showAlert(error.message || '승인에 실패했습니다.')
  } finally {
    processingId.value = null
  }
}

async function handleReject(req) {
  const permissionIds = [...new Set(req.permissionIds || [req.id])]
  processingId.value = req.id

  try {
    for (const permissionId of permissionIds) {
      await rejectPermission(authStore.accessToken, permissionId)
    }
    await fetchPermissions()
  } catch (error) {
    console.error('거절 실패:', error)
    alertModal.showAlert(error.message || '거절에 실패했습니다.')
  } finally {
    processingId.value = null
  }
}


// ========================================
// 페이지 진입
// ========================================

onMounted(async () => {

  console.log(
    '현재 선택된 childId:',
    childId.value
  )

  if (!authStore.accessToken) {

    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')

    return
  }

  if (!childId.value) {

    errorMessage.value =
      '선택된 자녀 정보가 없습니다.'

    return
  }

  await Promise.all([
    fetchCategoryPolicies(),
    fetchPermissions(),
  ])

})
</script>


<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background-color: #ffffff;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.policy-card {
  background-color: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.policy-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.toggle-title {
  flex: 1;
  min-width: 0;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.toggle-count {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #8b9097;
}

.toggle-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.toggle-chevron.open {
  transform: rotate(90deg);
}

.toggle-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 6px 8px;
}

.flat-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flat-item {
  margin: 0;
  padding: 6px 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.temp-deadline {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #ff9500;
}

.policy-item {
  margin: 0;
  font-size: 14px;
  color: #191b1e;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.policy-badge.allow,
.policy-label.allow {
  color: #34c759;
}

.policy-badge.caution,
.policy-label.caution {
  color: #ff9500;
}

.policy-badge.block,
.policy-label.block {
  color: #ff3b30;
}

.empty-policy {
  margin: 0;
  padding-left: 8px;
  font-size: 13px;
  color: #b9bec5;
}

.error-text {
  color: #ff3b30;
  font-size: 14px;
}

.state-box {
  padding: 20px 0;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.list-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0;
  border: none;
  border-top: 1px solid #f0f1f3;
  border-bottom: 1px solid #f0f1f3;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.chevron-icon {
  width: 18px;
  height: 18px;
}

.request-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #8b9097;
}

.request-tabs {
  display: flex;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f1f3;
}

.request-tab {
  flex: 1;
  height: 40px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.request-tab.active {
  color: #191b1e;
  border-bottom-color: #ffbc00;
}

.tab-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f4f5f7;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
}

.request-tab.active .tab-count {
  background: #fff6dd;
  color: #191b1e;
}

.empty-request {
  padding: 20px 0;
  text-align: center;
  color: #b9bec5;
  font-size: 13px;
}

.request-card {
  background-color: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.request-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-status {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}

.request-status.block {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.request-status.approved {
  background-color: #e8f8ee;
  color: #34c759;
}

.request-status.rejected {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.request-status.caution {
  background-color: #fff3e0;
  color: #ff9500;
}

.request-name {
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
  flex: 1;
}

.request-category-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.request-time {
  margin-left: auto;
  font-size: 12px;
  color: #8b9097;
}

.request-category-hint {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  line-height: 1.5;
}

.request-category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-check {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #eaedf1;
  border-radius: 10px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.category-check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 6px;
  background: #f0f1f3;
}

.checkbox.checked {
  background: #ffbc00;
}

.check-icon {
  width: 14px;
  height: 14px;
}

.category-check-label {
  font-size: 14px;
  font-weight: 600;
  color: #191b1e;
}

.request-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-tag {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: #f4f5f7;
  color: #191b1e;
  font-size: 12px;
  font-weight: 600;
}

.request-desc {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.request-btns {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background-color: #ffffff;
  color: #191b1e;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>