import { onAuthStateChanged, signOut } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ADMIN_UID } from './src/config/firebaseConfig';
import { auth } from './src/services/firebase';
import { LoginScreen } from './src/screens/LoginScreen';
import { UsersScreen } from './src/screens/UsersScreen';
import { colors } from './src/theme';
import { Button } from './src/components/Button';
import { errorMessage } from './src/utils/errors';

function Application() {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => onAuthStateChanged(auth, (user) => {
    setAdmin(!!ADMIN_UID && user?.uid === ADMIN_UID);
    setReady(true);
  }), []);

  async function logout() {
    if (saving || signingOut) return;
    setSigningOut(true);
    setLogoutError('');
    try { await signOut(auth); }
    catch (failure) { setLogoutError(errorMessage(failure)); }
    finally { setSigningOut(false); }
  }

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Quản lý người dùng</Text>
          <View style={styles.headerActions}>
            <Text style={styles.platform}>{Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
            {admin && <Button title="Đăng xuất" onPress={logout} disabled={saving} loading={signingOut} />}
          </View>
        </View>
        {!!logoutError && <Text accessibilityRole="alert" style={styles.error}>{logoutError}</Text>}
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          {ready ? admin ? <UsersScreen onBusyChange={setSaving} /> : <LoginScreen /> : <ActivityIndicator color={colors.primary} accessibilityLabel="Đang khởi động" />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export default function App() {
  return <SafeAreaProvider><Application /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center' }, page: { width: '100%', maxWidth: 1200, paddingHorizontal: 20, paddingVertical: 26 },
  headerContainer: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, flexGrow: 1, flexBasis: 220 }, platform: { fontSize: 12, fontWeight: '600', color: colors.primary, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.primarySoft, borderRadius: 20 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 20, marginTop: 10 },
});
