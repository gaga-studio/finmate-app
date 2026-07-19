import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { dramatic } from '../../shared/motion/springs'
import { formatKrw, formatKrwCompact } from '../../shared/format/krw'
import {
  getBudget,
  getInvestStatus,
  getNetWorth,
  getSavingProgress,
  getTopPurchases,
} from '../../data/selectors'
import { getHabitProjection } from '../../data/insights'
import { USER } from '../../data/demo'

/** AI가 생성한 7월 마무리 리포트 — 전 수치가 마이 탭과 같은 셀렉터에서 파생 */
export function ReportOverlay({ onClose }: { onClose: () => void }) {
  const budget = getBudget('monthly')
  const top3 = getTopPurchases('monthly', 3)
  const saving = getSavingProgress('monthly')
  const invest = getInvestStatus()
  const nw = getNetWorth()
  const nextMonth = getHabitProjection().curve[1]

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
        className="absolute inset-x-0 bottom-0 top-14 overflow-y-auto rounded-t-sheet bg-surface px-5 pb-10 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={dramatic}
        data-testid="report-overlay"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-bold text-ink-faint">{USER.nickname}님의 월간 리포트</p>
            <h2 className="mt-0.5 text-title font-extrabold text-ink">7월, 한 장 정리 📋</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
            aria-label="리포트 닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* 총자산 + 다음 달 투영 */}
        <div className="mt-4 rounded-card bg-elevated px-5 py-4 shadow-float">
          <p className="text-body font-bold text-ink-soft">총자산</p>
          <p className="mt-1 text-display font-extrabold leading-none text-ink">
            {formatKrwCompact(nw.total)}
          </p>
          <p className="mt-1.5 text-body font-medium text-ink-soft">
            지금 습관대로면 8월엔 <b className="text-saving">{formatKrwCompact(nextMonth)}</b>
          </p>
        </div>

        {/* 소비 */}
        <section className="mt-3 rounded-card bg-elevated px-5 py-4 shadow-float" data-metric="budget">
          <div className="flex items-baseline justify-between">
            <p className="text-section font-bold text-ink">소비</p>
            <p className="text-body font-bold text-budget">예산 {Math.round(budget.pct * 100)}% 남김</p>
          </div>
          <p className="mt-1 text-title font-extrabold text-ink">{formatKrw(budget.spent)}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {top3.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="w-4 text-caption font-extrabold text-ink-faint">{i + 1}</span>
                <span className="flex-1 truncate text-body font-medium text-ink">{t.merchant}</span>
                <span className="text-body font-bold text-budget">{formatKrw(t.amount)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 저축 */}
        <section className="mt-3 rounded-card bg-elevated px-5 py-4 shadow-float">
          <div className="flex items-baseline justify-between">
            <p className="text-section font-bold text-ink">저축</p>
            <p className="text-body font-bold text-saving">파리까지 {Math.round(saving.pct * 100)}%</p>
          </div>
          <p className="mt-1 text-title font-extrabold text-ink">+{formatKrw(saving.delta)}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/6">
            <motion.div
              className="h-full rounded-full bg-saving"
              initial={{ width: 0 }}
              animate={{ width: `${saving.pct * 100}%` }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.3, 0, 0.2, 1] }}
            />
          </div>
          <p className="mt-1.5 text-caption font-medium text-ink-soft">
            {saving.title} · {formatKrwCompact(saving.current)} / {formatKrwCompact(saving.target)}
          </p>
        </section>

        {/* 투자 */}
        <section className="mt-3 rounded-card bg-elevated px-5 py-4 shadow-float">
          <div className="flex items-baseline justify-between">
            <p className="text-section font-bold text-ink">투자</p>
            <p className={`text-body font-bold ${invest.returnPct >= 0 ? 'text-rise' : 'text-fall'}`}>
              {invest.returnPct >= 0 ? '+' : ''}
              {invest.returnPct}%
            </p>
          </div>
          <p className="mt-1 text-title font-extrabold text-ink">{formatKrwCompact(invest.total)}</p>
          <p className="mt-1.5 text-caption font-medium text-ink-soft">
            원금 {formatKrwCompact(invest.principalTotal)} → 수익 +{formatKrwCompact(invest.profit)} · 급락장 방어 성공
          </p>
        </section>

        {/* 다음 달 한 줄 제안 */}
        <div className="mt-3 rounded-card bg-accent/8 px-5 py-4">
          <p className="text-caption font-bold text-accent">8월 제안</p>
          <p className="mt-1 text-body font-bold leading-relaxed text-ink">
            카페를 주 2회로 줄이면
            <br />
            파리 출발이 6일 빨라져요 ✈️
          </p>
        </div>

        <p className="mt-4 text-center text-micro font-semibold text-ink-faint">
          거래 내역 기반 자동 생성 · FinMate AI
        </p>
      </motion.div>
    </div>,
    overlayTarget(),
  )
}
