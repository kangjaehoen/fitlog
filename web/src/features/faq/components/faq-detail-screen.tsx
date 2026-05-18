import Link from "next/link";
import { HelpCircleIcon, InfoIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { FaqDetail } from "../types";

type FaqDetailScreenProps = {
  faq: FaqDetail | null;
  loadFailed?: boolean;
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function MissingFaqState({ loadFailed }: { loadFailed: boolean }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="FAQ 상세" fallbackHref="/faq" />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4 pb-10">
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <InfoIcon className="size-5" />
          </div>
          <h1 className="mt-4 text-sm font-black text-slate-800">
            {loadFailed ? "FAQ를 불러오지 못했습니다" : "FAQ를 찾을 수 없습니다"}
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {loadFailed
              ? "서버 연결 후 다시 시도해 주세요."
              : "삭제되었거나 공개되지 않은 FAQ입니다."}
          </p>
          <Link
            href="/faq"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100"
          >
            FAQ 목록으로
          </Link>
        </section>
      </main>
    </div>
  );
}

export function FaqDetailScreen({
  faq,
  loadFailed = false,
}: FaqDetailScreenProps) {
  if (!faq) {
    return <MissingFaqState loadFailed={loadFailed} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="FAQ 상세" fallbackHref="/faq" />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4 pb-10">
        <article className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <HelpCircleIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              {faq.category ? (
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">
                  {faq.category}
                </p>
              ) : null}
              <h1 className="mt-2 text-xl font-black leading-8 text-slate-950">
                {faq.question}
              </h1>
              <p className="mt-2 text-[11px] font-medium text-slate-400">
                마지막 업데이트 {formatUpdatedAt(faq.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="whitespace-pre-line text-[14px] leading-7 text-slate-600">
              {faq.answer}
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
