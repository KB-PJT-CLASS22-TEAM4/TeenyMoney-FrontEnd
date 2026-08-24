import { getKstParts, parseServerDate } from '@/utils/datetime'

export const QUEST_REVIEW_REQUEST_INVALID =
  'QUEST_REVIEW_REQUEST_INVALID'

export function isQuestReviewRequestInvalidError(error) {
  return error?.code === QUEST_REVIEW_REQUEST_INVALID
}

export function isQuestDeadlinePassed(deadline) {
  const parsed = parseServerDate(deadline)
  if (!parsed) return false
  return parsed.getTime() < Date.now()
}

export function buildRejectAfterDeadlineOptions(
  deadline,
  afterDeadlineAction,
) {
  if (!afterDeadlineAction) return {}

  if (afterDeadlineAction === 'EXTEND') {
    return {
      afterDeadlineAction: 'EXTEND',
      extendedDeadline: getExtendedDeadlineIso(deadline),
    }
  }

  return {
    afterDeadlineAction: 'FAIL',
  }
}

export function isQuestDeadlineExpiredError(error) {
  // 반려 요청 검증 실패(사유/기한 후 처리)는 기한 만료와 구분
  if (isQuestReviewRequestInvalidError(error)) {
    return false
  }

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
