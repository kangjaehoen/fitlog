import Link from "next/link";
import {
  ChevronRightIcon,
  HelpCircleIcon,
  InfoIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { FaqSummary } from "../types";

type FaqListScreenProps = {
  faqs: FaqSummary[];
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

function EmptyFaqState({ loadFailed }: { loadFailed: boolean }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <InfoIcon className="size-5" />
      </div>
      <h2 className="mt-4 text-sm font-black text-slate-800">
        {loadFailed ? "FAQ를 불러오지 못했습니다" : "등록된 FAQ가 없습니다"}
      </h2>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        {loadFailed
          ? "서버 연결 후 다시 열면 등록된 FAQ가 표시됩니다."
          : "FAQ 게시글이 등록되면 이곳에 표시됩니다."}
      </p>
    </section>
  );
}

export function FaqListScreen({
  faqs,
  loadFailed = false,
}: FaqListScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="자주 묻는 질문" fallbackHref="/setting" />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4 pb-10">
        <header className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <HelpCircleIcon className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                FitLog FAQ
              </p>
              <h1 className="mt-2 text-xl font-black leading-7 text-slate-950">
                자주 묻는 질문
              </h1>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">
                이용 중 궁금한 내용을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </header>

        {faqs.length > 0 ? (
          <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
            {faqs.map((faq, index) => (
              <Link
                key={faq.id}
                href={`/faq/${faq.id}`}
                className={`flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 ${
                  index < faqs.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <HelpCircleIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  {faq.category ? (
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-400">
                      {faq.category}
                    </p>
                  ) : null}
                  <h2 className="mt-1 truncate text-sm font-black text-slate-800">
                    {faq.question}
                  </h2>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {formatUpdatedAt(faq.updatedAt)}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </section>
        ) : (
          <EmptyFaqState loadFailed={loadFailed} />
        )}
      </main>
    </div>
  );
}
