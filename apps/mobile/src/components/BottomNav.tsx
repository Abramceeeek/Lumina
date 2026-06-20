import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { NavIcon, TabId } from './icons';

const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'trail', label: 'Trail' },
  { id: 'notes', label: 'Notes' },
  { id: 'social', label: 'Social' },
  { id: 'profile', label: 'Profile' },
];

export function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Pressable key={t.id} onPress={() => onChange(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label} style={styles.item}>
            <NavIcon name={t.id} active={on} />
            <Text style={[styles.label, { color: on ? colors.accent : colors.textTer }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  item: { alignItems: 'center', gap: 3, paddingTop: 8, paddingHorizontal: 16 },
  label: { fontSize: 10, fontFamily: fonts.medium },
});
