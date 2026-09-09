import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P): P => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

export const Anvil = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 17h16M7 17l3 3h4l3-3M4 21h16M9 9l-4 3 4 3M13 8l4 4-4 4M15 3l2.5 2-2.5 2-2.5-2L15 3Z" />
  </svg>
);

export const Script = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 20.5 3.5 12 8 3.5M16 3.5 20.5 12 16 20.5" />
    <path d="M12 4v6" />
  </svg>
);

export const Cube = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="M12 12l8-4.5M12 12v9M12 12 4 7.5" />
  </svg>
);

export const Globe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.3 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.3-3.8-8.5s1.3-6.1 3.8-8.5Z" />
  </svg>
);

export const Lock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.2" r="1.3" />
    <path d="M12 16.5V18" />
  </svg>
);

export const Search = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const Bolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" />
  </svg>
);

export const Shield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 20 6v6c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V6l8-3Z" />
    <path d="m9 12 2 2 4-4.5" />
  </svg>
);

export const Box = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="M12 12l8-4.5M12 12v9M12 12 4 7.5" />
  </svg>
);

export const Activity = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2.5-7 4 14 2.5-7h5" />
  </svg>
);

export const Cpu = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" />
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
  </svg>
);

export const Gauge = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="M12 17l4-5" />
    <circle cx="12" cy="17" r="1.2" />
  </svg>
);

export const X = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const Check = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const Chevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Key = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 8-8M16 7l3 3M14 9l2 2" />
  </svg>
);

export const Wave = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 12h2l2-6 3 12 3-9 2 5 2 0 0-3h3" />
  </svg>
);

export const Play = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const Fence = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4v16M6 4v16M5 7h2M5 12h2M5 17h2" />
    <path d="M14 6 8 5.5v1L14 7V6ZM14 11l-6-.5v1L14 12v-1Z" />
    <path d="M16 4 21 20M18 4l5 16" />
  </svg>
);

export const Download = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v11M7.5 11 12 15.5 16.5 11" />
    <path d="M4 19h16" />
  </svg>
);

export const LogOut = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
    <path d="m16 8 4 4-4 4M20 12H9" />
  </svg>
);

export const RefreshCw = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 0 1 15.7-6.3L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.7 6.3L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);