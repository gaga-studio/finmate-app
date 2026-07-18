/** 1250000 → "1,250,000원" */
export function formatKrw(amount: number): string {
  return `${Math.abs(amount).toLocaleString('ko-KR')}원`
}

/** 부호 포함: -5600 → "-5,600원", 2150000 → "+2,150,000원" */
export function formatKrwSigned(amount: number): string {
  const sign = amount < 0 ? '-' : '+'
  return `${sign}${Math.abs(amount).toLocaleString('ko-KR')}원`
}

/** 5000000 → "500만원", 12500000 → "1,250만원", 8000 → "8,000원" */
export function formatKrwCompact(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 10000) {
    const man = Math.round(abs / 10000)
    return `${man.toLocaleString('ko-KR')}만원`
  }
  return formatKrw(amount)
}
