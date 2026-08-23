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

test('공통 상단 헤더는 배경 높이만 확장하고 콘텐츠를 안전영역 아래에 둔다', () => {
  const app = source('src/App.vue')

  assert.doesNotMatch(app, /padding-top:\s*0\s*!important/)
  assert.match(app, /height:\s*calc\(64px \+ var\(--safe-area-top\)\)/)
  assert.match(
    app,
    /padding:\s*var\(--safe-area-top\) 20px 4px\s*!important/,
  )
  assert.match(
    app,
    /top:\s*calc\(var\(--safe-area-top\) \+ 32px\)/,
  )
})

test('부모·자녀 사이드 메뉴의 조작 요소는 Safe Area 안쪽에 있다', () => {
  for (const path of [
    'src/components/Parents/ParentMenu.vue',
    'src/components/Child/ChildMenu.vue',
  ]) {
    const menu = source(path)

    assert.match(
      menu,
      /top:\s*calc\(6px \+ var\(--safe-area-top\)\)/,
    )
    assert.match(
      menu,
      /padding:\s*calc\(18px \+ var\(--safe-area-top\)\) 0 calc\(24px \+ var\(--safe-area-bottom\)\)/,
    )
  }
})

test('하단 내비게이션 배경은 홈 인디케이터까지 확장한다', () => {
  for (const path of [
    'src/components/Parents/BottomNav.vue',
    'src/components/Child/BottomTabBar.vue',
  ]) {
    const nav = source(path)

    assert.match(
      nav,
      /height:\s*calc\(70px \+ var\(--safe-area-bottom\)\)/,
    )
    assert.match(
      nav,
      /padding:\s*10px 0 calc\(20px \+ var\(--safe-area-bottom\)\)/,
    )
  }

  assert.match(
    source('src/components/Child/BottomTabBar.vue'),
    /\.tabbar-anchor\s*\{[^}]*height:\s*calc\(70px \+ var\(--safe-area-bottom\)\)/s,
  )
})
