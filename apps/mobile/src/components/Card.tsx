import { ReactNode } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '@/design/tokens';

type Props = {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'radio' | 'checkbox';
};

export function Card({ children, selected, onPress, style, accessibilityLabel, accessibilityHint, accessibilityRole }: Props) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected: Boolean(selected) }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: selected ? colors.accentLight : colors.card,
            borderColor: selected ? colors.accent : pressed ? '#C8C4BE' : colors.border,
          },
          pressed && !selected ? shadow : null,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: selected ? colors.accentLight : colors.card, borderColor: selected ? colors.accent : colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: radius.card, paddingVertical: 16, paddingHorizontal: 18 },
});
