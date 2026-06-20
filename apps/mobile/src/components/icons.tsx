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

export function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M14.5 8.17c0-.46-.04-.9-.12-1.33H8v2.51h3.64a3.12 3.12 0 01-1.35 2.05v1.7h2.18c1.27-1.17 2.03-2.9 2.03-4.93z" fill="#4285F4" />
      <Path d="M8 15c1.83 0 3.37-.6 4.49-1.64l-2.18-1.7a4.39 4.39 0 01-2.31.64 4.38 4.38 0 01-4.12-3.03H1.62v1.76A7 7 0 008 15z" fill="#34A853" />
      <Path d="M3.88 9.27A4.4 4.4 0 013.65 8c0-.44.07-.87.23-1.27V4.97H1.62A7.01 7.01 0 001 8c0 1.13.27 2.2.62 3.03l2.26-1.76z" fill="#FBBC04" />
      <Path d="M8 3.62c1.03 0 1.95.36 2.68 1.05l2-2A7 7 0 008 1 7 7 0 001.62 4.97l2.26 1.76A4.38 4.38 0 018 3.62z" fill="#EA4335" />
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
