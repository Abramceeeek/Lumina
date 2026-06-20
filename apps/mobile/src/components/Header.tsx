import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/design/tokens';
import { Logo } from './Logo';

export function Header({ right }: { right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <Logo />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
