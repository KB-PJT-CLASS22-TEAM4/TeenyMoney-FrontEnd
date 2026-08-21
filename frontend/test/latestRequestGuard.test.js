import assert from 'node:assert/strict'
import test from 'node:test'

import { createLatestRequestGuard } from '../src/utils/latestRequestGuard.js'

test('늦게 끝난 이전 요청은 최신 요청이 아니다', () => {
  const guard = createLatestRequestGuard()
  const previousRequest = guard.begin()
  const latestRequest = guard.begin()

  assert.equal(guard.isLatest(previousRequest), false)
  assert.equal(guard.isLatest(latestRequest), true)
})

test('초기화 전에 시작한 요청은 더 이상 최신 요청이 아니다', () => {
  const guard = createLatestRequestGuard()
  const request = guard.begin()

  guard.invalidate()

  assert.equal(guard.isLatest(request), false)
})
