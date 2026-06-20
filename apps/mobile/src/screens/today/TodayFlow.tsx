import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Article } from './Article';
import { Quiz } from './Quiz';
import { Branch } from './Branch';

type Step = 'article' | 'quiz' | 'branch';
const STEPS: Step[] = ['article', 'quiz', 'branch'];
const LABELS = ['Read', 'Quiz', 'Choose'];

// A2: the daily Today loop — Read (timer-gated) → Quiz → Choose.
export function TodayFlow() {
  const [step, setStep] = useState<Step>('article');
  const cur = STEPS.indexOf(step);

  return (
    <View style={{ flex: 1 }}>
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
      {step === 'branch' && <Branch onDone={() => setStep('article')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.bg },
  seg: { height: 3, borderRadius: 2 },
  label: { fontSize: 10, textAlign: 'center', marginTop: 3 },
});
