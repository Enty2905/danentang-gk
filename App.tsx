import { onAuthStateChanged } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ADMIN_UID } from './src/config/firebaseConfig';
import { auth } from './src/services/firebase';
import { LoginScreen } from './src/screens/LoginScreen';
import { UsersScreen } from './src/screens/UsersScreen';
import { colors } from './src/theme';

function Application() {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  useEffect(() => onAuthStateChanged(auth, (user) => {
    setAdmin(!!ADMIN_UID && user?.uid === ADMIN_UID);
    setReady(true);
  }), []);

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          <View style={styles.header}><Text style={styles.title}>Quản lý người dùng</Text><Text style={styles.platform}>{Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text></View>
          {ready ? admin ? <UsersScreen /> : <LoginScreen /> : <ActivityIndicator color={colors.green} accessibilityLabel="Đang khởi động" />}
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
  header: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 26, paddingBottom: 20, borderBottomWidth: 1, borderColor: colors.border },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, flexShrink: 1 }, platform: { fontSize: 12, fontWeight: '600', color: colors.green, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.lightGreen, borderRadius: 20 },
});
