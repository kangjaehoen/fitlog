import Link from "next/link";
import type { ReactNode } from "react";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  HelpCircleIcon,
  InfoIcon,
  SparklesIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { FaqDetail } from "../types";

type FaqDetailScreenProps = {
  faq: FaqDetail | null;
  loadFailed?: boolean;
};

function parseDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatUpdatedAt(value: string) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatShortDate(value: string) {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\s/g, "");
}

function categoryLabel(category: string | null) {
  return category?.trim() || "공통";
}

function DetailMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[12px] bg-white/15 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-1.5 text-white/70">
        {icon}
        <p className="truncate text-[10px] font-bold leading-none">{label}</p>
      </div>
      <p className="truncate text-[14px] font-black leading-tight text-white">
        {value}
      </p>
    </div>
  );
}

function MissingFaqState({ loadFailed }: { loadFailed: boolean }) {
  return (
    <div className="min-h-screen bg-[#f8f8ff]">
      <StackHeader title="FAQ 상세" fallbackHref="/faq" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-10 pt-3">
        <section className="rounded-[14px] border border-dashed border-[#d8d3ff] bg-white px-5 py-10 text-center shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
          <div className="mx-auto grid size-12 place-items-center rounded-[16px] bg-[#f1efff] text-[#6653e9]">
            <InfoIcon className="size-6" />
          </div>
          <h1 className="mt-4 text-[14px] font-black text-[#11172f]">
            {loadFailed ? "FAQ를 불러오지 못했습니다" : "FAQ를 찾을 수 없습니다"}
          </h1>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9299b2]">
            {loadFailed
              ? "서버 연결 후 다시 시도해 주세요."
              : "삭제되었거나 공개되지 않은 FAQ입니다."}
          </p>
          <Link
            href="/faq"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#8876fb,#6150dc)] px-5 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(97,80,220,0.24)] transition active:scale-[0.98]"
          >
            FAQ 목록으로
            <ChevronRightIcon className="size-4" />
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
    <div className="min-h-screen bg-[#f8f8ff]">
      <StackHeader title="FAQ 상세" fallbackHref="/faq" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-10 pt-3">
        <article className="relative overflow-hidden rounded-[14px] px-5 py-[18px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)] [background-image:radial-gradient(circle_at_82%_25%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#8374f6_0%,#6651e8_48%,#5941d9_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-5 top-4 grid size-[104px] rotate-[-14deg] place-items-center rounded-[24px] border border-white/15 bg-white/10 text-white/45 shadow-inner">
            <HelpCircleIcon className="size-12" />
          </div>

          <div className="relative max-w-[276px]">
            <p className="text-[11px] font-black leading-none tracking-[0.22em] text-white/75">
              FAQ DETAIL
            </p>
            <span className="mt-3 inline-flex max-w-full rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#5e48e7] shadow-[0_10px_20px_rgba(42,31,124,0.14)]">
              <span className="truncate">{categoryLabel(faq.category)}</span>
            </span>
            <h1 className="mt-3 text-[22px] font-black leading-tight">
              {faq.question}
            </h1>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-white/80">
              필요한 답변을 바로 확인하고 기록 흐름을 이어가세요.
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2">
            <DetailMetric
              label="분류"
              value={categoryLabel(faq.category)}
              icon={<SparklesIcon className="size-3" />}
            />
            <DetailMetric
              label="최근 수정"
              value={formatShortDate(faq.updatedAt)}
              icon={<ClockIcon className="size-3" />}
            />
          </div>
        </article>

        <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-1.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#7563f1] text-white">
                <CheckCircleIcon className="size-3.5" />
              </span>
              <h2 className="min-w-0 truncate text-[13px] font-black leading-none text-[#22243d]">
                답변
              </h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#6653e9]">
              <ClockIcon className="size-3.5" />
              {formatUpdatedAt(faq.updatedAt) || "업데이트 정보 없음"}
            </span>
          </div>

          <div className="rounded-[12px] border border-[#eef0f8] bg-[#faf9ff] px-4 py-4">
            <p className="whitespace-pre-line text-[14px] font-medium leading-7 text-[#475467]">
              {faq.answer}
            </p>
          </div>
        </section>

        <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#f1efff] text-[#6653e9]">
              <HelpCircleIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-black leading-5 text-[#11172f]">
                다른 질문도 확인해 보세요
              </h2>
              <p className="mt-1.5 text-[12px] font-semibold leading-5 text-[#9299b2]">
                FAQ 목록에서 비슷한 주제의 도움말을 이어서 볼 수 있어요.
              </p>
            </div>
          </div>

          <Link
            href="/faq"
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#d8d3ff] bg-[#f7f5ff] text-[13px] font-black text-[#6653e9] transition active:scale-[0.98]"
          >
            FAQ 목록으로 돌아가기
            <ChevronRightIcon className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
