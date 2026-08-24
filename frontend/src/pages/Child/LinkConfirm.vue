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
          입력한 코드로 <span class="highlight-text">연동할까요?</span>
        </h2>
        <p class="sub-desc">
          연동 후 부모님과 함께 안전하게 용돈을 관리할 수 있어요
        </p>
      </section>

      <!-- 입력한 코드 카드 -->
      <section class="guardian-hero-card">
        <div class="avatar-box">
          <img :src="PARENT_PROFILE_IMAGE" alt="부모님 기본 프로필" class="avatar-img default" />
        </div>
        <span class="guardian-name">{{ code }}</span>
      </section>

      <p v-if="submitError" class="submit-error">{{ submitError }}</p>

      <!-- 안내 팁 박스 -->
      <section class="notice-box">
        <p class="notice-text">
          가족 연동 해제 및 변경은 부모님만 할 수 있어요.<br>
          잘못 연동됐거나 변경이 필요하면 고객센터에 문의해 주세요.
        </p>
      </section>
    </main>

    <!-- 하단 고정 액션 버튼 -->
    <footer class="bottom-action-bar">
      <button
        class="submit-button"
        type="button"
        :disabled="isSubmitting"
        @click="confirmLink"
      >
        {{ isSubmitting ? '연동 중...' : '이 코드로 연동하기' }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { connectFamilyCode } from '@/api/families'
import { useAuthStore } from '@/stores/auth'
import { PARENT_PROFILE_IMAGE } from '@/utils/profileImages'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const code = route.query.code || ''
const isSubmitting = ref(false)
const submitError = ref('')

// 코드 없이 직접 진입한 경우 코드 입력 화면으로 되돌린다.
if (!code) {
  router.replace({ name: 'child-link' })
}

function goBack() {
  router.back();
}

// "이 코드로 연동하기"를 눌러야 실제로 코드를 소비하고 가족 관계를 생성한다.
async function confirmLink() {
  if (!code || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''
  try {
    await connectFamilyCode(authStore.accessToken, code)
    router.push({ name: 'child-link-complete' })
  } catch (e) {
    console.error('연동 실패:', e.message)
    submitError.value = e.message || '코드가 일치하지 않아요. 다시 입력해 주세요.'
  } finally {
    isSubmitting.value = false
  }
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

/* 입력한 코드 카드 (연동 완료 화면 카드와 동일한 디자인) */
.guardian-hero-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #e4e1e1;
  border-radius: 8px;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.avatar-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-img.default {
  padding: 6px;
  box-sizing: border-box;
}

.guardian-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #15171b;
  flex: 1;
}

.submit-error {
  margin: 0 0 16px;
  font-size: 12px;
  font-weight: 600;
  color: #e0554f;
  padding: 0 4px;
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
  border-radius: 4px;
  background: #ffbc00;
  color: #191b1e;
  padding: 15px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
}

.submit-button:disabled {
  background: #f2f4f6;
  color: #9ca1a8;
  cursor: not-allowed;
}
</style>