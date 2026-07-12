/**
 * Inline SVG icons (Lucide outlines, 24px viewBox) used across the app.
 * The design brief mandates SVG icons over emoji for the status states.
 */
import type { ReactNode, SVGProps } from 'react';
import type { Status } from '../lib/types';

function Icon({ size = 13, children, ...rest }: { size?: number; children: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const RefreshIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </Icon>
);

export const ClockIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Icon>
);

export const BracesIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
    <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
  </Icon>
);

export const ImageOffIcon = ({ size = 12 }: { size?: number }) => (
  <Icon size={size} style={{ flex: '0 0 auto' }}>
    <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
    <path d="M13.5 13.5 6 21" />
    <path d="M18 12l3 3V5a2 2 0 0 0-2-2H9" />
    <path d="M3 3l18 18" />
    <path d="M3.59 3.59A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14" />
  </Icon>
);

export const InfoIcon = ({ size = 14 }: { size?: number }) => (
  <Icon size={size} style={{ flex: '0 0 auto' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Icon>
);

export const SpinnerIcon = () => (
  <Icon size={22} className="spin" stroke="var(--color-accent)">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Icon>
);

const STATUS_ICONS: Record<Status, ReactNode> = {
  available: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  unavailable: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  unknown: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>
  ),
  dead: (
    <>
      <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </>
  ),
};

/** The icon for a status pill: check / clock / question mark / octagon-x. */
export const StatusIcon = ({ status }: { status: Status }) => <Icon>{STATUS_ICONS[status]}</Icon>;
