import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ArrowRight } from '@/components/icons';
import { signUp, signIn, resetPassword } from '@/data/auth';

type Mode = 'register' | 'login' | 'reset';

export function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<Mode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailOk = email.trim().length > 3;
  const canSubmit = (mode === 'reset' ? emailOk : emailOk && password.length >= 6) && !loading;

  const cta = mode === 'register' ? 'Create account' : mode === 'login' ? 'Sign in' : 'Send reset link';

  const clearMessages = () => {
    setError(null);
    setInfo(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    clearMessages();
  };

  const submit = async () => {
    clearMessages();
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await signUp(email.trim(), password);
        if (res.session) {
          onAuthed();
        } else {
          setInfo('Account created. Check your email to confirm, then sign in.');
          setMode('login');
        }
      } else if (mode === 'login') {
        await signIn(email.trim(), password);
        onAuthed();
      } else {
        await resetPassword(email.trim());
        setInfo('If that email has an account, a reset link is on its way. Follow it, then sign in.');
        setMode('login');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <View style={styles.head}>
            <Logo size="lg" />
            <Text style={styles.tagline}>One article a day. One thread to follow.</Text>
          </View>

          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.label}>Email</Text>
              <Input placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Email" />
            </View>
            {mode !== 'reset' ? (
              <View>
                <Text style={styles.label}>Password</Text>
                <Input placeholder="6+ characters" value={password} onChangeText={setPassword} secureTextEntry accessibilityLabel="Password" />
                {mode === 'login' ? (
                  <Text
                    style={styles.forgot}
                    accessibilityRole="button"
                    onPress={() => switchMode('reset')}
                  >
                    Forgot password?
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.resetHint}>Enter your account email and we&apos;ll send a reset link.</Text>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}

            <Button
              label={loading ? 'Please wait…' : cta}
              onPress={canSubmit ? submit : undefined}
              disabled={!canSubmit}
              style={{ marginTop: 4, width: '100%' }}
            >
              {!loading ? <ArrowRight /> : null}
            </Button>
          </View>

          {mode === 'reset' ? (
            <Text style={styles.toggle}>
              <Text style={{ color: colors.accent }} accessibilityRole="button" onPress={() => switchMode('login')}>
                Back to sign in
              </Text>
            </Text>
          ) : (
            <Text style={styles.toggle}>
              {mode === 'register' ? 'Already have an account? ' : 'New here? '}
              <Text
                style={{ color: colors.accent }}
                accessibilityRole="button"
                onPress={() => switchMode(mode === 'register' ? 'login' : 'register')}
              >
                {mode === 'register' ? 'Sign in' : 'Create account'}
              </Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  wrap: { width: '100%', maxWidth: 380, alignSelf: 'center' },
  head: { alignItems: 'center', marginBottom: 40 },
  tagline: { color: colors.textSec, fontSize: 15, lineHeight: 24, marginTop: 14, fontFamily: fonts.regular, textAlign: 'center' },
  label: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSec, marginBottom: 6 },
  error: { fontSize: 13, color: semantic.danger, fontFamily: fonts.regular },
  info: { fontSize: 13, color: colors.accent, fontFamily: fonts.regular },
  forgot: { fontSize: 12, color: colors.accent, fontFamily: fonts.medium, marginTop: 8, alignSelf: 'flex-end' },
  resetHint: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular, lineHeight: 20 },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
});
