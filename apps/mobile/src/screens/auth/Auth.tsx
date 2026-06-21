import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ArrowRight } from '@/components/icons';
import { signUp, signIn } from '@/data/auth';

export function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !loading;

  const submit = async () => {
    setError(null);
    setInfo(null);
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
      } else {
        await signIn(email.trim(), password);
        onAuthed();
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
            <View>
              <Text style={styles.label}>Password</Text>
              <Input placeholder="6+ characters" value={password} onChangeText={setPassword} secureTextEntry accessibilityLabel="Password" />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}

            <Button
              label={loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
              onPress={canSubmit ? submit : undefined}
              disabled={!canSubmit}
              style={{ marginTop: 4, width: '100%' }}
            >
              {!loading ? <ArrowRight /> : null}
            </Button>
          </View>

          <Text style={styles.toggle}>
            {mode === 'register' ? 'Already have an account? ' : 'New here? '}
            <Text
              style={{ color: colors.accent }}
              accessibilityRole="button"
              onPress={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setError(null);
                setInfo(null);
              }}
            >
              {mode === 'register' ? 'Sign in' : 'Create account'}
            </Text>
          </Text>
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
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
});
