import { AnimatePresence, motion } from 'motion/react'
import { LineChart } from '../../shared/charts/LineChart'
import { CompareChart } from '../../shared/charts/CompareChart'
import { formatKrwCompact } from '../../shared/format/krw'
import {
  COMPARE_TARGETS,
  getHabitProjection,
  getMacbookSim,
  HABIT_BOOST,
  MACBOOK,
  makeSavingProjection,
  PROJECTION_MONTHS,
  type InsightChartState,
} from '../../data/insights'
import { snappy } from '../../shared/motion/springs'

const CHART_W = 330

/** 비교 계열 라인 색 — 나는 파란선, 메이트/그룹은 빨간선 */
const COMPARE_COLORS: [string, string] = ['var(--color-budget)', 'var(--color-rise)']

/** 받침 유무에 따른 이/가 조사 */
function iGa(word: string): string {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return '이(가)'
  return (code - 0xac00) % 28 === 0 ? '가' : '이'
}

interface Props {
  state: InsightChartState
}

export function ChartPanel({ state }: Props) {
  const { title, caption, metricClass, chart } = renderState(state)

  return (
    <div className="mx-5 mt-2 rounded-card bg-elevated px-4 pb-2.5 pt-3 shadow-float">
      <div className="flex items-center">
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
  if (state.kind === 'compare') return `compare-${state.targetId}`
  if (state.kind === 'sim-macbook') return `macbook-${state.targetId ?? 'solo'}${state.habit ? '-habit' : ''}`
  return state.kind
}

function renderState(state: InsightChartState) {
  if (state.kind === 'sim-macbook') {
    const sim = getMacbookSim()
    const target = state.targetId ? COMPARE_TARGETS.find((t) => t.id === state.targetId) : undefined

    // 비교 중이었다면 메이트 선을 유지 — 맥북을 사면 격차가 어떻게 변하는지가 포인트
    if (target) {
      // 습관 따라하기: 메이트 패턴 + 내 기존 흐름 시너지(HABIT_BOOST) — 10~11월 사이 역전
      const myCurve = state.habit
        ? target.curve.map((v) => sim.base[0] - MACBOOK.price + Math.round((v - target.curve[0]) * HABIT_BOOST))
        : sim.bought
      const end = myCurve[myCurve.length - 1]
      const diff = end - target.curve[target.curve.length - 1]
      // 역전이 일어나는 첫 달
      const crossIdx = state.habit ? myCurve.findIndex((v, i) => i > 0 && v >= target.curve[i]) : -1

      return {
        title: state.habit
          ? `습관 따라하면 12월 ${formatKrwCompact(end)}`
          : `맥북 사면 12월 ${formatKrwCompact(end)}`,
        caption: state.habit
          ? crossIdx > 0
            ? `${PROJECTION_MONTHS[crossIdx]}이면 ${target.label} 역전 — 12월 +${formatKrwCompact(diff)}!`
            : `맥북 반영 대비 +${formatKrwCompact(end - sim.endBought)} 만회!`
          : diff >= 0
            ? `그래도 ${target.label}보다 +${formatKrwCompact(diff)} 앞서요`
            : `이러면 ${target.label}${iGa(target.label)} +${formatKrwCompact(-diff)} 앞서요`,
        metricClass: 'text-ink',
        chart: (
          <CompareChart
            value={myCurve}
            principal={target.curve}
            labels={['나', target.label]}
            colors={COMPARE_COLORS}
            width={CHART_W}
            height={132}
            xLabels={PROJECTION_MONTHS}
          />
        ),
      }
    }

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
      metricClass: 'text-ink',
      chart: (
        <CompareChart
          value={my.curve}
          principal={target.curve}
          labels={['나', target.label]}
          colors={COMPARE_COLORS}
          width={CHART_W}
          height={132}
          xLabels={PROJECTION_MONTHS}
        />
      ),
    }
  }

  // 기본: 평소 습관 기반 미래 6개월 투영 — 현재 → 12월 예상을 한 줄로
  return {
    title: '총자산 시뮬레이션',
    caption: `지금 습관대로면 6개월 뒤 +${formatKrwCompact(my.totalGain)}`,
    metricClass: 'text-saving',
    chart: (
      <div className="flex flex-col items-center">
        <p className="text-title font-extrabold leading-none text-ink">
          {formatKrwCompact(my.curve[0])}
          <span className="mx-1.5 text-ink-faint">→</span>
          <span className="text-saving">{formatKrwCompact(my.curve[my.curve.length - 1])}</span>
        </p>
        <div className="mt-2">
          <LineChart
            points={my.curve}
            width={CHART_W}
            height={108}
            drawKey="habit-projection"
            markers
            xLabels={PROJECTION_MONTHS}
            yTicks
          />
        </div>
      </div>
    ),
  }
}
