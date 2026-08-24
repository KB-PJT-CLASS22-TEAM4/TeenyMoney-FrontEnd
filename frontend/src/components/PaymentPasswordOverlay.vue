<template>
  <div v-if="show" class="overlay">
    <div class="pay-pw-screen">
      <header class="nav">
        <button
          class="back-btn"
          type="button"
          aria-label="뒤로가기"
          :disabled="submitting"
          @click="emit('close')"
        >
          <img
            src="@/assets/icons/icon-back.svg"
            alt=""
            class="back-icon"
          />
        </button>

        <h1 class="nav-title">
          결제 비밀번호
        </h1>

        <ParentNavActions />
      </header>

      <div class="content">
        <div class="lock-area">
          <div class="lock-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#ffffff" stroke-width="1.8"/>
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#ffffff" stroke-width="1.8"/>
              <circle cx="12" cy="15" r="1.3" fill="#ffffff"/>
            </svg>
          </div>

          <p class="lock-text">
            결제 비밀번호를 입력해 주세요
          </p>

          <div class="dots">
            <span
              v-for="n in 6"
              :key="n"
              class="dot"
              :class="{ filled: pin.length >= n }"
            ></span>
          </div>
        </div>

        <div class="keypad">
          <button
            v-for="k in ['1','2','3','4','5','6','7','8','9']"
            :key="k"
            class="key"
            type="button"
            :disabled="submitting"
            @click="press(k)"
          >
            {{ k }}
          </button>
          <span class="key empty"></span>
          <button
            class="key"
            type="button"
            :disabled="submitting"
            @click="press('0')"
          >
            0
          </button>
          <button
            class="key"
            type="button"
            aria-label="지우기"
            :disabled="submitting"
            @click="remove"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" stroke="#15171b" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M13 9l4 4M17 9l-4 4" stroke="#15171b" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'close'])

const pin = ref('')
const PIN_LENGTH = 6

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      pin.value = ''
    }
  }
)

watch(pin, (val) => {
  if (val.length === PIN_LENGTH && !props.submitting) {
    emit('submit', val)
  }
})

function press(num) {
  if (pin.value.length >= PIN_LENGTH || props.submitting) return
  pin.value += num
}

function remove() {
  if (props.submitting) return
  pin.value = pin.value.slice(0, -1)
}

function reset() {
  pin.value = ''
}

defineExpose({ reset })
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  justify-content: center;
  background: #f8fafc;
}

.pay-pw-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
}

.nav {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  width: 100%;
  height: 56px;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #eceef1;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
  transform: translateX(-50%);
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 24px 16px 32px;
  box-sizing: border-box;
  gap: 36px;
}

.lock-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  margin-top: 0;
  padding: 0 20px;
}

.lock-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 76px;
  height: 76px;
  background: #ffbc00;
  border-radius: 50%;
}

.lock-text {
  margin: 30px 0 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
  text-align: center;
}

.dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-top: 40px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: background 0.15s;
}

.dot.filled {
  background: #ffbc00;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  align-items: center;
  width: 100%;
  max-width: 360px;
  margin-top: 0;
  padding: 12px 8px 4px;
  gap: 8px 0;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 24px;
}

.key {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 56px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-weight: 500;
  font-size: 26px;
  line-height: 1;
  text-align: center;
  color: #15171b;
  cursor: pointer;
  border-radius: 12px;
  appearance: none;
  -webkit-appearance: none;
}

.key:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.key:active:not(:disabled) {
  background: #f4f5f6;
}

.key.empty {
  cursor: default;
}

.key.empty:active {
  background: transparent;
}
</style>
