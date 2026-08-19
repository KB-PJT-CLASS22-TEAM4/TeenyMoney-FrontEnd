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
  getPaymentMethodLogo,
} from '@/utils/paymentMethodLogo'

const props = defineProps({
  payment: {
    type: Object,
    default: null,
  },
  cardNumber: {
    type: String,
    default: '',
  },
})

const failed = ref(false)

const src = computed(() => {
  if (failed.value) return DEFAULT_PAYMENT_LOGO
  return getPaymentMethodLogo(props.payment, props.cardNumber)
})

watch(
  () => [props.payment, props.cardNumber],
  () => {
    failed.value = false
  }
)

function onError() {
  failed.value = true
}
</script>
