import { LegacyScreen } from "@/components/legacy/legacy-screen";

export const metadata = {
  title: "My Page",
};

export default function MyPage() {
  return (
    <LegacyScreen
      title="마이페이지"
      sourceFile="mypage.html"
      current="mypage"
    />
  );
}
