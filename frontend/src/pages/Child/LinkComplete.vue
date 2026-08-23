<template>
  <div class="complete-screen">
   <!-- 상단 네비 -->
<div class="nav">
  <button class="back-btn" @click="goBack">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <h1 class="nav-title">부모님 연동</h1>
</div>

    <div class="body">
      <!-- 티니 캐릭터 -->
      <div class="character-wrap">
        <span v-for="n in 8" :key="n" :class="`spark spark-${n}`"></span>
        <img :src="CHILD_PROFILE_IMAGE" class="character" alt="티니머니 캐릭터" />
      </div>

      <div class="heading">
        <h2 class="title">연동 완료!</h2>
        <p class="subtitle">이제 부모님과 함께 용돈을 관리할 수 있어요</p>
      </div>

      <!-- 연동된 부모님 -->
      <div class="guardian-card">
        <div class="avatar-box">
          <img
            :src="guardian.profileImageUrl || PARENT_PROFILE_IMAGE"
            alt=""
            class="avatar-img"
            :class="{ photo: isCustomParentPhoto }"
          />
        </div>
        <span class="guardian-name">{{ guardian.name || '부모님' }}</span>
        <span class="linked-badge">✓ 연동됨</span>
      </div>
    </div>

    <!-- 확인 버튼 -->
    <div class="bottom-bar">
      <button class="cta" @click="goHome">확인</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyParent } from '@/api/families'
import { useAuthStore } from '@/stores/auth'
import {
  CHILD_PROFILE_IMAGE,
  PARENT_PROFILE_IMAGE,
  pickProfileImageUrl,
  resolveProfileImageUrl,
} from '@/utils/profileImages'

const router = useRouter();
const authStore = useAuthStore();

const guardian = ref({ name: '', profileImageUrl: '' });

const isCustomParentPhoto = computed(() =>
  Boolean(guardian.value.profileImageUrl)
  && guardian.value.profileImageUrl !== PARENT_PROFILE_IMAGE
)

onMounted(async () => {
  try {
    const res = await getMyParent(authStore.accessToken)
    if (res.data) {
      guardian.value.name = res.data.name || ''
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
  padding: 80px 0 0;
  background: #f8fafc;
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
  padding: 80px 20px 0;
}

.character-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
}

.character {
  position: relative;
  z-index: 1;
  width: 140px;
  height: 140px;
  object-fit: contain;
  animation: character-jump 0.6s ease-out 0.1s both;
}

@keyframes character-jump {
  0%   { transform: translateY(0); }
  30%  { transform: translateY(-24px); }
  55%  { transform: translateY(0); }
  75%  { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

.spark {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  animation: spark-burst 0.9s ease-out 0.15s forwards;
  z-index: 0;
}

.spark-1 { background: #ffbc00; --tx: 0px;    --ty: -75px; }
.spark-2 { background: #3b82f6; --tx: 55px;   --ty: -50px; }
.spark-3 { background: #10b981; --tx: 72px;   --ty: 6px;   }
.spark-4 { background: #f59e0b; --tx: 50px;   --ty: 62px;  }
.spark-5 { background: #ffbc00; --tx: 0px;    --ty: 75px;  }
.spark-6 { background: #3b82f6; --tx: -50px;  --ty: 62px;  }
.spark-7 { background: #10b981; --tx: -72px;  --ty: 6px;   }
.spark-8 { background: #f59e0b; --tx: -55px;  --ty: -50px; }

@keyframes spark-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 0; }
  25%  { transform: translate(calc(var(--tx) * 0.4), calc(var(--ty) * 0.4)) scale(1.3); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
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
  color: #6b7077;
  text-align: center;
}

/* 연동된 부모님 카드 */
.guardian-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 24px 20px;
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 20px;
  box-sizing: border-box;
}

.avatar-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 72px;
  height: 72px;
  background: #e5e7eb;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 2px #e2e8f0;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.avatar-img.photo {
  object-fit: cover;
}

.guardian-name {
  margin: 0;
  font-weight: 700;
  font-size: 20px;
  color: #0f172a;
  letter-spacing: -0.4px;
}

.linked-badge {
  font-size: 11.5px;
  font-weight: 600;
  color: #d97706;
  background: #fef3c7;
  padding: 3px 8px;
  border-radius: 6px;
}

/* 확인 버튼 */
.bottom-bar {
  width: 100%;
  margin-top: auto;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.cta {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  box-sizing: border-box;
}

.cta:active {
  filter: brightness(0.97);
}
</style>