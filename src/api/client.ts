/**
 * finmate-api 클라이언트.
 *
 * 서버 주소가 없으면 아무것도 하지 않는다 — 목 모드로 도는 것이 기본이고,
 * 그건 촬영 재현성(고정 날짜·고정 시드) 때문에 남겨야 하는 동작이다.
 */
const BASE = import.meta.env.VITE_API_URL ?? ''

export const isServerMode = (): boolean => BASE !== ''

const TOKEN_KEY = 'finmate-token'

export function token(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

function setToken(value: string) {
  sessionStorage.setItem(TOKEN_KEY, value)
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = token()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`${path} 응답 ${res.status}`)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

/**
 * 데모용 계정을 만들어 로그인한다.
 *
 * 가입할 때 서버가 합성 인구 한 명을 붙여 주므로, 이 한 번으로 화면에 채울 원장이 생긴다.
 * 로그인 화면이 아직 없어 여기서 만든다 — 그 화면이 생기면 이 함수가 사라질 자리다.
 */
export async function ensureSession(): Promise<void> {
  if (token()) return
  const suffix = `demo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const res = await call<{ accessToken: string }>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: `${suffix}@example.com`,
      password: 'a-long-enough-password',
      displayName: '지혜',
    }),
  })
  setToken(res.accessToken)
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
  budget: ServerBudget
  saved: number
  invested: number
  earned: number
  topSpends: ServerSpend[]
}

export const api = {
  overview: (period: string) => call<ServerOverview>(`/api/v1/me/overview?period=${period}`),
  peers: () => call<unknown>('/api/v1/me/peers'),
  groups: () => call<unknown>('/api/v1/me/feed/groups'),
  missions: () => call<unknown>('/api/v1/me/missions'),
  projection: () => call<unknown>('/api/v1/me/projection'),
}
