<!-- 현재 로그인 한 사용자 --> 

<template>
  <div class="mypage">
    <!-- 상단 헤더 -->
    <header class="page-header">
      <h1 class="page-title">마이페이지</h1>
    </header>

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

          <div v-else class="default-profile">
            <svg
              width="52"
              height="52"
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
          <strong class="member-name">{{ member.name }}</strong>
          <span class="member-birth">
            {{ formattedBirthDate }}
          </span>
        </div>
      </section>

      <!-- 회원 정보 -->
      <section class="info-section">
        <div class="info-item">
          <div class="info-heading">
            <span class="info-label">연락처</span>

            <button
              type="button"
              class="edit-button"
              @click="goToPhoneEdit"
            >
              수정
            </button>
          </div>

          <p class="info-value">
            {{ formattedPhoneNumber }}
          </p>
        </div>

        <div class="info-item">
          <div class="info-heading">
            <span class="info-label">이메일</span>

            <button
              type="button"
              class="edit-button"
              @click="goToEmailEdit"
            >
              수정
            </button>
          </div>

          <p class="info-value email-value">
            {{ member.email }}
          </p>
        </div>
      </section>

      <div class="divider"></div>

      <!-- 비밀번호 변경 -->
      <button
        type="button"
        class="menu-button password-button"
        @click="goToPasswordChange"
      >
        <span>비밀번호 변경</span>
        <span class="chevron">›</span>
      </button>

      <!-- 연결된 자녀 -->
      <section class="children-section">
        <h2 class="section-title">연결된 자녀</h2>

        <div class="section-divider"></div>

        <div v-if="children.length > 0">
          <div
            v-for="child in children"
            :key="child.memberId"
            class="child-item"
          >
            <div class="child-info">
              <div class="child-icon">
                <svg
                  width="28"
                  height="28"
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

              <strong class="child-name">
                {{ child.name }}
              </strong>
            </div>

            <button
              type="button"
              class="disconnect-button"
              @click="disconnectChild(child)"
            >
              연동 해제
            </button>
          </div>
        </div>

        <p v-else class="empty-message">
          연결된 자녀가 없습니다.
        </p>
      </section>

      <!-- 고객지원 -->
      <section class="support-section">
        <h2 class="section-title">고객지원</h2>
        <div class="section-divider"></div>

        <button
          type="button"
          class="menu-button"
          @click="goToFaq"
        >
          <span>자주 묻는 질문</span>
          <span class="chevron">›</span>
        </button>

        <button
          type="button"
          class="menu-button"
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
      </section>

      <!-- 계정관리 -->
      <section class="account-section">
        <h2 class="section-title">계정관리</h2>
        <div class="section-divider"></div>

        <button
          type="button"
          class="menu-button"
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
      </section>
    

    <!-- 하단 네비게이션 -->
    <nav class="bottom-navigation">
      <button
        type="button"
        class="nav-item"
        @click="router.push('/parents/home')"
      >
        <span class="nav-icon">⌂</span>
        <span>홈</span>
      </button>

      <button
        type="button"
        class="nav-item"
        @click="router.push('/parents/children')"
      >
        <span class="nav-icon">♧</span>
        <span>자녀관리</span>
      </button>

      <button
        type="button"
        class="nav-item active"
        @click="router.push('/parents/mypage')"
      >
        <span class="nav-icon">♙</span>
        <span>마이페이지</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyInfo } from '@/api/member'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
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

const children = ref([]) // 연결된 자녀 목록


const formattedBirthDate = computed(() => {
  if (!member.birthDate) {
    return ''
  }

  return member.birthDate.replaceAll('-', '.')
})

const formattedPhoneNumber = computed(() => {
  const phone = member.phoneNumber?.replace(/[^0-9]/g, '')

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

async function fetchMyInfo() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await getMyInfo()

    member.memberId = data.memberId
    member.role = data.role
    member.name = data.name
    member.email = data.email
    member.phoneNumber = data.phoneNumber
    member.birthDate = data.birthDate
    member.profileImageUrl = data.profileImageUrl || ''
  } catch (error) {
    console.error('회원 정보 조회 실패:', error)
    errorMessage.value =
      error.message || '회원 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}


// 로그아웃
// function logout() {
//   const confirmed = window.confirm('로그아웃하시겠습니까?')

//   if (!confirmed) {
//     return
//   }

//   localStorage.removeItem('accessToken')
//   localStorage.removeItem('refreshToken')

//   router.replace('/login')
// }

// 회원 탈퇴
// function withdraw() {
//   const confirmed = window.confirm(
//     '회원 탈퇴 화면으로 이동하시겠습니까?'
//   )

//   if (!confirmed) {
//     return
//   }

//   router.push('/parents/mypage/withdraw')
// }

onMounted(() => {
  fetchMyInfo()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.mypage {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 0 24px 110px;
  color: #222;
  background: #fff;
}

.page-header {
  padding-top: 36px;
}

.page-title {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.3;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 32px 16px 43px;
}

.profile-image-wrapper {
  flex-shrink: 0;
  width: 132px;
  height: 132px;
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
  background: #f6f7f9;
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-name {
  font-size: 30px;
  font-weight: 800;
}

.member-birth {
  color: #90959e;
  font-size: 21px;
  font-weight: 600;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 38px;
}

.info-item {
  width: 100%;
}

.info-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label,
.section-title {
  margin: 0;
  color: #92979f;
  font-size: 19px;
  font-weight: 700;
}

.info-value {
  margin: 12px 0 0;
  font-size: 26px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.email-value {
  font-size: 24px;
}

.edit-button,
.disconnect-button {
  border: 1px solid #d9dee5;
  border-radius: 5px;
  color: #3c4046;
  background: #fff;
  cursor: pointer;
}

.edit-button {
  padding: 5px 11px;
  font-size: 14px;
}

.disconnect-button {
  padding: 10px 13px;
  font-size: 14px;
}

.divider,
.section-divider {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
}

.divider {
  margin-top: 42px;
}

.password-button {
  margin-top: 8px;
}

.children-section,
.support-section,
.account-section {
  margin-top: 72px;
}

.section-divider {
  margin-top: 18px;
}

.child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 90px;
  padding: 0 4px 0 16px;
}

.child-info {
  display: flex;
  align-items: center;
  gap: 26px;
}

.child-icon {
  display: flex;
  color: #51565d;
}

.child-name {
  font-size: 21px;
  font-weight: 700;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 76px;
  padding: 0;
  border: 0;
  color: #202124;
  font-size: 22px;
  font-weight: 600;
  text-align: left;
  background: transparent;
  cursor: pointer;
}

.chevron {
  color: #b8bdc5;
  font-size: 38px;
  font-weight: 300;
  line-height: 1;
}

.empty-message {
  margin: 28px 0;
  color: #92979f;
  text-align: center;
}

.state-box {
  padding: 100px 20px;
  color: #777;
  text-align: center;
}

.error-state {
  color: #d14343;
}

.retry-button {
  margin-top: 16px;
  padding: 10px 18px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: #222;
  cursor: pointer;
}

.bottom-navigation {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  height: 92px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  color: #b8bdc5;
  font-size: 13px;
  font-weight: 700;
  background: transparent;
  cursor: pointer;
}

.nav-item.active {
  color: #202124;
}

.nav-icon {
  font-size: 29px;
  line-height: 1;
}

@media (min-width: 600px) {
  .mypage {
    max-width: 600px;
    margin: 0 auto;
    border-right: 1px solid #eee;
    border-left: 1px solid #eee;
  }

  .bottom-navigation {
    right: 50%;
    left: 50%;
    width: 600px;
    transform: translateX(-50%);
  }
}
</style>