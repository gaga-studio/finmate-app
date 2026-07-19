import {
  ASSET_SERIES,
  BUDGET_LIMIT,
  SAVING_GOAL,
  SAVING_MONTHLY_HISTORY,
  SAVING_START_BALANCE,
} from './domain'
import { getPeriodRange, keysInRange } from './dates'
import { TRANSACTIONS } from './transactions'
import { WRAPPED } from './wrapped'
import type { Category, Metric, Period, Transaction, WrappedContent } from './types'

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

/** 월간 뷰: 목표 시작(3월)부터의 월별 저축 막대 — 이번 달은 실측 */
export function getSavingMonthBars(): SavingBar[] {
  const bars: SavingBar[] = SAVING_MONTHLY_HISTORY.map((h) => ({
    label: `${h.month}월`,
    amount: h.amount,
    isCurrent: false,
  }))
  bars.push({ label: '7월', amount: currentMonthSaving(), isCurrent: true })
  return bars
}

/** 자산 뷰: 3월 시작 잔액부터 현재까지의 누적 여정 — 월 경계 포인트만 두어 달마다 꺾인다 */
export function getSavingJourney(): { points: number[]; current: number; gained: number } {
  const points: number[] = [SAVING_START_BALANCE]
  let balance = SAVING_START_BALANCE
  for (const h of [...SAVING_MONTHLY_HISTORY, { month: 7, amount: currentMonthSaving() }]) {
    balance += h.amount
    points.push(balance)
  }
  return { points, current: balance, gained: balance - SAVING_START_BALANCE }
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

export interface CategorySum {
  category: Category
  total: number
  count: number
}

export function getTopSpending(period: Period, n = 5): CategorySum[] {
  const sums = new Map<Category, CategorySum>()
  for (const t of inRange(period)) {
    if (t.amount >= 0 || t.category === 'saving' || t.category === 'invest') continue
    const cur = sums.get(t.category) ?? { category: t.category, total: 0, count: 0 }
    cur.total += -t.amount
    cur.count += 1
    sums.set(t.category, cur)
  }
  return [...sums.values()].sort((a, b) => b.total - a.total).slice(0, n)
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
  topSpending: CategorySum[]
}

export function getWrapped(metric: Metric, period: Period): WrappedSummary {
  return {
    ...WRAPPED[metric][period],
    rangeLabel: getPeriodRange(period).label,
    budget: getBudget(period),
    saving: getSavingProgress(period),
    invest: getInvestSeries(period),
    topSpending: getTopSpending(period),
  }
}
