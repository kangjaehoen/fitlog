# FitLog Next.js Implementation Plan

## 현재 상태

- 원본 시안은 `legacy-html/`에 보관했습니다.
- Figma MCP 기준으로 확인한 대표 화면은 `main(홈)`과 `weekly-record-analysis(주간 통계 분석)`입니다.
- 실제 Next.js 프런트엔드는 `web/`에 생성했습니다.

## 권장 폴더 구조

```text
fitlog/
  legacy-html/
  web/
    src/
      app/
      components/
      lib/
```

## 라우트 매핑

| Legacy HTML | Next.js Route | 상태 |
| --- | --- | --- |
| `main.html` | `/` | 구현 시작 |
| `weekly-record-analysis.html` | `/weekly-record-analysis` | 구현 시작 |
| `fitness-routine.html` | `/fitness-routine` | 스캐폴드 |
| `mypage.html` | `/mypage` | 스캐폴드 |
| `today-meal-log.html` | `/today-meal-log` | 스캐폴드 |
| `today-workout-log.html` | `/today-workout-log` | 스캐폴드 |
| `body-info.html` | `/body-info` | 다음 단계 |
| `routine-edit.html` | `/routine-edit` | 다음 단계 |
| `setting.html` | `/setting` | 다음 단계 |
| `social-login.html` | `/social-login` | 다음 단계 |
| `splash-screen.html` | `/splash-screen` | 다음 단계 |
| `unsubscribe-guide.html` | `/unsubscribe-guide` | 다음 단계 |

## 프런트엔드 구현 순서

1. `legacy-html`의 정적 마크업을 섹션 단위로 분해합니다.
2. 공통 레이아웃, 하단 탭바, 카드, 진행바, 차트 UI를 `components/`로 분리합니다.
3. 페이지는 기본적으로 Server Component로 두고, 데이터 조회는 `lib/`의 서버 함수에서 처리합니다.
4. 모달, 슬라이더, 입력 동기화처럼 이벤트가 필요한 부분만 Client Component로 따로 분리합니다.
5. 실제 API/DB가 붙으면 mock data를 교체합니다.

## 서버단 권장 구성

### 1. 기본 방향

- 처음에는 **Next.js 단일 애플리케이션**으로 가는 것이 가장 효율적입니다.
- 즉, 프런트와 백엔드를 분리된 서버 두 개로 시작하지 말고 `web/src/app` 안에서 함께 운영하는 구성이 적합합니다.

### 2. 추천 구성

- UI 렌더링: Next.js App Router
- 읽기 데이터 조회: Server Components
- 쓰기 작업: Server Actions
- 외부 연동/모바일 앱용 API: Route Handlers (`app/api/**/route.ts`)
- 데이터베이스: PostgreSQL
- ORM: Prisma
- 인증: Auth.js 기반 소셜 로그인
- 파일 저장: S3 호환 스토리지

### 3. 왜 이 구성이 맞는가

- 현재 화면들이 운동, 식단, 신체 기록처럼 **관계형 데이터** 중심입니다.
- `meal_logs`, `workout_logs`, `body_metrics`, `routines`, `users` 같이 테이블 관계가 명확해서 PostgreSQL이 잘 맞습니다.
- 로그인 화면에 카카오, 구글, 애플이 이미 있으므로 인증 계층은 초기에 같이 설계하는 편이 좋습니다.
- 폼 제출과 간단한 수정은 Server Action이 빠르고, 외부 소비 API나 webhook은 Route Handler로 분리하면 깔끔합니다.

## 서버 도메인 분리안

### 핵심 도메인

- `auth`: 회원, 세션, 소셜 로그인
- `profile`: 닉네임, 목표, 알림 설정
- `routines`: 운동 루틴, 운동 종목, 세트 템플릿
- `meal-logs`: 식단 기록, 영양소 합계
- `workout-logs`: 운동 세션, 세트 기록, 칼로리 계산
- `body-metrics`: 체중, 골격근량, 체지방률
- `analytics`: 주간 통계, 달성률, 인사이트

### 권장 API 초안

- `GET /api/me`
- `PATCH /api/me`
- `GET /api/routines`
- `POST /api/routines`
- `GET /api/meal-logs?date=YYYY-MM-DD`
- `POST /api/meal-logs`
- `GET /api/workout-logs?date=YYYY-MM-DD`
- `POST /api/workout-logs`
- `GET /api/body-metrics?range=30d`
- `POST /api/body-metrics`
- `GET /api/analytics/weekly?start=YYYY-MM-DD`

## 데이터베이스 초안

### 핵심 테이블

- `users`
- `profiles`
- `goals`
- `routines`
- `routine_exercises`
- `workout_sessions`
- `workout_sets`
- `meal_logs`
- `meal_items`
- `body_metrics`

### 나중에 추가

- `notifications`
- `streaks`
- `insight_snapshots`
- `images`

## 마이그레이션 우선순위

1. 홈 대시보드
2. 주간 통계
3. 운동 기록
4. 식단 기록
5. 마이페이지
6. 신체 데이터 입력
7. 설정/회원탈퇴/로그인

## 바로 다음 작업

1. `today-workout-log`, `today-meal-log`를 실제 입력 가능한 폼으로 전환
2. Prisma 스키마 초안 생성
3. Auth.js와 소셜 로그인 전략 확정
4. `app/api` 또는 Server Action으로 CRUD 연결
