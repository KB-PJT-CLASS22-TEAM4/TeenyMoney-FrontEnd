import { parseServerDate } from '@/utils/datetime'

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

  const extended = new Date(base.getTime() + extensionDays * 86400000)
  return extended.toISOString()
}
