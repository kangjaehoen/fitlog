type ToggleSwitchProps = {
  checked: boolean;
  onToggle: () => void;
  tone?: "indigo" | "amber";
  label: string;
};

export function ToggleSwitch({
  checked,
  onToggle,
  tone = "indigo",
  label,
}: ToggleSwitchProps) {
  const activeTone = tone === "amber" ? "bg-amber-500" : "bg-indigo-600";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? activeTone : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
