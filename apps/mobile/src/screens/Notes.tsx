import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { HIGHLIGHTS } from '@/data/sample';
import { useAppStore } from '@/store/useAppStore';
import type { SavedHighlight } from '@/store/useAppStore';
import { isSupabaseConfigured } from '@/data/supabase';
import { listHighlightsRemote } from '@/data/highlights';

export function Notes() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const userHls = useAppStore((s) => s.highlights);
  const [remote, setRemote] = useState<SavedHighlight[]>([]);
  useEffect(() => {
    if (isSupabaseConfigured) listHighlightsRemote().then(setRemote).catch(() => {});
  }, []);
  const seen = new Set<string>();
  // Sample highlights are demo-only: never mix them into a cloud-backed user's real list.
  const all = [...userHls, ...remote, ...(isSupabaseConfigured ? [] : HIGHLIGHTS)].filter((h) => {
    if (seen.has(h.quote)) return false;
    seen.add(h.quote);
    return true;
  });
  const filters = ['All', ...Array.from(new Set(all.map((h) => h.topic).filter(Boolean)))];
  const q = search.toLowerCase();
  const filtered = all.filter(
    (h) =>
      (filter === 'All' || h.topic === filter) &&
      (h.quote.toLowerCase().includes(q) || h.article.toLowerCase().includes(q)),
  );

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <Text style={styles.title}>Notes &amp; Highlights</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search highlights…"
            placeholderTextColor={colors.textTer}
            style={styles.search}
          />

          <View style={styles.filters}>
            {filters.map((t) => {
              const on = filter === t;
              return (
                <Pressable key={t} onPress={() => setFilter(t)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={`Filter: ${t}`} style={[styles.filter, { borderColor: on ? colors.accent : colors.border, backgroundColor: on ? colors.accentLight : colors.card }]}>
                  <Text style={{ fontSize: 13, color: on ? colors.accent : colors.textSec, fontFamily: on ? fonts.medium : fonts.regular }}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: 12 }}>
            {filtered.map((h) => (
              <View key={h.id} style={styles.card}>
                <Text style={styles.quote}>&ldquo;{h.quote}&rdquo;</Text>
                <View style={styles.metaRow}>
                  <Pill label={h.topic} />
                  <Text style={styles.article}>{h.article}</Text>
                  <Text style={styles.date}>{h.date}</Text>
                </View>
              </View>
            ))}
            {filtered.length === 0 && <Text style={styles.empty}>No highlights match your search.</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontSize: 22, fontFamily: fonts.semibold, letterSpacing: -0.6, marginBottom: 20, color: colors.text },
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 14, fontSize: 14, fontFamily: fonts.regular, color: colors.text, backgroundColor: colors.card, marginBottom: 12 },
  filters: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  filter: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 18, paddingHorizontal: 20 },
  quote: { borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 14, fontSize: 16, lineHeight: 27, color: colors.text, fontStyle: 'italic', fontFamily: fonts.regular, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  article: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular },
  date: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular, marginLeft: 'auto' },
  empty: { color: colors.textTer, fontSize: 15, textAlign: 'center', paddingVertical: 40, fontFamily: fonts.regular },
});
