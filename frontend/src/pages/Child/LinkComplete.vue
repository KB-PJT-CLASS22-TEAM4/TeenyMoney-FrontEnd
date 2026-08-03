<template>
  <div class="complete-screen">
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
      <!-- 티니 캐릭터 -->
      <img src="@/assets/rabbit.png" class="character" alt="티니머니 캐릭터" />

      <div class="heading">
        <h2 class="title">연동 완료!</h2>
        <p class="subtitle">이제 부모님과 함께 용돈을 관리할 수 있어요</p>
      </div>

      <!-- 연동된 보호자 -->
      <div class="guardian-row">
        <div class="avatar">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#b9bec5" stroke-width="1.8"/>
            <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="#b9bec5" stroke-width="1.8"/>
          </svg>
        </div>
        <span class="guardian-name">{{ guardian.name }}</span>
        <span class="linked-badge">✓ 연동됨</span>
      </div>
    </div>

    <!-- 확인 버튼 -->
    <button class="cta" @click="goHome">확인</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ===== API 연동 필요 =====
// 실제로는 연동된 보호자 정보를 이전 화면/서버에서 받아옴
const guardian = ref({ name: '김부모' });

function goBack() {
  router.back();
}

function goHome() {
  router.push({ name: 'child-home' });
}
</script>

<style scoped>
.complete-screen {
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
  gap: 20px;
  padding: 40px 20px 0;
}

.character {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title {
  margin: 0;
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
}

.subtitle {
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
  text-align: center;
}

/* 연동된 보호자 줄 */
.guardian-row {
  display: flex;
  flex-direction: row;   /* 가로 배치 */
  align-items: center;   /* 세로 가운데 */
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e4e1e1;
  border-radius: 8px;
  box-sizing: border-box;
}

.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  flex: none;
}

.guardian-name {
    margin: 0;               
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
  flex: 1;
}

.linked-badge {
  font-weight: 600;
  font-size: 12.5px;
  color: #ffbc00;
}

/* 확인 버튼 */
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