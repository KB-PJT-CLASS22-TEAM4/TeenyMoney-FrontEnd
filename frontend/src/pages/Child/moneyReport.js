// 머니 리포트 - 순수 계산 로직 + 더미 데이터
//
// [API 연동 필요]
// 백엔드에 GET /api/v1/reports/money?month=YYYY-MM 이 생기면
// fetchMoneyReport() 안의 더미 조회만 fetch 로 바꾸면 된다.
// 응답 구조는 REPORTS 의 각 값과 동일하게 맞춰 두었다.
//
// 지금 안 하는 것:
// - insightCode -> 문구 사전 (정의서 7.2). 실제 API 가 코드를 주기 시작하면
//   habits 의 line / lineTeen 을 코드별 템플릿으로 바꾼다.

import { todayKstDate } from '@/utils/datetime'

export const AGE_BAND_TEEN_FROM = 13

// 만 나이 -> JUNIOR(7~12) / TEEN(13~18)
// today 는 한국 시간대 기준 'YYYY-MM-DD'
export function ageBandFromBirthDate(birthDate, today) {
  if (!birthDate) return 'JUNIOR'
  const b = String(birthDate).replaceAll('.', '-').slice(0, 10)
  const [by, bm, bd] = b.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  if (!by || !ty) return 'JUNIOR'
  let age = ty - by
  if (tm < bm || (tm === bm && td < bd)) age -= 1
  return age >= AGE_BAND_TEEN_FROM ? 'TEEN' : 'JUNIOR'
}

// 한국 시간대 기준 오늘 'YYYY-MM-DD'
export function todayKST(now = new Date()) {
  return todayKstDate(now)
}

export function won(n) {
  return Number(n).toLocaleString('ko-KR') + '원'
}

export function comma(n) {
  return Number(n).toLocaleString('ko-KR')
}

// 정의서 6.4 정렬: 금액 내림차순 -> 횟수 내림차순 -> 이름 오름차순
export function sortCategories(rows) {
  return [...rows].sort(
    (a, b) =>
      b.amount - a.amount || b.count - a.count || a.name.localeCompare(b.name, 'ko')
  )
}

const CAT_COLORS = ['#E8A400', '#2C6ED5', '#1E9E62', '#8B5CF6', '#E4761B', '#9A948A']

export function decorateCategories(rows, total) {
  return sortCategories(rows).map((r, i) => ({
    ...r,
    color: CAT_COLORS[i % CAT_COLORS.length],
    pct: total ? Math.round((r.amount / total) * 100) : 0,
  }))
}

export function donutGradient(cats) {
  if (!cats.length) return '#EDE8DC'
  let at = 0
  const stops = cats.map((c) => {
    const from = at
    at += c.pct
    return `${c.color} ${from}% ${at}%`
  })
  // 반올림으로 100% 에 못 미치면 마지막 색으로 채운다
  if (at < 100) stops.push(`${cats[cats.length - 1].color} ${at}% 100%`)
  return `conic-gradient(${stops.join(',')})`
}

// 주차별 막대: 최고 지출 주차를 강조색으로
export function weeklyBars(rows, maxHeight) {
  const max = Math.max(...rows.map((r) => r.amount), 0) || 1
  return rows.map((r) => ({
    ...r,
    top: r.amount === max && r.amount > 0,
    height: r.amount ? Math.max(8, Math.round((r.amount / max) * maxHeight)) : 4,
    short: r.amount ? comma(Math.round(r.amount / 1000)) + 'k' : '0',
  }))
}

// 'YYYY-MM-DD' 두 날짜 사이 일수
export function daysBetween(fromISO, toISO) {
  const ms = Date.parse(toISO + 'T00:00:00Z') - Date.parse(fromISO + 'T00:00:00Z')
  return Math.round(ms / 86400000)
}

export function ddayLabel(fromISO, toISO) {
  const d = daysBetween(fromISO, toISO)
  if (d < 0) return '지남'
  if (d === 0) return 'D-day'
  return 'D-' + d
}

// 증감 표기 (정의서 11: 색뿐 아니라 +/- 와 증가/감소 문구를 함께)
export function deltaText(current, previous, unit = '원') {
  const diff = current - previous
  if (diff === 0) return { label: `변화 없음`, dir: 'flat' }
  const sign = diff > 0 ? '+' : '-'
  const word = diff > 0 ? '증가' : '감소'
  return {
    label: `${sign}${comma(Math.abs(diff))}${unit} ${word}`,
    dir: diff > 0 ? 'up' : 'down',
  }
}

export function countDeltaText(current, previous) {
  const diff = current - previous
  if (diff === 0) return '횟수 변화 없음'
  return `횟수 ${diff > 0 ? '+' : '-'}${Math.abs(diff)}회`
}

// ---------------------------------------------------------------------------
// 더미 데이터 (API 나오면 통째로 교체)
// ---------------------------------------------------------------------------

// 정의서 8.2 availableMonths.
// 기록이 있는 달만 IN_PROGRESS / COMPLETED 로 두었다.
export const AVAILABLE_MONTHS = [
  { yearMonth: '2026-08', status: 'IN_PROGRESS' },
  { yearMonth: '2026-07', status: 'COMPLETED' },
  { yearMonth: '2026-06', status: 'NO_RECORD' },
  { yearMonth: '2026-05', status: 'NO_RECORD' },
  { yearMonth: '2026-04', status: 'NO_RECORD' },
  { yearMonth: '2026-03', status: 'NO_RECORD' },
  { yearMonth: '2026-02', status: 'NO_RECORD' },
  { yearMonth: '2026-01', status: 'BEFORE_JOIN' },
]

export const MONTH_STATUS_LABEL = {
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  NO_RECORD: '기록 없음',
  BEFORE_JOIN: '가입 이전',
}

const AUG = {
  period: {
    yearMonth: '2026-08',
    startDate: '2026-08-01',
    endDate: '2026-08-13',
    status: 'IN_PROGRESS',
    comparisonStartDate: '2026-07-01',
    comparisonEndDate: '2026-07-13',
  },
  greeting: '8월 머니 리포트가 도착했어요. 지금까지 한 일을 같이 볼까요?',
  summary: [
    { key: 'spent', label: '사용한 돈', amount: 38200, tone: 'ink', note: '7번 결제했어요.', noteTeen: '결제 7건 · 전월 대비 +6,100원' },
    { key: 'saved', label: '모은 돈', amount: 20000, tone: 'ok', note: '예금과 적금에 넣었어요.', noteTeen: '예금 10,000 · 적금 10,000' },
    { key: 'earned', label: '직접 얻은 돈', amount: 5000, tone: 'info', note: '퀘스트를 완료해서 받았어요.', noteTeen: '퀘스트 보상 2건' },
    { key: 'repaid', label: '갚은 돈', amount: 10000, tone: 'ink', note: '대출을 1번 갚았어요.', noteTeen: '원금 9,600 · 이자 400' },
  ],
  spending: {
    total: 38200,
    count: 7,
    prevTotal: 32100,
    prevCount: 6,
    prevLabel: '전월 같은 기간',
    weekly: [
      { label: '1주', amount: 9800 },
      { label: '2주', amount: 15600 },
      { label: '3주', amount: 12800 },
      { label: '4주', amount: 0 },
    ],
    categories: [
      { name: '카페·디저트', amount: 9500, count: 3 },
      { name: '편의점', amount: 8700, count: 1 },
      { name: '문구·도서·완구', amount: 7000, count: 1 },
      { name: '게임', amount: 6500, count: 1 },
      { name: '대중교통', amount: 6500, count: 1 },
    ],
  },
  watch: { count: 1, total: 7, amount: 6500, prev: 0, over: false, rows: [{ name: '게임', count: 1, amount: 6500 }] },
  habits: [
    {
      key: 'spend', title: '소비', code: 'SPENDING_TOP_CATEGORY', color: '#E8A400',
      line: '이번 달에는 7번 결제해서 모두 38,200원을 사용했어요. 카페·디저트에서 가장 많이 사용했어요.',
      lineTeen: '총 지출 38,200원·7회. 카페·디저트 3회·9,500원으로 전체 지출의 25%입니다. 전월 같은 기간 대비 +6,100원(+19%)·+1회.',
    },
    {
      key: 'perm', title: '소통 · 오늘만 허용', code: 'PERMISSION_STATUS_SUMMARY', color: '#2C6ED5',
      line: '게임 업종을 이용하려고 오늘만 허용을 1번 요청했어요. 이유를 적어서 보냈고 부모님이 승인했어요.',
      lineTeen: '게임 카테고리 오늘만 허용 1회 요청·승인 1건. 사유 작성 포함. 요청과 이후 결제는 연결되지 않습니다.',
    },
    {
      key: 'save', title: '저축 · 상환', code: 'SAVING_PAYMENT_PROGRESS', color: '#1E9E62',
      progress: 50, stampsDone: 3, stampsTotal: 6,
      stampNote: '적금 6번 중 3번 완료 · 다음 납입일 8월 25일',
      line: '6번 중 3번의 적금 납입을 완료했어요. 지금까지 30,000원을 모았고, 대출도 5번 중 2번 갚았어요.',
      lineTeen: '적금 납입 진행률 50%(3/6회)·누적 30,000원, 다음 납입 8월 25일. 대출 상환 진행률 40%(2/5회)·남은 원금 30,000원.',
    },
    {
      key: 'quest', title: '책임 · 퀘스트', code: 'QUEST_COMPLETED', color: '#8B5CF6',
      line: '퀘스트 2개를 완료하고 5,000원을 받았어요. 지금 1개를 하고 있어요.',
      lineTeen: '퀘스트 완료 2건·보상 5,000원 획득. 진행 중 1건(마감 8월 31일)·실패 0건.',
    },
  ],
  products: [
    { name: '티니 자유적금', family: true, type: '적금', status: '유지 중', tone: 'ok', range: '2026.05.25 ~ 2026.11.25', progress: 50, progressLabel: '납입 3/6회 · 50%', note: '다음 납입일은 8월 25일이에요.', noteTeen: '진행률 50% · 누적 30,000원 · 다음 납입 8월 25일' },
    { name: '튼튼 정기예금', family: false, type: '예금', status: '유지 중', tone: 'ok', range: '2026.03.02 ~ 2026.09.02', note: '지금 120,000원이 들어 있고 9월 2일에 만기가 돼요.', noteTeen: '현재 120,000원 · 만기 2026.09.02 (D-20)' },
    { name: '자전거 대출', family: true, type: '대출', status: '상환 진행 중', tone: 'info', range: '2026.04.20 ~ 2026.09.20', progress: 40, progressLabel: '상환 2/5회 · 40%', note: '앞으로 갚을 돈은 30,000원이에요.', noteTeen: '진행률 40% · 남은 원금 30,000원 · 다음 상환 8월 20일' },
  ],
  score: {
    net: 3, inc: 1, dec: 0,
    reasons: [{ title: '적금 정기 납입 완료', code: 'SAVING_FIXED_INSTALLMENT_PAID', delta: '+3', dir: 'up' }],
  },
  schedules: [
    { date: '2026-08-20', title: '자전거 대출 상환', sub: '10,000원 낼 예정이에요', subTeen: '대출 상환 · 2026.08.20', amount: 10000, kind: 'loan' },
    { date: '2026-08-25', title: '티니 자유적금 납입', sub: '10,000원 넣을 예정이에요', subTeen: '적금 납입 · 2026.08.25', amount: 10000, kind: 'saving' },
    { date: '2026-08-31', title: '방 정리하기 퀘스트 마감', sub: '보상 3,000원', subTeen: '퀘스트 마감 · 2026.08.31', amount: 3000, kind: 'quest' },
    { date: '2026-09-02', title: '튼튼 정기예금 만기', sub: '120,000원을 받아요', subTeen: '예금 만기 · 2026.09.02', amount: 120000, kind: 'deposit' },
  ],
}

const JUL = {
  period: {
    yearMonth: '2026-07',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'COMPLETED',
    comparisonStartDate: '2026-06-01',
    comparisonEndDate: '2026-06-30',
  },
  greeting: '7월 리포트예요. 지난 달에 한 일을 다시 볼 수 있어요.',
  summary: [
    { key: 'spent', label: '사용한 돈', amount: 32100, tone: 'ink', note: '9번 결제했어요.', noteTeen: '결제 9건 · 전월 대비 -4,300원' },
    { key: 'saved', label: '모은 돈', amount: 10000, tone: 'ok', note: '적금에 넣었어요.', noteTeen: '적금 10,000' },
    { key: 'earned', label: '직접 얻은 돈', amount: 3000, tone: 'info', note: '퀘스트 1개를 완료했어요.', noteTeen: '퀘스트 보상 1건' },
    { key: 'repaid', label: '갚은 돈', amount: 10000, tone: 'ink', note: '대출을 1번 갚았어요.', noteTeen: '원금 9,700 · 이자 300' },
  ],
  spending: {
    total: 32100,
    count: 9,
    prevTotal: 36400,
    prevCount: 11,
    prevLabel: '직전 달',
    weekly: [
      { label: '1주', amount: 7200 },
      { label: '2주', amount: 11000 },
      { label: '3주', amount: 6400 },
      { label: '4주', amount: 5500 },
      { label: '5주', amount: 2000 },
    ],
    categories: [
      { name: '편의점', amount: 11000, count: 4 },
      { name: '카페·디저트', amount: 8600, count: 3 },
      { name: '온라인쇼핑', amount: 6500, count: 1 },
      { name: '대중교통', amount: 6000, count: 1 },
    ],
  },
  watch: {
    count: 3, total: 9, amount: 10500, prev: 1, over: true,
    rows: [{ name: '게임', count: 2, amount: 4000 }, { name: '온라인쇼핑', count: 1, amount: 6500 }],
  },
  habits: [
    {
      key: 'spend', title: '소비', code: 'SPENDING_CATEGORY_CHANGE', color: '#E8A400',
      line: '7월에는 9번 결제해서 모두 32,100원을 사용했어요. 편의점에서 가장 많이 사용했어요.',
      lineTeen: '총 지출 32,100원·9회. 편의점 4회·11,000원으로 34%. 직전 달 대비 -4,300원(-12%)·-2회.',
    },
    {
      key: 'save', title: '저축 · 상환', code: 'SAVING_PAYMENT_PROGRESS', color: '#1E9E62',
      progress: 33, stampsDone: 2, stampsTotal: 6,
      stampNote: '7월까지 적금 6번 중 2번 완료',
      line: '7월에는 적금 1번을 넣어서 6번 중 2번을 완료했어요. 대출도 1번 갚았어요.',
      lineTeen: '적금 납입 1회(누적 2/6회·33%). 대출 상환 1회·누적 1/5회.',
    },
    {
      key: 'quest', title: '책임 · 퀘스트', code: 'QUEST_COMPLETED', color: '#8B5CF6',
      line: '퀘스트 1개를 완료하고 3,000원을 받았어요. 수락하지 않은 퀘스트 1개는 기한이 지났어요.',
      lineTeen: '퀘스트 완료 1건·보상 3,000원. 만료 1건(미수락)·실패 0건.',
    },
  ],
  products: AUG.products,
  score: {
    net: -2, inc: 1, dec: 1,
    reasons: [
      { title: '관심 업종 결제 기준 초과', code: 'PAYMENT_WATCH_OVER_THRESHOLD', delta: '-5', dir: 'down' },
      { title: '적금 정기 납입 완료', code: 'SAVING_FIXED_INSTALLMENT_PAID', delta: '+3', dir: 'up' },
    ],
  },
  // 정의서 6.7: 과거 달은 다가오는 일정을 숨긴다
  schedules: [],
}

const REPORTS = { '2026-08': AUG, '2026-07': JUL }

export function emptyReport(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    period: {
      yearMonth,
      startDate: `${yearMonth}-01`,
      endDate: `${yearMonth}-${pad(last)}`,
      status: 'COMPLETED',
      comparisonStartDate: '',
      comparisonEndDate: '',
    },
    greeting: `${m}월에는 아직 기록이 없어요. 하나씩 시작해 볼까요?`,
    isEmpty: true,
    summary: AUG.summary.map((s) => ({
      key: s.key, label: s.label, amount: 0, tone: 'muted',
      note: '기록이 없어요.', noteTeen: '0건',
    })),
    spending: { total: 0, count: 0, prevTotal: 0, prevCount: 0, prevLabel: '', weekly: [], categories: [] },
    watch: { count: 0, total: 0, amount: 0, prev: 0, over: false, rows: [] },
    habits: [],
    products: [],
    score: null,
    schedules: [],
    shortcuts: ['적금 시작하기', '퀘스트 보러 가기'],
  }
}

// [API 연동 지점] GET /api/v1/reports/money?month=YYYY-MM
export async function fetchMoneyReport(accessToken, yearMonth) {
  const found = REPORTS[yearMonth]
  if (found) return found
  const month = AVAILABLE_MONTHS.find((m) => m.yearMonth === yearMonth)
  if (!month || month.status === 'BEFORE_JOIN') {
    throw new Error('조회할 수 없는 달이에요.')
  }
  return emptyReport(yearMonth)
}
