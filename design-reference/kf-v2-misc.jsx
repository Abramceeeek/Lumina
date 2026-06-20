// Knowledgeflow v2 — Misc screens (5–9)

// ── Screen 5: Notes & Highlights ─────────────────────────────────────────────
function NotesScreen() {
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const topics = ['All', 'Finance', 'Psychology'];
  const filtered = KF_HIGHLIGHTS.filter(h =>
    (filterTopic === 'All' || h.topic === filterTopic) &&
    (h.quote.toLowerCase().includes(search.toLowerCase()) || h.article.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="05 Notes">
      <KFHeader />
      <div style={{ padding: '32px 20px 80px', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 20 }}>Notes &amp; Highlights</h2>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke={T.textTer} strokeWidth="1.5"/>
              <path d="M9.5 9.5L12 12" stroke={T.textTer} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search highlights…" value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                fontSize: 14, fontFamily: 'inherit', background: '#FFFFFF',
                color: T.text, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {topics.map(t => (
              <button key={t} onClick={() => setFilterTopic(t)} style={{
                padding: '8px 14px', borderRadius: 100, border: `1px solid ${filterTopic === t ? T.accent : T.border}`,
                background: filterTopic === t ? T.accentLight : '#FFFFFF',
                color: filterTopic === t ? T.accent : T.textSec,
                fontSize: 13, fontWeight: filterTopic === t ? 500 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: T.transition,
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(h => (
            <div key={h.id} style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '18px 20px' }}>
              <blockquote style={{
                margin: 0, paddingLeft: 14,
                borderLeft: `3px solid ${T.accent}`,
                fontSize: 16, lineHeight: 1.7, color: T.text,
                fontStyle: 'italic', marginBottom: 12,
              }}>
                "{h.quote}"
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <KFPill label={h.topic} />
                <span style={{ fontSize: 13, color: T.textSec }}>{h.article}</span>
                <span style={{ fontSize: 12, color: T.textTer, marginLeft: 'auto' }}>{h.date}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: T.textTer, fontSize: 15, textAlign: 'center', padding: '40px 0' }}>No highlights match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Screen 6: Spaced Repetition Reminder ─────────────────────────────────────
function SpacedRepScreen({ onDismiss }) {
  const [answers, setAnswers] = useState({});
  const questions = [
    { q: 'What does compound interest mean?', opts: ['Interest on principal only', 'Interest on principal + prior interest', 'A type of loan', 'Government savings rate'], correct: 1 },
    { q: 'At what age should you ideally start investing to maximise compound growth?', opts: ['45', '35', '25', 'It doesn\'t matter'], correct: 2 },
  ];
  const [done, setDone] = useState(false);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, padding: 20 }} data-screen-label="06 Spaced Rep">
      <div style={{ width: '100%', maxWidth: 480, background: '#FFFFFF', border: `1.5px solid ${T.border}`, borderRadius: T.radius + 4, padding: '28px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke={T.accent} strokeWidth="1.5"/>
              <path d="M9 5v4l2.5 2.5" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Memory Check</div>
            <div style={{ fontSize: 12, color: T.textSec }}>You read this 30 days ago</div>
          </div>
          <button onClick={onDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.textTer, fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <p style={{ fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 4 }}>Compound Interest</p>
        <p style={{ fontSize: 13, color: T.textSec, marginBottom: 22, lineHeight: 1.5 }}>How much do you remember?</p>

        {!done ? (
          <>
            {questions.map((q, qi) => (
              <div key={qi} style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 10 }}>{q.q}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {q.opts.map((o, oi) => (
                    <div key={oi} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))} style={{
                      padding: '9px 12px', borderRadius: T.radiusSm, cursor: 'pointer', fontSize: 13,
                      border: `1.5px solid ${answers[qi] === oi ? T.accent : T.border}`,
                      background: answers[qi] === oi ? T.accentLight : '#FAFAF9',
                      color: answers[qi] === oi ? T.accent : T.text, fontWeight: answers[qi] === oi ? 500 : 400,
                      transition: T.transition,
                    }}>{o}</div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <KFBtn variant="ghost" onClick={onDismiss} style={{ flex: 1 }}>Skip for now</KFBtn>
              <KFBtn onClick={() => setDone(true)} disabled={Object.keys(answers).length < 2} style={{ flex: 1 }}>Submit</KFBtn>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              {Object.values(answers).filter((a, i) => a === questions[i].correct).length === 2 ? 'Perfect recall!' : 'Good effort!'}
            </p>
            <p style={{ fontSize: 14, color: T.textSec, marginBottom: 20 }}>Your retention score has been updated.</p>
            <KFBtn onClick={onDismiss}>Done</KFBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen 7: Friends & Leaderboard ──────────────────────────────────────────
const FRIENDS = [
  { name: 'You', articles: 12, streak: 12, isYou: true },
  { name: 'Amara K.', articles: 19, streak: 23 },
  { name: 'Luis P.', articles: 15, streak: 7 },
  { name: 'Priya M.', articles: 11, streak: 5 },
  { name: 'Tom R.', articles: 8, streak: 3 },
];
const BADGES = [
  { label: 'Finance Explorer', note: '10 articles deep', emoji: '📈' },
  { label: 'Day 12 Streak', note: 'Keep going!', emoji: '🔥' },
];

function FriendsScreen() {
  const sorted = [...FRIENDS].sort((a, b) => b.articles - a.articles);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="07 Friends">
      <KFHeader />
      <div style={{ padding: '32px 20px 80px', maxWidth: 580, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>Learning together</h2>
        <p style={{ fontSize: 15, color: T.textSec, marginBottom: 28 }}>Weekly leaderboard</p>

        {/* Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {sorted.map((f, i) => (
            <div key={f.name} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: f.isYou ? T.accentLight : '#FFFFFF',
              border: `1.5px solid ${f.isYou ? T.accent : T.border}`,
              borderRadius: T.radius,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? T.accent : T.textTer, width: 18, textAlign: 'center' }}>
                {i + 1}
              </span>
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: f.isYou ? T.accent : T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: f.isYou ? '#fff' : T.textSec, fontWeight: 600 }}>
                {f.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: f.isYou ? 600 : 400, color: T.text }}>{f.name}{f.isYou && <span style={{ marginLeft: 6, fontSize: 11, color: T.accent }}>(you)</span>}</div>
                <div style={{ fontSize: 12, color: T.textSec }}>{f.streak} day streak</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: f.isYou ? T.accent : T.text }}>{f.articles}</div>
                <div style={{ fontSize: 11, color: T.textTer }}>articles</div>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Your badges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 28 }}>
          {BADGES.map(b => (
            <div key={b.label} style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{b.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{b.label}</div>
                <div style={{ fontSize: 12, color: T.textSec }}>{b.note}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Friend graph preview */}
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Friend's trail</h3>
        <div style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 48, borderRadius: T.radiusSm, background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
              <circle cx="8" cy="8" r="4" fill="#5B7BA8" opacity="0.6"/>
              <circle cx="18" cy="14" r="4" fill="#4A7C6F" opacity="0.6"/>
              <circle cx="27" cy="6" r="3" fill="#8A6BA8" opacity="0.6"/>
              <line x1="11" y1="9" x2="15" y2="13" stroke="#D4D2CE" strokeWidth="1.2"/>
              <line x1="21" y1="12" x2="25" y2="8" stroke="#D4D2CE" strokeWidth="1.2"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Amara K.</div>
            <div style={{ fontSize: 12, color: T.textSec }}>19 articles · Technology &amp; Science</div>
          </div>
          <KFBtn variant="ghost" size="sm">Compare trails</KFBtn>
        </div>
      </div>
    </div>
  );
}

// ── Screen 8: Career Mode ─────────────────────────────────────────────────────
const PATHS = [
  { title: 'Become financially literate', duration: '90 days', difficulty: 'Simple → Medium', progress: 13, premium: false },
  { title: 'Understand AI from scratch', duration: '60 days', difficulty: 'Medium', progress: 0, premium: false },
  { title: 'Introduction to Philosophy', duration: '45 days', difficulty: 'Hard', progress: 0, premium: true },
  { title: 'History of Western Civilisation', duration: '75 days', difficulty: 'Medium', progress: 0, premium: true },
];

function CareerScreen() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="08 Career">
      <KFHeader />
      <div style={{ padding: '32px 20px 80px', maxWidth: 620, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 6 }}>Structured paths</h2>
        <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.6, marginBottom: 28 }}>
          Want direction instead of exploration? Follow a curated programme.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PATHS.map(p => (
            <div key={p.title} style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '20px 22px', position: 'relative' }}>
              {p.premium && (
                <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 11, fontWeight: 600, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 100 }}>Premium</span>
              )}
              <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <KFPill label={p.duration} />
                <KFPill label={p.difficulty} color={T.textSec} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: p.progress > 0 ? 12 : 0 }}>{p.title}</h3>
              {p.progress > 0 && (
                <div>
                  <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: `${p.progress}%`, height: '100%', background: T.accent, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 12, color: T.textTer }}>{p.progress}% complete</div>
                </div>
              )}
              {p.progress === 0 && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <KFBtn variant="ghost" size="sm">{p.premium ? 'Preview path' : 'Start path'}</KFBtn>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 9: Profile & Settings ──────────────────────────────────────────────
function ProfileScreen() {
  const [reminder, setReminder] = useState('08:00');
  const [notifs, setNotifs] = useState(true);
  const [lang, setLang] = useState('English');

  // Retention ring
  const retention = 74;
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (retention / 100) * circ;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="09 Profile">
      <KFHeader />
      <div style={{ padding: '32px 20px 80px', maxWidth: 540, margin: '0 auto' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 600 }}>J</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.text }}>Jordan Lee</div>
            <div style={{ fontSize: 13, color: T.textSec }}>Member since April 2026</div>
          </div>
        </div>

        {/* Retention score ring */}
        <div style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '24px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <svg width={2 * (r + 10)} height={2 * (r + 10)} viewBox={`0 0 ${2 * (r + 10)} ${2 * (r + 10)}`}>
            <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={T.border} strokeWidth={8} />
            <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={T.accent} strokeWidth={8}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${r + 10} ${r + 10})`} />
            <text x={r + 10} y={r + 10 + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={T.text}>{retention}</text>
          </svg>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>Retention Score</div>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.55 }}>Based on quiz performance and spaced repetition recall over the last 30 days.</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total articles', value: '12' },
            { label: 'Longest streak', value: '12 days' },
            { label: 'Topics explored', value: '3' },
            { label: 'Highlights saved', value: '4' },
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px 16px' }}>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: T.textTer }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12 }}>Settings</h3>
        <div style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden' }}>
          {[
            {
              label: 'Daily reminder', value:
                <input type="time" value={reminder} onChange={e => setReminder(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 14, color: T.accent, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }} />
            },
            {
              label: 'Language', value:
                <select value={lang} onChange={e => setLang(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 14, color: T.textSec, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                  <option>English</option><option>French</option><option>Spanish</option><option>German</option>
                </select>
            },
            {
              label: 'Notifications', value:
                <div onClick={() => setNotifs(n => !n)} style={{
                  width: 40, height: 22, borderRadius: 11, background: notifs ? T.accent : T.border,
                  cursor: 'pointer', position: 'relative', transition: T.transition,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, left: notifs ? 21 : 3, transition: T.transition,
                  }} />
                </div>
            },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <span style={{ fontSize: 14, color: T.text }}>{row.label}</span>
              {row.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotesScreen, SpacedRepScreen, FriendsScreen, CareerScreen, ProfileScreen });
