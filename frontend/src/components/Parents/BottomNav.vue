<template>
  <nav
    class="parent-bottom-nav"
    :class="{ 'is-hidden': isHidden }"
  >
    <button
      class="nav-item"
      :class="{ 'nav-item-active': active === 'home' }"
      type="button"
      @click="router.push('/parents/home')"
    >
      <img
        :src="active === 'home' ? iconHomeAlive : iconHome"
        alt=""
        class="nav-icon"
      />
      <span class="nav-label">홈</span>
    </button>

    <button
      class="nav-item"
      :class="{ 'nav-item-active': active === 'child' }"
      type="button"
      @click="router.push('/parents/childlist')"
    >
      <img
        :src="active === 'child' ? iconChildAlive : iconChild"
        alt=""
        class="nav-icon"
      />
      <span class="nav-label">자녀관리</span>
    </button>

    <button
      class="nav-item"
      :class="{ 'nav-item-active': active === 'quest' }"
      type="button"
      @click="router.push('/parents/quest')"
    >
      <img
        :src="active === 'quest' ? iconQuestAlive : iconQuest"
        alt=""
        class="nav-icon"
      />
      <span class="nav-label">퀘스트</span>
    </button>

    <button
      class="nav-item"
      :class="{ 'nav-item-active': active === 'mypage' }"
      type="button"
      @click="router.push('/parents/mypage')"
    >
      <img
        :src="active === 'mypage' ? iconMypageAlive : iconMypage"
        alt=""
        class="nav-icon"
      />
      <span class="nav-label">마이페이지</span>
    </button>
  </nav>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import iconHome from '@/assets/icons/icon-home.svg'
import iconHomeAlive from '@/assets/icons/icon-home-alive.svg'
import iconChild from '@/assets/icons/icon-child.svg'
import iconChildAlive from '@/assets/icons/icon-child-alive.svg'
import iconQuest from '@/assets/icons/icon-quest.svg'
import iconQuestAlive from '@/assets/icons/icon-quest-alive.svg'
import iconMypage from '@/assets/icons/icon-mypage.svg'
import iconMypageAlive from '@/assets/icons/icon-mypage-alive.svg'

defineProps({
  active: {
    type: String,
    required: true,
    validator: (value) => ['home', 'child', 'quest', 'mypage'].includes(value),
  },
})

const router = useRouter()
const isHidden = ref(false)

const HIDE_DISTANCE = 10
const listenerOptions = { passive: true, capture: true }

let touching = false
let startX = 0
let startY = 0

function isNavTarget(target) {
  return target instanceof Element && Boolean(target.closest('.parent-bottom-nav'))
}

function onTouchStart(event) {
  if (event.touches.length !== 1 || isNavTarget(event.target)) {
    touching = false
    return
  }

  touching = true
  startX = event.touches[0].clientX
  startY = event.touches[0].clientY
}

function onTouchMove(event) {
  if (!touching || event.touches.length !== 1) {
    return
  }

  const touch = event.touches[0]
  const moved = Math.max(
    Math.abs(touch.clientX - startX),
    Math.abs(touch.clientY - startY)
  )

  if (moved >= HIDE_DISTANCE) {
    isHidden.value = true
  }
}

function onTouchEnd() {
  touching = false
  isHidden.value = false
}

onMounted(() => {
  window.addEventListener('touchstart', onTouchStart, listenerOptions)
  window.addEventListener('touchmove', onTouchMove, listenerOptions)
  window.addEventListener('touchend', onTouchEnd, listenerOptions)
  window.addEventListener('touchcancel', onTouchEnd, listenerOptions)
})

onBeforeUnmount(() => {
  window.removeEventListener('touchstart', onTouchStart, listenerOptions)
  window.removeEventListener('touchmove', onTouchMove, listenerOptions)
  window.removeEventListener('touchend', onTouchEnd, listenerOptions)
  window.removeEventListener('touchcancel', onTouchEnd, listenerOptions)
})
</script>

<style scoped>
.parent-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: stretch;
  width: 100%;
  max-width: 430px;
  height: 70px;
  margin: 0 auto;
  padding: 10px 0 20px;
  border-top: 1px solid #f0f1f3;
  background-color: #ffffff;
  box-sizing: border-box;
  transform: translate3d(0, 0, 0);
  transition: transform 0.2s ease;
}

.parent-bottom-nav.is-hidden {
  transform: translate3d(0, 100%, 0);
  pointer-events: none;
}

.nav-item {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  color: #8b9097;
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>
