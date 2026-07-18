import { useEffect, useState } from 'react'
import { useMotionValue, useMotionValueEvent, useSpring } from 'motion/react'
import { gentle } from '../motion/springs'

interface Props {
  value: number
  format?: (v: number) => string
  className?: string
}

/** 스프링으로 카운트업하는 숫자 — 게이지 애니메이션과 톤을 맞춘다 */
export function AnimatedNumber({ value, format = (v) => String(Math.round(v)), className }: Props) {
  const raw = useMotionValue(value)
  const spring = useSpring(raw, gentle)
  const [text, setText] = useState(() => format(value))

  useEffect(() => {
    raw.set(value)
  }, [raw, value])

  useMotionValueEvent(spring, 'change', (v) => setText(format(v)))

  return <span className={`tabular-nums ${className ?? ''}`}>{text}</span>
}
