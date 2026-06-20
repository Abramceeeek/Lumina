// Knowledgeflow v2 — Shared primitives & data
// All components exported to window at bottom

const { useState, useEffect, useRef, useCallback } = React;

// ── Design tokens (mirrors CSS vars) ────────────────────────────────────────
const T = {
  bg: '#FAF9F7', bgCard: '#FFFFFF', border: '#E5E3DF',
  text: '#1A1A1A', textSec: '#6B6860', textTer: '#9E9C98',
  accent: '#4A7C6F', accentLight: '#E6F0EE',
  radius: 12, radiusSm: 8,
  shadow: '0 1px 3px rgba(0,0,0,0.06)',
  transition: 'all 0.15s ease',
};

// ── Shared data ──────────────────────────────────────────────────────────────
const KF_TOPICS = [
  { id: 'finance',     label: 'Finance',     emoji: '📈', color: '#4A7C6F' },
  { id: 'technology',  label: 'Technology',  emoji: '💻', color: '#5B7BA8' },
  { id: 'philosophy',  label: 'Philosophy',  emoji: '🧠', color: '#8A6BA8' },
  { id: 'science',     label: 'Science',     emoji: '🔬', color: '#5B98A8' },
  { id: 'history',     label: 'History',     emoji: '📜', color: '#A88B5B' },
  { id: 'psychology',  label: 'Psychology',  emoji: '🧩', color: '#A85B6B' },
  { id: 'literature',  label: 'Literature',  emoji: '📖', color: '#6B8A5B' },
  { id: 'economics',   label: 'Economics',   emoji: '🏛️', color: '#8A7B5B' },
  { id: 'art',         label: 'Art & Design',emoji: '🎨', color: '#8A5B7B' },
  { id: 'health',      label: 'Health',      emoji: '🌿', color: '#5B8A6B' },
  { id: 'politics',    label: 'Politics',    emoji: '⚖️', color: '#7B5B8A' },
  { id: 'astronomy',   label: 'Astronomy',   emoji: '🌌', color: '#5B6B8A' },
];

const KF_ARTICLE = {
  topic: 'Finance', subtopic: 'Compound Interest', day: 12,
  readTime: 4, difficulty: 'Medium',
  body: [
    `Albert Einstein reportedly called compound interest "the eighth wonder of the world." Whether he actually said it is debatable — but the sentiment endures because the mathematics behind it is genuinely remarkable.`,
    `Compound interest means earning returns not just on your original principal, but on all previously accumulated interest. The effect starts slowly, almost imperceptibly, then accelerates. A single investment, left untouched, can double, triple, grow tenfold — not because of any dramatic intervention, but simply because time passes.`,
    `Consider two investors. The first invests $10,000 at age 25 and never adds another dollar. The second waits until 35 to invest the same amount. By retirement at 65, assuming an 8% annual return, the first investor ends with roughly $217,000. The second ends with just over $100,000. Ten years of waiting costs them more than half their wealth.`,
    `The principle extends beyond money. Skills compound. Knowledge compounds. Reputation compounds. Every page you read today makes the next page slightly easier to understand. Every conversation you have sharpens your ability to have the next one.`,
    `What compound interest teaches us, ultimately, is a lesson about patience and consistency. The dramatic results arrive at the end, not the beginning. Most of the growth happens in the final years, not the first ones. This is why so many people underestimate it — we're wired to expect linear progress, and compounding is anything but linear.`,
  ],
};

const KF_HIGHLIGHTS = [
  { id: 'h1', quote: 'Skills compound. Knowledge compounds. Reputation compounds.', article: 'Compound Interest', topic: 'Finance', date: 'Today' },
  { id: 'h2', quote: 'The dramatic results arrive at the end, not the beginning.', article: 'Compound Interest', topic: 'Finance', date: 'Today' },
  { id: 'h3', quote: 'The definition of insanity is doing the same thing over and over again and expecting a different result.', article: 'Cognitive Biases', topic: 'Psychology', date: '3 days ago' },
  { id: 'h4', quote: 'Money is a tool. It will take you wherever you wish, but it will not replace you as the driver.', article: 'Time Value of Money', topic: 'Finance', date: '1 week ago' },
];

const KF_TRAIL = [
  { id: 't0', topic: 'Finance', label: 'Introduction to Finance', day: 1 },
  { id: 't1', topic: 'Finance', label: 'Time Value of Money', day: 3 },
  { id: 't2', topic: 'Finance', label: 'Compound Interest', day: 12, isCurrent: true },
  { id: 't3', topic: 'Finance', label: 'The Rule of 72', isNext: true },
];

const KF_BRANCHES = [
  { id: 'b1', title: 'The Rule of 72', desc: 'A mental shortcut for estimating how long it takes money to double.' },
  { id: 'b2', title: 'Inflation & Real Returns', desc: 'Why purchasing power matters more than the number on your statement.' },
  { id: 'b3', title: 'Index Funds', desc: 'How passive investing harnesses compound returns without stock-picking.' },
  { id: 'b4', title: 'Psychology of Saving', desc: 'Why we struggle to delay gratification, and systems that help.' },
  { id: 'b5', title: 'Debt Compounding', desc: 'How the same mathematics that builds wealth can trap borrowers.' },
];

// ── Shared UI primitives ─────────────────────────────────────────────────────

function KFLogo({ size = 'sm' }) {
  const sz = size === 'lg' ? 36 : 26;
  const r = size === 'lg' ? 11 : 8;
  const fontSize = size === 'lg' ? 22 : 16;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: sz, height: sz, borderRadius: r, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={sz * 0.5} height={sz * 0.5} viewBox="0 0 16 16" fill="none">
          <path d="M3 13 L8 3 L13 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 9.5 L11 9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ fontSize, fontWeight: 600, letterSpacing: '-0.02em' }}>Knowledgeflow</span>
    </div>
  );
}

function KFBtn({ children, variant = 'primary', onClick, disabled, style, size = 'md' }) {
  const [hov, setHov] = useState(false);
  const pad = size === 'sm' ? '8px 16px' : '11px 22px';
  const fs = size === 'sm' ? 13 : 14;
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: pad, borderRadius: 100, fontSize: fs, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    transition: T.transition, fontFamily: 'inherit', opacity: disabled ? 0.4 : 1,
  };
  const variants = {
    primary: { background: hov && !disabled ? '#3D6960' : T.accent, color: '#fff' },
    ghost: { background: 'transparent', color: T.textSec, border: `1px solid ${T.border}`, boxShadow: hov ? T.shadow : 'none' },
    soft: { background: T.accentLight, color: T.accent },
    danger: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function KFInput({ placeholder, type = 'text', value, onChange, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 15,
        fontFamily: 'inherit', background: '#FFFFFF', color: T.text, outline: 'none',
        border: `1px solid ${focused ? T.accent : T.border}`,
        boxShadow: focused ? `0 0 0 3px ${T.accentLight}` : 'none',
        transition: T.transition, ...style,
      }} />
  );
}

function KFPill({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 100, fontSize: 12, fontWeight: 500,
      background: color ? color + '18' : T.accentLight,
      color: color || T.accent,
    }}>{label}</span>
  );
}

function KFDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      {label && <span style={{ fontSize: 13, color: T.textTer }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function KFCard({ children, selected, style, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? T.accentLight : '#FFFFFF',
        border: `1.5px solid ${selected ? T.accent : hov ? '#C8C4BE' : T.border}`,
        borderRadius: T.radius, padding: '16px 18px',
        transition: T.transition, cursor: onClick ? 'pointer' : 'default',
        boxShadow: hov && !selected ? T.shadow : 'none', ...style,
      }}>
      {children}
    </div>
  );
}

// ── App header used on main screens ─────────────────────────────────────────
function KFHeader({ right }) {
  return (
    <div style={{
      padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: T.bg, position: 'sticky', top: 0, zIndex: 20,
    }}>
      <KFLogo />
      {right}
    </div>
  );
}

// Arrow icon
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckMark = () => (
  <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </div>
);

// Export everything
Object.assign(window, {
  T, KF_TOPICS, KF_ARTICLE, KF_HIGHLIGHTS, KF_TRAIL, KF_BRANCHES,
  KFLogo, KFBtn, KFInput, KFPill, KFDivider, KFCard, KFHeader,
  ArrowRight, ChevronRight, CheckMark,
});
