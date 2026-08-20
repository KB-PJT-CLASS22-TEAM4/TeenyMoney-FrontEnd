<template>
  <div
    class="tabbar-anchor"
    :class="{ 'is-collapsed': isHidden }"
  >
    <nav
      class="tabbar"
      :class="{ 'is-hidden': isHidden }"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: tab.key === active }"
        @click="$emit('select', tab.key)"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  active: { type: String, default: 'home' },
})
defineEmits(['select'])

const isHidden = ref(false)
const HIDE_DISTANCE = 10
const listenerOptions = { passive: true, capture: true }

let touching = false
let startX = 0
let startY = 0

const tabs = [
  { key: 'home', label: '홈', icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 3L3 10v10a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V10z"/></svg>` },
  { key: 'finance', label:  '금융 상품', icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><rect x="3.5" y="6" width="17" height="12" rx="3" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 10.5h17" stroke="currentColor" stroke-width="1.9"/></svg>` },
  { key: 'q', label: 'QR결제', icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>` },
  { key: 'quest', label: '퀘스트', icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="9" y="2.3" width="6" height="3" rx="1" stroke="currentColor" stroke-width="1.7"/><path d="M9 10.5h6M9 14h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>` },
  { key: 'my', label: '마이', icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6z"/></svg>` },
]

function isNavTarget(target) {
  return target instanceof Element && Boolean(target.closest('.tabbar'))
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
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY

  if (Math.abs(dy) < HIDE_DISTANCE || Math.abs(dy) <= Math.abs(dx)) {
    return
  }

  if (dy < 0) {
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
.tabbar-anchor {
  flex-shrink: 0;
  height: 70px;
  transition: height 0.2s ease;
}

.tabbar-anchor.is-collapsed {
  height: 0;
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  width: 100%;
  max-width: 430px;
  height: 70px;
  margin: 0 auto;
  padding: 10px 0 20px;
  box-sizing: border-box;
  background: #ffffff;
  border-top: 1px solid #f0f1f3;
  transform: translate3d(0, 0, 0);
  transition: transform 0.2s ease;
}

.tabbar.is-hidden {
  transform: translate3d(0, 100%, 0);
  pointer-events: none;
}

.tab {
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
  color: #8b9097;
}

.tab-icon {
  display: flex;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.tab-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.tab-label {
  font-weight: 600;
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.tab.active {
  color: #191b1e;
}

.tab.active .tab-label {
  font-weight: 700;
}
</style>
