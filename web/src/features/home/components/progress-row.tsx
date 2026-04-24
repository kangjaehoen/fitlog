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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[15px] leading-none">
        <span className="font-medium text-slate-900">{label}</span>
        <span className="font-normal text-slate-700">{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#edf1f5]">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
