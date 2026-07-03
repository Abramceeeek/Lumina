import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { ChevronRight, Check } from '@/components/icons';
import { SAMPLE_BRANCHES } from '@/data/sample';
import { useAppStore } from '@/store/useAppStore';
import { appendTrailNode } from '@/data/trail';

export function Branch({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const canConfirm = !!selected || customText.trim().length > 0;
  const setNextTopic = useAppStore((s) => s.setNextTopic);
  const setCompletedDate = useAppStore((s) => s.setCompletedDate);
  const articleId = useAppStore((s) => s.dailyArticle?.articleId);
  const focus = useAppStore((s) => s.dailyArticle?.focus);
  const topic = useAppStore((s) => s.dailyArticle?.topic);
  const articleTitle = useAppStore((s) => s.dailyArticle?.title);
  const articleBranches = useAppStore((s) => s.dailyArticle?.branches);
  const branches = articleBranches?.length
    ? articleBranches.map((b, i) => ({ id: `g${i}`, title: b.title, desc: b.description }))
    : SAMPLE_BRANCHES;

  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (doneTimer.current) clearTimeout(doneTimer.current); }, []);

  const confirm = () => {
    const chosen = branches.find((b) => b.id === selected);
    setNextTopic(customText.trim() || chosen?.title || 'your next topic');
    setCompletedDate(new Date().toISOString().slice(0, 10));
    void appendTrailNode(articleId);
    setConfirmed(true);
    doneTimer.current = setTimeout(onDone, 900);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header right={<DifficultyBadge />} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <View style={styles.crumb}>
            <Text style={styles.crumbTer}>{topic ?? 'Today'}</Text>
            <ChevronRight />
            <Text style={styles.crumbSec} numberOfLines={1}>
              {articleTitle ?? "Today's article"}
            </Text>
          </View>

          <Text style={styles.title}>Where do you want to go next?</Text>
          <Text style={styles.sub}>Each path builds on what you just read. Your next article arrives tomorrow.</Text>
          {focus ? (
            <Text style={styles.focusNote}>
              {focus === 'language'
                ? 'Today pushed your language. Tomorrow goes deeper into the field.'
                : 'Today went deeper into the field. Tomorrow pushes your language.'}
            </Text>
          ) : null}

          <View style={styles.grid}>
            {branches.map((b) => {
              const sel = selected === b.id;
              return (
                <Card key={b.id} selected={sel} onPress={() => { setSelected(b.id); setCustomText(''); }} style={styles.branchCard}>
                  <View style={styles.branchHead}>
                    <Text style={[styles.branchTitle, { color: sel ? colors.accent : colors.text }]}>{b.title}</Text>
                    {sel && (
                      <View style={styles.checkCircle}>
                        <Check color="#fff" size={9} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.branchDesc}>{b.desc}</Text>
                </Card>
              );
            })}

            <Card selected={customText.trim().length > 0 && !selected} style={styles.branchCard}>
              <Text style={[styles.branchTitle, { marginBottom: 10 }]}>Something else…</Text>
              <TextInput
                value={customText}
                onChangeText={(t) => { setCustomText(t); setSelected(null); }}
                placeholder="Type a related thread you'd like to explore…"
                placeholderTextColor={colors.textTer}
                multiline
                style={styles.customInput}
              />
            </Card>
          </View>

          <View style={styles.footer}>
            {!canConfirm && <Text style={styles.hint}>Select a topic to continue</Text>}
            {confirmed ? (
              <Text style={styles.saved}>✓ Saved! See you tomorrow.</Text>
            ) : (
              <Button label="Choose & come back tomorrow" onPress={confirm} disabled={!canConfirm} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 800, alignSelf: 'center' },
  crumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  crumbTer: { fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
  crumbSec: { fontSize: 13, color: colors.textSec, fontFamily: fonts.medium },
  title: { fontSize: 26, fontFamily: fonts.semibold, letterSpacing: -0.8, marginBottom: 8, color: colors.text },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, marginBottom: 16 },
  focusNote: { fontSize: 13, color: colors.accent, fontFamily: fonts.medium, backgroundColor: colors.accentLight, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 12, lineHeight: 18, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  branchCard: { flexBasis: '47%', flexGrow: 1 },
  branchHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  branchTitle: { fontSize: 14, fontFamily: fonts.semibold, lineHeight: 18, flex: 1 },
  branchDesc: { fontSize: 13, color: colors.textSec, lineHeight: 20, fontFamily: fonts.regular },
  checkCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  customInput: { minHeight: 48, fontSize: 13, fontFamily: fonts.regular, color: colors.text, lineHeight: 20, textAlignVertical: 'top', padding: 0 },
  footer: { marginTop: 24, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 14 },
  hint: { fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
  saved: { color: colors.accent, fontSize: 14, fontFamily: fonts.medium },
});
