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
