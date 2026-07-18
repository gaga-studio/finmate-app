import type { FeedItem, ProfileSummary } from './types'

export const MATES: ProfileSummary[] = [
  { id: 'mate1', nickname: '절약왕참치', emoji: '🐟', bio: '월급 200 자취생', badges: ['소비방어 상위 12%', '3주 연속 미션'], similarity: 0.91 },
  { id: 'mate2', nickname: '커피끊은사람', emoji: '☕️', bio: '카페 지출 -70% 달성', badges: ['카페 절약러'], similarity: 0.87 },
  { id: 'mate3', nickname: '월급루팡아님', emoji: '🦝', bio: '사회초년생 2년차', badges: ['첫 청약 납입'], similarity: 0.84 },
]

export const FRIENDS: ProfileSummary[] = [
  { id: 'fr1', nickname: '민수', emoji: '🏀', bio: '대학 동기', badges: ['이번 주 저축 3회'] },
  { id: 'fr2', nickname: '유진', emoji: '🎨', bio: '고등학교 친구', badges: ['첫 ETF 매수'] },
  { id: 'fr3', nickname: '하람', emoji: '🎸', bio: '동아리', badges: ['무지출 4일'] },
]

export const GROUPS: ProfileSummary[] = [
  { id: 'gr1', nickname: '사회초년생 모임', emoji: '🌱', bio: '멤버 1,204명 · 평균 저축률 23%', badges: ['이번 주 미션 달성률 61%'] },
  { id: 'gr2', nickname: '여행자금 모으기', emoji: '🧳', bio: '멤버 842명 · 평균 목표 진척 48%', badges: ['7월 인기 그룹'] },
  { id: 'gr3', nickname: '투자 입문반', emoji: '📈', bio: '멤버 2,310명 · 이번 달 첫 투자 312명', badges: ['O/X 퀴즈 정답률 78%'] },
]

export const FEED: FeedItem[] = [
  {
    id: 'feed-fomo',
    kind: 'fomo',
    text: '나와 같은 지역 20대의 67%가 청약통장 납입을 시작했어요',
    stat: '나는 아직 시작 전이에요',
    cta: '1분 미션으로 시작하기',
  },
  {
    id: 'feed-mate-weekly',
    kind: 'wrapped',
    author: { id: 'mate1', nickname: '절약왕참치', emoji: '🐟', bio: '', badges: [] },
    period: 'weekly',
    headline: '배달을 2번 참고,\n비상금 10만원을 채운 한 주',
    artKey: 'feed-mate-weekly',
  },
  {
    id: 'feed-friend-highlight',
    kind: 'highlight',
    author: { id: 'fr2', nickname: '유진', emoji: '🎨', bio: '', badges: [] },
    text: '유진님이 첫 ETF를 샀어요',
    stat: 'TIGER 미국S&P500 · 5만원',
  },
  {
    id: 'feed-friend-diary',
    kind: 'diary',
    author: { id: 'fr1', nickname: '민수', emoji: '🏀', bio: '', badges: [] },
    date: '2026-07-17',
    caption: '월급날 전날, 냉장고 파먹기로 버틴 하루',
    artKey: 'feed-friend-diary',
  },
  {
    id: 'feed-group-highlight',
    kind: 'highlight',
    author: { id: 'gr2', nickname: '여행자금 모으기', emoji: '🧳', bio: '', badges: [] },
    text: '그룹 평균 목표 진척이 48%를 넘었어요',
    stat: '나의 위치: 상위 41%',
  },
]
