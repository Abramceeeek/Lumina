import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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
import { resolveGenerator, resolvePersonalizer } from '@/ai/resolve';
import { getPrimaryInterestField } from '@/data/profile';
import { saveGeneratedArticle, recordRead, getTodaysBaseline } from '@/data/articles';
import { nextFocus, getFieldLevels } from '@/data/ladder';
import type { VocabItem } from '@lumina/shared';
import { addHighlightRemote } from '@/data/highlights';

const READ_MINUTES = 5;
const GEN_TIMEOUT_MS = 25000;

type Content = { title: string; topic: string; body: string[] };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Reject if a promise doesn't settle in time, so a hung provider surfaces an error
// (with a retry) instead of an endless spinner.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

// A2 + generation: the daily article is generated for the user's topic at their
// level (cached per day + difficulty), then read with a finish-timer gate and
// long-press highlights.
export function Article({ onFinish }: { onFinish: () => void }) {
  const difficulty = useAppStore((s) => s.difficulty);
  const addHighlight = useAppStore((s) => s.addHighlight);
  const dailyArticle = useAppStore((s) => s.dailyArticle);
  const setDailyArticle = useAppStore((s) => s.setDailyArticle);
  const nextTopic = useAppStore((s) => s.nextTopic);
  const fontSize = useAppStore((s) => s.fontSize);
  const readWidth = useAppStore((s) => s.readWidth);

  const today = todayKey();
  const cached = dailyArticle && dailyArticle.date === today && dailyArticle.difficulty === difficulty ? dailyArticle : null;
  const [content, setContent] = useState<Content | null>(cached ? { title: cached.title, topic: cached.topic, body: cached.body } : null);
  const [genLoading, setGenLoading] = useState(!cached);
  const [articleId, setArticleId] = useState<string | undefined>(cached?.articleId);
  const [vocab, setVocab] = useState<VocabItem[] | undefined>(cached?.vocabulary);
  const [attempt, setAttempt] = useState(0);
  const [genError, setGenError] = useState(false);
  const [degraded, setDegraded] = useState(false);

  const totalSecs = READ_MINUTES * 60;
  const [progress, setProgress] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate today's article (re-runnable via `attempt`). On failure/timeout we
  // surface an error with a retry instead of silently swapping in a sample.
  useEffect(() => {
    if (content && attempt === 0) return;
    let cancelled = false;
    (async () => {
      setGenLoading(true);
      setGenError(false);
      try {
        const produced = await withTimeout(
          (async () => {
            const field = await getPrimaryInterestField();
            const focus = await nextFocus();
            const levels = field ? await getFieldLevels(field.id) : { cefr: 'A1' as const, fieldLevel: 1 as const };

            // Prefer a real server-synthesized baseline for today's field article;
            // fall back to on-device generation (and for branched explorations).
            const baseline = !nextTopic && field ? await getTodaysBaseline(field.id) : null;

            let c: Content;
            let id: string | undefined;
            let quiz = baseline?.quiz;
            let vocabulary = baseline?.vocabulary;
            let branches = baseline?.branches;
            let usedFocus = focus;

            if (baseline && field) {
              const p = await (await resolvePersonalizer()).personalize({
                title: baseline.title,
                body: baseline.body,
                language: 'English',
                difficulty,
                targetMinutes: READ_MINUTES,
                languageLevel: levels.cefr,
                fieldLevel: levels.fieldLevel,
                focus: baseline.focus ?? focus,
              });
              c = { title: baseline.title, topic: field.label, body: p.body.length ? p.body : baseline.body };
              id = baseline.id; // a real article row already exists; read against it
              usedFocus = baseline.focus ?? focus;
            } else {
              const topic = nextTopic ?? field?.label ?? SAMPLE_ARTICLE.topic;
              const gen = await (await resolveGenerator()).generate({
                topic,
                difficulty,
                language: 'English',
                targetMinutes: READ_MINUTES,
                languageLevel: levels.cefr,
                fieldLevel: levels.fieldLevel,
                focus,
              });
              c = { title: gen.title, topic: gen.topic, body: gen.body };
              quiz = gen.quiz;
              vocabulary = gen.vocabulary;
              branches = gen.branches;
              id = field
                ? ((await saveGeneratedArticle({ fieldId: field.id, title: c.title, body: c.body, focus, quiz, vocabulary, branches })) ?? undefined)
                : undefined;
            }
            return { c, id, quiz, vocabulary, branches, usedFocus, fieldId: field?.id };
          })(),
          GEN_TIMEOUT_MS,
        );

        if (cancelled) return;
        setContent(produced.c);
        setArticleId(produced.id);
        setVocab(produced.vocabulary);
        setDegraded(false);
        setDailyArticle({
          date: today,
          difficulty,
          ...produced.c,
          articleId: produced.id,
          focus: produced.usedFocus,
          fieldId: produced.fieldId,
          quiz: produced.quiz,
          vocabulary: produced.vocabulary,
          branches: produced.branches,
        });
      } catch {
        if (!cancelled) setGenError(true);
      } finally {
        if (!cancelled) setGenLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retryGenerate = () => {
    setContent(null);
    setGenError(false);
    setAttempt((a) => a + 1);
  };

  const readSample = () => {
    setContent({ title: SAMPLE_ARTICLE.subtopic, topic: SAMPLE_ARTICLE.topic, body: SAMPLE_ARTICLE.body });
    setVocab(undefined);
    setArticleId(undefined);
    setDegraded(true);
    setGenError(false);
    setGenLoading(false);
  };

  // Reading timer (starts once the article is shown).
  useEffect(() => {
    if (genLoading || !content || timerDone) return;
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
  }, [genLoading, content, timerDone, totalSecs]);

  // Record the read once the timer completes (one row per article, this session).
  const readRecorded = useRef(false);
  useEffect(() => {
    if (timerDone && articleId && !readRecorded.current) {
      readRecorded.current = true;
      void recordRead(articleId);
    }
  }, [timerDone, articleId]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const saveHighlight = (text: string) => {
    if (!content) return;
    addHighlight({ quote: text, article: content.title, topic: content.topic });
    void addHighlightRemote({ quote: text, article: content.title, topic: content.topic });
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  const header = (
    <Header
      right={
        <View style={styles.headerRight}>
          <DifficultyBadge />
          <View style={styles.streak}>
            <Text style={{ fontSize: 15 }}>🔥</Text>
            <Text style={styles.streakText}>Day 1</Text>
          </View>
        </View>
      }
    />
  );

  if (genError && !content) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <View style={styles.loading}>
          <Text style={styles.errorTitle}>Couldn&apos;t write today&apos;s article</Text>
          <Text style={styles.errorText}>Check your connection or your AI key in Profile, then try again.</Text>
          <View style={styles.errorActions}>
            <Button label="Try again" onPress={retryGenerate} />
            <Button variant="ghost" size="sm" label="Read a sample" onPress={readSample} />
          </View>
        </View>
      </View>
    );
  }

  if (genLoading || !content) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Writing today&apos;s article…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {header}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.article, { maxWidth: readWidth }]}>
          {degraded ? (
            <View style={styles.degradedBanner}>
              <Text style={styles.degradedText}>
                Sample article — today&apos;s personalized story couldn&apos;t be generated. Add or check your AI key in Profile.
              </Text>
            </View>
          ) : null}
          <View style={styles.meta}>
            <Pill label={content.topic} />
            <Text style={styles.metaText}>· {READ_MINUTES} min read</Text>
          </View>

          <Text style={styles.title}>{content.title}</Text>

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
          {!timerDone ? (
            <Text style={styles.timerCaption}>Take your time — the next step unlocks when you&apos;re done reading.</Text>
          ) : null}

          <Text style={styles.hint}>Long-press a paragraph to save a highlight.</Text>

          <View style={{ gap: 22 }}>
            {content.body.map((p, i) => (
              <Text
                key={i}
                selectable
                onLongPress={() => saveHighlight(p)}
                accessibilityHint="Long-press to save this paragraph as a highlight"
                style={[styles.para, { fontSize, lineHeight: Math.round(fontSize * 1.78) }, i === 0 ? styles.paraLead : null]}
              >
                {p}
              </Text>
            ))}
          </View>

          {vocab && vocab.length ? (
            <View style={styles.vocabCard}>
              <Text style={styles.vocabHead}>Words to know</Text>
              {vocab.map((v) => (
                <View key={v.word} style={styles.vocabRow}>
                  <Text style={styles.vocabWord}>{v.word}</Text>
                  <Text style={styles.vocabDef}>{v.definition}</Text>
                </View>
              ))}
            </View>
          ) : null}

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

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Highlight saved ✓</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  loadingText: { color: colors.textSec, fontSize: 14, fontFamily: fonts.regular },
  errorTitle: { color: colors.text, fontSize: 18, fontFamily: fonts.semibold, textAlign: 'center' },
  errorText: { color: colors.textSec, fontSize: 14, fontFamily: fonts.regular, textAlign: 'center', lineHeight: 20 },
  errorActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  degradedBanner: { backgroundColor: semantic.dangerBg, borderWidth: 1, borderColor: semantic.dangerBorder, borderRadius: radius.sm, padding: 12, marginBottom: 18 },
  degradedText: { color: colors.textSec, fontSize: 13, fontFamily: fonts.regular, lineHeight: 18 },
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
  para: { fontSize: 18, lineHeight: 32, color: colors.textSec, fontFamily: fonts.regular },
  paraLead: { color: colors.text, fontFamily: fonts.medium },
  vocabCard: { marginTop: 36, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18, gap: 12 },
  vocabHead: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textTer, textTransform: 'uppercase', letterSpacing: 0.5 },
  vocabRow: { gap: 2 },
  vocabWord: { fontSize: 15, fontFamily: fonts.semibold, color: colors.accent },
  vocabDef: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSec, lineHeight: 20 },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 48 },
  endLine: { flex: 1, height: 1, backgroundColor: colors.border },
  endText: { fontSize: 13, color: colors.textTer, fontStyle: 'italic', fontFamily: fonts.regular },
  gateText: { color: colors.textTer, fontSize: 14, fontFamily: fonts.regular },
  greatText: { color: colors.textSec, fontSize: 15, fontFamily: fonts.regular, marginBottom: 16 },
  toast: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: colors.text, paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.pill },
  toastText: { color: '#fff', fontSize: 13, fontFamily: fonts.medium },
});
