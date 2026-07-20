import { ChevronRight } from 'lucide-react'
import { FEED_GROUPS } from '../../data/social'
import { useMouseScroll } from '../../shared/ui/useMouseScroll'

interface Props {
  selected: string | null
  onSelect: (id: string | null) => void
}

/** "그룹 보기" 가로 카드 — 탭하면 선택 토글, 선택 시 스토리가 그 그룹 기준으로 필터된다 */
export function GroupRow({ selected, onSelect }: Props) {
  const scrollRef = useMouseScroll()
  return (
    <section className="mt-4">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-section font-bold text-ink">그룹 보기</h2>
        <button type="button" className="flex items-center text-body font-semibold text-ink-soft">
          더보기
          <ChevronRight size={14} />
        </button>
      </div>

      {/* pt/pb — 스크롤 컨테이너가 선택 링(box-shadow)을 자르지 않게 여백 확보 */}
      <div
        ref={scrollRef}
        className="mt-1.5 flex cursor-grab gap-2.5 overflow-x-auto px-5 pb-1.5 pt-1 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {FEED_GROUPS.map((g) => {
          const active = selected === g.id
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(active ? null : g.id)}
              className={`w-[108px] shrink-0 rounded-card px-3 py-3 text-left transition-all active:scale-[0.98] ${
                active ? 'clay-pressed bg-point/80 ring-2 ring-saving' : 'clay-card'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                  active ? 'bg-saving/15 text-saving' : 'bg-point/55'
                }`}
              >
                {g.emoji}
              </span>
              <p className="mt-2 text-body font-bold leading-tight text-ink">{g.label}</p>
              <p className="mt-0.5 truncate text-micro text-ink-soft">{g.desc}</p>
              <p className="mt-1 text-caption font-semibold text-saving">
                {g.members.toLocaleString()}명
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
