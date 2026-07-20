import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, Sparkles, Users } from 'lucide-react'
import { getMateProfile, type MateCategoryRow, type MateProfile } from '../../data/mates'
import { STORIES } from '../../data/social'
import { ART } from '../../data/art-manifest'
import { ProfileCard } from '../../shared/profile/ProfileCard'
import { MetricCarousel } from '../my/carousel/MetricCarousel'
import { MetricTabs } from '../my/MetricTabs'
import { ViewChips } from '../my/ViewChips'
import { makeMateCardRenderer } from './MateMetricCards'
import { BudgetCard, InvestCard, SavingCard } from '../my/cards/MetricCards'
import { PageTitle } from '../../shared/ui/PageTitle'
import { MateAnalysisOverlay } from './MateAnalysisOverlay'
import { snappy } from '../../shared/motion/springs'
import {
  nextInvestView,
  nextPeriod,
  nextSavingView,
  prevInvestView,
  prevPeriod,
  prevSavingView,
  type InvestView,
  type Period,
  type SavingView,
} from '../my/myState'
import type { Metric } from '../../data/types'

const METRIC_TEXT: Record<Metric, string> = { budget: 'text-budget', saving: 'text-saving', invest: 'text-invest' }
const LIST_TITLE: Record<Metric, string> = { budget: '소비 탑 3', saving: '저축 구성', invest: '투자 구성' }

interface ListItem {
  emoji: string
  label: string
  value: string
  valueClass?: string
}

/** 메이트 프로필 — 마이 탭과 같은 화면 문법, 데이터는 카테고리·구간으로 필터링 */
export function MateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mate = id ? getMateProfile(id) : undefined
  const [metric, setMetric] = useState<Metric>('budget')
  const [period, setPeriod] = useState<Period>('daily')
  const [savingView, setSavingView] = useState<SavingView>('goal')
  const [investView, setInvestView] = useState<InvestView>('status')
  const [following, setFollowing] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  if (!mate) return <Navigate to="/feed" replace />

  // 마이 탭 하단 아트 카드 자리 — 이 메이트가 올린 스토리 이미지 재활용 (지표 일치 우선)
  const story =
    STORIES.find((s) => s.author.id === mate.id && s.metric === metric) ??
    STORIES.find((s) => s.author.id === mate.id)

  return (
    <div className="relative min-h-full pb-8">
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

      {/* 지표 밑줄 탭 — 비교 모드에선 9뷰가 전부 나열되므로 숨김 */}
      {!comparing && (
        <div className="mt-3">
          <MetricTabs metric={metric} onChange={setMetric} layoutId="mate-metric-tab" />
        </div>
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        {comparing ? (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
            className="mt-3 px-5"
          >
            <CompareView mate={mate} />
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
          >
            {/* 마이 탭과 동일한 캐러셀 — 가로 스와이프=지표, 세로/휠=뷰 스택 */}
            <div className="pt-2" data-metric={metric}>
              <MetricCarousel
                metric={metric}
                period={period}
                savingView={savingView}
                investView={investView}
                onMetricChange={setMetric}
                onStackNext={() => {
                  if (metric === 'saving') setSavingView(nextSavingView(savingView))
                  else if (metric === 'invest') setInvestView(nextInvestView(investView))
                  else setPeriod(nextPeriod(period))
                }}
                onStackPrev={() => {
                  if (metric === 'saving') setSavingView(prevSavingView(savingView))
                  else if (metric === 'invest') setInvestView(prevInvestView(investView))
                  else setPeriod(prevPeriod(period))
                }}
                renderCard={makeMateCardRenderer(mate)}
              />
            </div>

            <div className="relative mt-2 flex justify-center">
              <ViewChips
                id="mate-period"
                metric={metric}
                period={period}
                savingView={savingView}
                investView={investView}
                onPeriod={setPeriod}
                onSavingView={setSavingView}
                onInvestView={setInvestView}
              />
            </div>

            {/* 하단 2열 — 마이 탭처럼 좌 이미지 카드, 우 리스트 카드 */}
            <section className="mt-3 grid grid-cols-[1fr_1.15fr] gap-3 px-5">
              <div className="relative h-[232px] overflow-hidden rounded-card shadow-float">
                {story && (
                  <img
                    src={ART.stories[story.artKey]}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full select-none object-cover"
                  />
                )}
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 text-caption font-bold text-white backdrop-blur-sm">
                  메이트의 스토리
                </span>
              </div>
              <div className="h-[232px]">
                <MateListCard title={LIST_TITLE[metric]} metricClass={METRIC_TEXT[metric]} items={mateRows(mate, metric)} />
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 중앙 버튼 — 콘텐츠 흐름 안이라 리스트를 가리지 않는다 */}
      <div className="mt-5 flex items-center justify-center gap-2.5 px-5">
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
        {comparing && (
          <button
            type="button"
            onClick={() => setComparing(false)}
            className="flex h-12 items-center rounded-full bg-elevated px-4 text-body font-bold text-ink shadow-float"
          >
            프로필로
          </button>
        )}
      </div>

      <AnimatePresence>
        {analysisOpen && <MateAnalysisOverlay mate={mate} onClose={() => setAnalysisOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

/** 메이트 쪽 리스트 rows — 카테고리 + 구간만 */
function mateRows(mate: MateProfile, metric: Metric): ListItem[] {
  return mate.topCategories[metric].map((row: MateCategoryRow) => ({
    emoji: row.emoji,
    label: row.label,
    value: row.band,
  }))
}

function MateListCard({
  title,
  metricClass,
  items,
  dense,
}: {
  title: string
  metricClass: string
  items: ListItem[]
  dense?: boolean
}) {
  return (
    <div className="flex h-full flex-col rounded-card bg-elevated px-3.5 py-3 shadow-float">
      <p className={`mb-1 font-bold text-ink ${dense ? 'text-body' : 'text-section'}`}>{title}</p>
      <div className="flex flex-1 flex-col justify-evenly">
        {items.map((row, i) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-3.5 text-caption font-extrabold text-ink-faint">{i + 1}</span>
            <span className={`flex shrink-0 items-center justify-center rounded-lg bg-ink/5 ${dense ? 'h-7 w-7' : 'h-8 w-8'}`}>
              <EmojiIcon emoji={row.emoji} size={dense ? 13 : 15} className="text-ink-soft" />
            </span>
            <span className={`min-w-0 flex-1 truncate font-semibold text-ink ${dense ? 'text-caption' : 'text-body'}`}>
              {row.label}
            </span>
            <span className={`shrink-0 font-bold ${dense ? 'text-caption' : 'text-body'} ${row.valueClass ?? metricClass}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 나와 비교하기 — 마이 9카드 전체를 좌 메이트/우 나 2열 스크롤로 */
const COMPARE_ROWS: { metric: Metric; period: Period; savingView: SavingView; investView: InvestView; title: string }[] = [
  { metric: 'budget', period: 'daily', savingView: 'goal', investView: 'status', title: '오늘의 예산' },
  { metric: 'budget', period: 'weekly', savingView: 'goal', investView: 'status', title: '이번 주 예산' },
  { metric: 'budget', period: 'monthly', savingView: 'goal', investView: 'status', title: '7월 예산' },
  { metric: 'saving', period: 'monthly', savingView: 'goal', investView: 'status', title: '저축 목표' },
  { metric: 'saving', period: 'monthly', savingView: 'monthly', investView: 'status', title: '월간 저축' },
  { metric: 'saving', period: 'monthly', savingView: 'asset', investView: 'status', title: '나의 자산' },
  { metric: 'invest', period: 'monthly', savingView: 'goal', investView: 'status', title: '투자 현황' },
  { metric: 'invest', period: 'monthly', savingView: 'goal', investView: 'portfolio', title: '포트폴리오' },
  { metric: 'invest', period: 'monthly', savingView: 'goal', investView: 'news', title: '뉴스' },
]

const SECTION_LABEL: Record<Metric, string> = { budget: '소비', saving: '저축', invest: '투자' }

/** 원본 폭 기준으로 렌더한 카드를 열 폭에 맞춰 통째로 축소 */
const CARD_BASE_W = 326
const CARD_BASE_H = 316

function ScaledCard({ colW, children }: { colW: number; children: React.ReactNode }) {
  const s = colW / CARD_BASE_W
  return (
    <div style={{ width: colW, height: CARD_BASE_H * s }} className="overflow-hidden">
      <div style={{ width: CARD_BASE_W, height: CARD_BASE_H, transform: `scale(${s})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

function myCard(row: (typeof COMPARE_ROWS)[number]): React.ReactNode {
  if (row.metric === 'budget') return <BudgetCard period={row.period} />
  if (row.metric === 'saving') return <SavingCard view={row.savingView} />
  return <InvestCard view={row.investView} />
}

function CompareView({ mate }: { mate: MateProfile }) {
  const renderMate = makeMateCardRenderer(mate)
  // 폰 프레임 고정폭 기준 열 폭: (430 - 좌우 40 - 열 간격 10) / 2
  const colW = 190

  return (
    <div data-testid="compare-columns">
      {/* 열 헤더 — 스크롤해도 어느 열이 누군지 보이게 고정 */}
      <div className="sticky top-11 z-10 -mx-1 mb-1 grid grid-cols-2 gap-2.5 rounded-xl bg-surface/90 px-1 py-2 text-center backdrop-blur-sm">
        <p className="flex items-center justify-center gap-1.5 text-body font-extrabold text-ink">
          <EmojiIcon emoji={mate.emoji} size={15} className="text-accent" /> {mate.nickname}
        </p>
        <p className="flex items-center justify-center gap-1.5 text-body font-extrabold text-ink">
          <EmojiIcon emoji="🙋‍♀️" size={15} className="text-accent" /> 지혜
        </p>
      </div>

      {COMPARE_ROWS.map((row, i) => {
        const sectionStart = i === 0 || COMPARE_ROWS[i - 1].metric !== row.metric
        return (
          <div key={row.title} data-metric={row.metric}>
            {sectionStart && (
              <p className={`mt-3 px-0.5 text-title font-extrabold ${METRIC_TEXT[row.metric]}`}>
                {SECTION_LABEL[row.metric]}
              </p>
            )}
            <div className="mt-2 grid grid-cols-2 justify-items-center gap-2.5">
              <ScaledCard colW={colW}>{renderMate(row.metric, row.period, row.savingView, row.investView)}</ScaledCard>
              <ScaledCard colW={colW}>{myCard(row)}</ScaledCard>
            </div>
          </div>
        )
      })}
    </div>
  )
}
