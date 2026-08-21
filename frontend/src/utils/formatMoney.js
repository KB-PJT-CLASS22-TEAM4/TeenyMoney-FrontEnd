export function parseMoney(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  if (!digits) return 0
  const amount = Number(digits)
  return Number.isFinite(amount) ? amount : 0
}

export function formatMoney(value) {
  const amount = parseMoney(value)
  if (amount <= 0) return ''
  return amount.toLocaleString('ko-KR')
}
