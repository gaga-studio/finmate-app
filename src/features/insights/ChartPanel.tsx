import { AnimatePresence, motion } from 'motion/react'
import { Users } from 'lucide-react'
import { LineChart } from '../../shared/charts/LineChart'
import { CompareChart } from '../../shared/charts/CompareChart'
import { formatKrwCompact } from '../../shared/format/krw'
import {
  COMPARE_TARGETS,
  getHabitProjection,
  getMacbookSim,
  MACBOOK,
  makeSavingProjection,
  PROJECTION_MONTHS,
  type InsightChartState,
} from '../../data/insights'
import { snappy } from '../../shared/motion/springs'

const CHART_W = 330

interface Props {
  state: InsightChartState
  /** 우상단 '비교' 버튼 → 메이트/그룹 선택 시트 */
  onCompareOpen: () => void
}

export function ChartPanel({ state, onCompareOpen }: Props) {
  const { title, caption, metricClass, chart } = renderState(state)
  const comparing = state.kind === 'compare'

  return (
    <div className="mx-5 mt-2 rounded-card bg-elevated px-4 pb-2.5 pt-3 shadow-float">
      <div className="flex items-center justify-between">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={title}
            className="text-section font-bold text-ink"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={snappy}
          >
            {title}
          </motion.p>
        </AnimatePresence>
        <button
          type="button"
          onClick={onCompareOpen}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold ${
            comparing ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
          }`}
        >
          <Users size={12} />
          비교
        </button>
      </div>

      <div className={`relative mt-1 flex h-[172px] flex-col items-center justify-center ${metricClass}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={chartKey(state)}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={snappy}
          >
            {chart}
            {caption && (
              <p className="mt-1 text-caption font-bold text-ink-soft">{caption}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** 상태 전환 애니메이션 키 — 슬라이더 이동은 같은 키(내부 재드로잉만), 비교는 대상별 재생 */
function chartKey(state: InsightChartState): string {
  return state.kind === 'compare' ? `compare-${state.targetId}` : state.kind
}

function renderState(state: InsightChartState) {
  if (state.kind === 'sim-macbook') {
    const sim = getMacbookSim()
    return {
      title: `${MACBOOK.name} ${formatKrwCompact(MACBOOK.price)}이면`,
      caption: `12월 ${formatKrwCompact(sim.endBase)} → ${formatKrwCompact(sim.endBought)}`,
      metricClass: 'text-budget',
      chart: (
        <CompareChart
          value={sim.base}
          principal={sim.bought}
          labels={['그대로', '맥북 사면']}
          width={CHART_W}
          height={132}
          xLabels={PROJECTION_MONTHS}
        />
      ),
    }
  }

  if (state.kind === 'sim-saving') {
    const p = makeSavingProjection(state.monthly)
    return {
      title: `월 ${formatKrwCompact(state.monthly)}씩 모으면`,
      caption: `${p.months}개월 뒤, ${p.arrivalLabel} 파리 출발 ✈️`,
      metricClass: 'text-saving',
      chart: (
        <LineChart
          points={p.curve}
          width={CHART_W}
          height={128}
          drawKey={`proj-${state.monthly}`}
          xLabels={['지금', `${p.months}개월`]}
          yTicks
        />
      ),
    }
  }

  const my = getHabitProjection()

  if (state.kind === 'compare') {
    const target = COMPARE_TARGETS.find((t) => t.id === state.targetId) ?? COMPARE_TARGETS[0]
    return {
      title: `나 vs ${target.label}`,
      caption: target.summary,
      metricClass: 'text-budget',
      chart: (
        <CompareChart
          value={my.curve}
          principal={target.curve}
          labels={['나', target.label]}
          width={CHART_W}
          height={132}
          xLabels={PROJECTION_MONTHS}
        />
      ),
    }
  }

  // 기본: 평소 습관 기반 미래 6개월 투영
  return {
    title: `12월엔 ${formatKrwCompact(my.curve[my.curve.length - 1])}`,
    caption: `지금 습관대로면 6개월 뒤 +${formatKrwCompact(my.totalGain)}`,
    metricClass: 'text-saving',
    chart: (
      <LineChart
        points={my.curve}
        width={CHART_W}
        height={128}
        drawKey="habit-projection"
        markers
        xLabels={PROJECTION_MONTHS}
        yTicks
      />
    ),
  }
}
