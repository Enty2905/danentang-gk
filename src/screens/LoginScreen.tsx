import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ADMIN_UID, firebaseConfig } from '../config/firebaseConfig';
import { auth } from '../services/firebase';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { colors } from '../theme';
import { errorMessage } from '../utils/errors';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function login() {
    setError('');
    if (!ADMIN_UID || !firebaseConfig.databaseURL) { setError('Chưa hoàn tất cấu hình Firebase. Xem README để thiết lập.'); return; }
    if (!email.trim() || !password) { setError('Nhập email và mật khẩu admin.'); return; }
    setBusy(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError('Tài khoản này không có quyền quản trị.');
      }
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  return <View style={styles.card}>
    <Text style={styles.heading}>Đăng nhập admin</Text>
    <Text style={styles.subtitle}>Quản lý thông tin người dùng</Text>
    <Field label="Email admin" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="username" editable={!busy} />
    <Field label="Mật khẩu admin" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" autoCapitalize="none" editable={!busy} onSubmitEditing={login} />
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Button title="Đăng nhập" onPress={login} loading={busy} />
  </View>;
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', marginTop: 36, padding: 24, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  heading: { fontSize: 25, fontWeight: '700', color: colors.ink }, subtitle: { color: colors.muted, fontSize: 14, marginTop: 8, marginBottom: 28 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 20, marginBottom: 14 },
});
