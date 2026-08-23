<template>
  <header class="child-page-nav" :class="{ transparent }">
    <button
      v-if="showBack"
      class="back-btn"
      type="button"
      aria-label="뒤로가기"
      @click="handleBack"
    >
      <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
    </button>
    <span v-else class="back-placeholder" aria-hidden="true"></span>

    <h1 class="nav-title">{{ title }}</h1>

    <ChildNavActions v-if="showActions" />
    <span v-else class="actions-placeholder" aria-hidden="true"></span>
  </header>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  showBack: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  transparent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['back'])
const router = useRouter()
const instance = getCurrentInstance()

function handleBack() {
  if (instance?.vnode.props?.onBack) {
    emit('back')
    return
  }
  router.back()
}
</script>

<style scoped>
.child-page-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 56px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #eceef1;
}

.child-page-nav.transparent {
  background: transparent;
  border-bottom: none;
}

.back-btn {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.back-placeholder {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}

.actions-placeholder {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  margin-left: auto;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  max-width: calc(100% - 140px);
  overflow: hidden;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translateX(-50%);
}
</style>