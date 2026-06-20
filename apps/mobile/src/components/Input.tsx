import { useState } from 'react';
import { TextInput, StyleSheet, StyleProp, TextStyle, KeyboardTypeOptions } from 'react-native';
import { colors, radius } from '@/design/tokens';
import { fonts } from '@/design/typography';

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
};

export function Input({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, accessibilityLabel, style }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.textTer}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.input, { borderColor: focused ? colors.accent : colors.border }, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
    backgroundColor: colors.card,
  },
});
