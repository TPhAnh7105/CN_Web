# Tài Liệu Cấu Trúc, API & Hàm Dự Án Luxe Furnish (LuxeFurnish)

Tài liệu này cung cấp giải thích chi tiết cho toàn bộ dự án website quản lý & bán đồ nội thất **Luxe Furnish**, bao gồm chức năng của từng file, các hàm logic quan trọng và danh sách API Endpoints.

---

## I. PHẦN HỆ BACKEND (Thư mục `/backend`)

Backend sử dụng Node.js, Express, và Sequelize ORM kết nối MySQL.

### 1. File Cấu hình & Khởi chạy (Root `/backend`)
* **`server.js`**: Điểm bắt đầu (Entry point).
  * Hàm chính: `connectDB()` - Kiểm tra và thiết lập kết nối tới CSDL.
  * Tính năng: Đồng bộ Models vào MySQL (`sequelize.sync()`), khởi động server HTTP.
* **`app.js`**: Định cấu hình ứng dụng Express.
  * Middleware: Cấu hình `cors`, `helmet`, `express.json()`, `morgan` (logger).
  * Routing: Định nghĩa các tiền tố URL (vd: `/api/products` -> `productRoutes`).
  * Error Handling: Middleware tập trung xử lý lỗi trả về định dạng JSON thống nhất.
* **`seed.js`**: Script tạo dữ liệu giả mẫu ban đầu (Danh mục, Sản phẩm, Admin, ...).
* **`fix_db.js` / `bootstrap_attributes.js`**: Script bảo trì, sửa lỗi cấu trúc hoặc đồng bộ nhanh dữ liệu khởi tạo.

---

### 2. Định nghĩa Bảng CSDL (Thư mục `/backend/src/models`)
* **`user.model.js`**: Bảng `users` (id, username, email, password, role, balance, resetPasswordToken, resetPasswordExpire).
* **`product.model.js`**: Bảng `products` (thông tin nội thất cơ bản, giá cả, kho hàng, hình ảnh).
* **`category.model.js`** / **`type.model.js`** / **`style.model.js`** / **`segment.model.js`**: Bảng danh mục và thuộc tính phân loại sản phẩm.
* **`order.model.js`** & **`orderItem.model.js`**: Bảng đơn hàng (`orders`) và chi tiết sản phẩm mua (`order_items`).
* **`transaction.model.js`**: Bảng lịch sử ví điện tử (nạp, trừ tiền).
* **`review.model.js`**: Bảng đánh giá sản phẩm (rating từ 1-5 sao, comment, liên kết `userId` và `productId`).

---

### 3. Xử lý Logic & Hàm Controller (Thư mục `/backend/src/controllers`)
Chứa các hàm (functions) xử lý nghiệp vụ cho từng API request:

#### a. `auth.controller.js` (Xác thực)
* `register`: Mã hóa mật khẩu (`bcrypt.hash`), tạo user mới.
* `login`: Kiểm tra email/mật khẩu, sinh token (`jwt.sign()`).
* `forgotPassword`: Sinh mã token ngẫu nhiên, lưu vào DB có hạn sử dụng, gửi mail reset.
* `resetPassword`: Kiểm tra token hợp lệ, cập nhật mật khẩu mới.

#### b. `product.controller.js` (Sản phẩm)
* `getProducts`: Hỗ trợ lọc (filter) theo danh mục, giá, từ khóa, sort và phân trang.
* `getProductById`: Trả về chi tiết 1 sản phẩm kèm reviews liên quan.
* `createProduct`, `updateProduct`, `deleteProduct`: Dành riêng cho Admin thao tác CRUD.

#### c. `order.controller.js` (Đơn hàng)
* `createOrder`: Hàm quan trọng (Transaction). Kiểm tra số dư ví -> Trừ ví -> Trừ số lượng kho -> Tạo Order và OrderItems.
* `getMyOrders`: Lấy lịch sử đơn hàng của bản thân (cần Auth).
* `updateStatus`: Đổi trạng thái (Đang xử lý -> Đã giao). Nếu Hủy đơn, hàm tự động cộng hoàn lại tiền vào ví khách hàng.
* `getRevenueStats`: Tính tổng doanh thu, số đơn, gom nhóm dữ liệu biểu đồ cho Admin.

#### d. `user.controller.js` (Người dùng)
* `getProfile`: Lấy thông tin cá nhân và ví của tài khoản đang đăng nhập.
* `deposit`: Tính năng nạp tiền ảo (cộng tiền vào `balance`, tạo lịch sử `transaction`).
* `getAllUsers`, `updateRole`, `deleteUser`: Admin quản lý tài khoản.

#### e. `review.controller.js` (Đánh giá)
* `createReview`: Xác thực user đã mua sản phẩm đó mới được viết đánh giá, cập nhật rating.
* `getProductReviews`: Lấy danh sách bình luận của 1 sản phẩm.

---

### 4. Middleware & Phân Quyền (Thư mục `/backend/src/middleware`)
* **`auth.middleware.js`**: Hàm `protect`. Kiểm tra và giải mã JWT trong Header (`Authorization: Bearer <token>`).
* **`admin.middleware.js`**: Hàm `authorize('admin')`. Từ chối request nếu user hiện tại không có quyền admin.

---

### 5. Danh Sách API Endpoints Chính (Thư mục `/backend/src/routes`)

| Phương thức | Endpoint | Chức năng | Phân quyền |
|---|---|---|---|
| POST | `/api/auth/login` | Đăng nhập | Public |
| POST | `/api/auth/register` | Đăng ký tài khoản | Public |
| POST | `/api/auth/forgotpassword`| Quên mật khẩu | Public |
| PUT  | `/api/auth/resetpassword/:token` | Đặt lại mật khẩu | Public |
| GET  | `/api/users/profile` | Lấy thông tin cá nhân | Auth |
| POST | `/api/users/deposit` | Nạp tiền vào ví | Auth |
| GET  | `/api/products` | Danh sách sản phẩm | Public |
| GET  | `/api/products/:id` | Chi tiết sản phẩm | Public |
| POST | `/api/products` | Thêm sản phẩm mới | Admin |
| POST | `/api/orders` | Đặt hàng và thanh toán | Auth |
| GET  | `/api/orders/myorders` | Lịch sử mua hàng | Auth |
| GET  | `/api/orders/admin/stats` | Thống kê doanh thu | Admin |
| PUT  | `/api/orders/:id/status` | Duyệt / Hủy đơn hàng | Admin |
| POST | `/api/reviews/:productId` | Gửi đánh giá sản phẩm | Auth |

---
---

## II. PHÂN HỆ FRONTEND (Thư mục `/frontend`)

Frontend là ứng dụng React SPA, giao tiếp API qua thư viện **Axios**.

### 1. Quản lý Trạng Thái Toàn Cục (Context - `/frontend/src/context`)
* **`AuthContext.js`**:
  * Lưu token ở `localStorage`.
  * API Frontend: Cung cấp `user`, hàm `login()`, `logout()` dùng chung cho toàn bộ App.
* **`CartContext.js`**:
  * Quản lý mảng sản phẩm đang chọn trong bộ nhớ.
  * API Frontend: Các hàm `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`.

### 2. Giao Diện & Logic Các Trang (Thư mục `/frontend/src/pages`)
* **`Home.js`**: Trang chủ (Banner slider, sản phẩm nổi bật).
* **`Products.js`**: Trang danh sách. Chứa logic gọi API tìm kiếm, lọc theo Sidebar trạng thái.
* **`ProductDetail.js`**: Gọi API lấy 1 sản phẩm. Chứa chức năng chọn Số lượng và hiển thị/viết Bình luận (`Reviews`).
* **`Cart.js`**: Giao diện giỏ. Chứa logic tính toán Tổng tiền và form Submit đặt hàng gọi qua `api/orders`.
* **`Login.js` / `Register.js`**: Giao diện Auth. Lưu lỗi Validation.
* **`ForgotPassword.js` / `ResetPassword.js`**: Giao diện nhập email quên mật khẩu và nhập mật khẩu mới từ link email.
* **`Profile.js` / `History.js` / `Wallet.js`**: Nhóm trang cá nhân. Lấy data từ AuthContext để fetch dữ liệu riêng biệt.
* **`AdminDashboard.js`**: Trang quản trị tổng hợp.
  * Gọi nhiều API đồng thời (`getRevenueStats`, `getProducts`, `getOrders`).
  * Có các tab xử lý Duyệt đơn, Quản lý sản phẩm, User, Danh mục, Đánh giá.

### 3. Thành Phần Dùng Chung (Thư mục `/frontend/src/components`)
* **`Navbar.js`**: Chứa logic thanh điều hướng động (ẩn hiện nút theo role Admin/Customer), search bar.
* **`ProductList.js`**: Nhận `props` danh sách sản phẩm và duyệt mảng để render ra các `Card` giao diện.
* **`HeroSlider.js`**: Chức năng tự động trượt hình ảnh (Carousel) trang chủ.

### 4. Scripts & Mở rộng (`/scratch` & CSS)
* **`scratch/fix_images.js`**: Script môi trường chạy độc lập để update hàng loạt URL hình ảnh hỏng trên DB.
* **`frontend/src/index.css`**: Nơi chứa 100% mã CSS toàn cục, các biến màu (`:root`), animation và Responsive Media Queries của dự án.
