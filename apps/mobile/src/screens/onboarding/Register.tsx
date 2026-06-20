import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { ArrowRight, GoogleIcon } from '@/components/icons';

export function Register({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
              <Input placeholder="8+ characters" value={password} onChangeText={setPassword} secureTextEntry accessibilityLabel="Password" />
            </View>
            <Button label="Create account" onPress={onNext} style={{ marginTop: 4, width: '100%' }}>
              <ArrowRight />
            </Button>
          </View>

          <Divider label="or" />

          <Button variant="ghost" onPress={onNext} style={{ width: '100%' }}>
            <GoogleIcon />
            <Text style={styles.googleText}>Continue with Google</Text>
          </Button>

          <Text style={styles.signin}>
            Already have an account?{' '}
            <Text style={{ color: colors.accent }} onPress={onNext} accessibilityRole="button" accessibilityLabel="Sign in">Sign in</Text>
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
  googleText: { color: colors.textSec, fontSize: 14, fontFamily: fonts.medium },
  signin: { textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
});
