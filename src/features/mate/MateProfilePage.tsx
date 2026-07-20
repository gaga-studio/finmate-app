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
import { LinkedListPanel } from '../my/panels/LinkedListPanel'
import { MetricTabs } from '../my/MetricTabs'
import { ViewChips } from '../my/ViewChips'
import { makeMateCardRenderer } from './MateMetricCards'
import { makeCompareCardRenderer } from './CompareCards'
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

      {/* 지표 밑줄 탭 — 프로필/비교 공용 */}
      <div className="mt-3">
        <MetricTabs metric={metric} onChange={setMetric} layoutId="mate-metric-tab" />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {comparing ? (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
          >
            {/* 캐러셀 그대로 — 카드 슬롯에 좌 메이트/우 나 쌍이 함께 넘어간다 */}
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
                renderCard={makeCompareCardRenderer(mate)}
              />
            </div>

            <div className="relative mt-2 flex justify-center">
              <ViewChips
                id="mate-compare-period"
                metric={metric}
                period={period}
                savingView={savingView}
                investView={investView}
                onPeriod={setPeriod}
                onSavingView={setSavingView}
                onInvestView={setInvestView}
              />
            </div>

            {/* 연동 리스트 2열 — 좌 메이트(카테고리·구간) / 우 나(실측, 뷰 따라 전환) */}
            <section className="mt-3 px-5">
              <div className="mb-1.5 grid grid-cols-2 gap-3 text-center">
                <p className="flex items-center justify-center gap-1 text-caption font-extrabold text-ink">
                  <EmojiIcon emoji={mate.emoji} avatarId={mate.id} size={18} className="text-accent" /> {mate.nickname}
                </p>
                <p className="flex items-center justify-center gap-1 text-caption font-extrabold text-ink">
                  <EmojiIcon emoji="🙋‍♀️" size={12} className="text-accent" /> 지혜
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-[248px]">
                  <MateListCard
                    title={LIST_TITLE[metric]}
                    metricClass={METRIC_TEXT[metric]}
                    items={mateRows(mate, metric)}
                    dense
                  />
                </div>
                <div className="h-[248px]">
                  <LinkedListPanel metric={metric} period={period} savingView={savingView} investView={investView} />
                </div>
              </div>
            </section>
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
              <EmojiIcon emoji={row.emoji} size={dense ? 20 : 23} className="text-ink-soft" />
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
