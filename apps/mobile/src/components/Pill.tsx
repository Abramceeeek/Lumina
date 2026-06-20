import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';

export function Pill({ label, color }: { label: string; color?: string }) {
  const textColor = color ?? colors.accent;
  return (
    <View style={[styles.pill, { backgroundColor: color ? color + '18' : colors.accentLight }]}>
      <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: textColor }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill },
});
