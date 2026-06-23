import { ReactNode, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors, radius, semantic, FIELD_LEVELS } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { getApiKey, setApiKey, clearApiKey } from '@/ai/keyStore';
import { signOut } from '@/data/auth';
import { isSupabaseConfigured } from '@/data/supabase';
import { getLadders } from '@/data/ladder';
import { getRetention } from '@/data/profile';
import { saveSettings } from '@/data/settings';
import { useAppStore } from '@/store/useAppStore';

const STATS = [
  { label: 'Total articles', value: '12' },
  { label: 'Longest streak', value: '12 days' },
  { label: 'Topics explored', value: '3' },
  { label: 'Highlights saved', value: '4' },
];

export function Profile() {
  const fontSize = useAppStore((s) => s.fontSize);
  const readWidth = useAppStore((s) => s.readWidth);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const setReadWidth = useAppStore((s) => s.setReadWidth);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [ladders, setLadders] = useState<{ cefr: string; fields: { label: string; level: number }[] } | null>(null);
  const [retention, setRetention] = useState(0);
  useEffect(() => {
    getApiKey().then(setSavedKey);
    getLadders().then(setLadders);
    getRetention().then(setRetention);
  }, []);
  const saveKey = async () => {
    const v = apiKeyInput.trim();
    if (!v) return;
    await setApiKey(v);
    setSavedKey(v);
    setApiKeyInput('');
  };
  const removeKey = async () => {
    await clearApiKey();
    setSavedKey(null);
  };
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (retention / 100) * circ;
  const size = 2 * (r + 10);

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrap}>
          <View style={styles.idRow}>
            <View style={styles.bigAvatar}>
              <Text style={styles.bigAvatarText}>J</Text>
            </View>
            <View>
              <Text style={styles.name}>Jordan Lee</Text>
              <Text style={styles.member}>Member since April 2026</Text>
            </View>
          </View>

          <View style={styles.ringCard}>
            <Svg width={size} height={size} accessible accessibilityLabel={`Retention score: ${retention} out of 100`}>
              <Circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={colors.border} strokeWidth={8} />
              <Circle
                cx={r + 10}
                cy={r + 10}
                r={r}
                fill="none"
                stroke={colors.accent}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`}
                transform={`rotate(-90 ${r + 10} ${r + 10})`}
              />
              <SvgText x={r + 10} y={r + 10 + 6} textAnchor="middle" fontSize={18} fontWeight="700" fill={colors.text}>
                {String(retention)}
              </SvgText>
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={styles.ringTitle}>Retention Score</Text>
              <Text style={styles.ringDesc}>Based on quiz performance and spaced repetition recall over the last 30 days.</Text>
            </View>
          </View>

          <View style={styles.stats}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {ladders ? (
            <>
              <Text style={styles.h3}>Your levels</Text>
              <View style={[styles.settings, { marginBottom: 24 }]}>
                <SettingRow label="English · language" last={ladders.fields.length === 0}>
                  <Text style={styles.valAccent}>{ladders.cefr}</Text>
                </SettingRow>
                {ladders.fields.map((f, i) => (
                  <SettingRow key={f.label} label={f.label} last={i === ladders.fields.length - 1}>
                    <Text style={styles.val}>
                      {FIELD_LEVELS[f.level - 1]} · {f.level}/5
                    </Text>
                  </SettingRow>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.h3}>Settings</Text>
          <View style={styles.settings}>
            <SettingRow label="Language">
              <Text style={styles.val}>English</Text>
            </SettingRow>
            <SettingRow label="Text size">
              <Segmented
                options={[{ label: 'S', value: 16 }, { label: 'M', value: 18 }, { label: 'L', value: 20 }]}
                value={fontSize}
                onChange={(v) => {
                  setFontSize(v);
                  void saveSettings({ fontSize: v });
                }}
              />
            </SettingRow>
            <SettingRow label="Reading width" last>
              <Segmented
                options={[{ label: 'Narrow', value: 580 }, { label: 'Medium', value: 680 }, { label: 'Wide', value: 780 }]}
                value={readWidth}
                onChange={(v) => {
                  setReadWidth(v);
                  void saveSettings({ readWidth: v });
                }}
              />
            </SettingRow>
          </View>

          <Text style={[styles.h3, { marginTop: 24 }]}>AI personalization</Text>
          <View style={styles.aiCard}>
            <Text style={styles.aiStatus}>
              {savedKey ? '✓ Connected — articles personalize with Claude.' : 'Using the offline demo. Add a Claude API key to personalize for real.'}
            </Text>
            {savedKey ? (
              <Button variant="ghost" size="sm" label="Remove key" onPress={removeKey} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            ) : (
              <View style={{ marginTop: 12, gap: 8 }}>
                <Input placeholder="sk-ant-…" value={apiKeyInput} onChangeText={setApiKeyInput} secureTextEntry autoCapitalize="none" accessibilityLabel="Anthropic API key" />
                <Button size="sm" label="Save key" onPress={saveKey} disabled={!apiKeyInput.trim()} style={{ alignSelf: 'flex-start' }} />
              </View>
            )}
          </View>

          {isSupabaseConfigured ? (
            <Button variant="ghost" size="sm" label="Sign out" onPress={signOut} style={{ marginTop: 24, alignSelf: 'flex-start' }} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.row, last ? null : styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Segmented({ options, value, onChange }: { options: { label: string; value: number }[]; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.label}
            style={[styles.segItem, active ? styles.segItemActive : null]}
          >
            <Text style={[styles.segText, active ? styles.segTextActive : null]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 80 },
  wrap: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  bigAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  bigAvatarText: { fontSize: 22, color: '#fff', fontFamily: fonts.semibold },
  name: { fontSize: 18, fontFamily: fonts.semibold, color: colors.text },
  member: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular },
  ringCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  ringTitle: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text, marginBottom: 4 },
  ringDesc: { fontSize: 13, color: colors.textSec, lineHeight: 20, fontFamily: fonts.regular },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  stat: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 16 },
  statValue: { fontSize: 20, fontFamily: fonts.semibold, letterSpacing: -0.4, marginBottom: 2, color: colors.text },
  statLabel: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular },
  h3: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, marginBottom: 12 },
  aiCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 16 },
  aiStatus: { fontSize: 13, color: colors.textSec, lineHeight: 20, fontFamily: fonts.regular },
  settings: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.text, fontFamily: fonts.regular },
  val: { fontSize: 14, color: colors.textSec, fontFamily: fonts.regular },
  valAccent: { fontSize: 14, color: colors.accent, fontFamily: fonts.medium },
  seg: { flexDirection: 'row', gap: 4, backgroundColor: semantic.surfaceSubtle, borderRadius: radius.sm, padding: 3 },
  segItem: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.sm - 2 },
  segItemActive: { backgroundColor: colors.accent },
  segText: { fontSize: 13, color: colors.textSec, fontFamily: fonts.medium },
  segTextActive: { color: '#fff' },
});
