import assert from 'node:assert/strict'
import test from 'node:test'

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
