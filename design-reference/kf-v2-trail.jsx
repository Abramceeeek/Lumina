// Knowledgeflow v2 — Trail screens (4A linear, 4B graph)

// ── Screen 4A: Linear Knowledge Trail ───────────────────────────────────────
function TrailLinear({ onSwitchGraph }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: T.bg }} data-screen-label="04a Trail">
      <KFHeader right={
        <button onClick={onSwitchGraph} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          border: `1px solid ${T.border}`, borderRadius: 100, background: '#FFFFFF',
          cursor: 'pointer', fontSize: 13, color: T.textSec, fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="7" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5.5 5L7 8.5M8.5 5L7 8.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Graph view
        </button>
      } />

      <div style={{ padding: '44px 20px 80px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 6 }}>Knowledge Trail</h2>
        <p style={{ color: T.textSec, fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
          Every article you've read, in order. Each choice shapes the next.
        </p>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div style={{ position: 'absolute', left: 7, top: 12, bottom: 12, width: 2, background: `linear-gradient(to bottom, ${T.accent} 65%, ${T.border} 100%)` }} />

          {KF_TRAIL.map((node, i) => (
            <div key={node.id} style={{ position: 'relative', marginBottom: i < KF_TRAIL.length - 1 ? 28 : 0 }}>
              <div style={{
                position: 'absolute', left: -32, top: 4,
                width: 16, height: 16, borderRadius: '50%',
                background: node.isNext ? T.bg : T.accent,
                border: node.isNext ? `2px dashed ${T.textTer}` : node.isCurrent ? `3px solid ${T.accentLight}` : 'none',
                boxShadow: node.isCurrent ? `0 0 0 3px ${T.accentLight}` : 'none',
              }} />

              <div style={{
                padding: '14px 18px', borderRadius: T.radius,
                border: `1.5px solid ${node.isCurrent ? T.accent : T.border}`,
                background: node.isNext ? 'transparent' : '#FFFFFF',
                opacity: node.isNext ? 0.55 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: node.isCurrent ? T.accent : T.textSec }}>{node.topic}</span>
                  <span style={{ fontSize: 12, color: T.textTer, fontStyle: node.isNext ? 'italic' : 'normal' }}>
                    {node.isNext ? 'Tomorrow' : `Day ${node.day}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: node.isCurrent ? 600 : 400, color: node.isNext ? T.textTer : T.text }}>
                  {node.label}
                  {node.isCurrent && (
                    <span style={{ fontSize: 10, background: T.accent, color: '#fff', padding: '2px 8px', borderRadius: 100, fontWeight: 700, letterSpacing: '0.04em' }}>NOW</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Articles read', value: '12' },
            { label: 'Day streak', value: '12' },
            { label: 'Topics explored', value: '1' },
          ].map(s => (
            <div key={s.label} style={{ padding: '16px', borderRadius: T.radius, border: `1px solid ${T.border}`, background: '#FFFFFF', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: T.textTer }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 4B: Knowledge Graph ───────────────────────────────────────────────
const GRAPH_NODES = [
  // Finance cluster
  { id: 'n1', label: 'Intro to Finance', topic: 'Finance', x: 300, y: 220, day: 1, read: true },
  { id: 'n2', label: 'Time Value of Money', topic: 'Finance', x: 370, y: 300, day: 3, read: true },
  { id: 'n3', label: 'Compound Interest', topic: 'Finance', x: 290, y: 380, day: 12, read: true, current: true },
  { id: 'n4', label: 'The Rule of 72', topic: 'Finance', x: 370, y: 460, next: true },
  // Technology cluster
  { id: 'n5', label: 'How the Internet Works', topic: 'Technology', x: 160, y: 200, day: 5, read: true },
  { id: 'n6', label: 'Machine Learning Basics', topic: 'Technology', x: 100, y: 290, day: 8, read: true },
  // Philosophy cluster
  { id: 'n7', label: 'Plato\'s Cave', topic: 'Philosophy', x: 490, y: 200, day: 7, read: true },
];

const GRAPH_EDGES = [
  ['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'],
  ['n5', 'n6'],
  ['n1', 'n5'],
];

const TOPIC_COLORS = {
  Finance: '#4A7C6F',
  Technology: '#5B7BA8',
  Philosophy: '#8A6BA8',
};

function TrailGraph({ onSwitchLinear }) {
  const [hovered, setHovered] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef(null);

  const W = 600, H = 520;

  const onMouseDown = e => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = e => {
    if (!dragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => { setDragging(false); setDragStart(null); };

  const hNode = hovered ? GRAPH_NODES.find(n => n.id === hovered) : null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg }} data-screen-label="04b Graph">
      <KFHeader right={
        <button onClick={onSwitchLinear} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          border: `1px solid ${T.border}`, borderRadius: 100, background: '#FFFFFF',
          cursor: 'pointer', fontSize: 13, color: T.textSec, fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Trail view
        </button>
      } />

      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 2 }}>Knowledge Graph</h3>
          <p style={{ fontSize: 13, color: T.textSec }}>Your learning map — drag to explore</p>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
            <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.textSec }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              {topic}
            </div>
          ))}
        </div>
      </div>

      {/* Graph canvas */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', margin: '0 20px 20px', borderRadius: T.radius, border: `1px solid ${T.border}`, background: '#FDFDFC', cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block' }}>
          <g transform={`translate(${pan.x}, ${pan.y})`}>
            {/* Grid dots */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill={T.border} />
            </pattern>
            <rect x="-200" y="-200" width={W + 400} height={H + 400} fill="url(#grid)" />

            {/* Edges */}
            {GRAPH_EDGES.map(([a, b]) => {
              const na = GRAPH_NODES.find(n => n.id === a);
              const nb = GRAPH_NODES.find(n => n.id === b);
              return (
                <line key={`${a}-${b}`}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={nb.next ? T.border : T.border}
                  strokeWidth={1.5}
                  strokeDasharray={nb.next ? '5 4' : 'none'}
                  opacity={nb.next ? 0.5 : 0.7}
                />
              );
            })}

            {/* Nodes */}
            {GRAPH_NODES.map(node => {
              const color = TOPIC_COLORS[node.topic] || T.accent;
              const isHov = hovered === node.id;
              const r = node.current ? 20 : node.next ? 14 : 16;
              return (
                <g key={node.id}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Glow ring for current */}
                  {node.current && (
                    <circle cx={node.x} cy={node.y} r={r + 8} fill={color} opacity={0.12} />
                  )}
                  {isHov && (
                    <circle cx={node.x} cy={node.y} r={r + 6} fill={color} opacity={0.1} />
                  )}
                  <circle cx={node.x} cy={node.y} r={r}
                    fill={node.next ? '#FFFFFF' : color}
                    stroke={color}
                    strokeWidth={node.next ? 2 : 0}
                    strokeDasharray={node.next ? '4 3' : 'none'}
                    opacity={node.next ? 0.6 : 1}
                  />
                  {/* Label */}
                  <text x={node.x} y={node.y + r + 14}
                    textAnchor="middle" fontSize="10"
                    fill={node.next ? T.textTer : T.textSec}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}>
                    {node.label.length > 18 ? node.label.slice(0, 17) + '…' : node.label}
                  </text>
                  {/* NOW badge */}
                  {node.current && (
                    <g>
                      <rect x={node.x - 14} y={node.y - r - 20} width={28} height={14} rx={7} fill={color} />
                      <text x={node.x} y={node.y - r - 10} textAnchor="middle" fontSize="8" fill="white" fontWeight="700" style={{ userSelect: 'none', pointerEvents: 'none' }}>NOW</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover tooltip */}
        {hNode && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            background: T.text, color: '#fff', padding: '8px 14px', borderRadius: T.radiusSm,
            fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontWeight: 600 }}>{hNode.label}</span>
            <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 12 }}>
              {hNode.current ? 'Current article' : hNode.next ? 'Tomorrow' : `Day ${hNode.day}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TrailLinear, TrailGraph });
