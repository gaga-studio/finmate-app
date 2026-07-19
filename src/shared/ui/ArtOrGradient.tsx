import { useState, type ReactNode } from 'react'
import { FALLBACK_GRADIENT } from '../../data/art-manifest'
import type { Metric } from '../../data/types'

interface Props {
  src?: string
  palette: Metric | 'diary'
  className?: string
  children?: ReactNode
}

/**
 * AI 아트 이미지가 있으면 이미지, 없거나 로드 실패하면
 * 지표 팔레트 그라디언트 폴백 — 에셋 도착 전에도 촬영 가능한 미감.
 */
export function ArtOrGradient({ src, palette, className, children }: Props) {
  // 실패를 src별로 기억 — 컴포넌트가 재사용되며 src가 바뀌면(지표 전환) 자동 리셋된다
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [from, to] = FALLBACK_GRADIENT[palette]
  const showImage = !!src && failedSrc !== src

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={showImage ? undefined : { background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      {showImage && (
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
      {!showImage && (
        /* 폴백에 은은한 텍스처 — 단색 그라디언트의 밋밋함 방지 */
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(255,255,255,0.55), transparent), radial-gradient(ellipse 60% 40% at 85% 90%, rgba(255,255,255,0.3), transparent)',
          }}
        />
      )}
      {children}
    </div>
  )
}
