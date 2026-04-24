type RecordOverviewCardProps = {
  dateLabel: string;
  recordChips: string[];
};

export function RecordOverviewCard({
  dateLabel,
  recordChips,
}: RecordOverviewCardProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-indigo-100 bg-white/90 p-5 text-slate-900 shadow-sm backdrop-blur-sm">
      <div className="mt-1 mb-6">
        <h2 className="text-base font-semibold leading-none text-slate-700">
          {dateLabel} 기록
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {recordChips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}
