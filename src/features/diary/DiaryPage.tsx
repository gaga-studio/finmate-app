import { useCallback, useState } from 'react'
import { api, type TransactionPage } from '../../api/client'
import { useData } from '../../data/source'
import { useApiResource } from '../../data/use-api-resource'
import { DataSheet } from '../../shared/ui/DataSheet'
import { ListRow } from '../../shared/ui/ListRow'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayCardsOverlay } from './DayCardsOverlay'
import { DIARY_ART, DIARY_TODAY, DOMINANT_ART } from '../../data/diary'
import { getDayDominant, getDiaryDays } from '../../data/selectors'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { formatKrw, formatKrwCompact, formatKrwSigned } from '../../shared/format/krw'
import { snappy } from '../../shared/motion/springs'

type DiarySort = 'latest' | 'oldest'

export function DiaryPage() {
  const source = useData()
  const [selection, setSelection] = useState<string | null>(null)
  const referenceMonth = `${source.today.getFullYear()}-${String(source.today.getMonth() + 1).padStart(2, '0')}`
  const monthKey = selection ?? (source.server ? referenceMonth : '2026-07')
  const month = Number(monthKey.slice(5))
  const limit = monthKey === referenceMonth ? source.today.getDate() : new Date(Number(monthKey.slice(0, 4)), month, 0).getDate()
  const referenceDate = `${monthKey}-${String(limit).padStart(2, '0')}`
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const changeMonth = (delta: number) => {
    const date = new Date(Number(monthKey.slice(0, 4)), month - 1 + delta, 1)
    setSelection(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    setSelectedDay(null)
  }
  const load = useCallback(async () => {
    const overview = await api.overview('monthly', referenceDate)
    const entries: TransactionPage['items'] = []
    if (overview.dataStatus === 'AVAILABLE') {
      for (let page = 0; ; page++) {
        const response = await api.transactions('monthly', referenceDate, page)
        if (response.dataStatus !== 'AVAILABLE' || response.page !== page || (response.items.length === 0 && entries.length < response.total)) {
          throw new Error('월별 거래를 모두 불러오지 못했습니다.')
        }
        entries.push(...response.items)
        if (entries.length >= response.total) break
      }
    }
    return { overview, entries }
  }, [referenceDate])
  const resource = useApiResource(referenceDate, source.server && source.ready && !source.error, load)
  const [sort, setSort] = useState<DiarySort>('latest')
  const [open, setOpen] = useState(false)
  const prototype = getDiaryDays()
  const records = resource.data?.entries ?? []
  const available = resource.data?.overview.dataStatus === 'AVAILABLE'
  const serverDays = Array.from({ length: limit }, (_, index) => {
    const day = limit - index
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`
    const entries = records.filter(entry => entry.date === dateKey)
    return { day, dateKey, income: entries.filter(entry => entry.flow === '소득').reduce((sum, entry) => sum + entry.amount, 0), spend: entries.filter(entry => entry.flow === '소비').reduce((sum, entry) => sum - entry.amount, 0) }
  })
  const latestDays = source.server ? serverDays : prototype.days
  const totalIncome = source.server ? resource.data?.overview.earned ?? 0 : prototype.totalIncome
  const totalSpend = source.server ? resource.data?.overview.budget?.spent ?? 0 : prototype.totalSpend
  const days = sort === 'latest' ? latestDays : [...latestDays].reverse()
  const todayArt = DOMINANT_ART[getDayDominant(DIARY_TODAY.dateKey)]

  return (
    <div className="relative min-h-full pb-6">
      <header className="relative flex items-center justify-between px-5 pb-3 pt-14">
        <img src="/finmate-logo.png" alt="FinMate" className="h-7 w-auto" />
        <button
          type="button"
          className="clay-card flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform active:scale-95"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* 월 네비 */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={!source.server && month === 6}
          className="clay-pressed flex h-9 w-9 items-center justify-center rounded-full bg-point/45 text-ink-soft disabled:opacity-30"
          aria-label="이전 달"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="w-16 text-center text-title font-extrabold text-ink">{month}월</h1>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={!source.server && month === 7}
          className="clay-pressed flex h-9 w-9 items-center justify-center rounded-full bg-point/45 text-ink-soft disabled:opacity-30"
          aria-label="다음 달"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence mode={source.server ? "wait" : "popLayout"} initial={false}>
        {source.server && (resource.loading || resource.error || source.error || !available) ? (
          <div key={monthKey} className="px-5 pt-12 text-center text-body">
            {resource.error || source.error ? <div role="alert">기록을 불러오지 못했습니다.<button type="button" onClick={() => source.error ? source.reload() : resource.reload()} className="mx-auto mt-3 block font-bold text-saving">다시 불러오기</button></div>
              : resource.loading ? <p role="status">기록을 불러오는 중입니다.</p>
                : <p role="status">자료가 없는 기간입니다. 다른 달을 선택해 주세요.</p>}
          </div>
        ) : !source.server && month === 6 ? (
          <motion.div
            key="june"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={snappy}
            className="px-5 pt-16 text-center"
          >
            <p className="text-section font-bold text-ink-soft">아직 기록이 없는 달이에요</p>
            <p className="mt-2 text-body font-medium text-ink-faint">
              FinMate와 함께한 첫 달은 7월!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={snappy}
          >
            {/* 월 요약 */}
            <p data-testid="diary-summary" className="mt-1 text-center text-caption font-semibold text-ink-soft">
              기록 {days.length}일 · 수입 <b className="text-rise">+{source.server ? formatKrw(totalIncome) : formatKrwCompact(totalIncome)}</b> ·
              지출 <b className="text-fall">-{source.server ? formatKrw(totalSpend) : formatKrwCompact(totalSpend)}</b>
            </p>

            {/* 정렬 토글 */}
            <div className="mt-3 flex justify-center">
              <SegmentedControl
                id="diary-sort"
                items={[
                  { value: 'latest' as const, label: '최신순' },
                  { value: 'oldest' as const, label: '날짜순' },
                ]}
                value={sort}
                onChange={setSort}
              />
            </div>

            {/* 3열 그리드: 오늘만 이미지·탭 가능 */}
            <div className="mt-3 grid grid-cols-3 gap-2.5 px-5">
              {days.map((d, i) => {
                const isToday = d.day === DIARY_TODAY.day
                return (
                  <motion.div
                    key={d.day}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...snappy, delay: Math.min(i * 0.025, 0.3) }}
                  >
                    {source.server ? (
                      <button type="button" aria-label={`${d.day}일 거래 내역`} onClick={() => setSelectedDay(d.dateKey)} className="clay-card relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-2xl p-2.5 text-left">
                        {DIARY_ART[d.day] && <img src={DIARY_ART[d.day]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                        <span className="relative w-fit rounded-full bg-white/90 px-2 text-body font-extrabold text-ink">{d.day}일</span>
                        {DIARY_ART[d.day] ? <TileBadges income={d.income} spend={d.spend} /> : <TileAmounts income={d.income} spend={d.spend} />}
                      </button>
                    ) : isToday ? (
                      <motion.button
                        type="button"
                        layoutId={`diary-${d.day}`}
                        onClick={() => setOpen(true)}
                        whileTap={{ scale: 0.96 }}
                        className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl text-left shadow-soft ring-2 ring-saving"
                        style={{ visibility: open ? 'hidden' : 'visible' }}
                      >
                        <img
                          src={todayArt}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full select-none object-cover"
                          style={{ objectPosition: '50% 18%' }}
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-0.5 text-body font-bold text-white backdrop-blur-sm">
                          {d.day}일 · 오늘
                        </span>
                        <TileBadges income={d.income} spend={d.spend} />
                      </motion.button>
                    ) : DIARY_ART[d.day] ? (
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-soft">
                        <img
                          src={DIARY_ART[d.day]}
                          alt=""
                          loading="lazy"
                          draggable={false}
                          className="absolute inset-0 h-full w-full select-none object-cover"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-0.5 text-body font-bold text-white backdrop-blur-sm">
                          {d.day}일
                        </span>
                        <TileBadges income={d.income} spend={d.spend} />
                      </div>
                    ) : (
                      <div className="clay-card flex aspect-[3/4] w-full flex-col justify-between rounded-2xl p-2.5">
                        <span className="text-body font-extrabold text-ink-faint">{d.day}일</span>
                        <TileAmounts income={d.income} spend={d.spend} />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-4 text-center text-caption font-medium text-ink-faint">
              {source.server ? `${monthKey.slice(0, 4)}년 합성 원장 · 그림은 예시입니다` : '하루가 끝나면 자동으로 기록돼요'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDay && <DataSheet title={`${month}월 ${Number(selectedDay.slice(-2))}일 내역`} onClose={() => setSelectedDay(null)}>
        <p className="mb-3 text-caption text-ink-soft">합성 데이터 · 소비·저축·투자·소득을 구분합니다.</p>
        {records.filter(entry => entry.date === selectedDay).length === 0 ? <p role="status" className="text-body">거래가 없는 날입니다.</p> : records.filter(entry => entry.date === selectedDay).map(entry => <ListRow key={entry.id} leading="₩" title={entry.merchant} sub={`${entry.flow} · ${entry.category}`} trailing={formatKrwSigned(entry.amount)} />)}
      </DataSheet>}
      <AnimatePresence>{open && <DayCardsOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </div>
  )
}

/** 이미지 타일 금액: 좌하단에 세로로 쌓임 (등락 색 계열(어두운 배경용 밝은 톤): 수입 빨강·소비 파랑) */
function TileBadges({ income, spend }: { income: number; spend: number }) {
  return (
    <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
      {income > 0 && (
        <span className="rounded-full bg-black/50 px-2.5 py-1 text-micro font-extrabold text-red-300 backdrop-blur-sm">
          +{formatKrwCompact(income)}
        </span>
      )}
      <span className="rounded-full bg-black/50 px-2.5 py-1 text-micro font-bold text-blue-300 backdrop-blur-sm">
        {spend > 0 ? `-${formatKrwCompact(spend)}` : '무지출'}
      </span>
    </div>
  )
}

function TileAmounts({ income, spend }: { income: number; spend: number }) {
  return (
    <div className="flex flex-col">
      {income > 0 && (
        <span className="text-micro font-extrabold text-rise">+{formatKrwCompact(income)}</span>
      )}
      <span className="text-micro font-bold text-fall">
        {spend > 0 ? `-${formatKrwCompact(spend)}` : '무지출'}
      </span>
    </div>
  )
}
