import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, PanResponder } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { useAppStore } from '@/store/useAppStore';
import { getGraph, type GraphNode } from '@/data/trail';
import { Button } from '@/components/Button';

const W = 600;
const H = 520;

export function TrailGraph() {
  const nextTopic = useAppStore((s) => s.nextTopic);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const offset = useRef({ x: -40, y: -40 });
  const [pos, setPos] = useState({ x: -40, y: -40 });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const g = await getGraph(nextTopic);
        if (cancelled) return;
        setNodes(g.nodes);
        setEdges(g.edges);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nextTopic, attempt]);

  // Core RN pan (no reanimated): only captures after real movement, so taps
  // still reach node onPress.
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderMove: (_, g) => setPos({ x: offset.current.x + g.dx, y: offset.current.y + g.dy }),
        onPanResponderRelease: (_, g) => {
          offset.current = { x: offset.current.x + g.dx, y: offset.current.y + g.dy };
        },
      }),
    [],
  );

  const legend = useMemo(() => {
    const m = new Map<string, string>();
    nodes.forEach((n) => {
      if (n.topic && !n.next) m.set(n.topic, n.color);
    });
    return [...m.entries()];
  }, [nodes]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const sel = selected ? byId.get(selected) : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.subhead}>
        <View>
          <Text style={styles.h3}>Knowledge Graph</Text>
          <Text style={styles.h3sub}>Your learning map — drag to explore, tap a node</Text>
        </View>
        <View style={styles.legend}>
          {legend.map(([topic, color]) => (
            <View key={topic} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{topic}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.canvas} {...responder.panHandlers}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Couldn&apos;t load your graph.</Text>
              <Button variant="ghost" size="sm" label="Retry" onPress={() => setAttempt((a) => a + 1)} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            </View>
          </View>
        ) : nodes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Read your first article to grow your knowledge graph.</Text>
          </View>
        ) : (
          <View style={{ width: W, height: H, transform: [{ translateX: pos.x }, { translateY: pos.y }] }}>
            <Svg width={W} height={H}>
              {edges.map(([a, b]) => {
                const na = byId.get(a);
                const nb = byId.get(b);
                if (!na || !nb) return null;
                return (
                  <Line
                    key={`${a}-${b}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke={colors.border}
                    strokeWidth={1.5}
                    strokeDasharray={nb.next ? '5 4' : undefined}
                    opacity={nb.next ? 0.5 : 0.7}
                  />
                );
              })}
              {nodes.map((node) => {
                const color = node.color;
                const r = node.current ? 20 : node.next ? 14 : 16;
                const labelText = node.label.length > 18 ? node.label.slice(0, 17) + '…' : node.label;
                return (
                  <G key={node.id} onPress={() => setSelected(node.id)} accessible accessibilityRole="button" accessibilityLabel={`${node.label}${node.current ? ', current article' : node.next ? ', tomorrow' : `, ${node.topic}`}`}>
                    {node.current && <Circle cx={node.x} cy={node.y} r={r + 8} fill={color} opacity={0.12} />}
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={node.next ? '#FFFFFF' : color}
                      stroke={color}
                      strokeWidth={node.next ? 2 : 0}
                      strokeDasharray={node.next ? '4 3' : undefined}
                      opacity={node.next ? 0.6 : 1}
                    />
                    <SvgText x={node.x} y={node.y + r + 14} textAnchor="middle" fontSize={10} fill={node.next ? colors.textTer : colors.textSec}>
                      {labelText}
                    </SvgText>
                    {node.current && (
                      <>
                        <Rect x={node.x - 14} y={node.y - r - 20} width={28} height={14} rx={7} fill={color} />
                        <SvgText x={node.x} y={node.y - r - 10} textAnchor="middle" fontSize={8} fill="#FFFFFF" fontWeight="700">
                          NOW
                        </SvgText>
                      </>
                    )}
                  </G>
                );
              })}
            </Svg>
          </View>
        )}

        {sel && (
          <View style={styles.tooltip}>
            <Text style={styles.ttTitle}>{sel.label}</Text>
            <Text style={styles.ttSub}> {sel.current ? 'Current article' : sel.next ? 'Tomorrow' : sel.topic}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subhead: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h3: { fontSize: 16, fontFamily: fonts.semibold, letterSpacing: -0.4, marginBottom: 2, color: colors.text },
  h3sub: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular },
  legend: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 180 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.textSec, fontFamily: fonts.regular },
  canvas: { flex: 1, overflow: 'hidden', marginHorizontal: 20, marginBottom: 20, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FDFDFC' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorCard: { paddingVertical: 18, paddingHorizontal: 16, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, maxWidth: 300 },
  errorText: { color: colors.textSec, fontSize: 14, fontFamily: fonts.regular },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: colors.textSec, fontSize: 14, lineHeight: 22, fontFamily: fonts.regular, textAlign: 'center' },
  tooltip: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', backgroundColor: colors.text, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.sm },
  ttTitle: { color: '#fff', fontSize: 13, fontFamily: fonts.semibold },
  ttSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: fonts.regular, marginLeft: 8 },
});
