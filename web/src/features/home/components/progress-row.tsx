type ProgressRowProps = {
  label: string;
  percent: number;
  colorClass: string;
};

export function ProgressRow({
  label,
  percent,
  colorClass,
}: ProgressRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[15px] leading-none">
        <span className="font-medium text-slate-900">{label}</span>
        <span className="text-slate-700">{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
