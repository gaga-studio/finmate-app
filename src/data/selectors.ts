import {
  ASSET_SERIES,
  BUDGET_LIMIT,
  HOLDINGS,
  INVEST_PRINCIPAL_HISTORY,
  INVEST_VALUE_HISTORY,
  MY_ASSETS,
  NET_WORTH_HISTORY,
  SAVING_GOAL,
  SAVING_MONTHLY_HISTORY,
  type AssetItem,
} from './domain'
import type { Holding } from './types'
import { getPeriodRange, keysInRange } from './dates'
import { TRANSACTIONS } from './transactions'
import { WRAPPED } from './wrapped'
import type { Metric, Period, Transaction, WrappedContent } from './types'

/** 모든 화면이 의존하는 기간별 파생 집계 — 전부 동기 순수함수. */

function inRange(period: Period): Transaction[] {
  const { startKey, endKey } = getPeriodRange(period)
  return TRANSACTIONS.filter((t) => t.date >= startKey && t.date <= endKey)
}

export interface BudgetSummary {
  limit: number
  spent: number
  remaining: number
  /** 남은 비율 0~1 — 물잔 수위 */
  pct: number
}

/** 자유예산: 소비 카테고리 지출만 집계 (저축·투자는 소비가 아니다) */
export function getBudget(period: Period): BudgetSummary {
  const limit = BUDGET_LIMIT[period]
  const spent = inRange(period)
    .filter((t) => t.amount < 0 && t.category !== 'saving' && t.category !== 'invest')
    .reduce((sum, t) => sum + -t.amount, 0)
  const remaining = Math.max(0, limit - spent)
  return { limit, spent, remaining, pct: remaining / limit }
}

export interface SavingSummary {
  title: string
  target: number
  current: number
  /** 전체 목표 진행률 0~1 — 링 게이지 */
  pct: number
  /** 이 기간에 새로 저축한 금액 */
  delta: number
}

export function getSavingProgress(period: Period): SavingSummary {
  const delta = inRange(period)
    .filter((t) => t.category === 'saving')
    .reduce((sum, t) => sum + -t.amount, 0)
  return {
    title: SAVING_GOAL.title,
    target: SAVING_GOAL.target,
    current: SAVING_GOAL.current,
    pct: SAVING_GOAL.current / SAVING_GOAL.target,
    delta,
  }
}

export interface SavingBar {
  label: string
  amount: number
  isCurrent: boolean
}

/** 이번 달 저축 실측 (거래 파생) */
function currentMonthSaving(): number {
  return inRange('monthly')
    .filter((t) => t.category === 'saving')
    .reduce((sum, t) => sum + -t.amount, 0)
}

/** 월간 뷰: 월별 전체 저축 막대(수입에서 한 저축 전부) — 이번 달은 실측 */
export function getSavingMonthBars(): SavingBar[] {
  const bars: SavingBar[] = SAVING_MONTHLY_HISTORY.map((h) => ({
    label: `${h.month}월`,
    amount: h.amount,
    isCurrent: false,
  }))
  bars.push({ label: '7월', amount: currentMonthSaving(), isCurrent: true })
  return bars
}

export interface IncomeSource {
  merchant: string
  total: number
  count: number
}

/** 월간 뷰 오른쪽 카드: 이번 달 소득 출처 순위 */
export function getIncomeSources(): IncomeSource[] {
  const sums = new Map<string, IncomeSource>()
  for (const t of inRange('monthly')) {
    if (t.category !== 'income') continue
    const cur = sums.get(t.merchant) ?? { merchant: t.merchant, total: 0, count: 0 }
    cur.total += t.amount
    cur.count += 1
    sums.set(t.merchant, cur)
  }
  return [...sums.values()].sort((a, b) => b.total - a.total)
}

/** 이번 달 총수입 */
export function getMonthlyIncome(): number {
  return getIncomeSources().reduce((sum, s) => sum + s.total, 0)
}

/** 자산 뷰: 총자산 — 구성 순위 + 월별 추이 곡선 */
export function getNetWorth(): { assets: AssetItem[]; total: number; points: number[]; monthGain: number } {
  const assets = [...MY_ASSETS].sort((a, b) => b.value - a.value)
  const total = assets.reduce((sum, a) => sum + a.value, 0)
  const points = NET_WORTH_HISTORY
  return { assets, total, points, monthGain: total - points[points.length - 2] }
}

export interface InvestSummary {
  /** 라인차트 포인트 (오름차순 시간) */
  points: number[]
  /** 기간 수익률 % */
  returnPct: number
  totalValue: number
}

const SERIES_WINDOW: Record<Period, number> = { daily: 8, weekly: 7, monthly: 30 }

export function getInvestSeries(period: Period): InvestSummary {
  const points = ASSET_SERIES.slice(-SERIES_WINDOW[period])
  const first = points[0]
  const last = points[points.length - 1]
  return {
    points,
    returnPct: Math.round(((last - first) / first) * 1000) / 10,
    totalValue: last,
  }
}

/** 현황 뷰: 원금 vs 평가액 — 벌어지는 틈이 수익 */
export function getInvestStatus(): {
  value: number[]
  principal: number[]
  total: number
  principalTotal: number
  profit: number
  returnPct: number
} {
  const value = INVEST_VALUE_HISTORY
  const principal = INVEST_PRINCIPAL_HISTORY
  const total = value[value.length - 1]
  const principalTotal = principal[principal.length - 1]
  const profit = total - principalTotal
  return {
    value,
    principal,
    total,
    principalTotal,
    profit,
    returnPct: Math.round((profit / principalTotal) * 1000) / 10,
  }
}

export interface PortfolioSlice extends Holding {
  /** 비중 0~1 */
  weight: number
}

/** 포폴 뷰: 보유 종목 비중 내림차순 */
export function getPortfolio(): { slices: PortfolioSlice[]; total: number } {
  const total = HOLDINGS.reduce((sum, h) => sum + h.value, 0)
  const slices = [...HOLDINGS]
    .sort((a, b) => b.value - a.value)
    .map((h) => ({ ...h, weight: h.value / total }))
  return { slices, total }
}

/** 소비 탑 N: 카테고리 합산이 아니라 개별 구매 상위 — 커피/운동화/맥북 같은 스토리가 행으로 보인다 */
export function getTopPurchases(period: Period, n = 5): Transaction[] {
  return inRange(period)
    .filter((t) => t.amount < 0 && t.category !== 'saving' && t.category !== 'invest')
    .sort((a, b) => a.amount - b.amount)
    .slice(0, n)
}

export function getDayLedger(dateKey: string): Transaction[] {
  return TRANSACTIONS.filter((t) => t.date === dateKey)
}

/** 다이어리 캘린더용: 날짜별 순지출/수입 여부 */
export function getMonthActivity(): Map<string, { spent: number; earned: number }> {
  const { startKey, endKey } = getPeriodRange('monthly')
  const map = new Map<string, { spent: number; earned: number }>()
  for (const key of keysInRange({ startKey, endKey, label: '' })) {
    map.set(key, { spent: 0, earned: 0 })
  }
  for (const t of TRANSACTIONS) {
    const cell = map.get(t.date)
    if (!cell) continue
    if (t.amount < 0) cell.spent += -t.amount
    else cell.earned += t.amount
  }
  return map
}

export interface WrappedSummary extends WrappedContent {
  rangeLabel: string
  budget: BudgetSummary
  saving: SavingSummary
  invest: InvestSummary
  topPurchases: Transaction[]
}

export function getWrapped(metric: Metric, period: Period): WrappedSummary {
  return {
    ...WRAPPED[metric][period],
    rangeLabel: getPeriodRange(period).label,
    budget: getBudget(period),
    saving: getSavingProgress(period),
    invest: getInvestSeries(period),
    topPurchases: getTopPurchases(period),
  }
}
