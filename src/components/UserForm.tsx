import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Field } from './Field';
import { colors } from '../theme';
import type { UserEntry, UserFields } from '../types';
import { MAX_IMAGE_LENGTH, validateUserInput } from '../utils/users';

type Props = { existing?: UserEntry; busy: boolean; onSave: (value: UserFields) => Promise<boolean>; onCancel: () => void };

export function UserForm({ existing, busy, onSave, onCancel }: Props) {
  const [value, setValue] = useState<UserFields>({ email: existing?.value.email || '', hoten: existing?.value.hoten || '', matkhau: '', hinhanh: existing?.value.hinhanh || '' });
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);
  const disabled = busy || picking;
  const change = (field: keyof UserFields, text: string) => setValue((current) => ({ ...current, [field]: text }));

  async function chooseImage() {
    setError('');
    setPicking(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { setError('Cần quyền truy cập thư viện để chọn ảnh.'); return; }
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: false, quality: 1 });
      if (result.canceled) return;
      const asset = result.assets[0];
      const context = ImageManipulator.manipulate(asset.uri);
      if (asset.width > 512 || asset.height > 512) context.resize(asset.width >= asset.height ? { width: 512 } : { height: 512 });
      const rendered = await context.renderAsync();
      const image = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.65, base64: true });
      if (!image.base64) throw new Error('Image conversion failed');
      const uri = `data:image/jpeg;base64,${image.base64}`;
      if (uri.length > MAX_IMAGE_LENGTH) { setError('Ảnh còn quá lớn sau nén. Hãy chọn ảnh nhỏ hơn.'); return; }
      change('hinhanh', uri);
    } catch { setError('Không đọc được ảnh. Hãy chọn tệp ảnh khác.'); }
    finally { setPicking(false); }
  }

  async function submit() {
    const validation = validateUserInput(value, !!existing);
    setError(validation);
    if (validation) return;
    const success = await onSave(value);
    if (success && !existing) setValue({ email: '', matkhau: '', hoten: '', hinhanh: '' });
  }

  return <View style={styles.card}>
    <Text style={styles.heading}>{existing ? 'Sửa người dùng' : 'Thêm người dùng'}</Text>
    <Field label="Email" value={value.email} onChangeText={(text) => change('email', text)} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" maxLength={254} editable={!disabled} />
    <Field label="Họ tên" value={value.hoten} onChangeText={(text) => change('hoten', text)} maxLength={100} editable={!disabled} />
    <Field label={existing ? 'Mật khẩu mới' : 'Mật khẩu'} value={value.matkhau} onChangeText={(text) => change('matkhau', text)} secureTextEntry autoCapitalize="none" maxLength={128} editable={!disabled} placeholder={existing ? 'Để trống để giữ mật khẩu hiện tại' : 'Ít nhất 6 ký tự'} />
    <Text style={styles.label}>Hình ảnh</Text>
    <View style={styles.imageArea}>
      {value.hinhanh ? <Image source={{ uri: value.hinhanh }} accessibilityLabel="Ảnh người dùng đã chọn" style={styles.preview} /> : <View style={styles.placeholder}><Text style={styles.hint}>Chưa có ảnh</Text></View>}
      <Button title={picking ? 'Đang xử lý ảnh' : 'Chọn ảnh'} onPress={chooseImage} disabled={disabled} secondary />
    </View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <View style={styles.actions}><Button title={existing ? 'Lưu thay đổi' : 'Thêm người dùng'} onPress={submit} loading={busy} disabled={picking} />{existing && <Button title="Hủy sửa" onPress={onCancel} disabled={disabled} secondary />}</View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 22 },
  heading: { color: colors.ink, fontSize: 19, fontWeight: '700', marginBottom: 22 }, label: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  imageArea: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 22 }, preview: { width: 88, height: 88, borderRadius: 10, backgroundColor: colors.primarySoft },
  placeholder: { width: 88, height: 88, borderRadius: 10, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, hint: { color: colors.muted, fontSize: 12 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 20, marginBottom: 16 }, actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
});
