import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { colors, radius, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { Button } from '@/components/Button';
import { ArrowRight } from '@/components/icons';
import { SAMPLE_QUIZ } from '@/data/sample';
import { mcCount, mcScore, allMcAnswered } from '@/lib/quiz';
import { useAppStore } from '@/store/useAppStore';
import { saveQuizResponse } from '@/data/quizResponses';
import { advanceLadder, type LadderUp } from '@/data/ladder';
import { scheduleRecall } from '@/data/spacedrep';

export function Quiz({ onFinish }: { onFinish: () => void }) {
  const articleId = useAppStore((s) => s.dailyArticle?.articleId);
  const focus = useAppStore((s) => s.dailyArticle?.focus);
  const fieldId = useAppStore((s) => s.dailyArticle?.fieldId);
  const articleQuiz = useAppStore((s) => s.dailyArticle?.quiz);
  const quiz = articleQuiz?.length ? articleQuiz : SAMPLE_QUIZ;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [openText, setOpenText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [levelUp, setLevelUp] = useState<LadderUp | null>(null);
  const [reflected, setReflected] = useState(false);

  const total = mcCount(quiz);
  const correct = mcScore(quiz, answers);
  const answered = allMcAnswered(quiz, answers);

  const submit = async () => {
    setSubmitted(true);
    setReflected(openText.trim().length > 0);
    void saveQuizResponse(articleId, { answers, mcScore: correct, reflection: openText });
    // Schedule this article to resurface for spaced-repetition recall.
    void scheduleRecall(articleId);
    // A passing score (all MC correct) advances the ladder this article targeted;
    // show the level-up so the reward is visible.
    const up = focus ? await advanceLadder({ focus, fieldId, passed: total > 0 && correct === total }) : null;
    setLevelUp(up);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header right={<Pill label="Quick Check" />} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <View style={{ marginBottom: 32 }}>
            <Text style={styles.title}>Quick check — no pressure.</Text>
            <Text style={styles.sub}>Not graded. Completing this adds to your Retention Score.</Text>
          </View>

          <View style={{ gap: 28 }}>
            {quiz.map((q, qi) => (
              <View key={qi} style={styles.card}>
                <Text style={styles.q}>
                  <Text style={styles.qnum}>{qi + 1}. </Text>
                  {q.q}
                </Text>
                {q.type === 'mc' ? (
                  <>
                  <View style={{ gap: 8 }}>
                    {q.opts.map((opt, oi) => {
                      const picked = answers[qi] === oi;
                      const correct = submitted && oi === q.correct;
                      const wrong = submitted && picked && oi !== q.correct;
                      const borderColor = correct ? colors.accent : wrong ? semantic.danger : picked ? colors.accent : colors.border;
                      const backgroundColor = correct ? colors.accentLight : wrong ? semantic.dangerBg : picked ? colors.accentLight : semantic.surfaceSubtle;
                      const color = correct ? colors.accent : wrong ? semantic.danger : colors.text;
                      return (
                        <Pressable
                          key={oi}
                          onPress={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: picked }}
                          accessibilityLabel={opt}
                          style={[styles.opt, { borderColor, backgroundColor }]}
                        >
                          <Text style={{ fontSize: 14, color, fontFamily: picked || correct ? fonts.medium : fonts.regular }}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                    {submitted && q.explanation ? <Text style={styles.explain}>{q.explanation}</Text> : null}
                  </>
                ) : (
                  <TextInput
                    value={openText}
                    onChangeText={setOpenText}
                    placeholder={q.placeholder}
                    placeholderTextColor={colors.textTer}
                    accessibilityLabel={q.q}
                    multiline
                    style={styles.textarea}
                  />
                )}
              </View>
            ))}
          </View>

          {submitted ? (
            <>
              <View style={styles.resultBox}>
                <Text style={styles.result}>
                  ✓ {correct === total ? 'Perfect score!' : correct === 1 ? 'Good effort!' : 'Keep reading!'}
                </Text>
                {levelUp ? (
                  <Text style={styles.levelUp}>
                    {levelUp.kind === 'language'
                      ? `Language level ${levelUp.from} → ${levelUp.to} 🎉`
                      : `Field level ${levelUp.from} → ${levelUp.to} 🎉`}
                  </Text>
                ) : null}
                {reflected ? <Text style={styles.reflectAck}>Your reflection&apos;s saved — tomorrow&apos;s article can build on it.</Text> : null}
              </View>
              <View style={styles.footer}>
                <Button label="Continue" onPress={onFinish}>
                  <ArrowRight />
                </Button>
              </View>
            </>
          ) : (
            <View style={styles.footer}>
              <Button label="See what's next" onPress={submit} disabled={!answered}>
                <ArrowRight />
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  title: { fontSize: 22, fontFamily: fonts.semibold, letterSpacing: -0.6, marginBottom: 6, color: colors.text },
  sub: { color: colors.textSec, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 20, paddingHorizontal: 22 },
  q: { fontSize: 15, fontFamily: fonts.medium, color: colors.text, marginBottom: 14, lineHeight: 22 },
  qnum: { color: colors.textTer, fontSize: 13, fontFamily: fonts.regular },
  opt: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 1.5 },
  textarea: { minHeight: 72, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, fontSize: 14, fontFamily: fonts.regular, color: colors.text, backgroundColor: semantic.surfaceSubtle, textAlignVertical: 'top', lineHeight: 22 },
  resultBox: { marginTop: 28, alignItems: 'center', gap: 6 },
  result: { textAlign: 'center', color: colors.accent, fontSize: 15, fontFamily: fonts.medium },
  levelUp: { textAlign: 'center', color: colors.accent, fontSize: 16, fontFamily: fonts.semibold },
  reflectAck: { textAlign: 'center', color: colors.textSec, fontSize: 13, fontFamily: fonts.regular },
  explain: { marginTop: 10, color: colors.textSec, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
  footer: { marginTop: 28, flexDirection: 'row', justifyContent: 'flex-end' },
});
