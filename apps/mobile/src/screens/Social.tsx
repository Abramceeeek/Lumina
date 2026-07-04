import { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { getLeaderboard, type LeaderRow } from '@/data/social';
import { getTrailStats } from '@/data/trail';
import { computeBadges, type Badge } from '@/lib/badges';

export function Social() {
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [board, stats] = await Promise.all([getLeaderboard(), getTrailStats()]);
        if (cancelled) return;
        setLeaders(board);
        setBadges(computeBadges(stats));
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
  }, [attempt]);

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrap}>
          <Text style={styles.title}>Learning together</Text>
          <Text style={styles.sub}>Leaderboard — by articles read</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Couldn&apos;t load the leaderboard.</Text>
              <Button variant="ghost" size="sm" label="Retry" onPress={() => setAttempt((a) => a + 1)} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            </View>
          ) : leaders.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Read your first article to join the leaderboard.</Text>
            </View>
          ) : (
            <View style={{ gap: 8, marginBottom: 32 }}>
              {leaders.map((f, i) => (
                <View key={f.userId} accessible accessibilityLabel={`${i + 1}. ${f.name}, ${f.articles} articles, ${f.daysActive} active days${f.isYou ? ', you' : ''}`} style={[styles.row, { backgroundColor: f.isYou ? colors.accentLight : colors.card, borderColor: f.isYou ? colors.accent : colors.border }]}>
                  <Text style={[styles.rank, { color: i < 3 ? colors.accent : colors.textTer }]}>{i + 1}</Text>
                  <View style={[styles.avatar, { backgroundColor: f.isYou ? colors.accent : colors.border }]}>
                    <Text style={[styles.avatarText, { color: f.isYou ? '#fff' : colors.textSec }]}>{(f.name[0] ?? '?').toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { fontFamily: f.isYou ? fonts.semibold : fonts.regular }]}>
                      {f.name}
                      {f.isYou ? '  (you)' : ''}
                    </Text>
                    <Text style={styles.streak}>{f.daysActive} active {f.daysActive === 1 ? 'day' : 'days'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.articles, { color: f.isYou ? colors.accent : colors.text }]}>{f.articles}</Text>
                    <Text style={styles.articlesLabel}>articles</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.h3}>Your badges</Text>
          {error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Couldn&apos;t load your badges.</Text>
            </View>
          ) : badges.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Badges unlock as you read, build streaks, and explore fields.</Text>
            </View>
          ) : (
            <View style={styles.badges}>
              {badges.map((b) => (
                <View key={b.label} style={styles.badge}>
                  <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.badgeLabel}>{b.label}</Text>
                    <Text style={styles.badgeNote}>{b.note}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 580, alignSelf: 'center' },
  title: { fontSize: 22, fontFamily: fonts.semibold, letterSpacing: -0.6, marginBottom: 4, color: colors.text },
  sub: { fontSize: 15, color: colors.textSec, fontFamily: fonts.regular, marginBottom: 28 },
  loadingContainer: { paddingVertical: 48, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  errorCard: { paddingVertical: 18, paddingHorizontal: 16, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 32 },
  errorText: { color: colors.textSec, fontSize: 14, fontFamily: fonts.regular },
  empty: { paddingVertical: 28, paddingHorizontal: 20, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 32 },
  emptyText: { color: colors.textSec, fontSize: 14, lineHeight: 22, fontFamily: fonts.regular, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: radius.card },
  rank: { fontSize: 14, fontFamily: fonts.semibold, width: 18, textAlign: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: fonts.semibold },
  name: { fontSize: 14, color: colors.text },
  streak: { fontSize: 12, color: colors.textSec, fontFamily: fonts.regular },
  articles: { fontSize: 16, fontFamily: fonts.semibold },
  articlesLabel: { fontSize: 11, color: colors.textTer, fontFamily: fonts.regular },
  h3: { fontSize: 16, fontFamily: fonts.semibold, marginBottom: 14, color: colors.text },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  badge: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 16 },
  badgeLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text },
  badgeNote: { fontSize: 12, color: colors.textSec, fontFamily: fonts.regular },
});
