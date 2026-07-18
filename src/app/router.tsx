import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PhoneFrame } from './layouts/PhoneFrame'
import { TabLayout } from './layouts/TabLayout'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { MyPage } from '../features/my/MyPage'
import { SocialPage } from '../features/social/SocialPage'
import { GrowthPage } from '../features/growth/GrowthPage'
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
      { path: '/my', element: <MyPage /> },
      { path: '/social', element: <SocialPage /> },
      { path: '/growth', element: <GrowthPage /> },
      { path: '/diary', element: <DiaryPage /> },
    ],
  },
])
