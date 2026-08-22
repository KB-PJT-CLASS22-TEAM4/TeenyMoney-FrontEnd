const VIDEO_COUNT = 5

// 드래그 중 시트 높이를 접힌 높이와 펼친 높이 사이로 제한한다.
export function clampSheet(value, peek, full) {
  if (value < peek) return peek
  if (value > full) return full
  return value
}

// 손을 뗐을 때 붙을 위치. 중간점을 넘었으면 펼치고, 아니면 접는다.
export function snapTarget(value, peek, full) {
  return value >= (peek + full) / 2 ? full : peek
}

/**
 * 영상 주소 목록을 만든다. base가 비어 있으면 빈 배열을 돌려준다.
 *
 * 빈 배열이 "CDN 미설정 -> 이미지 폴백"의 유일한 판정 지점이다. 컴포넌트가 base를
 * 직접 보고 분기하면 자동재생 차단, reduced-motion 폴백과 경로가 갈라지고, 셋 중
 * 하나를 고칠 때 나머지 둘을 빠뜨리게 된다.
 *
 * 끝의 슬래시를 떼는 이유는 주소에 //가 생기면 CDN 캐시 키가 갈리기 때문이다.
 */
export function videoSources(base, count = VIDEO_COUNT) {
  if (!base) return []

  const origin = base.replace(/\/+$/, '')

  return Array.from(
    { length: count },
    (_, index) => `${origin}/${String(index + 1).padStart(3, '0')}.mp4`,
  )
}
