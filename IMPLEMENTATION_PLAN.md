# FitLog Frontend Implementation Plan

## 현재 상태

- 원본 시안은 `legacy-html/`에 보관합니다.
- 실제 서비스 UI는 `web/`의 Next.js App Router에서 구현합니다.
- 홈과 주간 분석은 Next.js 컴포넌트로 옮기고, 나머지 화면은 `legacy-html`을 임시로 미리보기 하는 마이그레이션 단계입니다.

## 현재 프런트엔드 구조 원칙

1. `app/**/page.tsx`는 라우트 엔트리만 담당합니다.
2. 화면별 큰 JSX는 `features/*/components` 아래로 분리합니다.
3. 공통 UI는 `components/` 아래에서 재사용합니다.
4. 데이터 조회는 `lib/api-client.ts`와 feature별 `api.ts`에서 담당합니다.
5. 백엔드 연동 전까지는 feature 내부 `mock-data.ts`를 사용하고, 실제 API가 열리면 feature `api.ts`만 교체합니다.

## 권장 폴더 구조

```text
fitlog/
  legacy-html/
  web/
    src/
      app/
        page.tsx
        weekly-record-analysis/page.tsx
      components/
        icons.tsx
        legacy/
        navigation/
      features/
        home/
          api.ts
          mock-data.ts
          types.ts
          components/
        weekly-analysis/
          api.ts
          mock-data.ts
          types.ts
          components/
      lib/
        api-client.ts
```

## 라우트 매핑

| Legacy HTML | Next.js Route | 상태 |
| --- | --- | --- |
| `main.html` | `/` | feature 구조로 이관 완료 |
| `weekly-record-analysis.html` | `/weekly-record-analysis` | feature 구조로 이관 완료 |
| `fitness-routine.html` | `/fitness-routine` | legacy 미리보기 유지 |
| `mypage.html` | `/mypage` | legacy 미리보기 유지 |
| `today-meal-log.html` | `/today-meal-log` | legacy 미리보기 유지 |
| `today-workout-log.html` | `/today-workout-log` | legacy 미리보기 유지 |
| `body-info.html` | `/body-info` | 다음 단계 |
| `routine-edit.html` | `/routine-edit` | 다음 단계 |
| `setting.html` | `/setting` | 다음 단계 |
| `social-login.html` | `/social-login` | 다음 단계 |
| `splash-screen.html` | `/splash-screen` | 다음 단계 |
| `unsubscribe-guide.html` | `/unsubscribe-guide` | 다음 단계 |

## 프런트엔드 구현 원칙

### 1. 라우트 레이어

- `app/page.tsx`와 각 route의 `page.tsx`는 데이터를 가져오고 화면 컴포넌트를 조립하는 역할만 맡습니다.
- 페이지 파일 안에는 복잡한 섹션 마크업과 반복 렌더링 로직을 오래 두지 않습니다.

### 2. feature 레이어

- 홈, 주간 통계, 식단 기록, 운동 기록처럼 화면 단위 또는 도메인 단위로 `features/`를 나눕니다.
- 한 feature 안에는 `components`, `types`, `api`, `mock-data`를 함께 둡니다.
- 이렇게 하면 목데이터에서 실API로 바꿀 때 수정 범위가 해당 feature 안으로 제한됩니다.

### 3. 공통 컴포넌트 레이어

- 탭바, 공통 아이콘, legacy preview처럼 여러 route에서 재사용되는 UI는 `components/` 아래로 둡니다.
- 현재는 `components/navigation/bottom-nav.tsx`와 `components/legacy/legacy-screen.tsx`가 대표 예시입니다.

### 4. 데이터 접근 레이어

- 공통 fetch 래퍼는 `lib/api-client.ts`에 둡니다.
- 실제 화면 데이터는 각 feature의 `api.ts`에서 읽습니다.
- 로컬 개발 중 서버가 준비되지 않았으면 `FITLOG_USE_REAL_API=false` 상태로 mock data를 사용합니다.
- 실제 Spring API가 준비되면 feature `api.ts`에서 `apiClient.get(...)` 경로만 교체합니다.

## 백엔드 연동 방향

- 프런트는 Spring Boot 서버를 외부 API로 호출합니다.
- 홈 대시보드는 추후 `GET /api/home/dashboard` 또는 유사 endpoint로 정리합니다.
- 주간 분석은 `GET /api/analytics/weekly` 계열 endpoint로 연결합니다.
- 루틴, 식단, 운동, 신체 데이터도 동일하게 feature별 `api.ts`에서 연결합니다.

## 마이그레이션 우선순위

1. 홈 대시보드
2. 주간 통계
3. 운동 기록
4. 식단 기록
5. 마이페이지
6. 신체 데이터 입력
7. 설정, 회원탈퇴, 로그인

## 바로 다음 작업

1. `today-workout-log`, `today-meal-log`를 실제 입력 가능한 폼으로 전환
2. `fitness-routine`, `mypage`를 `features/*` 구조로 옮기기
3. Spring API 스펙에 맞춰 feature별 `api.ts` 연결
4. legacy preview route를 순차 제거
