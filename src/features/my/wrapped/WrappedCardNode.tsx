import { forwardRef } from 'react'
import { ArtOrGradient } from '../../../shared/ui/ArtOrGradient'
import { ART } from '../../../data/art-manifest'
import { CATEGORY_META } from '../../../data/categories'
import { formatKrwCompact } from '../../../shared/format/krw'
import { getWrapped } from '../../../data/selectors'
import type { Period } from '../myState'

interface Props {
  period: Period
  /** 캡처 대상이 되는 원본 크기 여부 (피드에서는 축소 렌더) */
  className?: string
}

/**
 * 9:16 Wrapped 카드 본체 — 오버레이(캡처 대상)와 소셜 피드 축소판이
 * 같은 컴포넌트를 쓴다. 캡처 재현성을 위해 무한 애니메이션은 없다.
 */
export const WrappedCardNode = forwardRef<HTMLDivElement, Props>(function WrappedCardNode(
  { period, className },
  ref,
) {
  const w = getWrapped(period)
  const returnPct = w.invest.returnPct

  return (
    <div ref={ref} className={`relative aspect-[9/16] w-full overflow-hidden ${className ?? ''}`}>
      <ArtOrGradient src={ART.wrapped[period]} palette="budget" className="h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />

        <div className="absolute inset-0 flex flex-col p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/22 px-3 py-1.5 text-[12px] font-bold backdrop-blur-sm">
              {w.title}
            </span>
            <span className="text-[12px] font-semibold text-white/80">{w.rangeLabel}</span>
          </div>

          <div className="flex-1" />

          <p className="whitespace-pre-line text-[24px] font-extrabold leading-snug">{w.headline}</p>
          <p className="mt-2 text-[13px] font-medium text-white/85">{w.subline}</p>

          {/* 지표 요약 3종 */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat label="예산 남음" value={`${Math.round(w.budget.pct * 100)}%`} />
            <Stat label="저축 목표" value={`${Math.round(w.saving.pct * 100)}%`} />
            <Stat label="수익률" value={`${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}%`} />
          </div>

          {/* 소비 탑3 */}
          <div className="mt-3 rounded-2xl bg-white/14 p-3.5 backdrop-blur-md">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/75">
              소비 탑 3
            </p>
            {w.topSpending.slice(0, 3).map((c, i) => {
              const meta = CATEGORY_META[c.category]
              return (
                <div key={c.category} className="flex items-center gap-2 py-1 text-[13px] font-semibold">
                  <span className="w-4 text-white/70">{i + 1}</span>
                  <span className="flex-1">
                    {meta.emoji} {meta.label}
                  </span>
                  <span className="font-bold">{formatKrwCompact(c.total)}</span>
                </div>
              )
            })}
          </div>

          <p className="mt-4 text-center text-[12px] font-extrabold tracking-tight text-white/70">
            finmate
          </p>
        </div>
      </ArtOrGradient>
    </div>
  )
})

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/14 px-2 py-2.5 text-center backdrop-blur-md">
      <p className="text-[16px] font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-white/75">{label}</p>
    </div>
  )
}
