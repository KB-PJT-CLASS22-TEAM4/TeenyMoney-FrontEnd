const EVENT_CODE_LABELS = {
  SAVING_EARLY_TERMINATED: '적금 중도해지',
  SAVING_FIXED_INSTALLMENT_PAID: '적금 정기 납입',
  SAVING_FREE_INSTALLMENT_PAID: '자유적금 납입',
  SAVING_PAYMENT: '적금 납입',
  SAVING_PAYMENT_PROGRESS: '적금 납입',
  SAVING_MATURED: '적금 만기',
  SAVING_ENROLLMENT: '적금 가입',
  DEPOSIT_ENROLLMENT: '예금 가입',
  DEPOSIT_MATURED: '예금 만기',
  DEPOSIT_EARLY_TERMINATED: '예금 중도해지',
  LOAN_ENROLLMENT: '대출 가입',
  LOAN_REPAYMENT: '대출 상환',
  LOAN_REPAYMENT_PROGRESS: '대출 상환',
  LOAN_OVERDUE: '대출 연체',
  LOAN_COMPLETED: '대출 상환 완료',
  QUEST_COMPLETED: '퀘스트 완료',
  QUEST_FAILED: '퀘스트 실패',
  QUEST_EXPIRED: '퀘스트 만료',
  PAYMENT_WATCH_OVER_THRESHOLD: '관심 업종 결제',
  PAYMENT: '결제',
}

const EVENT_CODE_PREFIX_LABELS = [
  ['SAVING', '적금'],
  ['DEPOSIT', '예금'],
  ['LOAN', '대출'],
  ['QUEST', '퀘스트'],
  ['PAYMENT', '결제'],
  ['ALLOW', '오늘만 허용'],
]

export function formatTeenyScoreEventCode(code) {
  const key = String(code || '').toUpperCase()
  if (!key) return '점수 변동'
  if (EVENT_CODE_LABELS[key]) return EVENT_CODE_LABELS[key]

  const prefix = EVENT_CODE_PREFIX_LABELS.find(([start]) => key.startsWith(start))
  return prefix ? prefix[1] : '점수 변동'
}
