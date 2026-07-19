import { forwardRef } from 'react'
import { ArtOrGradient } from '../../../shared/ui/ArtOrGradient'
import { ART } from '../../../data/art-manifest'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, WISHLIST } from '../../../data/domain'
import { formatKrwCompact } from '../../../shared/format/krw'
import { getWrapped, type WrappedSummary } from '../../../data/selectors'
import type { Metric, Period } from '../myState'

interface Props {
  metric: Metric
  period: Period
  /** 캡처 대상이 되는 원본 크기 여부 (피드에서는 축소 렌더) */
  className?: string
}

/**
 * 9:16 Wrapped 카드 본체 — 오버레이(캡처 대상)와 소셜 피드 축소판이
 * 같은 컴포넌트를 쓴다. 캡처 재현성을 위해 무한 애니메이션은 없다.
 */
export const WrappedCardNode = forwardRef<HTMLDivElement, Props>(function WrappedCardNode(
  { metric, period, className },
  ref,
) {
  const w = getWrapped(metric, period)
  const returnPct = w.invest.returnPct

  return (
    <div
      ref={ref}
      className={`relative aspect-[9/16] w-full overflow-hidden ${className ?? ''}`}
      style={{ background: CARD_BG[metric] }}
    >
      {/* 상단 이미지 영역 — 스포티파이 Wrapped처럼 상단만 차지 */}
      <div className="relative h-[42%] w-full">
        <ArtOrGradient src={ART.wrapped[w.artKey]} palette={metric} className="h-full w-full">
          {/* 배지 가독용 얕은 상단 스크림 */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-white">
            <span className="rounded-full bg-white/22 px-3 py-1.5 text-[12px] font-bold backdrop-blur-sm">
              {w.title}
            </span>
            <span className="text-[12px] font-semibold text-white/80">{w.rangeLabel}</span>
          </div>
        </ArtOrGradient>
      </div>

      {/* 하단 플랫 컬러 영역 — 큰 타이포 */}
      <div className="flex h-[58%] flex-col p-5 pt-4 text-white">
        <p className="whitespace-pre-line break-keep text-[25px] font-extrabold leading-snug">
          {w.headline}
        </p>
        <p className="mt-1.5 text-[13px] font-medium text-white/85">{w.subline}</p>

        <div className="flex-1" />

        {/* 지표 요약 3종 */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="예산 남음" value={`${Math.round(w.budget.pct * 100)}%`} />
          <Stat label="저축 목표" value={`${Math.round(w.saving.pct * 100)}%`} />
          <Stat label="수익률" value={`${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}%`} />
        </div>

        {/* 지표별 탑3 — 9조합이 실제로 다른 내용을 갖는 지점 */}
        <div className="mt-2.5 rounded-2xl bg-white/12 p-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-white/75">
            {TOP3_TITLE[metric]}
          </p>
          {top3Rows(metric, w).map((row, i) => (
            <div key={row.key} className="flex items-center gap-2 py-1 text-[13px] font-semibold">
              <span className="w-4 text-white/70">{i + 1}</span>
              <span className="flex-1 truncate">{row.label}</span>
              <span className="font-bold">{row.value}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[12px] font-extrabold tracking-tight text-white/70">
          finmate
        </p>
      </div>
    </div>
  )
})

/** 하단 플랫 배경 — 지표색 계열의 진한 단색 (흰 텍스트 대비 확보) */
const CARD_BG: Record<Metric, string> = {
  budget: 'oklch(0.42 0.14 245)',
  saving: 'oklch(0.4 0.12 175)',
  invest: 'oklch(0.4 0.15 300)',
}

const TOP3_TITLE: Record<Metric, string> = {
  budget: '소비 탑 3',
  saving: '위시 리스트',
  invest: '투자 종목',
}

function top3Rows(metric: Metric, w: WrappedSummary): { key: string; label: string; value: string }[] {
  if (metric === 'budget') {
    return w.topSpending.slice(0, 3).map((c) => {
      const meta = CATEGORY_META[c.category]
      return { key: c.category, label: `${meta.emoji} ${meta.label}`, value: formatKrwCompact(c.total) }
    })
  }
  if (metric === 'saving') {
    return WISHLIST.slice(0, 3).map((item) => ({
      key: item.id,
      label: `${item.emoji} ${item.title}`,
      value: `${Math.round(item.savedPct * 100)}%`,
    }))
  }
  return HOLDINGS.slice(0, 3).map((h) => ({
    key: h.ticker,
    label: `📈 ${h.name}`,
    value: `${h.returnPct >= 0 ? '+' : ''}${h.returnPct.toFixed(1)}%`,
  }))
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/14 px-2 py-2.5 text-center backdrop-blur-md">
      <p className="text-[16px] font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-white/75">{label}</p>
    </div>
  )
}
