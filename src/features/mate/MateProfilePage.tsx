import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, Lock, Sparkles, Users } from 'lucide-react'
import { getMateProfile, type MateProfile } from '../../data/mates'
import { getBudget, getInvestStatus, getSavingProgress } from '../../data/selectors'
import { ProfileCard } from '../../shared/profile/ProfileCard'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { WaterGlass } from '../../shared/charts/WaterGlass'
import { SpeedGauge } from '../../shared/charts/SpeedGauge'
import { MateAnalysisOverlay } from './MateAnalysisOverlay'
import { snappy } from '../../shared/motion/springs'
import type { Metric } from '../../data/types'
import { PageTitle } from '../../shared/ui/PageTitle'

const METRIC_LABEL: Record<Metric, string> = { budget: '소비', saving: '저축', invest: '투자' }
const METRIC_TEXT: Record<Metric, string> = { budget: 'text-budget', saving: 'text-saving', invest: 'text-invest' }
const CARD_TITLE: Record<Metric, string> = { budget: '오늘의 예산', saving: '저축 목표', invest: '투자 현황' }

/** 메이트 프로필 — my와 같은 구조지만 카테고리·구간 수준으로 필터링된 정보만 보여준다 */
export function MateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mate = id ? getMateProfile(id) : undefined
  const [metric, setMetric] = useState<Metric>('budget')
  const [following, setFollowing] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  if (!mate) return <Navigate to="/feed" replace />

  return (
    <div className="relative min-h-full pb-28">
      <header className="relative flex items-center justify-between px-5 pb-1 pt-14">
        <PageTitle>메이트</PageTitle>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setFollowing((v) => !v)}
          className={`flex h-9 items-center rounded-full px-4 text-body font-bold ${
            following ? 'bg-ink/5 text-ink-soft' : 'bg-accent text-white'
          }`}
        >
          {following ? '팔로잉 ✓' : '팔로우'}
        </button>
      </header>

      <ProfileCard profile={mate} className="px-5" />

      <AnimatePresence mode="popLayout" initial={false}>
        {comparing ? (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
            className="mt-4 px-5"
          >
            <CompareColumns mate={mate} />
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
          >
            {/* 지표 전환 칩 */}
            <div className="mt-4 flex justify-center">
              <SegmentedControl
                id="mate-metric"
                items={(['budget', 'saving', 'invest'] as const).map((m) => ({ value: m, label: METRIC_LABEL[m] }))}
                value={metric}
                onChange={setMetric}
              />
            </div>

            {/* 필터링된 지표 카드 — my 상단 카드와 동일 문법 */}
            <div className="mt-3 px-5" data-metric={metric}>
              <div className={`flex flex-col items-center overflow-hidden rounded-card bg-elevated shadow-float ${METRIC_TEXT[metric]}`}>
                <div className="w-full bg-current/25 px-5 py-2.5 text-center">
                  <p className="text-section font-bold text-ink">{CARD_TITLE[metric]}</p>
                </div>
                <div className="flex min-h-[210px] flex-col items-center justify-center px-5 pb-4 pt-2">
                  <MetricBody mate={mate} metric={metric} />
                </div>
                <p className="flex items-center gap-1 pb-3 text-caption font-medium text-ink-faint">
                  <Lock size={11} />
                  상세 내역은 비공개 · 카테고리와 구간만 공개돼요
                </p>
              </div>
            </div>

            {/* 카테고리 탑3 — 상호명 없이 */}
            <div className="mt-3 px-5">
              <div className="rounded-card bg-elevated px-5 py-4 shadow-float">
                <p className="text-section font-bold text-ink">{METRIC_LABEL[metric]} 탑 3</p>
                <div className="mt-2 flex flex-col">
                  {mate.topCategories[metric].map((row, i) => (
                    <div key={row.label} className="flex items-center gap-3 py-2">
                      <span className="w-4 text-caption font-extrabold text-ink-faint">{i + 1}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/5 text-body">
                        {row.emoji}
                      </span>
                      <span className="flex-1 text-body font-semibold text-ink">{row.label}</span>
                      <span className={`text-body font-bold ${METRIC_TEXT[metric]}`}>{row.band}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 중앙 버튼 — 프로필: 나와 비교하기 / 비교: 분석하기 */}
      <div className="fixed inset-x-0 bottom-24 z-40 mx-auto w-fit">
        <motion.button
          type="button"
          layout
          onClick={() => (comparing ? setAnalysisOpen(true) : setComparing(true))}
          whileTap={{ scale: 0.96 }}
          className="flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-section font-bold text-white shadow-float"
          transition={snappy}
        >
          {comparing ? <Sparkles size={16} /> : <Users size={16} />}
          {comparing ? '분석하기' : '나와 비교하기'}
        </motion.button>
      </div>

      {comparing && (
        <button
          type="button"
          onClick={() => setComparing(false)}
          className="fixed bottom-24 right-5 z-40 flex h-12 items-center rounded-full bg-elevated px-4 text-body font-bold text-ink shadow-float"
        >
          프로필로
        </button>
      )}

      <AnimatePresence>
        {analysisOpen && <MateAnalysisOverlay mate={mate} onClose={() => setAnalysisOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function MetricBody({ mate, metric }: { mate: MateProfile; metric: Metric }) {
  const m = mate.metrics
  if (metric === 'budget') {
    return (
      <>
        <WaterGlass pct={m.budgetLeftPct / 100} width={110} height={124} />
        <p className="mt-1 text-display font-extrabold leading-none">{m.budgetLeftPct}%</p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">
          예산 남김 · <b className="text-ink">{m.budgetBand}</b> 소비
        </p>
      </>
    )
  }
  if (metric === 'saving') {
    return (
      <>
        <SpeedGauge pct={m.savingPct / 100} width={180} height={136} />
        <p className="mt-1 text-display font-extrabold leading-none">{m.savingPct}%</p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">
          목표 <b className="text-ink">{m.savingGoal}</b> 진행 중
        </p>
      </>
    )
  }
  const rise = m.investReturnPct >= 0
  return (
    <>
      <p className={`text-[44px] font-extrabold leading-none ${rise ? 'text-rise' : 'text-fall'}`}>
        {rise ? '+' : ''}
        {m.investReturnPct}%
      </p>
      <p className="mt-3 text-body font-medium text-ink-soft">총 수익률 · 종목 구성은 비중만 공개</p>
    </>
  )
}

/** 나와 비교하기 — 좌측 상대, 우측 나. my 상단 요소(물컵·게이지·수익률)의 축소판 2열 */
function CompareColumns({ mate }: { mate: MateProfile }) {
  const my = {
    budgetLeftPct: Math.round(getBudget('daily').pct * 100),
    savingPct: Math.round(getSavingProgress('monthly').pct * 100),
    investReturnPct: getInvestStatus().returnPct,
  }

  return (
    <div data-testid="compare-columns">
      <div className="mb-2 grid grid-cols-2 gap-2.5 text-center">
        <p className="text-body font-extrabold text-ink">
          {mate.emoji} {mate.nickname}
        </p>
        <p className="text-body font-extrabold text-ink">🙋‍♀️ 나</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5" data-metric="budget">
          <MiniCard metricClass="text-budget" title="예산 남김">
            <WaterGlass pct={mate.metrics.budgetLeftPct / 100} width={64} height={72} />
            <p className="mt-1 text-title font-extrabold leading-none">{mate.metrics.budgetLeftPct}%</p>
          </MiniCard>
          <MiniCard metricClass="text-budget" title="예산 남김">
            <WaterGlass pct={my.budgetLeftPct / 100} width={64} height={72} />
            <p className="mt-1 text-title font-extrabold leading-none">{my.budgetLeftPct}%</p>
          </MiniCard>
        </div>

        <div className="grid grid-cols-2 gap-2.5" data-metric="saving">
          <MiniCard metricClass="text-saving" title="저축 목표">
            <SpeedGauge pct={mate.metrics.savingPct / 100} width={104} height={80} />
            <p className="mt-0.5 text-title font-extrabold leading-none">{mate.metrics.savingPct}%</p>
          </MiniCard>
          <MiniCard metricClass="text-saving" title="저축 목표">
            <SpeedGauge pct={my.savingPct / 100} width={104} height={80} />
            <p className="mt-0.5 text-title font-extrabold leading-none">{my.savingPct}%</p>
          </MiniCard>
        </div>

        <div className="grid grid-cols-2 gap-2.5" data-metric="invest">
          <MiniCard metricClass="text-invest" title="총 수익률">
            <InvestPct value={mate.metrics.investReturnPct} />
          </MiniCard>
          <MiniCard metricClass="text-invest" title="총 수익률">
            <InvestPct value={my.investReturnPct} />
          </MiniCard>
        </div>
      </div>
    </div>
  )
}

function MiniCard({ metricClass, title, children }: { metricClass: string; title: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col items-center overflow-hidden rounded-2xl bg-elevated shadow-soft ${metricClass}`}>
      <div className="w-full bg-current/25 py-1.5 text-center">
        <p className="text-caption font-bold text-ink">{title}</p>
      </div>
      <div className="flex min-h-[118px] flex-col items-center justify-center px-3 py-2.5">{children}</div>
    </div>
  )
}

function InvestPct({ value }: { value: number }) {
  const rise = value >= 0
  return (
    <p className={`text-[30px] font-extrabold leading-none ${rise ? 'text-rise' : 'text-fall'}`}>
      {rise ? '+' : ''}
      {value}%
    </p>
  )
}
