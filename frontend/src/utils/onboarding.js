const ONBOARDING_CONFIG = {
  PARENT: {
    role: 'PARENT',
    badge: '부모 계정',
    title: '자녀와 함께\n티니머니를 시작해요',
    description: '초대 코드를 만들고 자녀 계정과 연결하면\n용돈과 소비 습관을 함께 관리할 수 있어요.',
    cardLabel: '첫 번째 할 일',
    cardTitle: '자녀 초대하기',
    cardDescription: '6자리 코드를 자녀에게 알려주세요',
    primaryLabel: '초대 코드 만들기',
    primaryRoute: 'parents-link-code',
    skipRoute: 'parents-home',
  },
  CHILD: {
    role: 'CHILD',
    badge: '자녀 계정',
    title: '부모님과 연결하고\n용돈 생활을 시작해요',
    description: '부모님에게 받은 초대 코드를 입력하면\n우리 가족의 티니머니가 연결돼요.',
    cardLabel: '부모님께 확인해요',
    cardTitle: '초대 코드 입력하기',
    cardDescription: '부모님이 만든 6자리 코드가 필요해요',
    primaryLabel: '초대 코드 입력하기',
    primaryRoute: 'child-link',
    skipRoute: 'child-home',
  },
}

const FEATURE_ONBOARDING_SLIDES = {
  PARENT: [
    {
      eyebrow: '01 · 용돈 생활',
      title: '용돈 흐름을\n한눈에 살펴봐요',
      description: '주고받은 용돈과 소비 내역을 함께 확인해요.',
      scene: 'allowance-card',
      sheetTitle: '필요할 때 바로 관리해요',
      sheetDescription: '용돈을 보내고 자녀의 사용 내역을 함께 살펴보세요.',
    },
    {
      eyebrow: '02 · 금융상품',
      title: '우리 가족만의\n저축 목표를 만들어요',
      description: '예·적금 상품을 만들고 자녀의 도전을 응원해요.',
      scene: 'piggy-bank',
      sheetTitle: '목표를 함께 정해요',
      sheetDescription: '우리 가족에게 맞는 저축 상품과 목표를 만들어 보세요.',
    },
    {
      eyebrow: '03 · 퀘스트와 티니점수',
      title: '좋은 금융 습관을\n재미있게 응원해요',
      description: '퀘스트를 만들고 성장 과정을 함께 칭찬해요.',
      scene: 'goal-star',
      sheetTitle: '작은 성취도 놓치지 않아요',
      sheetDescription: '퀘스트와 티니점수로 자녀의 성장을 응원해 주세요.',
    },
  ],
  CHILD: [
    {
      eyebrow: '01 · 나의 용돈',
      title: '내 용돈을\n스스로 확인해요',
      description: '받은 용돈과 사용 내역을 쉽고 빠르게 살펴봐요.',
      scene: 'phone-allowance',
      sheetTitle: '오늘 쓸 수 있는 돈이 보여요',
      sheetDescription: '잔액과 최근 용돈 내역을 휴대폰에서 바로 확인해요.',
    },
    {
      eyebrow: '02 · 금융상품',
      title: '내 목표를 정하고\n차곡차곡 모아요',
      description: '가족 금융상품에 가입해 저축을 직접 경험해요.',
      scene: 'piggy-bank',
      sheetTitle: '모을수록 목표에 가까워져요',
      sheetDescription: '부모님이 만든 예·적금에 가입하고 목표를 달성해 보세요.',
    },
    {
      eyebrow: '03 · 퀘스트와 티니점수',
      title: '도전할수록\n금융 실력이 자라요',
      description: '퀘스트를 완료하고 티니점수와 경험을 쌓아요.',
      scene: 'goal-star',
      sheetTitle: '오늘도 한 단계 성장했어요',
      sheetDescription: '퀘스트에 도전하고 가족과 함께 성취를 축하해요.',
    },
  ],
}

export const ONBOARDING_PENDING_MEMBER_KEY = 'onboardingPendingMemberId'

export function getFeatureOnboardingSlides(role) {
  return FEATURE_ONBOARDING_SLIDES[role] || null
}

export function getFeatureOnboardingSeenKey(memberId) {
  return `featureOnboardingSeen:${memberId}`
}

export function shouldShowFeatureOnboarding(completedValue) {
  return completedValue !== 'true'
}

export function getOnboardingConfig(role) {
  return ONBOARDING_CONFIG[role] || null
}

export function shouldShowOnboarding(pendingMemberId, loggedInMemberId) {
  if (pendingMemberId == null || loggedInMemberId == null) {
    return false
  }

  return String(pendingMemberId) === String(loggedInMemberId)
}

export function shouldShowChildOnboarding(parent) {
  return parent == null
}
