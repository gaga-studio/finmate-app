import { ART } from '../../data/art-manifest'

interface Props {
  size?: number
  className?: string
}

/**
 * 내 프로필 아바타 — 예산 팝아트(커피 마시는 여성)에서 얼굴 영역만
 * CSS 크롭으로 프레이밍한다. 원본 이미지가 교체되면 origin/scale만 조정.
 */
export function UserAvatar({ size = 44, className }: Props) {
  return (
    <div
      className={`clay-card shrink-0 overflow-hidden rounded-full ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <img
        src={ART.wrapped['budget-daily']}
        alt="프로필"
        className="h-full w-full object-cover"
        style={{ transform: 'scale(2.3)', transformOrigin: '45% 27%' }}
      />
    </div>
  )
}
