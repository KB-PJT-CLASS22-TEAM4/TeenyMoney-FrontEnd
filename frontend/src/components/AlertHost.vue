<template>
  <ConfirmModal
    :show="modal.state.alertVisible"
    :title="modal.state.alertTitle"
    :description="modal.state.alertMessage"
    hide-cancel
    confirm-text="확인"
    @confirm="modal.closeAlert()"
    @cancel="modal.closeAlert()"
  />

  <ConfirmModal
    :show="modal.state.confirmVisible"
    :title="modal.state.confirmTitle"
    :description="modal.state.confirmMessage"
    confirm-text="확인"
    cancel-text="취소"
    @confirm="modal.resolveConfirm(true)"
    @cancel="modal.resolveConfirm(false)"
  />
</template>

<script setup>
import ConfirmModal from '@/components/ConfirmModal.vue'

defineProps({
  modal: {
    type: Object,
    required: true,
  },
})
</script>
