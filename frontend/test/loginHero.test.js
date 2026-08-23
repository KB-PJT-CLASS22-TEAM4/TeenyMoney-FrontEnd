import assert from 'node:assert/strict'
import test from 'node:test'

import { clampSheet, snapTarget, videoSources } from '../src/utils/loginHero.js'

const PEEK = 92
const FULL = 500

test('시트를 접힌 높이 아래로 끌어내려도 접힌 높이에 멈춘다', () => {
  assert.equal(clampSheet(20, PEEK, FULL), PEEK)
})

test('시트를 펼친 높이 위로 끌어올려도 펼친 높이에 멈춘다', () => {
  assert.equal(clampSheet(700, PEEK, FULL), FULL)
})

test('범위 안에서는 손가락 위치를 그대로 따라간다', () => {
  assert.equal(clampSheet(300, PEEK, FULL), 300)
})

test('중간점에 못 미치면 접힌 상태로 돌아간다', () => {
  assert.equal(snapTarget(295, PEEK, FULL), PEEK)
})

test('중간점에 닿으면 펼친 상태로 붙는다', () => {
  assert.equal(snapTarget(296, PEEK, FULL), FULL)
})

test('영상 주소가 없으면 빈 목록이라 이미지 폴백으로 넘어간다', () => {
  assert.deepEqual(videoSources('', 5), [])
  assert.deepEqual(videoSources(undefined, 5), [])
})

test('영상 파일명은 세 자리로 채운다', () => {
  assert.deepEqual(videoSources('https://cdn.test/login/v1', 5), [
    'https://cdn.test/login/v1/001.mp4',
    'https://cdn.test/login/v1/002.mp4',
    'https://cdn.test/login/v1/003.mp4',
    'https://cdn.test/login/v1/004.mp4',
    'https://cdn.test/login/v1/005.mp4',
  ])
})

test('주소 끝에 슬래시가 붙어 있어도 //가 생기지 않는다', () => {
  assert.deepEqual(videoSources('https://cdn.test/login/v1/', 1), [
    'https://cdn.test/login/v1/001.mp4',
  ])
})
