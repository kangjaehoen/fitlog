import type { SVGProps } from "react";
import type { SocialLoginData } from "../types";

type IconProps = SVGProps<SVGSVGElement>;

type ProviderType = SocialLoginData["options"][number]["providerType"];

export function FitLogMark(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14 12.5C14 10.6 15.6 9 17.5 9S21 10.6 21 12.5V23h-7V12.5Z"
        fill="currentColor"
      />
      <path
        d="M22 8.5C22 6.6 23.6 5 25.5 5S29 6.6 29 8.5V23h-7V8.5Z"
        fill="currentColor"
      />
      <path
        d="M30 11.5C30 9.6 31.6 8 33.5 8S37 9.6 37 11.5V23h-7V11.5Z"
        fill="currentColor"
      />
      <path
        d="M7 17.5C7 15.6 8.6 14 10.5 14S14 15.6 14 17.5V27H7v-9.5Z"
        fill="currentColor"
      />
      <path
        d="M7 22h30v8.5C37 38 31.5 43 23.6 43H20c-7.2 0-13-5.8-13-13V22Z"
        fill="currentColor"
      />
      <path
        d="M15.5 28h15"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.19 3.32v2.76h3.55c2.08-1.91 3.28-4.73 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.76c-.98.66-2.24 1.05-3.73 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.95l3.66-2.85Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 4C6.48 4 2 7.5 2 11.82c0 2.8 1.88 5.25 4.7 6.63l-.78 2.83c-.07.26.23.48.45.32l3.43-2.29c.71.14 1.45.22 2.2.22 5.52 0 10-3.5 10-7.81C22 7.5 17.52 4 12 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ProviderLogo({
  providerType,
  ...props
}: IconProps & { providerType: ProviderType }) {
  if (providerType === "KAKAO") {
    return <KakaoLogo {...props} />;
  }

  if (providerType === "GOOGLE") {
    return <GoogleLogo {...props} />;
  }

  return null;
}
