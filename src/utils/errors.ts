export function errorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(code)) return 'Email hoặc mật khẩu đăng nhập không đúng.';
  if (code === 'auth/too-many-requests') return 'Đăng nhập quá nhiều lần. Hãy thử lại sau.';
  if (code === 'auth/invalid-email') return 'Địa chỉ email không hợp lệ.';
  if (code.includes('network')) return 'Không kết nối được Firebase. Kiểm tra mạng rồi thử lại.';
  if (code.toLowerCase().includes('permission')) return 'Tài khoản chưa có quyền admin hoặc Database Rules chưa đúng.';
  if (code === 'auth/operation-not-allowed') return 'Chưa bật đăng nhập Email/Password trong Firebase.';
  return 'Thao tác không thành công. Kiểm tra kết nối và cấu hình Firebase rồi thử lại.';
}
