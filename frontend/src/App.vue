<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginRequiredModal from '@/components/LoginRequiredModal.vue'
import ParentMenu from '@/components/Parents/ParentMenu.vue'
import ChildMenu from '@/components/Child/ChildMenu.vue'

const route = useRoute()
const isParentRoute = computed(() => route.path.startsWith('/parents'))
const isChildRoute = computed(() => route.path.startsWith('/child'))
</script>

<template>
  <div
    class="app-root"
    :class="{
      'is-child-route': isChildRoute,
      'is-parent-route': isParentRoute,
    }"
  >
    <RouterView />
  </div>
  <ParentMenu v-if="isParentRoute" />
  <ChildMenu v-if="isChildRoute" />
  <LoginRequiredModal />
</template>

<style>
html,
body {
  width: 100%;
  min-height: 100dvh;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  min-height: 100dvh;
}

.app-root {
  width: 100%;
  min-height: 100dvh;
}

.app-root.is-parent-route,
.app-root.is-child-route {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
}

.app-root.is-parent-route > *,
.app-root.is-child-route > * {
  width: 100% !important;
  max-width: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box;
}

.app-root.is-parent-route > * {
  min-height: 100dvh !important;
}

.app-root.is-child-route > * {
  height: 100dvh !important;
  min-height: 100dvh !important;
  padding-top: 0 !important;
  border: none !important;
}

.app-root.is-parent-route .nav,
.app-root.is-parent-route .top-nav,
.app-root.is-child-route .nav,
.app-root.is-child-route .top-nav,
.app-root.is-child-route .page-title-row {
  position: relative;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100%;
  box-sizing: border-box;
}

.app-root.is-parent-route .nav,
.app-root.is-child-route .nav,
.app-root.is-child-route .page-title-row {
  flex-shrink: 0;
  height: 64px;
  padding: 0 20px 4px !important;
  background: #ffffff;
}

.app-root.is-parent-route .top-nav:has(.nav-title),
.app-root.is-parent-route .top-nav:has(h1),
.app-root.is-child-route .top-nav:has(.nav-title),
.app-root.is-child-route .top-nav:has(h1) {
  height: 64px;
}

.app-root.is-parent-route .nav-title,
.app-root.is-parent-route .nav h1,
.app-root.is-parent-route .top-nav .nav-title,
.app-root.is-parent-route .top-nav h1,
.app-root.is-child-route .nav-title,
.app-root.is-child-route .page-title,
.app-root.is-child-route .nav h1,
.app-root.is-child-route .top-nav .nav-title,
.app-root.is-child-route .top-nav h1 {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  margin: 0;
  width: max-content !important;
  max-width: calc(100% - 148px);
  flex: none !important;
  overflow: hidden;
  color: #191b1e;
  font-size: 18px !important;
  font-weight: 700 !important;
  line-height: 1.2;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translate(-50%, -50%);
}

.app-root.is-parent-route .nav-left,
.app-root.is-parent-route .brand,
.app-root.is-parent-route .nav .back-btn,
.app-root.is-parent-route .nav .close-btn,
.app-root.is-parent-route .nav .icon-btn,
.app-root.is-parent-route .nav > .back-icon,
.app-root.is-parent-route .top-nav .back-btn,
.app-root.is-parent-route .top-nav .icon-btn,
.app-root.is-child-route .nav-left,
.app-root.is-child-route .brand,
.app-root.is-child-route .nav .back-btn,
.app-root.is-child-route .nav .icon-btn,
.app-root.is-child-route .top-nav .back-btn,
.app-root.is-child-route .top-nav .icon-btn {
  position: relative;
  z-index: 2;
  flex: 0 0 auto !important;
}

.app-root.is-parent-route .parent-nav-actions,
.app-root.is-parent-route .nav-actions,
.app-root.is-child-route .child-nav-actions,
.app-root.is-child-route .nav-right {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  margin-left: auto;
}
</style>
