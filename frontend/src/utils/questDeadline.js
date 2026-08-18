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

  return extended.toISOString()
}
