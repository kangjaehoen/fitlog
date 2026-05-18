type ProgressRowProps = {
  label: string;
  percent: number;
  colorClass: string;
};

const COLOR_BY_CLASS: Record<string, string> = {
  "bg-[#f6bcc8]": "#f4a3ad",
  "bg-[#b1a6fb]": "#6f35d9",
  "bg-[#8fd5ad]": "#2f9a55",
  "bg-[#95d9e4]": "#27b8bd",
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
        <span className="font-semibold text-slate-950">{label}</span>
        <span className="font-medium text-slate-800">{safePercent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white">
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
