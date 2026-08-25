import assert from 'node:assert/strict'
import test from 'node:test'

import * as onboardingModule from '../src/utils/onboarding.js'
import {
  getFeatureOnboardingSeenKey,
  getFeatureOnboardingSlides,
  getOnboardingConfig,
  shouldShowChildOnboarding,
  shouldShowFeatureOnboarding,
  shouldShowOnboarding,
} from '../src/utils/onboarding.js'

test('가입 직후 저장한 memberId와 로그인한 memberId가 같으면 온보딩을 보여준다', () => {
  assert.equal(shouldShowOnboarding('12', 12), true)
  assert.equal(shouldShowOnboarding('12', 34), false)
})

test('대기 중인 memberId가 없으면 온보딩을 보여주지 않는다', () => {
  assert.equal(shouldShowOnboarding(null, 12), false)
  assert.equal(shouldShowOnboarding('12', null), false)
})

test('기능 소개는 완료 표시가 있을 때만 건너뛴다', () => {
  assert.equal(shouldShowFeatureOnboarding(null), true)
  assert.equal(shouldShowFeatureOnboarding('true'), false)
})

test('자녀는 연결된 부모가 없을 때만 온보딩 대상이다', () => {
  assert.equal(shouldShowChildOnboarding(null), true)
  assert.equal(shouldShowChildOnboarding({ memberId: 1 }), false)
})

test('memberId별로 기능 소개 완료 여부를 따로 저장한다', () => {
  assert.notEqual(
    getFeatureOnboardingSeenKey(1),
    getFeatureOnboardingSeenKey(2),
  )
})

test('알 수 없는 역할은 온보딩 화면을 구성하지 않는다', () => {
  assert.equal(getOnboardingConfig(undefined), null)
  assert.equal(getFeatureOnboardingSlides('GUEST'), null)
})

test('부모는 초대 코드를 나중에 하고 홈으로 건너뛸 수 있다', () => {
  const parent = getOnboardingConfig('PARENT')
  assert.equal(parent.skipLabel, '나중에 하기')
  assert.equal(parent.skipRoute, 'parents-home')

  const child = getOnboardingConfig('CHILD')
  assert.equal('skipLabel' in child, false)
})

test('역할별 온보딩 이동 경로와 슬라이드가 모두 정의되어 있다', () => {
  for (const role of ['PARENT', 'CHILD']) {
    const config = getOnboardingConfig(role)
    assert.ok(config.primaryRoute)
    assert.ok(config.skipRoute)

    // 슬라이드의 scene 키는 Onboarding.vue의 이미지/심볼 매핑과 짝이 맞아야 한다
    for (const slide of getFeatureOnboardingSlides(role)) {
      assert.ok(
        ['allowance-card', 'goal-star', 'phone-allowance', 'piggy-bank']
          .includes(slide.scene),
        `알 수 없는 scene: ${slide.scene}`,
      )
    }
  }
})

test('모든 온보딩 장면은 확장 시트에 보여줄 미리보기를 제공한다', () => {
  const previewKinds = ['wallet', 'finance', 'quest']

  for (const role of ['PARENT', 'CHILD']) {
    const config = getOnboardingConfig(role)
    assert.equal(config.preview.kind, 'link')
    assert.ok(config.preview.title)
    assert.ok(config.preview.caption)

    for (const slide of getFeatureOnboardingSlides(role)) {
      assert.ok(previewKinds.includes(slide.preview.kind))
      assert.ok(slide.preview.title)
      assert.ok(slide.preview.caption)
    }
  }
})

test('미리보기 헤더는 아이콘과 제목만 제공하고 보조 설명은 중복하지 않는다', () => {
  for (const role of ['PARENT', 'CHILD']) {
    const config = getOnboardingConfig(role)
    assert.equal('cardDescription' in config, false)

    for (const slide of getFeatureOnboardingSlides(role)) {
      assert.equal('sheetDescription' in slide, false)
    }
  }
})

test('모든 온보딩 미리보기는 실제 화면과 강조 영역을 지정한다', () => {
  const previews = ['PARENT', 'CHILD'].flatMap((role) => [
    getOnboardingConfig(role).preview,
    ...getFeatureOnboardingSlides(role).map((slide) => slide.preview),
  ])

  for (const preview of previews) {
    assert.match(preview.screen, /^(parent|child)-(wallet|finance|quest|link)$/)
    assert.ok(preview.screenAlt)
    assert.deepEqual(preview.screenSize, { width: 288, height: 589 })
    assert.deepEqual(Object.keys(preview.focus).sort(), [
      'height',
      'left',
      'top',
      'width',
    ])
    for (const value of Object.values(preview.focus)) {
      assert.ok(value >= 0 && value <= 100)
    }
  }
})

test('강조 영역은 실제 캡처의 기능 카드 경계에 맞는다', () => {
  const expectedFocus = {
    'parent-wallet': { top: 24, left: 4, width: 92, height: 16 },
    'parent-finance': { top: 33, left: 4, width: 92, height: 34 },
    'parent-quest': { top: 14, left: 4, width: 92, height: 16 },
    'parent-link': { top: 9, left: 4, width: 92, height: 20 },
    'child-wallet': { top: 8, left: 4, width: 92, height: 16 },
    'child-finance': { top: 21, left: 5, width: 90, height: 24 },
    'child-quest': { top: 13, left: 4, width: 92, height: 40 },
    'child-link': { top: 31, left: 14, width: 72, height: 7 },
  }

  const previews = ['PARENT', 'CHILD'].flatMap((role) => [
    getOnboardingConfig(role).preview,
    ...getFeatureOnboardingSlides(role).map((slide) => slide.preview),
  ])

  for (const preview of previews) {
    assert.deepEqual(preview.focus, expectedFocus[preview.screen])
  }

  const parentQuest = previews.find(
    (preview) => preview.screen === 'parent-quest',
  )
  assert.equal(parentQuest.title, '퀘스트')
  assert.deepEqual(parentQuest.callout, {
    top: 87,
    left: 70,
    width: 20,
    height: 10,
    title: '퀘스트 생성',
  })
})

test('밝은 마스크 영역은 강조 테두리보다 2px 안쪽에 위치한다', () => {
  assert.equal(typeof onboardingModule.getOnboardingFocusRegions, 'function')

  const parentQuest = getFeatureOnboardingSlides('PARENT')
    .find((slide) => slide.preview.screen === 'parent-quest')
    .preview
  const regions = onboardingModule.getOnboardingFocusRegions(parentQuest)

  assert.equal(regions.length, 2)
  for (const region of regions) {
    const pixelLeft = region.left * parentQuest.screenSize.width / 100
    const pixelTop = region.top * parentQuest.screenSize.height / 100
    const pixelWidth = region.width * parentQuest.screenSize.width / 100
    const pixelHeight = region.height * parentQuest.screenSize.height / 100

    assert.ok(Math.abs(region.maskX - pixelLeft - 2) < 0.000001)
    assert.ok(Math.abs(region.maskY - pixelTop - 2) < 0.000001)
    assert.ok(Math.abs(region.maskWidth - pixelWidth + 4) < 0.000001)
    assert.ok(Math.abs(region.maskHeight - pixelHeight + 4) < 0.000001)
  }
})

test('온보딩 미리보기는 1초 뒤에 자동 표시를 예약한다', () => {
  assert.equal(typeof onboardingModule.scheduleOnboardingPreview, 'function')

  let opened = false
  let scheduledDelay = 0
  const timerId = onboardingModule.scheduleOnboardingPreview(
    () => { opened = true },
    (callback, delay) => {
      scheduledDelay = delay
      callback()
      return 17
    },
  )

  assert.equal(timerId, 17)
  assert.equal(opened, true)
  assert.equal(scheduledDelay, 1000)
})

test('다음 화면 내용은 기존 카드의 퇴장 애니메이션 뒤에 교체한다', () => {
  assert.equal(
    typeof onboardingModule.scheduleOnboardingPreviewSwap,
    'function',
  )

  let swapped = false
  let scheduledDelay = 0
  const timerId = onboardingModule.scheduleOnboardingPreviewSwap(
    () => { swapped = true },
    (callback, delay) => {
      scheduledDelay = delay
      callback()
      return 23
    },
  )

  assert.equal(timerId, 23)
  assert.equal(swapped, true)
  assert.equal(scheduledDelay, 400)
})
