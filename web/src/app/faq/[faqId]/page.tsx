import { getFaqDetail } from "@/features/faq/api";
import { FaqDetailScreen } from "@/features/faq/components/faq-detail-screen";
import type { FaqDetail } from "@/features/faq/types";

type FaqDetailPageProps = {
  params: Promise<{
    faqId: string;
  }>;
};

export const metadata = {
  title: "FAQ 상세",
};

export default async function FaqDetailPage({ params }: FaqDetailPageProps) {
  const { faqId } = await params;
  let faq: FaqDetail | null = null;
  let loadFailed = false;

  try {
    faq = await getFaqDetail(faqId);
  } catch {
    loadFailed = true;
  }

  return <FaqDetailScreen faq={faq} loadFailed={loadFailed} />;
}
