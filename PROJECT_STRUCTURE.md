# Cấu Trúc Dự Án Luxe Furnish (LuxeFurnish)

Tài liệu này cung cấp giải thích chi tiết, **từng file một** cho toàn bộ dự án website quản lý & bán đồ nội thất **Luxe Furnish**. Dự án gồm hai phần chính: **Backend** (Node.js/Express/Sequelize) và **Frontend** (React).

---

## I. PHẦN HỆ BACKEND (Thư mục `/backend`)

Backend được viết theo mô hình MVC thu gọn (Model - Route - Controller), sử dụng **Sequelize ORM** để giao tiếp với cơ sở dữ liệu **MySQL**.

### 1. File cấu hình & Khởi chạy (Root `/backend`)
* **[server.js](file:///e:/furniture-store-api/backend/server.js)**: Điểm bắt đầu (Entry point) của server.
  * Load biến môi trường từ `.env`.
  * Thực hiện kết nối tới database MySQL qua hàm `connectDB()`.
  * Đăng ký tất cả các Sequelize Models để đồng bộ cấu trúc bảng tự động (`sequelize.sync({ alter: true })`).
  * Khởi động server Express lắng nghe trên cổng `PORT` (mặc định là `5000`).
* **[app.js](file:///e:/furniture-store-api/backend/app.js)**: Định cấu hình ứng dụng Express.
  * Đăng ký các middleware cơ bản: `cors()` (cho phép frontend gọi API), `helmet()` (bảo mật HTTP headers), `express.json()` & `express.urlencoded()` (phân tích body request).
  * Định cấu hình logger `morgan` để in log request theo chuẩn thời gian Việt Nam.
  * Liên kết các prefix URL (ví dụ: `/api/products`, `/api/auth`) tới các file routes tương ứng.
  * Định nghĩa middleware bắt lỗi tập trung (Error handling middleware).
* **[seed.js](file:///e:/furniture-store-api/backend/seed.js)**: File dữ liệu mẫu (Seeder).
  * Chứa script tự động chèn các dữ liệu khởi tạo như: Danh mục (Sofa, Bàn...), Loại sản phẩm, Phong cách thiết kế, Phân khúc, hơn 30 sản phẩm nội thất mẫu kèm hình ảnh và tài khoản Admin mặc định để test hệ thống.
* **[bootstrap_attributes.js](file:///e:/furniture-store-api/backend/bootstrap_attributes.js)**: Script phụ trợ khởi tạo nhanh các giá trị phân loại mẫu (Type, Style, Segment) vào database nếu bảng trống.

---

### 2. Thư mục Cấu hình `/backend/src/config`
* **[db.js](file:///e:/furniture-store-api/backend/src/config/db.js)**:
  * Sử dụng thư viện `sequelize` để tạo instance kết nối đến CSDL MySQL dựa trên các cấu hình: tên DB, username, password, host từ `.env`.
  * Định nghĩa hàm `connectDB()` để chạy thử kết nối bằng phương thức `authenticate()`.

---

### 3. Thư mục Định nghĩa Bảng CSDL `/backend/src/models`
Định nghĩa cấu trúc và quan hệ giữa các bảng trong MySQL:
* **[user.model.js](file:///e:/furniture-store-api/backend/src/models/user.model.js)**:
  * Bảng `users`: Lưu trữ thông tin tài khoản người dùng (`username`, `email`, `password`, `role` - mặc định là `customer`, `balance` - số dư ví điện tử để thanh toán).
* **[product.model.js](file:///e:/furniture-store-api/backend/src/models/product.model.js)**:
  * Bảng `products`: Chứa thông tin sản phẩm nội thất như tên, giá gốc (`originalPrice`), giá bán (`price`), ảnh (`image`), kích thước (`size`), màu sắc (`color`), chất liệu (`material`), mô tả (`description`), số lượng kho (`stock`). Liên kết khóa ngoại tới `categoryId`, `styleId`, `typeId`, và `segmentId`.
* **[category.model.js](file:///e:/furniture-store-api/backend/src/models/category.model.js)**:
  * Bảng `categories`: Lưu tên danh mục lớn (ví dụ: Phòng khách, Phòng ngủ, Phòng ăn).
* **[type.model.js](file:///e:/furniture-store-api/backend/src/models/type.model.js)**:
  * Bảng `types`: Lưu các loại sản phẩm cụ thể (ví dụ: Bàn trà, Ghế đôn, Giường ngủ).
* **[style.model.js](file:///e:/furniture-store-api/backend/src/models/style.model.js)**:
  * Bảng `styles`: Lưu các phong cách nội thất (ví dụ: Hiện đại, Cổ điển, Tối giản, Bắc Âu).
* **[segment.model.js](file:///e:/furniture-store-api/backend/src/models/segment.model.js)**:
  * Bảng `segments`: Lưu phân khúc thị trường (ví dụ: Bình dân, Trung cấp, Cao cấp).
* **[order.model.js](file:///e:/furniture-store-api/backend/src/models/order.model.js)**:
  * Bảng `orders`: Lưu thông tin chung của đơn hàng gồm `userId`, tổng tiền (`totalAmount`), trạng thái (`status` - Đang xử lý, Đang giao, Đã giao, Đã hủy), tên người nhận, địa chỉ, số điện thoại, phương thức thanh toán.
* **[orderItem.model.js](file:///e:/furniture-store-api/backend/src/models/orderItem.model.js)**:
  * Bảng `order_items`: Lưu chi tiết các sản phẩm trong mỗi đơn hàng (liên kết `orderId`, `productId`, lưu số lượng `quantity` và giá `price` tại thời điểm mua).
* **[transaction.model.js](file:///e:/furniture-store-api/backend/src/models/transaction.model.js)**:
  * Bảng `transactions`: Ghi lại lịch sử giao dịch ví của user (Nạp tiền, thanh toán mua đồ, hoàn tiền kèm số tiền và lý do cụ thể).

---

### 4. Thư mục Xử lý Logic Nghiệp vụ `/backend/src/controllers`
* **[auth.controller.js](file:///e:/furniture-store-api/backend/src/controllers/auth.controller.js)**:
  * Hàm `register`: Đăng ký tài khoản mới, mã hóa mật khẩu bằng `bcrypt.hash()` trước khi lưu.
  * Hàm `login`: Tìm user, kiểm tra mật khẩu bằng `bcrypt.compare()`, ký và trả về mã JWT token chứa thông tin của người dùng.
* **[product.controller.js](file:///e:/furniture-store-api/backend/src/controllers/product.controller.js)**:
  * Lấy danh sách sản phẩm kèm bộ lọc nâng cao (lọc theo danh mục, loại, phong cách, phân khúc giá, thanh tìm kiếm từ khóa, sắp xếp giá).
  * Lấy thông tin chi tiết một sản phẩm theo ID.
  * CRUD sản phẩm dành cho admin (tạo mới, cập nhật, xóa).
* **[category.controller.js](file:///e:/furniture-store-api/backend/src/controllers/category.controller.js)**:
  * CRUD danh mục: Lấy danh sách, tạo mới, sửa tên, và xóa danh mục sản phẩm.
* **[order.controller.js](file:///e:/furniture-store-api/backend/src/controllers/order.controller.js)**:
  * `createOrder`: Xử lý đặt hàng (trừ tiền trong ví người dùng, kiểm tra và trừ tồn kho sản phẩm, tạo bản ghi `orders` và `order_items`).
  * `getMyOrders`: Lấy lịch sử đơn hàng của người dùng đang đăng nhập.
  * `updateStatus`: Cập nhật trạng thái đơn hàng (Duyệt đơn, Đang giao, Đã giao, Hủy đơn - tự động hoàn tiền vào ví nếu đơn đã thanh toán trước đó).
  * `getRevenueStats`: Tính toán thống kê doanh thu, đơn hàng, khách hàng phục vụ cho biểu đồ Admin Dashboard.
* **[user.controller.js](file:///e:/furniture-store-api/backend/src/controllers/user.controller.js)**:
  * `getProfile`: Trả về thông tin cá nhân và số dư ví của user đang đăng nhập.
  * `deposit`: Thực hiện nạp tiền ảo vào ví của người dùng.
  * `getAllUsers` / `updateRole` / `deleteUser`: Quản lý danh sách thành viên dành cho admin.
* **[type.controller.js](file:///e:/furniture-store-api/backend/src/controllers/type.controller.js)**, **[style.controller.js](file:///e:/furniture-store-api/backend/src/controllers/style.controller.js)**, **[segment.controller.js](file:///e:/furniture-store-api/backend/src/controllers/segment.controller.js)**:
  * Quản lý CRUD cho các thuộc tính bổ trợ (Loại, Phong cách, Phân khúc).

---

### 5. Thư mục Middleware Trung gian `/backend/src/middleware`
* **[auth.middleware.js](file:///e:/furniture-store-api/backend/src/middleware/auth.middleware.js)**:
  * Lấy token JWT từ Header của request. Nếu hợp lệ, giải mã token bằng `jwt.verify()` và gán payload vào `req.user` để các controller phía sau sử dụng. Ngược lại, trả về mã lỗi `401 Unauthorized`.
* **[admin.middleware.js](file:///e:/furniture-store-api/backend/src/middleware/admin.middleware.js)**:
  * Kiểm tra vai trò của người dùng (`req.user.role`). Chỉ cho phép đi tiếp nếu vai trò là `admin` hoặc `staff`, nếu không sẽ trả về mã lỗi `403 Forbidden`.

---

### 6. Thư mục Định tuyến API `/backend/src/routes`
Ánh xạ các HTTP Method và URL endpoint tới các hàm controller tương ứng:
* **[auth.routes.js](file:///e:/furniture-store-api/backend/src/routes/auth.routes.js)**: Các route đăng ký `/register` và đăng nhập `/login`.
* **[product.routes.js](file:///e:/furniture-store-api/backend/src/routes/product.routes.js)**: Routes cho sản phẩm (phân quyền xem tự do, chỉ Admin mới có quyền POST/PUT/DELETE).
* **[category.routes.js](file:///e:/furniture-store-api/backend/src/routes/category.routes.js)**: Quản lý danh mục.
* **[order.routes.js](file:///e:/furniture-store-api/backend/src/routes/order.routes.js)**: Đặt hàng, xem đơn cá nhân (cần auth), thống kê doanh thu và duyệt đơn (cần admin).
* **[user.routes.js](file:///e:/furniture-store-api/backend/src/routes/user.routes.js)**: Các route cá nhân, nạp tiền ví và quản lý user.
* **[type.routes.js](file:///e:/furniture-store-api/backend/src/routes/type.routes.js)**, **[style.routes.js](file:///e:/furniture-store-api/backend/src/routes/style.routes.js)**, **[segment.routes.js](file:///e:/furniture-store-api/backend/src/routes/segment.routes.js)**: Các route cho thuộc tính.

---
---

## II. PHÂN HỆ FRONTEND (Thư mục `/frontend`)

Frontend là ứng dụng Single Page Application (SPA) viết bằng **React**, giao tiếp với Backend thông qua các HTTP request sử dụng thư viện **Axios**.

### 1. Các file cấu hình cốt lõi (`/frontend/src`)
* **[index.js](file:///e:/furniture-store-api/frontend/src/index.js)**:
  * Điểm khởi đầu của ứng dụng React. Bọc component `<App />` bên trong các Context Provider (`AuthProvider`, `CartProvider`) để chia sẻ trạng thái đăng nhập và giỏ hàng toàn ứng dụng.
* **[App.js](file:///e:/furniture-store-api/frontend/src/App.js)**:
  * Cấu hình định tuyến (`react-router-dom`) chuyển đổi giữa các trang.
  * Hiển thị `<Navbar />` ở đầu trang và `<Footer />` ở cuối trang trên mọi góc nhìn giao diện.
* **[index.css](file:///e:/furniture-store-api/frontend/src/index.css)**:
  * File CSS tùy biến chứa toàn bộ hệ thống phong cách của Luxe Furnish (color tokens, typography, layout grid, animation, styles cho thẻ sản phẩm, nút bấm, form đăng nhập, dashboard...).

---

### 2. Quản lý trạng thái `/frontend/src/context`
* **[AuthContext.js](file:///e:/furniture-store-api/frontend/src/context/AuthContext.js)**:
  * Quản lý trạng thái người dùng đăng nhập (`user`, `token`).
  * Tự động lấy token từ `localStorage` khi khởi chạy, giải mã payload JWT để nạp thông tin user.
  * Cung cấp hàm `login` (lưu token mới vào `localStorage`) và `logout` (xóa token khỏi `localStorage`).
* **[CartContext.js](file:///e:/furniture-store-api/frontend/src/context/CartContext.js)**:
  * Quản lý mảng giỏ hàng (`cartItems`).
  * Cung cấp các chức năng: `addToCart` (thêm sản phẩm/tăng số lượng), `removeFromCart` (xóa mặt hàng), `updateQuantity` (sửa số lượng trực tiếp), `clearCart` (dọn sạch giỏ khi mua xong).
  * Tự động lưu và đồng bộ giỏ hàng với `localStorage` để không bị mất khi reload trang.

---

### 3. Thành phần giao diện dùng chung `/frontend/src/components`
* **[Navbar.js](file:///e:/furniture-store-api/frontend/src/components/Navbar.js)**:
  * Thanh điều hướng trên cùng của website.
  * Hiển thị các trang chính, thanh tìm kiếm nhanh, icon giỏ hàng kèm số lượng sản phẩm.
  * Tự động thay đổi nội dung dựa trên trạng thái đăng nhập: hiển thị nút Đăng nhập/Đăng ký hoặc menu cá nhân (Ví tiền, Đơn hàng, Trang Admin cho quản trị viên, nút Đăng xuất).
* **[Footer.js](file:///e:/furniture-store-api/frontend/src/components/Footer.js)**:
  * Chân trang chứa thông tin liên hệ, logo Luxe Furnish, địa chỉ showroom và các đường link mạng xã hội.
* **[Hero.js](file:///e:/furniture-store-api/frontend/src/components/Hero.js)** & **[HeroSlider.js](file:///e:/furniture-store-api/frontend/src/components/HeroSlider.js)**:
  * Banner động trang chủ giúp tạo ấn tượng thị giác đầu tiên về các phong cách nội thất cao cấp.
* **[CategoryList.js](file:///e:/furniture-store-api/frontend/src/components/CategoryList.js)**:
  * Hiển thị danh sách các danh mục sản phẩm (phòng khách, phòng ngủ...) dưới dạng lưới hình ảnh đẹp mắt để người dùng nhấn vào xem nhanh.
* **[ProductList.js](file:///e:/furniture-store-api/frontend/src/components/ProductList.js)**:
  * Render danh sách thẻ sản phẩm (Product Cards) gồm ảnh, tên, giá gốc, giá khuyến mãi và nút thêm vào giỏ nhanh.
* **[AboutSection.js](file:///e:/furniture-store-api/frontend/src/components/AboutSection.js)**:
  * Khối thông tin giới thiệu về tôn chỉ hoạt động, chất lượng sản phẩm và chính sách bảo hành của Luxe Furnish.

---

### 4. Các trang chức năng chính `/frontend/src/pages`
* **[Home.js](file:///e:/furniture-store-api/frontend/src/pages/Home.js)**:
  * Giao diện trang chủ kết hợp Slider, danh mục gợi ý, khối giới thiệu và hiển thị các sản phẩm bán chạy nhất.
* **[Products.js](file:///e:/furniture-store-api/frontend/src/pages/Products.js)**:
  * Trang cửa hàng. Cung cấp bộ lọc nâng cao ở thanh bên (sidebar): lọc theo danh mục, loại sản phẩm, phong cách, phân khúc giá và sắp xếp giá cả linh hoạt.
* **[ProductDetail.js](file:///e:/furniture-store-api/frontend/src/pages/ProductDetail.js)**:
  * Hiển thị hình ảnh kích thước lớn, thông tin chi tiết về kích thước, màu sắc, chất liệu, mô tả sản phẩm và nút thêm vào giỏ hàng.
* **[Cart.js](file:///e:/furniture-store-api/frontend/src/pages/Cart.js)**:
  * Giao diện giỏ hàng: cho phép tăng giảm số lượng, xóa sản phẩm, hiển thị tổng tiền cần thanh toán.
  * Tích hợp form điền thông tin đặt hàng (Tên, SĐT, Địa chỉ giao hàng) và thực hiện thanh toán trực tiếp qua ví tài khoản.
* **[Login.js](file:///e:/furniture-store-api/frontend/src/pages/Login.js)** & **[Register.js](file:///e:/furniture-store-api/frontend/src/pages/Register.js)**:
  * Form điền thông tin đăng nhập và đăng ký người dùng mới.
* **[Profile.js](file:///e:/furniture-store-api/frontend/src/pages/Profile.js)**:
  * Hiển thị thông tin cá nhân và số dư ví điện tử của người dùng.
* **[Wallet.js](file:///e:/furniture-store-api/frontend/src/pages/Wallet.js)**:
  * Giao diện quản lý ví: hiển thị số dư, lịch sử giao dịch nạp/tiêu tiền, và giả lập nạp tiền vào ví.
* **[Address.js](file:///e:/furniture-store-api/frontend/src/pages/Address.js)**:
  * Quản lý và lưu trữ thông tin địa chỉ giao hàng mặc định của khách hàng.
* **[History.js](file:///e:/furniture-store-api/frontend/src/pages/History.js)**:
  * Danh sách đơn hàng người dùng đã mua kèm chi tiết từng sản phẩm và trạng thái giao hàng thực tế.
* **[AdminDashboard.js](file:///e:/furniture-store-api/frontend/src/pages/AdminDashboard.js)**:
  * Bảng điều khiển admin tổng hợp tất cả chức năng quản lý:
    * Thống kê tổng số đơn, doanh thu dạng số liệu trực quan.
    * Quản lý sản phẩm (thêm mới kèm các thuộc tính chọn sẵn, sửa thông tin, xóa sản phẩm).
    * Quản lý đơn hàng (phê duyệt trạng thái đơn hàng: Đang xử lý -> Đang giao -> Đã giao hoặc Hủy đơn).
    * Quản lý người dùng (phân quyền Admin/Staff hoặc Customer, xóa người dùng).
    * Quản lý danh mục, loại sản phẩm, phong cách, phân khúc.
* **[Categories.js](file:///e:/furniture-store-api/frontend/src/pages/Categories.js)**:
  * Trang quản trị danh mục sản phẩm dành riêng cho quản trị viên.
* **[Search.js](file:///e:/furniture-store-api/frontend/src/pages/Search.js)**:
  * Trang hiển thị kết quả tìm kiếm các sản phẩm theo từ khóa nhập từ Navbar.

