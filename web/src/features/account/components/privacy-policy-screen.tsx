import type { ReactNode } from "react";
import { CalendarIcon, InfoIcon, ShieldIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { PrivacyPolicyData } from "../types";

type PrivacyPolicyScreenProps = {
  data: PrivacyPolicyData;
};

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
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-bold text-slate-400">{label}</p>
        <p className="text-[13px] font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function PolicySection({
  section,
}: {
  section: PrivacyPolicyData["sections"][number];
}) {
  return (
    <section className="py-7">
      <h2 className="text-[17px] font-black leading-7 text-slate-900">
        {section.title}
      </h2>
      {section.description ? (
        <p className="mt-2 text-[13px] leading-6 text-slate-500">
          {section.description}
        </p>
      ) : null}

      <div className="mt-5 space-y-5">
        {section.items.map((item) => (
          <div key={item.label}>
            <h3 className="text-sm font-black text-slate-700">{item.label}</h3>
            <ul className="mt-2 space-y-2">
              {item.values.map((value) => (
                <li key={value} className="flex gap-2.5 text-[13px] leading-6">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span className="text-slate-500">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PrivacyPolicyScreen({ data }: PrivacyPolicyScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="개인정보 처리방침" fallbackHref="/setting" />

      <main className="mx-auto max-w-md px-5 py-6 pb-10">
        <header className="rounded-[8px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600">
              <ShieldIcon className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                FitLog Privacy
              </p>
              <h1 className="mt-2 text-[24px] font-black leading-8 text-slate-950">
                FitLog 개인정보 처리방침
              </h1>
              <p className="mt-3 text-[13px] leading-6 text-slate-500">
                {data.intro}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <MetaItem
              icon={<CalendarIcon className="size-4" />}
              label="시행일"
              value={data.effectiveDate}
            />
            <MetaItem
              icon={<InfoIcon className="size-4" />}
              label="최종 수정일"
              value={data.lastUpdated}
            />
          </div>
        </header>

        <article className="mt-5 rounded-[8px] border border-slate-100 bg-white px-5 shadow-sm">
          <div className="divide-y divide-slate-100">
            {data.sections.map((section) => (
              <PolicySection key={section.title} section={section} />
            ))}
          </div>
        </article>

        <section className="mt-5 flex gap-3 rounded-[8px] border border-indigo-100 bg-indigo-50 p-4">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-indigo-500" />
          <p className="text-[12px] leading-6 text-indigo-700">
            {data.notice}
          </p>
        </section>
      </main>
    </div>
  );
}
