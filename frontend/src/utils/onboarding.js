const ONBOARDING_SCREEN_SIZE = { width: 288, height: 589 };

const ONBOARDING_CONFIG = {
  PARENT: {
    role: 'PARENT',
    badge: '부모 계정',
    title: '자녀와 함께\n티니머니를 시작해요',
    description:
      '초대 코드를 만들고 자녀 계정과 연결하면\n용돈과 소비 습관을 함께 관리할 수 있어요.',
    cardLabel: '첫 번째 할 일',
    cardTitle: '자녀 초대하기',
    primaryLabel: '초대 코드 만들기',
    primaryRoute: 'parents-link-code',
    skipRoute: 'parents-home',
    preview: {
      kind: 'link',
      screen: 'parent-link',
      screenAlt: '부모 계정의 실제 연동 코드 발급 화면',
      screenSize: ONBOARDING_SCREEN_SIZE,
      focus: { top: 9, left: 4, width: 92, height: 20 },
      title: '자녀 기기에 입력할 코드',
      caption: '실제 연동 코드는 발급 후 10분간 유효해요.',
    },
  },
  CHILD: {
    role: 'CHILD',
    badge: '자녀 계정',
    title: '부모님과 연결하고\n티니 머니를 시작해요',
    description:
      '부모님에게 받은 초대 코드를 입력하면\n우리 가족의 티니머니가 연결돼요.',
    cardLabel: '부모님께 확인해요',
    cardTitle: '초대 코드 입력하기',
    primaryLabel: '초대 코드 입력하기',
    primaryRoute: 'child-link',
    skipRoute: 'child-home',
    preview: {
      kind: 'link',
      screen: 'child-link',
      screenAlt: '자녀 계정의 실제 부모님 연동 코드 입력 화면',
      screenSize: ONBOARDING_SCREEN_SIZE,
      focus: { top: 28, left: 9, width: 81, height: 11 },
      title: '부모님 연동 코드 입력',
      caption: '부모님 앱에서 발급한 6자리 코드를 입력해요.',
    },
  },
};

const FEATURE_ONBOARDING_SLIDES = {
  PARENT: [
    {
      eyebrow: '01 · 용돈 관리',
      title: '아이에게\n용돈을 지급해봐요',
      description: '충전과 용돈 지급을 통해 아이에게 용돈을 주세요.',
      scene: 'allowance-card',
      sheetTitle: '필요할 때 바로 관리해요',
      preview: {
        kind: 'wallet',
        screen: 'parent-wallet',
        screenAlt: '부모 계정의 실제 티니머니 홈 화면',
        screenSize: ONBOARDING_SCREEN_SIZE,
        focus: { top: 24, left: 4, width: 92, height: 16 },
        title: '부모님의 티니머니 잔액',
        caption: '자녀 상세 화면에서 잔액과 최근 거래를 함께 확인 가능해요.',
      },
    },
    {
      eyebrow: '02 · 금융상품',
      title: '우리 아이의\n금융 목표를 함께 세워요',
      description: '아이에게 맞는 금융 상품을 만들고 목표 달성을 응원해요.',
      scene: 'piggy-bank',
      sheetTitle: '목표에 맞는 상품을 만들어요',
      preview: {
        kind: 'finance',
        screen: 'parent-finance',
        screenAlt: '부모 계정의 실제 자녀 금융 상품 관리 화면',
        screenSize: ONBOARDING_SCREEN_SIZE,
        focus: { top: 33, left: 4, width: 92, height: 34 },
        title: '리포트주니어님의 금융 상품',
        callout: {
          top: 86,
          left: 70,
          width: 22,
          height: 11,
          title: '금융 상품 생성',
        },
        caption: '자녀가 이용 중인 금융 상품을 한눈에 관리하고 생성해요.',
      },
    },
    {
      eyebrow: '03 · 퀘스트와 티니점수',
      title: '재미있는 퀘스트로\n아이의 도전을 응원해요',
      description: '퀘스트를 만들고 완료 보상으로 용돈과 티니점수를 지급해요.',
      scene: 'goal-star',
      sheetTitle: '작은 성취도 놓치지 않아요',
      preview: {
        kind: 'quest',
        screen: 'parent-quest',
        screenAlt: '부모 계정의 실제 퀘스트 관리 화면',
        screenSize: ONBOARDING_SCREEN_SIZE,
        focus: { top: 14, left: 4, width: 92, height: 16 },
        title: '퀘스트',
        callout: {
          top: 87,
          left: 71,
          width: 22,
          height: 11,
          title: '퀘스트 생성',
        },
        caption: '상태별 퀘스트를 확인하고 새로운 도전을 만들어요.',
      },
    },
  ],
  CHILD: [
    {
      eyebrow: '01 · 나의 용돈',
      title: '내 용돈을\n스스로 확인해요',
      description: '받은 용돈과 사용 내역을 쉽고 빠르게 살펴봐요.',
      scene: 'phone-allowance',
      sheetTitle: '오늘 쓸 수 있는 돈이 보여요',
      preview: {
        kind: 'wallet',
        screen: 'child-wallet',
        screenAlt: '자녀 계정의 실제 티니머니 거래내역 화면',
        screenSize: ONBOARDING_SCREEN_SIZE,
        focus: { top: 8, left: 4, width: 92, height: 16 },
        title: '티니머니',
        caption: '실제 거래내역 화면에서 잔액과 입·출금 내역을 확인해요.',
      },
    },
    {
      eyebrow: '02 · 금융상품',
      title: '내 목표를 정하고\n차곡차곡 모아요',
      description: '가족 금융상품에 가입해 저축을 직접 경험해요.',
      scene: 'piggy-bank',
      sheetTitle: '모을수록 목표에 가까워져요',
      preview: {
        kind: 'finance',
        screen: 'child-finance',
        screenAlt: '자녀 계정의 실제 나의 금융 상품 화면',
        screenSize: ONBOARDING_SCREEN_SIZE,
        focus: { top: 21, left: 5, width: 90, height: 24 },
        title: '나의 상품',
        caption: '실제 나의 상품 화면처럼 상품 유형과 납입 현황을 확인해요.',
      },
    },
    {
      eyebrow: '03 · 퀘스트와 티니점수',
      title: '재미있게\n퀘스트를 시작해요',
      description: '퀘스트를 완료하고 티니점수와 용돈을 받아요.',
      scene: 'goal-star',
      sheetTitle: '오늘도 한 단계 성장했어요',
      preview: {
        kind: 'quest',
        screen: 'child-quest',
        screenAlt: '자녀 계정의 실제 완료한 퀘스트 화면',
        screenSize: ONBOARDING_SCREEN_SIZE,
        focus: { top: 15, left: 2, width: 95, height: 40 },
        title: '완료한 퀘스트',
        caption: '메달이 있는 퀘스트를 완료하면 티니점수가 올라가요.',
      },
    },
  ],
};

export const ONBOARDING_PENDING_MEMBER_KEY = 'onboardingPendingMemberId';

export function scheduleOnboardingPreview(open, schedule = setTimeout) {
  return schedule(open, 1000);
}

export function scheduleOnboardingPreviewSwap(swap, schedule = setTimeout) {
  return schedule(swap, 400);
}

export function getOnboardingFocusRegions(preview) {
  const { width: screenWidth, height: screenHeight } = preview.screenSize;
  const regions = [
    { ...preview.focus, title: preview.title, isCallout: false },
    ...(preview.callout ? [{ ...preview.callout, isCallout: true }] : []),
  ];

  return regions.map((region) => ({
    ...region,
    maskX: (region.left * screenWidth) / 100 + 2,
    maskY: (region.top * screenHeight) / 100 + 2,
    maskWidth: (region.width * screenWidth) / 100 - 4,
    maskHeight: (region.height * screenHeight) / 100 - 4,
    maskRadius: region.isCallout ? 16 : 10,
  }));
}

export function getFeatureOnboardingSlides(role) {
  return FEATURE_ONBOARDING_SLIDES[role] || null;
}

export function getFeatureOnboardingSeenKey(memberId) {
  return `featureOnboardingSeen:${memberId}`;
}

export function shouldShowFeatureOnboarding(completedValue) {
  return completedValue !== 'true';
}

export function getOnboardingConfig(role) {
  return ONBOARDING_CONFIG[role] || null;
}

export function shouldShowOnboarding(pendingMemberId, loggedInMemberId) {
  if (pendingMemberId == null || loggedInMemberId == null) {
    return false;
  }

  return String(pendingMemberId) === String(loggedInMemberId);
}

export function shouldShowChildOnboarding(parent) {
  return parent == null;
}
