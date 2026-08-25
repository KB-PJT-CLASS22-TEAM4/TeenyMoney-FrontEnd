import assert from 'node:assert/strict'
import test from 'node:test'

import { createServer } from 'vite'

const BACKEND_SSE_EVENT_TYPES = [
  'QUEST',
  'TODAY_PERMISSION',
  'CONNECTION',
  'TRANSFER',
  'PAYMENT',
  'CHARGE',
  'DEPOSIT_ENROLLMENT',
  'SAVING_ENROLLMENT',
  'LOAN_ENROLLMENT',
  'DEPOSIT_MATURITY',
  'SAVING_MATURITY',
  'SAVING_PAYMENT',
  'LOAN_REPAYMENT',
  'DEPOSIT_TERMINATION',
  'SAVING_TERMINATION',
  'TEENY_SCORE_GRADE',
  'CATEGORY_POLICY',
]

test('백엔드가 발행하는 SSE 이벤트를 모두 구독한다', async () => {
  const vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })

  try {
    const { SSE_EVENT_TYPES } = await vite.ssrLoadModule('/src/stores/sse.js')

    assert.deepEqual(SSE_EVENT_TYPES, BACKEND_SSE_EVENT_TYPES)
  } finally {
    await vite.close()
  }
})
