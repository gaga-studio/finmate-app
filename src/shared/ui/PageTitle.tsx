/** 헤더 중앙 화면 타이틀 — 부모 header에 relative 필요, 상태바(3.5rem) 아래 영역 기준 중앙 정렬 */
export function PageTitle({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-0 top-14 flex items-center justify-center text-title font-extrabold text-ink">
      {children}
    </span>
  )
}
