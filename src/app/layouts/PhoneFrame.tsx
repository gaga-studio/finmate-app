import { useLayoutEffect, useState, type ReactNode } from 'react'
import { StatusBar } from '../../shared/ui/StatusBar'

/** 프레임 비율 — 초기 프레임과 동일한 430×880 */
const FRAME_W = 430
const FRAME_H = 880

/** 데스크톱에서 프레임 전체를 뷰포트에 맞춰 통째로 축소하는 배율 (모바일은 1) */
function useFrameScale(): number {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const update = () => {
      // 사파리 주소창 변동에 안전한 실제 가시 영역 기준
      const vw = document.documentElement.clientWidth
      const vh = window.visualViewport?.height ?? document.documentElement.clientHeight
      if (vw < 640) {
        setScale(1)
        return
      }
      setScale(Math.min(1, (vh * 0.92) / FRAME_H, (vw * 0.95) / FRAME_W))
    }
    update()
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
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
    <div className="min-h-dvh sm:grid sm:h-dvh sm:min-h-0 sm:place-items-center sm:overflow-hidden">
      {/* transform은 레이아웃 크기에 영향을 주지 않아 점유 공간을 직접 잡아준다 */}
      <div className="contents sm:block" style={desktop ? { width: FRAME_W * scale, height: FRAME_H * scale } : undefined}>
        <div
          id="phone-frame"
          className="relative mx-auto h-dvh w-full max-w-[430px] origin-top-left overflow-hidden bg-surface sm:max-w-none sm:rounded-[2.5rem] sm:shadow-float sm:ring-8 sm:ring-ink/90"
          style={
            desktop
              ? { width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }
              : undefined
          }
        >
          <StatusBar />
          {children}
        </div>
      </div>
    </div>
  )
}
