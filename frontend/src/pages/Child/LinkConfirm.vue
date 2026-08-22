<template>
  <div class="confirm-screen">
    <!-- 상단 네비게이션 -->
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로가기" @click="goBack">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke="#191b1e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">부모님 연동</h1>
      <div class="nav-right-placeholder"></div>
    </header>

    <!-- 스크롤 본문 영역 -->
    <main class="body-content">
      <!-- 상단 타이틀 -->
      <section class="heading-section">
        <span class="step-badge">가족 연결 확인</span>
        <h2 class="main-title">
          연동할 부모님 정보를 <span class="highlight-text">확인해 주세요</span>
        </h2>
        <p class="sub-desc">
          연동 후 부모님과 함께 안전하게 용돈을 관리할 수 있어요
        </p>
      </section>

      <!-- 보호자 프로필 카드 -->
      <section class="guardian-hero-card">
        <div class="profile-header profile-header-centered">
          <div class="avatar-box">
            <img
              v-if="guardian.profileImageUrl"
              :src="guardian.profileImageUrl"
              alt="부모님 프로필"
              class="avatar-img"
            />
            <img
              v-else
              :src="PARENT_PROFILE_IMAGE"
              alt="부모님 기본 프로필"
              class="avatar-img default"
            />
          </div>

          <div class="guardian-identity">
            <div class="name-row">
              <strong class="guardian-name">{{ guardian.name || '부모님' }}</strong>
              <span class="relation-pill">{{ guardian.relation || '부모님' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 안내 팁 박스 -->
      <section class="notice-box">
        <p class="notice-text">
          가족 연동 해제 및 변경은 마이페이지 설정에서 언제든지 관리할 수 있습니다.
        </p>
      </section>
    </main>

    <!-- 하단 고정 액션 버튼 -->
    <footer class="bottom-action-bar">
      <button class="submit-button" type="button" @click="goToCompletePage">
        이 부모님으로 연동하기
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyParent } from '@/api/families'
import { useAuthStore } from '@/stores/auth'
import { PARENT_PROFILE_IMAGE, pickProfileImageUrl, resolveProfileImageUrl } from '@/utils/profileImages'

const router = useRouter();
const authStore = useAuthStore();

const guardian = ref({ name: '', relation: '가족', profileImageUrl: '' });

// 페이지 진입 시 연동된 부모 정보 조회
onMounted(async () => {
  try {
    const res = await getMyParent(authStore.accessToken)
    if (res?.data) {
      guardian.value.name = res.data.name || ''
      guardian.value.relation = res.data.relation || '부모님'
      guardian.value.profileImageUrl = resolveProfileImageUrl(
        pickProfileImageUrl(res.data),
        PARENT_PROFILE_IMAGE
      )
    }
  } catch (e) {
    console.error('부모 정보 조회 실패:', e.message)
  }
})

function goBack() {
  router.back();
}

function goToCompletePage() {
  router.push({ name: 'child-link-complete' })
}
</script>

<style scoped>
.confirm-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  color: #191b1e;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

/* 상단 네비게이션 */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 60px;
  padding: 0 16px;
  background: #f8fafc;
  box-sizing: border-box;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  padding: 0;
  transition: background 0.15s ease;
}

.back-btn:hover {
  background: #f1f5f9;
}

.nav-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-weight: 600;
  font-size: 17px;
  color: #191b1e;
  letter-spacing: -0.3px;
}

.nav-right-placeholder {
  width: 40px;
}

/* 본문 영역 */
.body-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 120px 20px 24px;
  box-sizing: border-box;
}

/* 타이틀 섹션 */
.heading-section {
  margin-bottom: 24px;
}

.step-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #d97706;
  background: #fef3c7;
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  letter-spacing: -0.2px;
}

.main-title {
  margin: 0 0 8px;
  font-size: 23px;
  font-weight: 700;
  line-height: 1.35;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.highlight-text {
  color: #191b1e;
}

.sub-desc {
  margin: 0;
  font-size: 14px;
  color: #4d596b;
  line-height: 1.4;
  letter-spacing: -0.2px;
}

/* 보호자 프로필 히어로 카드 */
.guardian-hero-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 20px;
  padding: 24px 20px;
  margin-bottom: 16px;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-header-centered {
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.profile-header-centered .guardian-identity {
  align-items: center;
}

.avatar-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #e2e8f0;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-img.default {
  padding: 8px;
  box-sizing: border-box;
}

.guardian-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guardian-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.4px;
}

.relation-pill {
  font-size: 11.5px;
  font-weight: 600;
  color: #d97706;
  background: #fef3c7;
  padding: 3px 8px;
  border-radius: 6px;
  border: none;
}

/* 안내 팁 박스 */
.notice-box {
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  padding: 14px 16px;
  box-sizing: border-box;
}

.notice-text {
  margin: 0;
  font-size: 12.5px;
  color: #4d596b;
  line-height: 1.45;
  letter-spacing: -0.2px;
}

/* 하단 고정 액션 버튼 */
.bottom-action-bar {
  padding: 0 20px 20px;
  background: #f8fafc;
  box-sizing: border-box;
  width: 100%;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  padding: 15px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
}
</style>