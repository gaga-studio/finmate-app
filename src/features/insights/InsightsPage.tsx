import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, Bookmark, Menu, RotateCcw } from 'lucide-react'
import { ChartPanel } from './ChartPanel'
import { ChatThread } from './ChatThread'
import { ChatInput } from './ChatInput'
import { SavedChatsPanel } from './SavedChatsPanel'
import { ComparePickerSheet } from './ComparePickerSheet'
import { ReportOverlay } from './ReportOverlay'
import { useInsightChat } from './useInsightChat'
import { snappy } from '../../shared/motion/springs'

export function InsightsPage() {
  const chat = useInsightChat()
  const [draft, setDraft] = useState('')
  const [chipsOpen, setChipsOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState<{ filter?: 'mate' | 'group' } | null>(null)
  const [report, setReport] = useState<{ variant?: 'macbook' } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = (text: string) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }

  const insertTemplate = (text: string) => {
    setDraft(text)
    setChipsOpen(false)
  }

  const send = () => {
    chat.send(draft)
    setDraft('')
    setChipsOpen(false)
  }

  const viewing = chat.viewing !== null

  return (
    // 탭 레이아웃의 하단 여백(6rem)을 넘어 입력바가 탭바(62px+안전영역) 바로 위에 붙는다
    <div className="relative flex h-[calc(100%+6rem)] flex-col pb-[calc(62px+env(safe-area-inset-bottom,0px))]">
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

      <ChartPanel state={chat.chart} />

      {/* 총평 헤더 — 좌 햄버거(저장된 대화) · 우 저장/새 대화 */}
      <div className="flex items-center justify-between px-5 pb-1 pt-3">
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="저장된 대화"
        >
          <Menu size={15} />
        </button>
        <h2 className="text-section font-bold text-ink">{viewing ? '대화 다시보기' : '오늘의 총평'}</h2>
        {viewing ? (
          <button
            type="button"
            onClick={chat.newChat}
            className="flex h-8 items-center gap-1 rounded-full bg-accent px-3 text-caption font-bold text-white shadow-soft"
          >
            <RotateCcw size={12} />
            새 대화
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (chat.saveSession()) showToast('오늘의 대화를 저장했어요')
            }}
            className="flex h-8 items-center gap-1 rounded-full bg-elevated px-3 text-caption font-bold text-ink shadow-soft"
          >
            <Bookmark size={13} />
            저장
          </button>
        )}
      </div>

      <ChatThread
        messages={chat.messages}
        typing={chat.typing}
        onChip={insertTemplate}
        onOption={chat.send}
        onSlider={chat.setSavingMonthly}
        onReport={(variant) => setReport({ variant })}
        onComparePick={(kind) => !viewing && setCompareOpen({ filter: kind })}
        readOnly={viewing}
      />

      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={send}
        chipsOpen={chipsOpen}
        onToggleChips={() => setChipsOpen((v) => !v)}
        onChip={insertTemplate}
        disabled={viewing}
      />

      <AnimatePresence>
        {panelOpen && (
          <SavedChatsPanel sessions={chat.sessions} onOpen={chat.openSession} onClose={() => setPanelOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {report && <ReportOverlay variant={report.variant} onClose={() => setReport(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {compareOpen && (
          <ComparePickerSheet
            selectedId={chat.chart.kind === 'compare' ? chat.chart.targetId : null}
            filter={compareOpen.filter}
            onSelect={(id) => (id ? chat.completeCompare(id) : chat.setCompare(null))}
            onClose={() => setCompareOpen(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.p
            className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full bg-black/80 px-4 py-2 text-body font-semibold text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={snappy}
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
