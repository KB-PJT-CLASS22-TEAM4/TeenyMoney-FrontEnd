<template>
  <div class="confirm-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">보호자 연동</h1>
    </div>

    <div class="body">
      <div class="heading">
        <h2 class="title">이 보호자가 맞나요?</h2>
        <p class="subtitle">연동하면 함께 용돈을 관리할 수 있어요</p>
      </div>

      <!-- 보호자 카드 -->
      <div class="guardian-card">
        <div class="avatar">
          <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
            <circle cx="16" cy="11" r="5" stroke="#b9bec5" stroke-width="2.4"/>
            <path d="M7 27c0-5 4-8 9-8s9 3 9 8" stroke="#b9bec5" stroke-width="2.4"/>
          </svg>
        </div>
        <p class="guardian-name">{{ guardian.name }}</p>
        <p class="guardian-relation">보호자 · {{ guardian.relation }}</p>
      </div>
    </div>

    <!-- 연동하기 버튼 -->
    <button class="cta" @click="goToCompletePage">연동하기</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyParent } from '@/api/families'
import { useAuthStore } from '@/stores/auth'

const router = useRouter();
const authStore = useAuthStore();

const guardian = ref({ name: '', relation: '보호자' });

// 페이지 진입 시 연동된 부모 정보 조회
onMounted(async () => {
  try {
    const res = await getMyParent(authStore.accessToken)
    if (res.data) {
      guardian.value.name = res.data.name
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
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding: 50px 0 20px;
  background: #ffffff;
  border: 1px solid #eceef1;
}

/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 2px 16px 6px;
}

.back-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 16px 20px 0;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title {
  margin: 50px 0 0;
  font-weight: 800;
  font-size: 18px;
  color: #15171b;
}

.subtitle {
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
}

/* 보호자 카드 */
.guardian-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 258px;
  padding: 34px 18px 26px;
  border: 1px solid #e4e1e1;
  border-radius: 8px;
}

.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background: #e5e7eb;
  border-radius: 50%;
  margin-bottom: 6px;
}

.guardian-name {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
  color: #15171b;
}

.guardian-relation {
  margin: 0;
  font-weight: 500;
  font-size: 12.5px;
  color: #b9bec5;
}

/* 연동하기 버튼 */
.cta {
width: 318px;
  margin: auto auto 0;
  padding: 15px;
  border: none;
  border-radius: 4px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
}

.cta:active {
  filter: brightness(0.97);
}
</style>