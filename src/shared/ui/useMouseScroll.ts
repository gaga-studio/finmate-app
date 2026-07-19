import { useEffect, useRef, type RefObject } from 'react'

/**
 * 가로 스크롤 컨테이너에 데스크톱 입력을 붙인다:
 * 세로 휠 → 가로 스크롤 변환, 마우스 드래그 스크롤 (5px 이상 끌면 클릭 무시).
 * 모바일 터치 스크롤은 브라우저 기본 동작 그대로.
 */
export function useMouseScroll(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    let dragging = false
    let moved = false
    let startX = 0
    let startScroll = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dragging = true
      moved = false
      startX = e.clientX
      startScroll = el.scrollLeft
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 5) moved = true
      el.scrollLeft = startScroll - dx
    }
    const onPointerUp = () => {
      dragging = false
    }
    // 드래그였다면 카드 클릭(선택 토글)으로 이어지지 않게 막는다
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation()
        e.preventDefault()
        moved = false
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    el.addEventListener('click', onClickCapture, true)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return ref
}
