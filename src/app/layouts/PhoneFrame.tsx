import { useLayoutEffect, useState, type ReactNode } from 'react'

/** 프레임 비율 — 세로가 너무 길지 않게 18:9 근사(430×860) */
const FRAME_W = 430
const FRAME_H = 860

/** 데스크톱에서 프레임 전체를 뷰포트에 맞춰 통째로 축소하는 배율 (모바일은 1) */
function useFrameScale(): number {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) {
        setScale(1)
        return
      }
      setScale(Math.min(1, (window.innerHeight * 0.92) / FRAME_H, (window.innerWidth * 0.95) / FRAME_W))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return scale
}

/**
 * 모바일에서는 풀블리드, 데스크톱(≥sm)에서는 실제 아이폰 비율(430×932)의
 * 폰 프레임. 내부는 항상 430px 기준으로 레이아웃하고 프레임 전체를
 * transform scale로 축소한다 — 창 크기가 어떻든 내부 구성이 압축되지 않는다.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const scale = useFrameScale()
  const desktop = scale !== 1 || (typeof window !== 'undefined' && window.innerWidth >= 640)

  return (
    <div className="min-h-dvh sm:flex sm:items-center sm:justify-center">
      {/* transform은 레이아웃 크기에 영향을 주지 않아 점유 공간을 직접 잡아준다 */}
      <div className="contents sm:block" style={desktop ? { width: FRAME_W * scale, height: FRAME_H * scale } : undefined}>
        <div
          className="relative mx-auto min-h-dvh w-full max-w-[430px] origin-top-left overflow-hidden bg-surface sm:min-h-0 sm:h-[932px] sm:w-[430px] sm:max-w-none sm:rounded-[2.5rem] sm:shadow-float sm:ring-8 sm:ring-ink/90"
          style={desktop ? { transform: `scale(${scale})` } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
