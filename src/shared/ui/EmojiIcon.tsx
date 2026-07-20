import {
  BatteryCharging,
  CupSoda,
  Dna,
  Dumbbell,
  Flower2,
  Hospital,
  Hotel,
  Landmark,
  LifeBuoy,
  Lightbulb,
  Newspaper,
  Package,
  Pill,
  Scissors,
  Shirt,
  Sun,
  Ticket,
  UserRound,
  Wind,
  type LucideIcon,
} from 'lucide-react'

/**
 * 아이콘 슬롯 중앙 매핑 — 클레이 3D 에셋(public/icons) 우선,
 * 에셋이 없는 이모지는 lucide 폴백, 최후엔 텍스트.
 * 아바타는 이모지 충돌(☕️·🥐)이 있어 author id 기반 별도 매핑.
 */
const ICON = (name: string) => `/icons/icon-${name}.png`

const EMOJI_SRC: Record<string, string> = {
  // 소비 카테고리
  '🍚': ICON('food'),
  '☕️': ICON('cafe'),
  '🚌': ICON('transport'),
  '🛍️': ICON('shopping'),
  '📺': ICON('subscription'),
  '🎳': ICON('entertainment'),
  '🏝️': ICON('saving'),
  '📈': ICON('invest'),
  '💌': ICON('income'),
  // 자산·저축
  '🏠': ICON('housing'),
  '💰': ICON('deposit'),
  '✈️': ICON('travel-fund'),
  '🏦': ICON('parking-bank'),
  '🛡️': ICON('emergency'),
  '🎓': ICON('education'),
  // 위시
  '🧳': ICON('carrier'),
  '🎧': ICON('earbuds'),
  '📷': ICON('film-camera'),
  '⌚️': ICON('smartwatch'),
  '💻': ICON('laptop'),
  // 미션·상점
  '🎯': ICON('target'),
  '🧠': ICON('quiz'),
  '📉': ICON('invest-quiz'),
  '🍱': ICON('dosirak'),
  '🥐': ICON('croissant'),
  '🏪': ICON('store'),
  '🍗': ICON('chicken'),
  '🎬': ICON('movie'),
  // 메이트 카테고리 풀
  '🍜': ICON('dining'),
  '👟': ICON('fashion'),
  '🛒': ICON('groceries'),
  '💄': ICON('beauty'),
  '🚇': ICON('subway'),
  '📊': ICON('domestic-etf'),
  '🌎': ICON('global-etf'),
  '🏢': ICON('stock'),
  '🚀': ICON('startup'),
  // 피드 그룹·소득 출처
  '💼': ICON('income-group'),
  '🧾': ICON('spend-group'),
  '🏙️': ICON('seoul'),
  '⭐️': ICON('following'),
  '🥕': ICON('carrot-sale'),
}

/** author id / 비교 대상 id → 아바타 에셋 */
const AVATAR_SRC: Record<string, string> = Object.fromEntries(
  ['coffee', 'bruncher', 'squirrel', 'closet', 'singer', 'sofa', 'runner', 'paris', 'keys', 'tuna', 'bear', 'raccoon'].flatMap(
    (name) => [
      [`a-${name}`, `/icons/avatar-${name}.png`],
      [`mate-${name}`, `/icons/avatar-${name}.png`],
    ],
  ),
)

/** 클레이 에셋이 없는 이모지의 lucide 폴백 (스토리 top3 라벨 등) */
const EMOJI_LUCIDE: Record<string, LucideIcon> = {
  '📰': Newspaper,
  '☀️': Sun,
  '🌬️': Wind,
  '🎫': Ticket,
  '🏋️': Dumbbell,
  '🏥': Hospital,
  '🏨': Hotel,
  '💊': Pill,
  '💡': Lightbulb,
  '📦': Package,
  '🔋': BatteryCharging,
  '🛟': LifeBuoy,
  '🥤': CupSoda,
  '🧃': CupSoda,
  '🧘': Flower2,
  '🧬': Dna,
  '🧢': Shirt,
  '🧵': Scissors,
  '🪴': Flower2,
  '💵': Landmark,
  '🙋‍♀️': UserRound,
  '👗': Shirt,
}

interface Props {
  emoji: string
  size?: number
  className?: string
  strokeWidth?: number
  /** 아바타 컨텍스트 — author/비교 대상 id (이모지 충돌 회피용 우선 매핑) */
  avatarId?: string
}

export function EmojiIcon({ emoji, size = 16, className, strokeWidth = 2, avatarId }: Props) {
  const src =
    (avatarId ? AVATAR_SRC[avatarId] : undefined) ??
    EMOJI_SRC[emoji] ??
    EMOJI_SRC[emoji.replace('️', '')] ??
    EMOJI_SRC[`${emoji}️`]

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={`select-none object-contain ${className ?? ''}`}
        aria-hidden
      />
    )
  }

  const Icon = EMOJI_LUCIDE[emoji] ?? EMOJI_LUCIDE[emoji.replace('️', '')] ?? EMOJI_LUCIDE[`${emoji}️`]
  if (Icon) return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden />
  return <span className={className}>{emoji}</span>
}
