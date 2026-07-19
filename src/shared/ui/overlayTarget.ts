/**
 * 오버레이(바텀시트·풀스크린 카드)의 포털 타깃 — 폰 프레임 안에 렌더해서
 * 데스크톱에서도 시트가 브라우저 창이 아니라 폰 화면에서 올라온다.
 */
export function overlayTarget(): HTMLElement {
  return document.getElementById('phone-frame') ?? document.body
}
