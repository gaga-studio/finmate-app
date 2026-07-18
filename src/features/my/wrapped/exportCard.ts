import { toPng } from 'html-to-image'

/**
 * 카드 노드를 1080×1920급 PNG로 캡처한다.
 * iOS Safari의 첫 호출 이미지 누락 버그 대응으로 2회 호출해
 * 두 번째 결과를 쓴다. 폰트는 셀프호스팅이라 fonts.ready만 기다리면 된다.
 */
export async function captureCard(node: HTMLElement): Promise<string> {
  await document.fonts.ready
  const opts = { pixelRatio: 3, cacheBust: true }
  await toPng(node, opts)
  return toPng(node, opts)
}

export async function saveOrShare(dataUrl: string): Promise<'shared' | 'saved'> {
  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], 'finmate-wrapped.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch {
      // 사용자가 공유 시트를 닫은 경우 → 다운로드 폴백으로 이어간다
    }
  }

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = 'finmate-wrapped.png'
  a.click()
  return 'saved'
}
