import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const frontendRoot = new URL('../', import.meta.url)

function source(path) {
  return readFileSync(new URL(path, frontendRoot), 'utf8')
}

test('일반 화면은 헤더 배경만 Safe Area까지 확장한다', () => {
  const app = source('src/App.vue')

  assert.match(app, /height:\s*calc\(64px \+ var\(--safe-area-top\)\)/)
  assert.match(
    app,
    /padding:\s*var\(--safe-area-top\) 20px 4px\s*!important/,
  )
  assert.match(app, /top:\s*calc\(var\(--safe-area-top\) \+ 32px\)/)
})

test('사이드 메뉴·카메라·하단 메뉴에는 Safe Area 확장을 적용하지 않는다', () => {
  for (const path of [
    'src/components/Parents/ParentMenu.vue',
    'src/components/Child/ChildMenu.vue',
    'src/components/Parents/BottomNav.vue',
    'src/components/Child/BottomTabBar.vue',
    'src/pages/Child/Payment/QRscan.vue',
    'src/pages/Child/Quest/QuestDetail.vue',
  ]) {
    assert.doesNotMatch(source(path), /--safe-area-/)
  }
})

test('로그인은 배경을 화면 끝까지 채우고 하단 내용만 보호한다', () => {
  const login = source('src/pages/Login.vue')

  assert.match(login, /\.stage\s*\{[^}]*top:\s*0;[^}]*left:\s*0;[^}]*right:\s*0;/s)
  assert.match(login, /max\(28px, var\(--safe-area-bottom\)\)/)
  assert.doesNotMatch(login, /env\(safe-area-inset-/)
})

test('온보딩은 장면 이미지를 Safe Area까지 확장하고 콘텐츠는 아래에 둔다', () => {
  const onboarding = source('src/pages/Onboarding.vue')

  assert.match(
    onboarding,
    /\.visual-stage\s*\{[^}]*padding-top:\s*calc\(24px \+ var\(--safe-area-top\)\)/s,
  )
  assert.match(
    onboarding,
    /\.scene\s*\{[^}]*inset:\s*0;/s,
  )
  assert.match(onboarding, /bottom:\s*max\(16px, var\(--safe-area-bottom\)\)/)
  assert.doesNotMatch(onboarding, /env\(safe-area-inset-/)
})
