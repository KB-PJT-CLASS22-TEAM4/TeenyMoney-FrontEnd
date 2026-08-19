// node --test src/pages/Child/moneyReport.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ageBandFromBirthDate, sortCategories, decorateCategories, donutGradient,
  weeklyBars, ddayLabel, deltaText, countDeltaText, fetchMoneyReport, emptyReport,
} from './moneyReport.js'

test('연령 모드는 만 나이 13세부터 TEEN', () => {
  assert.equal(ageBandFromBirthDate('2013-08-13', '2026-08-13'), 'TEEN')   // 생일 당일
  assert.equal(ageBandFromBirthDate('2013-08-14', '2026-08-13'), 'JUNIOR') // 생일 하루 전
  assert.equal(ageBandFromBirthDate('2016-01-01', '2026-08-13'), 'JUNIOR')
  assert.equal(ageBandFromBirthDate('', '2026-08-13'), 'JUNIOR')          // 정보 없으면 쉬운 쪽
})

test('카테고리 정렬: 금액 -> 횟수 -> 이름', () => {
  const sorted = sortCategories([
    { name: '나', amount: 100, count: 1 },
    { name: '가', amount: 100, count: 1 },
    { name: '다', amount: 100, count: 3 },
    { name: '라', amount: 500, count: 1 },
  ])
  assert.deepEqual(sorted.map((c) => c.name), ['라', '다', '가', '나'])
})

test('비중은 총액 기준, 총액 0이면 0%', () => {
  const cats = decorateCategories([{ name: 'A', amount: 25, count: 1 }], 100)
  assert.equal(cats[0].pct, 25)
  assert.equal(decorateCategories([{ name: 'A', amount: 0, count: 0 }], 0)[0].pct, 0)
})

test('도넛은 반올림 오차가 있어도 100%까지 채운다', () => {
  const g = donutGradient(decorateCategories(
    [{ name: 'A', amount: 1, count: 1 }, { name: 'B', amount: 1, count: 1 }, { name: 'C', amount: 1, count: 1 }],
    3,
  ))
  assert.match(g, /100%\)$/)
  assert.equal(donutGradient([]), '#EDE8DC')
})

test('막대는 최고 지출 주차만 강조, 0원도 보이는 높이', () => {
  const bars = weeklyBars([{ label: '1주', amount: 50 }, { label: '2주', amount: 100 }, { label: '3주', amount: 0 }], 60)
  assert.deepEqual(bars.map((b) => b.top), [false, true, false])
  assert.equal(bars[1].height, 60)
  assert.equal(bars[2].height, 4)
})

test('D-day', () => {
  assert.equal(ddayLabel('2026-08-13', '2026-08-20'), 'D-7')
  assert.equal(ddayLabel('2026-08-13', '2026-08-13'), 'D-day')
  assert.equal(ddayLabel('2026-08-13', '2026-08-12'), '지남')
})

test('증감은 부호와 증가/감소 문구를 함께 낸다', () => {
  assert.equal(deltaText(38200, 32100).label, '+6,100원 증가')
  assert.equal(deltaText(32100, 36400).label, '-4,300원 감소')
  assert.equal(deltaText(100, 100).dir, 'flat')
  assert.equal(countDeltaText(9, 11), '횟수 -2회')
})

test('기록 없는 달은 빈 리포트, 가입 이전 달은 오류', async () => {
  const aug = await fetchMoneyReport('t', '2026-08')
  assert.equal(aug.spending.total, 38200)
  assert.equal((await fetchMoneyReport('t', '2026-06')).isEmpty, true)
  await assert.rejects(() => fetchMoneyReport('t', '2026-01'))
  await assert.rejects(() => fetchMoneyReport('t', '2025-12'))
})

test('빈 리포트의 조회 기간은 그 달 말일까지', () => {
  assert.equal(emptyReport('2026-02').period.endDate, '2026-02-28')
  assert.equal(emptyReport('2026-06').period.endDate, '2026-06-30')
})
