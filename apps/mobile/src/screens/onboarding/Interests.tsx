import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, TOPICS } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Button } from '@/components/Button';
import { ArrowRight } from '@/components/icons';

export function Interests({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev,
    );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrap}>
          <View style={styles.head}>
            <Text style={styles.step}>Step 2 of 3</Text>
            <Text style={styles.title}>What do you want to learn?</Text>
            <Text style={styles.sub}>Pick 3–5 topics. We&apos;ll start with one and let you branch from there.</Text>
          </View>

          <View style={styles.grid}>
            {TOPICS.map((t) => {
              const sel = selected.includes(t.id);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => toggle(t.id)}
                  style={[styles.topic, { borderColor: sel ? colors.accent : colors.border, backgroundColor: sel ? colors.accentLight : colors.card }]}
                >
                  <Text style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</Text>
                  <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: sel ? colors.accent : colors.text, textAlign: 'center' }}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.counter}>{selected.length}/5 selected</Text>
            <Button label="Continue" onPress={onNext} disabled={selected.length < 3}>
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
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  wrap: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  head: { alignItems: 'center', marginBottom: 32 },
  step: { fontSize: 13, color: colors.accent, fontFamily: fonts.medium, marginBottom: 8 },
  title: { fontSize: 26, fontFamily: fonts.semibold, letterSpacing: -0.8, marginBottom: 10, color: colors.text, textAlign: 'center' },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  topic: { flexBasis: '30%', flexGrow: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: radius.card, borderWidth: 1.5, alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
});
