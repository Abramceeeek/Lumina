import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/design/tokens';
import { BottomNav } from '@/components/BottomNav';
import { TabId } from '@/components/icons';
import { TodayFlow } from '@/screens/today/TodayFlow';
import { Placeholder } from '@/screens/Placeholder';
import { Onboarding } from '@/screens/onboarding/Onboarding';

// A0 app shell: the prototype is a state machine, so the client mirrors it —
// one root that swaps screens under a custom bottom nav. (Onboarding + the full
// Today flow arrive in later PRs; file-based routes can come later if needed.)
export default function Lumina() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<TabId>('today');

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.content}>
        {tab === 'today' && <TodayFlow />}
        {tab === 'trail' && <Placeholder title="Trail" subtitle="Your knowledge trail — coming soon." />}
        {tab === 'notes' && <Placeholder title="Notes" subtitle="Saved highlights & vocabulary — coming soon." />}
        {tab === 'social' && <Placeholder title="Social" subtitle="Friends & leaderboard — coming soon." />}
        {tab === 'profile' && <Placeholder title="Profile" subtitle="Your progress — coming soon." />}
      </View>
      <BottomNav active={tab} onChange={setTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
