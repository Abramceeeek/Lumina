import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';

export function Divider({ label }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {label ? <View style={styles.line} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  label: { fontSize: 13, color: colors.textTer, fontFamily: fonts.regular },
});
