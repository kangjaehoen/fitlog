export type ProfileScreenData = {
  displayName: string;
  profileImageUrl?: string | null;
  startedDaysAgo: number;
  levelLabel: string;
  streakLabel: string;
  summaryStats: Array<{
    label: string;
    value: string;
  }>;
  goal: {
    label: string;
    percent: number;
    helper: string;
  };
  metrics: Array<{
    key: "weight" | "muscle" | "fat";
    label: string;
    value: string;
    unit: string;
    delta: string;
    deltaDirection: "up" | "down";
    color: string;
    series: number[];
    dateLabels?: string[];
  }>;
  shortcuts: Array<{
    label: string;
    description: string;
    href: string;
  }>;
};

export type SettingsData = {
  accountActions: Array<{
    label: string;
    action?: "logout";
    href?: string;
    tone?: "default" | "danger";
  }>;
  notifications: Array<{
    key: string;
    title: string;
    description?: string;
    enabled: boolean;
    icon: "bell" | "meal" | "workout";
  }>;
  infoItems: Array<{
    label: string;
    value?: string;
    href?: string;
    icon: "faq" | "shield" | "info";
  }>;
};

export type SocialLoginData = {
  title: string;
  subtitle: string;
  options: Array<{
    provider: string;
    providerType: "KAKAO" | "GOOGLE";
    label: string;
    href: string;
    tone: "kakao" | "google";
  }>;
};

export type AuthUser = {
  id: number;
  email: string;
  socialType: "KAKAO" | "GOOGLE";
  nickname: string;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

export type SplashData = {
  title: string;
  subtitle: string;
  versionLabel: string;
  redirectHref: string;
};

export type UnsubscribeData = {
  cautions: string[];
  continueLabel: string;
  withdrawLabel: string;
  agreementLabel: string;
  confirmMessage: string;
  successMessage: string;
};

export type PrivacyPolicyData = {
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  summaryItems: Array<{
    label: string;
    value: string;
  }>;
  sections: Array<{
    title: string;
    description?: string;
    items: Array<{
      label: string;
      values: string[];
    }>;
  }>;
  notice: string;
};
