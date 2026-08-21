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
      오늘만 허용은 승인 당일 자정까지 일시 허용되며,<br />
      0시에 기존 설정으로 돌아갑니다
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

            <div class="group-actions">
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
              <div
                v-for="place in group.items"
                :key="place.id"
                class="place-row"
                :class="{
                  leaving: isMoving(place.id),
                }"
              >
                <p class="place-name">
                  {{ place.categoryName }}
                  <span
                    v-if="place.temporaryUntil"
                    class="temp-badge"
                  >
                    {{ formatRemainUntilMidnight(place.temporaryUntil) }}
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
              허용할 업종을 선택한 뒤 승인을 누르면, 선택하지 않은 업종은 자동으로 거절됩니다.
            </p>

            <div
              v-if="req.reason"
              class="child-message"
            >
              <span class="child-message-label">자녀메시지</span>
              <p class="request-desc">
                {{ req.reason }}
              </p>
            </div>

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
          <div class="completed-filters">
            <div class="filter-tabs">
              <button
                type="button"
                class="tab"
                :class="{ 'tab-active': completedStatus === 'ALL' }"
                @click="changeCompletedStatus('ALL')"
              >
                전체
              </button>
              <button
                type="button"
                class="tab"
                :class="{ 'tab-active': completedStatus === 'APPROVED' }"
                @click="changeCompletedStatus('APPROVED')"
              >
                승인
              </button>
              <button
                type="button"
                class="tab"
                :class="{ 'tab-active': completedStatus === 'REJECTED' }"
                @click="changeCompletedStatus('REJECTED')"
              >
                거절
              </button>
              <button
                type="button"
                class="tab tab-period"
                :class="{ 'tab-active': isCompletedPeriodOpen }"
                @click="toggleCompletedPeriodMenu"
              >
                <img
                  src="@/assets/icons/icon-calendar.svg"
                  alt=""
                  class="calendar-icon"
                />
                {{ completedPeriodLabel }}
              </button>
            </div>

            <div
              v-if="isCompletedPeriodOpen"
              class="period-menu"
            >
              <button
                type="button"
                class="period-option"
                :class="{ active: completedPeriod === 'WEEK' }"
                @click="changeCompletedPeriod('WEEK')"
              >
                1주
              </button>
              <button
                type="button"
                class="period-option"
                :class="{ active: completedPeriod === 'MONTH' }"
                @click="changeCompletedPeriod('MONTH')"
              >
                1개월
              </button>
              <button
                type="button"
                class="period-option"
                :class="{ active: completedPeriod === 'THREE_MONTHS' }"
                @click="changeCompletedPeriod('THREE_MONTHS')"
              >
                3개월
              </button>
              <button
                type="button"
                class="period-option"
                :class="{ active: completedPeriod === 'SIX_MONTHS' }"
                @click="changeCompletedPeriod('SIX_MONTHS')"
              >
                6개월
              </button>
            </div>

            <div class="sort-area">
              <button
                type="button"
                class="sort-button"
                @click="toggleCompletedSort"
              >
                <span class="sort-label">
                  {{ completedSort === 'DESC' ? '최신순' : '과거순' }}
                </span>
                <svg
                  class="sort-switch-icon"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 10l5-5 5 5M7 14l5 5 5-5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            v-if="!filteredCompletedRequests.length"
            class="empty-request"
          >
            <p>{{ completedEmptyText }}</p>
          </div>

          <div
            v-for="req in filteredCompletedRequests"
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

            <div
              v-if="req.reason"
              class="child-message"
            >
              <span class="child-message-label">자녀메시지</span>
              <p class="request-desc">
                {{ req.reason }}
              </p>
            </div>
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

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

const localTempAllowUntil = ref(new Map())

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

const nowTick = ref(Date.now())
let remainTimer = null

function formatRemainUntilMidnight(until) {
  const end = until instanceof Date ? until : parseCreatedAt(until) || getTodayEnd()
  const diff = end.getTime() - nowTick.value
  if (diff <= 0) return '곧 종료'

  const totalMinutes = Math.floor(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours}시간 ${minutes}분 남음`
  if (hours > 0) return `${hours}시간 남음`
  if (minutes > 0) return `${minutes}분 남음`
  return `${Math.max(1, Math.floor(diff / 1000))}초 남음`
}

function startRemainTimer() {
  if (remainTimer) return
  nowTick.value = Date.now()
  remainTimer = window.setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
}

function stopRemainTimer() {
  if (!remainTimer) return
  window.clearInterval(remainTimer)
  remainTimer = null
}

function requestKey(req) {
  return (req.permissionIds || [req.id]).join('-')
}

function normalizeName(value) {
  return String(value ?? '').replace(/\s/g, '')
}

function addTempAllowKey(map, key, until) {
  if (key == null || key === '') return
  map.set(String(key), until)
  const compact = normalizeName(key)
  if (compact) map.set(compact, until)
}

function findPolicyPlaces(item) {
  const id = item?.id
  const label = item?.label ?? item?.categoryName ?? item
  const compact = normalizeName(label)

  return parentGroups.value.flatMap((group) => group.items).filter((place) =>
    (id != null && (
      String(place.id) === String(id)
      || String(place.categoryId) === String(id)
    ))
    || (label && place.categoryName === String(label))
    || (compact && normalizeName(place.categoryName) === compact)
  )
}

function rememberTempAllow(items) {
  const until = getTodayEnd()
  if (until.getTime() <= Date.now()) return

  const next = new Map(localTempAllowUntil.value)
  items.forEach((item) => {
    addTempAllowKey(next, item?.id, until)
    addTempAllowKey(next, item?.label, until)
    addTempAllowKey(next, resolveCategoryId(item), until)
    findPolicyPlaces(item).forEach((place) => {
      addTempAllowKey(next, place.id, until)
      addTempAllowKey(next, place.categoryId, until)
      addTempAllowKey(next, place.categoryName, until)
    })
  })
  localTempAllowUntil.value = next
}

function isApprovedToday(req) {
  if (req.status !== 'APPROVED') return false
  if (getTodayEnd().getTime() <= Date.now()) return false

  const day = req.approvedAt || req.updatedAt || req.createdAt
  if (!day) return true
  return isSameLocalDay(day)
}

const temporaryAllowMap = computed(() => {
  const until = getTodayEnd()
  const map = new Map()

  if (until.getTime() > Date.now()) {
    localTempAllowUntil.value.forEach((value, key) => {
      if (value && value.getTime() > Date.now()) map.set(key, value)
    })

    normalizedRequests.value.forEach((req) => {
      if (!isApprovedToday(req)) return

      addTempAllowKey(map, req.category, until)
      ;(req.categories || []).forEach((name) => addTempAllowKey(map, name, until))
      ;(req.categoryItems || []).forEach((item) => {
        addTempAllowKey(map, item.label, until)
        addTempAllowKey(map, item.id, until)
        addTempAllowKey(map, resolveCategoryId(item), until)
        findPolicyPlaces(item).forEach((place) => {
          addTempAllowKey(map, place.id, until)
          addTempAllowKey(map, place.categoryId, until)
          addTempAllowKey(map, place.categoryName, until)
        })
      })
    })
  }

  return map
})

function lookupTempUntil(item) {
  const map = temporaryAllowMap.value
  return map.get(String(item.id))
    ?? map.get(item.categoryName)
    ?? map.get(normalizeName(item.categoryName))
    ?? (item.categoryId != null ? map.get(String(item.categoryId)) : null)
    ?? null
}

function withEffectivePolicy(item) {
  if (item.userOverride) {
    return {
      ...item,
      temporaryUntil: null,
      effectivePolicy: normalizePolicy(item.policy),
    }
  }

  const untilFromPolicy = parseCreatedAt(
    item.expiresAt ?? item.temporaryUntil ?? item.validUntil ?? null
  )
  const temporaryUntil = lookupTempUntil(item) || untilFromPolicy
  const basePolicy = normalizePolicy(item.policy)
  const isTemp =
    !!temporaryUntil
    && temporaryUntil.getTime() > Date.now()
    && basePolicy !== 'ALLOW'

  return {
    ...item,
    temporaryUntil: isTemp ? temporaryUntil : null,
    effectivePolicy: isTemp ? 'ALLOW' : basePolicy,
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
      const policy = withEffectivePolicy(item).effectivePolicy
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
const movingIds = ref([])

function isMoving(id) {
  return movingIds.value.includes(id)
}

function destinationTab(policy) {
  return normalizePolicy(policy)
}

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
      let items = group.items.map((item) => withEffectivePolicy(item))
      if (grade !== 'ALL') {
        items = items.filter((item) =>
          item.effectivePolicy === grade || movingIds.value.includes(item.id)
        )
      }
      return {
        ...group,
        items,
      }
    })
    .filter((group) => group.items.length > 0)
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

function playLeaveAnimation(ids, policy) {
  const nextTab = destinationTab(policy)
  const currentTab = activePolicyTab.value
  if (currentTab === 'ALL' || currentTab === nextTab) return

  movingIds.value = [...new Set([...movingIds.value, ...ids])]
  window.setTimeout(() => {
    movingIds.value = movingIds.value.filter((id) => !ids.includes(id))
  }, 300)
}

function setGroupStatus(group, policy) {
  const source = parentGroups.value.find((item) => item.name === group.name)
  if (!source) return

  const ids = source.items.map((place) => place.id)
  source.items.forEach((place) => {
    place.policy = policy
    place.userOverride = true
  })
  playLeaveAnimation(ids, policy)
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
  if (movingIds.value.includes(id)) return

  place.policy = policy
  place.userOverride = true
  playLeaveAnimation([id], policy)
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

const completedStatus = ref('ALL')
const completedPeriod = ref('MONTH')
const completedSort = ref('DESC')
const isCompletedPeriodOpen = ref(false)

const completedPeriodLabel = computed(() => {
  switch (completedPeriod.value) {
    case 'WEEK':
      return '1주'
    case 'MONTH':
      return '1개월'
    case 'THREE_MONTHS':
      return '3개월'
    case 'SIX_MONTHS':
      return '6개월'
    default:
      return '기간'
  }
})

function completedPeriodCutoff() {
  const days = {
    WEEK: 7,
    MONTH: 30,
    THREE_MONTHS: 90,
    SIX_MONTHS: 180,
  }[completedPeriod.value] || 30

  return startOfKstDay(new Date()).getTime() - (days - 1) * 86400000
}

const filteredCompletedRequests = computed(() => {
  const cutoff = completedPeriodCutoff()
  const status = completedStatus.value
  const list = completedRequests.value.filter((req) => {
    if (status !== 'ALL' && req.status !== status) return false
    const time = getTimestamp(req.updatedAt || req.approvedAt || req.createdAt)
    return time >= cutoff
  })

  return [...list].sort((a, b) => {
    const diff =
      getTimestamp(a.updatedAt || a.approvedAt || a.createdAt)
      - getTimestamp(b.updatedAt || b.approvedAt || b.createdAt)
    return completedSort.value === 'DESC' ? -diff : diff
  })
})

const completedEmptyText = computed(() => {
  if (!completedRequests.value.length) return '처리 완료된 승인 요청이 없습니다.'
  return '해당 조건의 처리 내역이 없습니다.'
})

function changeCompletedStatus(status) {
  completedStatus.value = status
  isCompletedPeriodOpen.value = false
}

function toggleCompletedPeriodMenu() {
  isCompletedPeriodOpen.value = !isCompletedPeriodOpen.value
}

function changeCompletedPeriod(period) {
  completedPeriod.value = period
  isCompletedPeriodOpen.value = false
}

function toggleCompletedSort() {
  completedSort.value = completedSort.value === 'DESC' ? 'ASC' : 'DESC'
}

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

  return category?.label
    ?? category?.category
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
        const found = findPolicyPlaces({ id: item, label: item })[0]
        return {
          id: found?.id ?? item,
          label: found?.categoryName ?? String(item),
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

      const found = findPolicyPlaces({ id, label })[0]
      return {
        id: found?.id ?? id ?? label,
        label: found?.categoryName || label || String(id),
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
    updatedAt: permission.updatedAt ?? permission.approvedAt ?? null,
    approvedAt: permission.approvedAt ?? permission.updatedAt ?? null,
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
            categoryId: item.categoryId ?? item.merchantCategoryId ?? null,
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

    rememberTempAllow(approvedItems)
    playLeaveAnimation(
      approvedItems.flatMap((item) => findPolicyPlaces(item).map((place) => place.id)),
      'ALLOW'
    )

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

  startRemainTimer()

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

watch(activeRequestTab, () => {
  isCompletedPeriodOpen.value = false
})

onUnmounted(() => {
  stopRemainTimer()
})
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
  max-height: 72px;
  padding: 12px 14px;
  overflow: hidden;
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    max-height 0.28s ease,
    padding 0.28s ease;
}

.place-row.leaving {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  transform: translateX(18px);
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

.temp-deadline {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #ff9f0a;
}

.temp-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 6px;
  background: #fff3d6;
  color: #c47a00;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
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

.completed-filters {
  margin-bottom: 4px;
}

.filter-tabs {
  display: flex;
  gap: 7px;
  overflow-x: auto;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  flex-shrink: 0;
  height: 34px;
  padding: 0 13px;
  border: 1px solid #e0e3e7;
  border-radius: 18px;
  color: #8b9097;
  font-size: 12px;
  font-weight: 600;
  background-color: #ffffff;
  cursor: pointer;
}

.tab-active {
  border-color: #ffbc00;
  color: #191b1e;
  background-color: #ffbc00;
}

.tab-period {
  display: flex;
  align-items: center;
  gap: 5px;
}

.calendar-icon {
  width: 15px;
  height: 15px;
}

.period-menu {
  display: flex;
  gap: 7px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #ffffff;
}

.period-option {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: 7px;
  color: #8b9097;
  font-size: 11px;
  background-color: #f4f5f7;
  cursor: pointer;
}

.period-option.active {
  color: #191b1e;
  font-weight: 700;
  background-color: #ffbc00;
}

.sort-area {
  display: flex;
  justify-content: flex-end;
  margin: 8px 2px 10px;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: none;
  color: #8b9097;
  font-size: 11px;
  background: transparent;
  cursor: pointer;
}

.sort-label {
  line-height: 1;
}

.sort-switch-icon {
  flex-shrink: 0;
  color: #8b9097;
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
  flex-wrap: wrap;
  gap: 6px;
}

.category-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: auto;
  max-width: 100%;
  padding: 6px 8px;
  border: 1px solid #eaedf1;
  border-radius: 8px;
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
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 4px;
  background: #f0f1f3;
}

.checkbox.checked {
  background: #ffbc00;
}

.check-icon {
  width: 10px;
  height: 10px;
}

.category-check-label {
  font-size: 12px;
  font-weight: 600;
  color: #191b1e;
  white-space: nowrap;
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

.child-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.child-message-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7077;
}

.request-desc {
  margin: 0;
  font-size: 13px;
  color: #191b1e;
  line-height: 1.45;
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
  left: 50%;
  z-index: 99;
  width: 360px;
  max-width: 100%;
  padding: 0 8px 12px;
  box-sizing: border-box;
  background: transparent;
  transform: translateX(-50%);
  pointer-events: none;
}

.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  pointer-events: auto;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>