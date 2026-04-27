import { apiClient } from "@/lib/api-client";
import { useRealApi } from "@/lib/api-mode";
import {
  profileScreenMock,
  settingsMock,
  socialLoginMock,
  splashMock,
  unsubscribeMock,
} from "./mock-data";
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

export async function getProfileScreen(): Promise<ProfileScreenData> {
  return profileScreenMock;
}

export async function getSettings(): Promise<SettingsData> {
  return settingsMock;
}

export async function getSocialLogin(): Promise<SocialLoginData> {
  return socialLoginMock;
}

export async function loginWithSocialProvider(
  providerType: AuthProvider,
): Promise<AuthResponse> {
  const payload = demoLoginPayloads[providerType];

  if (!useRealApi) {
    return {
      token: `mock-token-${payload.socialType.toLowerCase()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 1,
        email: payload.email,
        socialType: payload.socialType,
        nickname: payload.nickname,
      },
    };
  }

  return apiClient.post<AuthResponse>("/api/auth/login", payload, {
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
  return splashMock;
}

export async function getUnsubscribeGuide(): Promise<UnsubscribeData> {
  return unsubscribeMock;
}
