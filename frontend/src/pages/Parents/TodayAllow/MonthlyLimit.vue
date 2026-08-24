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
      <h1 class="nav-title">오늘만 허용 한도 설정</h1>
      <ParentNavActions />
    </header>

    <main class="content">
      <p class="intro">
        한 달에 자녀가 오늘만 허용을 요청할 수 있는 횟수를 설정해요.
        설정하지 않으면 티니등급 기본 한도가 적용돼요.
      </p>

      <div v-if="isLoading" class="state-card">
        자녀 한도 정보를 불러오는 중입니다.
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button
          class="retry-btn"
          type="button"
          @click="loadPage"
        >
          다시 시도
        </button>
      </div>

      <div v-else-if="children.length === 0" class="state-card">
        연결된 자녀가 없습니다.
      </div>

      <article
        v-for="child in children"
        :key="child.childId"
        class="child-card"
      >
        <div class="child-head">
          <img
            :src="childProfileImage(child)"
            alt=""
            class="child-avatar"
            :class="{ photo: isCustomChildProfile(child) }"
          />

          <div class="child-text">
            <strong class="child-name">{{ child.name }}</strong>
            <span
              class="limit-badge"
              :class="{ custom: child.customizedByParent }"
            >
              {{ child.customizedByParent ? '직접 설정' : '등급 기본' }}
            </span>
          </div>
        </div>

        <div v-if="child.loadError" class="child-error-box">
          <p class="child-error">{{ child.loadError }}</p>
          <button
            type="button"
            class="retry-btn compact"
            :disabled="child.saving"
            @click="reloadChild(child)"
          >
            다시 시도
          </button>
        </div>

        <template v-else>
          <div class="meta-row">
            <span>이번 달 사용 {{ child.usedDays }}회</span>
            <span class="meta-dot">·</span>
            <span>남은 {{ child.remainingDays }}회</span>
          </div>
          <p class="grade-hint">
            티니등급 기본 한도 {{ child.gradeDefaultLimit }}회
          </p>

          <div class="stepper">
            <button
              type="button"
              class="stepper-btn"
              aria-label="한도 줄이기"
              :disabled="child.draftLimit <= MIN_LIMIT || child.saving"
              @click="changeLimit(child, -1)"
            >
              −
            </button>
            <div class="stepper-value">
              <strong>{{ child.draftLimit }}</strong>
              <span>회 / 월</span>
            </div>
            <button
              type="button"
              class="stepper-btn"
              aria-label="한도 늘리기"
              :disabled="child.draftLimit >= MAX_LIMIT || child.saving"
              @click="changeLimit(child, 1)"
            >
              +
            </button>
          </div>

          <div class="card-actions">
            <button
              type="button"
              class="reset-btn"
              :disabled="
                child.saving ||
                child.draftLimit === child.gradeDefaultLimit
              "
              @click="applyGradeDefault(child)"
            >
              등급 기본값
            </button>
            <button
              type="button"
              class="save-btn"
              :disabled="!isDirty(child) || child.saving"
              @click="saveLimit(child)"
            >
              {{ child.saving ? '저장 중...' : '저장' }}
            </button>
          </div>
        </template>
      </article>
    </main>

    <ParentBottomNav active="mypage" />
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'
import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'
import {
  getChildMonthlyLimit,
  updateChildMonthlyLimit,
} from '@/api/permissions'
import {
  CHILD_PROFILE_IMAGE,
  getSharedDefaultProfileKeys,
  pickProfileImageUrl,
  resolveProfileImageUrl,
} from '@/utils/profileImages'

const MIN_LIMIT = 0
const MAX_LIMIT = 31

const router = useRouter()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const isLoading = ref(false)
const errorMessage = ref('')
const children = ref([])

const sharedDefaultProfileKeys = computed(() =>
  getSharedDefaultProfileKeys(
    children.value.map((child) => child.profileImageUrl)
  )
)

function childProfileImage(child) {
  return resolveProfileImageUrl(
    child?.profileImageUrl,
    CHILD_PROFILE_IMAGE,
    sharedDefaultProfileKeys.value
  )
}

function isCustomChildProfile(child) {
  return childProfileImage(child) !== CHILD_PROFILE_IMAGE
}

function firstFinite(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      continue
    }
    const number = Number(value)
    if (Number.isFinite(number)) {
      return Math.trunc(number)
    }
  }
  return 0
}

function clampLimit(value) {
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value))
}

function hasConfiguredLimit(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
}

function applyLimitData(child, data) {
  const gradeDefaultLimit = firstFinite(data?.gradeDefaultLimit)
  const effectiveLimit = firstFinite(data?.effectiveLimit, gradeDefaultLimit)
  const customizedByParent = Boolean(data?.customizedByParent)
  const parentLimit = hasConfiguredLimit(data?.parentConfiguredLimit)
    ? Math.trunc(Number(data.parentConfiguredLimit))
    : null

  child.customizedByParent = customizedByParent
  child.effectiveLimit = effectiveLimit
  child.gradeDefaultLimit = gradeDefaultLimit
  child.parentConfiguredLimit = parentLimit
  child.remainingDays = firstFinite(data?.remainingDays)
  child.usedDays = firstFinite(data?.usedDays)
  child.draftLimit = clampLimit(
    customizedByParent && parentLimit !== null ? parentLimit : effectiveLimit
  )
  child.loadError = ''
}

function isDirty(child) {
  const current =
    child.customizedByParent && child.parentConfiguredLimit !== null
      ? child.parentConfiguredLimit
      : firstFinite(child.effectiveLimit, child.gradeDefaultLimit)

  return child.draftLimit !== current
}

function changeLimit(child, delta) {
  child.draftLimit = clampLimit(child.draftLimit + delta)
}

function applyGradeDefault(child) {
  child.draftLimit = clampLimit(child.gradeDefaultLimit)
}

async function loadPage() {
  isLoading.value = true
  errorMessage.value = ''
  children.value = []

  try {
    if (!authStore.accessToken) {
      errorMessage.value = '로그인이 필요합니다.'
      return
    }

    const result = await getChildren(authStore.accessToken)
    const list = result?.data ?? []

    children.value = list.map((child) => ({
      childId: child.childId,
      name: child.name,
      profileImageUrl: pickProfileImageUrl(child),
      customizedByParent: false,
      effectiveLimit: 0,
      gradeDefaultLimit: 0,
      parentConfiguredLimit: null,
      remainingDays: 0,
      usedDays: 0,
      draftLimit: 0,
      saving: false,
      loadError: '',
    }))

    await Promise.all(children.value.map((child) => reloadChild(child)))
  } catch (error) {
    console.error('자녀 목록 조회 실패:', error)

    if (error.status === 401) {
      authStore.handleUnauthorized(
        '로그인이 만료되었습니다.\n다시 로그인해 주세요.'
      )
      return
    }

    errorMessage.value =
      error.message || '자녀 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

async function reloadChild(child) {
  child.saving = true
  child.loadError = ''

  try {
    const data = await getChildMonthlyLimit(
      authStore.accessToken,
      child.childId
    )
    applyLimitData(child, data)
  } catch (error) {
    console.error('오늘만 허용 한도 조회 실패:', error)
    child.loadError = error.message || '한도 정보를 불러오지 못했습니다.'
  } finally {
    child.saving = false
  }
}

async function saveLimit(child) {
  if (child.saving || !isDirty(child)) {
    return
  }

  child.saving = true

  try {
    const data = await updateChildMonthlyLimit(
      authStore.accessToken,
      child.childId,
      child.draftLimit
    )
    applyLimitData(child, data)
    await alertModal.showAlert(
      `${child.name}의 오늘만 허용 요청 한도를 ${child.draftLimit}회로 저장했어요.`,
      '알림',
      'success',
    )
  } catch (error) {
    console.error('오늘만 허용 한도 저장 실패:', error)
    await alertModal.showAlert(
      error.message || '오늘만 허용 한도를 저장하지 못했습니다.'
    )
  } finally {
    child.saving = false
  }
}

onMounted(() => {
  loadPage()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.page {
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 88px;
  color: #191b1e;
  background: #f8fafc;
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #eceef1;
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
  position: absolute;
  left: 50%;
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  transform: translateX(-50%);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.intro {
  margin: 0 4px 4px;
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.state-card,
.child-card {
  overflow: hidden;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.state-card {
  padding: 28px 16px;
  color: #b9bec5;
  font-size: 13px;
  text-align: center;
}

.state-card.error {
  color: #d14343;
}

.retry-btn {
  margin-top: 12px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  color: #191b1e;
  font-size: 13px;
  font-weight: 700;
  background-color: #ffbc00;
  cursor: pointer;
}

.child-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.child-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.child-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid #e8eaee;
  border-radius: 50%;
  object-fit: contain;
  background-color: #ffffff;
}

.child-avatar.photo {
  object-fit: cover;
}

.child-text {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.child-name {
  overflow: hidden;
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.limit-badge {
  flex-shrink: 0;
  padding: 4px 8px;
  border: 1px solid #e8eaee;
  border-radius: 999px;
  background: #ffffff;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
}

.limit-badge.custom {
  border: none;
  background: #ffbc00;
  color: #191b1e;
}

.child-error-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.child-error {
  margin: 0;
  color: #d14343;
  font-size: 13px;
}

.retry-btn.compact {
  margin-top: 0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7077;
  font-size: 12px;
  font-weight: 600;
}

.meta-dot {
  color: #d0d3d8;
}

.grade-hint {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
  font-weight: 600;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f4f5f7;
}

.stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #191b1e;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.stepper-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.stepper-value strong {
  color: #191b1e;
  font-size: 24px;
  font-weight: 800;
}

.stepper-value span {
  color: #8b9097;
  font-size: 13px;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.reset-btn,
.save-btn {
  height: 42px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.reset-btn {
  flex: 0 0 108px;
  background: #f4f5f7;
  color: #191b1e;
}

.save-btn {
  flex: 1;
  background: #ffbc00;
  color: #191b1e;
}

.reset-btn:disabled,
.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
