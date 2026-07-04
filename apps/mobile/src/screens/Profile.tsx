import { ReactNode, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors, radius, semantic, FIELD_LEVELS } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { getAiConfig, setAiConfig, clearAiConfig } from '@/ai/keyStore';
import { testProviderKey } from '@/ai/llm';
import { PROVIDERS, providerInfo, type ProviderId, type AiConfig } from '@/ai/catalog';
import { signOut, deleteAccount } from '@/data/auth';
import { isSupabaseConfigured, supabase } from '@/data/supabase';
import { getLadders } from '@/data/ladder';
import { getRetention } from '@/data/profile';
import { getTrailStats, type TrailStats } from '@/data/trail';
import { listHighlightsRemote } from '@/data/highlights';
import { saveSettings } from '@/data/settings';
import { useAppStore } from '@/store/useAppStore';

// Test-key failures arrive as raw provider errors ("Anthropic API 401") — translate
// the common statuses into a next step the user can actually take.
function friendlyKeyError(raw: string): string {
  const status = raw.match(/\b(401|403|429|5\d\d)\b/)?.[1];
  if (status === '401') return 'Key not accepted (401). Check it was copied fully, then try again.';
  if (status === '403') return 'Key lacks access (403) — often no billing or credit on the provider account.';
  if (status === '429') return 'Rate limited (429). Wait a minute and try again.';
  if (status) return `Provider error (${status}) — the service may be down. Try again shortly.`;
  return raw || 'Key check failed.';
}

export function Profile() {
  const fontSize = useAppStore((s) => s.fontSize);
  const readWidth = useAppStore((s) => s.readWidth);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const setReadWidth = useAppStore((s) => s.setReadWidth);
  const [savedConfig, setSavedConfig] = useState<AiConfig | null>(null);
  const [provider, setProvider] = useState<ProviderId>('anthropic');
  const [keyInput, setKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [deleteArm, setDeleteArm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');

  const doDeleteAccount = async () => {
    setDeleting(true);
    setDeleteErr('');
    try {
      await deleteAccount(); // the auth listener returns the app to the Auth screen
    } catch {
      setDeleteErr("Couldn't delete the account — check your connection and try again.");
      setDeleting(false);
    }
  };
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [ladders, setLadders] = useState<{ cefr: string; fields: { label: string; level: number }[] } | null>(null);
  const [retention, setRetention] = useState(0);
  const [stats, setStats] = useState<TrailStats>({ articlesRead: 0, dayStreak: 0, topicsExplored: 0 });
  const [remoteQuotes, setRemoteQuotes] = useState<string[]>([]);
  const [identity, setIdentity] = useState<{ name: string; since: string | null }>({ name: 'You', since: null });
  const [laddersError, setLaddersError] = useState(false);
  const [retentionError, setRetentionError] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [highlightsError, setHighlightsError] = useState(false);
  const [identityError, setIdentityError] = useState(false);
  const highlights = useAppStore((s) => s.highlights);
  useEffect(() => {
    getAiConfig().then((c) => {
      setSavedConfig(c);
      if (c) setProvider(c.provider);
    });
    getLadders()
      .then(setLadders)
      .catch(() => setLaddersError(true));
    getRetention()
      .then(setRetention)
      .catch(() => setRetentionError(true));
    getTrailStats()
      .then(setStats)
      .catch(() => setStatsError(true));
    listHighlightsRemote()
      .then((l) => setRemoteQuotes(l.map((h) => h.quote)))
      .catch(() => setHighlightsError(true));
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        const u = data.user;
        if (!u) return;
        const name = (u.user_metadata?.display_name as string | undefined) ?? u.email ?? 'You';
        const since = u.created_at
          ? new Date(u.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : null;
        setIdentity({ name, since });
      }).catch(() => setIdentityError(true));
    }
  }, []);
  const highlightCount = new Set([...highlights.map((h) => h.quote), ...remoteQuotes]).size;
  const statCards = [
    { label: 'Articles read', value: String(stats.articlesRead) },
    { label: 'Day streak', value: stats.dayStreak === 1 ? '1 day' : `${stats.dayStreak} days` },
    { label: 'Topics explored', value: String(stats.topicsExplored) },
    { label: 'Highlights saved', value: String(highlightCount) },
  ];
  const draftConfig = (): AiConfig => ({ provider, key: keyInput.trim(), ...(modelInput.trim() ? { model: modelInput.trim() } : {}) });

  const testKey = async () => {
    const key = keyInput.trim();
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      await testProviderKey(draftConfig());
      setTestResult({ ok: true, msg: '✓ Key works — you can save it.' });
    } catch (e) {
      setTestResult({ ok: false, msg: `✗ ${friendlyKeyError(e instanceof Error ? e.message : '')}` });
    } finally {
      setTesting(false);
    }
  };

  const saveKey = async () => {
    const key = keyInput.trim();
    if (!key) return;
    const cfg = draftConfig();
    await setAiConfig(cfg);
    setSavedConfig(cfg);
    setKeyInput('');
    setModelInput('');
    setTestResult(null);
  };
  const removeKey = async () => {
    await clearAiConfig();
    setSavedConfig(null);
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
              <Text style={styles.bigAvatarText}>{identity.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.name}>{identity.name}</Text>
              {identity.since ? <Text style={styles.member}>Member since {identity.since}</Text> : null}
            </View>
          </View>

          <View style={styles.ringCard}>
            <Svg width={size} height={size} accessible accessibilityLabel={`Retention score: ${retention.toString()} out of 100`}>
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
              <Text style={styles.ringDesc}>
                Your Memory Check average, 0–100 — how well you remember past articles when they resurface. 50+ is solid; 70+ is
                excellent. Passing Memory Checks raises it.
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            {statCards.map((s) => (
              <View key={s.label} accessible accessibilityLabel={`${s.label}: ${s.value}`} style={styles.stat}>
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
            <SettingRow label="Sync">
              <Text style={styles.val}>{isSupabaseConfigured ? 'Cloud-backed' : 'This device only'}</Text>
            </SettingRow>
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

          <Text style={[styles.h3, { marginTop: 24 }]}>AI provider</Text>
          <View style={styles.aiCard}>
            {savedConfig ? (
              <>
                <Text style={styles.aiStatus}>✓ Connected via {providerInfo(savedConfig.provider).label}. Articles personalize for real.</Text>
                <Button variant="ghost" size="sm" label="Change / remove" onPress={removeKey} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
              </>
            ) : (
              <>
                <Text style={styles.aiStatus}>Pick a provider and paste a key. Claude (★) is recommended; Groq, Gemini and OpenRouter have free tiers — no cost to test.</Text>
                <View style={styles.provRow}>
                  {PROVIDERS.map((p) => {
                    const active = provider === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setProvider(p.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        accessibilityLabel={p.label}
                        style={[styles.provChip, active ? styles.provChipActive : null]}
                      >
                        <Text style={[styles.provChipText, active ? styles.provChipTextActive : null]}>
                          {p.label}
                          {p.recommended ? ' ★' : p.free ? ' · free' : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.aiHelp}>Get a key at {providerInfo(provider).keyUrl}</Text>
                <View style={{ marginTop: 10, gap: 8 }}>
                  <Input placeholder={providerInfo(provider).hint} value={keyInput} onChangeText={setKeyInput} secureTextEntry autoCapitalize="none" accessibilityLabel={`${providerInfo(provider).label} API key`} />
                  <Input placeholder={`Model (optional) — ${providerInfo(provider).defaultModel}`} value={modelInput} onChangeText={setModelInput} autoCapitalize="none" accessibilityLabel="Model override" />
                  <View style={styles.keyActions}>
                    <Button size="sm" label="Save" onPress={saveKey} disabled={!keyInput.trim()} />
                    <Button variant="ghost" size="sm" label={testing ? 'Testing…' : 'Test key'} onPress={testKey} disabled={!keyInput.trim() || testing} />
                  </View>
                  {testResult ? (
                    <Text style={[styles.testResult, { color: testResult.ok ? colors.accent : semantic.danger }]}>{testResult.msg}</Text>
                  ) : null}
                </View>
              </>
            )}
          </View>

          {isSupabaseConfigured ? (
            <>
              <Button variant="ghost" size="sm" label="Sign out" onPress={signOut} style={{ marginTop: 24, alignSelf: 'flex-start' }} />
              <View style={styles.dangerZone}>
                {deleteArm ? (
                  <>
                    <Text style={styles.dangerText}>
                      This permanently deletes your account and everything in it — articles, highlights, trail, levels and settings.
                      It cannot be undone.
                    </Text>
                    <View style={styles.dangerActions}>
                      <Button
                        variant="danger"
                        size="sm"
                        label={deleting ? 'Deleting…' : 'Delete permanently'}
                        onPress={doDeleteAccount}
                        disabled={deleting}
                      />
                      <Button variant="ghost" size="sm" label="Cancel" onPress={() => setDeleteArm(false)} disabled={deleting} />
                    </View>
                    {deleteErr ? <Text style={styles.deleteErr}>{deleteErr}</Text> : null}
                  </>
                ) : (
                  <Button variant="ghost" size="sm" label="Delete account" onPress={() => setDeleteArm(true)} style={{ alignSelf: 'flex-start' }} />
                )}
              </View>
            </>
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
  provRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  provChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: semantic.surfaceSubtle },
  provChipActive: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  provChipText: { fontSize: 12, color: colors.textSec, fontFamily: fonts.medium },
  provChipTextActive: { color: colors.accent },
  aiHelp: { fontSize: 12, color: colors.textTer, fontFamily: fonts.regular, marginTop: 10 },
  keyActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  testResult: { fontSize: 13, fontFamily: fonts.medium, lineHeight: 18 },
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
  dangerZone: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  dangerText: { fontSize: 13, color: colors.textSec, lineHeight: 19, fontFamily: fonts.regular },
  dangerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteErr: { fontSize: 13, color: semantic.danger, fontFamily: fonts.regular },
});
