import { getFaqList } from "@/features/faq/api";
import { FaqListScreen } from "@/features/faq/components/faq-list-screen";
import type { FaqSummary } from "@/features/faq/types";

export const metadata = {
  title: "자주 묻는 질문",
};

export default async function FaqPage() {
  let faqs: FaqSummary[] = [];
  let loadFailed = false;

  try {
    faqs = await getFaqList();
  } catch {
    loadFailed = true;
  }

  return <FaqListScreen faqs={faqs} loadFailed={loadFailed} />;
}
