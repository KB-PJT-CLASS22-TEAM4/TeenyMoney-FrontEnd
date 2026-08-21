import { getKstParts, parseServerDate } from '@/utils/datetime'

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
    const parsed = parseServerDate(currentDeadline)

    if (parsed && parsed > now) {
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
 * Date를 서버 LocalDateTime(YYYY-MM-DDTHH:mm:ss)로 만든다.
 * 서버 필드는 타임존이 없으므로 KST 벽시계를 그대로 넣는다.
 */
function toLocalDateTimeString(date) {
  const { year, month, day, hour, minute, second } = getKstParts(date)
  const pad = (n) => String(n).padStart(2, '0')

  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`
}
