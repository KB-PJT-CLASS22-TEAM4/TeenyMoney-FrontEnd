import { defineStore } from 'pinia'
import { ref } from 'vue'
import { verifyQrPayment, processPayment } from '@/api/payment'

// QR 스캔 화면 -> 비밀번호 화면으로 결제 정보를 넘기기 위한 스토어
export const usePaymentStore = defineStore('payment', () => {
  const pending = ref(null) // { orderId, merchantName, amount, balance, categoryPolicy, totalAmount, totalCount }

  async function verifyQr(accessToken, qrPayload) {
    const result = await verifyQrPayment(accessToken, qrPayload)
    pending.value = result.data
    return result.data
  }

  async function pay(accessToken, password) {
    if (!pending.value?.orderId) {
      throw new Error('결제 정보가 없습니다. QR을 다시 스캔해주세요.')
    }

    const idempotencyKey = crypto.randomUUID()
    const result = await processPayment(accessToken, {
      idempotencyKey,
      orderId: pending.value.orderId,
      password: Number(password),
    })

    pending.value = null
    return result.data
  }

  function reset() {
    pending.value = null
  }

  return { pending, verifyQr, pay, reset }
})