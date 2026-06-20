// Knowledgeflow v2 — Auth screens (1, 1B, 1C)

function AuthRegister({ onNext }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }} data-screen-label="01 Register">
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <KFLogo size="lg" />
          <p style={{ color: T.textSec, fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>One article a day. One thread to follow.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSec, marginBottom: 6 }}>Email</label>
            <KFInput placeholder="you@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSec, marginBottom: 6 }}>Password</label>
            <KFInput placeholder="8+ characters" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <KFBtn onClick={onNext} style={{ marginTop: 4, width: '100%' }}>
            Create account <ArrowRight />
          </KFBtn>
        </div>

        <KFDivider label="or" />

        <KFBtn variant="ghost" style={{ width: '100%' }} onClick={onNext}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.5 8.17c0-.46-.04-.9-.12-1.33H8v2.51h3.64a3.12 3.12 0 01-1.35 2.05v1.7h2.18c1.27-1.17 2.03-2.9 2.03-4.93z" fill="#4285F4"/>
            <path d="M8 15c1.83 0 3.37-.6 4.49-1.64l-2.18-1.7a4.39 4.39 0 01-2.31.64 4.38 4.38 0 01-4.12-3.03H1.62v1.76A7 7 0 008 15z" fill="#34A853"/>
            <path d="M3.88 9.27A4.4 4.4 0 013.65 8c0-.44.07-.87.23-1.27V4.97H1.62A7.01 7.01 0 001 8c0 1.13.27 2.2.62 3.03l2.26-1.76z" fill="#FBBC04"/>
            <path d="M8 3.62c1.03 0 1.95.36 2.68 1.05l2-2A7 7 0 008 1 7 7 0 001.62 4.97l2.26 1.76A4.38 4.38 0 018 3.62z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </KFBtn>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.textTer }}>
          Already have an account? <span style={{ color: T.accent, cursor: 'pointer' }} onClick={onNext}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

function AuthInterests({ onNext }) {
  const [selected, setSelected] = useState([]);
  const toggle = id => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
  );
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 20px 40px' }} data-screen-label="01b Interests">
      <div style={{ width: '100%', maxWidth: 540 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: T.accent, fontWeight: 500, marginBottom: 8 }}>Step 2 of 3</p>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 10 }}>What do you want to learn?</h2>
          <p style={{ color: T.textSec, fontSize: 15, lineHeight: 1.6 }}>Pick 3–5 topics. We'll start with one and let you branch from there.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {KF_TOPICS.map(t => {
            const sel = selected.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggle(t.id)} style={{
                padding: '14px 10px', borderRadius: T.radius,
                border: `1.5px solid ${sel ? T.accent : T.border}`,
                background: sel ? T.accentLight : '#FFFFFF',
                cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
                transition: T.transition,
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: sel ? T.accent : T.text }}>{t.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: T.textTer }}>{selected.length}/5 selected</span>
          <KFBtn onClick={onNext} disabled={selected.length < 3}>
            Continue <ArrowRight />
          </KFBtn>
        </div>
      </div>
    </div>
  );
}

function AuthDifficulty({ onNext }) {
  const [picked, setPicked] = useState('medium');
  const levels = [
    { id: 'simple', label: 'Simple', desc: 'Plain language, analogies, ~500 words', note: 'I\'m new to this.', lines: 4 },
    { id: 'medium', label: 'Medium', desc: 'Balanced depth, ~700 words', note: 'I know the basics.', lines: 7 },
    { id: 'hard',   label: 'Hard',   desc: 'Technical vocabulary, ~1000 words', note: 'Don\'t hold back.', lines: 11 },
  ];
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }} data-screen-label="01c Difficulty">
      <div style={{ width: '100%', maxWidth: 580 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 13, color: T.accent, fontWeight: 500, marginBottom: 8 }}>Step 3 of 3</p>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 10 }}>How do you like to learn?</h2>
          <p style={{ color: T.textSec, fontSize: 15, lineHeight: 1.6 }}>You can change this at any time.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {levels.map(lv => {
            const sel = picked === lv.id;
            return (
              <KFCard key={lv.id} selected={sel} onClick={() => setPicked(lv.id)} style={{ textAlign: 'center' }}>
                {/* Text density visual */}
                <div style={{ marginBottom: 14, padding: '12px 8px', background: sel ? 'rgba(74,124,111,0.08)' : '#F5F4F2', borderRadius: 8 }}>
                  {Array.from({ length: lv.lines }).map((_, i) => (
                    <div key={i} style={{
                      height: 4, borderRadius: 2, marginBottom: i < lv.lines - 1 ? 5 : 0,
                      background: sel ? T.accent : '#D4D2CE',
                      width: i % 3 === 0 ? '60%' : i % 3 === 1 ? '100%' : '80%',
                      opacity: 0.6 + (i / lv.lines) * 0.4,
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: sel ? T.accent : T.text, marginBottom: 6 }}>{lv.label}</div>
                <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginBottom: 8 }}>{lv.desc}</div>
                <div style={{ fontSize: 12, color: T.textTer, fontStyle: 'italic' }}>{lv.note}</div>
              </KFCard>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <KFBtn onClick={onNext}>Begin your journey <ArrowRight /></KFBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthRegister, AuthInterests, AuthDifficulty });
