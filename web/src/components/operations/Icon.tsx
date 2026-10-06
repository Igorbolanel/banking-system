import type { ReactNode } from 'react';

const CATEGORY_PATHS: Record<string, ReactNode> = {
  cart: (
    <>
      <path d="M3 4h2.2l2.3 10.4a1.2 1.2 0 0 0 1.2.9h8.6a1.2 1.2 0 0 0 1.2-.9L20.4 7.5H6.1" />
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </>
  ),
  basket: (
    <>
      <path d="M3.5 10h17l-1.6 8.6a1.6 1.6 0 0 1-1.6 1.4H6.7a1.6 1.6 0 0 1-1.6-1.4z" />
      <path d="M8 10l4-6 4 6" />
      <path d="M9.5 14v2.5M14.5 14v2.5" />
    </>
  ),
  restaurant: (
    <>
      <path d="M6 3v7a2 2 0 0 0 4 0V3" />
      <path d="M8 12v9M8 3v5" />
      <path d="M17.5 21V3c-2.2 1.3-3.5 4-3.5 7.3V13h3.5" />
    </>
  ),
  fastfood: (
    <>
      <path d="M4 11c0-3.6 3.6-6 8-6s8 2.4 8 6z" />
      <path d="M3.5 14.5h17" />
      <path d="M5 17.5h14v.7a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 18.2z" />
    </>
  ),
  bus: (
    <>
      <rect x="4.5" y="3" width="15" height="15" rx="3" />
      <path d="M4.5 11h15M8 18v2.5M16 18v2.5" />
      <circle cx="8.5" cy="14.5" r=".9" />
      <circle cx="15.5" cy="14.5" r=".9" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="4" />
      <path d="M5 10h14M9 21l1.5-4M15 21l-1.5-4" />
      <circle cx="9" cy="13.5" r=".9" />
      <circle cx="15" cy="13.5" r=".9" />
    </>
  ),
  taxi: (
    <>
      <path d="M5 13l1.5-4.3A2 2 0 0 1 8.4 7.4h7.2a2 2 0 0 1 1.9 1.3L19 13" />
      <rect x="3.5" y="13" width="17" height="5" rx="1.6" />
      <path d="M7 18v2M17 18v2M10 4.5h4" />
    </>
  ),
  digital: (
    <>
      <rect x="3.5" y="4.5" width="17" height="12" rx="2.5" />
      <path d="M10.5 8.3l3.6 2.2-3.6 2.2z" />
      <path d="M8.5 20h7M12 16.5V20" />
    </>
  ),
  pharmacy: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.8" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M5.5 9.7V20h13V9.7M10 20v-5h4v5" />
    </>
  ),
  clothes: <path d="M8.5 3.5 3.5 6.5l2 4 2.5-1v11h8v-11l2.5 1 2-4-5-3c-.6 1.6-2 2.6-3.5 2.6s-2.9-1-3.5-2.6z" />,
  ticket: (
    <>
      <path d="M3.5 7.5h17v3a1.8 1.8 0 0 0 0 3v3h-17v-3a1.8 1.8 0 0 0 0-3z" />
      <path d="M14.5 8.5v1.5M14.5 12v1.5M14.5 15.5v.5" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10v4M18 10v4" />
    </>
  ),
  transfer: (
    <>
      <path d="M4 8h14M14.5 4.5 18 8l-3.5 3.5" />
      <path d="M20 16H6M9.5 12.5 6 16l3.5 3.5" />
    </>
  ),
  topup: (
    <>
      <path d="M9 20.5V4h5.2a4.2 4.2 0 0 1 0 8.4H6.5" />
      <path d="M6.5 16.2h7.5" />
    </>
  ),
  percent: (
    <>
      <path d="M18.5 5.5l-13 13" />
      <circle cx="7.5" cy="7.5" r="2.3" />
      <circle cx="16.5" cy="16.5" r="2.3" />
    </>
  ),
  cashback: <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z" />,
  exchange: (
    <>
      <path d="M5 9.5A7 7 0 0 1 17.8 7M18.5 3.5v4h-4" />
      <path d="M19 14.5A7 7 0 0 1 6.2 17M5.5 20.5v-4h4" />
    </>
  ),
  other: (
    <>
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="18" cy="12" r="1.2" />
    </>
  ),
};

const UI_PATHS: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrowDown: <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />,
  arrowUp: <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  donut: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5" strokeWidth="4" />
    </>
  ),
  bars: <path d="M5 20v-7M10 20V6M15 20v-9M20 20V9" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18M16 14.5h2" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  send: (
    <>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3l-6.5 18-4-7.5L3 9.5z" />
    </>
  ),
  coins: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M15.6 9.7a5.5 5.5 0 1 1-5.9 5.9" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  logout: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16l-4-4 4-4M6 12h10" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  swap: (
    <>
      <path d="M7 4v16M3.5 16.5 7 20l3.5-3.5" />
      <path d="M17 20V4M13.5 7.5 17 4l3.5 3.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  x?: number;
  y?: number;
  className?: string;
}

function renderIcon(paths: Record<string, ReactNode>, fallback: string, props: IconProps) {
  const { name, size = 20, color = 'currentColor', strokeWidth = 2, x, y, className } = props;
  return (
    <svg
      className={className}
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] ?? CATEGORY_PATHS[name] ?? paths[fallback]}
    </svg>
  );
}

export function CategoryIcon(props: IconProps) {
  return renderIcon(CATEGORY_PATHS, 'other', props);
}

export function UiIcon(props: IconProps) {
  return renderIcon(UI_PATHS, 'info', props);
}
