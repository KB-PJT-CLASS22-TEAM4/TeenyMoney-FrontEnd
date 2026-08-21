export const KST_TIME_ZONE = 'Asia/Seoul'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const HAS_TIMEZONE = /[zZ]|[+-]\d{2}:?\d{2}$/
const NAIVE_DATETIME =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/

function pad2(value) {
  return String(value).padStart(2, '0')
}

function kstPartNumber(parts, type) {
  return Number(parts.find((part) => part.type === type)?.value)
}

/** 타임존 없는 연월일·시분초를 KST 벽시계로 Date에 넣는다. */
function dateFromKstWallClock(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
) {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - KST_OFFSET_MS,
  )
}

/** 서버 LocalDateTime / Jackson 배열은 KST. Z가 붙은 값만 UTC로 본다. */
export function parseServerDate(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value
    if (year == null || month == null || day == null) return null

    const millisecond = Number(nano) > 1000 ? Math.floor(Number(nano) / 1e6) : Number(nano) || 0
    const date = dateFromKstWallClock(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
    )
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number)
    return parseServerDate([year, month, day])
  }

  const raw = trimmed.replace(' ', 'T')

  if (!HAS_TIMEZONE.test(raw)) {
    const match = raw.match(NAIVE_DATETIME)
    if (match) {
      const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '0'] = match
      const millisecond = fraction
        ? Number(String(fraction).slice(0, 3).padEnd(3, '0'))
        : 0
      const date = dateFromKstWallClock(
        Number(year),
        Number(month),
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        millisecond,
      )
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getKstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date)

  return {
    year: kstPartNumber(parts, 'year'),
    month: kstPartNumber(parts, 'month'),
    day: kstPartNumber(parts, 'day'),
    hour: kstPartNumber(parts, 'hour'),
    minute: kstPartNumber(parts, 'minute'),
    second: kstPartNumber(parts, 'second'),
    weekday: parts.find((part) => part.type === 'weekday')?.value ?? '',
  }
}

export function isSameKstDay(a, b) {
  const left = getKstParts(a)
  const right = getKstParts(b)
  return left.year === right.year && left.month === right.month && left.day === right.day
}

export function startOfKstDay(date = new Date()) {
  const { year, month, day } = getKstParts(date)
  return dateFromKstWallClock(year, month, day)
}

export function todayKstDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function calcKstDDay(deadline) {
  const end = deadline instanceof Date ? deadline : parseServerDate(deadline)
  if (!end) return null

  const diffMs = startOfKstDay(end).getTime() - startOfKstDay(new Date()).getTime()
  return Math.max(0, Math.round(diffMs / 86400000))
}

export function formatKstDate(value, empty = '') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const { year, month, day } = getKstParts(date)
  return `${year}.${pad2(month)}.${pad2(day)}`
}

export function formatKstDateTime(value, empty = '') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const { year, month, day, hour, minute } = getKstParts(date)
  return `${year}.${pad2(month)}.${pad2(day)} ${pad2(hour)}:${pad2(minute)}`
}

export function formatKstTime(value, empty = '') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const { hour, minute } = getKstParts(date)
  return `${pad2(hour)}:${pad2(minute)}`
}

export function formatKstDateTimeWithWeekday(value, empty = '') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const { year, month, day, hour, minute } = getKstParts(date)
  const weekday = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIME_ZONE,
    weekday: 'short',
  }).format(date)

  return `${year}.${pad2(month)}.${pad2(day)} (${weekday}) ${pad2(hour)}:${pad2(minute)}`
}

export function formatKstRelativeDay(value, empty = '-') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const now = new Date()
  if (isSameKstDay(date, now)) return '오늘'

  const yesterday = new Date(now.getTime() - 86400000)
  if (isSameKstDay(date, yesterday)) return '어제'

  const diffDays = Math.max(
    1,
    Math.round((startOfKstDay(now).getTime() - startOfKstDay(date).getTime()) / 86400000),
  )
  return `${diffDays}일 전`
}

export function currentKstYearMonth(now = new Date()) {
  const { year, month } = getKstParts(now)
  return `${year}-${pad2(month)}`
}

export function formatKstClock12(value, empty = '') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const { hour, minute } = getKstParts(date)
  const period = hour < 12 ? '오전' : '오후'
  const hour12 = hour % 12 || 12
  return `${period} ${hour12}:${pad2(minute)}`
}

export function formatKstMonthDayLabel(value, empty = '') {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return empty

  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)
  const { month, day } = getKstParts(date)
  const md = `${month}월 ${day}일`

  if (isSameKstDay(date, now)) return `오늘 · ${md}`
  if (isSameKstDay(date, yesterday)) return `어제 · ${md}`
  return md
}

export function toKstLocalDateTimeString(value) {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return ''

  const { year, month, day, hour, minute, second } = getKstParts(date)
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}`
}

export function toUtcIsoFromKstLocal(year, month, day, hour = 0, minute = 0, second = 0) {
  return dateFromKstWallClock(year, month, day, hour, minute, second).toISOString()
}

export function utcIsoFromKstDatetimeLocal(value) {
  if (!value) return ''

  const [datePart, timePart = '00:00'] = String(value).split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  return toUtcIsoFromKstLocal(year, month, day, hour || 0, minute || 0)
}

export function toKstDatetimeLocalValue(value) {
  const date = value instanceof Date ? value : parseServerDate(value)
  if (!date) return ''

  const { year, month, day, hour, minute } = getKstParts(date)
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}`
}
