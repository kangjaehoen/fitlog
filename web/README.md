# FitLog Web

`web/`은 FitLog의 Next.js 프론트입니다.

## 구조

```text
src/
  app/                      # route entry
  components/               # shared UI
    navigation/
    ui/
  features/                 # feature-oriented UI and data access
    account/
    home/
    recording/
    routine/
    routine-editor/
    weekly-analysis/
  lib/
    api-client.ts           # shared fetch wrapper
```

## 개발 원칙

- `app/**/page.tsx`가 라우트 엔트리입니다.
- 화면별 데이터는 `features/*/api.ts`, `features/*/mock-data.ts`에서 관리합니다.
- 실제 API 연결 전에는 mock 데이터를 사용합니다.
- 레거시 HTML은 앱 런타임에서 사용하지 않고 `preview/legacy-html/`에 보관합니다.

## 환경 변수

- `FITLOG_USE_REAL_API=true`
  실제 백엔드 API를 사용합니다.
- `API_BASE_URL`
  서버 API 기본 주소입니다. 기본값은 `http://localhost:8080`입니다.
- `NEXT_PUBLIC_API_BASE_URL`
  클라이언트 컴포넌트에서 사용할 공개 API 주소입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 정적 프리뷰

레거시 HTML 아카이브와 정적 프리뷰는 `web/preview/`에서 확인할 수 있습니다.

- 시작 파일: `web/preview/index.html`
- 현재 홈 프리뷰: `web/preview/main.html`
- 현재 주간 통계 프리뷰: `web/preview/weekly-record-analysis.html`
- 레거시 HTML 아카이브: `web/preview/legacy-html/*.html`

로컬 서버로 확인하려면 PowerShell에서 아래 스크립트를 실행하면 됩니다.

```powershell
cd c:\Users\hong\Desktop\fitlog\web
powershell -ExecutionPolicy Bypass -File .\scripts\serve-preview.ps1
```

그다음 `http://127.0.0.1:4173`을 열면 됩니다.
