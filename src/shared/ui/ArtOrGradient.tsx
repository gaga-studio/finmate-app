import { useState, type ReactNode } from 'react'
import { FALLBACK_GRADIENT } from '../../data/art-manifest'
import type { Metric } from '../../data/types'

interface Props {
  src?: string
  palette: Metric | 'diary'
  className?: string
  /** 이미지 부재/실패 시 그라디언트 대신 렌더할 코드 드로잉 아트 */
  placeholder?: ReactNode
  children?: ReactNode
}

/**
 * AI 아트 이미지가 있으면 이미지, 없거나 로드 실패하면
 * placeholder(코드 드로잉 아트) → 지표 팔레트 그라디언트 순 폴백.
 * 실제 PNG가 manifest 경로에 도착하면 코드 수정 없이 이미지가 이긴다.
 */
export function ArtOrGradient({ src, palette, className, placeholder, children }: Props) {
  const [failed, setFailed] = useState(false)
  const [from, to] = FALLBACK_GRADIENT[palette]
  const showImage = src && !failed
  const showGradient = !showImage && !placeholder

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={showGradient ? { background: `linear-gradient(160deg, ${from}, ${to})` } : undefined}
    >
      {showImage && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {!showImage && placeholder}
      {showGradient && (
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
