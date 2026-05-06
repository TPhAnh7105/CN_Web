# ĐẶC TẢ BÀI TOÁN
Xây dựng hệ thống website quản lý cửa hàng đồ nội thất
## 1. Mô tả bài toán
Cửa hàng bán nội thất không chỉ là nơi cung cấp các sản phẩm nội thất,mà còn là không gian để khách hàng trải nghiệm, tìm kiếm ý tưởng trang trí và lựa chọn phong cách sống phù hợp. Tùy theo quy mô và định hướng kinh doanh, các cửa hàng nội thất có thể nhắm đến nhiều nhóm khách hàng khác nhau như hộ gia đình, văn phòng, nhà hàng – khách sạn hay các công trình dự án.

## 2. Bối cảnh bài toán
Thị trường kinh doanh đồ nội thất hiện nay đang chứng kiến sự chuyển dịch mạnh mẽ từ mua sắm truyền thống sang thương mại điện tử. Tuy nhiên, các cửa hàng bán lẻ truyền thống gặp một số vấn đề:
* **Giới hạn tiếp cận:** Hệ thống thủ công chỉ phục vụ được khách hàng trong một khu vực nhất định.
* **Trải nghiệm mua sắm khó khăn:** Khách hàng gặp khó trong việc tra cứu thông tin chi tiết, kích thước, chất liệu, hoặc so sánh giá cả trước khi quyết định mua.
* **Quản lý thủ công:** Việc kiểm soát hàng hóa đồ nội thất , theo dõi đơn hàng và doanh thu thường mất thời gian và dễ sai sót.
Do đó, việc xây dựng website quản lý và bán hàng trực tuyến là giải pháp bắt buộc để cửa hàng nâng cao năng lực cạnh tranh và tối ưu hóa vận hành.

## 3. Mục tiêu bài toán

### 3.1. Mục tiêu tổng quát
Xây dựng một hệ thống phần mềm với giao diện dễ sử dụng, linh hoạt, tốc độ phản hồi nhanh giúp mở rộng thị trường tiếp cận khách hàng trên Internet và tự động hóa các khâu quản lý nội bộ.

### 3.2. Mục tiêu cụ thể
* Cung cấp trải nghiệm trực tuyến liền mạch, dễ dàng tìm kiếm, xem chi tiết và thanh toán cho khách hàng.
* Khuyến khích mua sắm qua các tính năng tiện lợi, mã giảm giá, flash sale để tăng trưởng doanh thu.
* Cung cấp giao diện quản lý trực quan cho quản trị viên để dễ dàng quản lý sản phẩm, theo dõi tồn kho, xử lý đơn hàng tự động.
* Tạo dựng sự chuyên nghiệp và uy tín cho hình ảnh thương hiệu.

## 4. Phát biểu bài toán
Cho trước một tập dữ liệu về các sản phẩm nội thất, mỗi sản phẩm bao gồm các thuộc tính như tên, danh mục , kích thước, màu sắc, chất liệu và giá bán. 

Yêu cầu đặt ra là xây dựng một hệ thống có khả năng lưu trữ lượng dữ liệu, hiển thị chúng trực quan lên website để khách hàng dễ dàng tra cứu, lọc và đặt mua. Đồng thời, hệ thống phải phân quyền rõ ràng để quản trị viên có thể kiểm soát toàn bộ vòng đời của sản phẩm từ khi nhập kho đến khi giao cho khách hàng.

## 5. Đối tượng của bài toán

### 5.1. Đối tượng dữ liệu
Dữ liệu đầu vào của hệ thống bao gồm:
* Thông tin sản phẩm: Tên, giá, hình ảnh, thông số kỹ thuật .
* Thông tin danh mục: Phòng khách, Phòng ngủ, Bếp, Sofa, Bàn ghế...
* Thông tin giao dịch: Đơn hàng, giỏ hàng, mã giảm giá.

### 5.2. Đối tượng sử dụng hệ thống
* **Khách hàng :** Người truy cập website để xem và mua đồ nội thất.
* **Quản trị viên/Nhân viên :** Người quản lý cửa hàng, xử lý đơn hàng, cập nhật kho.

## 6. Đầu vào của bài toán
Đầu vào của hệ thống bao gồm:
* Dữ liệu sản phẩm nội thất do chủ cửa hàng hoặc nhà cung cấp tải lên.
* Thông tin hồ sơ và địa chỉ giao hàng do khách hàng cung cấp khi đăng ký/thanh toán.
* Dữ liệu phiếu nhập kho thực tế của cửa hàng.

## 7. Đầu ra của bài toán
Hệ thống cần tạo ra các đầu ra sau:
* Danh sách sản phẩm nội thất được phân loại rõ ràng hiển thị trên web.
* Kết quả tra cứu sản phẩm dựa trên bộ lọc nâng cao.
* Hóa đơn điện tử và trạng thái đơn hàng.
* Biểu đồ thống kê doanh thu, sản phẩm bán chạy, cảnh báo sắp hết hàng cho Admin.

## 8. Yêu cầu chức năng

### 8.1. Chức năng phân hệ Khách hàng
* **Danh mục & Tìm kiếm:** Xem danh sách theo phòng/loại nội thất, lọc nâng cao , tìm theo từ khóa.
* **Chi tiết & Mua sắm:** Xem hình ảnh, thông số kỹ thuật, đánh giá; quản lý giỏ hàng .
* **Thanh toán & Theo dõi:** Nhập thông tin giao hàng, chọn phương thức thanh toán, xem lịch sử trạng thái đơn hàng.

### 8.2. Chức năng phân hệ Quản trị viên
* **Tổng quan:** Xem biểu đồ doanh thu, số lượng đơn, sản phẩm bán chạy.
* **Quản lý Danh mục & Sản phẩm:** Thêm, sửa, xóa sản phẩm và các thuộc tính liên quan.
* **Quản lý Kho & Đơn hàng:** Theo dõi tồn kho, duyệt đơn, giao vận chuyển, hủy đơn, nhập kho.

## 9. Yêu cầu phi chức năng

### 9.1. Về giao diện và Trải nghiệm

### 9.2. Về hiệu suất

### 9.3. Về bảo mật


## 10. Phạm vi bài toán

### 10.1. Phạm vi thực hiện


### 10.2. Phạm vi chưa thực hiện

