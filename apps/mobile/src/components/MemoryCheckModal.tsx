import { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Button } from '@/components/Button';
import { mcCount, mcScore, allMcAnswered } from '@/lib/quiz';
import { recordRecall, type DueRecall } from '@/data/spacedrep';
import { useMemoryCheck } from '@/hooks/useMemoryCheck';
import { useAppStore } from '@/store/useAppStore';

// Mounted in the Today tab: when a recall is due, invite with a dismissible card
// (the modal used to ambush at app open, before the user saw anything else).
export function MemoryCheck() {
  const { due, dismiss } = useMemoryCheck();
  const [open, setOpen] = useState(false);
  const introSeen = useAppStore((s) => s.memoryIntroSeen);
  const setMemoryIntroSeen = useAppStore((s) => s.setMemoryIntroSeen);
  if (!due) return null;
  if (!open) {
    return (
      <View style={styles.invite}>
        <View style={styles.inviteHead}>
          <View style={styles.clock}>
            <Text style={{ fontSize: 16 }}>⏱️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Memory Check ready</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              You read “{due.title}” a while ago
            </Text>
          </View>
        </View>
        {!introSeen ? (
          <Text style={styles.intro}>We resurface past articles after a few days — recalling them is what makes reading stick.</Text>
        ) : null}
        <View style={styles.inviteActions}>
          <Button
            size="sm"
            label="Start"
            onPress={() => {
              setOpen(true);
              setMemoryIntroSeen(true);
            }}
          />
          <Button variant="ghost" size="sm" label="Later" onPress={dismiss} />
        </View>
      </View>
    );
  }
  return (
    <MemoryCheckModal
      recall={due}
      onClose={() => {
        setOpen(false);
        dismiss();
      }}
    />
  );
}

function MemoryCheckModal({ recall, onClose }: { recall: DueRecall; onClose: () => void }) {
  const mc = recall.quiz.filter((q) => q.type === 'mc');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = mcCount(mc);
  const correct = mcScore(mc, answers);
  const answered = allMcAnswered(mc, answers);
  const passed = total > 0 && correct === total;

  const submit = () => {
    setSubmitted(true);
    void recordRecall({ id: recall.id, passed, focus: recall.focus, fieldId: recall.fieldId });
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.clock}>
              <Text style={{ fontSize: 16 }}>⏱️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Memory Check</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                You read “{recall.title}” a while ago
              </Text>
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={8}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          {submitted ? (
            <View style={styles.doneWrap}>
              <Text style={styles.doneEmoji}>🎯</Text>
              <Text style={styles.doneTitle}>{passed ? 'Perfect recall!' : 'Good effort!'}</Text>
              <Text style={styles.doneSub}>Your retention score has been updated.</Text>
              <Button label="Done" onPress={onClose} style={{ marginTop: 16 }} />
            </View>
          ) : (
            <>
              <Text style={styles.prompt}>How much stuck?</Text>
              <View style={{ gap: 18 }}>
                {mc.map((q, qi) =>
                  q.type === 'mc' ? (
                    <View key={qi}>
                      <Text style={styles.q}>{q.q}</Text>
                      <View style={{ gap: 8, marginTop: 10 }}>
                        {q.opts.map((opt, oi) => {
                          const picked = answers[qi] === oi;
                          return (
                            <Pressable
                              key={oi}
                              onPress={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: picked }}
                              style={[styles.opt, { borderColor: picked ? colors.accent : colors.border, backgroundColor: picked ? colors.accentLight : semantic.surfaceSubtle }]}
                            >
                              <Text style={{ fontSize: 14, color: colors.text, fontFamily: picked ? fonts.medium : fonts.regular }}>{opt}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ) : null,
                )}
              </View>
              <View style={styles.footer}>
                <Button variant="ghost" size="sm" label="Skip for now" onPress={onClose} />
                <Button size="sm" label="Submit" onPress={submit} disabled={!answered} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  invite: { marginHorizontal: 20, marginTop: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 14, gap: 10 },
  inviteHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  intro: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular, lineHeight: 18 },
  inviteActions: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 480, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  clock: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontFamily: fonts.semibold, color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular },
  close: { fontSize: 24, color: colors.textTer, paddingHorizontal: 4 },
  prompt: { fontSize: 14, color: colors.textSec, fontFamily: fonts.regular, marginBottom: 16 },
  q: { fontSize: 15, fontFamily: fonts.medium, color: colors.text, lineHeight: 22 },
  opt: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 1.5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  doneWrap: { alignItems: 'center', paddingVertical: 16 },
  doneEmoji: { fontSize: 36, marginBottom: 8 },
  doneTitle: { fontSize: 18, fontFamily: fonts.semibold, color: colors.text, marginBottom: 4 },
  doneSub: { fontSize: 14, color: colors.textSec, fontFamily: fonts.regular, textAlign: 'center' },
});
