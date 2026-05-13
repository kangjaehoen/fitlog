# Frontend Push Notification Plan

## 목표

`PUSH_NOTIFICATION_PLAN.md`의 Frontend 범위인 Notification API, Service Worker, Push API 설정을 먼저 구현한다. 사용자는 설정 화면에서 푸시 알림을 켤 수 있고, 브라우저 권한 허용 후 생성된 Push Subscription이 Backend로 전송되어야 한다.

## 적용 위치

- 진입 화면: `web/src/features/account/components/settings-screen.tsx`
- 정적 Service Worker: `web/public/service-worker.js`
- 푸시 전용 프론트 모듈: `web/src/features/push`

## 생성 파일

### `web/public/service-worker.js`

브라우저가 직접 읽는 루트 스코프 Service Worker 파일이다.

역할:

- `push` 이벤트 수신
- payload의 `title`, `body`, `url`을 읽어 브라우저 알림 표시
- payload가 없거나 JSON 파싱에 실패해도 기본 알림 표시
- `notificationclick` 이벤트에서 기존 앱 창을 찾거나 새 창으로 이동
- 알림 아이콘은 우선 기존 `web/public/icons/custom/bell.svg` 사용

### `web/src/features/push/types.ts`

푸시 알림 관련 타입을 모은다.

주요 타입:

- `PushPermissionStatus`
- `VapidPublicKeyResponse`
- `PushSubscriptionPayload`
- `PushSubscriptionKeys`

### `web/src/features/push/api.ts`

Backend Push API 호출을 담당한다.

대상 API:

- `GET /api/push/vapid-public-key`
- `POST /api/push/subscriptions`
- `DELETE /api/push/subscriptions`

인증 토큰은 `web/src/features/account/auth-session.ts`의 `getPersistedAuthToken()`을 통해 읽고 `Authorization: Bearer ...` 헤더로 전달한다.

### `web/src/features/push/browser-push.ts`

브라우저 전용 API 접근을 이 파일로 제한한다.

주요 함수:

- `isPushNotificationSupported()`
- `getNotificationPermission()`
- `requestNotificationPermission()`
- `registerPushServiceWorker()`
- `getExistingPushSubscription()`
- `subscribeBrowserPush()`
- `unsubscribeBrowserPush()`
- `serializePushSubscription()`

### `web/src/features/push/use-push-notification.ts`

설정 화면에서 사용할 client hook이다.

관리 상태:

- 브라우저 지원 여부
- Notification 권한 상태
- Push Subscription 등록 여부
- 등록/해제 진행 상태
- 사용자 안내 메시지

주요 액션:

- `enablePushNotification()`
- `disablePushNotification()`
- `refreshPushStatus()`

## 수정 파일

### `web/src/features/account/components/settings-screen.tsx`

현재 `push` 토글은 local state만 변경한다. 이를 실제 브라우저 푸시 등록 흐름에 연결한다.

ON 처리:

1. 브라우저 지원 여부 확인
2. Service Worker 등록
3. Notification 권한 요청
4. VAPID public key 조회
5. Push Subscription 생성
6. Backend 저장
7. 설정 화면의 push 상태 활성화

OFF 처리:

1. 기존 Push Subscription 조회
2. 브라우저 구독 해제
3. Backend 구독 해제 요청
4. 설정 화면의 push, meal, workout 상태 비활성화

### `web/src/lib/api-client.ts`

`DELETE /api/push/subscriptions` 호출을 위해 `delete()` 메서드를 추가한다. 응답이 `204 No Content`이거나 빈 body인 경우도 처리할 수 있게 한다.

## 예외 처리

- Push API, Notification API, Service Worker 미지원 브라우저는 토글을 켜지 않는다.
- 권한이 `denied`인 경우 브라우저 설정에서 권한을 다시 허용해야 한다는 메시지를 보여준다.
- Backend API가 아직 준비되지 않았거나 실패하면 사용자가 볼 수 있는 실패 메시지를 남기고 토글을 켜지 않는다.
- `localhost`는 로컬 개발 예외로 허용되지만, 운영 환경은 HTTPS가 필요하다.

## 완료 기준

- `/setting`에서 푸시 알림 토글 ON 시 브라우저 권한 요청이 뜬다.
- 권한 허용 후 Service Worker가 등록된다.
- Push Subscription이 생성된다.
- 생성된 Subscription이 Backend 저장 API로 전송된다.
- 토글 OFF 시 브라우저 구독 해제와 Backend 해제 API 호출이 수행된다.
- Service Worker가 `push`와 `notificationclick` 이벤트를 처리한다.
