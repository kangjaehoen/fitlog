# FitLog 개발 현황 및 알림 시스템 보고서

- 작성일: 2026-05-14
- 대상: 개발리더 보고용
- 기준: 현재 `web/`, `server/` 코드베이스 확인 결과

## 1. 결론 요약

- 프론트 주요 화면은 대부분 구현되어 있으며, `main`, `weekly-record-analysis`, `today-meal-log`, `today-workout-log`, `body-info`, `fitness-routine`, `routine-edit`, `notifications`는 실제 API와 연결된 상태입니다.
- 푸시 알림 기능은 프론트 Service Worker, Push Subscription 저장, 알림 예약 DB, Web Push 발송, Spring Scheduler까지 개발 기준으로 구현되어 있습니다.
- 다만 운영 완료 보고 기준으로는 아직 보완이 필요합니다. 핵심 보완 항목은 `Google/Apple 실로그인`, `설정/탈퇴 페이지 실서비스화`, `운영용 DB 마이그레이션`, `멀티 인스턴스 중복 발송 방지`, `백엔드 Java 17 검증 환경 정리`입니다.

## 2. 과제1. 기능 구현 남은 리스트 정리

### 2-1. 인증/진입

1. 스플래시 진입(`/`, `/splash-screen`)
   상태: `진행`
   현재 상태: 로그인 쿠키가 있으면 `/main`으로 리다이렉트되고, 스플래시/로그인 유도 UI는 동작합니다.
   남은 작업: 문구/버전 정보는 현재 정적 데이터입니다.

2. 소셜 로그인(`/social-login`)
   상태: `진행`
   현재 상태: 카카오는 실제 OAuth 인가 URL 조회와 콜백 로그인이 연결되어 있습니다.
   남은 작업: Google/Apple은 현재 실제 OAuth가 아니라 데모 로그인 방식입니다.

3. 카카오 콜백(`/auth/kakao/callback`)
   상태: `완료`
   현재 상태: 인가 코드로 로그인 후 세션 저장까지 연결되어 있습니다.

### 2-2. 메인/분석

1. 메인 페이지(`/main`)
   상태: `완료`
   현재 상태: 홈 대시보드, 오늘 기록, 목표 달성률, 주간 요약, 읽지 않은 알림 수가 실제 API 기준으로 렌더링됩니다.

2. 주간 기록 분석(`/weekly-record-analysis`)
   상태: `완료`
   현재 상태: 주간 운동량, 비교 지표, 매크로 비율, 인사이트가 실제 기록 데이터 기준으로 계산됩니다.

### 2-3. 기록 기능

1. 오늘 식단 기록(`/today-meal-log`)
   상태: `완료`
   현재 상태: 음식 검색, 수량 선택, 칼로리 계산, 식단 저장이 연결되어 있습니다.
   남은 작업: 수정/삭제/과거 기록 편집 화면은 아직 별도 구현 범위로 보입니다.

2. 오늘 운동 기록(`/today-workout-log`)
   상태: `완료`
   현재 상태: 루틴 불러오기, 세트 체크, 초안 저장, 운동 기록 저장이 연결되어 있습니다.

3. 신체 정보 입력(`/body-info`)
   상태: `완료`
   현재 상태: 최근 신체 데이터 불러오기와 당일 기록 저장이 연결되어 있습니다.

### 2-4. 루틴

1. 루틴 목록(`/fitness-routine`)
   상태: `완료`
   현재 상태: 루틴 검색, 순서 변경, 삭제, 운동 기록 시작 이동이 구현되어 있습니다.

2. 루틴 편집(`/routine-edit`)
   상태: `완료`
   현재 상태: 루틴 생성/수정, 요일 설정, 운동/세트 저장이 구현되어 있습니다.

### 2-5. 마이페이지/설정

1. 마이페이지(`/mypage`)
   상태: `진행`
   현재 상태: 프로필 요약, 주간 목표 달성률, 최근 신체 지표 그래프, 닉네임 수정은 실제 데이터와 연결되어 있습니다.
   남은 작업: 프로필 이미지 버튼은 실제 업로드 기능이 없고, 일부 빠른 이동 섹션은 화면상 숨김 처리되어 있습니다.

2. 설정(`/setting`)
   상태: `진행`
   현재 상태: 푸시 권한 요청, 브라우저 구독 등록/해제, 식단/운동 리마인더 예약 저장까지 실제 동작합니다.
   남은 작업: 설정 항목 메타데이터는 정적 값이며, FAQ/개인정보처리방침 링크는 현재 `#` placeholder입니다. 로그아웃도 서버 토큰 무효화 없이 클라이언트 세션 정리 중심입니다.

3. 서비스 탈퇴(`/unsubscribe-guide`)
   상태: `진행`
   현재 상태: 안내 UI와 확인 모달은 있습니다.
   남은 작업: 실제 회원 탈퇴 API와 계정 삭제 처리 로직은 아직 연결되지 않았습니다.

### 2-6. 알림

1. 알림 센터(`/notifications`)
   상태: `완료`
   현재 상태: 발송 완료된 알림(`SENT`) 목록, 읽지 않은 수, 알림 진입 처리가 연결되어 있습니다.

2. 알림 상세(`/notifications/[notificationId]`)
   상태: `완료`
   현재 상태: 상세 조회와 읽음 처리(`readAt`)가 연결되어 있습니다.

3. 브라우저 푸시 리마인더
   상태: `완료(개발 기준)` / `진행(운영 기준)`
   현재 상태: 브라우저 구독 저장, 예약 알림 생성, 스케줄러 발송, Service Worker 수신까지 구현되어 있습니다.
   남은 작업: 운영 배포 기준 VAPID 키/HTTPS/모니터링/중복 발송 방지 보완이 필요합니다.

### 2-7. 예정 항목

1. Google OAuth 실제 연동
   상태: `예정`

2. Apple OAuth 실제 연동
   상태: `예정`

3. FAQ 실제 페이지
   상태: `예정`

4. 개인정보처리방침 실제 페이지
   상태: `예정`

5. 실제 회원 탈퇴 API 및 데이터 삭제 처리
   상태: `예정`

6. 프로필 이미지 업로드
   상태: `예정`

## 3. 과제2. 알림 DB 추가 후 어떤 기술로 어떻게 스케줄러를 돌리는지

### 3-1. 현재 적용된 기술 스택

- Frontend
  - Next.js 16.2.4
  - React 19
  - Browser Notification API
  - Push API
  - Service Worker (`web/public/service-worker.js`)

- Backend
  - Spring Boot 3.5.13
  - Java 17 타깃
  - Spring Scheduler (`@EnableScheduling`, `@Scheduled`)
  - Spring Data JPA
  - Web Push 라이브러리 `nl.martijndwars:web-push:5.1.2`
  - BouncyCastle

- Database
  - MySQL
  - `push_subscription`
  - `notification_schedule`

### 3-2. 현재 구현 구조

1. 사용자가 설정 화면에서 푸시 알림 동의를 켭니다.
2. 브라우저에서 Notification 권한을 요청합니다.
3. Service Worker를 등록하고 Push Subscription을 생성합니다.
4. Subscription 정보를 `POST /api/push/subscriptions`로 저장합니다.
5. 사용자가 식단/운동 리마인더를 저장하면 프론트가 앞으로 7일치 예약 건을 생성해 `POST /api/notifications/schedules`로 저장합니다.
6. Spring Scheduler가 60초 주기로 `PENDING` 상태이면서 `scheduled_at <= now`인 예약 건을 조회합니다.
7. 예약 건의 사용자 구독 정보를 조회한 뒤 Web Push로 발송합니다.
8. 성공 시 `SENT`, 실패 시 `retry_count` 증가, 3회 이상 실패 시 `FAILED` 처리합니다.
9. 404/410 응답이 나오는 만료 구독은 `push_subscription`에서 제거합니다.
10. 브라우저의 Service Worker가 push 이벤트를 받아 실제 알림을 표시합니다.

### 3-3. 현재 알림 아키텍처 도식

```text
[Setting 화면]
  -> Notification 권한 요청
  -> Service Worker 등록
  -> GET /api/push/vapid-public-key
  -> Browser Push Subscription 생성
  -> POST /api/push/subscriptions
  -> POST /api/notifications/schedules (향후 7일치 예약 생성)

                |
                v

[MySQL]
  - push_subscription
  - notification_schedule

                |
                v

[Spring Scheduler]
  - 60초 주기 실행
  - due schedule 최대 50건 조회
  - 사용자별 subscription 조회
  - Web Push 발송
  - SENT / FAILED / retry_count 반영
  - 만료 subscription 삭제

                |
                v

[Browser Service Worker]
  - push 수신
  - showNotification()
  - notificationclick 시 targetUrl 이동
```

### 3-4. 현재 설계의 장점

- 구현 복잡도가 낮아서 빠르게 배포 가능한 구조입니다.
- DB에 예약 건이 남으므로 발송 추적이 쉽습니다.
- 읽음 처리(`readAt`)와 예약 취소(`CANCELLED`)까지 화면과 API가 연결되어 있습니다.
- 프론트와 백엔드 책임이 분리되어 유지보수가 어렵지 않습니다.

### 3-5. 현재 설계의 한계

1. 현재 반복 알림의 실질적인 스케줄 생성 주체는 서버가 아니라 프론트입니다.
   즉, 사용자가 설정 저장 시 "앞으로 7일치 단건 예약"을 미리 만들어 두는 구조입니다.

2. 서버는 반복 규칙 기반 스케줄러가 아니라 "이미 생성된 예약 건을 발송하는 poller"에 가깝습니다.

3. 서버가 여러 대로 늘어나면 같은 예약 건을 중복 발송할 수 있는 위험이 있습니다.

4. 로컬은 JPA `ddl-auto: update`, 운영은 `validate`라서 운영 배포 시 별도 DB 스키마 반영 절차가 필요합니다.

### 3-6. 개발리더 보고용 판단

- 개발 기준으로는 "알림 기능 구현 완료"라고 보고할 수 있습니다.
- 다만 더 정확히는 "웹 푸시 기반 예약 알림 MVP 구현 완료"가 적절합니다.
- 운영 완료 보고로 표현하려면 아래 보완 항목이 마무리되어야 합니다.

## 4. 추천 아키텍처 정리

### 4-1. 지금 바로 보고할 수 있는 문구

`알림 기능은 Web Push + Spring Scheduler + MySQL 기반으로 MVP 구현이 완료되었으며, 현재 구조는 브라우저 구독 정보를 저장한 뒤 예약 알림 테이블을 60초 주기 Scheduler가 발송하는 방식입니다. 반복 알림은 프론트에서 향후 7일치 예약 건을 생성하는 방식으로 처리하고 있습니다.`

### 4-2. 운영 단계 권장 구조

1. `push_subscription`은 유지합니다.

2. `notification_schedule`도 유지합니다.
   역할: 실제 발송 대상 큐

3. 반복 알림 규칙용 테이블을 별도로 추가하는 것을 권장합니다.
   예시: `notification_rule`
   역할: 사용자의 식단/운동 리마인더 규칙 저장

4. Scheduler를 2개로 분리하면 더 안정적입니다.
   - 규칙 확장 Scheduler: 매일 1회 또는 1시간마다 `notification_rule`을 읽고 향후 n일치 `notification_schedule` 생성
   - 발송 Scheduler: 현재처럼 60초 주기로 due schedule 발송

5. 서버 다중 인스턴스 운영 시 중복 발송 방지 장치를 추가하는 것이 좋습니다.
   방법 예시: DB lock, 상태 선점 컬럼, ShedLock 같은 분산 락 도입

6. 운영 DB 반영은 JPA 자동 생성에 의존하지 말고 Flyway 또는 Liquibase로 마이그레이션 관리하는 것을 권장합니다.

## 5. 남은 작업 우선순위

### 5-1. 우선순위 높음

1. Google/Apple 실제 로그인 연동
2. 회원 탈퇴 API 및 실제 계정 삭제 처리
3. FAQ/개인정보처리방침 실제 페이지 연결
4. 알림 운영 비밀값(VAPID key), HTTPS, 운영 설정 정리
5. 백엔드 Java 17 검증 환경 정상화

### 5-2. 우선순위 중간

1. 반복 알림 규칙 테이블 분리 여부 결정
2. 멀티 인스턴스 중복 발송 방지 설계
3. DB 마이그레이션 도구(Flyway/Liquibase) 도입
4. 발송 실패 로그/모니터링/관리 포인트 추가

### 5-3. 우선순위 낮음

1. 프로필 이미지 업로드
2. 마이페이지 숨김 섹션 정리
3. 메인 헤더 이미지 최적화

## 6. 검증 결과

### 6-1. 프론트 검증

- `npm run build`: 성공
- `npm run lint`: 에러 없음, 경고 2건
  - `web/src/features/home/components/home-header.tsx`
  - 내용: Next.js 권장사항상 `<img>` 대신 `<Image />` 사용 권고

### 6-2. 백엔드 검증

- `.\gradlew.bat test`: 실행 불가
- 원인:
  - 현재 로컬 `JAVA_HOME` 값이 잘못 설정되어 있음
  - 머신에서 확인된 Java는 8 버전이며, 프로젝트 타깃은 Java 17

### 6-3. 해석

- 프론트는 빌드 가능 상태입니다.
- 백엔드는 코드상 구현과 테스트 파일은 존재하지만, 현재 로컬 실행환경 문제로 자동 검증까지 완료하지 못했습니다.
- 따라서 리더 보고 시에는 `프론트 빌드 검증 완료, 백엔드 테스트는 Java 17 환경 정리 후 재검증 예정`으로 표현하는 것이 안전합니다.

## 7. 권장 보고 형식

- 가장 추천: Google Docs 1부 요약 + 이 문서 상세본 첨부
- 요약본에는 아래 3가지만 넣는 것이 좋습니다.
  - 현재 구현 완료 범위
  - 알림 시스템 기술 스택과 구조
  - 남은 핵심 리스크와 일정

### 7-1. 리더 보고용 한 줄 버전

`FitLog는 주요 사용자 화면과 웹 푸시 예약 알림 MVP까지 구현된 상태이며, 현재 남은 핵심 과제는 실로그인 확장, 탈퇴/정책 페이지 실서비스화, 운영용 스케줄러 안정화입니다.`
