import type { ReactNode } from 'react'

/**
 * 모바일에서는 풀블리드, 데스크톱(≥sm)에서는 430px 폰 프레임으로 고정한다.
 * 시연 영상은 데스크톱 Chrome 모바일 뷰포트 녹화가 기본이라
 * 어떤 환경에서 띄워도 촬영 화면이 동일해야 한다.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh sm:flex sm:items-center sm:justify-center sm:py-6">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden bg-surface sm:min-h-0 sm:h-[880px] sm:max-h-[92dvh] sm:rounded-[2.5rem] sm:shadow-float sm:ring-8 sm:ring-ink/90">
        {children}
      </div>
    </div>
  )
}
