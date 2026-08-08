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
      <div
        v-for="place in filteredPlaces"
        :key="place.id"
        class="place-card"
      >

        <p class="place-name">
          {{ place.merchantCategoryName }}
        </p>


        <div class="place-btns">

          <!-- 허용 -->
          <button
            class="status-btn"
            :class="{
              'active-allow':
                place.policy === 'ALLOW'
            }"
            @click="setStatus(
              place.id,
              'ALLOW'
            )"
          >
            <span
              v-if="place.policy === 'ALLOW'"
            >
              ✓
            </span>

            허용
          </button>


          <!-- 주의 -->
          <button
            class="status-btn"
            :class="{
              'active-caution':
                place.policy === 'CAUTION'
            }"
            @click="setStatus(
              place.id,
              'CAUTION'
            )"
          >
            <span
              v-if="place.policy === 'CAUTION'"
            >
              ✓
            </span>

            주의
          </button>


          <!-- 차단 -->
          <button
            class="status-btn"
            :class="{
              'active-block':
                place.policy === 'BLOCK'
            }"
            @click="setStatus(
              place.id,
              'BLOCK'
            )"
          >
            <span
              v-if="place.policy === 'BLOCK'"
            >
              ✓
            </span>

            차단
          </button>

        </div>
      </div>


      <!-- 검색 결과 없음 -->
      <div
        v-if="filteredPlaces.length === 0"
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


    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">

      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/home')"
      >
        <img
          src="@/assets/icons/icon-home.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          홈
        </span>
      </button>


      <button
        class="nav-item nav-item-active"
        type="button"
        @click="router.push('/parents/childlist')"
      >
        <img
          src="@/assets/icons/icon-child-alive.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          자녀관리
        </span>
      </button>


      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/mypage')"
      >
        <img
          src="@/assets/icons/icon-mypage.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          마이페이지
        </span>
      </button>

    </nav>

  </div>
</template>


<script setup>
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
  getCategoryPolicies,
  updateCategoryPolicies,
} from '@/api/categoryPolicy'


const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()


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

const places = ref([])

const searchQuery = ref('')

const isLoading = ref(false)
const isSaving = ref(false)

const errorMessage = ref('')


// ========================================
// 검색
// ========================================

const filteredPlaces = computed(() => {

  const keyword =
    searchQuery.value
      .trim()
      .toLowerCase()

  if (!keyword) {
    return places.value
  }

  return places.value.filter(
    place =>
      place.merchantCategoryName
        ?.toLowerCase()
        .includes(keyword)
  )
})


// ========================================
// 카테고리 정책 전체 조회
//
// GET
// /api/v1/category-policies?childId=3
// ========================================

async function fetchPlaces() {

  if (!authStore.accessToken) {

    alert('로그인이 필요합니다.')

    authStore.clearUser()

    router.replace('/login')

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
      await getCategoryPolicies(
        authStore.accessToken,
        childId.value
      )


    console.log(
      '전체 카테고리 정책 응답:',
      res
    )


    if (
      res.success &&
      Array.isArray(res.data)
    ) {

      places.value =
        res.data.map(item => ({
          id: item.id,

          merchantCategoryName:
            item.merchantCategoryName,

          policy:
            item.policy,
        }))

    } else {

      places.value = []

    }


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

      authStore.clearUser()

      alert(
        '로그인 세션이 만료되었습니다.'
      )

      router.replace('/login')

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
    places.value.find(
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

    alert('로그인이 필요합니다.')

    authStore.clearUser()

    router.replace('/login')

    return
  }


  if (!childId.value) {

    alert(
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
      places.value.map(
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


    alert(
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

      authStore.clearUser()

      alert(
        '로그인 세션이 만료되었습니다.'
      )

      router.replace('/login')

      return
    }


    alert(
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
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 150px;
  background-color: #f4f5f7;
  color: #191b1e;
}


/* =========================
   헤더
========================= */

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 20px;
  background-color: #f4f5f7;
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
}


/* =========================
   안내 배너
========================= */

.notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 10px 16px 14px;
  padding: 12px;
  border-radius: 10px;
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
  border-radius: 10px;
  background-color: #ffffff;
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
  gap: 12px;
  padding: 0 16px;
}

.place-card {
  padding: 16px;
  border-radius: 16px;
  background-color: #ffffff;
}

.place-name {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
}

.place-btns {
  display: flex;
  gap: 10px;
}

.status-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 24px;
  background-color: #f4f5f7;
  color: #8b9097;
  font-size: 14px;
  font-weight: 700;
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
  bottom: 90px;
  left: 50%;
  z-index: 99;

  width: 100%;
  max-width: 360px;

  padding: 0 50px;

  box-sizing: border-box;

  transform:
    translateX(-50%);
}

.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
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


/* =========================
   하단 네비게이션
========================= */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 100;

  display: flex;
  justify-content: space-around;

  width: 360px;

  padding: 10px 0 20px;

  border-top: 1px solid #f0f1f3;

  background-color: #ffffff;

  transform:
    translateX(-50%);
}

.nav-item {
  display: flex;
  min-width: 70px;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  color: #8b9097;
  font-size: 11px;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>