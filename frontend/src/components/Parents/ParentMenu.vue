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
          aria-label="부모 전체 메뉴"
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
              @click="go('/parents/mypage')"
            >
              <img
                :src="displayProfileImage"
                alt=""
                class="profile-avatar"
              />
              <span class="profile-text">
                <span class="profile-name">{{ displayName }}</span>
                <span class="profile-sub">보호자</span>
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

              <template
                v-for="item in group.items"
                :key="item.key"
              >
                <button
                  class="menu-item"
                  :class="{
                    active: isActive(item),
                    picking: selectingFor === item.key,
                  }"
                  type="button"
                  @click="handleItem(item)"
                >
                  <MenuIcon :name="item.icon" />
                  <span class="item-label">
                    {{ item.label }}
                  </span>
                </button>

                <div
                  v-if="selectingFor === item.key"
                  class="child-picker"
                >
                  <p
                    v-if="isChildrenLoading"
                    class="picker-state"
                  >
                    자녀 목록을 불러오는 중입니다.
                  </p>

                  <p
                    v-else-if="childrenError"
                    class="picker-state"
                  >
                    {{ childrenError }}
                  </p>

                  <div
                    v-else-if="children.length === 0"
                    class="picker-state"
                  >
                    <p>연결된 자녀가 없어요.</p>
                    <button
                      type="button"
                      class="child-pick-btn"
                      @click="go('/parents/linkcode')"
                    >
                      자녀 연동하기
                      <span>이동</span>
                    </button>
                  </div>

                  <template v-else>
                    <button
                      v-for="child in children"
                      :key="child.childId"
                      class="child-pick-btn"
                      :class="{
                        current: isCurrentChild(child.childId),
                      }"
                      type="button"
                      @click="goWithChild(child.childId)"
                    >
                      {{ child.name }}
                      <span>{{ isCurrentChild(child.childId) ? '현재' : '선택' }}</span>
                    </button>
                  </template>
                </div>
              </template>
            </section>
          </div>
        </aside>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'
import { getMyInfo } from '@/api/member'
import { useParentMenu } from '@/composables/useParentMenu'
import MenuIcon from '@/components/MenuIcon.vue'
import {
  PARENT_PROFILE_IMAGE,
  resolveProfileImageUrl,
} from '@/utils/profileImages'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isOpen, closeMenu: closeDrawer } = useParentMenu()

const isChildrenLoading = ref(false)
const childrenError = ref('')
const children = ref([])
const selectingFor = ref(null)
const profileImageUrl = ref('')

const displayName = computed(() => authStore.name || '보호자')
const displayProfileImage = computed(() =>
  resolveProfileImageUrl(profileImageUrl.value, PARENT_PROFILE_IMAGE)
)

const menuGroups = [
  {
    title: '홈 · 지갑',
    items: [
      { key: 'home', label: '홈', path: '/parents/home', icon: 'home' },
      { key: 'charge', label: '충전하기', path: '/parents/charge', icon: 'plus' },
      { key: 'send', label: '용돈 지급', path: '/parents/send-allowance', icon: 'send' },
      { key: 'regular', label: '정기용돈', path: '/parents/regular-allowance', icon: 'calendar' },
      { key: 'tx', label: '내 거래내역', path: '/parents/transaction', icon: 'list' },
      { key: 'payment', label: '결제수단', path: '/parents/payment/change', icon: 'card' },
    ],
  },
  {
    title: '자녀관리',
    items: [
      { key: 'child-list', label: '자녀 목록', path: '/parents/childlist', icon: 'people' },
      { key: 'link', label: '자녀 연동', path: '/parents/linkcode', icon: 'link' },
      { key: 'child-home', label: '자녀 홈', needsChild: true, childPath: '', icon: 'home' },
      { key: 'child-tx', label: '자녀 거래내역', needsChild: true, childPath: '/transactions', icon: 'list' },
      { key: 'report', label: '머니 리포트', needsChild: true, childPath: '/report', icon: 'chart' },
      { key: 'finance', label: '금융상품', needsChild: true, childPath: '/finance', icon: 'bank' },
      { key: 'score', label: '티니점수', needsChild: true, childPath: '/teeny-score', icon: 'star' },
      { key: 'harmful', label: '업종별 결제 제한', needsChild: true, harmful: true, icon: 'shield' },
    ],
  },
  {
    title: '퀘스트',
    items: [
      { key: 'quest', label: '퀘스트 목록', path: '/parents/quest', icon: 'quest' },
      { key: 'quest-create', label: '퀘스트 만들기', path: '/parents/quest/create', icon: 'plus' },
    ],
  },
  {
    title: '마이페이지',
    items: [
      { key: 'mypage', label: '마이페이지', path: '/parents/mypage', icon: 'person' },
    ],
  },
]

const currentChildId = computed(() =>
  route.params.childId || route.query.childId || null
)

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''

  if (open) {
    selectingFor.value = null
    fetchChildren()
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

function closeMenu() {
  selectingFor.value = null
  closeDrawer()
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

async function fetchChildren() {
  if (!authStore.accessToken) {
    children.value = []
    childrenError.value = '로그인이 필요합니다.'
    return
  }

  isChildrenLoading.value = true
  childrenError.value = ''

  try {
    const res = await getChildren(authStore.accessToken)
    children.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    children.value = []
    childrenError.value = error.message || '자녀 목록을 불러오지 못했습니다.'
  } finally {
    isChildrenLoading.value = false
  }
}

function isActive(item) {
  if (selectingFor.value) {
    return false
  }

  if (item.path) {
    if (item.path === '/parents/home') {
      return route.path === item.path
    }

    if (item.path === '/parents/quest') {
      return route.path === '/parents/quest'
    }

    return route.path === item.path || route.path.startsWith(`${item.path}/`)
  }

  if (!item.needsChild || !currentChildId.value) {
    return false
  }

  const childBase = `/parents/children/${currentChildId.value}`

  if (item.harmful) {
    return route.path === '/parents/harmfulcategory'
  }

  return route.path === `${childBase}${item.childPath}`
}

function go(path, query) {
  closeMenu()

  if (query) {
    router.push({ path, query })
    return
  }

  router.push(path)
}

function childTargetPath(item, childId) {
  if (item.harmful) {
    return {
      path: '/parents/harmfulcategory',
      query: { childId },
    }
  }

  return {
    path: `/parents/children/${childId}${item.childPath || ''}`,
  }
}

function currentItem() {
  return menuGroups
    .flatMap((group) => group.items)
    .find((item) => item.key === selectingFor.value)
}

function isCurrentChild(childId) {
  return (
    currentChildId.value != null &&
    String(currentChildId.value) === String(childId)
  )
}

function handleItem(item) {
  if (!item.needsChild) {
    go(item.path)
    return
  }

  if (selectingFor.value === item.key) {
    selectingFor.value = null
    return
  }

  const canSkipPicker =
    !currentChildId.value &&
    !isChildrenLoading.value &&
    children.value.length === 1

  if (canSkipPicker) {
    const target = childTargetPath(item, children.value[0].childId)
    go(target.path, target.query)
    return
  }

  selectingFor.value = item.key
}

function goWithChild(childId) {
  const item = currentItem()

  if (!item) {
    return
  }

  const target = childTargetPath(item, childId)
  go(target.path, target.query)
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
  overflow: hidden;
  transform: translateX(-50%);
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
  top: 6px;
  right: 8px;
  z-index: 1;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #8b9097;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 0 24px;
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
.menu-item.active,
.menu-item.picking {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
}

.item-label {
  min-width: 0;
}

.child-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 4px 10px 18px;
}

.picker-state {
  margin: 0;
  padding: 8px 0;
  color: #8b9097;
  font-size: 12px;
}

.picker-state p {
  margin: 0 0 8px;
}

.child-pick-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #f0f1f3;
  border-radius: 10px;
  background: #f8fafc;
  color: #191b1e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.child-pick-btn.current {
  border-color: #ffd86a;
  background: #fff9e8;
}

.child-pick-btn span {
  color: #8b6e00;
  font-size: 11px;
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
