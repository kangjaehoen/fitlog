import { apiClient } from "@/lib/api-client";
import type {
  ProfileScreenData,
  SettingsData,
  SocialLoginData,
  SplashData,
  UnsubscribeData,
  AuthResponse,
  AuthUser,
} from "./types";

type AuthProvider = AuthResponse["user"]["socialType"];
type KakaoAuthorizeUrlResponse = {
  authorizationUrl: string;
};

const settingsData: SettingsData = {
  accountActions: [
    { label: "로그아웃", action: "logout" },
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

const socialLoginData: SocialLoginData = {
  title: "FitLog 시작하기",
  subtitle: "운동과 식단 루틴을 한 곳에서 관리해 보세요.",
  options: [
    {
      provider: "K",
      providerType: "KAKAO",
      label: "카카오로 시작하기",
      href: "/",
      tone: "kakao",
    },
    {
      provider: "G",
      providerType: "GOOGLE",
      label: "Google로 시작하기",
      href: "/",
      tone: "google",
    },
    {
      provider: "A",
      providerType: "APPLE",
      label: "Apple로 시작하기",
      href: "/",
      tone: "apple",
    },
  ],
};

const splashData: SplashData = {
  title: "FitLog",
  subtitle: "당신의 운동과 식단을 위한 매일의 기록",
  versionLabel: "Premium FitLog | v1.2.0",
  redirectHref: "/social-login",
};

const unsubscribeData: UnsubscribeData = {
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

const demoLoginPayloads: Record<AuthProvider, {
  socialType: AuthProvider;
  providerUserId: string;
  email: string;
  nickname: string;
}> = {
  KAKAO: {
    socialType: "KAKAO",
    providerUserId: "fitlog-demo-kakao",
    email: "kakao.demo@fitlog.local",
    nickname: "Kakao User",
  },
  GOOGLE: {
    socialType: "GOOGLE",
    providerUserId: "fitlog-demo-google",
    email: "google.demo@fitlog.local",
    nickname: "Google User",
  },
  APPLE: {
    socialType: "APPLE",
    providerUserId: "fitlog-demo-apple",
    email: "apple.demo@fitlog.local",
    nickname: "Apple User",
  },
};

export async function getProfileScreen(token?: string): Promise<ProfileScreenData> {
  return apiClient.get<ProfileScreenData>("/api/account/profile", {
    cache: "no-store",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}

export async function updateProfileNickname(
  nickname: string,
  token: string | null,
): Promise<ProfileScreenData> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<ProfileScreenData>(
    "/api/account/profile",
    { nickname },
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getSettings(): Promise<SettingsData> {
  return settingsData;
}

export async function getSocialLogin(): Promise<SocialLoginData> {
  return socialLoginData;
}

export async function loginWithSocialProvider(
  providerType: AuthProvider,
): Promise<AuthResponse> {
  const payload = demoLoginPayloads[providerType];

  return apiClient.post<AuthResponse>("/api/auth/login", payload, {
    cache: "no-store",
  });
}

export async function getSocialLoginRedirectUrl(
  providerType: AuthProvider,
): Promise<string | null> {
  if (providerType !== "KAKAO") {
    return null;
  }

  const response = await apiClient.get<KakaoAuthorizeUrlResponse>(
    "/api/auth/kakao/authorize-url",
    {
      cache: "no-store",
    },
  );

  return response.authorizationUrl;
}

export async function loginWithKakaoCode(code: string): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(
    "/api/auth/kakao/callback",
    { code },
    {
      cache: "no-store",
    },
  );
}

export async function logout() {
  return apiClient.post<{ success: boolean }>("/api/auth/logout", undefined, {
    cache: "no-store",
  });
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/api/auth/me", {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getSplash(): Promise<SplashData> {
  return splashData;
}

export async function getUnsubscribeGuide(): Promise<UnsubscribeData> {
  return unsubscribeData;
}
