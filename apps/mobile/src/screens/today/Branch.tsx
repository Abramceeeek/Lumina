import { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ChevronRight, Check } from '@/components/icons';
import { SAMPLE_BRANCHES } from '@/data/sample';

export function Branch({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const canConfirm = !!selected || customText.trim().length > 0;

  const confirm = () => {
    setConfirmed(true);
    setTimeout(onDone, 900);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header right={<View style={styles.diffBadge}><Text style={styles.diffText}>Medium</Text></View>} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <View style={styles.crumb}>
            <Text style={styles.crumbTer}>Finance</Text>
            <ChevronRight />
            <Text style={styles.crumbSec}>Compound Interest</Text>
          </View>

          <Text style={styles.title}>Where do you want to go next?</Text>
          <Text style={styles.sub}>Each path builds on what you just read. Your next article arrives tomorrow.</Text>

          <View style={styles.grid}>
            {SAMPLE_BRANCHES.map((b) => {
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
  scroll: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 800, alignSelf: 'center' },
  diffBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  diffText: { fontSize: 12, fontFamily: fonts.medium, color: colors.accent },
  crumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  crumbTer: { fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
  crumbSec: { fontSize: 13, color: colors.textSec, fontFamily: fonts.medium },
  title: { fontSize: 26, fontFamily: fonts.semibold, letterSpacing: -0.8, marginBottom: 8, color: colors.text },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, marginBottom: 24 },
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
