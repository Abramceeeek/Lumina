import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, semantic } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { useBanner } from '@/store/useBanner';

// A transient top banner for background failures (network/cloud sync). Auto-clears
// after a few seconds; tappable to dismiss. Mounted once at the app root.
export function AppBanner() {
  const message = useBanner((s) => s.message);
  const clear = useBanner((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 5000);
    return () => clearTimeout(t);
  }, [message, clear]);

  if (!message) return null;

  return (
    <Pressable onPress={clear} style={styles.wrap} accessibilityRole="alert" accessibilityLabel={message}>
      <View style={styles.banner}>
        <Text style={styles.text}>{message}</Text>
        <Text style={styles.dismiss}>Dismiss</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 8, left: 12, right: 12, zIndex: 100 },
  banner: {
    backgroundColor: semantic.dangerBg,
    borderWidth: 1,
    borderColor: semantic.dangerBorder,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  text: { flex: 1, fontSize: 13, color: colors.text, fontFamily: fonts.regular, lineHeight: 18 },
  dismiss: { fontSize: 12, color: semantic.danger, fontFamily: fonts.medium },
});
