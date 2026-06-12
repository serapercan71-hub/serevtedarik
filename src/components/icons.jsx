// Tema uyumlu, ince çizgi (line) ikon seti. Hepsi currentColor ile renklenir.
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconInstagram(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHeart({ filled, ...props }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M19.5 5.5a4.6 4.6 0 0 0-6.5 0l-1 1-1-1a4.6 4.6 0 1 0-6.5 6.5l1 1 6.5 6.5 6.5-6.5 1-1a4.6 4.6 0 0 0 0-6.5z" />
    </svg>
  );
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21" />
      <circle cx="12" cy="7.5" r="4" />
    </svg>
  );
}

export function IconCart(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.2l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L21 6.5H6" />
    </svg>
  );
}

export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-3.2 7-8.5V5.5L12 3 5 5.5v7c0 5.3 7 8.5 7 8.5z" />
      <path d="M9.3 12l1.9 1.9 3.6-3.8" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h11" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconTruck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M1.5 5.5h12.5v11H1.5z" />
      <path d="M14 9h4.2l3 3.4v4.1H14" />
      <circle cx="6" cy="18.6" r="1.9" />
      <circle cx="17.6" cy="18.6" r="1.9" />
    </svg>
  );
}

export function IconBadgeCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l2.4 1.8 3-.3 1.1 2.8 2.7 1.4-.7 2.9.7 2.9-2.7 1.4-1.1 2.8-3-.3-2.4 1.8-2.4-1.8-3 .3-1.1-2.8-2.7-1.4.7-2.9-.7-2.9 2.7-1.4 1.1-2.8 3 .3z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function IconTag(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.5 6.5a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.5z" />
      <circle cx="8.3" cy="8.3" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconChat(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </svg>
  );
}

export function IconArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}
