import { defineStore } from 'pinia'
import { ref } from 'vue'
import { verifyQrPayment, processPayment } from '@/api/payment'

// QR 스캔 화면 -> 비밀번호 화면 -> 완료 화면으로 결제 정보를 넘기기 위한 스토어
export const usePaymentStore = defineStore('payment', () => {
  const pending = ref(null) // { orderId, merchantName, amount, balance, categoryPolicy, totalAmount, totalCount }
  const lastResult = ref(null) // 결제 성공 후 결과 { amount, balance, categoryPolicy, createdAt, merchantName }

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

    lastResult.value = result.data
    pending.value = null
    return result.data
  }

  function reset() {
    pending.value = null
    lastResult.value = null
  }

  return { pending, lastResult, verifyQr, pay, reset }
})