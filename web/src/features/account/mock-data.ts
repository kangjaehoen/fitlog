import type {
  ProfileScreenData,
  SettingsData,
  SocialLoginData,
  SplashData,
  UnsubscribeData,
} from "./types";

export const profileScreenMock: ProfileScreenData = {
  displayName: "김운동",
  startedDaysAgo: 124,
  levelLabel: "Lv.4 숙련자",
  streakLabel: "5일 연속",
  summaryStats: [
    { label: "이번 달 운동", value: "18회" },
    { label: "총 운동 시간", value: "86h" },
    { label: "누적 볼륨", value: "42.5t" },
  ],
  goal: {
    label: "80% 달성",
    percent: 80,
    helper: "이번 달 목표인 주 4회 운동까지 단 2회 남았습니다.",
  },
  metrics: [
    {
      key: "weight",
      label: "몸무게",
      value: "74.2",
      unit: "kg",
      delta: "-0.4",
      deltaDirection: "down",
      color: "#4f46e5",
      series: [74.9, 74.7, 74.8, 74.4, 74.2],
    },
    {
      key: "muscle",
      label: "골격근량",
      value: "36.5",
      unit: "kg",
      delta: "+0.2",
      deltaDirection: "up",
      color: "#059669",
      series: [35.8, 36.0, 36.1, 36.3, 36.5],
    },
    {
      key: "fat",
      label: "체지방률",
      value: "16.8",
      unit: "%",
      delta: "-1.2",
      deltaDirection: "down",
      color: "#e11d48",
      series: [18.0, 17.8, 17.5, 17.1, 16.8],
    },
  ],
  shortcuts: [
    {
      label: "신체 데이터 기록",
      description: "몸무게, 골격근량, 체지방률을 바로 남기기",
      href: "/body-info",
    },
    {
      label: "루틴 편집",
      description: "이번 주 루틴을 세트 단위로 조정하기",
      href: "/routine-edit",
    },
    {
      label: "설정",
      description: "알림과 계정 관련 옵션 관리",
      href: "/setting",
    },
  ],
};

export const settingsMock: SettingsData = {
  accountActions: [
    { label: "로그아웃" },
    { label: "서비스 탈퇴", href: "/unsubscribe-guide", tone: "danger" },
  ],
  notifications: [
    {
      key: "push",
      title: "푸시 알림 전체 사용",
      enabled: true,
      icon: "bell",
    },
    {
      key: "meal",
      title: "식단 기록 리마인더",
      description: "식사 시간이 지나면 가볍게 기록을 리마인드해요.",
      enabled: true,
      icon: "meal",
    },
    {
      key: "workout",
      title: "운동 기록 리마인더",
      description: "오늘 운동 목표를 놓치지 않도록 알려드려요.",
      enabled: false,
      icon: "workout",
    },
  ],
  infoItems: [
    { label: "자주 묻는 질문 (FAQ)", href: "#", icon: "faq" },
    { label: "개인정보 처리방침", href: "#", icon: "shield" },
    { label: "버전 정보", value: "v1.2.0 최신", icon: "info" },
  ],
};

export const socialLoginMock: SocialLoginData = {
  title: "FitLog 시작하기",
  subtitle: "운동과 식단 루틴을 한 곳에서 관리해 보세요.",
  options: [
    {
      provider: "K",
      label: "카카오로 시작하기",
      href: "/",
      tone: "kakao",
    },
    {
      provider: "G",
      label: "Google로 시작하기",
      href: "/",
      tone: "google",
    },
    {
      provider: "A",
      label: "Apple로 시작하기",
      href: "/",
      tone: "apple",
    },
  ],
};

export const splashMock: SplashData = {
  title: "FitLog",
  subtitle: "당신의 운동과 식단을 위한 매일의 기록",
  versionLabel: "Premium FitLog | v1.2.0",
  redirectHref: "/social-login",
};

export const unsubscribeMock: UnsubscribeData = {
  cautions: [
    "계정 정보와 개인 프로필 데이터는 모두 삭제되며 복구할 수 없습니다.",
    "보유 중인 혜택과 쿠폰은 모두 소멸되고 이후에도 복구되지 않습니다.",
    "커뮤니티 게시물과 리뷰는 자동 삭제되지 않을 수 있어 직접 정리해 주세요.",
    "진행 중인 주문 또는 구독이 있다면 탈퇴가 제한될 수 있습니다.",
  ],
  continueLabel: "계속 이용하기",
  withdrawLabel: "탈퇴하기",
  agreementLabel: "안내 내용을 모두 확인했으며, 탈퇴에 동의합니다.",
  confirmMessage: "정말로 탈퇴하시겠어요? 모든 정보가 영구적으로 삭제됩니다.",
  successMessage: "탈퇴 처리 요청이 접수되었습니다.",
};
