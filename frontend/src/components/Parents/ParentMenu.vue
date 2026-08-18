<template>
  <Teleport to="body">
    <div class="parent-menu">
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isOpen"
        aria-label="전체 메뉴"
        @click="toggleMenu"
      >
        <span class="burger" :class="{ open: isOpen }">
          <i></i>
          <i></i>
          <i></i>
        </span>
      </button>

      <div
        v-if="isOpen"
        class="menu-overlay"
        @click.self="closeMenu"
      >
        <aside
          class="menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="부모 전체 메뉴"
        >
          <div class="drawer-header">
            <div>
              <p class="drawer-eyebrow">부모 메뉴</p>
              <h2 class="drawer-title">어디로 갈까요?</h2>
            </div>

            <button
              class="close-btn"
              type="button"
              aria-label="메뉴 닫기"
              @click="closeMenu"
            >
              ×
            </button>
          </div>

          <div class="drawer-body">
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
                :class="{
                  active: isActive(item),
                  picking: selectingFor === item.key,
                }"
                type="button"
                @click="handleItem(item)"
              >
                <span class="item-label">
                  {{ item.label }}
                </span>
                <span class="item-chevron">›</span>
              </button>

              <div
                v-if="selectingFor && group.items.some((item) => item.key === selectingFor)"
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
                    type="button"
                    @click="goWithChild(child.childId)"
                  >
                    {{ child.name }}
                    <span>선택</span>
                  </button>
                </template>
              </div>
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isOpen = ref(false)
const isChildrenLoading = ref(false)
const childrenError = ref('')
const children = ref([])
const selectingFor = ref(null)

const menuGroups = [
  {
    title: '홈 · 지갑',
    items: [
      { key: 'home', label: '홈', path: '/parents/home' },
      { key: 'charge', label: '충전하기', path: '/parents/charge' },
      { key: 'send', label: '용돈 지급', path: '/parents/send-allowance' },
      { key: 'regular', label: '정기용돈', path: '/parents/regular-allowance' },
      { key: 'tx', label: '내 거래내역', path: '/parents/transaction' },
      { key: 'payment', label: '결제수단', path: '/parents/payment/change' },
    ],
  },
  {
    title: '자녀관리',
    items: [
      { key: 'child-list', label: '자녀 목록', path: '/parents/childlist' },
      { key: 'link', label: '자녀 연동', path: '/parents/linkcode' },
      { key: 'child-home', label: '자녀 홈', needsChild: true, childPath: '' },
      { key: 'child-tx', label: '자녀 거래내역', needsChild: true, childPath: '/transactions' },
      { key: 'report', label: '머니 리포트', needsChild: true, childPath: '/report' },
      { key: 'finance', label: '금융상품', needsChild: true, childPath: '/finance' },
      { key: 'score', label: '티니점수', needsChild: true, childPath: '/teeny-score' },
      { key: 'harmful', label: '유해업소 설정', needsChild: true, harmful: true },
    ],
  },
  {
    title: '퀘스트',
    items: [
      { key: 'quest', label: '퀘스트 목록', path: '/parents/quest' },
      { key: 'quest-create', label: '퀘스트 만들기', path: '/parents/quest/create' },
    ],
  },
  {
    title: '마이페이지',
    items: [
      { key: 'mypage', label: '마이페이지', path: '/parents/mypage' },
    ],
  },
]

const currentChildId = computed(() => route.params.childId || null)

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''

  if (open) {
    selectingFor.value = null
    fetchChildren()
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

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
  selectingFor.value = null
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

function handleItem(item) {
  if (!item.needsChild) {
    go(item.path)
    return
  }

  const childId = currentChildId.value || (
    children.value.length === 1 ? children.value[0].childId : null
  )

  if (childId) {
    const target = childTargetPath(item, childId)
    go(target.path, target.query)
    return
  }

  selectingFor.value = selectingFor.value === item.key ? null : item.key
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
.menu-toggle {
  position: fixed;
  top: 14px;
  right: calc(50% - 168px);
  z-index: 150;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: #ffbc00;
  box-shadow: 0 4px 12px rgba(25, 27, 30, 0.12);
  cursor: pointer;
}

.burger {
  position: relative;
  display: block;
  width: 16px;
  height: 12px;
}

.burger i {
  position: absolute;
  left: 0;
  display: block;
  width: 16px;
  height: 2px;
  border-radius: 2px;
  background: #191b1e;
  transition: transform 0.2s ease, opacity 0.2s ease, top 0.2s ease;
}

.burger i:nth-child(1) {
  top: 0;
}

.burger i:nth-child(2) {
  top: 5px;
}

.burger i:nth-child(3) {
  top: 10px;
}

.burger.open i:nth-child(1) {
  top: 5px;
  transform: rotate(45deg);
}

.burger.open i:nth-child(2) {
  opacity: 0;
}

.burger.open i:nth-child(3) {
  top: 5px;
  transform: rotate(-45deg);
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 140;
  background: rgba(0, 0, 0, 0.38);
}

.menu-drawer {
  display: flex;
  width: 280px;
  height: 100dvh;
  max-width: 78vw;
  flex-direction: column;
  margin-left: calc(50% - 180px);
  background: #ffffff;
  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.08);
  animation: drawer-in 0.2s ease-out;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 18px 14px;
  border-bottom: 1px solid #f0f1f3;
}

.drawer-eyebrow {
  margin: 0 0 4px;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
}

.drawer-title {
  margin: 0;
  color: #191b1e;
  font-size: 18px;
  font-weight: 800;
}

.close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #8b9097;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0 24px;
}

.menu-group {
  padding: 10px 0 6px;
}

.group-title {
  margin: 0;
  padding: 8px 18px 6px;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
}

.menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border: none;
  background: transparent;
  color: #191b1e;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.menu-item.active,
.menu-item.picking {
  background: #fff8dc;
}

.item-chevron {
  color: #c4c8ce;
  font-size: 16px;
}

.child-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 18px 10px 28px;
}

.picker-state {
  margin: 0;
  padding: 8px 0;
  color: #8b9097;
  font-size: 12px;
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

.child-pick-btn span {
  color: #8b6e00;
  font-size: 11px;
}

@keyframes drawer-in {
  from {
    transform: translateX(-16px);
    opacity: 0.6;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 360px) {
  .menu-toggle {
    right: 12px;
  }

  .menu-drawer {
    margin-left: 0;
  }
}
</style>
