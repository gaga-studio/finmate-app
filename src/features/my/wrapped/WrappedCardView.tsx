import { EmojiIcon } from '../../../shared/ui/EmojiIcon'
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

export const TOP3_TITLE: Record<Metric, string> = {
  budget: '소비 탑 3',
  saving: '위시 리스트',
  invest: '투자 종목',
}

/**
 * 카드 배경 — 지표색 계열의 세로 그라디언트 (위 = 이미지와 이어지는 밝은 톤,
 * 아래로 갈수록 깊어짐). top은 이미지 하단 블렌딩에도 쓴다.
 */
const CARD_BG: Record<Metric, { top: string; gradient: string }> = {
  budget: {
    top: 'oklch(0.47 0.15 245)',
    gradient: 'linear-gradient(180deg, oklch(0.47 0.15 245) 0%, oklch(0.33 0.12 262) 100%)',
  },
  saving: {
    top: 'oklch(0.45 0.13 175)',
    gradient: 'linear-gradient(180deg, oklch(0.45 0.13 175) 0%, oklch(0.31 0.1 195) 100%)',
  },
  invest: {
    top: 'oklch(0.45 0.16 300)',
    gradient: 'linear-gradient(180deg, oklch(0.45 0.16 300) 0%, oklch(0.31 0.13 315) 100%)',
  },
}

/**
 * 9:16 Wrapped 카드의 표시 전용 뷰 — 내 카드(WrappedCardNode)와
 * 피드 스토리 오버레이가 공유한다. 캡처 재현성을 위해 무한 애니메이션은 없다.
 */
export function WrappedCardView({ data }: { data: WrappedCardData }) {
  const bg = CARD_BG[data.metric]

  return (
    <div
      className="relative flex aspect-[9/16] w-full flex-col overflow-hidden"
      style={{ background: bg.gradient }}
    >
      {/* 상단 이미지 영역 — 정사각형, 스포티파이 Wrapped처럼 상단만 차지 */}
      <div className="relative aspect-square w-full">
        <ArtOrGradient src={data.artSrc} palette={data.metric} className="h-full w-full">
          {/* 배지 가독용 얕은 상단 스크림 */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
          {/* 이미지 → 하단 컬러로 부드럽게 녹아드는 블렌딩 */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ background: `linear-gradient(to top, ${bg.top}, transparent)` }}
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-white">
            <span className="rounded-full bg-white/22 px-3 py-1.5 text-caption font-bold backdrop-blur-sm">
              {data.title}
            </span>
            <span className="text-caption font-semibold text-white/80">{data.rangeLabel}</span>
          </div>
        </ArtOrGradient>
      </div>

      {/* 하단 플랫 컬러 영역 — 큰 타이포 */}
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-3.5 text-white">
        <p className="whitespace-pre-line break-keep text-title font-extrabold leading-snug">
          {data.headline}
        </p>
        <p className="mt-1 text-body font-medium text-white/85">{data.subline}</p>

        <div className="flex-1" />

        {data.top3 && (
          <div className="rounded-2xl bg-white/12 p-3">
            <p className="mb-1.5 text-caption font-bold uppercase tracking-wide text-white/75">
              {data.top3Title}
            </p>
            {data.top3.map((row, i) => (
              <div key={row.key} className="flex items-center gap-2 py-[3px] text-body font-semibold">
                <span className="w-4 text-white/70">{i + 1}</span>
                <span className="flex flex-1 items-center gap-1.5 truncate"><LabelIcon label={row.label} /></span>
                <span className="font-bold">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 text-center text-caption font-extrabold tracking-tight text-white/70">
          finmate
        </p>
      </div>
    </div>
  )
}

/** "☕️ 카페" 형태 라벨 — 앞 이모지를 lucide 아이콘으로 */
function LabelIcon({ label }: { label: string }) {
  const m = label.match(/^(\p{Extended_Pictographic}\uFE0F?)\s+(.*)$/u)
  if (!m) return <>{label}</>
  return (
    <>
      <EmojiIcon emoji={m[1]} size={18} className="shrink-0 opacity-90" />
      <span className="truncate">{m[2]}</span>
    </>
  )
}
