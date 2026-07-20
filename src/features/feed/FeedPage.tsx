import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Bell, Search } from 'lucide-react'
import { GroupRow } from './GroupRow'
import { StoryGrid } from './StoryGrid'
import { StoryOverlay } from './StoryOverlay'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { STORIES } from '../../data/social'
import { PageTitle } from '../../shared/ui/PageTitle'

type StorySort = 'popular' | 'recent'

export function FeedPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [sort, setSort] = useState<StorySort>('popular')
  const [openStory, setOpenStory] = useState<string | null>(null)

  const stories = useMemo(() => {
    const filtered = selectedGroup
      ? STORIES.filter((s) => s.groupIds.includes(selectedGroup))
      : STORIES
    return [...filtered].sort((a, b) =>
      sort === 'popular' ? b.likes - a.likes : b.postedAt.localeCompare(a.postedAt),
    )
  }, [selectedGroup, sort])

  return (
    <div className="relative min-h-full">
      <header className="relative flex items-center justify-between px-5 pb-1 pt-14">
        <PageTitle>피드</PageTitle>
        <img src="/finmate-logo.png" alt="FinMate" className="h-7 w-auto" />
        <button
          type="button"
          className="clay-card flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform active:scale-95"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* 그룹 찾아보기 검색바 (정적) */}
      <div className="clay-card mx-5 mt-2 flex items-center gap-2 rounded-full px-4 py-2.5">
        <Search size={16} className="text-ink-faint" />
        <span className="text-body font-medium text-ink-faint">그룹 찾아보기</span>
      </div>

      <GroupRow selected={selectedGroup} onSelect={setSelectedGroup} />

      <section className="mt-5 pb-6">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-section font-bold text-ink">오늘의 스토리</h2>
          <SegmentedControl
            id="story-sort"
            items={[
              { value: 'popular' as const, label: '인기순' },
              { value: 'recent' as const, label: '최신순' },
            ]}
            value={sort}
            onChange={setSort}
          />
        </div>

        <StoryGrid stories={stories} openId={openStory} onOpen={setOpenStory} />
      </section>

      <AnimatePresence>
        {openStory !== null && (
          <StoryOverlay story={STORIES.find((s) => s.id === openStory)!} onClose={() => setOpenStory(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
