<template>
  <div class="page">

    <!-- 헤더 -->
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

      <h1 class="nav-title">업종별 결제 설정</h1>
      <ParentNavActions />
    </header>


    <!-- 안내 문구 -->
    <div class="notice-banner">
      <img
        src="@/assets/icons/icon-info.svg"
        alt=""
        class="info-icon"
      />

      <p class="notice-text">
        설정하신 권한은 오늘만 유효하며,
        내일 오전 0시를 기준 설정으로 자동 복구됩니다.
      </p>
    </div>


    <!-- 검색 -->
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


    <div class="grade-filter">
      <button
        v-for="tab in gradeTabs"
        :key="tab.value"
        class="grade-chip"
        :class="[
          tab.tone,
          { on: policyFilter === tab.value },
        ]"
        type="button"
        @click="policyFilter = tab.value"
      >
        {{ tab.label }}
        <span class="grade-chip-count">
          {{ tab.count }}
        </span>
      </button>
    </div>


    <!-- 로딩 -->
    <div
      v-if="isLoading"
      class="state-box"
    >
      <p>불러오는 중입니다...</p>
    </div>


    <!-- 에러 -->
    <div
      v-else-if="errorMessage"
      class="state-box"
    >
      <p class="error-text">
        {{ errorMessage }}
      </p>
    </div>


    <!-- 카테고리 목록 -->
    <div
      v-else
      class="content"
    >
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
            <span class="group-count">
              {{ group.items.length }}
            </span>
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

        <div class="place-list">
          <div
            v-for="place in group.items"
            :key="place.id"
            class="place-row"
          >
            <p class="place-name">
              {{ place.categoryName }}
              <span
                v-if="isTemporaryAllow(place)"
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
      </section>


      <!-- 검색 결과 없음 -->
      <div
        v-if="filteredGroups.length === 0"
        class="empty-box"
      >
        {{ emptyFilterText }}
      </div>
    </div>


    <!-- 수정 완료 버튼 -->
    <div class="footer">
      <button
        class="submit-btn"
        :disabled="isSaving"
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

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

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

import { getPermissions } from '@/api/permissions'


const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const alertModal = useAlertModal()


// ========================================
// 선택된 자녀 ID
//
// HarmfulCategory.vue에서:
//
// /parents/place-list?childId=3
//
// 형태로 전달받음
// ========================================

const childId = ref(
  route.query.childId
    ? Number(route.query.childId)
    : null
)


// ========================================
// 상태값
// ========================================

const parentGroups = ref([])
const approvedPermissions = ref([])

const searchQuery = ref('')

const isLoading = ref(false)
const isSaving = ref(false)

const errorMessage = ref('')

const allPlaces = computed(() =>
  parentGroups.value.flatMap((group) => group.items)
)

const policyFilter = ref('ALL')

function placeGrade(place) {
  if (isAllowActive(place)) return 'ALLOW'
  if (isCautionActive(place)) return 'WATCH'
  return 'BLOCK'
}

const gradeCounts = computed(() => {
  const counts = {
    ALL: allPlaces.value.length,
    ALLOW: 0,
    WATCH: 0,
    BLOCK: 0,
  }

  allPlaces.value.forEach((place) => {
    counts[placeGrade(place)] += 1
  })

  return counts
})

const gradeTabs = computed(() => [
  { value: 'ALL', label: '전체', tone: '', count: gradeCounts.value.ALL },
  { value: 'ALLOW', label: '허용', tone: 'allow', count: gradeCounts.value.ALLOW },
  { value: 'WATCH', label: '주의', tone: 'caution', count: gradeCounts.value.WATCH },
  { value: 'BLOCK', label: '차단', tone: 'block', count: gradeCounts.value.BLOCK },
])

const filteredGroups = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const grade = policyFilter.value

  return parentGroups.value
    .map((group) => {
      let items = group.items

      if (keyword) {
        const groupMatch = group.name?.toLowerCase().includes(keyword)
        if (!groupMatch) {
          items = items.filter((item) =>
            item.categoryName?.toLowerCase().includes(keyword)
          )
        }
      }

      if (grade !== 'ALL') {
        items = items.filter((item) => placeGrade(item) === grade)
      }

      return {
        ...group,
        items,
      }
    })
    .filter((group) => group.items.length > 0)
})

const emptyFilterText = computed(() => {
  if (searchQuery.value.trim()) return '검색 결과가 없습니다.'
  if (policyFilter.value === 'ALLOW') return '허용된 업종이 없습니다.'
  if (policyFilter.value === 'WATCH') return '주의 업종이 없습니다.'
  if (policyFilter.value === 'BLOCK') return '차단된 업종이 없습니다.'
  return '표시할 업종이 없습니다.'
})

function isCaution(policy) {
  return policy === 'WATCH' || policy === 'CAUTION'
}

function isFlatGroup(group) {
  return group.name === '기타'
}

function getTodayEnd() {
  return new Date(startOfKstDay(new Date()).getTime() + 86400000)
}

function parsePermissionDate(value) {
  return parseServerDate(value)
}

function isSameLocalDay(dateValue) {
  const date = parsePermissionDate(dateValue)
  if (!date) return false
  return isSameKstDay(date, new Date())
}

function extractPermissionKeys(permission) {
  const keys = []

  function push(value) {
    if (value == null || value === '') return
    if (typeof value === 'object') {
      const name =
        value.categoryName
        ?? value.category
        ?? value.merchantCategoryName
        ?? value.name
      const id = value.id ?? value.categoryId ?? value.merchantCategoryId
      if (name) keys.push(String(name))
      if (id != null) keys.push(String(id))
      return
    }
    keys.push(String(value))
  }

  push(permission?.category)
  if (Array.isArray(permission?.categories)) {
    permission.categories.forEach(push)
  }

  return keys
}

function extractPermissionsList(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.permissions)) return payload.permissions
  if (Array.isArray(payload.items)) return payload.items
  if (payload.permission) return [payload.permission]
  return []
}

const temporaryAllowMap = computed(() => {
  const map = new Map()
  const until = getTodayEnd()
  if (until.getTime() <= Date.now()) return map

  approvedPermissions.value.forEach((permission) => {
    const day = permission.updatedAt || permission.approvedAt || permission.createdAt
    if (day && !isSameLocalDay(day)) return

    extractPermissionKeys(permission).forEach((key) => {
      map.set(key, until)
    })
  })

  return map
})

function isTemporaryAllow(place) {
  if (place.userOverride) return false
  if (temporaryAllowMap.value.has(place.categoryName)) return true
  if (temporaryAllowMap.value.has(String(place.id))) return true

  const until = parseServerDate(place.expiresAt)
  return !!(until && until.getTime() > Date.now())
}

function isAllowActive(place) {
  if (place.userOverride) return place.policy === 'ALLOW'
  return place.policy === 'ALLOW' || isTemporaryAllow(place)
}

function isCautionActive(place) {
  if (isAllowActive(place)) return false
  return isCaution(place.policy)
}

function isBlockActive(place) {
  if (isAllowActive(place)) return false
  return place.policy === 'BLOCK'
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

async function fetchApprovedPermissions() {
  if (!authStore.accessToken || !childId.value) {
    approvedPermissions.value = []
    return
  }

  try {
    const res = await getPermissions(
      authStore.accessToken,
      childId.value
    )

    approvedPermissions.value = extractPermissionsList(res.data)
      .filter((permission) => permission?.status === 'APPROVED')
  } catch (error) {
    console.error('오늘만 허용 승인 내역 조회 실패:', error)
    approvedPermissions.value = []
  }
}


// ========================================
// 카테고리 정책 전체 조회
//
// GET
// /api/v1/category-policies/parent-groups?childId=3
// ========================================

async function fetchPlaces() {

  if (!authStore.accessToken) {

    authStore.handleUnauthorized('서비스를 이용하려면 로그인해 주세요.')

    return
  }


  if (!childId.value) {

    errorMessage.value =
      '선택된 자녀 정보가 없습니다.'

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
      '전체 카테고리 정책 응답:',
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
      '전체 카테고리 정책 조회 실패:',
      error
    )


    /*
     * categoryPolicy.js에서
     * error.status를 전달하고 있다면
     * 401 처리가 가능
     */
    if (error?.status === 401) {
      authStore.handleUnauthorized(
        '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
      )
      return
    }


    errorMessage.value =
      error.message ||
      '카테고리 정책을 불러오지 못했습니다.'


  } finally {

    isLoading.value = false

  }
}


// ========================================
// 화면에서 정책 변경
//
// 서버 요청은 아직 하지 않고
// places 배열만 변경
// ========================================

function setStatus(id, policy) {

  const place =
    allPlaces.value.find(
      item => item.id === id
    )


  if (!place) {
    return
  }


  place.policy = policy
  place.userOverride = true


  console.log(
    '정책 변경:',
    {
      childId: childId.value,
      categoryId: id,
      policy,
    }
  )
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
// 수정 완료
//
// PATCH
// /api/v1/category-policies?childId=3
//
// body:
// {
//   categoryPolicyList: [
//     {
//       id: 1,
//       policy: "ALLOW"
//     },
//     ...
//   ]
// }
// ========================================

async function handleSave() {

  if (isSaving.value) {
    return
  }


  if (!authStore.accessToken) {

    authStore.handleUnauthorized('서비스를 이용하려면 로그인해 주세요.')

    return
  }


  if (!childId.value) {

    alertModal.showAlert(
      '선택된 자녀 정보가 없습니다.'
    )

    return
  }


  isSaving.value = true


  try {

    /*
     * Swagger 요청 DTO 형태에 맞춤
     *
     * merchantCategoryName은 보내지 않고
     * id + policy만 전송
     */
    const categoryPolicyList =
      allPlaces.value.map(
        place => ({
          id: place.id,
          policy: place.policy,
        })
      )


    console.log(
      '카테고리 정책 수정 childId:',
      childId.value
    )


    console.log(
      '카테고리 정책 수정 요청:',
      {
        categoryPolicyList,
      }
    )


    const res =
      await updateCategoryPolicies(
        authStore.accessToken,
        childId.value,
        categoryPolicyList
      )


    console.log(
      '카테고리 정책 수정 응답:',
      res
    )


    alertModal.showAlert(
      '설정이 저장되었습니다!'
    )


    /*
     * 저장 성공 후
     * HarmfulCategory로 돌아가면서
     * 동일한 childId 전달
     */
    await router.push({
      path:
        '/parents/harmfulcategory',

      query: {
        childId:
          childId.value,
      },
    })


  } catch (error) {

    console.error(
      '카테고리 정책 수정 실패:',
      error
    )


    if (error?.status === 401) {
      authStore.handleUnauthorized(
        '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
      )
      return
    }


    alertModal.showAlert(
      error.message ||
      '설정을 저장하지 못했습니다.'
    )


  } finally {

    isSaving.value = false

  }
}


// ========================================
// 페이지 진입
// ========================================

onMounted(() => {

  console.log(
    'PlaceList 현재 childId:',
    childId.value
  )

  fetchPlaces()
  fetchApprovedPermissions()

})
</script>


<style scoped>
* {
  box-sizing: border-box;
}

.page {
  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 160px;
  background: #f8fafc;
  color: #191b1e;
  display: flex;
  flex-direction: column;
}


/* =========================
   헤더
========================= */

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background-color: #ffffff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
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


/* =========================
   안내 배너
========================= */

.notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 16px 16px 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background-color: #fff7d6;
}

.info-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.notice-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #6c6252;
}


/* =========================
   검색
========================= */

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 10px;
  padding: 0 14px;
  height: 44px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.search-icon {
  width: 18px;
  height: 18px;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #191b1e;
}

.search-input::placeholder {
  color: #b9bec5;
}

.grade-filter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 0 16px 14px;
}

.grade-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  height: 52px;
  padding: 0 4px;
  border: 1.3px solid #e7e9ec;
  border-radius: 14px;
  background: #ffffff;
  color: #6b7077;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.grade-chip-count {
  font-size: 15px;
  font-weight: 800;
  color: #191b1e;
  line-height: 1;
}

.grade-chip.on {
  border-color: #ffbc00;
  background: #fff8e1;
  color: #191b1e;
}

.grade-chip.allow.on {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #16a34a;
}

.grade-chip.allow.on .grade-chip-count {
  color: #16a34a;
}

.grade-chip.caution.on {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #ea580c;
}

.grade-chip.caution.on .grade-chip-count {
  color: #ea580c;
}

.grade-chip.block.on {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.grade-chip.block.on .grade-chip-count {
  color: #dc2626;
}


/* =========================
   상태
========================= */

.state-box {
  padding: 50px 20px;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.error-text {
  color: #d14343;
}

.empty-box {
  padding: 40px 0;
  text-align: center;
  color: #b9bec5;
  font-size: 13px;
}


/* =========================
   카테고리
========================= */

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.place-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #eaedf1;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
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
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.group-count {
  flex-shrink: 0;
  min-width: 20px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #f4f5f7;
  font-size: 11px;
  font-weight: 700;
  color: #6b7077;
  line-height: 16px;
  text-align: center;
}

.group-btns {
  padding: 0;
}

.place-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f0f1f3;
}

.place-row {
  display: grid;
  grid-template-columns: minmax(76px, 0.9fr) minmax(168px, 1.3fr);
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

.temp-deadline {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #ff9500;
}

.place-btns {
  display: flex;
  gap: 6px;
}

.status-btn {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 4px;
  border: none;
  border-radius: 999px;
  background-color: #f4f5f7;
  color: #8b9097;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.group-btns .status-btn {
  height: 34px;
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


/* =========================
   수정 완료 버튼
========================= */

.footer {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  z-index: 99;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  padding: 12px 16px;
  box-sizing: border-box;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    #ffffff 28%
  );
}

.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 12px;
  background-color: #ffbc00;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}



</style>