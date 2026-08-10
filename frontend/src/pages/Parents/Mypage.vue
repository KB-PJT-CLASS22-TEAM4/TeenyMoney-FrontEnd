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

      <button
        class="alarm-btn"
        type="button"
        aria-label="알림"
      >
        <img
          src="@/assets/icons/icon-notification.svg"
          alt=""
          class="alarm-icon"
        />
      </button>
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
      <section class="profile-section">
        <div class="profile-image-wrapper">

          <img
            v-if="member.profileImageUrl"
            :src="member.profileImageUrl"
            alt="프로필 이미지"
            class="profile-image"
            @error="handleProfileImageError"
          />

          <div
            v-else
            class="default-profile"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="17"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />

              <path
                d="M9 46C9 35.5066 16.6112 29 26 29C35.3888 29 43 35.5066 43 46"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>

        <div class="profile-text">
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

        <!-- 연락처 -->
        <div class="info-item">
          <div class="info-heading">
            <span class="info-label">
              연락처
            </span>

            <button
              type="button"
              class="edit-button"
              @click="goToPhoneEdit"
            >
              수정
            </button>
          </div>

          <p class="info-value">
            {{ formattedPhoneNumber || '-' }}
          </p>
        </div>

        <!-- 이메일 -->
        <div class="info-item">
          <div class="info-heading">
            <span class="info-label">
              이메일
            </span>

            <button
              type="button"
              class="edit-button"
              @click="goToEmailEdit"
            >
              수정
            </button>
          </div>

          <p class="info-value email-value">
            {{ member.email || '-' }}
          </p>
        </div>
      </section>

      <!-- 비밀번호 변경 -->
      <section class="menu-card">
        <button
          type="button"
          class="menu-button"
          @click="goToPasswordChange"
        >
          <span>비밀번호 변경</span>
          <span class="chevron">›</span>
        </button>
      </section>

      <!-- 연결된 자녀 -->
      <section class="section-block">

        <h2 class="section-title">
          연결된 자녀
        </h2>

        <!-- 자녀 로딩 -->
        <div
          v-if="isChildrenLoading"
          class="section-card"
        >
          <p class="empty-message">
            자녀 정보를 불러오는 중입니다.
          </p>
        </div>

        <!-- 자녀 조회 에러 -->
        <div
          v-else-if="childrenError"
          class="section-card"
        >
          <p class="empty-message children-error">
            {{ childrenError }}
          </p>
        </div>

        <!-- 자녀 목록 -->
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
                  :src="
                    child.profileImageUrl
                      || '/src/assets/icons/child-profile.svg'
                  "
                  alt=""
                  class="child-icon"
                  @error="
                    (e) =>
                      e.target.src =
                        '/src/assets/icons/child-profile.svg'
                  "
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
                  @click.stop="disconnectChild(child)"
                >
                  연동 해제
                </button>

                <span class="child-chevron">
                  ›
                </span>
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

        <h2 class="section-title">
          고객지원
        </h2>

        <div class="menu-card">

          <button
            type="button"
            class="menu-button menu-border"
            @click="goToFaq"
          >
            <span>자주 묻는 질문</span>
            <span class="chevron">›</span>
          </button>

          <button
            type="button"
            class="menu-button menu-border"
            @click="goToInquiry"
          >
            <span>문의하기</span>
            <span class="chevron">›</span>
          </button>

          <button
            type="button"
            class="menu-button"
            @click="goToPolicy"
          >
            <span>약관 및 정책</span>
            <span class="chevron">›</span>
          </button>

        </div>
      </section>

      <!-- 계정관리 -->
      <section class="section-block">

        <h2 class="section-title">
          계정관리
        </h2>

        <div class="menu-card">

          <button
            type="button"
            class="menu-button menu-border"
            @click="logout"
          >
            <span>로그아웃</span>
            <span class="chevron">›</span>
          </button>

          <button
            type="button"
            class="menu-button"
            @click="withdraw"
          >
            <span>회원 탈퇴</span>
            <span class="chevron">›</span>
          </button>

        </div>
      </section>
    </main>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">

      <!-- 홈 -->
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

      <!-- 자녀관리 -->
      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/childlist')"
      >
        <img
          src="@/assets/icons/icon-child.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          자녀관리
        </span>
      </button>

      <!-- 마이페이지 -->
      <button
        class="nav-item nav-item-active"
        type="button"
      >
        <img
          src="@/assets/icons/icon-mypage-alive.svg"
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
  reactive,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getMyInfo } from '@/api/member'
import { getChildren } from '@/api/children'

const router = useRouter()
const authStore = useAuthStore()

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
})

/* =========================
   자녀 목록 상태
========================= */

const children = ref([])

const isChildrenLoading = ref(false)
const childrenError = ref('')

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

    Object.assign(member, {
      memberId: data.memberId,
      role: data.role,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      birthDate: data.birthDate,
      profileImageUrl:
        data.profileImageUrl || '',
    })

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
      authStore.clearUser()

      errorMessage.value =
        '로그인이 필요합니다.'

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
          profileImageUrl:
            child.profileImageUrl || '',
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

  const confirmed = window.confirm(
    `${child.name} 자녀와의 연동을 해제하시겠습니까?`
  )

  if (!confirmed) {
    return
  }

  try {

    /*
     * TODO:
     * 자녀 연동 해제 API가 생기면 여기서 호출
     *
     * await unlinkChild(
     *   child.childId,
     *   authStore.accessToken
     * )
     */

    /*
     * API 성공 후 화면에서도 제거
     */

    children.value =
      children.value.filter(
        (item) =>
          item.childId !== child.childId
      )

  } catch (error) {

    console.error(
      '자녀 연동 해제 실패:',
      error
    )

    window.alert(
      error.message
      || '자녀 연동을 해제하지 못했습니다.'
    )
  }
}

/* =========================
   프로필 이미지 에러
========================= */

function handleProfileImageError() {
  member.profileImageUrl = ''
}

/* =========================
   로그인 이동
========================= */

function goToLogin() {
  authStore.clearUser()
  router.replace('/login')
}

/* =========================
   수정 화면 이동
========================= */

function goToPhoneEdit() {
  router.push(
    '/parents/mypage/phone'
  )
}

function goToEmailEdit() {
  router.push(
    '/parents/mypage/email'
  )
}

function goToPasswordChange() {
  router.push(
    '/parents/mypage/password'
  )
}

/* =========================
   고객지원
========================= */

function goToFaq() {
  router.push('/faq')
}

function goToInquiry() {
  router.push('/inquiry')
}

function goToPolicy() {
  router.push('/policy')
}

/* =========================
   로그아웃
========================= */

function logout() {

  const confirmed = window.confirm(
    '로그아웃하시겠습니까?'
  )

  if (!confirmed) {
    return
  }

  authStore.clearUser()

  router.replace('/login')
}

/* =========================
   회원 탈퇴
========================= */

function withdraw() {

  const confirmed = window.confirm(
    '회원 탈퇴 화면으로 이동하시겠습니까?'
  )

  if (!confirmed) {
    return
  }

  router.push(
    '/parents/mypage/withdraw'
  )
}

/* =========================
   화면 진입
========================= */

onMounted(() => {
  fetchMyInfo()
  fetchChildren()
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
  top: -8px;

  width: 360px;
  min-height: 100dvh;

  margin: 0 auto;

  padding-bottom: 60px;

  color: #191b1e;

  background-color: #f4f5f7;
}

/* =========================
   헤더
========================= */

.nav {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 64px;

  padding: 0 20px 4px;

  background-color: #f4f5f7;
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

  font-size: 18px;
  font-weight: 700;

  transform: translateX(-50%);
}

.alarm-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}

.alarm-icon {
  width: 24px;
  height: 24px;
}

/* =========================
   콘텐츠
========================= */

.content {
  display: flex;
  flex-direction: column;

  gap: 12px;

  padding: 12px 16px 24px;
}

/* =========================
   프로필
========================= */

.profile-section {
  display: flex;
  align-items: center;

  gap: 20px;

  padding: 20px 18px;

  border-radius: 16px;

  background-color: #ffffff;
}

.profile-image-wrapper {
  flex-shrink: 0;

  width: 86px;
  height: 86px;
}

.profile-image,
.default-profile {
  width: 100%;
  height: 100%;

  border-radius: 50%;
}

.profile-image {
  display: block;

  object-fit: cover;
}

.default-profile {
  display: flex;
  align-items: center;
  justify-content: center;

  color: #b8bdc5;

  background-color: #f4f5f7;
}

.profile-text {
  display: flex;
  min-width: 0;

  flex-direction: column;

  gap: 6px;
}

.member-name {
  overflow: hidden;

  color: #191b1e;

  font-size: 22px;
  font-weight: 800;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-birth {
  color: #8b9097;

  font-size: 15px;
  font-weight: 600;
}

/* =========================
   연락처 / 이메일
========================= */

.info-card {
  display: flex;
  flex-direction: column;

  gap: 28px;

  padding: 20px 16px;

  border-radius: 16px;

  background-color: #ffffff;
}

.info-item {
  width: 100%;
}

.info-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  color: #8b9097;

  font-size: 14px;
  font-weight: 700;
}

.info-value {
  margin: 9px 0 0;

  color: #191b1e;

  font-size: 20px;
  font-weight: 500;

  line-height: 1.4;

  overflow-wrap: anywhere;
}

.email-value {
  font-size: 18px;
}

.edit-button,
.disconnect-button {
  border: 1px solid #d9dee5;

  border-radius: 6px;

  color: #3c4046;

  background-color: #ffffff;

  cursor: pointer;
}

.edit-button {
  padding: 5px 10px;

  font-size: 12px;
}

.disconnect-button {
  padding: 8px 10px;

  font-size: 12px;

  white-space: nowrap;

  position: relative;
  z-index: 2;
}

/* =========================
   섹션
========================= */

.section-block {
  margin-top: 20px;
}

.section-title {
  margin: 0 0 10px 4px;

  color: #8b9097;

  font-size: 14px;
  font-weight: 700;
}

/* =========================
   공통 카드
========================= */

.menu-card,
.section-card {
  overflow: hidden;

  border-radius: 16px;

  background-color: #ffffff;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  min-height: 58px;

  padding: 0 16px;

  border: none;

  color: #191b1e;

  font-size: 15px;
  font-weight: 700;

  text-align: left;

  background-color: #ffffff;

  cursor: pointer;
}

.menu-border {
  border-bottom: 1px solid #f0f1f3;
}

.chevron {
  color: #b9bec5;

  font-size: 28px;
  font-weight: 300;

  line-height: 1;
}

/* =========================
   연결된 자녀
========================= */

.child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 70px;

  padding: 0 16px;

  cursor: pointer;

  transition: background-color 0.15s ease;
}

.child-item:hover {
  background-color: #fafafa;
}

.child-item:active {
  background-color: #f4f5f7;
}

.child-item.with-border {
  border-bottom: 1px solid #f0f1f3;
}

.child-info {
  display: flex;
  min-width: 0;

  align-items: center;

  gap: 12px;
}

.child-icon {
  flex-shrink: 0;

  width: 32px;
  height: 32px;

  border-radius: 50%;

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

  max-width: 150px;

  color: #8b9097;

  font-size: 11px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-right {
  display: flex;
  align-items: center;

  gap: 7px;

  flex-shrink: 0;
}

.child-chevron {
  color: #b9bec5;

  font-size: 25px;

  line-height: 1;
}

/* =========================
   빈 상태
========================= */

.empty-message {
  margin: 0;

  padding: 34px 16px;

  color: #b9bec5;

  font-size: 13px;

  text-align: center;
}

.children-error {
  color: #d14343;
}

/* =========================
   로딩 / 에러
========================= */

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

  border-radius: 8px;

  color: #191b1e;

  font-size: 13px;
  font-weight: 700;

  background-color: #ffbc00;

  cursor: pointer;
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

  transform: translateX(-50%);
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