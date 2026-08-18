<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginRequiredModal from '@/components/LoginRequiredModal.vue'
import ParentMenu from '@/components/Parents/ParentMenu.vue'

const route = useRoute()
const isParentRoute = computed(() => route.path.startsWith('/parents'))
const isChildRoute = computed(() => route.path.startsWith('/child'))
</script>

<template>
  <div class="app-root" :class="{ 'is-child-route': isChildRoute }">
    <RouterView />
  </div>
  <ParentMenu v-if="isParentRoute" />
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

.app-root.is-child-route {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
}

.app-root.is-child-route > * {
  width: 100% !important;
  max-width: none !important;
  height: 100dvh !important;
  min-height: 100dvh !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box;
}
</style>
