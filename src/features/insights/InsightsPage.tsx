import { useState } from 'react'
import { Bell, Bookmark, Menu } from 'lucide-react'
import { ChartPanel } from './ChartPanel'
import { ChatThread } from './ChatThread'
import { ChatInput } from './ChatInput'
import { useInsightChat } from './useInsightChat'

export function InsightsPage() {
  const chat = useInsightChat()
  const [draft, setDraft] = useState('')
  const [chipsOpen, setChipsOpen] = useState(false)

  const insertTemplate = (text: string) => {
    setDraft(text)
    setChipsOpen(false)
  }

  const send = () => {
    chat.send(draft)
    setDraft('')
    setChipsOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-5 pb-1 pt-14">
        <img src="/finmate-logo.png" alt="FinMate" className="h-7 w-auto" />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      <ChartPanel state={chat.chart} onTemplate={insertTemplate} />

      {/* 총평 헤더 — 좌 햄버거(저장된 대화) · 우 저장 */}
      <div className="flex items-center justify-between px-5 pb-1 pt-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="저장된 대화"
        >
          <Menu size={15} />
        </button>
        <h2 className="text-section font-bold text-ink">오늘의 총평</h2>
        <button
          type="button"
          className="flex h-8 items-center gap-1 rounded-full bg-elevated px-3 text-caption font-bold text-ink shadow-soft"
        >
          <Bookmark size={13} />
          저장
        </button>
      </div>

      <ChatThread
        messages={chat.messages}
        typing={chat.typing}
        onChip={insertTemplate}
        onSlider={chat.setSavingMonthly}
      />

      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={send}
        chipsOpen={chipsOpen}
        onToggleChips={() => setChipsOpen((v) => !v)}
        onChip={insertTemplate}
      />
    </div>
  )
}
