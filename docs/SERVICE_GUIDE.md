# FinMate 화면과 데이터 연결

## 실행 모드

`VITE_API_URL`이 없으면 고정 합성 데이터를 사용하는 팀 시연 모드입니다. 값이 있으면 같은 화면에서 예산 카드와 소비 탑 5를 API에 연결합니다. 피드·AI 코치·미션·그림일기 등은 기존 시연 콘텐츠를 사용합니다.

![기존 화면에서 시연 데이터 또는 API를 선택하는 흐름](assets/architecture/request-flow.svg)

그림 설명: 마이 화면이 데이터 공급 계층에 기간을 전달합니다. 환경 설정에 따라 고정 시연 원장 또는 서버 overview를 읽고, 같은 예산 카드와 소비 탑 5에 표시합니다. 서버 모드의 오류나 미적재 기간을 시연 금액으로 대체하지 않습니다.

## 코드를 읽는 순서

1. `src/main.tsx`: 앱 전체의 `DataSourceProvider`를 구성합니다.
2. `src/app/router.tsx`: 첫 진입을 `/my`로 보내고 폰 프레임·다섯 탭을 구성합니다.
3. `src/data/source.tsx`: 실행 모드를 선택하고 서버 모드이면 데모 세션과 세 기간의 overview를 읽습니다.
4. `src/api/client.ts`: API 요청, 인증 세션, 실패 응답을 처리합니다.
5. `src/features/my/cards/MetricCards.tsx`: 기존 카드 안에 값·로딩·자료 없음·재시도 안내를 표시합니다.
6. `src/features/my/panels/LinkedListPanel.tsx`: 같은 기간의 소비 탑 5를 표시합니다.

서버가 제공하는 전체 거래·소득대 평균 API와 화면의 기존 메이트 비교 시연은 서로 다른 기능입니다. 임의 기준일을 선택하는 별도 대시보드는 현재 앱에 없습니다.

## 검증 실행

```bash
npm ci
npm run lint
npm run build
npm run test:e2e
python3 scripts/check-readme.py
```

전체 E2E는 FinMate API 데모가 `http://127.0.0.1:18081`에 실행되어 있어야 합니다. 서버 모드 앱의 출처는 API가 허용하는 `http://localhost:5175`이며, 시연 모드는 테스트 중 `http://localhost:5177`에서 실행됩니다.

`e2e/original-ui.spec.ts`는 시연 모드의 기존 화면 이동·기간·카드·공유 흐름을 확인합니다. `e2e/spending.spec.ts`는 실제 API 값, 오류 후 재시도, 미적재 기간과 별도 API 계약을 확인합니다. 성공 응답을 가짜 값으로 대체하지 않습니다.

## 작은 변경 과제

소비 예산의 기준을 바꾼다면 화면을 추가하기 전에 API 응답, 기간별 금액, 물잔의 남은 비율이 같은 정의를 사용하는지 따라 읽어 보세요. 시연 데이터와 API 연결 영역의 차이를 설명한 뒤, 실패 응답이 와도 탭 이동이 가능한지 확인합니다.
