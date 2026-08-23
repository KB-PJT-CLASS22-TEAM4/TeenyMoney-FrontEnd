import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const frontendRoot = new URL('../', import.meta.url)

function source(path) {
  return readFileSync(new URL(path, frontendRoot), 'utf8')
}

test('iOS PWA는 배경을 상태바 뒤까지 확장한다', () => {
  const index = source('index.html')

  assert.match(index, /viewport-fit=cover/)
  assert.match(
    index,
    /apple-mobile-web-app-status-bar-style[^>]+content="black-translucent"/,
  )
})

test('공통 스타일은 네 방향 Safe Area와 Chrome 검증값을 제공한다', () => {
  const globalCss = source('src/styles/global.css')

  for (const side of ['top', 'right', 'bottom', 'left']) {
    assert.match(
      globalCss,
      new RegExp(`--safe-area-${side}: env\\(safe-area-inset-${side}, 0px\\)`),
    )
  }

  assert.match(globalCss, /html\.safe-area-test\s*\{/)
  assert.match(globalCss, /--safe-area-top:\s*47px/)
  assert.match(globalCss, /--safe-area-bottom:\s*34px/)
})
