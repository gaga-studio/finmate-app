import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COMPARE_TARGETS,
  PRESET_SESSIONS,
  type InsightChartState,
  type InsightMsg,
  type SavedSession,
} from '../../data/insights'
import { DEMO_TODAY } from '../../data/demo'
import { compareDoneReplies, findReplies, INITIAL_REPLIES, type Reply } from './script'

/** 타이핑 인디케이터 노출 시간 / 버블 간 간격 (ms) — 촬영 리듬 고정 */
const TYPING_MS = 700
const GAP_MS = 500

export function useInsightChat() {
  const [messages, setMessages] = useState<InsightMsg[]>([])
  const [chart, setChart] = useState<InsightChartState>({ kind: 'projection' })
  const [typing, setTyping] = useState(false)
  const timers = useRef<number[]>([])
  const seq = useRef(0)

  const push = useCallback((reply: Reply) => {
    const id = `m${++seq.current}`
    setMessages((prev) => [...prev, { ...reply, id }])
    if (reply.chart) {
      const next = reply.chart
      // 맥북 시뮬은 비교 중이던 메이트 선을 유지한다 — 격차 변화가 시연 포인트
      setChart((prev) =>
        next.kind === 'sim-macbook' && prev.kind === 'compare'
          ? { kind: 'sim-macbook', targetId: prev.targetId }
          : next,
      )
    }
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

  /** 그래프 우상단 '비교' — 대상 선택/해제 (null이면 내 투영으로 복귀) */
  const setCompare = useCallback((targetId: string | null) => {
    setChart(targetId ? { kind: 'compare', targetId } : { kind: 'projection' })
  }, [])

  /** 비교 시트에서 대상을 고름 — 차트 전환 + "시뮬레이션 완성" 채팅 발화 */
  const completeCompare = useCallback(
    (targetId: string) => {
      const t = COMPARE_TARGETS.find((x) => x.id === targetId)
      if (!t) return
      respond(compareDoneReplies(t.id))
    },
    [respond],
  )

  /* ---- 저장·다시보기 ---- */
  const [sessions, setSessions] = useState<SavedSession[]>(PRESET_SESSIONS)
  const [viewing, setViewing] = useState<SavedSession | null>(null)

  /** 현재 대화를 세션으로 저장 — 성공 여부 반환(토스트용) */
  const saveSession = useCallback((): boolean => {
    if (viewing || messages.length === 0) return false
    const session: SavedSession = {
      id: `saved-${++seq.current}`,
      title: messages.find((m) => m.role === 'user')?.text ?? '오늘의 총평',
      savedAt: `${DEMO_TODAY.getMonth() + 1}월 ${DEMO_TODAY.getDate()}일`,
      messages,
    }
    setSessions((prev) => [session, ...prev])
    return true
  }, [messages, viewing])

  const openSession = useCallback((s: SavedSession) => setViewing(s), [])
  const newChat = useCallback(() => setViewing(null), [])

  // 다시보기 중에는 저장된 대화·그 대화의 마지막 차트 상태를 보여준다
  const viewingChart: InsightChartState | null = viewing
    ? ([...viewing.messages].reverse().find((m) => m.chart)?.chart ?? { kind: 'projection' })
    : null

  return {
    messages: viewing?.messages ?? messages,
    chart: viewingChart ?? chart,
    typing: viewing ? false : typing,
    send,
    setSavingMonthly,
    setCompare,
    completeCompare,
    sessions,
    viewing,
    saveSession,
    openSession,
    newChat,
  }
}
