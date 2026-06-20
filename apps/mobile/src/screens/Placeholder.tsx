import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';

// Tab shells for A0. Each gets a real port in a later PR (Trail A3, Notes A3, …).
export function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  title: { fontSize: 24, fontFamily: fonts.semibold, color: colors.text, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, fontFamily: fonts.regular, color: colors.textSec, textAlign: 'center' },
});
