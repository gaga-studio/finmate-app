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

/** AI 답변 리듬 — 길이와 위젯 여부에 따라 조금씩 달라져 채팅처럼 보이게 한다 */
const THINKING_START_MS = 280
const MIN_TYPING_MS = 620
const MAX_TYPING_MS = 1850
const BETWEEN_BUBBLES_MS = 420

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function typingDuration(reply: Reply, index: number) {
  if (!reply.text) return 180
  const textLength = reply.text?.length ?? 0
  const chartBonus = reply.chart ? 240 : 0
  return clamp(MIN_TYPING_MS + textLength * 24 + chartBonus + index * 70, MIN_TYPING_MS, MAX_TYPING_MS)
}

function bubbleGap(reply: Reply) {
  return reply.text ? BETWEEN_BUBBLES_MS : 120
}

export function useInsightChat() {
  const [messages, setMessages] = useState<InsightMsg[]>([])
  const [chart, setChart] = useState<InsightChartState>({ kind: 'projection' })
  const [typing, setTyping] = useState(false)
  /** 마지막 비교 대상 — 시나리오 버튼이 그래프를 재구성할 때 쓴다 */
  const lastTarget = useRef<string | undefined>(undefined)
  const timers = useRef<number[]>([])
  const seq = useRef(0)

  const push = useCallback((reply: Reply) => {
    const id = `m${++seq.current}`
    setMessages((prev) => [...prev, { ...reply, id }])
    if (reply.chart) {
      const next = reply.chart
      // 맥북/습관 시뮬은 비교 중이던 메이트 선을 유지한다 — 격차 변화가 시연 포인트
      setChart((prev) => {
        if (next.kind === 'sim-macbook' && next.targetId === undefined) {
          const inherited =
            prev.kind === 'compare' || prev.kind === 'sim-macbook' ? prev.targetId : undefined
          if (inherited) lastTarget.current = inherited
          return { ...next, targetId: inherited }
        }
        if ('targetId' in next && next.targetId) lastTarget.current = next.targetId
        return next
      })
    }
  }, [])

  /** AI 응답 시퀀스 — 생각하는 틈, 타이핑, 버블 간 호흡을 순차 예약 */
  const respond = useCallback(
    (replies: Reply[]) => {
      let elapsed = THINKING_START_MS
      replies.forEach((r, i) => {
        if (r.text) {
          timers.current.push(
            window.setTimeout(() => {
              setTyping(true)
            }, elapsed),
          )
        }

        elapsed += typingDuration(r, i)

        timers.current.push(
          window.setTimeout(() => {
            push(r)
            if (r.text) setTyping(false)
          }, elapsed),
        )

        elapsed += bubbleGap(r)
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
    if (targetId) lastTarget.current = targetId
    setChart(targetId ? { kind: 'compare', targetId } : { kind: 'projection' })
  }, [])

  /** 시나리오 버튼 — 그대로/맥북 반영/습관 적용 그래프를 자유 전환 */
  const applyScenario = useCallback((kind: 'base' | 'macbook' | 'habit') => {
    const targetId = lastTarget.current
    if (kind === 'base') {
      setChart(targetId ? { kind: 'compare', targetId } : { kind: 'projection' })
    } else {
      setChart({ kind: 'sim-macbook', targetId, habit: kind === 'habit' })
    }
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
    applyScenario,
    completeCompare,
    sessions,
    viewing,
    saveSession,
    openSession,
    newChat,
  }
}
