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


      <!-- 정책 목록 -->
      <div v-else>

        <!-- 허용 -->
        <div class="policy-card">

          <p class="policy-label allow">
            ✓ 허용
          </p>

          <p
            v-for="item in allowList"
            :key="item.id"
            class="policy-item"
          >
            {{ item.merchantCategoryName }}
          </p>

          <p
            v-if="allowList.length === 0"
            class="empty-policy"
          >
            설정된 업종이 없습니다.
          </p>

        </div>


        <!-- 주의 -->
        <div class="policy-card">

          <p class="policy-label caution">
            ⚠ 주의
          </p>

          <p
            v-for="item in cautionList"
            :key="item.id"
            class="policy-item"
          >
            {{ item.merchantCategoryName }}
          </p>

          <p
            v-if="cautionList.length === 0"
            class="empty-policy"
          >
            설정된 업종이 없습니다.
          </p>

        </div>


        <!-- 차단 -->
        <div class="policy-card">

          <p class="policy-label block">
            🚫 차단
          </p>

          <p
            v-for="item in blockList"
            :key="item.id"
            class="policy-item"
          >
            {{ item.merchantCategoryName }}
          </p>

          <p
            v-if="blockList.length === 0"
            class="empty-policy"
          >
            설정된 업종이 없습니다.
          </p>

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


        <!-- 요청 로딩 -->
        <div
          v-if="isPermissionLoading"
          class="state-box"
        >
          <p>불러오는 중입니다...</p>
        </div>


        <!-- 요청 없음 -->
        <div
          v-else-if="!pendingRequests.length"
          class="empty-request"
        >
          <p>
            오늘만 허용 요청이 없습니다.
          </p>
        </div>


        <!-- 요청 목록 -->
        <div v-else>

          <div
            v-for="req in pendingRequests"
            :key="req.id"
            class="request-card"
          >

            <div class="request-top">

              <span class="request-status block">
                차단
              </span>

              <span class="request-name">
                {{ req.child ? req.child.name : '' }}
              </span>

              <span class="request-time">
                {{ formatTime(req.createdAt) }}
              </span>

            </div>


            <p class="request-desc">
              {{ req.reason }}
            </p>


            <div class="request-btns">

              <button
                class="btn btn-secondary"
                :disabled="req.status !== 'PENDING'"
                @click="handleReject(req.id)"
              >
                거절
              </button>

              <button
                class="btn btn-primary"
                :disabled="req.status !== 'PENDING'"
                @click="handleAccept(req.id)"
              >
                승인
              </button>

            </div>

          </div>

        </div>

      </div>

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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import {
  getCategoryPolicyGroups
} from '@/api/categoryPolicy'

import {
  getPermissions,
  approvePermission,
  rejectPermission
} from '@/api/permissions'


const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()


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

const allowList = ref([])
const cautionList = ref([])
const blockList = ref([])

const isLoading = ref(false)
const errorMessage = ref('')


// ========================================
// 오늘만 허용 요청
// ========================================

const pendingRequests = ref([])
const isPermissionLoading = ref(false)


// ========================================
// 시간 포맷
// ========================================

function formatTime(createdAt) {

  if (!createdAt) return ''

  const date = new Date(createdAt)
  const now = new Date()

  const diff = Math.floor(
    (now - date) / 1000 / 60
  )

  if (diff < 1) {
    return '방금 전'
  }

  if (diff < 60) {
    return `${diff}분 전`
  }

  if (diff < 1440) {
    return `${Math.floor(diff / 60)}시간 전`
  }

  return `${Math.floor(diff / 1440)}일 전`
}


// ========================================
// 카테고리 정책 조회
//
// GET
// /api/v1/category-policies/groups?childId=...
// ========================================

async function fetchCategoryPolicies() {

  if (!childId.value) {
    errorMessage.value =
      '선택된 자녀 정보가 없습니다.'
    return
  }

  if (!authStore.accessToken) {
    alert('로그인이 필요합니다.')
    router.replace('/login')
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
      await getCategoryPolicyGroups(
        authStore.accessToken,
        childId.value
      )

    console.log(
      '카테고리 정책 응답:',
      res
    )

    // 이전 데이터 초기화
    allowList.value = []
    cautionList.value = []
    blockList.value = []


    if (
      res.success &&
      Array.isArray(res.data)
    ) {

      res.data.forEach(group => {

        const list =
          group.categoryPolicyList || []

        if (group.policy === 'ALLOW') {
          allowList.value = list
        }

        else if (
          group.policy === 'CAUTION'
        ) {
          cautionList.value = list
        }

        else if (
          group.policy === 'BLOCK'
        ) {
          blockList.value = list
        }

      })

    }

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
    alert('선택된 자녀 정보가 없습니다.')
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

    const res =
      await getPermissions(
        authStore.accessToken
      )

    if (
      res.success &&
      res.data?.isExist
    ) {

      pendingRequests.value = [
        res.data.permission
      ]

    } else {

      pendingRequests.value = []

    }

  } catch (error) {

    console.error(
      '오늘만 허용 요청 불러오기 실패:',
      error
    )

  } finally {

    isPermissionLoading.value = false

  }
}


// ========================================
// 승인
// ========================================

async function handleAccept(id) {

  try {

    await approvePermission(
      authStore.accessToken,
      id
    )

    alert('승인되었습니다!')

    await fetchPermissions()

    // 현재 선택된 자녀 정책 다시 조회
    await fetchCategoryPolicies()

  } catch (error) {

    console.error(
      '승인 실패:',
      error
    )

    alert('승인에 실패했습니다.')

  }
}


// ========================================
// 거절
// ========================================

async function handleReject(id) {

  try {

    await rejectPermission(
      authStore.accessToken,
      id
    )

    alert('거절되었습니다.')

    await fetchPermissions()

  } catch (error) {

    console.error(
      '거절 실패:',
      error
    )

    alert('거절에 실패했습니다.')

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

    alert('로그인이 필요합니다.')

    router.replace('/login')

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
  background-color: #f4f5f7;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.policy-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.policy-label.allow {
  color: #34c759;
}

.policy-label.caution {
  color: #ff9500;
}

.policy-label.block {
  color: #ff3b30;
}

.policy-item {
  margin: 0;
  font-size: 14px;
  color: #191b1e;
  padding-left: 8px;
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

.empty-request {
  padding: 20px 0;
  text-align: center;
  color: #b9bec5;
  font-size: 13px;
}

.request-card {
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
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

.request-time {
  font-size: 12px;
  color: #8b9097;
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

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>