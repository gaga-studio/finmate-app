import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ensureSession, isServerMode, type ServerOverview } from '../api/client'
import { DEMO_TODAY } from './demo'
import { getBudget as mockBudget, getTopPurchases as mockTop } from './selectors'
import type { Period, Transaction } from './types'

/**
 * 화면이 읽는 값을 어디서 가져올지 한 곳에서 정한다.
 *
 * 두 소스를 남겨 둔 이유가 있다. 목 모드는 촬영 재현성 때문이다 —
 * 고정 날짜·고정 시드라 어느 날 촬영해도 화면이 같다. 그 요구사항은 사라지지 않았다.
 * 서버 모드는 `VITE_API_URL`이 있을 때만 켜진다.
 *
 * 컴포넌트는 어느 쪽인지 몰라도 되게 같은 모양을 돌려준다.
 * 그래서 이 파일이 두 세계의 유일한 접점이고, 늘어나야 할 곳도 여기뿐이다.
 */

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

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<Record<string, ServerOverview> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isServerMode()) return
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
  }, [])

  const server = isServerMode() && loaded !== null

  const value: DataSource = {
    // 목 모드는 동기라 언제나 준비돼 있다. 서버 모드만 기다린다.
    ready: !isServerMode() || loaded !== null || error !== null,
    server,
    error,
    today: server ? parseDate(loaded.daily.referenceDate) : DEMO_TODAY,
    budget: (period) => (server ? loaded[period].budget : mockBudget(period)),
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
