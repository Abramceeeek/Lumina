import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { TRAIL } from '@/data/sample';

const STATS = [
  { label: 'Articles read', value: '12' },
  { label: 'Day streak', value: '12' },
  { label: 'Topics explored', value: '1' },
];

export function TrailLinear() {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Knowledge Trail</Text>
        <Text style={styles.sub}>Every article you&apos;ve read, in order. Each choice shapes the next.</Text>

        <View style={styles.timeline}>
          <View style={styles.spine} />
          {TRAIL.map((node, i) => (
            <View key={node.id} style={{ position: 'relative', marginBottom: i < TRAIL.length - 1 ? 28 : 0 }}>
              <View
                style={[
                  styles.dot,
                  node.isNext
                    ? { backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.textTer, borderStyle: 'dashed' }
                    : node.isCurrent
                      ? { backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.accentLight }
                      : { backgroundColor: colors.accent },
                ]}
              />
              <View style={[styles.card, { borderColor: node.isCurrent ? colors.accent : colors.border, backgroundColor: node.isNext ? 'transparent' : colors.card, opacity: node.isNext ? 0.55 : 1 }]}>
                <View style={styles.cardTop}>
                  <Text style={[styles.topic, { color: node.isCurrent ? colors.accent : colors.textSec }]}>{node.topic}</Text>
                  <Text style={[styles.day, node.isNext ? { fontStyle: 'italic' } : null]}>{node.isNext ? 'Tomorrow' : `Day ${node.day}`}</Text>
                </View>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: node.isNext ? colors.textTer : colors.text, fontFamily: node.isCurrent ? fonts.semibold : fonts.regular }]}>{node.label}</Text>
                  {node.isCurrent && (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowText}>NOW</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.stats}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 26, fontFamily: fonts.semibold, letterSpacing: -0.8, marginBottom: 6, color: colors.text },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, marginBottom: 40 },
  timeline: { position: 'relative', paddingLeft: 32 },
  spine: { position: 'absolute', left: 7, top: 12, bottom: 12, width: 2, backgroundColor: colors.accent, opacity: 0.7 },
  dot: { position: 'absolute', left: -32, top: 4, width: 16, height: 16, borderRadius: 8 },
  card: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: radius.card, borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  topic: { fontSize: 13, fontFamily: fonts.medium },
  day: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15 },
  nowBadge: { backgroundColor: colors.accent, paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill },
  nowText: { fontSize: 10, color: '#fff', fontFamily: fonts.semibold, letterSpacing: 0.4 },
  stats: { marginTop: 36, flexDirection: 'row', gap: 12 },
  stat: { flex: 1, paddingVertical: 16, paddingHorizontal: 8, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: fonts.semibold, letterSpacing: -0.6, marginBottom: 4, color: colors.text },
  statLabel: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular, textAlign: 'center' },
});
