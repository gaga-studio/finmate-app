const BASE = import.meta.env.VITE_API_URL ?? ''

export const isServerMode = (): boolean => BASE !== ''

const TOKEN_KEY = 'finmate-token'

export function token(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

function setToken(value: string) {
  sessionStorage.setItem(TOKEN_KEY, value)
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number) { super(`서버 응답 ${status}`); this.status = status }
}

let refreshing: Promise<void> | null = null
async function call<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const t = token()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 401 && retry && !path.startsWith('/api/v1/auth/')) {
    refreshing ??= call<{ accessToken: string }>('/api/v1/auth/refresh', { method: 'POST' }, false)
      .then(session => setToken(session.accessToken))
      .finally(() => { refreshing = null })
    await refreshing
    return call<T>(path, init, false)
  }
  if (!res.ok) throw new ApiError(res.status)
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

/** 공개 합성 데이터만 가진 로컬 데모 계정을 재사용한다. */
export async function ensureSession(): Promise<void> {
  if (token()) return
  const credentials = { email: 'demo@finmate.example', password: 'finmate-local-demo-2026' }
  const login = () => call<{ accessToken: string }>('/api/v1/auth/login', {
    method: 'POST', body: JSON.stringify(credentials),
  })
  try {
    setToken((await login()).accessToken)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    try {
      const session = await call<{ accessToken: string }>('/api/v1/auth/signup', {
        method: 'POST', body: JSON.stringify({ ...credentials, displayName: '합성 데이터 체험' }),
      })
      setToken(session.accessToken)
    } catch (signupError) {
      if (!(signupError instanceof ApiError) || signupError.status !== 409) throw signupError
      setToken((await login()).accessToken)
    }
  }
}

export interface ServerBudget {
  limit: number
  spent: number
  remaining: number
  pct: number
}

export interface ServerSpend {
  category: string
  merchant: string
  amount: number
  date: string
}

export interface ServerOverview {
  personaId: string
  referenceDate: string
  period: string
  start: string
  end: string
  budget: ServerBudget | null
  saved: number
  invested: number
  earned: number
  topSpends: ServerSpend[]
  dataStatus: 'AVAILABLE' | 'NO_DATA'
  source: 'SYNTHETIC'
  dataFrom: string
  dataTo: string
}

export const api = {
  overview: (period: string, date?: string) => call<ServerOverview>(`/api/v1/me/overview?period=${period}${date ? `&date=${date}` : ''}`),
  peers: (month?: string) => call<PeerComparison>(`/api/v1/me/peers${month ? `?month=${month}` : ''}`),
  transactions: (period: string, date: string, page = 0) => call<TransactionPage>(`/api/v1/me/transactions?period=${period}&date=${date}&page=${page}&size=20`),
  groups: () => call<unknown>('/api/v1/me/feed/groups'),
  missions: () => call<unknown>('/api/v1/me/missions'),
  projection: () => call<unknown>('/api/v1/me/projection'),
}

export interface PeerComparison {
  month: string; myBand: string; mySpend: number | null; peerAvgSpend: number | null
  percentile: number | null; peerCount: number; dataStatus: 'AVAILABLE' | 'NO_DATA'; source: 'SYNTHETIC'
  bands: { label: string; members: number; avgSpend: number; avgSaved: number }[]
}
export interface TransactionPage {
  items: { id: number; date: string; merchant: string; amount: number; category: string; flow: string }[]
  total: number; page: number; size: number; dataStatus: 'AVAILABLE' | 'NO_DATA'; source: 'SYNTHETIC'
}
