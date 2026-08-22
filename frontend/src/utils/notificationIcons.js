function iconSvg(color, inner) {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none">${inner.replaceAll('{{c}}', color)}</svg>`
}

const ICONS = {
  PAYMENT: {
    bg: '#eff6ff',
    svg: iconSvg(
      '#3b82f6',
      '<rect x="3" y="6" width="18" height="12" rx="2.2" stroke="{{c}}" stroke-width="1.7"/><path d="M3 10h18" stroke="{{c}}" stroke-width="1.7"/><path d="M7 15h4" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/>',
    ),
  },
  QUEST: {
    bg: '#fff8e5',
    svg: iconSvg(
      '#d97706',
      '<rect x="6" y="4" width="12" height="16" rx="2" stroke="{{c}}" stroke-width="1.7"/><rect x="9" y="2.5" width="6" height="3" rx="1" stroke="{{c}}" stroke-width="1.7" fill="#fff8e5"/><path d="M9 11h6M9 14.5h4" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/>',
    ),
  },
  QUEST_VERIFY: {
    bg: '#eef2ff',
    svg: iconSvg(
      '#4f46e5',
      '<rect x="4" y="7" width="16" height="12" rx="2.2" stroke="{{c}}" stroke-width="1.7"/><circle cx="12" cy="13" r="3.2" stroke="{{c}}" stroke-width="1.7"/><path d="M9 7l1.2-2h3.6L15 7" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
  },
  QUEST_DONE: {
    bg: '#ecfdf5',
    svg: iconSvg(
      '#16a34a',
      '<circle cx="12" cy="12" r="8.5" stroke="{{c}}" stroke-width="1.7"/><path d="M8.4 12.2l2.4 2.4 4.8-5.2" stroke="{{c}}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
  },
  QUEST_REJECT: {
    bg: '#fef2f2',
    svg: iconSvg(
      '#ef4444',
      '<circle cx="12" cy="12" r="8.5" stroke="{{c}}" stroke-width="1.7"/><path d="M9 9l6 6M15 9l-6 6" stroke="{{c}}" stroke-width="1.8" stroke-linecap="round"/>',
    ),
  },
  FINANCE: {
    bg: '#f0fdfa',
    svg: iconSvg(
      '#0d9488',
      '<rect x="5" y="10" width="14" height="9" rx="2" stroke="{{c}}" stroke-width="1.7"/><path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/><path d="M12 13.5v2.2" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/>',
    ),
  },
  ALLOWANCE: {
    bg: '#fff7ed',
    svg: iconSvg(
      '#ea580c',
      '<rect x="3" y="7" width="18" height="12" rx="2.2" stroke="{{c}}" stroke-width="1.7"/><circle cx="12" cy="13" r="2.4" stroke="{{c}}" stroke-width="1.7"/><path d="M7 10h1.5M15.5 16H17" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/>',
    ),
  },
  TODAY_ALLOW: {
    bg: '#fff1f2',
    svg: iconSvg(
      '#e11d48',
      '<path d="M12 3.5l7 3v5.3c0 4.3-2.8 7.4-7 8.7-4.2-1.3-7-4.4-7-8.7V6.5l7-3z" stroke="{{c}}" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.5 12.2l1.8 1.8 3.4-3.6" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
  },
  FAMILY: {
    bg: '#f5f3ff',
    svg: iconSvg(
      '#7c3aed',
      '<circle cx="9" cy="8.5" r="2.6" stroke="{{c}}" stroke-width="1.7"/><circle cx="16" cy="10" r="2.2" stroke="{{c}}" stroke-width="1.7"/><path d="M4.8 18c.4-2.8 2.4-4.4 4.2-4.4s3.8 1.6 4.2 4.4M13.2 18c.3-1.8 1.5-3 2.8-3s2.5 1.2 2.8 3" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/>',
    ),
  },
  SCORE: {
    bg: '#fffbeb',
    svg: iconSvg(
      '#ca8a04',
      '<path d="M12 3.6l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.1l-4.8 2.4.9-5.4-3.9-3.8 5.4-.8L12 3.6z" stroke="{{c}}" stroke-width="1.7" stroke-linejoin="round"/>',
    ),
  },
  CHARGE: {
    bg: '#ecfeff',
    svg: iconSvg(
      '#0891b2',
      '<rect x="4" y="6" width="16" height="12" rx="2.2" stroke="{{c}}" stroke-width="1.7"/><path d="M12 9.2v5.6M9.2 12h5.6" stroke="{{c}}" stroke-width="1.8" stroke-linecap="round"/>',
    ),
  },
  DEFAULT: {
    bg: '#f2f4f6',
    svg: iconSvg(
      '#8b9097',
      '<path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" stroke="{{c}}" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="{{c}}" stroke-width="1.7" stroke-linecap="round"/>',
    ),
  },
}

export function resolveNotificationKind(n) {
  const type = String(n?.referenceType || n?.type || '').toUpperCase()
  const text = `${n?.title || ''} ${n?.detail || ''} ${n?.content || ''}`

  if (
    type === 'PERMISSION' ||
    type === 'TODAY_ALLOW' ||
    type === 'TODAYALLOW' ||
    type === 'TODAY_PERMISSION' ||
    type === 'HARMFUL' ||
    /오늘만\s*허용|유해/.test(text)
  ) {
    return 'TODAY_ALLOW'
  }

  if (
    type === 'FAMILY' ||
    type === 'LINK' ||
    type === 'CHILD_LINK' ||
    /연결됐|연동됐|연결되었|연동되었/.test(text)
  ) {
    return 'FAMILY'
  }

  if (
    type === 'FINANCE' ||
    type === 'FINANCIAL_PRODUCT' ||
    type === 'FINANCIAL_PRODUCTS' ||
    type === 'ENROLLMENT' ||
    type === 'PRODUCT_ENROLLMENT' ||
    type === 'SAVING' ||
    type === 'SAVINGS' ||
    type === 'DEPOSIT' ||
    type === 'LOAN' ||
    /금융\s*상품|금융상품|상품\s*가입|가입\s*(승인|신청|요청|거절)|적금|예금|대출|중도해지|조기상환/.test(text)
  ) {
    return 'FINANCE'
  }

  if (
    type === 'ALLOWANCE' ||
    type === 'REGULAR_ALLOWANCE' ||
    /용돈|정기\s*용돈/.test(text)
  ) {
    return 'ALLOWANCE'
  }

  if (type === 'CHARGE' || type === 'WALLET' || /충전/.test(text)) {
    return 'CHARGE'
  }

  if (
    type === 'TEENY_SCORE' ||
    type === 'SCORE' ||
    type === 'TEENY' ||
    /티니점수|티니\s*점수/.test(text)
  ) {
    return 'SCORE'
  }

  if (type === 'QUEST' || /퀘스트/.test(text)) {
    if (/거절|반려/.test(text)) return 'QUEST_REJECT'
    if (/인증/.test(text)) return 'QUEST_VERIFY'
    if (/승인|보상\s*지급|완료/.test(text)) return 'QUEST_DONE'
    return 'QUEST'
  }

  if (type === 'PAYMENT' || type === 'TRANSACTION') {
    return 'PAYMENT'
  }

  if (/결제\s*비밀번호/.test(text)) return 'DEFAULT'
  if (/자녀.{0,12}결제|결제했|결제가\s*완료|결제\s*완료|결제/.test(text)) {
    return 'PAYMENT'
  }

  return ICONS[type] ? type : 'DEFAULT'
}

export function getNotificationIcon(n) {
  const kind = resolveNotificationKind(n)
  return ICONS[kind] || ICONS.DEFAULT
}
