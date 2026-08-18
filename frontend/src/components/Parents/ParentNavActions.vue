<template>
  <div class="parent-nav-actions">
    <button
      class="action-btn"
      type="button"
      aria-label="알림"
    >
      <svg
        class="action-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.2 9.4c0-3.1 2.6-5.6 5.8-5.6s5.8 2.5 5.8 5.6c0 4.1.9 5.6 1.7 6.6.3.4 0 1-.4 1H4.9c-.5 0-.7-.6-.4-1 .8-1 1.7-2.5 1.7-6.6Z"
          stroke="#1d1f23"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9.6 18.2a2.5 2.5 0 0 0 4.8 0"
          stroke="#1d1f23"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <button
      class="action-btn"
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
  </div>
</template>

<script setup>
import { useParentMenu } from '@/composables/useParentMenu'

const { isOpen, toggleMenu } = useParentMenu()
</script>

<style scoped>
.parent-nav-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
  margin-left: auto;
}

.action-btn {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.action-icon {
  width: 22px;
  height: 22px;
}

.burger {
  position: relative;
  display: block;
  width: 18px;
  height: 13px;
}

.burger i {
  position: absolute;
  left: 0;
  display: block;
  width: 18px;
  height: 2.5px;
  border-radius: 999px;
  background: #1d1f23;
  transition: transform 0.2s ease, opacity 0.2s ease, top 0.2s ease;
}

.burger i:nth-child(1) {
  top: 0;
}

.burger i:nth-child(2) {
  top: 6px;
}

.burger i:nth-child(3) {
  top: 12px;
}

.burger.open i:nth-child(1) {
  top: 6px;
  transform: rotate(45deg);
}

.burger.open i:nth-child(2) {
  opacity: 0;
}

.burger.open i:nth-child(3) {
  top: 6px;
  transform: rotate(-45deg);
}
</style>
