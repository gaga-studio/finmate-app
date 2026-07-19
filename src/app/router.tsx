import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PhoneFrame } from './layouts/PhoneFrame'
import { TabLayout } from './layouts/TabLayout'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { MyPage } from '../features/my/MyPage'
import { FeedPage } from '../features/feed/FeedPage'
import { GrowthPage } from '../features/growth/GrowthPage'
import { MissionsPage } from '../features/missions/MissionsPage'
import { DiaryPage } from '../features/diary/DiaryPage'

export const router = createBrowserRouter([
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
      <PhoneFrame>
        <TabLayout />
      </PhoneFrame>
    ),
    children: [
      { path: '/', element: <Navigate to="/my" replace /> },
      { path: '/feed', element: <FeedPage /> },
      { path: '/my', element: <MyPage /> },
      { path: '/growth', element: <GrowthPage /> },
      { path: '/missions', element: <MissionsPage /> },
      { path: '/diary', element: <DiaryPage /> },
    ],
  },
])
