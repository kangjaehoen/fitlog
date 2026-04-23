import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fitlog.local"),
  title: {
    default: "FitLog",
    template: "%s | FitLog",
  },
  description: "운동, 식단, 신체 기록을 한 곳에서 관리하는 FitLog 프런트엔드",
  applicationName: "FitLog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
