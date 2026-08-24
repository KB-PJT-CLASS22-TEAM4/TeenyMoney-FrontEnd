<template>
  <div v-if="show" class="overlay" @click.self="onCancel">
    <div class="modal">
      <div class="modal-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#ffbc00" stroke-width="1.8"/>
          <path d="M12 8v4.5M12 16v.5" stroke="#ffbc00" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>

      <h2 class="modal-title">{{ title }}</h2>
      <p v-if="description" class="modal-desc">{{ description }}</p>

      <div class="modal-btns" :class="{ single: hideCancel }">
        <button
          v-if="!hideCancel"
          class="btn btn-cancel"
          @click="onCancel"
        >
          {{ cancelText }}
        </button>
        <button class="btn btn-confirm" @click="onConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
  cancelText: { type: String, default: '취소' },
  hideCancel: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

function onConfirm() {
  emit('confirm')
}
function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
/* 딤 배경 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  box-sizing: border-box;
  z-index: 10000;
}

/* 모달 카드 */
.modal {
  width: 100%;
  max-width: 300px;
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 24px 20px;
  box-sizing: border-box;
  text-align: center;
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff4d6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.modal-title {
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
  margin: 0 0 8px;
}

.modal-desc {
  font-weight: 400;
  font-size: 13.5px;
  line-height: 20px;
  color: #8b9097;
  margin: 0 0 24px;
  white-space: pre-line;
}

.modal-btns {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.btn-cancel {
  background: #f0f1f3;
  color: #5a6069;
}

.btn-confirm {
  background: #ffbc00;
  color: #ffffff;
}

.modal-btns.single .btn-confirm {
  color: #191b1e;
}

.btn-confirm:active {
  background: #f0b000;
}
</style>