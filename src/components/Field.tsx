import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../theme';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.wrapper}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  wrapper: { gap: 7, marginBottom: 16 }, label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  input: { minHeight: 46, paddingHorizontal: 13, paddingVertical: 11, backgroundColor: '#fff', color: colors.ink, borderColor: colors.border, borderWidth: 1, borderRadius: 9, fontSize: 15 },
});
