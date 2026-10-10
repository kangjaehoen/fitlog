import type { ReactNode } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  InfoIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { PrivacyPolicyData } from "../types";

type PrivacyPolicyScreenProps = {
  data: PrivacyPolicyData;
};

const surfaceCardClass =
  "rounded-[14px] border border-[#edf0ff] bg-white shadow-[0_10px_28px_rgba(37,45,100,0.08)]";
const innerPanelClass =
  "rounded-[10px] border border-[#eef0f8] bg-[#faf9ff] shadow-[0_8px_20px_rgba(45,50,92,0.04)]";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="px-0.5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
      {children}
    </h2>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-white/15 px-3 py-2.5 text-white backdrop-blur-sm">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
          {label}
        </p>
        <p className="mt-1 truncate text-[12px] font-black text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function PrivacyHeroMark() {
  return (
    <div className="pointer-events-none absolute -right-4 top-4 size-[118px] opacity-70">
      <div className="absolute inset-2 rounded-[30px] bg-white/10" />
      <div className="absolute inset-5 rotate-[-12deg] rounded-[24px] bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]" />
      <div className="absolute right-6 top-6 grid size-[72px] rotate-[-12deg] place-items-center rounded-[22px] bg-white/15 text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]">
        <ShieldIcon className="size-9" />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: PrivacyPolicyData["summaryItems"][number]) {
  return (
    <div className={`${innerPanelClass} px-3 py-3`}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#f1efff] text-[#6653e9]">
          <CheckCircleIcon className="size-3.5" />
        </span>
        <p className="min-w-0 truncate text-[11px] font-black text-[#22243d]">
          {label}
        </p>
      </div>
      <p className="text-[11px] font-medium leading-5 text-slate-500">
        {value}
      </p>
    </div>
  );
}

function PolicySection({
  section,
}: {
  section: PrivacyPolicyData["sections"][number];
}) {
  const sectionTitle = splitSectionTitle(section.title);

  return (
    <section className={`${surfaceCardClass} px-4 py-4`}>
      <div className="flex items-start gap-2.5">
        {sectionTitle.number ? (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#7563f1] text-[11px] font-black text-white">
            {sectionTitle.number}
          </span>
        ) : (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#7563f1] text-white">
            <ShieldIcon className="size-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-black leading-5 text-[#22243d]">
            {sectionTitle.title}
          </h3>
          {section.description ? (
            <p className="mt-2 text-[12px] font-medium leading-5 text-slate-500">
              {section.description}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#6653e9]">
          {section.items.length}개
        </span>
      </div>

      <div className="mt-4 grid gap-2.5 border-t border-[#eef0f8] pt-3.5">
        {section.items.map((item) => (
          <div key={item.label} className={`${innerPanelClass} px-3 py-3`}>
            <h4 className="text-[12px] font-black text-[#22243d]">
              {item.label}
            </h4>
            <ul className="mt-2.5 space-y-2">
              {item.values.map((value) => (
                <li
                  key={value}
                  className="flex gap-2 text-[12px] font-medium leading-5 text-slate-500"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7563f1]" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function splitSectionTitle(title: string) {
  const match = title.match(/^(\d+)\.\s*(.+)$/);

  if (!match) {
    return {
      number: "",
      title,
    };
  }

  return {
    number: match[1],
    title: match[2],
  };
}

export function PrivacyPolicyScreen({ data }: PrivacyPolicyScreenProps) {
  return (
    <div className="min-h-screen bg-[#f8f8ff] pb-10">
      <StackHeader title="개인정보 처리방침" fallbackHref="/setting" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-4 pt-3">
        <header
          className="relative overflow-hidden rounded-[14px] px-5 py-[19px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.30)]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 82% 34%, rgba(255,255,255,0.20), transparent 30%), linear-gradient(135deg, #8374f6 0%, #6651e8 48%, #5941d9 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <PrivacyHeroMark />

          <div className="relative pr-16">
            <p className="text-[11px] font-black leading-none tracking-[0.2em] text-white/70">
              FITLOG PRIVACY
            </p>
            <h1 className="mt-3 text-[24px] font-black leading-8 text-white">
              개인정보 처리방침
            </h1>
            <p className="mt-3 text-[12px] font-medium leading-5 text-white/78">
              {data.intro}
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            <MetaItem
              icon={<CalendarIcon className="size-4" />}
              label="시행일"
              value={data.effectiveDate}
            />
            <MetaItem
              icon={<InfoIcon className="size-4" />}
              label="수정일"
              value={data.lastUpdated}
            />
          </div>
        </header>

        {data.summaryItems.length > 0 ? (
          <section className="space-y-2">
            <SectionTitle>요약</SectionTitle>
            <div className={`${surfaceCardClass} p-3.5`}>
              <div className="mb-3 inline-flex items-center gap-1.5">
                <span className="grid size-5 place-items-center rounded-full bg-[#7563f1] text-white">
                  <SparklesIcon className="size-3.5" />
                </span>
                <h2 className="text-[13px] font-black leading-none text-[#22243d]">
                  한눈에 보는 개인정보 처리 기준
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.summaryItems.map((item) => (
                  <SummaryItem key={item.label} {...item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-2">
          <SectionTitle>상세 방침</SectionTitle>
          <div className="grid gap-3">
            {data.sections.map((section) => (
              <PolicySection key={section.title} section={section} />
            ))}
          </div>
        </section>

        <section className="flex gap-2.5 rounded-[14px] border border-[#d9d4ff] bg-[#f1efff] px-4 py-3.5 shadow-[0_10px_24px_rgba(102,83,233,0.08)]">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-[#6653e9]" />
          <p className="text-[11px] font-medium leading-5 text-[#4f46b8]">
            {data.notice}
          </p>
        </section>
      </main>
    </div>
  );
}
