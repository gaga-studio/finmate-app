import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Sparkles, X } from 'lucide-react'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { dramatic } from '../../shared/motion/springs'
import { getBudget, getInvestStatus, getSavingProgress } from '../../data/selectors'
import type { MateProfile } from '../../data/mates'
import { USER } from '../../data/demo'

/** 로딩 연출 시간 — AI가 분석을 "생성"하는 느낌 */
const LOADING_MS = 1100

interface Props {
  mate: MateProfile
  onClose: () => void
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
        className="absolute inset-x-0 bottom-0 top-24 overflow-y-auto rounded-t-sheet bg-surface px-5 pb-10 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={dramatic}
        data-testid="mate-analysis"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />

        {!ready ? (
          <div className="flex flex-col items-center pt-20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-invest text-[22px]">
              ✨
            </span>
            <p className="mt-4 text-section font-bold text-ink">AI가 둘을 분석하는 중</p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-accent"
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
                <p className="text-caption font-bold text-ink-faint">AI 비교 분석</p>
                <h2 className="mt-0.5 text-title font-extrabold text-ink">
                  {USER.nickname} vs {mate.nickname}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
                aria-label="분석 닫기"
              >
                <X size={16} />
              </button>
            </div>

            {/* 3지표 비교 */}
            <div className="mt-4 rounded-card bg-elevated px-5 py-4 shadow-float">
              <div className="mb-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                <p className="text-caption font-extrabold text-ink">나</p>
                <p className="text-micro font-bold text-ink-faint">vs</p>
                <p className="text-caption font-extrabold text-ink">
                  {mate.emoji} {mate.nickname}
                </p>
              </div>
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 text-center">
                  <p className={`text-section font-extrabold ${r.win ? 'text-accent' : 'text-ink-soft'}`}>{r.mine}</p>
                  <p className="w-16 text-caption font-semibold text-ink-faint">{r.label}</p>
                  <p className={`text-section font-extrabold ${r.win ? 'text-ink-soft' : 'text-accent'}`}>{r.theirs}</p>
                </div>
              ))}
              <p className="mt-1 text-center text-caption font-bold text-ink-soft">
                {wins >= 2 ? `3판 ${wins}승 — 내가 리드 중! 🏆` : `3판 ${3 - wins}패 — 배울 게 있는 상대!`}
              </p>
            </div>

            {/* AI 처방 */}
            <div className="mt-3 rounded-card bg-accent/8 px-5 py-4">
              <p className="flex items-center gap-1 text-caption font-bold text-accent">
                <Sparkles size={12} />
                AI 처방
              </p>
              <p className="mt-1.5 text-body font-bold leading-relaxed text-ink">
                {mate.metrics.savingPct > my.saving
                  ? `${mate.nickname}의 저축 습관이 한 수 위 —\n인사이트에서 습관 시뮬레이션 어때요? ✨`
                  : `소비 방어는 내가 우세 —\n이 페이스면 파리가 성큼! ✈️`}
              </p>
              <p className="mt-2 text-caption font-medium leading-relaxed text-ink-soft">
                {mate.nickname}의 강점: {mate.badges[0] ?? '꾸준함'} · 나의 강점: 예산 방어 {my.budget}% 남김
              </p>
            </div>

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
