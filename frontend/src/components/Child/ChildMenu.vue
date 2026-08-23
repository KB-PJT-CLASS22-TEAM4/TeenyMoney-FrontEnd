<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="menu-frame"
    >
      <div
        class="menu-overlay"
        @click.self="closeMenu"
      >
        <aside
          class="menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="자녀 전체 메뉴"
        >
          <button
            class="close-btn"
            type="button"
            aria-label="메뉴 닫기"
            @click="closeMenu"
          >
            ×
          </button>

          <div class="drawer-body">
            <button
              class="profile-row"
              type="button"
              @click="go('/child/mypage')"
            >
              <img
                :src="displayProfileImage"
                alt=""
                class="profile-avatar"
              />
              <span class="profile-text">
                <span class="profile-name">{{ displayName }}</span>
                <span class="profile-sub">티니와 함께하는 꿈</span>
              </span>
              <span class="profile-chevron">›</span>
            </button>

            <section
              v-for="group in menuGroups"
              :key="group.title"
              class="menu-group"
            >
              <h3 class="group-title">
                {{ group.title }}
              </h3>

              <button
                v-for="item in group.items"
                :key="item.key"
                class="menu-item"
                :class="{ active: isActive(item) }"
                type="button"
                @click="handleItem(item)"
              >
                <MenuIcon :name="item.icon" />
                <span class="item-label">
                  {{ item.label }}
                </span>
              </button>
            </section>
          </div>
        </aside>
      </div>
    </div>
    <ConfirmModal
      :show="showLogoutModal"
      title="로그아웃할까요?"
      confirm-text="로그아웃"
      description="로그아웃 하시겠습니까?"
      cancel-text="취소"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </Teleport>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyInfo } from '@/api/member'
import { logout as logoutApi } from '@/api/auth'
import { useChildMenu } from '@/composables/useChildMenu'
import MenuIcon from '@/components/MenuIcon.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import {
  CHILD_PROFILE_IMAGE,
  resolveProfileImageUrl,
} from '@/utils/profileImages'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isOpen, closeMenu } = useChildMenu()
const profileImageUrl = ref('')

const displayName = computed(() => authStore.name || '자녀')
const displayProfileImage = computed(() =>
  resolveProfileImageUrl(profileImageUrl.value, CHILD_PROFILE_IMAGE)
)

const menuGroups = [
  {
    title: '홈 · 지갑',
    items: [
      { key: 'home', label: '홈', path: '/child/home', icon: 'home' },
      { key: 'tx', label: '거래내역', path: '/child/transaction', icon: 'list' },
      { key: 'qr', label: 'QR결제', path: '/child/payment/scan', icon: 'qr' },
      { key: 'report', label: '머니 리포트', path: '/child/report', icon: 'chart' },
    ],
  },
  {
    title: '금융',
    items: [
      { key: 'my-products', label: '내 금융상품', path: '/child/finance/myproducts', icon: 'wallet' },
      { key: 'new-products', label: '신규 상품', path: '/child/finance/newproducts', icon: 'bank' },
      { key: 'today-allow', label: '오늘만 허용', path: '/child/todayallow/request', icon: 'calendar' },
    ],
  },
  {
    title: '성장',
    items: [
      { key: 'score', label: '티니점수', path: '/child/score', icon: 'star' },
      { key: 'quest', label: '퀘스트', path: '/child/quest', icon: 'quest' },
    ],
  },
  {
    title: '마이페이지',
    items: [
      { key: 'mypage', label: '마이페이지', path: '/child/mypage', icon: 'person' },
      { key: 'notification', label: '알림', path: '/child/notification', icon: 'bell' },
      { key: 'password', label: '결제 비밀번호', path: '/child/passwordsetting', icon: 'lock' },
      { key: 'logout', label: '로그아웃', action: 'logout', icon: 'logout' },
    ],
  },
]

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    fetchProfile()
  }
})

watch(
  () => route.fullPath,
  () => {
    if (isOpen.value) {
      closeMenu()
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})

function isActive(item) {
  if (!item.path) {
    return false
  }

  if (item.path === '/child/home') {
    return route.path === item.path
  }

  if (item.path === '/child/quest') {
    return route.path === '/child/quest' || route.path.startsWith('/child/questdetail')
  }

  if (item.path === '/child/score') {
    return route.path === '/child/score' || route.path.startsWith('/child/score/')
  }

  if (item.path === '/child/payment/scan') {
    return route.path.startsWith('/child/payment')
  }

  if (item.path === '/child/finance/myproducts') {
    return route.path === item.path
      || route.path.startsWith('/child/finance/join')
      || route.path.startsWith('/child/finance/confirm')
      || route.path.startsWith('/child/finance/cancel')
  }

  return route.path === item.path || route.path.startsWith(`${item.path}/`)
}

function handleItem(item) {
  if (item.action === 'logout') {
    handleLogout()
    return
  }

  go(item.path)
}

function go(path) {
  closeMenu()
  router.push(path)
}

const showLogoutModal = ref(false)

function handleLogout() {
  closeMenu()
  showLogoutModal.value = true
}

function cancelLogout() {
  showLogoutModal.value = false
}

async function confirmLogout() {
  showLogoutModal.value = false

  try {
    await logoutApi(authStore.accessToken)
  } catch (error) {
    console.error('로그아웃 요청 실패:', error)
  } finally {
    authStore.clearUser()
    router.replace('/login')
  }
}

async function fetchProfile() {
  if (!authStore.accessToken) {
    profileImageUrl.value = ''
    return
  }

  try {
    const data = await getMyInfo(authStore.accessToken)
    profileImageUrl.value = data?.profileImageUrl || ''
  } catch {
    profileImageUrl.value = ''
  }
}
</script>

<style scoped>
.menu-frame {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 140;
  width: 100%;
  max-width: 430px;
  height: 100dvh;
  transform: translateX(-50%);
  overflow: hidden;
  pointer-events: none;
}

.menu-overlay {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.28);
  pointer-events: auto;
}

.menu-drawer {
  position: relative;
  display: flex;
  width: 288px;
  height: 100%;
  flex-direction: column;
  border-radius: 24px 0 0 24px;
  background: #f4f5f7;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
  animation: sidebar-in 0.22s ease-out;
}

.close-btn {
  position: absolute;
  top: calc(6px + var(--safe-area-top));
  right: 8px;
  z-index: 1;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #6b7077;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: calc(18px + var(--safe-area-top)) 0 calc(24px + var(--safe-area-bottom));
}

.profile-row {
  display: flex;
  width: calc(100% - 24px);
  align-items: center;
  gap: 10px;
  margin: 0 12px 8px;
  padding: 10px 8px 12px 4px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.profile-avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  background: #ffe38a;
}

.profile-text {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.profile-name {
  overflow: hidden;
  color: #191b1e;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-sub {
  overflow: hidden;
  color: #8b9097;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-chevron {
  color: #c4c8ce;
  font-size: 18px;
}

.menu-group {
  padding: 6px 12px 4px;
}

.menu-group + .menu-group {
  margin-top: 4px;
  border-top: 1px solid #e6e8ec;
}

.group-title {
  margin: 0;
  padding: 8px 10px 4px;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
}

.menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #191b1e;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.menu-item:active,
.menu-item.active {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
}

.item-label {
  min-width: 0;
}

@keyframes sidebar-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
