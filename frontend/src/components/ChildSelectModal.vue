<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="close"
    >
      <div class="bottom-sheet">
        <div class="sheet-handle"></div>

        <div class="sheet-header">
          <div>
            <h2 class="sheet-title">
              자녀 선택
            </h2>

            <p class="sheet-description">
              {{ description }}
            </p>
          </div>

          <button
            type="button"
            class="sheet-close-btn"
            aria-label="닫기"
            @click="close"
          >
            ×
          </button>
        </div>

        <div
          v-if="loading"
          class="modal-state"
        >
          자녀 정보를 불러오는 중입니다.
        </div>

        <div
          v-else-if="error"
          class="modal-state modal-error"
        >
          {{ error }}
        </div>

        <div
          v-else-if="children.length === 0"
          class="modal-state"
        >
          연결된 자녀가 없습니다.
        </div>

        <div
          v-else
          class="modal-child-list"
        >
          <button
            v-for="child in children"
            :key="child.id"
            type="button"
            class="modal-child-item"
            :class="{
              selected: selectedIds.includes(child.id),
            }"
            @click="toggleChild(child.id)"
          >
            <div class="modal-child-left">
              <div class="modal-avatar">
                <img
                  :src="CHILD_PROFILE_IMAGE"
                  alt=""
                  class="modal-avatar-img"
                />
              </div>

              <span class="modal-child-name">
                {{ child.name }}
              </span>
            </div>

            <div
              class="check-circle"
              :class="{
                checked: selectedIds.includes(child.id),
              }"
            >
              <span
                v-if="selectedIds.includes(child.id)"
                class="check-mark"
              >
                ✓
              </span>
            </div>
          </button>
        </div>

        <button
          type="button"
          class="modal-confirm-btn"
          :disabled="selectedIds.length === 0"
          @click="confirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  children: {
    type: Array,
    default: () => [],
  },
  description: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  confirmText: {
    type: String,
    default: '선택 완료',
  },
})

const emit = defineEmits([
  'update:open',
  'update:selectedIds',
  'confirm',
])

function close() {
  emit('update:open', false)
}

function toggleChild(childId) {
  if (props.multiple) {
    if (props.selectedIds.includes(childId)) {
      emit(
        'update:selectedIds',
        props.selectedIds.filter((id) => id !== childId),
      )
      return
    }

    emit('update:selectedIds', [...props.selectedIds, childId])
    return
  }

  emit(
    'update:selectedIds',
    props.selectedIds.includes(childId) ? [] : [childId],
  )
}

function confirm() {
  if (props.selectedIds.length === 0) {
    return
  }

  emit('confirm')
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.bottom-sheet {
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
  max-height: 70vh;
  padding: 10px 20px 28px;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  background: #ffffff;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  margin: 0 auto 20px;
  border-radius: 20px;
  background: #d7d9dd;
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f1f3;
}

.sheet-title {
  margin: 0 0 5px;
  color: #191b1e;
  font-size: 19px;
  font-weight: 700;
}

.sheet-description {
  margin: 0;
  color: #8b9097;
  font-size: 13px;
}

.sheet-close-btn {
  border: none;
  background: transparent;
  color: #8b9097;
  font-size: 26px;
  cursor: pointer;
}

.modal-state {
  padding: 30px 10px;
  color: #8b9097;
  text-align: center;
  font-size: 14px;
}

.modal-error {
  color: #e34b4b;
}

.modal-child-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 20px;
  padding-top: 0;
  border-top: none;
}

.modal-child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 62px;
  padding: 10px 12px;
  border: 1.5px solid #e7e7e7;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
}

.modal-child-item.selected {
  border-color: #ffbc00;
  background: #fff9e7;
}

.modal-child-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
  background: #eeeeee;
}

.modal-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f4f5f7;
}

.modal-child-name {
  color: #191b1e;
  font-size: 15px;
  font-weight: 600;
}

.check-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid #d7d9dd;
  border-radius: 50%;
}

.check-circle.checked {
  border-color: #ffbc00;
  background: #ffbc00;
}

.check-mark {
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.modal-confirm-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.modal-confirm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
