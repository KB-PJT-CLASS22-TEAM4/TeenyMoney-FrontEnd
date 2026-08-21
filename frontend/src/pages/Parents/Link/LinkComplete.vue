<template>
  <div class="complete-screen">
    <div class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">자녀 연동</h1>
    </div>

    <div class="body">
      <img :src="PARENT_PROFILE_IMAGE" class="character" alt="티니머니 캐릭터" />

      <div class="heading">
        <h2 class="title">자녀 연동 완료!</h2>
        <p class="subtitle">이제 자녀의 용돈을 관리할 수 있어요</p>
      </div>

      <div class="child-row">
        <div class="avatar">
          <img
            :src="linkedChild.profileImageUrl || CHILD_PROFILE_IMAGE"
            alt=""
            class="avatar-img"
            :class="{ photo: isCustomChildPhoto }"
          />
        </div>
        <span class="child-name">{{ linkedChild.name || '자녀' }}</span>
        <span class="linked-badge">✓ 연동됨</span>
      </div>
    </div>

    <button class="cta" type="button" @click="goToList">확인</button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getChildren } from '@/api/children'
import { useAuthStore } from '@/stores/auth'
import {
  CHILD_PROFILE_IMAGE,
  PARENT_PROFILE_IMAGE,
  pickProfileImageUrl,
  resolveProfileImageUrl,
} from '@/utils/profileImages'

const router = useRouter()
const authStore = useAuthStore()

const linkedChild = ref({ name: '', profileImageUrl: '' })

const isCustomChildPhoto = computed(() =>
  Boolean(linkedChild.value.profileImageUrl)
  && linkedChild.value.profileImageUrl !== CHILD_PROFILE_IMAGE
)

function pickLatestChild(children) {
  if (!Array.isArray(children) || children.length === 0) {
    return null
  }

  return [...children].sort((a, b) => {
    const aId = Number(a.childId ?? a.id ?? 0)
    const bId = Number(b.childId ?? b.id ?? 0)
    return aId - bId
  }).at(-1)
}

onMounted(async () => {
  try {
    const res = await getChildren(authStore.accessToken)
    const child = pickLatestChild(res.data)

    if (child) {
      linkedChild.value = {
        name: child.name || '',
        profileImageUrl: resolveProfileImageUrl(
          pickProfileImageUrl(child),
          CHILD_PROFILE_IMAGE
        ),
      }
    }
  } catch (error) {
    console.error('연동 자녀 정보 조회 실패:', error)
  }
})

function goBack() {
  router.back()
}

function goToList() {
  router.push({ name: 'parents-child-list' })
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
  color: #6b7077;
  text-align: center;
}

.child-row {
  display: flex;
  flex-direction: row;
  align-items: center;
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
  overflow: hidden;
  flex: none;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.avatar-img.photo {
  object-fit: cover;
}

.child-name {
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
