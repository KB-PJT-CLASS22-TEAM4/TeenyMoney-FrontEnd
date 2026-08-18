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
        <button
          class="toggle-header"
          type="button"
          :aria-expanded="isGroupExpanded(group.name)"
          @click="toggleGroup(group.name)"
        >
          <p class="group-title">
            {{ group.name }}
          </p>
          <span class="toggle-count">
            {{ group.items.length }}
          </span>
          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="toggle-chevron"
            :class="{ open: isGroupExpanded(group.name) }"
          />
        </button>

        <div
          v-if="isGroupExpanded(group.name)"
          class="toggle-body"
        >
          <div
            v-for="place in group.items"
            :key="place.id"
            class="place-card"
          >
            <p class="place-name">
              {{ place.categoryName }}
            </p>

            <div class="place-btns">
              <button
                class="status-btn"
                type="button"
                :class="{ 'active-allow': place.policy === 'ALLOW' }"
                @click="setStatus(place.id, 'ALLOW')"
              >
                <span v-if="place.policy === 'ALLOW'">✓</span>
                허용
              </button>

              <button
                class="status-btn"
                type="button"
                :class="{ 'active-caution': place.policy === 'CAUTION' }"
                @click="setStatus(place.id, 'CAUTION')"
              >
                <span v-if="place.policy === 'CAUTION'">✓</span>
                주의
              </button>

              <button
                class="status-btn"
                type="button"
                :class="{ 'active-block': place.policy === 'BLOCK' }"
                @click="setStatus(place.id, 'BLOCK')"
              >
                <span v-if="place.policy === 'BLOCK'">✓</span>
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
        검색 결과가 없습니다.
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
  getCategoryPolicyParentGroups,
  updateCategoryPolicies,
} from '@/api/categoryPolicy'


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

const searchQuery = ref('')

const isLoading = ref(false)
const isSaving = ref(false)

const errorMessage = ref('')

const allPlaces = computed(() =>
  parentGroups.value.flatMap((group) => group.items)
)

const filteredGroups = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) {
    return parentGroups.value
  }

  return parentGroups.value
    .map((group) => {
      if (group.name?.toLowerCase().includes(keyword)) {
        return group
      }

      return {
        ...group,
        items: group.items.filter((item) =>
          item.categoryName?.toLowerCase().includes(keyword)
        ),
      }
    })
    .filter((group) => group.items.length > 0)
})

const expandedGroups = ref({})

function isGroupExpanded(name) {
  if (searchQuery.value.trim()) return true
  return !!expandedGroups.value[name]
}

function toggleGroup(name) {
  if (searchQuery.value.trim()) return

  expandedGroups.value = {
    ...expandedGroups.value,
    [name]: !expandedGroups.value[name],
  }
}


// ========================================
// 카테고리 정책 전체 조회
//
// GET
// /api/v1/category-policies?childId=3
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


  console.log(
    '정책 변경:',
    {
      childId: childId.value,
      categoryId: id,
      policy,
    }
  )
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
  background-color: #ffffff;
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
  margin: 0 16px 16px;
  padding: 0 14px;
  height: 44px;
  border-radius: 12px;
  background-color: #f4f5f7;
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
  gap: 18px;
  padding: 0 16px;
}

.place-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.group-title {
  flex: 1;
  min-width: 0;
  margin: 0;
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
  gap: 10px;
}

.place-card {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #eaedf1;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.place-name {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
}

.place-btns {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 4px;
  border: none;
  border-radius: 24px;
  background-color: #f4f5f7;
  color: #8b9097;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
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