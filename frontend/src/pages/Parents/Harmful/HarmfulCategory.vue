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


    <div class="notice-banner">
      오늘 0시에 기본 설정으로 자동 복구됩니다
    </div>


    <div class="content">

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


      <div
        v-else
        class="policy-board"
      >
        <div class="grade-chips">
          <button
            v-for="tab in gradeTabs"
            :key="tab.value"
            class="grade-chip"
            :class="[tab.tone, { on: activePolicyTab === tab.value }]"
            type="button"
            @click="activePolicyTab = tab.value"
          >
            {{ tab.label }}
            <strong>{{ tab.count }}</strong>
          </button>
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
          :class="{ locked: isLockedGroup(group) }"
        >
          <div class="group-head">
            <button
              class="group-title-btn"
              type="button"
              :aria-expanded="isGroupExpanded(group.name)"
              @click="toggleGroup(group.name)"
            >
              <span class="group-title">
                {{ group.name }}
              </span>
              <span class="group-count">
                {{ group.items.length }}개
              </span>
            </button>

            <div
              v-if="!isLockedGroup(group)"
              class="group-actions"
            >
              <button
                class="group-action"
                type="button"
                @click="setGroupStatus(group, 'ALLOW')"
              >
                전체 허용
              </button>
              <button
                class="group-action"
                type="button"
                @click="setGroupStatus(group, 'WATCH')"
              >
                전체 주의
              </button>
              <button
                class="group-action"
                type="button"
                @click="setGroupStatus(group, 'BLOCK')"
              >
                전체 차단
              </button>
            </div>

            <button
              class="group-chevron-btn"
              type="button"
              :aria-expanded="isGroupExpanded(group.name)"
              @click="toggleGroup(group.name)"
            >
              <img
                src="@/assets/icons/icon-chevron.svg"
                alt=""
                class="group-chevron"
                :class="{ open: isGroupExpanded(group.name) }"
              />
            </button>
          </div>

          <div
            class="group-panel"
            :class="{ open: isGroupExpanded(group.name) }"
          >
            <div class="group-card">
              <p
                v-if="isLockedGroup(group)"
                class="locked-note"
              >
                {{ lockedGroupNote(group) }}
              </p>

              <template v-else>
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
              </template>
            </div>
          </div>
        </section>
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

function normalizePolicy(policy) {
  return policy === 'WATCH' ? 'CAUTION' : policy
}

function isLockedGroup(group) {
  const name = (group.name || '').replace(/\s/g, '')
  if (name === '유해업종') return true

  const hints = ['주류', '담배', '성인', '도박', '유흥']
  const items = group.items || []
  return (
    items.length > 0
    && items.every((item) =>
      hints.some((hint) => item.categoryName?.includes(hint))
    )
  )
}

function lockedGroupNote(group) {
  const names = (group.items || [])
    .map((item) => item.categoryName)
    .filter(Boolean)
  const label = names.length ? names.join(' · ') : '유해 업종'
  return `${label} — 정책상 항상 차단되며 개별 변경할 수 없습니다.`
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

function withEffectivePolicy(item, group) {
  const locked = group
    ? isLockedGroup(group)
    : parentGroups.value.some(
        (entry) =>
          isLockedGroup(entry)
          && entry.items.some((place) => place.id === item.id)
      )

  if (locked) {
    return {
      ...item,
      temporaryUntil: null,
      effectivePolicy: 'BLOCK',
    }
  }

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

const gradeCounts = computed(() => {
  const counts = {
    ALL: 0,
    ALLOW: 0,
    CAUTION: 0,
    BLOCK: 0,
  }

  parentGroups.value.forEach((group) => {
    group.items.forEach((item) => {
      const policy = withEffectivePolicy(item, group).effectivePolicy
      counts.ALL += 1
      if (counts[policy] != null) counts[policy] += 1
    })
  })

  return counts
})

const gradeTabs = computed(() => [
  { value: 'ALL', label: '전체', tone: 'all', count: gradeCounts.value.ALL },
  { value: 'ALLOW', label: '허용', tone: 'allow', count: gradeCounts.value.ALLOW },
  { value: 'CAUTION', label: '주의', tone: 'caution', count: gradeCounts.value.CAUTION },
  { value: 'BLOCK', label: '차단', tone: 'block', count: gradeCounts.value.BLOCK },
])

const activePolicyTab = ref('ALL')
const isSaving = ref(false)

const allPlaces = computed(() =>
  parentGroups.value.flatMap((group) => group.items)
)

const isDirty = computed(() =>
  allPlaces.value.some((place) => place.userOverride)
)

const filteredGroups = computed(() => {
  const grade = activePolicyTab.value

  return parentGroups.value
    .map((group) => {
      let items = group.items.map((item) => withEffectivePolicy(item, group))
      if (grade !== 'ALL') {
        items = items.filter((item) => item.effectivePolicy === grade)
      }
      return {
        ...group,
        items,
      }
    })
    .filter((group) => group.items.length > 0)
    .sort((a, b) => Number(isLockedGroup(a)) - Number(isLockedGroup(b)))
})

const expandedGroups = ref({})

function isGroupExpanded(name) {
  if (Object.prototype.hasOwnProperty.call(expandedGroups.value, name)) {
    return !!expandedGroups.value[name]
  }
  return true
}

function toggleGroup(name) {
  expandedGroups.value = {
    ...expandedGroups.value,
    [name]: !isGroupExpanded(name),
  }
}

function setGroupStatus(group, policy) {
  if (isLockedGroup(group)) return

  const source = parentGroups.value.find((item) => item.name === group.name)
  if (!source) return

  source.items.forEach((place) => {
    place.policy = policy
    place.userOverride = true
  })
}

const emptyFilterText = computed(() => {
  if (activePolicyTab.value === 'ALL') return '표시할 업종이 없습니다.'
  const label = gradeTabs.value.find((tab) => tab.value === activePolicyTab.value)?.label
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

function setStatus(id, policy) {
  const place = allPlaces.value.find((item) => item.id === id)
  if (!place) return

  const group = parentGroups.value.find((item) =>
    item.items.some((entry) => entry.id === id)
  )
  if (group && isLockedGroup(group)) return

  place.policy = policy
  place.userOverride = true
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
      allPlaces.value.map((place) => {
        const group = parentGroups.value.find((entry) =>
          entry.items.some((item) => item.id === place.id)
        )
        return {
          id: place.id,
          policy: group && isLockedGroup(group) ? 'BLOCK' : place.policy,
        }
      })
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
  background: #f4f5f7;
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

.notice-banner {
  margin: 0;
  padding: 10px 16px;
  background: #fff6d9;
  color: #8a6d1f;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
}

.policy-board {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grade-chips {
  display: flex;
  gap: 6px;
}

.grade-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 28px;
  padding: 0 8px;
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 8px;
  background: #ffffff;
  color: #6b7077;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.grade-chip strong {
  font-weight: 800;
}

.grade-chip.all.on {
  background: #191b1e;
  color: #ffffff;
}

.grade-chip.allow {
  color: #28a745;
  background: #e9f7ee;
}

.grade-chip.allow.on {
  background: #28a745;
  color: #ffffff;
}

.grade-chip.caution {
  color: #ff9f0a;
  background: #fff4e0;
}

.grade-chip.caution.on {
  background: #ff9f0a;
  color: #ffffff;
}

.grade-chip.block {
  color: #ff3b30;
  background: #ffe9e7;
}

.grade-chip.block.on {
  background: #ff3b30;
  color: #ffffff;
}

.place-group {
  display: flex;
  flex-direction: column;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 2px 10px;
}

.group-title-btn {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.group-title {
  font-size: 15px;
  font-weight: 800;
  color: #191b1e;
}

.group-count {
  font-size: 12px;
  font-weight: 700;
  color: #8b9097;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.group-action {
  height: 20px;
  padding: 0 6px;
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 6px;
  background: #ffffff;
  color: #6b7077;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.group-action:active {
  background: #f4f5f7;
}

.group-chevron-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.group-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.4;
  transform: rotate(0deg);
  transition: transform 0.22s ease;
}

.group-chevron.open {
  transform: rotate(90deg);
}

.group-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s ease;
}

.group-panel.open {
  grid-template-rows: 1fr;
}

.group-card {
  overflow: hidden;
  min-height: 0;
  border-radius: 12px;
  background: #ffffff;
}

.place-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
}

.place-row + .place-row {
  border-top: 1px solid #f4f5f7;
}

.place-name {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #191b1e;
}

.place-btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  flex: 0 0 148px;
  gap: 4px;
}

.status-btn {
  width: 100%;
  height: 28px;
  padding: 0 4px;
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 6px;
  background-color: #f4f5f7;
  color: #6b7077;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.active-allow {
  background-color: #28a745;
  color: #ffffff;
}

.active-caution {
  background-color: #ff9f0a;
  color: #ffffff;
}

.active-block {
  background-color: #ff3b30;
  color: #ffffff;
}

.locked-note {
  margin: 0;
  padding: 16px 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
  color: #4a4e55;
}

.temp-deadline {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #ff9f0a;
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