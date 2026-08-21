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
                @click="go(item.path)"
              >
                <span class="item-label">
                  {{ item.label }}
                </span>
                <span class="item-chevron">›</span>
              </button>
            </section>
          </div>
        </aside>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChildMenu } from '@/composables/useChildMenu'

const router = useRouter()
const route = useRoute()
const { isOpen, closeMenu } = useChildMenu()

const menuGroups = [
  {
    title: '홈 · 지갑',
    items: [
      { key: 'home', label: '홈', path: '/child/home' },
      { key: 'tx', label: '거래내역', path: '/child/transaction' },
      { key: 'qr', label: 'QR결제', path: '/child/payment/scan' },
      { key: 'report', label: '소비 리포트', path: '/child/report' },
    ],
  },
  {
    title: '금융',
    items: [
      { key: 'my-products', label: '내 금융상품', path: '/child/finance/myproducts' },
      { key: 'new-products', label: '신규 상품', path: '/child/finance/newproducts' },
      { key: 'today-allow', label: '오늘만 허용', path: '/child/todayallow/request' },
    ],
  },
  {
    title: '성장',
    items: [
      { key: 'score', label: '티니점수', path: '/child/score' },
      { key: 'quest', label: '퀘스트', path: '/child/quest' },
    ],
  },
  {
    title: '마이페이지',
    items: [
      { key: 'mypage', label: '마이페이지', path: '/child/mypage' },
      { key: 'notification', label: '알림', path: '/child/notification' },
      { key: 'password', label: '결제 비밀번호', path: '/child/passwordsetting' },
    ],
  },
]

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
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

function go(path) {
  closeMenu()
  router.push(path)
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
  width: 260px;
  height: 100%;
  flex-direction: column;
  border-radius: 18px 0 0 18px;
  background: #ffffff;
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
  color: #6b7077;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0 24px;
}

.menu-group {
  padding: 10px 0 6px;
}

.menu-group:first-child {
  padding-top: 0;
}

.group-title {
  margin: 0;
  padding: 12px 40px 6px 18px;
  color: #6b7077;
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

.menu-item.active {
  background: #f4f5f7;
  box-shadow: inset 3px 0 0 #191b1e;
}

.menu-item.active .item-chevron {
  color: #191b1e;
}

.item-chevron {
  color: #c4c8ce;
  font-size: 16px;
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
