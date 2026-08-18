<template>
  <div class="page">
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">알림</h1>

      <ParentNavActions />
    </header>

    <p class="empty">아직 도착한 알림이 없어요.</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

const router = useRouter()
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
}

.nav {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 8px 0 4px;
}

.back-btn {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 22px;
  height: 22px;
}

.nav-title {
  flex: 1;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #191b1e;
  text-align: center;
}

.empty {
  margin: 80px 20px 0;
  text-align: center;
  font-size: 14px;
  color: #8b9097;
}
</style>
