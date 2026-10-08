import { cn } from '../../utils/format';

const PATHS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.4V21h14V9.4" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
      <path d="M10 21v-3h4v3" />
    </>
  ),
  heart: <path d="M12 20.5S4.5 15.9 4.5 10.5A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.3c0 5.4-7.5 10-7.5 10z" />,
  bell: (
    <>
      <path d="M18 16.5H6c1.2-1.3 1.8-2.6 1.8-5.2A4.2 4.2 0 0 1 12 6.5a4.2 4.2 0 0 1 4.2 4.8c0 2.6.6 3.9 1.8 5.2z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </>
  ),
  chat: <path d="M20.5 11.8a7.7 7.7 0 0 1-8.2 7.7L8 21l.7-3.4a7.7 7.7 0 1 1 11.8-5.8z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M17.5 14.7a6.5 6.5 0 0 1 4 6.3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.3 14.6a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06A2 2 0 1 1 4.44 17l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06A2 2 0 1 1 7 4.44l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 .97-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06A2 2 0 1 1 19.56 7l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47.97H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.47.97z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 21h18" />
      <rect x="5" y="10" width="3.5" height="8" rx="1" />
      <rect x="10.5" y="4.5" width="3.5" height="13.5" rx="1" />
      <rect x="16" y="13.5" width="3.5" height="4.5" rx="1" />
    </>
  ),
  star: <path d="m12 3.5 2.7 5.5 6 .9-4.4 4.2 1.1 6L12 17.3l-5.4 2.8 1.1-6L3.3 9.9l6-.9L12 3.5z" />,
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  filter: <path d="M4 5h16l-6.4 7.4V19l-3.2 1.6v-8.2L4 5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M4 20h4L19.2 8.8a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="m14.7 6.8 2.9 2.9" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="m6.5 7 1 12.8A1.2 1.2 0 0 0 8.7 21h6.6a1.2 1.2 0 0 0 1.2-1.2L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6.5 5 12 5s9.5 7 9.5 7-4 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c5.5 0 9.5 7 9.5 7a17 17 0 0 1-2.4 3.4M6.1 6.6A16.6 16.6 0 0 0 2.5 12S6.5 19 12 19c1.5 0 2.9-.3 4.1-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </>
  ),
  bookmark: <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.4L5.5 20.5v-16a1 1 0 0 1 1-1z" />,
  check: <path d="m5 13 4.2 4.2L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M3 12h18" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 14.5h2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4M6.5 12H16" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" />
    </>
  ),
  phone: <path d="M6 3.5h2.8L10.5 8 8.7 9.3a12.5 12.5 0 0 0 6 6L16 13.5l4.5 1.7v2.8a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.7a2 2 0 0 1 2-2.2z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.6 7 8.4 6 8.4-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.7" />
      <path d="m4.5 17.5 4.5-4.5 3.5 3.5 3-3 4 4" />
    </>
  ),
  verified: (
    <>
      <path d="m12 3 2.1 1.5 2.6-.2.9 2.4 2.2 1.4-.8 2.4.8 2.4-2.2 1.4-.9 2.4-2.6-.2L12 21l-2.1-1.5-2.6.2-.9-2.4-2.2-1.4.8-2.4-.8-2.4 2.2-1.4.9-2.4 2.6.2L12 3z" />
      <path d="m9 12.2 2.1 2.1 4-4.2" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="14.5" r="4" />
      <path d="m11 11.5 8-8M17.5 5l2 2M14.5 8l2 2" />
    </>
  ),
  list: <path d="M8.5 6H21M8.5 12H21M8.5 18H21M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  folder: <path d="M3 7.5A2 2 0 0 1 5 5.5h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5z" />,
  shield: <path d="m12 3 7.5 3v6c0 4.7-3.2 7.9-7.5 9-4.3-1.1-7.5-4.3-7.5-9V6L12 3z" />,
  gauge: (
    <>
      <path d="M4.5 18a9 9 0 1 1 15 0" />
      <path d="m12 14 3.5-4.5" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8z" />
      <circle cx="7.8" cy="8.2" r="1.4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10.5v3a1 1 0 0 0 1 1h2l7 4V5.5l-7 4H5a1 1 0 0 0-1 1z" />
      <path d="M18 9.5a4 4 0 0 1 0 5" />
    </>
  ),
  file: (
    <>
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5z" />
      <path d="M13.8 3.6V8H18M9 13h6M9 16.5h6" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V4" />
      <path d="M5.5 5h10l-1.6 3.2 1.6 3.3h-10z" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5" />
      <path d="M20 4.5v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5" />
      <path d="M4 19.5v-4h4" />
    </>
  ),
  send: <path d="M4 12.2 20.5 4l-4.4 16.5-4.7-6.6L4 12.2z" />,
  coins: (
    <>
      <circle cx="9.5" cy="9.5" r="6" />
      <path d="M14.8 6.3A6 6 0 0 1 15.5 18M7.5 9.5h4M9.5 7.5v4" />
      <path d="M15 16.5a6 6 0 1 0-1.4-8" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 12.5h4l2 3h5l2-3h4" />
      <path d="M5 10.5V5.6A1.6 1.6 0 0 1 6.6 4h10.8A1.6 1.6 0 0 1 19 5.6v4.9" />
      <path d="M19 10.5v7.9A1.6 1.6 0 0 1 17.4 20H6.6A1.6 1.6 0 0 1 5 18.4v-7.9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.5V16M12 8.2h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 16.5h.01" />
    </>
  ),
  spark: <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9 12 3.5z" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="M7 4.5 19 12 7 19.5v-15z" />,
  drag: <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" strokeWidth="2.4" />,
};

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.75, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name] || PATHS.info}
    </svg>
  );
}

export function HeartIcon({ filled = false, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="M12 20.5S4.5 15.9 4.5 10.5A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.3c0 5.4-7.5 10-7.5 10z" />
    </svg>
  );
}

export function StarIcon({ filled = false, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="m12 3.5 2.7 5.5 6 .9-4.4 4.2 1.1 6L12 17.3l-5.4 2.8 1.1-6L3.3 9.9l6-.9L12 3.5z" />
    </svg>
  );
}
