import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { ArrowRight, PiggyBank, Sparkles, Target, X } from 'lucide-react'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { dramatic } from '../../shared/motion/springs'
import { getBudget, getInvestStatus, getSavingProgress, getTopPurchases } from '../../data/selectors'
import { formatKrwCompact } from '../../shared/format/krw'
import type { MateProfile } from '../../data/mates'
import { USER } from '../../data/demo'

/** 로딩 연출 시간 — AI가 분석을 "생성"하는 느낌 */
const LOADING_MS = 1100

interface Props {
  mate: MateProfile
  onClose: () => void
}

/** 스타일 비교 rows — 대결표와 같은 순서(좌 나 / 우 메이트) */
function styleRows(mate: MateProfile) {
  const myTop = getTopPurchases('monthly', 1)[0]
  const myDelta = getSavingProgress('monthly').delta
  return [
    { label: '소비 1위', mate: mate.topCategories.budget[0].label, mine: myTop.merchant },
    { label: '저축 페이스', mate: mate.views.saving.paceBand, mine: `월 +${formatKrwCompact(myDelta)}` },
    { label: '투자 스타일', mate: `${mate.views.invest.portfolio[0].label} 중심`, mine: '개별주 중심' },
  ]
}

/** 분석하기 → AI 비교 분석 리포트 (로딩 도트 후 등장) */
export function MateAnalysisOverlay({ mate, onClose }: Props) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), LOADING_MS)
    return () => clearTimeout(t)
  }, [])

  const my = {
    budget: Math.round(getBudget('daily').pct * 100),
    saving: Math.round(getSavingProgress('monthly').pct * 100),
    invest: getInvestStatus().returnPct,
  }
  const rows = [
    { label: '예산 남김', mine: `${my.budget}%`, theirs: `${mate.metrics.budgetLeftPct}%`, win: my.budget >= mate.metrics.budgetLeftPct },
    { label: '저축 진행', mine: `${my.saving}%`, theirs: `${mate.metrics.savingPct}%`, win: my.saving >= mate.metrics.savingPct },
    { label: '수익률', mine: `+${my.invest}%`, theirs: `${mate.metrics.investReturnPct >= 0 ? '+' : ''}${mate.metrics.investReturnPct}%`, win: my.invest >= mate.metrics.investReturnPct },
  ]
  const wins = rows.filter((r) => r.win).length
  const bearMode = mate.id === 'a-bear'

  return createPortal(
    <div className="absolute inset-0 z-[60]">
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 max-h-[82%] overflow-y-auto rounded-t-sheet bg-surface px-5 pb-8 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={dramatic}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 700) onClose()
        }}
        data-testid="mate-analysis"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />

        {!ready ? (
          <div className="flex h-[260px] flex-col items-center justify-center">
            <span className="clay-card flex h-12 w-12 items-center justify-center rounded-full text-[22px]">
              ✨
            </span>
            <p className="mt-4 text-section font-bold text-ink">AI가 둘을 분석하는 중</p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-saving"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={dramatic}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption font-bold text-ink-faint">AI 분석 비교</p>
                <h2 className="mt-0.5 text-title font-extrabold text-ink">
                  {USER.nickname} vs {mate.nickname}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="clay-card flex h-9 w-9 items-center justify-center rounded-full text-ink transition-transform active:scale-95"
                aria-label="분석 닫기"
              >
                <X size={16} />
              </button>
            </div>

            {/* 3지표 비교 */}
            <div className="clay-card mt-4 rounded-card px-5 py-4">
              <div className="mb-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                <p className="text-caption font-extrabold text-ink">나</p>
                <p className="text-micro font-bold text-ink-faint">vs</p>
                <p className="flex min-w-0 items-center justify-center gap-1 text-body font-extrabold text-ink">
                  <EmojiIcon emoji={mate.emoji} avatarId={mate.id} size={20} className="text-accent" /> <span className="truncate">{mate.nickname}</span>
                </p>
              </div>
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 text-center">
                  <p className={`text-section font-extrabold ${r.win ? 'text-saving' : 'text-ink-soft'}`}>{r.mine}</p>
                  <p className="w-16 text-caption font-semibold text-ink-faint">{r.label}</p>
                  <p className={`text-section font-extrabold ${r.win ? 'text-ink-soft' : 'text-saving'}`}>{r.theirs}</p>
                </div>
              ))}
              <p className="mt-1 text-center text-caption font-bold text-ink-soft">
                {wins >= 2 ? `3판 ${wins}승 — 내가 리드 중! 🏆` : `3판 ${3 - wins}패 — 배울 게 있는 상대!`}
              </p>
            </div>

            {/* 스타일 비교 — 서로 다른 돈 습관 한눈에 */}
            <div className="clay-card mt-3 rounded-card px-5 py-4">
              <p className="text-caption font-bold text-ink-faint">스타일 비교</p>
              <div className="mt-1.5 flex flex-col">
                {styleRows(mate).map((r) => (
                  <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5 text-center">
                    <p className="truncate text-body font-bold text-ink">{r.mine}</p>
                    <p className="w-16 text-caption font-semibold text-ink-faint">{r.label}</p>
                    <p className="truncate text-body font-bold text-ink">{r.mate}</p>
                  </div>
                ))}
              </div>
            </div>

            {bearMode && (
              <div className="clay-card mt-3 rounded-card px-5 py-4">
                <p className="text-caption font-bold text-invest">핵심 차이</p>
                <h3 className="mt-1 text-section font-extrabold leading-snug text-ink">
                  지혜는 개별주로 감을 익히는 중, 곰손재테크는 ETF 자동이체를 이미 루틴으로 만들었어요.
                </h3>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <MiniFact label="내 현재 단계" value="개별주 연습" tone="text-ink-soft" />
                  <ArrowRight size={16} className="text-ink-faint" />
                  <MiniFact label="다음 단계" value="ETF 첫 매수" tone="text-invest" />
                </div>
              </div>
            )}

            {/* AI 처방 */}
            <div className="clay-card mt-3 rounded-card px-5 py-4">
              <p className="flex items-center gap-1 text-caption font-bold text-saving">
                <Sparkles size={12} />
                AI 처방
              </p>
              <p className="mt-1.5 text-body font-bold leading-relaxed text-ink">
                {bearMode
                  ? '곰손재테크는 ETF를 한 번에 크게 사기보다\n소액 자동이체로 시작했어요.'
                  : mate.metrics.savingPct > my.saving
                  ? `${mate.nickname}의 저축 습관이 한 수 위 —\n인사이트에서 습관 시뮬레이션 어때요? ✨`
                  : `소비 방어는 내가 우세 —\n이 페이스면 파리가 성큼! ✈️`}
              </p>
              <p className="mt-2 text-caption font-medium leading-relaxed text-ink-soft">
                {bearMode
                  ? `나도 30만원을 먼저 모으면 ETF 첫 시도 자금으로 충분해요 · 현재 예산 방어 ${my.budget}%`
                  : `${mate.nickname}의 강점: ${mate.badges[0] ?? '꾸준함'} · 나의 강점: 예산 방어 ${my.budget}% 남김`}
              </p>
            </div>

            {bearMode && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <InsightTile
                    icon={<PiggyBank size={15} />}
                    title="따라할 점"
                    body="매수 종목보다 먼저 자동이체 금액을 고정했어요."
                  />
                  <InsightTile
                    icon={<Target size={15} />}
                    title="내 실행안"
                    body="월 10만원씩 3개월, 30만원 만든 뒤 첫 ETF."
                  />
                </div>

                <div className="clay-card mt-3 rounded-card px-5 py-4">
                  <p className="text-caption font-bold text-saving">추천 루트</p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-center">
                    {[
                      { step: '1', label: '이번 달\n소비 5% 줄이기' },
                      { step: '2', label: '3개월\n30만원 모으기' },
                      { step: '3', label: 'ETF\n첫 매수' },
                    ].map((item, i) => (
                      <div key={item.step} className="flex flex-1 items-center gap-2">
                        <div className="flex min-w-0 flex-1 flex-col items-center">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-invest/12 text-caption font-extrabold text-invest">
                            {item.step}
                          </span>
                          <p className="mt-1 whitespace-pre-line text-micro font-bold leading-tight text-ink">
                            {item.label}
                          </p>
                        </div>
                        {i < 2 && <ArrowRight size={13} className="shrink-0 text-ink-faint" />}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-caption font-medium leading-relaxed text-ink-soft">
                    지금은 큰 금액 투자보다 첫 ETF 경험을 만들 수 있는 최소 자금부터 쌓는 게 좋아요.
                  </p>
                </div>
              </>
            )}

            <p className="mt-4 text-center text-micro font-semibold text-ink-faint">
              두 프로필의 공개 정보만으로 생성된 분석이에요 · FinMate AI
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>,
    overlayTarget(),
  )
}

function MiniFact({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-3 py-2 ring-1 ring-line/70">
      <p className="text-micro font-bold text-ink-faint">{label}</p>
      <p className={`mt-0.5 text-body font-extrabold ${tone}`}>{value}</p>
    </div>
  )
}

function InsightTile({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="clay-card rounded-2xl px-3.5 py-3">
      <p className="flex items-center gap-1 text-caption font-bold text-invest">
        {icon}
        {title}
      </p>
      <p className="mt-1.5 text-caption font-semibold leading-relaxed text-ink">{body}</p>
    </div>
  )
}
