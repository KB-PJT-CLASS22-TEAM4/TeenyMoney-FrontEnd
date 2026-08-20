<template>
  <div class="page">

    <!-- 헤더 -->
    <header class="nav">
      <img
        src="@/assets/icons/icon-back.svg"
        alt=""
        class="back-icon"
        @click="router.push('/parents/home')"
      />

      <h1 class="nav-title">마이페이지</h1>

      <ParentNavActions />
    </header>

    <!-- 로딩 -->
    <div v-if="isLoading" class="state-box">
      <p class="state-text">
        회원 정보를 불러오는 중입니다.
      </p>
    </div>

    <!-- 오류 -->
    <div
      v-else-if="errorMessage"
      class="state-box error-state"
    >
      <p class="state-text">
        {{ errorMessage }}
      </p>

      <button
        type="button"
        class="retry-button"
        @click="goToLogin"
      >
        로그인 화면으로 이동
      </button>
    </div>

    <!-- 마이페이지 내용 -->
    <main v-else class="content">

      <!-- 프로필 -->
      <section class="profile-card">
        <button
          type="button"
          class="profile-image-wrapper"
          :disabled="isUploadingProfile"
          aria-label="프로필 사진 변경"
          @click="openProfilePicker"
        >
          <img
            :src="shownProfileImage"
            alt="프로필 이미지"
            class="profile-image"
            :class="{ photo: !isDefaultProfileShown }"
          />
          <span class="profile-edit-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path
                d="M4 8.5h2.2l1.1-2.2h9.4L18 8.5H20a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"
                stroke="#191b1e"
                stroke-width="1.6"
              />
              <circle cx="12" cy="14" r="3.2" stroke="#191b1e" stroke-width="1.6"/>
            </svg>
          </span>
        </button>
        <input
          ref="profileFileInput"
          class="profile-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="onProfileFileChange"
        />

        <div class="profile-text">
          <span class="role-badge">보호자</span>
          <strong class="member-name">
            {{ member.name || '-' }}
          </strong>
          <span class="member-birth">
            {{ formattedBirthDate || '-' }}
          </span>
        </div>
      </section>

      <!-- 회원 정보 -->
      <section class="info-card">
        <div class="info-item">
          <span class="info-label">연락처</span>
          <p class="info-value">
            {{ formattedPhoneNumber || '-' }}
          </p>
        </div>

        <div class="info-divider"></div>

        <div class="info-item">
          <span class="info-label">이메일</span>
          <p class="info-value">
            {{ member.email || '-' }}
          </p>
        </div>
      </section>

      <!-- 보안 -->
      <section class="menu-card">
        <div class="payment-password-row menu-border">
          <span class="menu-label">결제 비밀번호</span>
          <span
            class="status-pill"
            :class="hasPaymentPassword ? 'on' : 'off'"
          >
            {{ hasPaymentPassword ? '등록됨' : '미등록' }}
          </span>
        </div>

        <div class="payment-password-row">
          <span class="menu-label">비밀번호 변경</span>
        </div>
      </section>

      <!-- 연결된 자녀 -->
      <section class="section-block">
        <div class="section-head">
          <h2 class="section-title">연결된 자녀</h2>
          <span
            v-if="!isChildrenLoading && !childrenError"
            class="section-count"
          >
            {{ children.length }}명
          </span>
        </div>

        <div
          v-if="isChildrenLoading"
          class="section-card"
        >
          <p class="empty-message">
            자녀 정보를 불러오는 중입니다.
          </p>
        </div>

        <div
          v-else-if="childrenError"
          class="section-card"
        >
          <p class="empty-message children-error">
            {{ childrenError }}
          </p>
        </div>

        <div
          v-else
          class="section-card"
        >
          <template v-if="children.length > 0">
            <div
              v-for="(child, index) in children"
              :key="child.childId"
              class="child-item"
              :class="{
                'with-border': index !== children.length - 1
              }"
              @click="goToChildDetail(child.childId)"
            >
              <div class="child-info">
                <img
                  :src="childProfileImage(child)"
                  alt=""
                  class="child-icon"
                  :class="{ photo: isCustomChildProfile(child) }"
                />

                <div class="child-text">
                  <strong class="child-name">
                    {{ child.name }}
                  </strong>
                  <span
                    v-if="child.email"
                    class="child-email"
                  >
                    {{ child.email }}
                  </span>
                </div>
              </div>

              <div class="child-right">
                <button
                  type="button"
                  class="disconnect-button"
                  :disabled="unlinkingId === child.childId"
                  @click.stop="disconnectChild(child)"
                >
                  {{ unlinkingId === child.childId ? '해제 중...' : '연동 해제' }}
                </button>
                <span class="child-chevron">›</span>
              </div>
            </div>
          </template>

          <p
            v-else
            class="empty-message"
          >
            연결된 자녀가 없습니다.
          </p>
        </div>
      </section>

      <!-- 고객지원 -->
      <section class="section-block">
        <h2 class="section-title">고객지원</h2>

        <div class="menu-card">
          <button
            type="button"
            class="menu-button menu-border"
            @click="goToFaq"
          >
            <span class="menu-label">FAQ</span>
            <span class="chevron">›</span>
          </button>

          <button
            type="button"
            class="menu-button"
            @click="goToTerms"
          >
            <span class="menu-label">약관 및 정책</span>
            <span class="chevron">›</span>
          </button>
        </div>
      </section>

      <!-- 계정관리 -->
      <section class="section-block">
        <h2 class="section-title">계정관리</h2>

        <div class="menu-card">
          <button
            type="button"
            class="menu-button menu-border"
            @click="logout"
          >
            <span class="menu-label">로그아웃</span>
          </button>

          <button
            type="button"
            class="menu-button danger"
          >
            <span class="menu-label">회원 탈퇴</span>
          </button>
        </div>
      </section>
    </main>

    <ParentBottomNav active="mypage" />
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
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getMyInfo, updateMyProfileImage } from '@/api/member'
import { getChildren } from '@/api/children'
import { unlinkFamily } from '@/api/families'
import {
  PARENT_PROFILE_IMAGE,
  CHILD_PROFILE_IMAGE,
  pickProfileImageUrl,
  getSharedDefaultProfileKeys,
  resolveProfileImageUrl,
} from '@/utils/profileImages'

const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024

const router = useRouter()
const authStore = useAuthStore()
const alertModal = useAlertModal()

/* =========================
   회원 정보 상태
========================= */

const isLoading = ref(false)
const errorMessage = ref('')

const member = reactive({
  memberId: null,
  role: '',
  name: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  profileImageUrl: '',
  hasPaymentPassword: false,
})

/* =========================
   자녀 목록 상태
========================= */

const children = ref([])

const isChildrenLoading = ref(false)
const childrenError = ref('')
const unlinkingId = ref(null)
const profileFileInput = ref(null)
const localPreviewUrl = ref('')
const isUploadingProfile = ref(false)

const sharedDefaultProfileKeys = computed(() =>
  getSharedDefaultProfileKeys([
    member.profileImageUrl,
    ...children.value.map((child) => child.profileImageUrl),
  ])
)

const displayProfileImage = computed(() =>
  resolveProfileImageUrl(
    member.profileImageUrl,
    PARENT_PROFILE_IMAGE,
    sharedDefaultProfileKeys.value
  )
)

const shownProfileImage = computed(() =>
  localPreviewUrl.value || displayProfileImage.value
)

const isDefaultProfileShown = computed(() =>
  shownProfileImage.value === PARENT_PROFILE_IMAGE
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

function clearLocalPreview() {
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = ''
  }
}

function applyMember(data) {
  if (!data) {
    return
  }

  Object.assign(member, {
    memberId: data.memberId,
    role: data.role,
    name: data.name,
    email: data.email,
    phoneNumber: data.phoneNumber,
    birthDate: data.birthDate,
    profileImageUrl: data.profileImageUrl || '',
    hasPaymentPassword: Boolean(data.hasPaymentPassword),
  })
}

/* =========================
   생년월일 포맷
   1999-01-01
   →
   1999.01.01
========================= */

const formattedBirthDate = computed(() => {
  if (!member.birthDate) {
    return ''
  }

  return member.birthDate.replaceAll('-', '.')
})

const hasPaymentPassword = computed(() => Boolean(member.hasPaymentPassword))

/* =========================
   휴대폰 번호 포맷
========================= */

const formattedPhoneNumber = computed(() => {
  const phone =
    member.phoneNumber?.replace(/[^0-9]/g, '')

  if (!phone) {
    return ''
  }

  if (phone.length === 11) {
    return phone.replace(
      /(\d{3})(\d{4})(\d{4})/,
      '$1-$2-$3'
    )
  }

  if (phone.length === 10) {
    return phone.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3'
    )
  }

  return member.phoneNumber
})

/* =========================
   회원 정보 조회
========================= */

async function fetchMyInfo() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (!authStore.accessToken) {
      errorMessage.value =
        '로그인이 필요합니다.'

      return
    }

    const data = await getMyInfo(
      authStore.accessToken
    )

    applyMember(data)

    if (
      typeof authStore.updateUserInfo ===
      'function'
    ) {
      authStore.updateUserInfo({
        memberId: data.memberId,
        role: data.role,
        name: data.name,
      })
    }

  } catch (error) {

    console.error(
      '회원 정보 조회 실패:',
      error
    )

    if (error.status === 401) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
      return
    }

    errorMessage.value =
      error.message
      || '회원 정보를 불러오지 못했습니다.'

  } finally {
    isLoading.value = false
  }
}

/* =========================
   연결된 자녀 목록 조회
========================= */

async function fetchChildren() {
  isChildrenLoading.value = true
  childrenError.value = ''

  try {
    if (!authStore.accessToken) {
      childrenError.value =
        '로그인이 필요합니다.'

      return
    }

    const res = await getChildren(
      authStore.accessToken
    )

    if (res.success) {

      children.value = res.data.map(
        (child) => ({
          childId: child.childId,
          name: child.name,
          email: child.email,
          balance: child.balance,
          teenyScore: child.teenyScore,
          profileImageUrl: pickProfileImageUrl(child),
        })
      )
    }

  } catch (error) {

    console.error(
      '자녀 목록 불러오기 실패:',
      error
    )

    childrenError.value =
      '자녀 정보를 불러오지 못했습니다.'

  } finally {
    isChildrenLoading.value = false
  }
}

/* =========================
   자녀 상세 페이지 이동
========================= */

function goToChildDetail(childId) {
  router.push(
    `/parents/children/${childId}`
  )
}

/* =========================
   자녀 연동 해제
========================= */

async function disconnectChild(child) {
  if (unlinkingId.value) {
    return
  }

  const confirmed = await alertModal.showConfirm(
    `${child.name} 자녀와의 연동을 해제하시겠습니까?`
  )

  if (!confirmed) {
    return
  }

  unlinkingId.value = child.childId

  try {
    await unlinkFamily(
      authStore.accessToken,
      child.childId
    )

    children.value =
      children.value.filter(
        (item) =>
          item.childId !== child.childId
      )

    alertModal.showAlert(
      '자녀 연동이 해제되었습니다.'
    )

  } catch (error) {

    console.error(
      '자녀 연동 해제 실패:',
      error
    )

    alertModal.showAlert(
      error.message
      || '자녀 연동을 해제하지 못했습니다.'
    )
  } finally {
    unlinkingId.value = null
  }
}

/* =========================
   로그인 이동
========================= */

function goToLogin() {
  authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
}

function goToFaq() {
  router.push({ name: 'parents-faq' })
}

function goToTerms() {
  router.push({ name: 'parents-terms' })
}

function openProfilePicker() {
  if (isUploadingProfile.value) {
    return
  }

  profileFileInput.value?.click()
}

async function onProfileFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    alertModal.showAlert('이미지 파일만 선택할 수 있어요.')
    return
  }

  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    alertModal.showAlert('프로필 사진은 5MB 이하만 업로드할 수 있어요.')
    return
  }

  if (!authStore.accessToken) {
    alertModal.showAlert('로그인이 필요합니다.')
    return
  }

  clearLocalPreview()
  localPreviewUrl.value = URL.createObjectURL(file)
  isUploadingProfile.value = true

  try {
    const data = await updateMyProfileImage(
      authStore.accessToken,
      file
    )

    if (data?.profileImageUrl) {
      member.profileImageUrl = data.profileImageUrl
      clearLocalPreview()
    } else {
      const refreshed = await getMyInfo(authStore.accessToken)
      if (refreshed?.profileImageUrl) {
        member.profileImageUrl = refreshed.profileImageUrl
        clearLocalPreview()
      }
    }
  } catch (error) {
    console.error('프로필 이미지 변경 실패:', error)
    clearLocalPreview()
    alertModal.showAlert(
      error.message || '프로필 이미지를 변경하지 못했습니다.'
    )
  } finally {
    isUploadingProfile.value = false
  }
}

/* =========================
   로그아웃
========================= */

async function logout() {

  const confirmed = await alertModal.showConfirm(
    '로그아웃하시겠습니까?'
  )

  if (!confirmed) {
    return
  }

  authStore.clearUser()
  router.replace('/login')
}

/* =========================
   화면 진입
========================= */

onMounted(() => {
  fetchMyInfo()
  fetchChildren()
})

onBeforeUnmount(() => {
  clearLocalPreview()
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

.back-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
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
  gap: 16px;
  padding: 16px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border: none;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.profile-image-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  padding: 3px;
  border: none;
  border-radius: 50%;
  background: #ffbc00;
  cursor: pointer;
}

.profile-image-wrapper:disabled {
  cursor: default;
  opacity: 0.7;
}

.profile-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: contain;
  background-color: #ffffff;
}

.profile-image.photo {
  object-fit: cover;
}

.profile-edit-badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #ffbc00;
}

.profile-file-input {
  display: none;
}

.profile-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.role-badge {
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 11px;
  font-weight: 700;
}

.member-name {
  overflow: hidden;
  color: #191b1e;
  font-size: 20px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-birth {
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
}

.info-card,
.menu-card,
.section-card {
  overflow: hidden;
  border: none;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.info-card {
  padding: 4px 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
}

.info-label {
  flex-shrink: 0;
  color: #8b9097;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.info-value {
  margin: 0;
  min-width: 0;
  color: #191b1e;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  text-align: right;
  overflow-wrap: anywhere;
}

.info-divider {
  height: 1px;
  background: #e8eaee;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.section-title {
  margin: 0 0 0 4px;
  color: #8b9097;
  font-size: 13px;
  font-weight: 700;
}

.section-head .section-title {
  margin: 0;
}

.section-count {
  color: #b9bec5;
  font-size: 12px;
  font-weight: 700;
}

.menu-button,
.payment-password-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 54px;
  padding: 0 16px;
  border: none;
  color: #191b1e;
  background-color: transparent;
  text-align: left;
}

.menu-button {
  cursor: pointer;
}

.menu-button:active {
  background-color: #fafafa;
}

.menu-label {
  font-size: 15px;
  font-weight: 700;
}

.menu-border {
  border-bottom: 1px solid #e8eaee;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.on {
  background: #ffbc00;
  color: #191b1e;
}

.status-pill.off {
  border: 1px solid #e8eaee;
  background: #ffffff;
  color: #8b9097;
}

.chevron,
.child-chevron {
  color: #c5cad0;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
}

.menu-button.danger .menu-label {
  color: #e24b4a;
}

.child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 10px 14px;
  cursor: pointer;
}

.child-item:active {
  background-color: #fafafa;
}

.child-item.with-border {
  border-bottom: 1px solid #e8eaee;
}

.child-info {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.child-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid #e8eaee;
  border-radius: 50%;
  object-fit: contain;
  background-color: #ffffff;
}

.child-icon.photo {
  object-fit: cover;
}

.child-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.child-name {
  overflow: hidden;
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-email {
  overflow: hidden;
  max-width: 140px;
  color: #8b9097;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.disconnect-button {
  padding: 6px 10px;
  border: 1px solid #e8eaee;
  border-radius: 999px;
  color: #6b7077;
  background-color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.disconnect-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.empty-message {
  margin: 0;
  padding: 28px 16px;
  color: #b9bec5;
  font-size: 13px;
  text-align: center;
}

.children-error {
  color: #d14343;
}

.state-box {
  padding: 120px 20px;
  text-align: center;
}

.state-text {
  margin: 0;
  color: #8b9097;
  font-size: 14px;
}

.error-state .state-text {
  color: #d14343;
}

.retry-button {
  margin-top: 16px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  color: #191b1e;
  font-size: 13px;
  font-weight: 700;
  background-color: #ffbc00;
  cursor: pointer;
}
</style>