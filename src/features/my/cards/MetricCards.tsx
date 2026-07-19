import { WaterGlass } from '../../../shared/charts/WaterGlass'
import { CoinJar } from '../../../shared/charts/CoinJar'
import { WeekBars } from '../../../shared/charts/WeekBars'
import { LineChart } from '../../../shared/charts/LineChart'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { formatKrw, formatKrwCompact, formatKrwSigned } from '../../../shared/format/krw'
import {
  getBudget,
  getInvestSeries,
  getSavingBalanceSeries,
  getSavingProgress,
  getSavingWeekBars,
} from '../../../data/selectors'
import { METRIC_TEXT, type SavingView } from '../myState'
import type { Period } from '../../../data/types'

const BUDGET_TITLE: Record<Period, string> = {
  daily: '오늘의 예산',
  weekly: '이번 주 예산',
  monthly: '7월 예산',
}

export function BudgetCard({ period }: { period: Period }) {
  const b = getBudget(period)
  return (
    <CardShell title={BUDGET_TITLE[period]} metricClass={METRIC_TEXT.budget}>
      <WaterGlass pct={b.pct} width={132} height={148} />
      <p className="mt-1 text-display font-extrabold leading-none">
        <AnimatedNumber value={b.pct * 100} format={(v) => `${Math.round(v)}%`} />
      </p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">
        {formatKrw(b.spent)} 씀 · <b className="text-ink">{formatKrw(b.remaining)}</b> 남음
      </p>
    </CardShell>
  )
}

export function SavingCard({ view }: { view: SavingView }) {
  const s = getSavingProgress('monthly')

  if (view === 'goal') {
    return (
      <CardShell title="저축 목표" metricClass={METRIC_TEXT.saving}>
        <CoinJar pct={s.pct} width={172} height={150} />
        <p className="mt-1 text-display font-extrabold leading-none">
          <AnimatedNumber value={s.pct * 100} format={(v) => `${Math.round(v)}%`} />
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">
          {s.title} · <b className="text-ink">{formatKrwCompact(s.current)}</b> / {formatKrwCompact(s.target)}
        </p>
      </CardShell>
    )
  }

  if (view === 'monthly') {
    return (
      <CardShell title="월간 저축" metricClass={METRIC_TEXT.saving}>
        <div className="pt-3">
          <WeekBars bars={getSavingWeekBars()} width={216} height={118} />
        </div>
        <p className="mt-2 text-display font-extrabold leading-none">
          <AnimatedNumber value={s.delta} format={(v) => formatKrwSigned(Math.round(v))} />
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">이번 달 저축</p>
      </CardShell>
    )
  }

  const bal = getSavingBalanceSeries()
  return (
    <CardShell title="저축 자산" metricClass={METRIC_TEXT.saving}>
      <div className="pt-3">
        <LineChart points={bal.points} width={216} height={104} drawKey="saving-asset" />
      </div>
      <p className="mt-2 text-display font-extrabold leading-none">
        <AnimatedNumber value={bal.current} format={(v) => formatKrwCompact(Math.round(v))} />
      </p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">{s.title} 통장 잔액</p>
    </CardShell>
  )
}

export function InvestCard({ period }: { period: Period }) {
  const inv = getInvestSeries(period)
  const positive = inv.returnPct >= 0
  return (
    <CardShell title="투자 현황" metricClass={METRIC_TEXT.invest}>
      <div className="pt-3">
        <LineChart points={inv.points} width={216} height={104} drawKey={period} />
      </div>
      <p className={`mt-2 text-display font-extrabold leading-none ${positive ? '' : 'text-danger'}`}>
        <AnimatedNumber value={inv.returnPct} format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
      </p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">
        총 자산 <b className="text-ink">{formatKrwCompact(inv.totalValue)}</b>
      </p>
    </CardShell>
  )
}

function CardShell({
  title,
  metricClass,
  children,
}: {
  title: string
  metricClass: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex h-full flex-col items-center rounded-card bg-elevated px-5 pb-5 pt-4 shadow-float ${metricClass}`}>
      <p className="text-section font-bold text-ink">{title}</p>
      <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
    </div>
  )
}
