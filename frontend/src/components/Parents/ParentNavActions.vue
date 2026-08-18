<template>
  <div class="parent-nav-actions">
    <button
      class="action-btn"
      type="button"
      aria-label="알림"
    >
      <img
        src="@/assets/icons/icon-notification.svg"
        alt=""
        class="action-icon"
      />
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
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.action-icon {
  width: 20px;
  height: 22px;
}

.burger {
  position: relative;
  display: block;
  width: 18px;
  height: 14px;
}

.burger i {
  position: absolute;
  left: 0;
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 2px;
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
