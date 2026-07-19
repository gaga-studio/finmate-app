import { ArtOrGradient } from '../../../shared/ui/ArtOrGradient'
import type { Metric } from '../../../data/types'

export interface WrappedCardData {
  title: string
  rangeLabel: string
  headline: string
  subline: string
  metric: Metric
  artSrc?: string
  top3?: { key: string; label: string; value: string }[]
  top3Title?: string
}

/** 하단 플랫 배경 — 지표색 계열의 진한 단색 (흰 텍스트 대비 확보) */
const CARD_BG: Record<Metric, string> = {
  budget: 'oklch(0.42 0.14 245)',
  saving: 'oklch(0.4 0.12 175)',
  invest: 'oklch(0.4 0.15 300)',
}

/**
 * 9:16 Wrapped 카드의 표시 전용 뷰 — 내 카드(WrappedCardNode)와
 * 피드 스토리 오버레이가 공유한다. 캡처 재현성을 위해 무한 애니메이션은 없다.
 */
export function WrappedCardView({ data }: { data: WrappedCardData }) {
  return (
    <div
      className="relative flex aspect-[9/16] w-full flex-col overflow-hidden"
      style={{ background: CARD_BG[data.metric] }}
    >
      {/* 상단 이미지 영역 — 정사각형, 스포티파이 Wrapped처럼 상단만 차지 */}
      <div className="relative aspect-square w-full">
        <ArtOrGradient src={data.artSrc} palette={data.metric} className="h-full w-full">
          {/* 배지 가독용 얕은 상단 스크림 */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-white">
            <span className="rounded-full bg-white/22 px-3 py-1.5 text-[12px] font-bold backdrop-blur-sm">
              {data.title}
            </span>
            <span className="text-[12px] font-semibold text-white/80">{data.rangeLabel}</span>
          </div>
        </ArtOrGradient>
      </div>

      {/* 하단 플랫 컬러 영역 — 큰 타이포 */}
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-3.5 text-white">
        <p className="whitespace-pre-line break-keep text-[22px] font-extrabold leading-snug">
          {data.headline}
        </p>
        <p className="mt-1 text-[12.5px] font-medium text-white/85">{data.subline}</p>

        <div className="flex-1" />

        {data.top3 && (
          <div className="rounded-2xl bg-white/12 p-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-white/75">
              {data.top3Title}
            </p>
            {data.top3.map((row, i) => (
              <div key={row.key} className="flex items-center gap-2 py-[3px] text-[13px] font-semibold">
                <span className="w-4 text-white/70">{i + 1}</span>
                <span className="flex-1 truncate">{row.label}</span>
                <span className="font-bold">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 text-center text-[11px] font-extrabold tracking-tight text-white/70">
          finmate
        </p>
      </div>
    </div>
  )
}
