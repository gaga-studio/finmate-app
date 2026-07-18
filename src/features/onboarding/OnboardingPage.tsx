import { useNavigate } from 'react-router-dom'

export function OnboardingPage() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full min-h-dvh flex-col items-center justify-center gap-6 px-5 sm:min-h-0">
      <h1 className="text-2xl font-bold">finmate</h1>
      <p className="text-sm text-ink-soft">온보딩 · 스크롤리텔링 (M4)</p>
      <button
        type="button"
        onClick={() => navigate('/my')}
        className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white"
      >
        시작하기
      </button>
    </div>
  )
}
