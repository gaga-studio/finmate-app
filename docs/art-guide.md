# Wrapped AI 아트 제작 가이드 (9종)

마이 탭 Wrapped 카드에 들어갈 AI 아트 스펙. **파일을 `public/art/wrapped/`에 아래 파일명 그대로 넣기만 하면** 코드 수정 없이 현재의 코드 드로잉 플레이스홀더를 자동 대체한다 (`src/data/art-manifest.ts`가 단일 매핑).

## 공통 규격

- **크기**: 1080×1920 PNG (9:16)
- **텍스트 금지**: 카피(제목/헤드라인/수치)는 앱이 얹는다. 아트에 글자가 있으면 겹친다.
- **세이프 에어리어**: 하단 45%는 어두운 스크림 + 텍스트/통계 카드가 덮는다. **핵심 모티프는 상단~중상단(위에서 15~55% 밴드)에** 배치. 상단 10%에는 배지가 얹힌다.
- **썸네일 크롭**: 같은 파일이 마이 탭에서 약 163×248로 센터 크롭되어 보인다. 모티프를 좌우 가장자리에 붙이지 말 것.
- **지표별 컬러 키**: 예산=블루(hue 230), 저축=민트(hue 168), 투자=바이올렛(hue 295). 앱 팔레트와 어울리게.
- **기간별 시간대 무드**: 일간=아침(밝고 맑음), 주간=노을(따뜻한 역광), 월간=밤(어둡고 별). 플레이스홀더와 같은 문법이라 교체 시 위화감이 없다.

## 슬롯별 테마

| 파일명 | 지표 × 기간 | 장면 프롬프트 방향 |
|---|---|---|
| `budget-daily.png` | 소비 × 일간 | 아침 하늘에 떠 있는 운동화, 아래 도시 스카이라인·언덕, 커피 김 — 초현실 미니멀 포스터 |
| `budget-weekly.png` | 소비 × 주간 | 같은 장면, 노을 역광 — 큰 해 앞의 운동화 실루엣 |
| `budget-monthly.png` | 소비 × 월간 | 같은 장면, 밤 — 달빛 아래 운동화, 별 |
| `saving-daily.png` | 저축 × 일간 | 아침 바다 위 한라산(제주), 종이비행기가 점선 궤적으로 상승 |
| `saving-weekly.png` | 저축 × 주간 | 노을 바다, 큰 해를 향해 나는 종이비행기 |
| `saving-monthly.png` | 저축 × 월간 | 밤바다와 달, 별 사이의 종이비행기 |
| `invest-daily.png` | 투자 × 일간 | 아침 안개 산맥 — 능선이 우상향 차트 곡선, 능선 위 빛나는 선 |
| `invest-weekly.png` | 투자 × 주간 | 노을 산맥, 역광의 우상향 능선 |
| `invest-monthly.png` | 투자 × 월간 | 밤 산맥과 달, 별 — 능선 끝에서 빛나는 점 |

프롬프트 예시 (budget-weekly):

> minimal surreal poster art, a giant sneaker silhouette floating in a warm sunset sky, backlit by a large sun disc, rolling hills and tiny city skyline below, blue-hour color palette with hue 230, grainy texture, no text, 9:16

## 다이어리 아트 (참고)

- `public/art/diary/` — 1024×1024 PNG, 파일명 `YYYY-MM-DD.png` (`art-manifest.ts`의 diary 키).
