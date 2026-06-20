import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';
import { Header } from '@/components/Header';
import { TrailLinear } from './trail/TrailLinear';
import { TrailGraph } from './trail/TrailGraph';

export function Trail() {
  const [view, setView] = useState<'linear' | 'graph'>('linear');
  return (
    <View style={{ flex: 1 }}>
      <Header
        right={
          <Pressable
            onPress={() => setView((v) => (v === 'linear' ? 'graph' : 'linear'))}
            accessibilityRole="button"
            accessibilityLabel={view === 'linear' ? 'Switch to graph view' : 'Switch to trail view'}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>{view === 'linear' ? 'Graph view' : 'Trail view'}</Text>
          </Pressable>
        }
      />
      {view === 'linear' ? <TrailLinear /> : <TrailGraph />}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.card },
  toggleText: { fontSize: 13, color: colors.textSec, fontFamily: fonts.regular },
});
