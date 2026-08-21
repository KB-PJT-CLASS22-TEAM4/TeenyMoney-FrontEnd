<template>
  <div
    class="page"
    :class="{ 'has-save': isDirty }"
  >

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
        업종별 결제 제한
      </h1>

      <ParentNavActions />
    </header>


    <div class="content">

      <div class="section-head">
        <p class="section-title">
          업종별 결제 정책
        </p>
        <p class="section-sub">
          등급을 고르면 바로 확인하고 바꿀 수 있어요
        </p>
      </div>


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


      <!-- 정책 목록: 허용/주의/차단 등급별로 조회 -->
      <div
        v-else
        class="policy-board"
      >
        <div class="grade-tabs">
          <button
            v-for="section in policySections"
            :key="section.key"
            class="grade-tab"
            :class="[
              policyClass(section.key),
              { on: activePolicyTab === section.key },
            ]"
            type="button"
            @click="activePolicyTab = section.key"
          >
            <span class="grade-tab-label">
              {{ section.label }}
            </span>
            <span class="grade-tab-count">
              {{ section.count }}
            </span>
          </button>
        </div>

        <div
          class="policy-panel"
          :class="policyClass(activePolicyTab)"
        >
          <div class="search-wrap">
            <img
              src="@/assets/icons/icon-search.svg"
              alt=""
              class="search-icon"
            />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="업종을 검색해보세요"
            />
          </div>

          <p
            v-if="filteredGroups.length === 0"
            class="empty-policy"
          >
            {{ emptyFilterText }}
          </p>

          <section
            v-for="group in filteredGroups"
            :key="group.name"
            class="place-group"
          >
            <div
              v-if="!isFlatGroup(group)"
              class="group-head"
            >
              <div class="group-title-row">
                <p class="group-title">
                  {{ group.name }}
                </p>
                <button
                  class="group-count"
                  :class="{ open: isGroupExpanded(group.name) }"
                  type="button"
                  :aria-expanded="isGroupExpanded(group.name)"
                  @click="toggleGroup(group.name)"
                >
                  {{ group.items.length }}
                  <img
                    src="@/assets/icons/icon-chevron.svg"
                    alt=""
                    class="group-count-chevron"
                  />
                </button>
              </div>

              <div class="place-btns group-btns">
                <button
                  class="status-btn"
                  type="button"
                  :class="{ 'active-allow': isGroupAllowActive(group) }"
                  @click="setGroupStatus(group, 'ALLOW')"
                >
                  허용
                </button>
                <button
                  class="status-btn"
                  type="button"
                  :class="{ 'active-caution': isGroupCautionActive(group) }"
                  @click="setGroupStatus(group, 'WATCH')"
                >
                  주의
                </button>
                <button
                  class="status-btn"
                  type="button"
                  :class="{ 'active-block': isGroupBlockActive(group) }"
                  @click="setGroupStatus(group, 'BLOCK')"
                >
                  차단
                </button>
              </div>
            </div>

            <div
              class="place-panel"
              :class="{
                open: isFlatGroup(group) || isGroupExpanded(group.name),
              }"
            >
              <div class="place-list">
              <div
                v-for="place in group.items"
                :key="place.id"
                class="place-row"
              >
                <p class="place-name">
                  {{ place.categoryName }}
                  <span
                    v-if="place.temporaryUntil"
                    class="temp-deadline"
                  >
                    오늘만
                  </span>
                </p>

                <div class="place-btns">
                  <button
                    class="status-btn"
                    type="button"
                    :class="{ 'active-allow': isAllowActive(place) }"
                    @click="setStatus(place.id, 'ALLOW')"
                  >
                    허용
                  </button>
                  <button
                    class="status-btn"
                    type="button"
                    :class="{ 'active-caution': isCautionActive(place) }"
                    @click="setStatus(place.id, 'WATCH')"
                  >
                    주의
                  </button>
                  <button
                    class="status-btn"
                    type="button"
                    :class="{ 'active-block': isBlockActive(place) }"
                    @click="setStatus(place.id, 'BLOCK')"
                  >
                    차단
                  </button>
                </div>
              </div>
              </div>
            </div>
          </section>
        </div>
      </div>


      <!-- 승인 요청 내역 -->
      <div class="request-section">

        <p class="request-title">
          승인 요청 내역
        </p>

        <div class="request-tabs">
          <button
            v-for="tab in requestTabs"
            :key="tab.value"
            class="chip"
            :class="{ off: activeRequestTab !== tab.value }"
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

    <div
      v-if="isDirty"
      class="footer"
    >
      <button
        class="submit-btn"
        :disabled="isSaving"
        type="button"
        @click="handleSave"
      >
        {{ isSaving ? '저장 중...' : '수정 완료' }}
      </button>
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

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import {
  isSameKstDay,
  parseServerDate,
  startOfKstDay,
} from '@/utils/datetime'

import {
  getCategoryPolicyParentGroups,
  updateCategoryPolicies,
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
  return new Date(startOfKstDay(new Date()).getTime() + 86400000)
}

function isSameLocalDay(dateValue) {
  const date = parseCreatedAt(dateValue)
  if (!date) return false
  return isSameKstDay(date, new Date())
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
    if (req.category) map.set(String(req.category), until)
    req.categories.forEach((name) => map.set(String(name), until))
    ;(req.categoryItems || []).forEach((item) => {
      if (item.label) map.set(String(item.label), until)
      if (item.id != null) map.set(String(item.id), until)
    })
  })

  return map
})

function withEffectivePolicy(item) {
  if (item.userOverride) {
    return {
      ...item,
      temporaryUntil: null,
      effectivePolicy: normalizePolicy(item.policy),
    }
  }

  const untilFromPermission =
    temporaryAllowMap.value.get(item.categoryName)
    ?? temporaryAllowMap.value.get(String(item.id))
    ?? null
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
  POLICY_SECTIONS.map((section) => {
    const groups = parentGroups.value
      .map((group) => ({
        name: group.name,
        items: group.items
          .map(withEffectivePolicy)
          .filter((item) => item.effectivePolicy === section.key),
      }))
      .filter((group) => group.items.length > 0)

    return {
      ...section,
      groups,
      count: groups.reduce((sum, group) => sum + group.items.length, 0),
    }
  })
)

const activePolicyTab = ref('BLOCK')
const searchQuery = ref('')
const isSaving = ref(false)

const allPlaces = computed(() =>
  parentGroups.value.flatMap((group) => group.items)
)

const isDirty = computed(() =>
  allPlaces.value.some((place) => place.userOverride)
)

const filteredGroups = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const grade = activePolicyTab.value

  return parentGroups.value
    .map((group) => {
      let items = group.items
        .map(withEffectivePolicy)
        .filter((item) => item.effectivePolicy === grade)

      if (keyword) {
        const groupMatch = group.name?.toLowerCase().includes(keyword)
        if (!groupMatch) {
          items = items.filter((item) =>
            item.categoryName?.toLowerCase().includes(keyword)
          )
        }
      }

      return {
        ...group,
        items,
      }
    })
    .filter((group) => group.items.length > 0)
})

const expandedGroups = ref({})

function groupExpandKey(name) {
  return `${activePolicyTab.value}:${name}`
}

function isGroupExpanded(name) {
  if (searchQuery.value.trim()) return true
  return !!expandedGroups.value[groupExpandKey(name)]
}

function toggleGroup(name) {
  if (searchQuery.value.trim()) return
  const key = groupExpandKey(name)
  expandedGroups.value = {
    ...expandedGroups.value,
    [key]: !expandedGroups.value[key],
  }
}

const emptyFilterText = computed(() => {
  if (searchQuery.value.trim()) return '검색 결과가 없습니다.'
  const label = POLICY_SECTIONS.find((section) => section.key === activePolicyTab.value)?.label
  return `${label}로 설정된 업종이 없습니다.`
})

function isAllowActive(place) {
  return place.effectivePolicy === 'ALLOW'
}

function isCautionActive(place) {
  return place.effectivePolicy === 'CAUTION' || place.effectivePolicy === 'WATCH'
}

function isBlockActive(place) {
  return place.effectivePolicy === 'BLOCK'
}

function isGroupAllowActive(group) {
  return group.items.length > 0 && group.items.every(isAllowActive)
}

function isGroupCautionActive(group) {
  return group.items.length > 0 && group.items.every(isCautionActive)
}

function isGroupBlockActive(group) {
  return group.items.length > 0 && group.items.every(isBlockActive)
}

function setStatus(id, policy) {
  const place = allPlaces.value.find((item) => item.id === id)
  if (!place) return
  place.policy = policy
  place.userOverride = true
}

function setGroupStatus(group, policy) {
  const visibleIds = new Set(group.items.map((item) => item.id))
  const source = parentGroups.value.find((item) => item.name === group.name)
  if (!source) return

  source.items.forEach((place) => {
    if (!visibleIds.has(place.id)) return
    place.policy = policy
    place.userOverride = true
  })
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
            userOverride: false,
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
// 카테고리 정책 저장
// ========================================

async function handleSave() {
  if (isSaving.value) return

  if (!authStore.accessToken) {
    authStore.handleUnauthorized('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  if (!childId.value) {
    alertModal.showAlert('선택된 자녀 정보가 없습니다.')
    return
  }

  isSaving.value = true

  try {
    await updateCategoryPolicies(
      authStore.accessToken,
      childId.value,
      allPlaces.value.map((place) => ({
        id: place.id,
        policy: place.policy,
      }))
    )

    alertModal.showAlert('설정이 저장되었습니다!')
    await Promise.all([
      fetchCategoryPolicies(),
      fetchPermissions(),
    ])
  } catch (error) {
    console.error('카테고리 정책 수정 실패:', error)

    if (error?.status === 401) {
      authStore.handleUnauthorized(
        '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
      )
      return
    }

    alertModal.showAlert(
      error.message || '설정을 저장하지 못했습니다.'
    )
  } finally {
    isSaving.value = false
  }
}


// ========================================
// 오늘만 허용 요청 조회
// ========================================

async function fetchPermissions() {
  isPermissionLoading.value = true

  try {
    const res = await getPermissions(
      authStore.accessToken,
      childId.value
    )

    permissionRequests.value = mergePermissionRequests(
      extractPermissionsList(res.data)
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

watch(
  () => route.query.childId,
  (id, prev) => {
    if (String(id || '') === String(prev || '')) return

    childId.value = id ? Number(id) : null

    if (!authStore.accessToken || !childId.value) return

    errorMessage.value = ''
    fetchCategoryPolicies()
    fetchPermissions()
  }
)
</script>


<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.page.has-save {
  padding-bottom: 150px;
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

.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.section-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #8b9097;
}

.policy-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grade-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.grade-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 12px 10px;
  border: 1.3px solid #e7e9ec;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
}

.grade-tab-label {
  font-size: 12px;
  font-weight: 700;
  color: #8b9097;
}

.grade-tab-count {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: #191b1e;
}

.grade-tab.allow.on {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.grade-tab.allow.on .grade-tab-label,
.grade-tab.allow.on .grade-tab-count {
  color: #16a34a;
}

.grade-tab.caution.on {
  border-color: #fed7aa;
  background: #fff7ed;
}

.grade-tab.caution.on .grade-tab-label,
.grade-tab.caution.on .grade-tab-count {
  color: #ea580c;
}

.grade-tab.block.on {
  border-color: #fecaca;
  background: #fef2f2;
}

.grade-tab.block.on .grade-tab-label,
.grade-tab.block.on .grade-tab-count {
  color: #dc2626;
}

.policy-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #eaedf1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.policy-panel.allow {
  border-color: #bbf7d0;
}

.policy-panel.caution {
  border-color: #fed7aa;
}

.policy-panel.block {
  border-color: #fecaca;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 40px;
  border-radius: 12px;
  background: #f4f5f7;
}

.search-icon {
  width: 16px;
  height: 16px;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #191b1e;
}

.search-input::placeholder {
  color: #b9bec5;
}

.place-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.place-group + .place-group {
  padding-top: 12px;
  border-top: 1px solid #f0f1f3;
}

.group-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #191b1e;
}

.group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  min-width: 28px;
  height: 24px;
  padding: 0 6px 0 8px;
  border: none;
  border-radius: 999px;
  background: #f4f5f7;
  font-size: 11px;
  font-weight: 800;
  color: #6b7077;
  line-height: 24px;
  cursor: pointer;
}

.group-count.open {
  background: #ffbc00;
  color: #191b1e;
}

.group-count-chevron {
  width: 12px;
  height: 12px;
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}

.group-count.open .group-count-chevron {
  transform: rotate(-90deg);
}

.place-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s ease;
}

.place-panel.open {
  grid-template-rows: 1fr;
}

.place-list {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.place-row {
  display: grid;
  grid-template-columns: minmax(72px, 0.9fr) minmax(150px, 1.3fr);
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f4f5f7;
}

.place-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.place-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #191b1e;
}

.place-btns {
  display: flex;
  gap: 6px;
}

.status-btn {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 4px;
  border: none;
  border-radius: 999px;
  background-color: #f4f5f7;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.group-btns .status-btn {
  height: 32px;
  font-size: 12px;
}

.active-allow {
  background-color: #34c759;
  color: #ffffff;
}

.active-caution {
  background-color: #ff9500;
  color: #ffffff;
}

.active-block {
  background-color: #ff3b30;
  color: #ffffff;
}

.temp-deadline {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #ff9500;
}

.empty-policy {
  margin: 0;
  padding: 18px 4px;
  text-align: center;
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

.request-section {
  margin-top: 8px;
}

.request-title {
  margin: 0 0 18px;
  font-size: 15px;
  font-weight: 800;
  color: #191b1e;
}

.request-tabs {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
}

.chip {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 1.3px solid transparent;
  border-radius: 999px;
  background: #ffbc00;
  color: #15171b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.chip.off {
  background: #ffffff;
  border: 1.3px solid #e7e9ec;
  color: #4a4e55;
  font-weight: 600;
}

.tab-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  color: #191b1e;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
}

.chip.off .tab-count {
  background: #f4f5f7;
  color: #8b9097;
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

.footer {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  z-index: 99;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 12px 16px;
  box-sizing: border-box;
  background: linear-gradient(
    180deg,
    rgba(248, 250, 252, 0) 0%,
    #f8fafc 28%
  );
}

.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>