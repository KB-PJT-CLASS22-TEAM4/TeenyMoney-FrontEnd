<template>
  <div
    v-if="authStore.loginModalVisible"
    class="overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="login-required-title"
  >
    <div class="modal">
      <div class="modal-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#ffbc00" stroke-width="1.8" />
          <path
            d="M12 8v4.5M12 16v.5"
            stroke="#ffbc00"
            stroke-width="2.2"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <h2 id="login-required-title" class="modal-title">
        로그인이 필요해요
      </h2>

      <p class="modal-desc">
        {{ authStore.loginModalMessage }}
      </p>

      <button
        class="btn-login"
        type="button"
        @click="goToLogin"
      >
        로그인하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function goToLogin() {
  authStore.closeLoginModal()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.45);
}

.modal {
  width: 100%;
  max-width: 300px;
  padding: 28px 24px 20px;
  border-radius: 20px;
  background: #ffffff;
  box-sizing: border-box;
  text-align: center;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: #fff4d6;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  color: #191b1e;
}

.modal-desc {
  margin: 0 0 24px;
  font-size: 13.5px;
  line-height: 20px;
  color: #8b9097;
  white-space: pre-line;
}

.btn-login {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #191b1e;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-login:active {
  background: #f0b000;
}
</style>
