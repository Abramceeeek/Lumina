import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { MemoryCheck } from '@/components/MemoryCheckModal';
import { useAppStore } from '@/store/useAppStore';
import { Article } from './Article';
import { Quiz } from './Quiz';
import { Branch } from './Branch';

type Step = 'article' | 'quiz' | 'branch';
const STEPS: Step[] = ['article', 'quiz', 'branch'];
const LABELS = ['Read', 'Quiz', 'Choose'];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// A2 + daily loop: Read (timer-gated) → Quiz → Choose. Once finished, the day is
// marked done (come back tomorrow); the chosen branch seeds tomorrow's article.
export function TodayFlow() {
  const completedDate = useAppStore((s) => s.completedDate);
  const nextTopic = useAppStore((s) => s.nextTopic);
  const [step, setStep] = useState<Step>('article');
  const [reading, setReading] = useState(false);
  const cur = STEPS.indexOf(step);

  if (completedDate === todayKey() && !reading) {
    return (
      <View style={{ flex: 1 }}>
        <Header />
        <MemoryCheck />
        <View style={styles.done}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>You&apos;ve read today&apos;s article</Text>
          <Text style={styles.doneSub}>{nextTopic ? `Tomorrow's thread: ${nextTopic}` : 'Come back tomorrow for the next thread.'}</Text>
          <Button variant="ghost" size="sm" label="Read again" onPress={() => { setReading(true); setStep('article'); }} style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MemoryCheck />
      <View style={styles.bar}>
        {STEPS.map((s, i) => {
          const done = i < cur;
          const active = i === cur;
          return (
            <View key={s} style={{ flex: 1 }}>
              <View style={[styles.seg, { backgroundColor: done || active ? colors.accent : colors.border, opacity: active ? 1 : done ? 0.6 : 1 }]} />
              <Text style={[styles.label, { color: active ? colors.accent : colors.textTer, fontFamily: active ? fonts.semibold : fonts.regular }]}>{LABELS[i]}</Text>
            </View>
          );
        })}
      </View>

      {step === 'article' && <Article onFinish={() => setStep('quiz')} />}
      {step === 'quiz' && <Quiz onFinish={() => setStep('branch')} />}
      {step === 'branch' && <Branch onDone={() => { setReading(false); setStep('article'); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.bg },
  seg: { height: 3, borderRadius: 2 },
  label: { fontSize: 10, textAlign: 'center', marginTop: 3 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  doneEmoji: { fontSize: 40, marginBottom: 8 },
  doneTitle: { fontSize: 22, fontFamily: fonts.semibold, color: colors.text, letterSpacing: -0.6 },
  doneSub: { fontSize: 15, fontFamily: fonts.regular, color: colors.textSec, textAlign: 'center' },
});
