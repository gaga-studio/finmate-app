import { useEffect, useState } from 'react'
import { api, ensureSession, type PeerComparison, type ServerOverview, type TransactionPage } from '../../api/client'
import './spending.css'

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`
type View = { overview: ServerOverview; peers: PeerComparison; transactions: TransactionPage }

export function SpendingPage() {
  const [started, setStarted] = useState(false)
  const [starting, setStarting] = useState(false)
  const [date, setDate] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [page, setPage] = useState(0)
  const [revision, setRevision] = useState(0)
  const [view, setView] = useState<View | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function start() {
    setStarting(true)
    setError(null)
    try {
      await ensureSession()
      const overview = await api.overview('monthly')
      setDate(overview.referenceDate)
      setStarted(true)
    } catch {
      setError('데모 데이터를 불러오지 못했습니다. 서버 연결을 확인한 뒤 다시 시작해 주세요.')
    } finally { setStarting(false) }
  }

  useEffect(() => {
    if (!started || !date) return
    let cancelled = false
    setLoading(true)
    setView(null)
    setError(null)
    Promise.all([api.overview(period, date), api.peers(`${date.slice(0, 7)}-01`), api.transactions(period, date, page)])
      .then(([overview, peers, transactions]) => {
        if (!cancelled) setView({ overview, peers, transactions })
      })
      .catch(() => { if (!cancelled) setError('데이터를 불러오지 못했습니다. 서버 연결을 확인한 뒤 다시 불러와 주세요.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [started, date, period, page, revision])

  const budget = view?.overview.budget
  return (
    <div className="spending">
      <a className="spending-skip" href="#spending-main">본문으로 이동</a>
      <header className="spending-header">
        <a href="/" className="spending-logo" aria-label="FinMate 홈">FinMate</a>
        <span className="spending-source">합성 데이터</span>
      </header>
      <main id="spending-main" className="spending-main">
        {!started ? <section className="spending-welcome">
          <h1>내 소비를 보고,<br />같은 기준으로 비교해요.</h1>
          <p>기간별 거래와 지출을 확인하고, 같은 소득대의 월평균과 나란히 살펴보세요.</p>
          <p className="spending-note">가상의 24명과 2026년 1~7월 거래로 체험합니다.<br />은행 계좌나 실제 금융 정보는 연결하지 않습니다.</p>
          {error && <p role="alert">{error}</p>}
          <button className="spending-primary" disabled={starting} onClick={() => void start()}>{starting ? '연결하는 중…' : '데모 시작'}</button>
          <a className="spending-prototype" href="/my">기존 팀 시연 화면 보기</a>
        </section> : <>
          <div className="spending-title"><h1>내 소비 기록</h1><p>자료가 있는 기간을 골라 소비 흐름을 확인하세요.</p></div>
          <form className="spending-controls" onSubmit={event => event.preventDefault()}>
            <label>기준일<input type="date" value={date} onChange={event => { if (event.target.value) { setDate(event.target.value); setPage(0) } }} /></label>
            <label>조회 기간<select value={period} onChange={event => { setPeriod(event.target.value); setPage(0) }}>
              <option value="daily">일간</option><option value="weekly">주간</option><option value="monthly">월간</option>
            </select></label>
          </form>
          {loading && <p role="status" className="spending-message">데이터를 불러오는 중입니다.</p>}
          {error && <div className="spending-message" role="alert"><p>{error}</p><button onClick={() => setRevision(value => value + 1)}>다시 불러오기</button></div>}
          {view && view.overview.dataStatus === 'NO_DATA' && <div role="status" className="spending-message">
            <h2>자료가 없는 기간입니다.</h2><p>조회 가능한 자료: {view.overview.dataFrom} ~ {view.overview.dataTo}. 이 기간 안의 기준일을 선택해 주세요.</p>
          </div>}
          {view && budget && <>
            <section className="spending-summary" aria-label="기간별 요약">
              <div><p>{view.overview.start} ~ {view.overview.end}</p><h2>쓴 금액 <strong>{won(budget.spent)}</strong></h2></div>
              <dl><div><dt>소득</dt><dd>{won(view.overview.earned)}</dd></div><div><dt>저축</dt><dd>{won(view.overview.saved)}</dd></div><div><dt>투자</dt><dd>{won(view.overview.invested)}</dd></div></dl>
            </section>
            <div className="spending-columns">
              <section className="spending-ledger">
                <div className="spending-section-title"><h2>거래 내역</h2><p>{view.transactions.total}건</p></div>
                {view.transactions.total === 0 ? <p>이 기간에는 거래가 없습니다.</p> : <>
                  <table aria-label="거래 내역"><thead><tr><th scope="col">날짜 · 내역</th><th scope="col">구분</th><th scope="col">금액</th></tr></thead>
                    <tbody>{view.transactions.items.map(entry => <tr key={entry.id}>
                      <td><time dateTime={entry.date}>{entry.date}</time><span>{entry.merchant}</span></td><td>{entry.flow}</td><td className={entry.amount > 0 ? 'spending-income' : ''}>{entry.amount > 0 ? '+' : '−'}{won(Math.abs(entry.amount))}</td>
                    </tr>)}</tbody></table>
                  {view.transactions.total > view.transactions.size && <nav aria-label="거래 페이지" className="spending-pagination">
                    <button disabled={page === 0} onClick={() => setPage(value => value - 1)}>이전</button><span>{page + 1} / {Math.ceil(view.transactions.total / view.transactions.size)}</span>
                    <button disabled={(page + 1) * view.transactions.size >= view.transactions.total} onClick={() => setPage(value => value + 1)}>다음</button>
                  </nav>}
                </>}
              </section>
              <aside className="spending-comparison">
                <h2>같은 소득대의 {Number(date.slice(5, 7))}월 소비</h2>
                <p className="spending-note">월 전체의 소비를 비교합니다.</p>
                {view.peers.dataStatus === 'NO_DATA' ? <p>월 전체의 자료가 없어 비교할 수 없습니다.</p> : <>
                  <dl className="spending-compare-values"><div><dt>내 월 소비</dt><dd>{won(view.peers.mySpend!)}</dd></div><div><dt>같은 소득대 평균</dt><dd>{won(view.peers.peerAvgSpend!)}</dd></div></dl>
                  <dl className="spending-cohort"><div><dt>소득대</dt><dd>{view.peers.myBand}</dd></div><div><dt>비교 인원</dt><dd>{view.peers.peerCount}명</dd></div></dl>
                  <p className="spending-note">본인을 포함한 같은 소득대 중, 해당 월의 자료가 모두 준비된 사람의 평균입니다. 거래가 없는 사람도 0원으로 포함합니다.</p>
                </>}
              </aside>
            </div>
            <p className="spending-footnote">출처: 서버에 적재된 합성 원장. 실제 사용자 통계나 금융 조언이 아닙니다.</p>
          </>}
        </>}
      </main>
      <footer className="spending-footer"><span>FinMate 소비 조회 데모</span><a href="/my">기존 팀 시연 자료</a></footer>
    </div>
  )
}
