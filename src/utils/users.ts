import type { UserFields } from '../types';

export const USER_FIELDS = ['email', 'matkhau', 'hoten', 'hinhanh'] as const;
export const MAX_IMAGE_LENGTH = 350000;

export function validateUserInput(value: UserFields, editing = false): string {
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value.email.trim()) || value.email.trim().length > 254) return 'Nhập địa chỉ email hợp lệ.';
  if (!value.hoten.trim() || value.hoten.trim().length > 100) return 'Họ tên phải có từ 1 đến 100 ký tự.';
  if ((!editing || value.matkhau.length > 0) && (value.matkhau.length < 6 || value.matkhau.length > 128)) return 'Mật khẩu phải có từ 6 đến 128 ký tự.';
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.hinhanh) || value.hinhanh.length > MAX_IMAGE_LENGTH) return 'Hãy chọn ảnh JPEG hợp lệ, có dữ liệu sau nén dưới 350 KB.';
  return '';
}

export function isUserFields(value: unknown): value is UserFields {
  if (!value || typeof value !== 'object') return false;
  const object = value as Record<string, unknown>;
  return Object.keys(object).length === 4 && USER_FIELDS.every((field) => typeof object[field] === 'string');
}
