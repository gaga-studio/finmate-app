import { ChevronRight } from 'lucide-react'
import { FEED_GROUPS } from '../../data/social'

interface Props {
  selected: string | null
  onSelect: (id: string | null) => void
}

/** "그룹 보기" 가로 카드 — 탭하면 선택 토글, 선택 시 스토리가 그 그룹 기준으로 필터된다 */
export function GroupRow({ selected, onSelect }: Props) {
  return (
    <section className="mt-4">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-[15px] font-bold text-ink">그룹 보기</h2>
        <button type="button" className="flex items-center text-[12px] font-semibold text-ink-soft">
          더보기
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-2.5 flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FEED_GROUPS.map((g) => {
          const active = selected === g.id
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(active ? null : g.id)}
              className={`w-[108px] shrink-0 rounded-card px-3 py-3 text-left shadow-soft transition-colors ${
                active ? 'bg-accent/12 ring-2 ring-accent' : 'bg-elevated'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                  active ? 'bg-accent/15' : 'bg-ink/5'
                }`}
              >
                {g.emoji}
              </span>
              <p className="mt-2 text-[13px] font-bold leading-tight text-ink">{g.label}</p>
              <p className="mt-0.5 truncate text-[10.5px] text-ink-soft">{g.desc}</p>
              <p className="mt-1 text-[11px] font-semibold text-accent">
                {g.members.toLocaleString()}명
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
