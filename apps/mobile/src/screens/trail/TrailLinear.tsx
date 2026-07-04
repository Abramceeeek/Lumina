import { useEffect, useState } from 'react';
import { Modal, ScrollView, View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { useAppStore } from '@/store/useAppStore';
import { getTrail, getTrailStats, type TrailItem, type TrailStats } from '@/data/trail';
import { getArticleForReview, type ReviewArticle } from '@/data/articles';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';

export function TrailLinear() {
  const nextTopic = useAppStore((s) => s.nextTopic);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [stats, setStats] = useState<TrailStats>({ articlesRead: 0, dayStreak: 0, topicsExplored: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [review, setReview] = useState<{ articleId: string; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [t, s] = await Promise.all([getTrail(nextTopic), getTrailStats()]);
        if (cancelled) return;
        setTrail(t);
        setStats(s);
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

  const statCards = [
    { label: 'Articles read', value: String(stats.articlesRead) },
    { label: 'Day streak', value: String(stats.dayStreak) },
    { label: 'Topics explored', value: String(stats.topicsExplored) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Knowledge Trail</Text>
        <Text style={styles.sub}>Every article you&apos;ve read, in order. Each choice shapes the next.</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Couldn&apos;t load your trail.</Text>
            <Button variant="ghost" size="sm" label="Retry" onPress={() => setAttempt((a) => a + 1)} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
          </View>
        ) : trail.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your trail starts with your first article. Finish today&apos;s read to add the first node.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            <View style={styles.spine} />
            {trail.map((node, i) => (
              <Pressable
                key={node.id}
                accessible
                accessibilityRole={node.articleId && !node.isNext ? 'button' : undefined}
                accessibilityLabel={`${node.label}, day ${node.day}${node.isCurrent ? ', current' : ''}${node.isNext ? ', tomorrow' : ''}`}
                accessibilityHint={node.articleId && !node.isNext ? 'Opens the article to re-read' : undefined}
                onPress={node.articleId && !node.isNext ? () => setReview({ articleId: node.articleId as string, title: node.label }) : undefined}
                style={{ position: 'relative', marginBottom: i < trail.length - 1 ? 28 : 0 }}
              >
                <View
                  style={[
                    styles.dot,
                    node.isNext
                      ? { backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.textTer, borderStyle: 'dashed' }
                      : node.isCurrent
                        ? { backgroundColor: node.color, borderWidth: 3, borderColor: colors.accentLight }
                        : { backgroundColor: node.color },
                  ]}
                />
                <View style={[styles.card, { borderColor: node.isCurrent ? node.color : colors.border, backgroundColor: node.isNext ? 'transparent' : colors.card, opacity: node.isNext ? 0.55 : 1 }]}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.topic, { color: node.isCurrent ? node.color : colors.textSec }]}>{node.topic}</Text>
                    <Text style={[styles.day, node.isNext ? { fontStyle: 'italic' } : null]}>{node.isNext ? 'Tomorrow' : `Day ${node.day}`}</Text>
                  </View>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: node.isNext ? colors.textTer : colors.text, fontFamily: node.isCurrent ? fonts.semibold : fonts.regular }]}>{node.label}</Text>
                    {node.isCurrent && (
                      <View style={[styles.nowBadge, { backgroundColor: node.color }]}>
                        <Text style={styles.nowText}>NOW</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {review ? <ReviewModal articleId={review.articleId} fallbackTitle={review.title} onClose={() => setReview(null)} /> : null}

        <View style={styles.stats}>
          {statCards.map((s) => (
            <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// Read-only revisit of a past article from its trail node — no timer, no quiz,
// no effect on streak or ladder.
function ReviewModal({ articleId, fallbackTitle, onClose }: { articleId: string; fallbackTitle: string; onClose: () => void }) {
  const [article, setArticle] = useState<ReviewArticle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getArticleForReview(articleId)
      .then((a) => {
        if (cancelled) return;
        if (a) setArticle(a);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.reviewBackdrop}>
        <View style={styles.reviewCard}>
          <View style={styles.reviewHead}>
            <View style={{ flex: 1, gap: 6 }}>
              {article?.topic ? <Pill label={article.topic} /> : null}
              <Text style={styles.reviewTitle}>{article?.title ?? fallbackTitle}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Text style={styles.reviewClose}>×</Text>
            </Pressable>
          </View>
          {failed ? (
            <Text style={styles.reviewText}>Couldn&apos;t load this article. Check your connection and try again.</Text>
          ) : !article ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
              {article.body.map((p, i) => (
                <Text key={i} style={styles.reviewText}>
                  {p}
                </Text>
              ))}
              {article.vocabulary?.length ? (
                <View style={styles.reviewVocab}>
                  {article.vocabulary.map((v) => (
                    <Text key={v.word} style={styles.reviewText}>
                      <Text style={{ fontFamily: fonts.semibold, color: colors.accent }}>{v.word}</Text> — {v.definition}
                    </Text>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          )}
          <Text style={styles.reviewNote}>Re-reading — doesn&apos;t affect your streak or levels.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 26, fontFamily: fonts.semibold, letterSpacing: -0.8, marginBottom: 6, color: colors.text },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, marginBottom: 40 },
  loadingContainer: { paddingVertical: 48, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  errorCard: { paddingVertical: 18, paddingHorizontal: 16, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  errorText: { color: colors.textSec, fontSize: 14, fontFamily: fonts.regular },
  empty: { paddingVertical: 32, paddingHorizontal: 20, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  emptyText: { color: colors.textSec, fontSize: 14, lineHeight: 22, fontFamily: fonts.regular, textAlign: 'center' },
  timeline: { position: 'relative', paddingLeft: 32 },
  spine: { position: 'absolute', left: 7, top: 12, bottom: 12, width: 2, backgroundColor: colors.accent, opacity: 0.7 },
  dot: { position: 'absolute', left: -32, top: 4, width: 16, height: 16, borderRadius: 8 },
  card: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: radius.card, borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  topic: { fontSize: 13, fontFamily: fonts.medium },
  day: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15 },
  nowBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill },
  nowText: { fontSize: 10, color: '#fff', fontFamily: fonts.semibold, letterSpacing: 0.4 },
  stats: { marginTop: 36, flexDirection: 'row', gap: 12 },
  stat: { flex: 1, paddingVertical: 16, paddingHorizontal: 8, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: fonts.semibold, letterSpacing: -0.6, marginBottom: 4, color: colors.text },
  statLabel: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular, textAlign: 'center' },
  reviewBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  reviewCard: { width: '100%', maxWidth: 560, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 20 },
  reviewHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewTitle: { fontSize: 18, fontFamily: fonts.semibold, letterSpacing: -0.4, color: colors.text, lineHeight: 24 },
  reviewClose: { fontSize: 24, color: colors.textTer, paddingHorizontal: 4 },
  reviewText: { fontSize: 15, lineHeight: 24, color: colors.textSec, fontFamily: fonts.regular },
  reviewVocab: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, gap: 8 },
  reviewNote: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular, fontStyle: 'italic', marginTop: 14 },
});
