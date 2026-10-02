import { SpendingPage } from '../features/spending/SpendingPage'
import { DataSourceProvider } from '../data/source'
import { createBrowserRouter } from 'react-router-dom'
import { PhoneFrame } from './layouts/PhoneFrame'
import { TabLayout } from './layouts/TabLayout'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { MyPage } from '../features/my/MyPage'
import { FeedPage } from '../features/feed/FeedPage'
import { InsightsPage } from '../features/insights/InsightsPage'
import { MissionsPage } from '../features/missions/MissionsPage'
import { DiaryPage } from '../features/diary/DiaryPage'
import { MateProfilePage } from '../features/mate/MateProfilePage'

export const router = createBrowserRouter([
  { path: '/', element: <SpendingPage /> },
  {
    path: '/onboarding',
    element: (
      <PhoneFrame>
        <OnboardingPage />
      </PhoneFrame>
    ),
  },
  {
    element: (
      <DataSourceProvider prototype>
        <div className="prototype-notice">기존 팀 시연 화면 · 정적 예시 데이터 <a href="/">소비 조회 데모로 돌아가기</a></div>
        <PhoneFrame><TabLayout /></PhoneFrame>
      </DataSourceProvider>
    ),
    children: [
      { path: '/feed', element: <FeedPage /> },
      { path: '/my', element: <MyPage /> },
      { path: '/insights', element: <InsightsPage /> },
      { path: '/missions', element: <MissionsPage /> },
      { path: '/diary', element: <DiaryPage /> },
      { path: '/mate/:id', element: <MateProfilePage /> },
    ],
  },
])
