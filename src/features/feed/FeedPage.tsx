import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Bell, Search } from 'lucide-react'
import { GroupRow } from './GroupRow'
import { StoryGrid } from './StoryGrid'
import { StoryOverlay } from './StoryOverlay'
import { ProfileSheet } from './ProfileSheet'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { STORIES } from '../../data/social'
import type { ProfileSummary } from '../../data/types'

type StorySort = 'popular' | 'recent'

export function FeedPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [sort, setSort] = useState<StorySort>('popular')
  const [openStory, setOpenStory] = useState<string | null>(null)
  const [profileOf, setProfileOf] = useState<ProfileSummary | null>(null)

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
      <header className="flex items-center justify-between px-5 pb-1 pt-14">
        <h1 className="text-title font-extrabold tracking-tight text-ink">finmate</h1>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* 그룹 찾아보기 검색바 (정적) */}
      <div className="mx-5 mt-2 flex items-center gap-2 rounded-full bg-elevated px-4 py-2.5 shadow-soft">
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
          <StoryOverlay
            story={STORIES.find((s) => s.id === openStory)!}
            onClose={() => setOpenStory(null)}
            onProfile={(s) => setProfileOf(s.author)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOf !== null && <ProfileSheet profile={profileOf} onClose={() => setProfileOf(null)} />}
      </AnimatePresence>
    </div>
  )
}
