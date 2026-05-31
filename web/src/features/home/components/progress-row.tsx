type ProgressRowProps = {
  label: string;
  percent: number;
  colorClass: string;
};

const COLOR_BY_CLASS: Record<string, string> = {
  "bg-[#f6bcc8]": "#f27b94",
  "bg-[#b1a6fb]": "#8666ef",
  "bg-[#8fd5ad]": "#65bd77",
  "bg-[#95d9e4]": "#4fc0cf",
};

function progressColor(colorClass: string) {
  return COLOR_BY_CLASS[colorClass] ?? "#4f46e5";
}

function clampedPercent(percent: number) {
  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.max(0, Math.min(100, percent));
}

export function ProgressRow({
  label,
  percent,
  colorClass,
}: ProgressRowProps) {
  const safePercent = clampedPercent(percent);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] leading-none">
        <span className="font-bold text-[#4b5068]">{label}</span>
        <span
          className="font-black"
          style={{ color: progressColor(colorClass) }}
        >
          {safePercent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#f0f1f8]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${safePercent}%`,
            minWidth: safePercent > 0 ? 4 : undefined,
            backgroundColor: progressColor(colorClass),
          }}
        />
      </div>
    </div>
  );
}
