import { AnimatePresence, motion } from 'motion/react'
import { Users } from 'lucide-react'
import { LineChart } from '../../shared/charts/LineChart'
import { CompareChart } from '../../shared/charts/CompareChart'
import { formatKrwCompact } from '../../shared/format/krw'
import { getNetWorth } from '../../data/selectors'
import { SIM_SCENARIO } from '../../data/domain'
import {
  MATE_COMPARE_TEMPLATE,
  MATE_NET_WORTH_HISTORY,
  makeSavingProjection,
  type InsightChartState,
} from '../../data/insights'
import { snappy } from '../../shared/motion/springs'

const MONTH_LABELS = ['2월', '3월', '4월', '5월', '6월', '7월']
const CHART_W = 330

interface Props {
  state: InsightChartState
  /** 우상단 '메이트 비교' 칩 → 입력창 템플릿 삽입 (와이어프레임 ③) */
  onTemplate: (text: string) => void
}

export function ChartPanel({ state, onTemplate }: Props) {
  const { title, caption, metricClass, chart } = renderState(state)

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
          onClick={() => onTemplate(MATE_COMPARE_TEMPLATE)}
          className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-caption font-bold text-accent"
        >
          <Users size={12} />
          메이트 비교
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

/** 상태 전환 애니메이션 키 — 슬라이더 이동은 같은 키(내부 재드로잉만) */
function chartKey(state: InsightChartState): string {
  return state.kind
}

function renderState(state: InsightChartState) {
  if (state.kind === 'sim-shoes') {
    return {
      title: '산다 vs 참는다 · 12만원 운동화',
      caption: '12주 자산 시뮬레이션',
      metricClass: 'text-budget',
      chart: (
        <CompareChart
          value={SIM_SCENARIO.baseCurve}
          principal={SIM_SCENARIO.altCurve}
          labels={['참는다', '산다']}
          width={CHART_W}
          height={132}
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

  if (state.kind === 'mate') {
    return {
      title: '나 vs 메이트 평균 · 총자산',
      caption: '메이트 평균보다 +86만원',
      metricClass: 'text-budget',
      chart: (
        <CompareChart
          value={getNetWorth().points}
          principal={MATE_NET_WORTH_HISTORY}
          labels={['나', '메이트 평균']}
          width={CHART_W}
          height={132}
          xLabels={MONTH_LABELS}
        />
      ),
    }
  }

  const nw = getNetWorth()
  return {
    title: `총자산 ${formatKrwCompact(nw.total)}`,
    caption: `6개월 동안 +${formatKrwCompact(nw.total - nw.points[0])}`,
    metricClass: 'text-saving',
    chart: (
      <LineChart
        points={nw.points}
        width={CHART_W}
        height={128}
        drawKey="insight-networth"
        markers
        xLabels={MONTH_LABELS}
        yTicks
      />
    ),
  }
}
