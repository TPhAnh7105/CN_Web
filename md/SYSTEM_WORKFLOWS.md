# Luxe Furnish - Kiến trúc Hệ thống & Luồng Xử Lý Nghiệp Vụ

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc của hệ thống, giải thích mục đích của tất cả các thư mục lớn (mục to) và các luồng xử lý dữ liệu cốt lõi trong dự án Luxe Furnish.

---

## I. CẤU TRÚC THƯ MỤC VÀ CHỨC NĂNG (BACKEND & FRONTEND)

Dự án được chia thành hai phân hệ độc lập tương tác qua RESTful API.

### 1. Phân hệ Backend (`/backend`)
Được viết bằng **Node.js, Express** và **Sequelize (MySQL)**. Áp dụng mô hình thiết kế MVC thu gọn. Dưới đây là ý nghĩa của các thư mục/file gốc quan trọng nhất:

* **File Cấu Hình Gốc (`server.js` & `app.js`)**: Điểm khởi chạy của Backend. Khởi động HTTP Server, đồng bộ Database và đăng ký các config toàn cục (CORS, Router gốc, Logger).
* **Thư mục `/src/config`**: Nơi lưu trữ các file cấu hình kết nối tới bên thứ ba hoặc Database (như `db.js` thiết lập connection pool tới MySQL).
* **Thư mục `/src/routes` (Định tuyến API)**: 
  * Tiếp nhận các Request từ máy khách (Frontend). Đóng vai trò như "người chỉ đường", phân phát URL (ví dụ `/api/orders`) tới đúng hàm xử lý.
  * *Ví dụ: `product.routes.js`, `order.routes.js`.*
* **Thư mục `/src/controllers` (Logic Nghiệp vụ)**: 
  * "Bộ não" của Backend. Mỗi file trong này chứa các hàm thực hiện một chức năng cụ thể: tính toán, truy vấn dữ liệu, nạp thẻ, duyệt đơn...
  * *Ví dụ: `auth.controller.js` (Băm mật khẩu, tạo Token đăng nhập), `order.controller.js` (Logic trừ tiền ví, trừ tồn kho).*
* **Thư mục `/src/models` (Cấu trúc CSDL)**: 
  * Khai báo cấu trúc các bảng dữ liệu sẽ lưu trong MySQL bằng Sequelize ORM. Giúp tương tác với DB bằng Object thay vì viết câu lệnh SQL thô.
  * *Ví dụ: `user.model.js` (Bảng người dùng), `orderItem.model.js` (Bảng chi tiết mặt hàng).*
* **Thư mục `/src/middleware` (Bộ lọc Bảo vệ)**: 
  * Chứa các đoạn code trung gian chạy TRƯỚC khi Request đi tới Controller. Dùng để bảo mật và phân quyền.
  * *Ví dụ: `auth.middleware.js` (Chặn user chưa đăng nhập), `admin.middleware.js` (Chỉ cho phép tài khoản Admin thao tác).*

---

### 2. Phân hệ Frontend (`/frontend`)
Được viết bằng **React**, là một Single Page Application (SPA). Hệ thống thư mục được tổ chức theo tiêu chuẩn React Component.

* **File Cấu Hình Gốc (`App.js` & `index.js`)**: Nơi bọc các Provider (Context) và định nghĩa danh sách các Router chuyển trang.
* **Thư mục `/src/pages` (Các Trang Giao Diện)**:
  * Mỗi file Javascript trong này đại diện cho MỘT màn hình hoàn chỉnh mà người dùng nhìn thấy trên trình duyệt.
  * *Ví dụ: `Home.js` (Trang chủ), `Cart.js` (Trang giỏ hàng), `AdminDashboard.js` (Trang quản trị).*
* **Thư mục `/src/components` (Thành phần Tái sử dụng)**:
  * Chứa các mảnh UI nhỏ (như Nút bấm, Thanh điều hướng, Thẻ hiển thị sản phẩm) có thể dùng chung ở nhiều Page khác nhau mà không phải code lại.
  * *Ví dụ: `Navbar.js` (Thanh menu trên cùng), `ProductList.js` (Khối hiển thị danh sách dạng lưới), `HeroSlider.js` (Banner trượt).*
* **Thư mục `/src/context` (Trạng thái Toàn cục)**:
  * Quản lý dữ liệu chung của toàn bộ ứng dụng bằng React Context. Giúp chia sẻ dữ liệu ngay lập tức giữa các Component mà không phải truyền Props phức tạp.
  * *Ví dụ: `AuthContext.js` (Lưu JWT Token, trạng thái Đang đăng nhập), `CartContext.js` (Lưu số lượng sản phẩm trong giỏ).*
* **File `index.css`**: Chứa toàn bộ CSS toàn cục, các biến màu sắc (color tokens) và hiệu ứng (animations) của dự án.

---

## II. CÁC LUỒNG XỬ LÝ CỐT LÕI (WORKFLOWS)

### Luồng 1: Xác thực & Đăng nhập (Authentication Flow)
1. Khách hàng nhập Email và Mật khẩu ở Component `Login.js` (Frontend).
2. Frontend gửi POST request tới Route `/api/auth/login`.
3. Backend (`auth.controller.js`) tìm User theo email. Dùng `bcrypt.compare` kiểm tra mật khẩu.
4. Nếu đúng, Backend ký một chuỗi Token (`jwt.sign`) chứa User ID và Role, trả về cho Frontend.
5. Frontend (`AuthContext.js`) lưu Token vào `localStorage` và tự động đính kèm Token này vào Header (`Authorization: Bearer <token>`) trong mọi API tiếp theo.

### Luồng 2: Áp dụng Mã Giảm Giá & Thanh Toán (Checkout Flow)
**Bước 1: Áp Voucher**
1. User nhập mã ở trang Giỏ hàng (`Cart.js`). Frontend gọi `/api/vouchers/apply` kèm `mã` và `tổng tiền`.
2. Backend (`voucher.controller.js`) kiểm tra: Mã có tồn tại? Có Active? Có đạt giá trị tối thiểu? Đã hết lượt dùng?
3. Trả về số tiền được giảm để UI hiển thị.

**Bước 2: Thanh Toán (Transaction)**
1. User bấm Đặt hàng. Frontend gọi POST `/api/orders/checkout`.
2. Backend (`order.controller.js`) sử dụng **Sequelize Transaction** (Đảm bảo an toàn dữ liệu, nếu lỗi 1 bước sẽ hủy toàn bộ thao tác):
   * Khóa dòng dữ liệu User (tránh race-condition).
   * Kiểm tra `số dư ví` >= `tổng tiền cần trả`.
   * Trừ tiền ví -> Tạo log `transactions` -> Tạo `orders` -> Trừ số lượng tồn kho `products` -> Tạo `order_items` -> Trừ số lần sử dụng Voucher.
3. Commit Transaction và trả kết quả thành công cho Frontend.

### Luồng 3: Nạp Tiền Ví Điện Tử (Deposit Flow)
1. User vào trang Ví (`Wallet.js`), nhập số tiền.
2. Frontend gọi POST `/api/users/deposit`.
3. Backend (`auth.middleware`) kiểm tra Token để lấy ra đúng User đang nạp tiền.
4. Backend (`user.controller.js`) cộng tiền vào cột `balance` của User, và tạo 1 bản ghi `transaction` dạng `deposit` để làm sao kê lịch sử nạp.

### Luồng 4: Duyệt và Hủy Đơn Hàng (Order Management Flow)
1. Admin vào `AdminDashboard.js`, thao tác chuyển trạng thái đơn hàng.
2. Frontend gọi PUT `/api/orders/:id/status`. Backend cập nhật trạng thái đơn trong DB.
3. Trường hợp **Hủy Đơn**:
   * Backend kiểm tra đơn đó nếu là đã thanh toán bằng ví.
   * Tự động cộng hoàn lại (Refund) toàn bộ số tiền của đơn hàng đó vào ví khách hàng.
   * Tạo 1 bản ghi sao kê `refund`.
   * Trả lại số lượng tồn kho cho các sản phẩm đã bị hủy.
