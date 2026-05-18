import { apiClient } from "@/lib/api-client";
import type {
  ProfileScreenData,
  SettingsData,
  SocialLoginData,
  SplashData,
  UnsubscribeData,
  AuthResponse,
  AuthUser,
  PrivacyPolicyData,
} from "./types";

type AuthProvider = AuthResponse["user"]["socialType"];
type AuthorizeUrlResponse = {
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
    { label: "자주 묻는 질문 (FAQ)", href: "/faq", icon: "faq" },
    { label: "개인정보 처리방침", href: "/privacy-policy", icon: "shield" },
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
    "계정은 탈퇴 상태로 전환되며 같은 계정으로 서비스 이용이 제한됩니다.",
    "운동, 식단, 신체 기록은 즉시 물리 삭제하지 않고 탈퇴 상태 계정에 묶어 보관됩니다.",
    "커뮤니티 게시물과 리뷰는 자동 삭제되지 않을 수 있어 직접 정리해 주세요.",
    "진행 중인 주문 또는 구독이 있다면 탈퇴가 제한될 수 있습니다.",
  ],
  continueLabel: "계속 이용하기",
  withdrawLabel: "탈퇴하기",
  agreementLabel: "안내 내용을 모두 확인했으며, 탈퇴에 동의합니다.",
  confirmMessage: "정말로 탈퇴하시겠어요? 계정이 탈퇴 상태로 전환되고 서비스 이용이 제한됩니다.",
  successMessage: "탈퇴 처리가 완료되었습니다.",
};

const privacyPolicyData: PrivacyPolicyData = {
  effectiveDate: "2026년 5월 18일",
  lastUpdated: "2026년 5월 18일",
  intro:
    "FitLog는 이용자의 운동, 식단, 신체 기록을 안전하게 관리하고 맞춤형 기록 경험을 제공하기 위해 필요한 개인정보만 처리합니다.",
  summaryItems: [
    { label: "주요 목적", value: "계정 관리, 기록 저장, 분석, 알림" },
    { label: "주요 항목", value: "회원 정보, 운동/식단/신체 기록" },
    { label: "보유 기간", value: "회원 탈퇴 또는 삭제 요청 시까지" },
    { label: "제3자 제공", value: "동의 또는 법령상 근거가 있는 경우에 한함" },
  ],
  sections: [
    {
      title: "1. 개인정보 처리 목적",
      description:
        "FitLog는 다음 목적을 위해 개인정보를 처리하며, 목적이 변경되는 경우 필요한 조치를 거칩니다.",
      items: [
        {
          label: "회원 식별 및 계정 관리",
          values: [
            "소셜 로그인 기반 회원 식별, 로그인 유지, 계정 상태 관리",
          ],
        },
        {
          label: "기록 서비스 제공",
          values: [
            "운동, 식단, 신체 정보, 목표 기록의 저장, 조회, 수정",
          ],
        },
        {
          label: "분석 및 리마인더",
          values: [
            "주간 기록 분석, 목표 달성 현황 표시, 식단/운동 알림 제공",
          ],
        },
        {
          label: "서비스 운영",
          values: [
            "오류 확인, 부정 이용 방지, 고객 문의 및 고충 처리",
          ],
        },
      ],
    },
    {
      title: "2. 처리하는 개인정보 항목",
      items: [
        {
          label: "회원 정보",
          values: [
            "이메일, 닉네임, 소셜 로그인 제공자, 제공자 회원 식별자, 프로필 이미지 URL",
          ],
        },
        {
          label: "신체 및 건강 관련 기록",
          values: ["키, 체중, 골격근량, 체지방률, 측정일"],
        },
        {
          label: "운동 기록",
          values: [
            "운동일, 운동명, 세트, 중량, 반복 수, 운동 시간, 강도, 소모 칼로리, 메모",
          ],
        },
        {
          label: "식단 기록",
          values: [
            "식사일, 식사 유형, 음식명, 섭취량, 칼로리, 탄수화물, 단백질, 지방, 당류, 나트륨, 메모",
          ],
        },
        {
          label: "목표 정보",
          values: [
            "목표 체중, 일일 칼로리 목표, 탄수화물/단백질/지방 목표, 주간 운동 목표",
          ],
        },
        {
          label: "알림 정보",
          values: [
            "알림 제목, 내용, 이동 경로, 예약 시각, 발송/읽음 상태, 푸시 구독 endpoint, p256dh, auth, user agent",
          ],
        },
        {
          label: "자동 생성 정보",
          values: [
            "인증 토큰, 쿠키, 브라우저 저장소 정보, 접속 로그, IP 주소, 기기 및 브라우저 정보",
          ],
        },
      ],
    },
    {
      title: "3. 민감정보 처리",
      description:
        "FitLog의 신체, 운동, 식단 기록에는 건강 관련 정보가 포함될 수 있습니다.",
      items: [
        {
          label: "처리 목적",
          values: [
            "이용자가 입력한 건강 관련 정보는 기록 관리, 목표 확인, 분석 제공 목적에 한해 처리합니다.",
          ],
        },
        {
          label: "비공개 원칙",
          values: [
            "해당 정보는 다른 이용자에게 공개하지 않으며, 목적 외 사용을 제한합니다.",
          ],
        },
      ],
    },
    {
      title: "4. 보유 및 이용 기간",
      items: [
        {
          label: "회원 및 기록 정보",
          values: ["회원 탈퇴 또는 이용자의 삭제 요청 시까지 보관합니다."],
        },
        {
          label: "푸시 구독 정보",
          values: [
            "알림 해제, 로그아웃, 회원 탈퇴 또는 구독 삭제 요청 시까지 보관합니다.",
          ],
        },
        {
          label: "법령상 보존 정보",
          values: [
            "관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 분리 보관합니다.",
          ],
        },
      ],
    },
    {
      title: "5. 개인정보의 제3자 제공",
      items: [
        {
          label: "원칙",
          values: [
            "FitLog는 이용자의 개인정보를 외부에 제공하지 않습니다.",
          ],
        },
        {
          label: "예외",
          values: [
            "이용자가 사전에 동의한 경우 또는 법령에 따라 제출 의무가 있는 경우에만 제공할 수 있습니다.",
          ],
        },
      ],
    },
    {
      title: "6. 개인정보 처리 위탁",
      items: [
        {
          label: "운영 기준",
          values: [
            "서비스 운영을 위해 서버 호스팅, 데이터 보관, 알림 발송 등 업무를 외부 사업자에게 맡기는 경우 수탁자, 위탁 업무, 보유 기간을 공개합니다.",
          ],
        },
        {
          label: "관리 감독",
          values: [
            "위탁 계약 시 목적 외 처리 금지, 안전성 확보 조치, 재위탁 제한, 관리 감독에 관한 사항을 반영합니다.",
          ],
        },
      ],
    },
    {
      title: "7. 개인정보 파기",
      items: [
        {
          label: "파기 절차",
          values: [
            "처리 목적 달성, 회원 탈퇴, 보유 기간 종료 시 지체 없이 파기합니다.",
          ],
        },
        {
          label: "파기 방법",
          values: [
            "전자 파일은 복구하기 어려운 방식으로 삭제하고, 별도 보관 대상은 분리 보관 후 기간 종료 시 삭제합니다.",
          ],
        },
      ],
    },
    {
      title: "8. 이용자 권리와 행사 방법",
      items: [
        {
          label: "권리",
          values: [
            "이용자는 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.",
          ],
        },
        {
          label: "행사 방법",
          values: [
            "앱 내 설정, 회원 탈퇴 기능, 고객 문의 채널을 통해 요청할 수 있으며 FitLog는 본인 확인 후 처리합니다.",
          ],
        },
      ],
    },
    {
      title: "9. 쿠키 및 브라우저 저장소",
      items: [
        {
          label: "사용 목적",
          values: [
            "로그인 유지, 화면 이동, 사용자 설정 저장을 위해 쿠키와 브라우저 저장소를 사용할 수 있습니다.",
          ],
        },
        {
          label: "거부 방법",
          values: [
            "이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 저장된 정보를 삭제할 수 있습니다. 다만 일부 기능 이용이 제한될 수 있습니다.",
          ],
        },
      ],
    },
    {
      title: "10. 안전성 확보 조치",
      items: [
        {
          label: "기술적 조치",
          values: [
            "인증 토큰 관리, 접근 권한 제한, 전송 구간 암호화, 접속 기록 관리",
          ],
        },
        {
          label: "관리적 조치",
          values: [
            "개인정보 접근 최소화, 운영 권한 관리, 개인정보 처리 현황 점검",
          ],
        },
      ],
    },
    {
      title: "11. 개인정보 보호책임자",
      items: [
        {
          label: "담당",
          values: ["FitLog 운영팀"],
        },
        {
          label: "문의",
          values: [
            "개인정보 관련 문의, 권리 행사, 고충 처리는 앱 내 문의 채널 또는 운영자가 별도로 안내한 연락처로 접수할 수 있습니다.",
          ],
        },
      ],
    },
    {
      title: "12. 처리방침 변경",
      items: [
        {
          label: "고지",
          values: [
            "개인정보 처리방침이 변경되는 경우 시행일과 변경 내용을 서비스 화면 또는 공지사항을 통해 안내합니다.",
          ],
        },
      ],
    },
  ],
  notice:
    "본 방침은 현재 FitLog 서비스 기능을 기준으로 작성되었으며, 실제 운영 환경과 위탁사가 확정되면 해당 내용을 최신 상태로 반영합니다.",
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

export async function getSocialLoginRedirectUrl(
  providerType: AuthProvider,
): Promise<string> {
  const authorizeUrlPaths: Record<AuthProvider, string> = {
    KAKAO: "/api/auth/kakao/authorize-url",
    GOOGLE: "/api/auth/google/authorize-url",
  };

  const response = await apiClient.get<AuthorizeUrlResponse>(
    authorizeUrlPaths[providerType],
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

export async function updateProfileImage(
  image: File,
  token: string | null,
): Promise<{ profileImageUrl: string }> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  const formData = new FormData();
  formData.append("image", image);

  return apiClient.postForm<{ profileImageUrl: string }>(
    "/api/account/profile/image",
    formData,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function withdrawAccount(token: string | null) {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<{ ok: boolean }>("/api/account/withdraw", undefined, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function loginWithGoogleCode(code: string): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(
    "/api/auth/google/callback",
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

export async function getPrivacyPolicy(): Promise<PrivacyPolicyData> {
  return privacyPolicyData;
}
