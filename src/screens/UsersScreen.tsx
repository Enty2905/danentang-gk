import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button } from '../components/Button';
import { UserForm } from '../components/UserForm';
import { auth } from '../services/firebase';
import { deleteUser, saveUser, subscribeUsers } from '../services/users';
import { colors } from '../theme';
import type { UserEntry, UserFields } from '../types';
import { errorMessage } from '../utils/errors';

export function UsersScreen() {
  const { width } = useWindowDimensions();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [editing, setEditing] = useState<UserEntry>();
  const [deleting, setDeleting] = useState<UserEntry>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => subscribeUsers((value) => { setUsers(value); setLoading(false); }, (failure) => { setError(errorMessage(failure)); setLoading(false); }), []);

  async function submit(value: UserFields) {
    setBusy(true); setError(''); setMessage('');
    try {
      await saveUser(value, editing);
      setMessage(editing ? 'Đã cập nhật người dùng.' : 'Đã thêm người dùng.');
      setEditing(undefined);
      return true;
    } catch (failure) { setError(errorMessage(failure)); return false; }
    finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await deleteUser(deleting.key);
      if (editing?.key === deleting.key) setEditing(undefined);
      setDeleting(undefined);
      setMessage('Đã xóa người dùng.');
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  async function logout() {
    try { await signOut(auth); } catch (failure) { setError(errorMessage(failure)); }
  }

  return <>
    <View style={styles.toolbar}><Text style={styles.admin}>Admin: {auth.currentUser?.email}</Text><Button title="Đăng xuất" onPress={logout} disabled={busy} secondary /></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!!message && <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text>}
    <View style={[styles.columns, width >= 960 && styles.wide]}>
      <View style={width >= 960 ? styles.formWide : styles.form}><UserForm key={editing?.key || 'new'} existing={editing} busy={busy} onSave={submit} onCancel={() => setEditing(undefined)} /></View>
      <View style={styles.list}>
        <Text style={styles.heading}>Danh sách người dùng</Text>
        {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Đang tải người dùng" /> : users.length === 0 ? <Text style={styles.empty}>Chưa có người dùng.</Text> : users.map((entry) => <View key={entry.key} style={styles.row}>
          <Image source={{ uri: entry.value.hinhanh }} style={styles.avatar} accessibilityLabel={`Ảnh ${entry.value.hoten}`} />
          <View style={styles.info}><Text style={styles.name}>{entry.value.hoten}</Text><Text selectable style={styles.email}>{entry.value.email}</Text><Text style={styles.password}>Mật khẩu: ••••••••</Text></View>
          <View style={styles.rowActions}><Button title="Sửa" accessibilityLabel={`Sửa ${entry.value.hoten}`} onPress={() => { setEditing(entry); setMessage(''); setError(''); }} disabled={busy} secondary /><Button title="Xóa" accessibilityLabel={`Xóa ${entry.value.hoten}`} onPress={() => setDeleting(entry)} disabled={busy} danger /></View>
        </View>)}
      </View>
    </View>
    <Modal visible={!!deleting} transparent animationType="fade" onRequestClose={() => { if (!busy) setDeleting(undefined); }}>
      <View style={styles.overlay}><View style={styles.dialog} accessibilityViewIsModal>
        <Text style={styles.heading}>Xác nhận xóa</Text><Text style={styles.confirm}>Xóa người dùng “{deleting?.value.hoten}”?</Text>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <View style={styles.dialogActions}><Button title="Hủy" onPress={() => setDeleting(undefined)} disabled={busy} secondary /><Button title="Xác nhận xóa" onPress={confirmDelete} loading={busy} danger /></View>
      </View></View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, admin: { color: colors.muted, fontSize: 13, flexShrink: 1 },
  columns: { gap: 24 }, wide: { flexDirection: 'row', alignItems: 'flex-start' }, formWide: { width: 360 }, form: { width: '100%' }, list: { flex: 1, minWidth: 0, gap: 12 },
  heading: { color: colors.ink, fontSize: 19, fontWeight: '700', marginBottom: 8 }, empty: { paddingVertical: 28, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 13, padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  avatar: { width: 60, height: 60, borderRadius: 10, backgroundColor: colors.lightGreen }, info: { flex: 1, minWidth: 130, gap: 5 }, name: { fontWeight: '700', color: colors.ink, fontSize: 16 }, email: { color: colors.muted, fontSize: 13 }, password: { color: colors.muted, fontSize: 12 }, rowActions: { gap: 7, flexDirection: 'row', flexWrap: 'wrap' },
  success: { backgroundColor: colors.lightGreen, color: colors.green, padding: 12, borderRadius: 9, marginBottom: 18 }, error: { color: colors.danger, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  overlay: { flex: 1, backgroundColor: '#14231b88', alignItems: 'center', justifyContent: 'center', padding: 24 }, dialog: { width: '100%', maxWidth: 420, padding: 24, backgroundColor: '#fff', borderRadius: 14 }, confirm: { color: colors.ink, fontSize: 15, lineHeight: 23, marginBottom: 24 }, dialogActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
});
