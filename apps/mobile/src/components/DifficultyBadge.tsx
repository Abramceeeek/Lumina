import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, shadow, difficultyColors, Difficulty } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { useAppStore } from '@/store/useAppStore';

const OPTS: Difficulty[] = ['Simple', 'Medium', 'Hard'];

// Tappable difficulty selector (prototype's DifficultyBadge), backed by the store.
export function DifficultyBadge() {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);
  const [open, setOpen] = useState(false);
  const color = difficultyColors[difficulty];

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`Difficulty: ${difficulty}`}
        accessibilityHint="Change reading difficulty"
        style={styles.badge}
      >
        <Text style={[styles.badgeText, { color }]}>{difficulty}</Text>
        <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
          <Path d="M2 3.5l3 3 3-3" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>

      {open && (
        <View style={styles.menu}>
          {OPTS.map((o) => (
            <Pressable
              key={o}
              onPress={() => {
                setDifficulty(o);
                setOpen(false);
              }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: difficulty === o }}
              style={[styles.item, { backgroundColor: difficulty === o ? colors.accentLight : 'transparent' }]}
            >
              <Text style={{ fontSize: 13, fontFamily: difficulty === o ? fonts.semibold : fonts.regular, color: difficulty === o ? difficultyColors[o] : colors.text }}>{o}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  badgeText: { fontSize: 12, fontFamily: fonts.medium },
  menu: { position: 'absolute', top: '110%', right: 0, minWidth: 120, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, overflow: 'hidden', zIndex: 30, ...shadow },
  item: { paddingVertical: 9, paddingHorizontal: 16 },
});
