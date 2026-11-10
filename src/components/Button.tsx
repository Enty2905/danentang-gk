import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = { title: string; accessibilityLabel?: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean; danger?: boolean };

export function Button({ title, accessibilityLabel, onPress, disabled, loading, secondary, danger }: Props) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel || title} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, danger && styles.danger, (disabled || loading || pressed) && styles.dim]}>
    {loading ? <ActivityIndicator color={secondary ? colors.primary : '#fff'} /> : <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>}
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 44, borderRadius: 9, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.primarySoft }, danger: { backgroundColor: colors.danger }, dim: { opacity: 0.55 },
  text: { color: '#fff', fontSize: 14, fontWeight: '700' }, secondaryText: { color: colors.primary },
});
