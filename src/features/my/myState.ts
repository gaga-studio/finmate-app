import type { Metric, Period, SavingView } from '../../data/types'

export type { Metric, Period, SavingView }

export const METRICS: Metric[] = ['budget', 'saving', 'invest']
export const PERIODS: Period[] = ['daily', 'weekly', 'monthly']

export const PERIOD_LABEL: Record<Period, string> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
}

export const PERIOD_PREFIX: Record<Period, string> = {
  daily: '오늘',
  weekly: '이번 주',
  monthly: '이번 달',
}

export function nextPeriod(p: Period): Period {
  return PERIODS[(PERIODS.indexOf(p) + 1) % PERIODS.length]
}

export const SAVING_VIEWS: SavingView[] = ['goal', 'monthly', 'asset']

export const SAVING_VIEW_LABEL: Record<SavingView, string> = {
  goal: '목표',
  monthly: '월간',
  asset: '자산',
}

export function nextSavingView(v: SavingView): SavingView {
  return SAVING_VIEWS[(SAVING_VIEWS.indexOf(v) + 1) % SAVING_VIEWS.length]
}

/** 지표별 고유 색 클래스 — 카드가 활성이 아니어도 자기 색을 유지한다 */
export const METRIC_TEXT: Record<Metric, string> = {
  budget: 'text-budget',
  saving: 'text-saving',
  invest: 'text-invest',
}
