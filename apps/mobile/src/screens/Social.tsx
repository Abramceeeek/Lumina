import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { FRIENDS, BADGES } from '@/data/sample';

export function Social() {
  const sorted = [...FRIENDS].sort((a, b) => b.articles - a.articles);
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrap}>
          <Text style={styles.title}>Learning together</Text>
          <Text style={styles.sub}>Weekly leaderboard</Text>

          <View style={{ gap: 8, marginBottom: 32 }}>
            {sorted.map((f, i) => (
              <View key={f.name} style={[styles.row, { backgroundColor: f.isYou ? colors.accentLight : colors.card, borderColor: f.isYou ? colors.accent : colors.border }]}>
                <Text style={[styles.rank, { color: i < 3 ? colors.accent : colors.textTer }]}>{i + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: f.isYou ? colors.accent : colors.border }]}>
                  <Text style={[styles.avatarText, { color: f.isYou ? '#fff' : colors.textSec }]}>{f.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { fontFamily: f.isYou ? fonts.semibold : fonts.regular }]}>
                    {f.name}
                    {f.isYou ? '  (you)' : ''}
                  </Text>
                  <Text style={styles.streak}>{f.streak} day streak</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.articles, { color: f.isYou ? colors.accent : colors.text }]}>{f.articles}</Text>
                  <Text style={styles.articlesLabel}>articles</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.h3}>Your badges</Text>
          <View style={styles.badges}>
            {BADGES.map((b) => (
              <View key={b.label} style={styles.badge}>
                <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.badgeLabel}>{b.label}</Text>
                  <Text style={styles.badgeNote}>{b.note}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.h3}>Friend&apos;s trail</Text>
          <View style={styles.friendCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.friendName}>Amara K.</Text>
              <Text style={styles.friendMeta}>19 articles · Technology &amp; Science</Text>
            </View>
            <Button variant="ghost" size="sm" label="Compare trails" />
          </View>
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
  friendCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 16 },
  friendName: { fontSize: 13, fontFamily: fonts.medium, color: colors.text },
  friendMeta: { fontSize: 12, color: colors.textSec, fontFamily: fonts.regular },
});
