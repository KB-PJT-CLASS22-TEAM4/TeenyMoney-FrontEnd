/**
 * 청소년 눈높이에 맞춘 쉬운 금융 용어 사전
 */
export const FINANCE_TERMS = {
  '단리': {
    term: '단리',
    title: '단리 (단순 이자)',
    icon: '🪙',
    badge: '이자 방식',
    summary: '처음 넣은 원금에만 정해진 이자가 붙는 방식이에요.',
    desc: '매달 혹은 매년 똑같은 금액의 이자가 차곡차곡 더해져요. 계산하기 쉽고 가장 기본적인 이자 지급 방식이에요!',
    example: '10,000원을 연 5% 단리로 넣으면, 매년 똑같이 500원씩 이자가 생겨요.',
  },
  '복리': {
    term: '복리',
    title: '복리 (눈덩이 이자)',
    icon: '⛄',
    badge: '이자 방식',
    summary: '원금뿐만 아니라 불어난 이자에도 이자가 또 붙어요!',
    desc: '눈사람을 굴릴수록 눈덩이가 점점 커지듯이, 시간이 지날수록 이자가 붙는 속도가 점점 더 빨라져요.',
    example: '1년 차에 생긴 이자 500원에도 2년 차부터 이자가 또 붙어서 돈이 더 빠르게 불어나요!',
  },
  '정액적립식': {
    term: '정액적립식',
    title: '정액적립식 (정기적금)',
    icon: '📅',
    badge: '적립 방식',
    summary: '매월 정해진 날짜에 정해진 금액을 규칙적으로 저축해요.',
    desc: '용돈 받는 날에 맞춰 매월 꾸준히 저축하면서 스스로 좋은 금융 습관을 기를 수 있어요.',
    example: '매월 10일마다 용돈에서 10,000원씩 통장에 쏙 넣어요.',
  },
  '자유적립식': {
    term: '자유적립식',
    title: '자유적립식 (자유적금)',
    icon: '🎯',
    badge: '적립 방식',
    summary: '정해진 날짜 없이 원할 때마다 자유롭게 저축해요.',
    desc: '세뱃돈이나 보너스 용돈이 생겼을 때 원하는 금액만큼 언제든지 편하게 넣을 수 있어요.',
    example: '이번 달엔 5,000원, 다음 달엔 용돈이 남아서 20,000원 저축!',
  },
  '원리금균등': {
    term: '원리금균등',
    title: '원리금균등 (원금+이자 균등상환)',
    icon: '⚖️',
    badge: '상환 방식',
    summary: '빌린 돈(원금)과 이자를 합쳐 매달 똑같은 금액으로 나누어 갚아요.',
    desc: '매달 나가는 상환 금액이 항상 일정해서 용돈을 계획적으로 지출하기에 가장 좋아요.',
    example: '3개월 동안 매달 똑같이 6,700원씩 나누어 갚아요.',
  },
  '원리금균등상환': {
    term: '원리금균등상환',
    title: '원리금균등상환',
    icon: '⚖️',
    badge: '상환 방식',
    summary: '빌린 돈(원금)과 이자를 합쳐 매달 똑같은 금액으로 나누어 갚아요.',
    desc: '매달 나가는 상환 금액이 항상 일정해서 용돈을 계획적으로 지출하기에 가장 좋아요.',
    example: '3개월 동안 매달 똑같이 6,700원씩 나누어 갚아요.',
  },
  '원금균등': {
    term: '원금균등',
    title: '원금균등상환',
    icon: '📉',
    badge: '상환 방식',
    summary: '빌린 원금만 똑같이 나누고, 이자는 남은 돈에 맞춰 갚아요.',
    desc: '처음에는 내야 하는 돈이 조금 크지만, 갚을수록 남은 원금이 줄어들어 매달 내는 돈이 점점 줄어들어요.',
    example: '첫 달 7,000원, 둘째 달 6,700원, 셋째 달 6,400원처럼 점점 줄어들어요.',
  },
  '원금균등상환': {
    term: '원금균등상환',
    title: '원금균등상환',
    icon: '📉',
    badge: '상환 방식',
    summary: '빌린 원금만 똑같이 나누고, 이자는 남은 돈에 맞춰 갚아요.',
    desc: '처음에는 내야 하는 돈이 조금 크지만, 갚을수록 남은 원금이 줄어들어 매달 내는 돈이 점점 줄어들어요.',
    example: '첫 달 7,000원, 둘째 달 6,700원, 셋째 달 6,400원처럼 점점 줄어들어요.',
  },
  '만기일시상환': {
    term: '만기일시상환',
    title: '만기일시상환',
    icon: '⏰',
    badge: '상환 방식',
    summary: '기간 중에는 매달 이자만 내다가, 마지막 날에 원금을 한 번에 갚아요.',
    desc: '매달 내는 부담은 적지만, 마지막 날에 큰돈을 한꺼번에 준비해야 하니 미리 계획해야 해요.',
    example: '매달 이자 300원만 내다가, 마지막 3개월 차에 20,000원을 한 번에 갚아요.',
  },
  '티니점수': {
    term: '티니점수',
    title: '티니점수 (금융 신용 점수)',
    icon: '⭐',
    badge: '신용 등급',
    summary: '약속을 잘 지키고 성실하게 금융 활동을 했는지 보여주는 점수예요.',
    desc: '퀘스트를 완료하거나 적금을 꾸준히 만기 완납하면 점수가 쑥쑥 올라요! 점수가 높으면 더 높은 우대 금리나 대출 혜택을 받을 수 있어요.',
    example: '성실하게 저축하고 약속을 지키면 점수가 올라가서 등급이 업그레이드돼요!',
  },
  '중도해지': {
    term: '중도해지',
    title: '중도해지 (통장 미리 깨기)',
    icon: '⚠️',
    badge: '해지 안내',
    summary: '만기 약속 날짜가 되기 전에 통장을 미리 깨는 거예요.',
    desc: '급하게 돈이 필요할 때 해지할 수 있지만, 원래 약속했던 이자보다 적게 받고 티니점수가 깎일 수 있어요.',
    example: '가급적 만기일까지 꾹 참고 유지하는 것이 이자와 신용 점수에 훨씬 유리해요!',
  },
  '조기상환': {
    term: '조기상환',
    title: '조기상환 (미리 갚기)',
    icon: '🚀',
    badge: '대출 상환',
    summary: '대출 만기일이 되기 전에 빌린 돈을 미리 갚는 거예요.',
    desc: '남은 기간 동안의 이자 부담을 줄일 수 있고, 성실하게 갚으면 티니점수에도 좋은 영향을 줘요!',
    example: '용돈이 생겼을 때 미리 갚으면 이자를 아낄 수 있어요.',
  },
}

export function getFinanceTerm(termName) {
  if (!termName) return null
  const clean = String(termName).replace(/\s+/g, '').trim()

  // 1. 원리금균등 / 원리 균등 관련
  if (clean.includes('원리금균등') || clean.includes('원리균등') || clean.includes('원리금')) {
    return FINANCE_TERMS['원리금균등상환']
  }
  // 2. 원금균등
  if (clean.includes('원금균등')) {
    return FINANCE_TERMS['원금균등상환']
  }
  // 3. 만기일시
  if (clean.includes('만기일시')) {
    return FINANCE_TERMS['만기일시상환']
  }
  // 4. 단리 / 복리
  if (clean.includes('복리')) {
    return FINANCE_TERMS['복리']
  }
  if (clean.includes('단리')) {
    return FINANCE_TERMS['단리']
  }
  // 5. 정액적립 / 자유적립
  if (clean.includes('자유적립') || clean.includes('자유적금')) {
    return FINANCE_TERMS['자유적립식']
  }
  if (clean.includes('정액적립') || clean.includes('정기적금') || clean.includes('정액')) {
    return FINANCE_TERMS['정액적립식']
  }
  // 6. 기타
  for (const [key, val] of Object.entries(FINANCE_TERMS)) {
    const cleanKey = key.replace(/\s+/g, '')
    if (clean.includes(cleanKey) || cleanKey.includes(clean)) {
      return val
    }
  }
  return null
}
