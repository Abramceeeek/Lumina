import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/design/tokens';
import { BottomNav } from '@/components/BottomNav';
import { TabId } from '@/components/icons';
import { TodayFlow } from '@/screens/today/TodayFlow';
import { Trail } from '@/screens/Trail';
import { Notes } from '@/screens/Notes';
import { Social } from '@/screens/Social';
import { Profile } from '@/screens/Profile';
import { Onboarding } from '@/screens/onboarding/Onboarding';
import { Auth } from '@/screens/auth/Auth';
import { MemoryCheck } from '@/components/MemoryCheckModal';
import { AppBanner } from '@/components/AppBanner';
import { useAppStore } from '@/store/useAppStore';
import { isSupabaseConfigured } from '@/data/supabase';
import { useSession } from '@/data/auth';
import { getOnboarded, completeOnboarding } from '@/data/profile';
import { getSettings } from '@/data/settings';

function Splash() {
  return (
    <View style={[styles.root, styles.center]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function MainApp() {
  const [tab, setTab] = useState<TabId>('today');
  const setFontSize = useAppStore((s) => s.setFontSize);
  const setReadWidth = useAppStore((s) => s.setReadWidth);
  useEffect(() => {
    getSettings().then((s) => {
      setFontSize(s.fontSize);
      setReadWidth(s.readWidth);
    });
  }, [setFontSize, setReadWidth]);
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.content}>
        {tab === 'today' && <TodayFlow />}
        {tab === 'trail' && <Trail />}
        {tab === 'notes' && <Notes />}
        {tab === 'social' && <Social />}
        {tab === 'profile' && <Profile />}
      </View>
      <BottomNav active={tab} onChange={setTab} />
      <MemoryCheck />
      <AppBanner />
    </SafeAreaView>
  );
}

// Cloud mode: real Supabase auth → cloud-persisted onboarding → app.
function CloudRoot() {
  const { session, loading } = useSession();
  const setDifficulty = useAppStore((s) => s.setDifficulty);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (session) getOnboarded().then(setOnboarded);
    else setOnboarded(null);
  }, [session]);

  if (loading) return <Splash />;
  if (!session) return <Auth onAuthed={() => setOnboarded(null)} />;
  if (onboarded === null) return <Splash />;
  if (!onboarded) {
    return (
      <Onboarding
        onDone={async ({ fields, difficulty }) => {
          setDifficulty(difficulty);
          await completeOnboarding(fields, difficulty);
          setOnboarded(true);
        }}
      />
    );
  }
  return <MainApp />;
}

// Local mode (no Supabase env): onboarding persists to the device store only.
function LocalRoot() {
  const onboarded = useAppStore((s) => s.onboarded);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setDifficulty = useAppStore((s) => s.setDifficulty);
  if (!onboarded) {
    return (
      <Onboarding
        onDone={({ difficulty }) => {
          setDifficulty(difficulty);
          setOnboarded(true);
        }}
      />
    );
  }
  return <MainApp />;
}

export default function Lumina() {
  return isSupabaseConfigured ? <CloudRoot /> : <LocalRoot />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
