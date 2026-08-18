<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginRequiredModal from '@/components/LoginRequiredModal.vue'
import ParentMenu from '@/components/Parents/ParentMenu.vue'

const route = useRoute()
const isParentRoute = computed(() => route.path.startsWith('/parents'))
</script>

<template>
  <RouterView />
  <ParentMenu v-if="isParentRoute" />
  <LoginRequiredModal />
</template>
