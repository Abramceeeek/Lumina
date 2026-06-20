import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/design/tokens';
import { fonts } from '@/design/typography';

export function Logo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 36 : 26;
  const r = size === 'lg' ? 11 : 8;
  const fontSize = size === 'lg' ? 22 : 16;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: sz, height: sz, borderRadius: r, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={sz * 0.5} height={sz * 0.5} viewBox="0 0 16 16" fill="none">
          <Path d="M3 13 L8 3 L13 13" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5 9.5 L11 9.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      </View>
      <Text style={{ fontSize, fontFamily: fonts.semibold, color: colors.text, letterSpacing: -0.4 }}>Lumina</Text>
    </View>
  );
}
