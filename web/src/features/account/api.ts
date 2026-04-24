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
} from "./types";

export async function getProfileScreen(): Promise<ProfileScreenData> {
  return profileScreenMock;
}

export async function getSettings(): Promise<SettingsData> {
  return settingsMock;
}

export async function getSocialLogin(): Promise<SocialLoginData> {
  return socialLoginMock;
}

export async function getSplash(): Promise<SplashData> {
  return splashMock;
}

export async function getUnsubscribeGuide(): Promise<UnsubscribeData> {
  return unsubscribeMock;
}
