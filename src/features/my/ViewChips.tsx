import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import {
  INVEST_VIEWS,
  INVEST_VIEW_LABEL,
  PERIODS,
  PERIOD_LABEL,
  SAVING_VIEWS,
  SAVING_VIEW_LABEL,
  type InvestView,
  type Metric,
  type Period,
  type SavingView,
} from './myState'

/** 지표별 기간/뷰 칩 스위처 — 마이/메이트가 공유한다 */
export function ViewChips({
  id,
  metric,
  period,
  savingView,
  investView,
  onPeriod,
  onSavingView,
  onInvestView,
}: {
  id: string
  metric: Metric
  period: Period
  savingView: SavingView
  investView: InvestView
  onPeriod: (p: Period) => void
  onSavingView: (v: SavingView) => void
  onInvestView: (v: InvestView) => void
}) {
  if (metric === 'saving') {
    return (
      <SegmentedControl
        id={id}
        items={SAVING_VIEWS.map((v) => ({ value: v, label: SAVING_VIEW_LABEL[v] }))}
        value={savingView}
        onChange={onSavingView}
      />
    )
  }
  if (metric === 'invest') {
    return (
      <SegmentedControl
        id={id}
        items={INVEST_VIEWS.map((v) => ({ value: v, label: INVEST_VIEW_LABEL[v] }))}
        value={investView}
        onChange={onInvestView}
      />
    )
  }
  return (
    <SegmentedControl
      id={id}
      items={PERIODS.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))}
      value={period}
      onChange={onPeriod}
    />
  )
}
