# TỪ ĐIỂN CẤU TRÚC VÀ CHỨC NĂNG TỪNG FILE TRONG DỰ ÁN LUXE FURNISH

Tài liệu này liệt kê TẤT CẢ các file quan trọng trong dự án và giải thích chi tiết mục đích, chức năng của từng file một cách cụ thể nhất.

---

## 1. PHÂN HỆ BACKEND (`/backend`)

### 1.1 Thư mục gốc & Cấu hình
- **`server.js`**: Điểm khởi động của toàn bộ hệ thống máy chủ. Nhiệm vụ của nó là kết nối với Database (thông qua Sequelize) và mở port (VD: 5000) để bắt đầu lắng nghe các yêu cầu từ Frontend.
- **`app.js`**: Nơi khởi tạo ứng dụng Express. File này thiết lập các bảo vệ an ninh, cho phép vượt tường lửa CORS, và định tuyến tất cả các URL bắt đầu bằng `/api/...` về đúng các file router tương ứng.
- **`src/config/db.js`**: Khởi tạo kết nối với cơ sở dữ liệu MySQL bằng thư viện Sequelize ORM, sử dụng các tham số tài khoản từ file `.env`.

### 1.2 Tầng Models (`/src/models`) - Định nghĩa Cấu trúc Bảng CSDL
*Mỗi file trong này đại diện cho 1 bảng (Table) trong MySQL.*
- **`user.model.js`**: Bảng `Users`. Lưu hồ sơ khách hàng, mật khẩu đã bãm, phân quyền (role) và đặc biệt là số dư ví ảo (`balance`).
- **`product.model.js`**: Bảng `Products`. Lưu thông tin cốt lõi của sản phẩm: Tên, giá gốc, giá khuyến mãi, số lượng tồn kho, hình ảnh và phân loại.
- **`category.model.js`**: Bảng `Categories`. Phân loại theo không gian (Phòng khách, Phòng ngủ, Bếp, Ngoài trời).
- **`type.model.js`**: Bảng `Types`. Phân loại theo loại hình nội thất (Sofa, Bàn, Ghế, Tủ...).
- **`style.model.js`**: Bảng `Styles`. Phân loại theo phong cách (Bắc Âu, Hiện đại, Cổ điển...).
- **`segment.model.js`**: Bảng `Segments`. Phân khúc giá (Bình dân, Trung lưu, Cao cấp).
- **`order.model.js`**: Bảng `Orders`. Lưu Hóa đơn tổng (Ai mua, tổng tiền, phương thức thanh toán, tình trạng duyệt, mã voucher).
- **`orderItem.model.js`**: Bảng `OrderItems`. Lưu danh sách chi tiết các món hàng bên trong một Hóa đơn (mua mặt hàng nào, số lượng bao nhiêu).
- **`transaction.model.js`**: Bảng `Transactions`. Sổ sao kê ghi lại mọi biến động tiền bạc: Nạp tiền, Thanh toán trừ tiền ví, và Tự động hoàn tiền.
- **`voucher.model.js`**: Bảng `Vouchers`. Lưu thông tin mã giảm giá, giới hạn số lượt sử dụng và điều kiện áp dụng.
- **`review.model.js`**: Bảng `Reviews`. Nơi chứa các lời bình luận và chấm điểm (số sao) của người dùng về sản phẩm.

### 1.3 Tầng Controllers (`/src/controllers`) - Bộ Não Xử Lý Nghiệp Vụ
*Nơi chứa các hàm code thực hiện tính toán, trừ tiền, thêm dữ liệu.*
- **`auth.controller.js`**: Xử lý logic Đăng ký, Đăng nhập (so sánh mật khẩu và cấp phát chìa khóa JWT Token), Quên mật khẩu.
- **`user.controller.js`**: Xử lý việc nạp tiền vào ví (`deposit`), đổi mật khẩu, cập nhật hồ sơ người dùng, và lấy toàn bộ danh sách User cho Admin.
- **`product.controller.js`**: Cung cấp hàm lấy danh sách sản phẩm (hỗ trợ lọc và phân trang), cũng như các hàm Thêm/Sửa/Xóa sản phẩm, Cập nhật giá Khuyến mãi.
- **`order.controller.js`**: File rất quan trọng. Chứa logic Thanh toán giỏ hàng (trừ tiền ví, tạo hóa đơn), Duyệt đơn (trừ tồn kho), Hủy đơn (hoàn lại tiền ví), và lấy danh sách đơn hàng cho người dùng (`getMyOrders`).
- **`voucher.controller.js`**: Kiểm tra tính hợp lệ của Mã giảm giá dựa trên giỏ hàng và lượt dùng còn lại.
- **`category/type/style/segment.controller.js`**: Các file thực hiện chức năng Thêm/Xem/Sửa/Xóa cho các bộ lọc phân loại.
- **`review.controller.js`**: Xử lý đăng bình luận và lấy danh sách bình luận của 1 sản phẩm.

### 1.4 Tầng Routes & Middleware (`/src/routes` & `/src/middleware`)
- **Các file `*.routes.js`**: Đóng vai trò như các trạm kiểm soát đường, nhận link API (Ví dụ `POST /login`) và gọi đúng hàm trong Controller ra chạy.
- **`auth.middleware.js`**: Trạm gác an ninh. Nó chặn các đường link yêu cầu phải đăng nhập (bằng cách kiểm tra xem có gửi kèm JWT Token hợp lệ hay không).
- **`admin.middleware.js`**: Trạm gác quyền lực. Chỉ mở cửa cho các tài khoản có Role là `admin`.

---

## 2. PHÂN HỆ FRONTEND (`/frontend`)

### 2.1 File Cấu Hình Hệ Thống & Context
- **`index.js`**: File "chân cắm", khởi động React và cắm nó vào file HTML.
- **`App.js`**: Bộ định tuyến (Router) trung tâm. Phân chia rõ ràng URL nào (VD: `/cart`) thì được nhìn thấy file Giao diện nào.
- **`index.css`**: File CSS khủng lồ chứa toàn bộ thiết kế, màu sắc (Theme), độ phản bóng, và các hiệu ứng chuyển động (Animation) của toàn dự án.
- **`context/AuthContext.js`**: Bộ nhớ toàn cục. Lưu trữ thông tin xem Khách hàng đã đăng nhập chưa, Token là gì. Bất kỳ trang nào cũng có thể lấy dữ liệu từ đây.
- **`context/CartContext.js`**: Quản lý Giỏ hàng ngầm. Cho phép thêm/bớt/xóa món hàng ở bất kỳ trang nào và tự động lưu vào ổ cứng (localStorage).

### 2.2 Các Component Tái Sử Dụng (`/src/components`)
- **`Navbar.js`**: Thanh điều hướng trên đỉnh. Chứa menu danh mục, thanh tìm kiếm thông minh (Live Search) tự động xổ ra sản phẩm, và menu người dùng.
- **`Footer.js`**: Phần chân trang (chứa link mạng xã hội, thông tin liên hệ).
- **`ProductList.js`**: Khung lưới (Grid) hiển thị các danh sách Thẻ Sản phẩm (Product Card).
- **`HeroSlider.js` & `Hero.js`**: Khối Banner khổng lồ trên cùng trang chủ, chứa các hình ảnh Nội thất trượt qua lại kèm nút kêu gọi hành động.
- **`CategoryList.js` / `AboutSection.js`**: Các khối hiển thị giới thiệu công ty và 4 danh mục lớn trên Trang chủ.

### 2.3 Các Trang Giao Diện Chính (`/src/pages`)
**A. Nhóm Cửa Hàng & Mua Sắm:**
- **`Home.js`**: Trang chủ.
- **`Products.js`**: Trang danh sách Sản phẩm lớn. Đặc biệt có nguyên một cột Sidebar bên trái dùng để check chọn lọc sản phẩm theo Giá, Phong cách, Phân khúc, v.v.
- **`ProductDetail.js`**: Trang bấm vào xem chi tiết 1 mặt hàng. Hiển thị ảnh to, mô tả, nút Add to Cart, và khung để khách đánh giá bình luận.
- **`Cart.js`**: Trang Giỏ Hàng. Tính toán tổng tiền, ô nhập Voucher giảm giá, và nút Thanh toán (Checkout).
- **`Search.js`**: Trang hiển thị danh sách các sản phẩm khớp với từ khóa khi người dùng gõ vào Navbar.
- **`Categories.js`, `Types.js`, `Styles.js`, `Segments.js`**: Các trang giới thiệu bằng hình ảnh về các đặc tính, phong cách thiết kế của Cửa hàng.

**B. Nhóm Tài Khoản & Cá Nhân:**
- **`Login.js`**: Trang đăng nhập (form email, password).
- **`Register.js`**: Trang đăng ký tài khoản mới.
- **`ForgotPassword.js` & `ResetPassword.js`**: Giao diện gửi yêu cầu đổi mật khẩu.
- **`Profile.js`**: Trang Hồ sơ, cho phép khách đổi Tên và thay Mật khẩu.
- **`Wallet.js`**: Giao diện Ví điện tử. Nơi khách giả lập điền số tiền nạp vào hệ thống để mua hàng.
- **`History.js`**: Trung tâm Quản lý Cá Nhân. Gồm 2 tab: 
   - *Lịch sử mua hàng*: Xem chi tiết từng món hàng trong các đơn đã đặt.
   - *Giao dịch ví*: Xem sao kê nạp tiền, thanh toán, hoàn tiền.
- **`Address.js`**: Giao diện cập nhật địa chỉ giao nhận (dùng chung).

**C. Khu Vực Quản Trị Hệ Thống (Chỉ dành cho Admin):**
- **`AdminDashboard.js`**: Siêu trang Quản trị. File này tích hợp vô số Tab bên trái để Admin quản lý toàn diện dự án:
   - *Bảng Thống Kê*: Hiển thị Doanh thu, top sản phẩm bán chạy.
   - *Đơn Hàng*: Duyệt, Từ chối, Xem chi tiết đơn hàng khách đặt.
   - *Lịch sử GD*: Giám sát mọi dòng tiền chảy trong hệ thống.
   - *Sản Phẩm*: Thêm/Sửa/Xóa sản phẩm, nạp ảnh vào kho.
   - *Khuyến mãi*: Set giảm giá (Flash sale) cho mặt hàng.
   - *Voucher*: Tạo mã giảm giá mới, cấu hình lượt dùng.
   - *Danh Mục & Thuộc Tính*: Thêm các phòng ban, phong cách, phân khúc mới vào bộ lọc.
