# Wrapped 팝아트 이미지 제작 가이드 (9종)

마이 탭 Wrapped 카드 **상단 이미지 영역**에 들어갈 팝아트 이미지 스펙. **파일을 `public/art/wrapped/`에 아래 파일명 그대로 넣기만 하면** 코드 수정 없이 자동 반영된다 (`src/data/art-manifest.ts`가 단일 매핑, 없으면 그라디언트 폴백).

## 공통 규격

- **크기**: 1024×1024 정사각 PNG
- **크롭**: 카드에서 폭 100% × 높이 42% (약 4:3)로 **센터 크롭**된다 → 모티프는 중앙 배치, 상하 가장자리 ~12%는 잘릴 수 있음. 마이 탭 썸네일에서는 세로로 길게(9:16) 크롭되니 좌우 가장자리에도 핵심을 두지 말 것.
- **텍스트 금지**: 카피는 앱이 얹는다.
- **상단 여백**: 이미지 위 상단에 배지("오늘의 소비" 등)가 얹힌다 — 최상단 15%는 심플하게.
- **스타일**: 팝아트 — 굵은 검정 아웃라인, 하프톤 도트, 비비드 플랫 컬러, 스크린 프린트 질감.
- **컬러 키**: 카드 하단이 지표색 플랫 컬러라 이미지도 같은 계열이 주조면 이어져 보인다 — 소비=블루, 저축=민트/틸, 투자=바이올렛.

## 공통 프롬프트 서픽스

모든 프롬프트 뒤에 붙이기:

> pop art style, bold black outlines, halftone dot texture, vivid flat colors, screen print look, no text, centered composition, square

## 슬롯별 프롬프트

| 파일명 | 장면 | 프롬프트 (서픽스 앞부분) |
|---|---|---|
| `budget-daily.png` | 카페의 커피 한 잔 | a steaming coffee cup on a cafe table with a lunch box beside it, cozy morning light, blue dominant palette with warm yellow accents |
| `budget-weekly.png` | 스니커즈 히어로샷 | a single stylish sneaker floating heroically at dramatic angle, radial sunburst background, blue and orange pop palette |
| `budget-monthly.png` | 쇼핑백 하울 | colorful shopping bags overflowing with purchases, confetti burst, deep blue background with pink and yellow accents |
| `saving-daily.png` | 여행의 출발선 | a boarding pass and stacked coins on a table, tiny Eiffel Tower far away on the horizon through a window, mint green morning palette |
| `saving-weekly.png` | 순항하는 비행기 | a passenger airplane cruising above stylized clouds, dotted flight path curving forward, mint and teal palette with warm sun |
| `saving-monthly.png` | 파리 도착 직전 | a passenger airplane flying right up to the Eiffel Tower, Paris skyline, celebratory mood, mint teal palette with golden lights |
| `invest-daily.png` | 발사 카운트다운 | a rocket standing on a launch pad with steam venting, countdown mood, violet purple palette with morning sky |
| `invest-weekly.png` | 리프트오프 | a rocket lifting off with bold flame and smoke clouds, upward motion lines, violet and magenta pop palette |
| `invest-monthly.png` | 궤도의 로켓 | a rocket soaring through space past a big moon and stars, upward arc trajectory, deep violet night palette with neon accents |
| `saving-income.png` | 1위 소득 = 월급 | a thick pay envelope with banknotes on an office desk, golden hour light through window blinds, mint and gold palette |
| `saving-asset.png` | 1위 자산 = 집(전세) | a cozy small apartment building exterior with warm lit windows at dusk, keys in the foreground, mint teal palette |

기간 문법: 일간 = 시작/준비의 순간, 주간 = 진행 중인 액션, 월간 = 도달/성취의 순간. 소비는 "그 기간 가장 많이 쓴 것"(커피 → 운동화 → 쇼핑)을 그린다.

## 다이어리 아트 (참고)

- `public/art/diary/` — 1024×1024 PNG, 파일명 `YYYY-MM-DD.png` (`art-manifest.ts`의 diary 키).
