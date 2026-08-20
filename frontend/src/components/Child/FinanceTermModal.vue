<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  termData: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['close'])

function onClose() {
  emit('close')
}
</script>

<template>
  <Transition name="term-modal-fade">
    <div v-if="show && termData" class="term-modal-backdrop" @click.self="onClose">
      <div class="term-modal-dialog">
        <!-- 닫기 버튼 -->
        <button type="button" class="btn-term-close" @click="onClose" aria-label="닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 상단 뱃지 & 아이콘 -->
        <div class="term-header">
          <span v-if="termData.badge" class="term-badge">{{ termData.badge }}</span>
          <div class="term-icon-circle">
            <span class="term-emoji">{{ termData.icon || '💡' }}</span>
          </div>
          <h3 class="term-title">{{ termData.title || termData.term }}</h3>
        </div>

        <!-- 핵심 요약 하이라이트 박스 -->
        <div class="term-summary-box">
          <p class="summary-text">{{ termData.summary }}</p>
        </div>

        <!-- 상세 설명 -->
        <div class="term-body">
          <p class="desc-text">{{ termData.desc }}</p>

          <!-- 쉬운 예시 카드 -->
          <div v-if="termData.example" class="example-box">
            <div class="example-label">
              <span class="ex-title">쉽게 보는 예시</span>
            </div>
            <p class="example-text">{{ termData.example }}</p>
          </div>
        </div>

        <!-- 확인 버튼 -->
        <button type="button" class="btn-term-confirm" @click="onClose">
          이해했어요
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.term-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.term-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px 20px;
  text-align: center;
  box-sizing: border-box;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.btn-term-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s ease;
}

.btn-term-close:hover {
  background: #f1f5f9;
}

.term-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 14px;
}

.term-badge {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 800;
  color: #2563eb;
  background: #eff6ff;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 10px;
  border: 1px solid #bfdbfe;
}

.term-icon-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #fffbeb;
  border: 2px solid #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.term-emoji {
  font-size: 28px;
}

.term-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.term-summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.summary-text {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.45;
  word-break: keep-all;
}

.term-body {
  text-align: left;
  margin-bottom: 18px;
}

.desc-text {
  margin: 0 0 12px;
  font-size: 13px;
  color: #475569;
  line-height: 1.55;
  word-break: keep-all;
  white-space: pre-line;
}

.example-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 10px 12px;
}

.example-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}

.ex-icon {
  font-size: 13px;
}

.ex-title {
  font-size: 11.5px;
  font-weight: 800;
  color: #2563eb;
}

.example-text {
  margin: 0;
  font-size: 12.5px;
  color: #1d4ed8;
  line-height: 1.45;
  word-break: keep-all;
}

.btn-term-confirm {
  width: 100%;
  padding: 13px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #15171b;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.15s ease;
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.25);
}

.btn-term-confirm:active {
  transform: scale(0.98);
  background: #f5b300;
}

/* 트랜지션 */
.term-modal-fade-enter-active,
.term-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.term-modal-fade-enter-active .term-modal-dialog,
.term-modal-fade-leave-active .term-modal-dialog {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.term-modal-fade-enter-from,
.term-modal-fade-leave-to {
  opacity: 0;
}

.term-modal-fade-enter-from .term-modal-dialog,
.term-modal-fade-leave-to .term-modal-dialog {
  opacity: 0;
  transform: scale(0.92) translateY(10px);
}
</style>
