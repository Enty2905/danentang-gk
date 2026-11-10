# Quản lý người dùng bằng React Native Expo và Firebase

Bài giữa kỳ Lập trình đa nền tảng. Chỉ gồm đăng nhập/đăng xuất admin, thêm, hiển thị, sửa, xóa người dùng và chọn/hiển thị ảnh trên web, Android, iOS.

## Chạy ứng dụng

Dùng Node.js 24 LTS từ 24.12 trở lên, npm và Expo Go tương thích SDK 57. Mã nguồn đã kết nối project `danentang-gk-5c8fe`.

```powershell
npm install
npm start
```

- Web: nhấn `w` hoặc chạy `npm run web`.
- Điện thoại: kết nối cùng Wi-Fi với máy tính, quét QR bằng Expo Go (Android) hoặc Camera (iPhone).
- Đăng nhập bằng email/mật khẩu admin bạn đã tự tạo trong Firebase Authentication. Mật khẩu này không nằm trong mã nguồn.
- Nếu Expo kiểm tra phiên bản qua mạng quá lâu: `npx expo start --offline`. Tùy chọn này bỏ kiểm tra trực tuyến của Expo; app vẫn cần Internet để truy cập Firebase.
- Phiên đăng nhập chỉ giữ trong bộ nhớ. Tải lại toàn bộ app cần đăng nhập lại.

## Firebase đã cấu hình

- Project: `danentang-gk-5c8fe`.
- Web App: `danentang-gk-expo`.
- Realtime Database: Singapore (`asia-southeast1`).
- Authentication: Email/Password.
- Quyền đọc/ghi `/users`: chỉ UID admin trong `src/config/firebaseConfig.ts` và `database.rules.json`.
- Gói Spark miễn phí. Không nâng cấp Blaze, không dùng Firebase Storage, Functions, SMS hoặc dịch vụ AI trong ứng dụng.
- Ảnh thu nhỏ tối đa 512px, chuyển JPEG, lưu Base64 trong `hinhanh`. Giới hạn chuỗi ảnh là 350000 ký tự. Khi đạt hạn mức Spark, dịch vụ có thể bị giới hạn; không tự chuyển sang gói trả phí.

Firebase Web App config và UID là định danh công khai. Quyền thực tế do Database Rules kiểm soát. Có thể ghi đè các giá trị trong `.env.local` theo `.env.example`; không đưa mật khẩu admin hoặc service-account key vào app.

## Cấu trúc dữ liệu đúng đề

```text
users
  {userKey}
    email: string
    matkhau: string
    hoten: string
    hinhanh: string
```

Mỗi bản ghi chỉ có bốn trường. Khóa `{userKey}` không lưu thành trường `id`. Không có role, timestamps hoặc trường khác.

`matkhau` là chuỗi PBKDF2-SHA256 gồm thuật toán, số vòng lặp, salt ngẫu nhiên và giá trị băm trong cùng một trường. Danh sách hiển thị mật khẩu bằng dấu che. Không lưu mật khẩu nguyên văn.

Đăng nhập admin dùng Firebase Authentication riêng. Các bản ghi `/users` là đối tượng admin quản lý; thêm bản ghi không tạo tài khoản đăng nhập Firebase Authentication.

## Cách dùng

1. Đăng nhập admin.
2. Nhập Email, Họ tên, Mật khẩu từ 6 đến 128 ký tự và Chọn ảnh.
3. Bấm Thêm người dùng. Danh sách cập nhật trực tiếp từ Firebase.
4. Bấm Sửa, chỉnh thông tin và Lưu thay đổi. Để trống mật khẩu mới để giữ mật khẩu cũ; không chọn ảnh mới sẽ giữ ảnh cũ.
5. Bấm Xóa, rồi Xác nhận xóa; Hủy sẽ giữ bản ghi.
6. Đăng xuất khi hoàn tất.

## File dữ liệu để nộp

`database.json` chứa một bản ghi mẫu Nguyễn Văn An với đúng bốn trường và ảnh Base64. File này đã được nhập vào database trống khi thiết lập.

Muốn lấy dữ liệu mới nhất trước khi nộp: Firebase Console → Realtime Database → Data → menu ba chấm ở gốc → Export JSON. Không import lại file mẫu vào database có dữ liệu cần giữ vì thao tác import sẽ ghi đè vị trí được chọn.

Có thể tạo lại file mẫu bằng `node scripts/create-database.mjs`. Mật khẩu mẫu của bản ghi là `Demo123!`, được lưu dạng băm; đây không phải mật khẩu admin và không dùng đăng nhập app.

## Các file chính

- `App.tsx`: chuyển màn hình đăng nhập/quản lý theo Firebase Auth.
- `src/screens/LoginScreen.tsx`: đăng nhập admin.
- `src/screens/UsersScreen.tsx`: danh sách, sửa, xóa và đăng xuất.
- `src/components/UserForm.tsx`: form và xử lý ảnh trên web/điện thoại.
- `src/services/users.ts`: đọc/ghi Firebase, chỉ ghi đúng bốn trường.
- `src/config/firebaseConfig.ts`: cấu hình project và UID admin.
- `src/utils/password.ts`: PBKDF2-SHA256 với salt.
- `database.rules.json`: quyền admin và kiểm tra cấu trúc dữ liệu.
- `submission/`: tài liệu và ảnh minh họa phục vụ nộp bài.

## Kiểm tra và đóng gói

```powershell
npm run typecheck
npm test
npm run test:rules
npm run build:web
npx expo export --platform android --platform ios --output-dir .expo/native-check
```

Kiểm tra rules cần Java 21 trở lên. Trên máy hiện tại có Java đi kèm Android Studio; nếu `java` chưa có trong PATH:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
npm run test:rules
```

`test:rules` dùng project giả `demo-danentang-gk` và Emulator cục bộ, không ghi vào database thật và không phát sinh phí Firebase.

Dependency overrides trong package.json thống nhất bản lõi Firebase App/App Compat, tránh nạp hai registry khiến Auth báo chưa được đăng ký. Giữ package-lock.json và dùng `npm ci` khi cần cài đúng các phiên bản đã kiểm tra.

## Cấu hình lại rules khi cần

Rules hiện đã xuất bản qua Firebase Console. Nếu sửa file rules, dán nội dung vào Realtime Database → Rules → Publish, hoặc dùng CLI sau khi tự đăng nhập:

```powershell
npx firebase login
npx firebase deploy --only database --project danentang-gk-5c8fe
```

Không triển khai Hosting hay Functions trong lệnh trên.

## Tài liệu tham khảo

- [Expo dùng Firebase JS SDK](https://docs.expo.dev/guides/using-firebase/)
- [Firebase Realtime Database Security Rules](https://firebase.google.com/docs/database/security)
- [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo ImageManipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)

## Kết quả xác minh

- TypeScript và 4 kiểm tra dữ liệu/mật khẩu: đạt.
- Firebase Emulator, 3 kiểm tra rules: đạt; gồm CRUD admin, chặn tài khoản khác và chặn dữ liệu sai/thừa trường.
- Xuất bundle web, Android và iOS: thành công.
- Web với Firebase thật: đăng nhập/đăng xuất, đọc danh sách, chọn và xử lý ảnh, cập nhật, giữ mật khẩu cũ và Hủy xóa: đã xác minh.
- Chưa kiểm thử thao tác Thêm và xác nhận xóa qua giao diện trên database thật; chưa chạy trên điện thoại thật.
- Báo cáo có ảnh minh họa: submission/BAO_CAO.pdf. Repository mã nguồn: [Enty2905/danentang-gk](https://github.com/Enty2905/danentang-gk). Video demo chưa có link.
