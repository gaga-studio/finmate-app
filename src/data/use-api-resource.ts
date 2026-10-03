import { useCallback, useEffect, useState } from 'react'
import { ensureSession } from '../api/client'

/** 이전 기간의 값이 새 기간에 보이지 않도록 응답을 조회 키와 함께 보관한다. */
export function useApiResource<T>(key: string, enabled: boolean, load: () => Promise<T>) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{ key: string; data: T | null; error: boolean; loading: boolean }>({ key: '', data: null, error: false, loading: true })
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setState({ key, data: null, error: false, loading: true })
    void ensureSession().then(load).then(
      data => { if (!cancelled) setState({ key, data, error: false, loading: false }) },
      () => { if (!cancelled) setState({ key, data: null, error: true, loading: false }) },
    )
    return () => { cancelled = true }
  }, [key, enabled, load, revision])
  const reload = useCallback(() => setRevision(value => value + 1), [])
  return { ...(state.key === key ? state : { data: null, error: false, loading: true }), reload }
}
