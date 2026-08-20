export function isQuestDeadlineExpiredError(error) {
  return error?.status === 400
}

export function getExtendedDeadlineIso(
  currentDeadline,
  extensionDays = 7,
) {
  const now = new Date()
  let base = now

  if (currentDeadline) {
    let parsed

    if (Array.isArray(currentDeadline)) {
      const [
        y,
        m,
        d,
        h = 0,
        mi = 0,
        s = 0,
      ] = currentDeadline

      parsed = new Date(y, m - 1, d, h, mi, s)
    } else {
      parsed = new Date(currentDeadline)

      if (
        Number.isNaN(parsed.getTime()) &&
        typeof currentDeadline === 'string'
      ) {
        parsed = new Date(
          currentDeadline.replace(' ', 'T'),
        )
      }
    }

    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed > now
    ) {
      base = parsed
    }
  }

  const extended = new Date(base)
  extended.setDate(
    extended.getDate() + extensionDays,
  )

  return toLocalDateTimeString(extended)
}

/**
 * Date를 서버의 LocalDateTime이 받는 형식(YYYY-MM-DDTHH:mm:ss)으로 만든다.
 *
 * toISOString()을 쓰면 안 된다. 그건 UTC로 변환하는데 서버 필드는 타임존이 없는
 * LocalDateTime이라, Jackson이 끝의 Z를 조용히 떼어내고 앞부분만 파싱한다.
 * 그러면 KST 기준으로 9시간 앞당겨진 시각이 저장된다.
 *
 * 그래서 UTC로 넘기지 않고 로컬 구성요소를 그대로 조립한다.
 */
function toLocalDateTimeString(date) {
  const pad = (n) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
