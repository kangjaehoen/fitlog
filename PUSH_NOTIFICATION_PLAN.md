# 예약 브라우저 푸시 알림 구현 계획

## 1. 목표

사용자가 웹 화면에서 알림 내용과 예약 시간을 등록하면, 지정한 시간에 브라우저 푸시 알림을 받을 수 있는 예약 알림 서비스를 구현한다.

구성 요소는 다음과 같다.

- Frontend
  - Notification API
  - Service Worker
  - Push API
- Backend
  - Spring Boot
  - Web Push / VAPID
  - Spring Scheduler
- Database
  - Push Subscription 저장
  - Notification Schedule 저장
- Browser Push Service
  - Chrome / Edge 등의 브라우저 푸시 서비스 경유

## 2. 전체 흐름

```text
[Frontend]
1. 사용자가 알림 권한 허용
2. Service Worker 등록
3. Push Subscription 생성
4. Subscription 정보를 Backend로 전송
5. 사용자가 알림 내용과 예약 시간 등록

        ↓

[Spring Backend]
1. Push Subscription 저장
2. 알림 일정 저장
3. Scheduler가 주기적으로 발송 대상 조회
4. Web Push + VAPID로 푸시 발송
5. 발송 성공/실패 상태 업데이트

        ↓

[DB]
- push_subscription
- notification_schedule

        ↓

[Browser Push Service]
- Chrome / Edge Push Service

        ↓

[User Browser]
- Service Worker가 push 이벤트 수신
- 브라우저 알림 표시
```

## 3. 작업 단계

## Phase 1. VAPID 키 준비

### 작업 내용

- Web Push 서버 인증을 위한 VAPID public/private key 생성
- Backend 설정 파일에 VAPID 키 등록
- Frontend에는 public key만 전달

### 설정 항목 예시

```properties
webpush.vapid.public-key=...
webpush.vapid.private-key=...
webpush.vapid.subject=mailto:admin@example.com
```

### 주의사항

- private key는 절대 Frontend로 노출하지 않는다.
- 운영 환경에서는 환경변수 또는 secret 관리 도구를 사용한다.
- `server/local-secrets.properties`에는 로컬 전용 키만 두고, 예시 파일에는 placeholder만 둔다.

## Phase 2. DB 설계

## 2.1 push_subscription 테이블

브라우저 Push Subscription 정보를 저장한다.

### 주요 컬럼

| 컬럼 | 설명 |
|---|---|
| id | PK |
| user_id | 사용자 식별자 |
| endpoint | Push endpoint URL |
| p256dh | 암호화 public key |
| auth | 인증 secret |
| user_agent | 브라우저 정보 |
| created_at | 생성일 |
| updated_at | 수정일 |

### 목적

- 사용자의 브라우저별 Push Subscription 저장
- 하나의 사용자가 여러 브라우저/기기에서 구독할 수 있도록 설계
- `endpoint`는 중복 저장되지 않도록 unique 제약 검토

## 2.2 notification_schedule 테이블

사용자가 등록한 예약 알림 정보를 저장한다.

### 주요 컬럼

| 컬럼 | 설명 |
|---|---|
| id | PK |
| user_id | 사용자 식별자 |
| title | 알림 제목 |
| body | 알림 내용 |
| scheduled_at | 예약 발송 시간 |
| status | PENDING / SENT / FAILED / CANCELLED |
| sent_at | 실제 발송 시간 |
| retry_count | 재시도 횟수 |
| created_at | 생성일 |
| updated_at | 수정일 |

### 목적

- 예약된 알림 관리
- 발송 여부 추적
- 실패 시 재시도 처리 가능

## Phase 3. Frontend 구현

## 3.1 Service Worker 등록

### 작업 내용

- `web/public/service-worker.js` 파일 생성
- 앱 초기 로딩 또는 알림 설정 화면 진입 시 Service Worker 등록

### 역할

- 웹페이지가 닫혀 있어도 push 이벤트 수신
- push 이벤트 발생 시 Notification API로 알림 표시

## 3.2 알림 권한 요청

### 작업 내용

- 사용자가 알림 기능을 활성화할 때 `Notification.requestPermission()` 호출
- 권한 상태에 따라 UI 처리

### 처리 상태

| 상태 | 처리 |
|---|---|
| granted | Push Subscription 생성 가능 |
| denied | 알림 기능 비활성화 안내 |
| default | 권한 요청 전 상태 |

## 3.3 Push Subscription 생성

### 작업 내용

- `registration.pushManager.subscribe()` 호출
- Backend에서 전달받은 VAPID public key 사용
- 생성된 subscription을 Backend로 전송

### Backend 전송 데이터

```json
{
  "endpoint": "...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

## 3.4 예약 알림 등록 화면

### 작업 내용

사용자가 아래 값을 입력할 수 있는 UI를 구현한다.

- 알림 제목
- 알림 내용
- 예약 날짜
- 예약 시간

### 등록 시 Backend API 호출

```http
POST /api/notifications/schedules
```

## Phase 4. Backend 구현

## 4.1 Push Subscription 저장 API

### API

```http
POST /api/push/subscriptions
```

### 역할

- Frontend에서 전달받은 Push Subscription 저장
- 같은 endpoint가 이미 있으면 갱신 처리
- 사용자 기준으로 subscription 관리

## 4.2 VAPID Public Key 조회 API

### API

```http
GET /api/push/vapid-public-key
```

### 역할

- Frontend에서 Push Subscription을 만들 때 필요한 public key 반환
- private key는 절대 응답하지 않음

## 4.3 예약 알림 등록 API

### API

```http
POST /api/notifications/schedules
```

### 요청 예시

```json
{
  "title": "운동 시간",
  "body": "오늘 하체 운동 기록할 시간입니다.",
  "scheduledAt": "2026-05-08T21:00:00"
}
```

### 역할

- 예약 알림 정보 저장
- 기본 상태는 `PENDING`
- 예약 시간은 서버 기준 시간대 정책을 정해 저장

## 4.4 예약 알림 조회 API

### API

```http
GET /api/notifications/schedules
```

### 역할

- 사용자가 등록한 예약 알림 목록 조회
- 상태별 필터링 가능

## 4.5 예약 알림 취소 API

### API

```http
PATCH /api/notifications/schedules/{id}/cancel
```

### 역할

- 아직 발송되지 않은 알림을 `CANCELLED` 상태로 변경

## Phase 5. Web Push 발송 구현

## 5.1 Web Push 라이브러리 적용

### 작업 내용

Spring Boot에서 Web Push 발송을 위해 Java Web Push 라이브러리를 사용한다.

예상 라이브러리:

```gradle
implementation 'nl.martijndwars:web-push:5.1.1'
```

프로젝트의 Java, Spring Boot, Gradle 버전과 호환되는 최신 버전을 확인해 적용한다.

## 5.2 Push 메시지 생성

### 발송 payload 예시

```json
{
  "title": "운동 시간",
  "body": "오늘 하체 운동 기록할 시간입니다.",
  "url": "/notifications"
}
```

### 역할

- Service Worker가 payload를 받아 브라우저 알림으로 표시
- 사용자가 알림 클릭 시 특정 페이지로 이동 가능

## Phase 6. Spring Scheduler 구현

## 6.1 Scheduler 활성화

### 작업 내용

- Spring Boot Application에 `@EnableScheduling` 추가
- Scheduler 클래스 생성

## 6.2 발송 대상 조회

### 기준

```text
status = PENDING
scheduled_at <= 현재 시간
```

### 실행 주기 예시

```text
매 1분마다 실행
```

## 6.3 발송 처리

### 처리 순서

1. 현재 시간 기준 발송 대상 조회
2. 대상 사용자의 Push Subscription 조회
3. Web Push 발송
4. 성공 시 schedule 상태를 `SENT`로 변경
5. 실패 시 `FAILED` 처리 또는 `retry_count` 증가
6. 만료된 subscription은 삭제 또는 비활성화

### 동시성 고려

- Scheduler가 여러 인스턴스에서 동시에 실행될 가능성이 있으면 중복 발송 방지 전략 필요
- 초기 구현은 단일 서버 기준으로 진행하고, 운영 확장 시 DB lock 또는 상태 선점 방식 검토

## Phase 7. Service Worker Push 처리

## 7.1 push 이벤트 처리

### 작업 내용

`service-worker.js`에서 push 이벤트를 수신한다.

```javascript
self.addEventListener('push', event => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      data: {
        url: data.url
      }
    })
  );
});
```

## 7.2 notificationclick 이벤트 처리

### 작업 내용

알림 클릭 시 앱의 특정 페이지로 이동한다.

```javascript
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});
```

## Phase 8. 예외 처리 및 보안

## 8.1 권한 거부 처리

- 사용자가 알림 권한을 거부한 경우 기능 비활성화
- 다시 활성화하려면 브라우저 설정에서 권한 변경이 필요함을 안내

## 8.2 Subscription 만료 처리

Web Push 발송 시 다음과 같은 응답이 발생할 수 있다.

| 상태 | 처리 |
|---|---|
| 404 | subscription 삭제 |
| 410 | subscription 만료로 삭제 |
| 401/403 | VAPID 설정 확인 |
| 기타 | 실패 로그 저장 후 재시도 |

## 8.3 HTTPS requirement

- Push API와 Service Worker는 HTTPS 환경이 필요하다.
- 로컬 개발 환경에서는 `localhost` 예외가 허용된다.
- 운영 배포 시 반드시 HTTPS 적용 필요.

## 8.4 인증 및 사용자 매핑

- Push Subscription 저장과 알림 예약 API는 로그인 사용자 기준으로 처리한다.
- 다른 사용자의 예약 알림 또는 subscription을 조회/삭제할 수 없도록 검증한다.

## Phase 9. 테스트 계획

## 9.1 Frontend 테스트

- 브라우저 알림 권한 요청 확인
- Service Worker 등록 여부 확인
- Push Subscription 생성 여부 확인
- 예약 알림 등록 UI 동작 확인

## 9.2 Backend 테스트

- Subscription 저장 API 테스트
- 예약 알림 등록 API 테스트
- Scheduler 대상 조회 테스트
- Web Push 발송 성공/실패 테스트

## 9.3 통합 테스트

### 시나리오

1. 사용자가 알림 권한 허용
2. Subscription이 서버에 저장됨
3. 사용자가 1분 뒤 알림 예약
4. Scheduler가 예약 알림 조회
5. Web Push 발송
6. 브라우저에서 알림 수신
7. 알림 상태가 `SENT`로 변경됨

## Phase 10. 구현 순서

1. VAPID key 생성 및 Backend 설정 추가
2. DB 테이블 생성
3. Push Subscription Entity / Repository / API 구현
4. Notification Schedule Entity / Repository / API 구현
5. Frontend Service Worker 등록
6. Frontend Notification 권한 요청 구현
7. Frontend Push Subscription 생성 및 서버 전송
8. 예약 알림 등록 UI 구현
9. Web Push 발송 서비스 구현
10. Spring Scheduler 구현
11. Service Worker push / notificationclick 이벤트 구현
12. 로컬 통합 테스트
13. 실패 처리 및 subscription 만료 처리 보완
14. 운영 환경 HTTPS 및 secret 설정 점검

## 11. 예상 API 목록

| Method | URL | 설명 |
|---|---|---|
| GET | `/api/push/vapid-public-key` | VAPID public key 조회 |
| POST | `/api/push/subscriptions` | Push Subscription 저장 |
| DELETE | `/api/push/subscriptions` | Push Subscription 해제 |
| POST | `/api/notifications/schedules` | 예약 알림 등록 |
| GET | `/api/notifications/schedules` | 예약 알림 목록 조회 |
| PATCH | `/api/notifications/schedules/{id}/cancel` | 예약 알림 취소 |

## 12. 완료 기준

- 사용자가 브라우저에서 알림 권한을 허용할 수 있다.
- Push Subscription이 Backend DB에 저장된다.
- 사용자가 알림 내용과 예약 시간을 등록할 수 있다.
- Scheduler가 예약 시간이 지난 알림을 조회한다.
- Backend가 Web Push를 통해 브라우저로 알림을 발송한다.
- Service Worker가 push 이벤트를 받아 알림을 표시한다.
- 발송 성공 시 알림 상태가 `SENT`로 변경된다.
- 만료된 Subscription은 정리된다.
