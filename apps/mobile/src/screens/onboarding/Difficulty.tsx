import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, semantic } from '@/design/tokens';
import type { Difficulty as Diff } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArrowRight } from '@/components/icons';

const LEVELS = [
  { id: 'simple', label: 'Simple', desc: 'Plain language, analogies, ~500 words', note: "I'm new to this.", lines: 4 },
  { id: 'medium', label: 'Medium', desc: 'Balanced depth, ~700 words', note: 'I know the basics.', lines: 7 },
  { id: 'hard', label: 'Hard', desc: 'Technical vocabulary, ~1000 words', note: "Don't hold back.", lines: 11 },
];

export function Difficulty({ onNext }: { onNext: (difficulty: Diff) => void }) {
  const [picked, setPicked] = useState('medium');
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrap}>
          <View style={styles.head}>
            <Text style={styles.step}>Step 3 of 3</Text>
            <Text style={styles.title}>How do you like to learn?</Text>
            <Text style={styles.sub}>You can change this at any time.</Text>
          </View>

          <View style={styles.row}>
            {LEVELS.map((lv) => {
              const sel = picked === lv.id;
              return (
                <Card key={lv.id} selected={sel} onPress={() => setPicked(lv.id)} accessibilityRole="radio" accessibilityLabel={lv.label} accessibilityHint={`${lv.desc}. ${lv.note}`} style={styles.card}>
                  <View style={[styles.density, { backgroundColor: sel ? semantic.accentWash : semantic.densityBg }]}>
                    {Array.from({ length: lv.lines }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          height: 4,
                          borderRadius: 2,
                          marginBottom: i < lv.lines - 1 ? 5 : 0,
                          backgroundColor: sel ? colors.accent : semantic.trackMuted,
                          width: i % 3 === 0 ? '60%' : i % 3 === 1 ? '100%' : '80%',
                          opacity: 0.6 + (i / lv.lines) * 0.4,
                        }}
                      />
                    ))}
                  </View>
                  <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: sel ? colors.accent : colors.text, marginBottom: 6 }}>{lv.label}</Text>
                  <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: colors.textSec, lineHeight: 19, marginBottom: 8, textAlign: 'center' }}>{lv.desc}</Text>
                  <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: colors.textTer, fontStyle: 'italic', textAlign: 'center' }}>{lv.note}</Text>
                </Card>
              );
            })}
          </View>

          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Button label="Begin your journey" onPress={() => onNext((LEVELS.find((l) => l.id === picked)?.label ?? 'Medium') as Diff)}>
              <ArrowRight />
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  wrap: { width: '100%', maxWidth: 580, alignSelf: 'center' },
  head: { alignItems: 'center', marginBottom: 36 },
  step: { fontSize: 13, color: colors.accent, fontFamily: fonts.medium, marginBottom: 8 },
  title: { fontSize: 26, fontFamily: fonts.semibold, letterSpacing: -0.8, marginBottom: 10, color: colors.text, textAlign: 'center' },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  card: { flexBasis: '31%', flexGrow: 1, alignItems: 'center' },
  density: { width: '100%', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, marginBottom: 14 },
});
