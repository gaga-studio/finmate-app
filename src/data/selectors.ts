import {
  ASSET_SERIES,
  BUDGET_LIMIT,
  HOLDINGS,
  INVEST_PRINCIPAL_HISTORY,
  INVEST_VALUE_HISTORY,
  MONTHLY_LEDGER,
  MY_ASSETS,
  NET_WORTH_HISTORY,
  SAVING_GOAL,
  SAVING_MONTHLY_HISTORY,
  type AssetItem,
} from './domain'
import type { Holding, Mission } from './types'
import { fromKey, getPeriodRange, keysInRange, TODAY_KEY } from './dates'
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

export interface DiaryDay {
  day: number
  dateKey: string
  income: number
  spend: number
}

/** 다이어리 갤러리: 이번 달 1일~오늘을 최신순으로, 일별 수입/소비 지출 (저축·투자 이체 제외) */
export function getDiaryDays(): { days: DiaryDay[]; totalIncome: number; totalSpend: number } {
  const { startKey, endKey } = getPeriodRange('monthly')
  const byDay = new Map<string, { income: number; spend: number }>()
  for (const key of keysInRange({ startKey, endKey, label: '' })) {
    byDay.set(key, { income: 0, spend: 0 })
  }
  for (const t of TRANSACTIONS) {
    const cell = byDay.get(t.date)
    if (!cell) continue
    if (t.amount > 0) cell.income += t.amount
    else if (t.category !== 'saving' && t.category !== 'invest') cell.spend += -t.amount
  }
  const days = [...byDay.entries()]
    .map(([dateKey, a]) => ({ dateKey, day: Number(dateKey.slice(-2)), ...a }))
    .sort((a, b) => b.day - a.day)
  return {
    days,
    totalIncome: days.reduce((s, d) => s + d.income, 0),
    totalSpend: days.reduce((s, d) => s + d.spend, 0),
  }
}

/** 그날 가장 컸던 활동(소비/저축/투자 금액 비교) — 다이어리 대표 이미지·첫 카드 결정 */
export function getDayDominant(dateKey: string): Metric {
  const txs = TRANSACTIONS.filter((t) => t.date === dateKey && t.amount < 0)
  const sums: Record<Metric, number> = { budget: 0, saving: 0, invest: 0 }
  for (const t of txs) {
    if (t.category === 'saving') sums.saving += -t.amount
    else if (t.category === 'invest') sums.invest += -t.amount
    else sums.budget += -t.amount
  }
  return (Object.entries(sums) as [Metric, number][]).sort((a, b) => b[1] - a[1])[0][0]
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

/* ---------- 미션 탭: "예산을 지켜라" 챌린지 판정 ---------- */

export type StreakStatus = 'pass' | 'fail' | 'current' | 'future'

export interface StreakDot {
  label: string
  status: StreakStatus
}

/** 소비 지출만 합산 (저축·투자 제외) */
function spendOf(txs: Transaction[]): number {
  return txs
    .filter((t) => t.amount < 0 && t.category !== 'saving' && t.category !== 'invest')
    .reduce((sum, t) => sum + -t.amount, 0)
}

function weekOfMonth(d: Date): number {
  const firstDow = new Date(d.getFullYear(), d.getMonth(), 1).getDay()
  return Math.ceil((d.getDate() + firstDow) / 7)
}

const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토']

/**
 * 판정 규칙 — 일: 하루 지출 ≤ 일 예산 / 주: 주 지출 ≤ 월 예산의 ¼ /
 * 월: 지출 ≤ 수입 (2~6월 원장 수기, 7월 실측)
 */
export function getKeepStreak(period: Period): StreakDot[] {
  const today = fromKey(TODAY_KEY)

  if (period === 'daily') {
    const { startKey } = getPeriodRange('weekly')
    const start = fromKey(startKey)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const status: StreakStatus =
        key === TODAY_KEY
          ? 'current'
          : key > TODAY_KEY
            ? 'future'
            : spendOf(TRANSACTIONS.filter((t) => t.date === key)) <= BUDGET_LIMIT.daily
              ? 'pass'
              : 'fail'
      return { label: WEEKDAY_LABEL[d.getDay()], status }
    })
  }

  if (period === 'weekly') {
    const weekBudget = BUDGET_LIMIT.monthly / 4
    const currentWeek = weekOfMonth(today)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const totalWeeks = weekOfMonth(lastDay)
    const monthTx = inRange('monthly')
    return Array.from({ length: totalWeeks }, (_, i) => {
      const week = i + 1
      const status: StreakStatus =
        week === currentWeek
          ? 'current'
          : week > currentWeek
            ? 'future'
            : spendOf(monthTx.filter((t) => weekOfMonth(fromKey(t.date)) === week)) <= weekBudget
              ? 'pass'
              : 'fail'
      return { label: `${week}주`, status }
    })
  }

  const dots: StreakDot[] = MONTHLY_LEDGER.map((m) => ({
    label: `${m.month}월`,
    status: m.spend <= m.income ? 'pass' : 'fail',
  }))
  dots.push({ label: `${today.getMonth() + 1}월`, status: 'current' })
  return dots
}

/** current 직전까지의 연속 pass 수 — 🔥 뱃지 */
export function getStreakFlame(dots: StreakDot[]): number {
  const currentIdx = dots.findIndex((d) => d.status === 'current')
  let flame = 0
  for (let i = (currentIdx === -1 ? dots.length : currentIdx) - 1; i >= 0; i--) {
    if (dots[i].status !== 'pass') break
    flame++
  }
  return flame
}

export interface MissionProgress {
  current: number
  target: number
  /** 0~1 클램프 */
  pct: number
  unit: 'krw' | 'count'
  /** daily-budget처럼 낮을수록 좋은 미션 */
  inverted?: boolean
}

/** 진행형 미션의 파생 진행률 — 촬영 재현성: 전부 거래에서 계산 */
export function getMissionProgress(kind: Mission['kind']): MissionProgress {
  if (kind === 'saving') {
    const current = getSavingProgress('weekly').delta
    return { current, target: 50_000, pct: Math.min(1, current / 50_000), unit: 'krw' }
  }
  if (kind === 'daily-budget') {
    const target = Math.round(BUDGET_LIMIT.daily * 0.9)
    const current = getBudget('daily').spent
    return { current, target, pct: Math.min(1, current / target), unit: 'krw', inverted: true }
  }
  // quiz — 추천에서 새로 담는 미션이라 0부터 시작
  return { current: 0, target: 3, pct: 0, unit: 'count' }
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

/* ---------- 인사이트 탭: 오늘의 총평 ---------- */

export interface DailySummary {
  /** 오늘 소비 지출 합 */
  spent: number
  /** 예산 남은 비율 % (반올림) */
  budgetLeftPct: number
  /** 오늘 소비 1위 거래 */
  top: Transaction
  /** 오늘 저축액 */
  savingDelta: number
  /** 파리 목표 진행률 % */
  savingPct: number
  /** 총 투자 수익률 % */
  investReturnPct: number
}

/** 오늘의 총평 카드 근거 수치 — 마이 탭과 같은 셀렉터에서 파생해 정합을 유지한다 */
export function getDailySummary(): DailySummary {
  const b = getBudget('daily')
  const s = getSavingProgress('daily')
  return {
    spent: b.spent,
    budgetLeftPct: Math.round(b.pct * 100),
    top: getTopPurchases('daily', 1)[0],
    savingDelta: s.delta,
    savingPct: Math.round(s.pct * 100),
    investReturnPct: getInvestStatus().returnPct,
  }
}
