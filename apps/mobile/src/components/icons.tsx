import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors } from '@/design/tokens';

type IconProps = { color?: string; size?: number };

export function ArrowRight({ color = '#fff', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M3 7h8M8 4l3 3-3 3" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRight({ color = colors.textTer, size = 12 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path d="M4 2l4 4-4 4" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Check({ color = '#fff', size = 9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 9 9" fill="none">
      <Path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export type TabId = 'today' | 'trail' | 'notes' | 'social' | 'profile';

// Bottom-nav glyphs, ported from the prototype's NAV config.
export function NavIcon({ name, active }: { name: TabId; active: boolean }) {
  const c = active ? colors.accent : colors.textTer;
  switch (name) {
    case 'today':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Rect x={3} y={5} width={16} height={14} rx={3} stroke={c} strokeWidth={1.6} />
          <Path d="M7 2v4M15 2v4M3 10h16" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case 'trail':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Circle cx={6} cy={6} r={2.5} stroke={c} strokeWidth={1.6} />
          <Circle cx={16} cy={11} r={2.5} stroke={c} strokeWidth={1.6} />
          <Circle cx={9} cy={17} r={2.5} stroke={c} strokeWidth={1.6} />
          <Path d="M8 7.5L14 10M14 12L11 15.5" stroke={c} strokeWidth={1.4} />
        </Svg>
      );
    case 'notes':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Path d="M6 4h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={c} strokeWidth={1.6} />
          <Path d="M7 8h8M7 11h6M7 14h4" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case 'social':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Circle cx={8} cy={8} r={3} stroke={c} strokeWidth={1.6} />
          <Circle cx={15} cy={8} r={3} stroke={c} strokeWidth={1.6} />
          <Path d="M3 18c0-2.8 2.2-5 5-5h6c2.8 0 5 2.2 5 5" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Circle cx={11} cy={8} r={3.5} stroke={c} strokeWidth={1.6} />
          <Path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
  }
}
