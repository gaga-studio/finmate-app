import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import { useData } from '../../data/source'
import { useApiResource } from '../../data/use-api-resource'
import { DataSheet } from '../../shared/ui/DataSheet'
import { formatKrw } from '../../shared/format/krw'

export function PeerComparisonSheet({ onClose }: { onClose(): void }) {
  const { today, server, ready, error, reload } = useData()
  const [selection, setSelection] = useState<string | null>(null)
  const month = selection ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const load = useCallback(() => api.peers(`${month}-01`), [month])
  const result = useApiResource(month, server && ready && !error, load)
  const comparison = result.data
  return (
    <DataSheet title="소득대별 소비 비교" onClose={onClose}>
      {!server ? <p className="text-body leading-relaxed text-ink-soft">팀 시연 모드입니다. 서버 연결 모드에서 합성 원장의 소득대별 평균을 확인할 수 있습니다.</p> : <>
        <label className="block text-body font-bold">비교할 월
          <input type="month" name="comparison-month" value={month} onChange={event => { if (/^\d{4}-\d{2}$/.test(event.target.value)) setSelection(event.target.value) }} className="clay-pressed mt-2 block w-full rounded-xl px-3 py-3" />
        </label>
        <p className="mt-3 text-caption leading-relaxed text-ink-soft">합성 데이터입니다. 같은 달 자료가 모두 준비된 동일 소득대를 비교하며, 본인을 포함합니다. 거래가 없는 사람은 0원으로 계산합니다.</p>
        {result.error || error ? <div role="alert" className="mt-5 text-body">비교 자료를 불러오지 못했습니다.<button className="mt-3 block font-bold text-saving" type="button" onClick={() => error ? reload() : result.reload()}>다시 불러오기</button></div>
          : result.loading ? <p role="status" className="mt-5 text-body">비교 자료를 불러오는 중입니다.</p>
            : comparison?.dataStatus === 'NO_DATA' ? <p role="status" className="mt-5 text-body">자료가 없는 기간입니다. 다른 달을 선택해 주세요.</p>
              : comparison && <>
                <p className="mt-5 text-body font-bold">월 소득대 {comparison.myBand}</p>
                <dl className="clay-card mt-3 grid grid-cols-2 gap-x-3 gap-y-4 rounded-card p-4 text-body">
                  <dt className="text-ink-soft">내 소비</dt><dd className="text-right font-extrabold">{formatKrw(comparison.mySpend!)}</dd>
                  <dt className="text-ink-soft">동일 소득대 평균</dt><dd className="text-right font-extrabold">{formatKrw(comparison.peerAvgSpend!)}</dd>
                  <dt className="text-ink-soft">비교 인원</dt><dd className="text-right font-extrabold">{comparison.peerCount.toLocaleString()}명</dd>
                </dl>
              </>}
      </>}
    </DataSheet>
  )
}
