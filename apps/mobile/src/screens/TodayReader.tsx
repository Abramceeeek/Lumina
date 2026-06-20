import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { Button } from '@/components/Button';
import { ArrowRight } from '@/components/icons';
import { SAMPLE_ARTICLE } from '@/data/sample';

// A0: faithful static port of the prototype's article reader.
// Timer gating + highlight-to-save land in Phase A2.
export function TodayReader() {
  const a = SAMPLE_ARTICLE;
  return (
    <View style={{ flex: 1 }}>
      <Header
        right={
          <View style={styles.headerRight}>
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>{a.difficulty}</Text>
            </View>
            <View style={styles.streak}>
              <Text style={{ fontSize: 15 }}>🔥</Text>
              <Text style={styles.streakText}>Day {a.day}</Text>
            </View>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.article}>
          <View style={styles.meta}>
            <Pill label={a.topic} />
            <Text style={styles.metaText}>· {a.readTime} min read</Text>
          </View>

          <Text style={styles.title}>{a.subtopic}</Text>

          <View style={styles.timerTrack}>
            <View style={styles.timerFill} />
          </View>

          <View style={{ gap: 22, marginTop: 8 }}>
            {a.body.map((p, i) => (
              <Text key={i} style={[styles.para, i === 0 ? styles.paraLead : null]}>
                {p}
              </Text>
            ))}
          </View>

          <View style={styles.endRow}>
            <View style={styles.endLine} />
            <Text style={styles.endText}>End of today&apos;s article</Text>
            <View style={styles.endLine} />
          </View>

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Button label="Quick quiz — then choose next">
              <ArrowRight />
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: 40, paddingHorizontal: 20 },
  article: { width: '100%', maxWidth: 680, alignSelf: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  diffText: { fontSize: 12, fontFamily: fonts.medium, color: colors.accent },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentLight, paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  streakText: { fontSize: 13, fontFamily: fonts.medium, color: colors.accent },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  metaText: { color: colors.textTer, fontSize: 13, fontFamily: fonts.regular },
  title: { fontSize: 30, fontFamily: fonts.semibold, letterSpacing: -1, lineHeight: 36, color: colors.text, marginBottom: 18 },
  timerTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  timerFill: { height: '100%', width: '40%', backgroundColor: colors.accent, borderRadius: 2 },
  para: { fontSize: 18, lineHeight: 32, color: colors.textSec, fontFamily: fonts.regular },
  paraLead: { color: colors.text, fontFamily: fonts.medium },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 48 },
  endLine: { flex: 1, height: 1, backgroundColor: colors.border },
  endText: { fontSize: 13, color: colors.textTer, fontStyle: 'italic', fontFamily: fonts.regular },
});
