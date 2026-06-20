// Knowledgeflow v2 — Reading screens (2, 2B, 3)

// ── Screen 2: Daily Article ──────────────────────────────────────────────────
function ArticleScreen({ onFinish, difficulty, setDifficulty }) {
  const [timerDone, setTimerDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [highlight, setHighlight] = useState(null); // {text, x, y}
  const [savedHighlights, setSavedHighlights] = useState([]);
  const [toast, setToast] = useState(false);
  const articleRef = useRef(null);
  const totalSecs = KF_ARTICLE.readTime * 60;

  // Reading timer
  useEffect(() => {
    if (timerDone) return;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / totalSecs);
        if (next >= 100) { clearInterval(interval); setTimerDone(true); return 100; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerDone]);

  // Highlight on text select
  useEffect(() => {
    const onUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) { setHighlight(null); return; }
      if (!articleRef.current?.contains(sel.anchorNode)) { setHighlight(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const artRect = articleRef.current.getBoundingClientRect();
      setHighlight({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2 - artRect.left,
        y: rect.top - artRect.top - 44,
      });
    };
    document.addEventListener('mouseup', onUp);
    return () => document.removeEventListener('mouseup', onUp);
  }, []);

  const saveHighlight = () => {
    if (highlight) {
      setSavedHighlights(prev => [...prev, highlight.text]);
      setHighlight(null);
      window.getSelection()?.removeAllRanges();
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="02 Article">
      {/* Header */}
      <KFHeader right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DifficultyBadge difficulty={difficulty} onChange={setDifficulty} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.accentLight, padding: '5px 12px', borderRadius: 100, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 15 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.accent }}>Day {KF_ARTICLE.day}</span>
          </div>
        </div>
      } />

      {/* Article */}
      <div style={{ padding: '44px 20px 40px' }}>
        <article ref={articleRef} style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <KFPill label={KF_ARTICLE.topic} />
            <span style={{ color: T.textTer, fontSize: 13 }}>· {KF_ARTICLE.readTime} min read</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 16, color: T.text }}>
            {KF_ARTICLE.subtopic}
          </h1>

          {/* Timer bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${progress}%`,
                background: timerDone ? T.accent : `linear-gradient(90deg, ${T.accent}, #6BAA9C)`,
                transition: 'width 1s linear',
              }} />
            </div>
            {!timerDone && (
              <p style={{ fontSize: 12, color: T.textTer, fontStyle: 'italic' }}>
                Take your time — the next step unlocks when you're done reading.
              </p>
            )}
          </div>

          {/* Highlight tooltip */}
          {highlight && (
            <div style={{
              position: 'absolute',
              left: highlight.x, top: highlight.y,
              transform: 'translateX(-50%)',
              background: T.text, color: '#fff',
              padding: '6px 12px', borderRadius: 8,
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              zIndex: 50, whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }} onClick={saveHighlight}>
              Save highlight
            </div>
          )}

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {KF_ARTICLE.body.map((para, i) => (
              <p key={i} style={{
                fontSize: 18, lineHeight: 1.8,
                color: i === 0 ? T.text : T.textSec,
                fontWeight: i === 0 ? 500 : 400,
              }}>{para}</p>
            ))}
          </div>

          {/* End */}
          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 13, color: T.textTer, fontStyle: 'italic' }}>End of today's article</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            {!timerDone ? (
              <p style={{ color: T.textTer, fontSize: 14 }}>Finish reading to continue</p>
            ) : (
              <>
                <p style={{ color: T.textSec, fontSize: 15, marginBottom: 16 }}>
                  Great reading! Now let's check in.
                </p>
                <KFBtn onClick={onFinish}>
                  Quick quiz — then choose next <ArrowRight />
                </KFBtn>
              </>
            )}
          </div>
        </article>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: T.text, color: '#fff', padding: '10px 18px', borderRadius: 100,
          fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: 'nowrap',
        }}>
          Highlight saved ✓
        </div>
      )}
    </div>
  );
}

// Difficulty badge with inline switcher
function DifficultyBadge({ difficulty, onChange }) {
  const [open, setOpen] = useState(false);
  const opts = ['Simple', 'Medium', 'Hard'];
  const colors = { Simple: '#5B8A6B', Medium: T.accent, Hard: '#8A5B5B' };
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 100,
        border: `1px solid ${T.border}`, cursor: 'pointer',
        fontSize: 12, fontWeight: 500, color: colors[difficulty] || T.accent,
        background: '#FFFFFF', userSelect: 'none',
      }}>
        {difficulty}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          background: '#FFFFFF', border: `1px solid ${T.border}`,
          borderRadius: T.radiusSm, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden', zIndex: 30,
        }}>
          {opts.map(o => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
              padding: '9px 16px', fontSize: 13, fontWeight: difficulty === o ? 600 : 400,
              color: difficulty === o ? colors[o] : T.text, cursor: 'pointer',
              background: difficulty === o ? T.accentLight : 'transparent',
              whiteSpace: 'nowrap',
            }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Screen 2B: Post-article Quiz ─────────────────────────────────────────────
function QuizScreen({ onFinish }) {
  const questions = [
    {
      type: 'mc', q: 'What does "compound interest" mean?',
      opts: ['Interest earned only on the principal', 'Interest earned on principal AND prior interest', 'A fixed monthly payment', 'Government bond yields'],
      correct: 1,
    },
    {
      type: 'mc', q: 'Two investors each invest $10,000. One starts at 25, one at 35. At retirement, who has more?',
      opts: ['The one who started at 35', 'They end up equal', 'The one who started at 25', 'It depends on the rate'],
      correct: 2,
    },
    {
      type: 'open', q: 'What surprised you most about compound interest?', placeholder: 'Type your thoughts…',
    },
  ];

  const [answers, setAnswers] = useState({});
  const [openText, setOpenText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const allDone = answers[0] !== undefined && answers[1] !== undefined && (openText.trim().length > 0 || submitted);
  const mcCorrect = [0, 1].filter(i => answers[i] === questions[i].correct).length;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onFinish, 1200);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="02b Quiz">
      <KFHeader right={<KFPill label="Quick Check" />} />
      <div style={{ padding: '40px 20px 80px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 6 }}>Quick check — no pressure.</h2>
          <p style={{ color: T.textSec, fontSize: 15, lineHeight: 1.6 }}>Not graded. Completing this adds to your Retention Score.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {questions.map((q, qi) => (
            <div key={qi} style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '20px 22px' }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 14, lineHeight: 1.5 }}>
                <span style={{ color: T.textTer, fontSize: 13, fontWeight: 400, marginRight: 8 }}>{qi + 1}.</span>
                {q.q}
              </p>
              {q.type === 'mc' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.opts.map((opt, oi) => {
                    const picked = answers[qi] === oi;
                    const correct = submitted && oi === q.correct;
                    const wrong = submitted && picked && oi !== q.correct;
                    return (
                      <div key={oi} onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))} style={{
                        padding: '10px 14px', borderRadius: T.radiusSm, cursor: submitted ? 'default' : 'pointer',
                        border: `1.5px solid ${correct ? '#4A7C6F' : wrong ? '#DC2626' : picked ? T.accent : T.border}`,
                        background: correct ? '#E6F0EE' : wrong ? '#FEF2F2' : picked ? T.accentLight : '#FAFAF9',
                        fontSize: 14, color: correct ? T.accent : wrong ? '#DC2626' : T.text,
                        fontWeight: picked || correct ? 500 : 400, transition: T.transition,
                      }}>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <textarea value={openText} onChange={e => setOpenText(e.target.value)} placeholder={q.placeholder}
                  rows={3} style={{
                    width: '100%', padding: '10px 12px', border: `1px solid ${T.border}`,
                    borderRadius: T.radiusSm, fontSize: 14, fontFamily: 'inherit', resize: 'none',
                    color: T.text, background: '#FAFAF9', outline: 'none', lineHeight: 1.6,
                  }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              )}
            </div>
          ))}
        </div>

        {submitted ? (
          <div style={{ marginTop: 28, textAlign: 'center', color: T.accent, fontSize: 15, fontWeight: 500 }}>
            ✓ {mcCorrect === 2 ? 'Perfect score!' : mcCorrect === 1 ? 'Good effort!' : 'Keep reading!'} Moving on…
          </div>
        ) : (
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
            <KFBtn onClick={handleSubmit} disabled={answers[0] === undefined || answers[1] === undefined}>
              See what's next <ArrowRight />
            </KFBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen 3: Branch Selection ───────────────────────────────────────────────
function BranchScreen({ onDone, difficulty, setDifficulty }) {
  const [selected, setSelected] = useState(null);
  const [customText, setCustomText] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const canConfirm = selected || customText.trim().length > 0;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onDone, 900);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="03 Branch">
      <KFHeader right={
        <DifficultyBadge difficulty={difficulty} onChange={setDifficulty} />
      } />
      <div style={{ padding: '40px 20px 80px', maxWidth: 800, margin: '0 auto' }}>
        {/* Crumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 13, color: T.textTer }}>
          <span>Finance</span><ChevronRight />
          <span style={{ color: T.textSec, fontWeight: 500 }}>Compound Interest</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 8 }}>Where do you want to go next?</h2>
        <p style={{ color: T.textSec, fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Each path builds on what you just read. Your next article arrives tomorrow.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 10 }}>
          {KF_BRANCHES.map(b => {
            const sel = selected === b.id;
            return (
              <KFCard key={b.id} selected={sel} onClick={() => { setSelected(b.id); setCustomText(''); }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: sel ? T.accent : T.text, lineHeight: 1.3, flex: 1 }}>{b.title}</span>
                  {sel && <CheckMark />}
                </div>
                <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.55 }}>{b.desc}</p>
              </KFCard>
            );
          })}
          {/* Custom card */}
          <KFCard selected={customText.trim().length > 0 && !selected}>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 10 }}>Something else…</p>
            <textarea value={customText} onChange={e => { setCustomText(e.target.value); setSelected(null); }}
              placeholder="Type a related thread you'd like to explore…" rows={2}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, fontFamily: 'inherit', resize: 'none', color: T.text, background: 'transparent', outline: 'none', lineHeight: 1.55 }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </KFCard>
        </div>

        {/* Difficulty reminder */}
        <div style={{ marginTop: 16, marginBottom: 24, padding: '12px 16px', background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: T.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: T.textSec }}>Difficulty for next article</span>
          <DifficultyBadge difficulty={difficulty} onChange={setDifficulty} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
          {!canConfirm && <span style={{ fontSize: 13, color: T.textTer }}>Select a topic to continue</span>}
          {confirmed ? (
            <div style={{ color: T.accent, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.5 9L7.5 13L14.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Saved! See you tomorrow.
            </div>
          ) : (
            <KFBtn onClick={handleConfirm} disabled={!canConfirm}>
              Choose &amp; come back tomorrow
            </KFBtn>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ArticleScreen, QuizScreen, BranchScreen, DifficultyBadge });
