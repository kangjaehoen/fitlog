import { DumbbellIcon, UtensilsIcon } from "@/components/icons";

type RecordOverviewCardProps = {
  dateLabel: string;
  recordChips: string[];
};

function chipIconFor(chip: string) {
  if (chip.includes("운동")) {
    return DumbbellIcon;
  }

  return UtensilsIcon;
}

function CalendarIllustration() {
  return (
    <div className="pointer-events-none absolute -right-2 top-2 size-[112px] opacity-70">
      <div className="absolute inset-2 rounded-full bg-white/10" />
      <div className="absolute right-6 top-5 size-16 rotate-[-12deg] rounded-[18px] bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 96 96"
        className="absolute right-4 top-4 size-[78px] rotate-[-13deg]"
      >
        <defs>
          <linearGradient id="home-calendar-card" x1="18" y1="16" x2="80" y2="82">
            <stop stopColor="#998cff" />
            <stop offset="1" stopColor="#7564ef" />
          </linearGradient>
        </defs>
        <rect
          x="23"
          y="18"
          width="50"
          height="60"
          rx="12"
          fill="url(#home-calendar-card)"
          opacity="0.92"
        />
        <rect x="32" y="14" width="7" height="13" rx="3.5" fill="#c9c2ff" />
        <rect x="57" y="14" width="7" height="13" rx="3.5" fill="#c9c2ff" />
        <rect x="32" y="36" width="8" height="8" rx="2.4" fill="#5e4be2" opacity="0.9" />
        <rect x="46" y="36" width="8" height="8" rx="2.4" fill="#5e4be2" opacity="0.65" />
        <rect x="60" y="36" width="8" height="8" rx="2.4" fill="#5e4be2" opacity="0.42" />
        <rect x="32" y="51" width="8" height="8" rx="2.4" fill="#5e4be2" opacity="0.45" />
        <rect x="46" y="51" width="8" height="8" rx="2.4" fill="#5e4be2" opacity="0.72" />
        <path
          d="M36 69h24"
          stroke="#d8d3ff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

export function RecordOverviewCard({
  dateLabel,
  recordChips,
}: RecordOverviewCardProps) {
  const primaryChips = recordChips
    .filter((chip) => !chip.includes("수분"))
    .slice(0, 2);
  const visibleChips = primaryChips.length > 0 ? primaryChips : recordChips;

  return (
    <section
      className="relative overflow-hidden rounded-[14px] px-5 py-[19px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.30)]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 82% 34%, rgba(255,255,255,0.20), transparent 30%), linear-gradient(135deg, #8374f6 0%, #6651e8 48%, #5941d9 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
      <CalendarIllustration />

      <div className="relative mb-5 mt-0.5">
        <h2 className="text-[12px] font-extrabold leading-none text-white/95">
          {dateLabel} 기록
        </h2>
      </div>

      <div className="relative flex flex-wrap gap-2">
        {visibleChips.map((chip) => {
          const Icon = chipIconFor(chip);

          return (
            <span
              key={chip}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-black text-[#5e48e7] shadow-[0_10px_20px_rgba(42,31,124,0.14)]"
            >
              <Icon className="size-3.5" />
              {chip}
            </span>
          );
        })}
      </div>
    </section>
  );
}
