import { useCallback, useEffect, useRef, useState } from 'react'
import type { InsightChartState, InsightMsg } from '../../data/insights'
import { findReplies, INITIAL_REPLIES, type Reply } from './script'

/** 타이핑 인디케이터 노출 시간 / 버블 간 간격 (ms) — 촬영 리듬 고정 */
const TYPING_MS = 700
const GAP_MS = 500

export function useInsightChat() {
  const [messages, setMessages] = useState<InsightMsg[]>([])
  const [chart, setChart] = useState<InsightChartState>({ kind: 'default' })
  const [typing, setTyping] = useState(false)
  const timers = useRef<number[]>([])
  const seq = useRef(0)

  const push = useCallback((reply: Reply) => {
    const id = `m${++seq.current}`
    setMessages((prev) => [...prev, { ...reply, id }])
    if (reply.chart) setChart(reply.chart)
  }, [])

  /** AI 응답 시퀀스 — 타이핑 도트 후 버블이 순차 등장 */
  const respond = useCallback(
    (replies: Reply[]) => {
      setTyping(true)
      replies.forEach((r, i) => {
        timers.current.push(
          window.setTimeout(() => {
            push(r)
            if (i === replies.length - 1) setTyping(false)
          }, TYPING_MS + i * GAP_MS),
        )
      })
    },
    [push],
  )

  // 첫 진입: 오늘의 총평 자동 발화 — cleanup이 타이머·메시지를 리셋해
  // StrictMode 이중 실행에도 정확히 한 번만 나타난다
  useEffect(() => {
    respond(INITIAL_REPLIES)
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      timers.current = []
      setMessages([])
      setTyping(false)
    }
  }, [respond])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || typing) return
      push({ role: 'user', text: trimmed })
      respond(findReplies(trimmed))
    },
    [push, respond, typing],
  )

  /** 슬라이더 위젯 → 투영 차트 실시간 갱신 */
  const setSavingMonthly = useCallback((monthly: number) => {
    setChart({ kind: 'sim-saving', monthly })
  }, [])

  return { messages, chart, typing, send, setSavingMonthly }
}
