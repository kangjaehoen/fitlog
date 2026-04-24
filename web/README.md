# FitLog Web

`web/`은 FitLog의 Next.js 프런트엔드입니다.

## 구조

```text
src/
  app/                     # route entry
  components/              # shared UI
    legacy/
    navigation/
  features/                # feature-oriented UI and data access
    home/
    weekly-analysis/
  lib/
    api-client.ts          # shared fetch wrapper
```

## 개발 원칙

- `app/**/page.tsx`는 얇게 유지합니다.
- 큰 화면 마크업은 `features/*/components`로 분리합니다.
- 공통 탭바와 legacy preview는 `components/`에서 공유합니다.
- 실제 API 연동은 feature별 `api.ts`에서 담당합니다.
- 백엔드가 준비되기 전에는 feature 내부 `mock-data.ts`를 사용합니다.

## 환경 변수

- `FITLOG_USE_REAL_API=true`
  - mock data 대신 실제 백엔드 API를 호출합니다.
- `API_BASE_URL`
  - 서버 API 기본 주소입니다. 기본값은 `http://localhost:8080`입니다.
- `NEXT_PUBLIC_API_BASE_URL`
  - 클라이언트 컴포넌트에서도 같은 API 주소를 써야 할 때 사용할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 프런트만 미리보기

Node.js나 백엔드가 없는 환경에서는 `web/preview/`의 정적 화면을 바로 열어볼 수 있습니다.

- 시작 파일: `web/preview/index.html`
- 홈 화면: `web/preview/home.html`
- 주간 분석: `web/preview/weekly-record-analysis.html`

로컬 서버로 보고 싶으면 PowerShell에서 아래 스크립트를 실행하면 됩니다.

```powershell
cd c:\Users\hong\Desktop\fitlog\web
powershell -ExecutionPolicy Bypass -File .\scripts\serve-preview.ps1
```

그다음 `http://127.0.0.1:4173`을 열면 됩니다.
