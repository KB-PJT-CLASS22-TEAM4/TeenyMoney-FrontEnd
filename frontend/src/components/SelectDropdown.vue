<template>
  <div class="select-dropdown">
    <button
      type="button"
      class="select-trigger"
      :class="{ open }"
      @click.stop="$emit('toggle')"
    >
      <span>{{ selectedLabel }}</span>
      <span class="select-caret" aria-hidden="true"></span>
    </button>

    <div
      v-if="open"
      class="select-menu"
      :class="{ 'open-up': placement === 'up' }"
      @click.stop
    >
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="select-option"
        :class="{ active: isSelected(option.value) }"
        @click="pick(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  open: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: 'down',
  },
  placeholder: {
    type: String,
    default: '선택해주세요',
  },
})

const emit = defineEmits(['update:modelValue', 'toggle'])

const selectedLabel = computed(() => {
  const found = props.options.find(
    (option) => String(option.value) === String(props.modelValue)
  )
  return found ? found.label : props.placeholder
})

function isSelected(value) {
  return String(props.modelValue) === String(value)
}

function pick(value) {
  emit('update:modelValue', value)
  if (props.open) emit('toggle')
}
</script>

<style scoped>
.select-dropdown {
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  outline: none;
  background: #ffffff;
  color: #191b1e;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  box-sizing: border-box;
  cursor: pointer;
}

.select-trigger.open {
  border-color: #ffbc00;
  background: #fffdf6;
}

.select-caret {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin-left: 8px;
  border-right: 1.6px solid #8b9097;
  border-bottom: 1.6px solid #8b9097;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 0.2s ease;
}

.select-trigger.open .select-caret {
  transform: rotate(225deg) translateY(-2px);
  border-color: #ffbc00;
}

.select-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  max-height: 168px;
  overflow-y: auto;
  padding: 6px;
  border: 1px solid #eee3c4;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(25, 27, 30, 0.12);
}

.select-menu.open-up {
  top: auto;
  bottom: calc(100% + 6px);
}

.select-option {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #191b1e;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.select-option + .select-option {
  margin-top: 2px;
}

.select-option:hover {
  background: #fff8e1;
}

.select-option.active {
  background: #ffbc00;
  color: #191b1e;
}
</style>
