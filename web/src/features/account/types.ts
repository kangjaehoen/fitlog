export type ProfileScreenData = {
  displayName: string;
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
    label: string;
    href: string;
    tone: "kakao" | "google" | "apple";
  }>;
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
