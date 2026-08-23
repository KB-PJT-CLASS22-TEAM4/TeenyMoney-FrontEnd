<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import LoginRequiredModal from '@/components/LoginRequiredModal.vue';
import ParentMenu from '@/components/Parents/ParentMenu.vue';
import ChildMenu from '@/components/Child/ChildMenu.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuestStore } from '@/stores/quest';
import { useSseStore } from '@/stores/sse';

const route = useRoute();
const isParentRoute = computed(() => route.path.startsWith('/parents'));
const isChildRoute = computed(() => route.path.startsWith('/child'));

// 실시간 화면 동기화 연결을 여기 한 곳에서만 만든다.
//
// 로그인 여부만 보고 붙였다 뗀다. auth 스토어에서 직접 부르지 않는 이유는 두 스토어가
// 서로를 import하게 되기 때문이고(순환 참조), immediate로 두면 이미 로그인된 채
// 앱이 뜨는 경우(새로고침)까지 이 한 줄이 같이 처리한다.
const authStore = useAuthStore();
const questStore = useQuestStore();
const sseStore = useSseStore();

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      sseStore.connect();
      return;
    }

    sseStore.disconnect();
    questStore.reset();
  },
  { immediate: true },
);
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
  padding-top: var(--safe-area-top) !important;
  box-sizing: border-box;
}

.app-root.is-parent-route .nav,
.app-root.is-child-route .nav,
.app-root.is-child-route .page-title-row {
  flex-shrink: 0;
  height: calc(64px + var(--safe-area-top));
  padding: var(--safe-area-top) 20px 4px !important;
  background: #ffffff;
}

.app-root.is-parent-route .top-nav:has(.nav-title),
.app-root.is-parent-route .top-nav:has(h1),
.app-root.is-child-route .top-nav:has(.nav-title),
.app-root.is-child-route .top-nav:has(h1) {
  height: calc(64px + var(--safe-area-top));
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
  top: calc(var(--safe-area-top) + 32px);
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

/* 부모 상단 바: 모든 페이지에서 위치·크기 고정 */
.app-root.is-parent-route .nav,
.app-root.is-parent-route .top-nav {
  position: relative !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
  width: auto !important;
  height: calc(64px + var(--safe-area-top)) !important;
  min-height: calc(64px + var(--safe-area-top)) !important;
  max-height: calc(64px + var(--safe-area-top)) !important;
  padding: var(--safe-area-top) 20px 4px !important;
  margin-top: 0 !important;
}

.app-root.is-parent-route .nav {
  background: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.app-root.is-parent-route .nav-title,
.app-root.is-parent-route .nav h1,
.app-root.is-parent-route .top-nav .nav-title,
.app-root.is-parent-route .top-nav h1 {
  position: absolute !important;
  left: 50% !important;
  top: calc(var(--safe-area-top) + 32px) !important;
  z-index: 1;
  margin: 0 !important;
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
  transform: translate(-50%, -50%) !important;
}

.app-root.is-parent-route .nav .back-btn,
.app-root.is-parent-route .nav .close-btn,
.app-root.is-parent-route .nav .icon-btn,
.app-root.is-parent-route .top-nav .back-btn,
.app-root.is-parent-route .top-nav .icon-btn {
  position: relative !important;
  z-index: 2;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 34px !important;
  height: 34px !important;
  padding: 0 !important;
  flex: 0 0 34px !important;
}

.app-root.is-parent-route .nav .back-icon,
.app-root.is-parent-route .nav > .back-icon,
.app-root.is-parent-route .nav .back-btn img,
.app-root.is-parent-route .nav .icon-btn img,
.app-root.is-parent-route .top-nav .back-icon,
.app-root.is-parent-route .top-nav .back-btn img {
  width: 24px !important;
  height: 24px !important;
}

.app-root.is-parent-route .parent-nav-actions,
.app-root.is-parent-route .nav-actions {
  position: relative !important;
  z-index: 2;
  flex: 0 0 auto !important;
  margin-left: auto !important;
}
</style>
