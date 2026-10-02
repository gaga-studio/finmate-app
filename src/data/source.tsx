import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ensureSession, type ServerOverview } from '../api/client'
import { DEMO_TODAY } from './demo'
import { getBudget as mockBudget, getTopPurchases as mockTop } from './selectors'
import type { Period, Transaction } from './types'

/** 기존 시연은 명시적으로 prototype을 선택한다. 서버 모드는 오류를 화면에 표시한다. */

interface BudgetView {
  limit: number
  spent: number
  remaining: number
  pct: number
}

interface DataSource {
  ready: boolean
  /** 서버에서 읽고 있으면 true. 화면이 밝힐 수 있어야 한다. */
  server: boolean
  error: string | null
  budget(period: Period): BudgetView
  topPurchases(period: Period, n?: number): Transaction[]
  /**
   * 화면의 "오늘".
   *
   * 목 모드는 DEMO_TODAY(2026-07-23) 고정이고, 서버 모드는 그 사람의 마지막 거래일이다.
   * 둘이 다르므로 화면이 날짜를 직접 만들면 안 된다 — 머리말은 7월 23일인데 숫자는
   * 7월 13일 것이 뜨는 일이 실제로 있었다.
   */
  today: Date
}

const Ctx = createContext<DataSource | null>(null)

const PERIODS: Period[] = ['daily', 'weekly', 'monthly']

/** "2026-07-13" → 로컬 자정. new Date(문자열)은 UTC로 읽어 하루가 밀린다. */
function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function DataSourceProvider({ children, prototype = false }: { children: ReactNode; prototype?: boolean }) {
  const [loaded, setLoaded] = useState<Record<string, ServerOverview> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (prototype) return
    let cancelled = false
    void (async () => {
      try {
        await ensureSession()
        // 세 기간을 한 번에 받아 둔다. 기간 전환은 스와이프라 그때 부르면 늦다.
        const results = await Promise.all(PERIODS.map((p) => api.overview(p)))
        if (cancelled) return
        setLoaded(Object.fromEntries(PERIODS.map((p, i) => [p, results[i]])))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '서버를 부르지 못했습니다')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [prototype])

  if (!prototype && error) return <div role="alert">데이터를 불러오지 못했습니다. 서버 연결을 확인한 뒤 새로고침해 주세요.</div>
  if (!prototype && loaded === null) return <div role="status">데이터를 불러오는 중입니다.</div>
  const server = !prototype && loaded !== null

  const value: DataSource = {
    // 목 모드는 동기라 언제나 준비돼 있다. 서버 모드만 기다린다.
    ready: prototype || loaded !== null || error !== null,
    server,
    error,
    today: server ? parseDate(loaded.daily.referenceDate) : DEMO_TODAY,
    budget: (period) => {
      if (!server) return mockBudget(period)
      const budget = loaded[period].budget
      if (!budget) throw new Error('자료가 없는 기간입니다')
      return budget
    },
    topPurchases: (period, n = 5) =>
      server
        ? loaded[period].topSpends.slice(0, n).map((s, i) => ({
            id: `srv-${period}-${i}`,
            date: s.date,
            merchant: s.merchant,
            // 서버는 "쓴 금액"을 양수로 준다. 화면의 Transaction은 지출을 음수로 본다.
            amount: -s.amount,
            category: s.category as Transaction['category'],
          }))
        : mockTop(period, n),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData(): DataSource {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('DataSourceProvider 안에서만 쓸 수 있습니다')
  }
  return ctx
}
