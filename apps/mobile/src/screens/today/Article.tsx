import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, radius, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { Button } from '@/components/Button';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { ArrowRight } from '@/components/icons';
import { SAMPLE_ARTICLE } from '@/data/sample';
import { useAppStore } from '@/store/useAppStore';
import { resolvePersonalizer } from '@/ai/resolve';
import type { Personalized } from '@/ai/types';

// A2: reader with a finish-reading timer that gates the next step, plus
// long-press-to-save highlights (RN-native stand-in for the prototype's
// text-selection flow).
export function Article({ onFinish }: { onFinish: () => void }) {
  const a = SAMPLE_ARTICLE;
  const totalSecs = a.readTime * 60;
  const [progress, setProgress] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addHighlight = useAppStore((s) => s.addHighlight);
  const difficulty = useAppStore((s) => s.difficulty);
  const [personalized, setPersonalized] = useState<Personalized | null>(null);
  const [pLoading, setPLoading] = useState(false);

  const personalize = async () => {
    setPLoading(true);
    try {
      const provider = await resolvePersonalizer();
      const out = await provider.personalize({ title: a.subtopic, body: a.body, language: 'English', difficulty, targetMinutes: 5 });
      setPersonalized(out);
    } catch {
      setPersonalized({ body: a.body, note: 'Personalization failed — check your AI key in Profile.' });
    } finally {
      setPLoading(false);
    }
  };

  const displayBody = personalized?.body ?? a.body;

  useEffect(() => {
    if (timerDone) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / totalSecs;
        if (next >= 100) {
          clearInterval(id);
          setTimerDone(true);
          return 100;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerDone, totalSecs]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const saveHighlight = (text: string) => {
    addHighlight({ quote: text, article: a.subtopic, topic: a.topic });
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        right={
          <View style={styles.headerRight}>
            <DifficultyBadge />
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
            <Svg width="100%" height={3}>
              <Defs>
                <LinearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={colors.accent} />
                  <Stop offset="1" stopColor={semantic.timerGradientEnd} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width={`${progress}%`} height={3} rx={2} fill={timerDone ? colors.accent : 'url(#timerGrad)'} />
            </Svg>
          </View>
          {!timerDone && (
            <Text style={styles.timerCaption}>Take your time — the next step unlocks when you&apos;re done reading.</Text>
          )}

          <Text style={styles.hint}>Long-press a paragraph to save a highlight.</Text>

          <View style={styles.personalizeRow}>
            {personalized ? (
              <View style={{ flex: 1 }}>
                <Text style={styles.personalizeNote}>{personalized.note}</Text>
                <Text style={styles.showOriginal} onPress={() => setPersonalized(null)} accessibilityRole="button" accessibilityLabel="Show original article">Show original</Text>
              </View>
            ) : (
              <Button variant="soft" size="sm" label={pLoading ? 'Personalizing…' : '✨ Personalize for me'} onPress={pLoading ? undefined : personalize} disabled={pLoading} />
            )}
          </View>

          <View style={{ gap: 22 }}>
            {displayBody.map((p, i) => (
              <Text key={i} selectable onLongPress={() => saveHighlight(p)} accessibilityHint="Long-press to save this paragraph as a highlight" style={[styles.para, i === 0 ? styles.paraLead : null]}>
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
            {!timerDone ? (
              <Text style={styles.gateText}>Finish reading to continue</Text>
            ) : (
              <>
                <Text style={styles.greatText}>Great reading! Now let&apos;s check in.</Text>
                <Button label="Quick quiz — then choose next" onPress={onFinish}>
                  <ArrowRight />
                </Button>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Highlight saved ✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 44, paddingHorizontal: 20, paddingBottom: 40 },
  article: { width: '100%', maxWidth: 680, alignSelf: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentLight, paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  streakText: { fontSize: 13, fontFamily: fonts.medium, color: colors.accent },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  metaText: { color: colors.textTer, fontSize: 13, fontFamily: fonts.regular },
  title: { fontSize: 30, fontFamily: fonts.semibold, letterSpacing: -1, lineHeight: 36, color: colors.text, marginBottom: 16 },
  timerTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  timerCaption: { fontSize: 12, color: colors.textTer, fontStyle: 'italic', fontFamily: fonts.regular },
  hint: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular, marginTop: 12, marginBottom: 16 },
  personalizeRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start' },
  personalizeNote: { fontSize: 13, color: colors.accent, fontFamily: fonts.medium, lineHeight: 19 },
  showOriginal: { fontSize: 13, color: colors.textTer, fontFamily: fonts.regular, marginTop: 4 },
  para: { fontSize: 18, lineHeight: 32, color: colors.textSec, fontFamily: fonts.regular },
  paraLead: { color: colors.text, fontFamily: fonts.medium },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 48 },
  endLine: { flex: 1, height: 1, backgroundColor: colors.border },
  endText: { fontSize: 13, color: colors.textTer, fontStyle: 'italic', fontFamily: fonts.regular },
  gateText: { color: colors.textTer, fontSize: 14, fontFamily: fonts.regular },
  greatText: { color: colors.textSec, fontSize: 15, fontFamily: fonts.regular, marginBottom: 16 },
  toast: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: colors.text, paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.pill },
  toastText: { color: '#fff', fontSize: 13, fontFamily: fonts.medium },
});
