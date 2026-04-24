import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconBase({
  children,
  className,
  viewBox = "0 0 24 24",
}: IconProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.41V11a6 6 0 0 0-12 0v3.19c0 .53-.21 1.04-.59 1.41L4 17h5" />
      <path d="M10 17a2 2 0 0 0 4 0" />
    </IconBase>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
    </IconBase>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </IconBase>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m3 10.5 9-7 9 7" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </IconBase>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </IconBase>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 20h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-3" />
    </IconBase>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </IconBase>
  );
}

export function UtensilsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 3v7a2 2 0 0 0 2 2v9" />
      <path d="M8 3v7" />
      <path d="M12 3v7a2 2 0 0 1-2 2" />
      <path d="M18 3c-1.33 1.2-2 3.13-2 5.8V21" />
    </IconBase>
  );
}

export function DumbbellIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 10v4" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
      <path d="M21 10v4" />
      <path d="M6 12h12" />
    </IconBase>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </IconBase>
  );
}

export function FireIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3c2 2.3 3 4 3 6.1A3 3 0 0 1 18 12c0 4-2.5 7-6 7s-6-3-6-7c0-1.8.7-3.4 1.9-4.7.5 1.7 1.8 2.7 3.1 2.7 0-2.6.6-4.7 1-7Z" />
    </IconBase>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M13 2 6 13h5l-1 9 7-11h-5l1-9Z" />
    </IconBase>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.2 2.3 4.8-5" />
    </IconBase>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="18" cy="5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="m8 11 8-5" />
      <path d="m8 13 8 5" />
    </IconBase>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m12 3 1.1 3.4L16.5 7.5l-3.4 1.1L12 12l-1.1-3.4L7.5 7.5l3.4-1.1L12 3Z" />
      <path d="m18 13 .6 1.8 1.9.6-1.9.6L18 18l-.6-1.9-1.9-.6 1.9-.6L18 13Z" />
      <path d="m6 14 .8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14Z" />
    </IconBase>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

export function MoreVerticalIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 5h.01" />
      <path d="M12 12h.01" />
      <path d="M12 19h.01" />
    </IconBase>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m5 19 3.5-.8L18 8.8 15.2 6 5.8 15.5 5 19Z" />
      <path d="m13.8 7.4 2.8 2.8" />
    </IconBase>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
    </IconBase>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 8h2l1.5-2h7L17 8h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </IconBase>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 12h10l1-12" />
      <path d="M9 4h6l1 3H8l1-3Z" />
    </IconBase>
  );
}

export function GripVerticalIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M10 6h.01" />
      <path d="M10 12h.01" />
      <path d="M10 18h.01" />
      <path d="M14 6h.01" />
      <path d="M14 12h.01" />
      <path d="M14 18h.01" />
    </IconBase>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 10v5" />
      <path d="M12 7h.01" />
    </IconBase>
  );
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
      <path d="M13 16l4-4-4-4" />
      <path d="M10 12h7" />
    </IconBase>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3 5 6v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.6" />
    </IconBase>
  );
}

export function HelpCircleIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2.1-2.5 4" />
      <path d="M12 17h.01" />
    </IconBase>
  );
}
