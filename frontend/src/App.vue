<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginRequiredModal from '@/components/LoginRequiredModal.vue'
import ParentMenu from '@/components/Parents/ParentMenu.vue'

const route = useRoute()
const isParentRoute = computed(() => route.path.startsWith('/parents'))
</script>

<template>
  <div class="app-shell">
    <RouterView />
  </div>
  <ParentMenu v-if="isParentRoute" />
  <LoginRequiredModal />
</template>

<style>
.app-shell {
  width: 100%;
  min-height: 100dvh;
}

.app-shell > * {
  width: 100% !important;
  max-width: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
