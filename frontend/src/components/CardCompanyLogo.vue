<template>
  <img
    :src="src"
    alt=""
    @error="onError"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_PAYMENT_LOGO,
  getCardCompanyLogo,
} from '@/utils/cardCompanyLogo'

const props = defineProps({
  cardCompany: {
    type: String,
    default: '',
  },
})

const failed = ref(false)

const src = computed(() => {
  if (failed.value) return DEFAULT_PAYMENT_LOGO
  return getCardCompanyLogo(props.cardCompany)
})

watch(
  () => props.cardCompany,
  () => {
    failed.value = false
  }
)

function onError() {
  failed.value = true
}
</script>
