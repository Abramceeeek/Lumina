import { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md';

type Props = {
  label?: string;
  children?: ReactNode; // trailing icon(s)
  variant?: Variant;
  size?: Size;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function Button({ label, children, variant = 'primary', size = 'md', onPress, disabled, accessibilityLabel, style }: Props) {
  const pad = size === 'sm'
    ? { paddingVertical: 8, paddingHorizontal: 16 }
    : { paddingVertical: 11, paddingHorizontal: 22 };
  const fontSize = size === 'sm' ? 13 : 14;
  const textColor =
    variant === 'primary' ? semantic.white : variant === 'danger' ? semantic.danger : variant === 'ghost' ? colors.textSec : colors.accent;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.base,
        pad,
        variantStyle(variant, pressed),
        disabled ? { opacity: 0.4 } : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {label != null ? <Text style={{ color: textColor, fontSize, fontFamily: fonts.medium }}>{label}</Text> : null}
        {children}
      </View>
    </Pressable>
  );
}

function variantStyle(v: Variant, pressed: boolean): ViewStyle {
  switch (v) {
    case 'primary':
      return { backgroundColor: pressed ? semantic.accentPressed : colors.accent };
    case 'ghost':
      return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, ...(pressed ? shadow : null) };
    case 'soft':
      return { backgroundColor: colors.accentLight };
    case 'danger':
      return { backgroundColor: semantic.dangerBg, borderWidth: 1, borderColor: semantic.dangerBorder };
  }
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
});
