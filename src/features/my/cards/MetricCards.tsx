import { motion } from 'motion/react'
import { WaterGlass } from '../../../shared/charts/WaterGlass'
import { SpeedGauge } from '../../../shared/charts/SpeedGauge'
import { MiniBars } from '../../../shared/charts/MiniBars'
import { LineChart } from '../../../shared/charts/LineChart'
import { CompareChart } from '../../../shared/charts/CompareChart'
import { Treemap } from '../../../shared/charts/Treemap'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { formatKrw, formatKrwCompact, formatKrwSigned } from '../../../shared/format/krw'
import { MARKET_INDICES } from '../../../data/domain'
import {
  getBudget,
  getInvestStatus,
  getNetWorth,
  getPortfolio,
  getSavingMonthBars,
  getSavingProgress,
} from '../../../data/selectors'
import { METRIC_TEXT, type InvestView, type SavingView } from '../myState'
import type { Period } from '../../../data/types'

/** 월별 추이 차트 공용 x축 라벨 (2~7월) */
const MONTH_LABELS = ['2월', '3월', '4월', '5월', '6월', '7월']

/** 트리맵 셀용 짧은 종목명 */
const SHORT_NAME: Record<string, string> = {
  '005930': '삼성전자',
  '035720': '카카오',
  '035420': 'NAVER',
  '373220': 'LG엔솔',
  SPACEX: '스페이스X',
}

const BUDGET_TITLE: Record<Period, string> = {
  daily: '오늘의 예산',
  weekly: '이번 주 예산',
  monthly: '7월 예산',
}

export function BudgetCard({ period }: { period: Period }) {
  const b = getBudget(period)
  return (
    <CardShell title={BUDGET_TITLE[period]} metricClass={METRIC_TEXT.budget}>
      <WaterGlass pct={b.pct} width={148} height={168} />
      <p className="mt-1 text-[42px] font-extrabold leading-none">
        <AnimatedNumber value={b.pct * 100} format={(v) => `${Math.round(v)}%`} />
      </p>
      {/* 잔량 바 — 물잔·큰 숫자와 같은 기준(남은 만큼 파랗게) */}
      <div className="mt-2.5 w-full min-w-[220px] max-w-[252px]">
        <div className="h-2.5 overflow-hidden rounded-full bg-budget/15">
          <motion.div
            className="h-full rounded-full bg-budget"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(b.pct * 100)}%` }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.3, 0, 0.2, 1] }}
          />
        </div>
        <div className="mt-1 flex justify-between text-caption font-semibold">
          <span className="text-budget">남음 {formatKrw(b.remaining)}</span>
          <span className="text-ink-soft">씀 {formatKrw(b.spent)}</span>
        </div>
      </div>
    </CardShell>
  )
}

export function SavingCard({ view }: { view: SavingView }) {
  const s = getSavingProgress('monthly')

  if (view === 'goal') {
    return (
      <CardShell title="저축 목표" metricClass={METRIC_TEXT.saving}>
        <SpeedGauge pct={s.pct} width={252} height={176} />
        <p className="mt-1 text-[42px] font-extrabold leading-none">
          <AnimatedNumber value={s.pct * 100} format={(v) => `${Math.round(v)}%`} />
        </p>
        <p className="mt-2 text-[17px] font-medium text-ink-soft">
          {s.title} · <b className="text-ink">{formatKrwCompact(s.current)}</b> / {formatKrwCompact(s.target)}
        </p>
      </CardShell>
    )
  }

  if (view === 'monthly') {
    return (
      <CardShell title="월간 저축" metricClass={METRIC_TEXT.saving}>
        <div className="pt-3">
          <MiniBars bars={getSavingMonthBars()} width={252} height={128} />
        </div>
        <p className="mt-2 text-[42px] font-extrabold leading-none">
          <AnimatedNumber value={s.delta} format={(v) => formatKrwSigned(Math.round(v))} />
        </p>
        <p className="mt-2 text-[17px] font-medium text-ink-soft">이번 달 수입에서 저축</p>
      </CardShell>
    )
  }

  const nw = getNetWorth()
  return (
    <CardShell title="나의 자산" metricClass={METRIC_TEXT.saving}>
      <div className="pt-2">
        <LineChart
          points={nw.points}
          width={252}
          height={138}
          drawKey="saving-asset"
          markers
          xLabels={MONTH_LABELS}
          yTicks
        />
      </div>
      <p className="mt-2 text-[42px] font-extrabold leading-none">
        <AnimatedNumber value={nw.total} format={(v) => formatKrwCompact(Math.round(v))} />
      </p>
      <p className="mt-2 text-[17px] font-medium text-ink-soft">
        총자산 · 이번 달 <b className="text-ink">+{formatKrwCompact(nw.monthGain)}</b>
      </p>
    </CardShell>
  )
}

export function InvestCard({ view }: { view: InvestView }) {
  if (view === 'status') {
    const inv = getInvestStatus()
    return (
      <CardShell title="투자 현황" metricClass={METRIC_TEXT.invest}>
        <div className="pt-2">
          <CompareChart
            value={inv.value}
            principal={inv.principal}
            width={252}
            height={144}
            xLabels={MONTH_LABELS}
          />
        </div>
        <p className={`mt-2 text-[42px] font-extrabold leading-none ${inv.returnPct >= 0 ? 'text-rise' : 'text-fall'}`}>
          <AnimatedNumber value={inv.returnPct} format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
        </p>
        <p className="mt-2 text-[17px] font-medium text-ink-soft">
          원금 <b className="text-ink">{formatKrwCompact(inv.principalTotal)}</b> → 평가{' '}
          <b className="text-ink">{formatKrwCompact(inv.total)}</b>
        </p>
      </CardShell>
    )
  }

  if (view === 'portfolio') {
    const pf = getPortfolio()
    return (
      <CardShell title="포트폴리오" metricClass={METRIC_TEXT.invest}>
        <div className="pt-2">
          <Treemap
            items={pf.slices.map((s) => ({
              key: s.ticker,
              label: SHORT_NAME[s.ticker] ?? s.ticker,
              value: s.value,
              weight: s.weight,
            }))}
            width={260}
            height={164}
          />
        </div>
        <p className="mt-2 text-[42px] font-extrabold leading-none">
          <AnimatedNumber value={pf.total} format={(v) => formatKrwCompact(Math.round(v))} />
        </p>
        <p className="mt-2 text-[17px] font-medium text-ink-soft">{pf.slices.length}종목 분산 투자</p>
      </CardShell>
    )
  }

  return (
    <CardShell title="뉴스" metricClass={METRIC_TEXT.invest}>
      {/* 증시 전광판처럼 3열 배치 — 열 사이 은은한 구분선 */}
      <div className="grid w-full grid-cols-3 divide-x divide-line py-2 text-center">
        {MARKET_INDICES.map((m) => {
          const rise = m.changePct >= 0
          return (
            <div key={m.id} className="flex flex-col items-center gap-2 px-1 py-1">
              <span className="text-section font-bold text-ink">{m.name}</span>
              <b className="text-title font-extrabold leading-none tracking-tight text-ink tabular-nums">
                {m.value}
              </b>
              <span className={`text-caption font-bold leading-tight ${rise ? 'text-rise' : 'text-fall'}`}>
                {rise ? '▲' : '▼'}{m.changeAbs}
                <br />({rise ? '+' : '-'}{Math.abs(m.changePct).toFixed(2)}%)
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[17px] font-medium text-ink-soft">2026. 7. 22. 장 마감 기준</p>
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
    <div className={`clay-card flex h-full flex-col items-center overflow-hidden rounded-card ${metricClass}`}>
      {/* 제목 밴드 — 지표 테마색 틴트 (bg-current가 metricClass 색을 따른다) */}
      <div className="w-full px-5 pb-1 pt-4 text-center">
        <p className="text-title font-extrabold text-ink">{title}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-5 pt-2">{children}</div>
    </div>
  )
}
