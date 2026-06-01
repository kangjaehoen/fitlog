"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import {
  ChevronRightIcon,
  ClockIcon,
  HelpCircleIcon,
  InfoIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { FaqSummary } from "../types";

type FaqListScreenProps = {
  faqs: FaqSummary[];
  loadFailed?: boolean;
};

const ALL_CATEGORY = "__all__";

const itemTones = [
  {
    icon: "bg-[#f1efff] text-[#6653e9]",
    chip: "bg-[#f1efff] text-[#6653e9]",
    chevron: "text-[#6653e9]",
  },
  {
    icon: "bg-emerald-50 text-emerald-600",
    chip: "bg-emerald-50 text-emerald-600",
    chevron: "text-emerald-500",
  },
  {
    icon: "bg-orange-50 text-orange-600",
    chip: "bg-orange-50 text-orange-600",
    chevron: "text-orange-500",
  },
];

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

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}

function categoryLabel(category: string | null) {
  return category?.trim() || "공통";
}

function latestUpdatedAt(faqs: FaqSummary[]) {
  const latest = faqs.reduce<string | null>((latestValue, faq) => {
    const date = parseDate(faq.updatedAt);
    const latestDate = latestValue ? parseDate(latestValue) : null;

    if (!date) {
      return latestValue;
    }

    if (!latestDate || date > latestDate) {
      return faq.updatedAt;
    }

    return latestValue;
  }, null);

  return latest ? formatShortDate(latest) : "-";
}

function SummaryMetric({
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

function EmptyFaqState({
  loadFailed,
  filtered,
}: {
  loadFailed: boolean;
  filtered?: boolean;
}) {
  const title = loadFailed
    ? "FAQ를 불러오지 못했습니다"
    : filtered
      ? "조건에 맞는 FAQ가 없어요"
      : "등록된 FAQ가 없습니다";
  const description = loadFailed
    ? "서버 연결 후 다시 시도해 주세요."
    : filtered
      ? "검색어를 줄이거나 다른 분류를 선택해 보세요."
      : "새로운 도움말이 등록되면 이곳에 표시됩니다.";

  return (
    <section className="rounded-[14px] border border-dashed border-[#d8d3ff] bg-white px-5 py-10 text-center shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
      <div className="mx-auto grid size-12 place-items-center rounded-[16px] bg-[#f1efff] text-[#6653e9]">
        {filtered ? (
          <SearchIcon className="size-6" />
        ) : (
          <InfoIcon className="size-6" />
        )}
      </div>
      <h2 className="mt-4 text-[14px] font-black text-[#11172f]">
        {title}
      </h2>
      <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9299b2]">
        {description}
      </p>
    </section>
  );
}

export function FaqListScreen({
  faqs,
  loadFailed = false,
}: FaqListScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          faqs
            .map((faq) => faq.category?.trim())
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [faqs],
  );

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<string, number>>((counts, category) => {
      counts[category] = faqs.filter(
        (faq) => faq.category?.trim() === category,
      ).length;
      return counts;
    }, {});
  }, [categories, faqs]);

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORY ||
        faq.category?.trim() === activeCategory;
      const matchesSearch =
        !normalizedSearchTerm ||
        normalizeSearchText(
          [faq.question, faq.category ?? ""].join(" "),
        ).includes(normalizedSearchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, faqs, normalizedSearchTerm]);

  const filterTabs = [
    { key: ALL_CATEGORY, label: "전체", count: faqs.length },
    ...categories.map((category) => ({
      key: category,
      label: category,
      count: categoryCounts[category] ?? 0,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#f8f8ff]">
      <StackHeader title="자주 묻는 질문" fallbackHref="/setting" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-10 pt-3">
        <section className="relative overflow-hidden rounded-[14px] px-5 py-[18px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)] [background-image:radial-gradient(circle_at_82%_25%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#8374f6_0%,#6651e8_48%,#5941d9_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-5 top-4 grid size-[104px] rotate-[-14deg] place-items-center rounded-[24px] border border-white/15 bg-white/10 text-white/45 shadow-inner">
            <HelpCircleIcon className="size-12" />
          </div>

          <div className="relative max-w-[250px]">
            <p className="text-[11px] font-black leading-none tracking-[0.22em] text-white/75">
              FAQ CENTER
            </p>
            <h1 className="mt-2 text-[22px] font-black leading-tight">
              궁금한 점을 빠르게 찾으세요
            </h1>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-white/80">
              운동, 식단, 계정 이용 중 자주 묻는 내용을 모아두었어요.
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <SummaryMetric
              label="전체 FAQ"
              value={`${faqs.length}개`}
              icon={<HelpCircleIcon className="size-3" />}
            />
            <SummaryMetric
              label="분류"
              value={categories.length > 0 ? `${categories.length}개` : "-"}
              icon={<SparklesIcon className="size-3" />}
            />
            <SummaryMetric
              label="최근 수정"
              value={latestUpdatedAt(faqs)}
              icon={<ClockIcon className="size-3" />}
            />
          </div>
        </section>

        {faqs.length > 0 ? (
          <section className="rounded-[14px] border border-[#edf0ff] bg-white px-3 py-3 shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-[14px] font-black leading-none text-[#11172f]">
                  FAQ 찾기
                </h2>
                <p className="mt-1.5 text-[11px] font-semibold leading-4 text-[#9299b2]">
                  검색어와 분류로 필요한 답변을 골라보세요.
                </p>
              </div>
              <span className="rounded-full bg-[#faf9ff] px-2.5 py-1 text-[10px] font-black text-[#6653e9] ring-1 ring-[#ece8ff]">
                {filteredFaqs.length}개
              </span>
            </div>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6f79a9]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="궁금한 내용을 검색해 보세요"
                aria-label="FAQ 검색"
                className="h-[50px] w-full rounded-[16px] border border-[#edf0ff] bg-[#faf9ff] py-0 pl-12 pr-12 text-[14px] font-semibold text-[#11172f] outline-none transition placeholder:text-[#9299b2] focus:border-[#d8d3ff] focus:bg-white focus:ring-4 focus:ring-[#7563f1]/10"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[#9299b2] transition hover:bg-white hover:text-[#6653e9]"
                  aria-label="검색어 지우기"
                >
                  <XIcon className="size-4" />
                </button>
              ) : null}
            </div>

            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
              {filterTabs.map((tab) => {
                const active = activeCategory === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-black transition active:scale-[0.98] ${
                      active
                        ? "bg-[#6653e9] text-white shadow-[0_8px_18px_rgba(102,83,233,0.22)]"
                        : "bg-[#f6f7fb] text-[#7380ad]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                        active ? "bg-white/20 text-white" : "bg-white text-[#9299b2]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {filteredFaqs.length > 0 ? (
          <section className="space-y-2.5">
            {filteredFaqs.map((faq, index) => {
              const tone = itemTones[index % itemTones.length];
              const updatedAt = formatUpdatedAt(faq.updatedAt);

              return (
                <Link
                  key={faq.id}
                  href={`/faq/${faq.id}`}
                  className="group relative flex gap-3 overflow-hidden rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(37,45,100,0.06)] transition active:scale-[0.99] hover:-translate-y-0.5 hover:border-[#d8d3ff] hover:shadow-[0_14px_28px_rgba(37,45,100,0.09)]"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${tone.icon}`}
                  >
                    <HelpCircleIcon className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={`max-w-[160px] truncate rounded-full px-2 py-0.5 text-[10px] font-black ${tone.chip}`}
                      >
                        {categoryLabel(faq.category)}
                      </span>
                    </div>
                    <h2 className="line-clamp-2 text-[14px] font-black leading-5 text-[#11172f]">
                      {faq.question}
                    </h2>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#9299b2]">
                      <ClockIcon className="size-3.5" />
                      <span>{updatedAt ? `${updatedAt} 업데이트` : "업데이트 정보 없음"}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <ChevronRightIcon
                      className={`size-4 transition group-hover:translate-x-0.5 ${tone.chevron}`}
                    />
                  </div>
                </Link>
              );
            })}
          </section>
        ) : faqs.length > 0 ? (
          <EmptyFaqState loadFailed={false} filtered />
        ) : (
          <EmptyFaqState loadFailed={loadFailed} />
        )}
      </main>
    </div>
  );
}
