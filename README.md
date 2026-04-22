# ĐẶC TẢ BÀI TOÁN

## 1. Tên bài toán
[cite_start]Xây dựng website quản lý và bán cửa hàng đồ nội thất sử dụng ReactJS[cite: 85].

## 2. Bối cảnh bài toán
[cite_start]Thị trường kinh doanh đồ nội thất hiện nay đang chứng kiến sự chuyển dịch mạnh mẽ từ mua sắm truyền thống sang thương mại điện tử[cite: 86]. Tuy nhiên, các cửa hàng bán lẻ truyền thống gặp một số vấn đề:
* [cite_start]**Giới hạn tiếp cận:** Chỉ phục vụ được khách hàng trong một khu vực địa lý nhất định[cite: 87].
* [cite_start]**Trải nghiệm mua sắm khó khăn:** Khách hàng gặp khó trong việc tra cứu thông tin chi tiết, kích thước, chất liệu, hoặc so sánh giá cả trước khi quyết định mua[cite: 88].
* [cite_start]**Quản lý thủ công:** Việc kiểm soát tồn kho đồ nội thất (vốn cồng kềnh, nhiều mẫu mã), theo dõi đơn hàng và doanh thu thường mất thời gian và dễ sai sót[cite: 89].

[cite_start]Do đó, việc xây dựng website quản lý và bán hàng trực tuyến là giải pháp bắt buộc để cửa hàng nâng cao năng lực cạnh tranh và tối ưu hóa vận hành[cite: 90].

## 3. Mục tiêu bài toán

### 3.1. Mục tiêu tổng quát
[cite_start]Xây dựng một hệ thống phần mềm với giao diện sử dụng ReactJS linh hoạt, tốc độ phản hồi nhanh giúp mở rộng thị trường tiếp cận khách hàng trên Internet và tự động hóa các khâu quản lý nội bộ[cite: 91].

### 3.2. Mục tiêu cụ thể
* [cite_start]Cung cấp trải nghiệm mua sắm trực tuyến liền mạch, dễ dàng tìm kiếm, xem chi tiết và thanh toán cho khách hàng[cite: 92].
* [cite_start]Khuyến khích mua sắm qua các tính năng tiện lợi, mã giảm giá, flash sale để tăng trưởng doanh thu[cite: 93].
* [cite_start]Cung cấp bảng điều khiển (Dashboard) trực quan cho Quản trị viên để dễ dàng quản lý sản phẩm, theo dõi tồn kho, xử lý đơn hàng tự động[cite: 94].
* [cite_start]Tạo dựng sự chuyên nghiệp và uy tín cho hình ảnh thương hiệu[cite: 95].

## 4. Phát biểu bài toán
[cite_start]Cho trước một tập dữ liệu về các sản phẩm nội thất, mỗi sản phẩm bao gồm các thuộc tính như tên, danh mục (phòng khách, phòng ngủ, bếp...), kích thước, màu sắc, chất liệu và giá bán[cite: 96]. 

[cite_start]Yêu cầu đặt ra là xây dựng một hệ thống (với giao diện người dùng bằng ReactJS) có khả năng lưu trữ lượng dữ liệu này, hiển thị chúng trực quan lên website để khách hàng dễ dàng tra cứu, lọc và đặt mua[cite: 97]. [cite_start]Đồng thời, hệ thống phải phân quyền rõ ràng để quản trị viên có thể kiểm soát toàn bộ vòng đời của sản phẩm từ khi nhập kho đến khi giao cho khách hàng[cite: 98].

## 5. Đối tượng của bài toán

### 5.1. Đối tượng dữ liệu
Dữ liệu đầu vào của hệ thống bao gồm:
* [cite_start]Thông tin sản phẩm: Tên, giá, hình ảnh, thông số kỹ thuật (kích thước, màu sắc, chất liệu)[cite: 99].
* [cite_start]Thông tin danh mục: Phòng khách, Phòng ngủ, Bếp, Sofa, Bàn ghế...[cite: 100].
* [cite_start]Thông tin giao dịch: Đơn hàng, giỏ hàng, mã giảm giá[cite: 101].

### 5.2. Đối tượng sử dụng hệ thống
* [cite_start]**Khách hàng (Customer):** Người truy cập website để xem và mua đồ nội thất[cite: 102].
* [cite_start]**Quản trị viên/Nhân viên (Admin/Staff):** Người quản lý cửa hàng, xử lý đơn hàng, cập nhật kho[cite: 103].

## 6. Đầu vào của bài toán
Đầu vào của hệ thống bao gồm:
* [cite_start]Dữ liệu sản phẩm nội thất (hình ảnh, mô tả, thông số) do chủ cửa hàng hoặc nhà cung cấp tải lên[cite: 104].
* [cite_start]Thông tin hồ sơ và địa chỉ giao hàng do khách hàng cung cấp khi đăng ký/thanh toán[cite: 105].
* [cite_start]Dữ liệu phiếu nhập kho thực tế của cửa hàng[cite: 106].

## 7. Đầu ra của bài toán
Hệ thống cần tạo ra các đầu ra sau:
* [cite_start]Danh sách sản phẩm nội thất được phân loại rõ ràng hiển thị trên web[cite: 107].
* [cite_start]Kết quả tra cứu sản phẩm dựa trên bộ lọc nâng cao (giá, chất liệu, kích thước)[cite: 108].
* [cite_start]Hóa đơn điện tử và trạng thái đơn hàng (Chờ xác nhận, Đang giao, Hoàn thành)[cite: 109].
* [cite_start]Biểu đồ thống kê doanh thu, sản phẩm bán chạy, cảnh báo sắp hết hàng cho Admin[cite: 110].

## 8. Yêu cầu chức năng

### 8.1. Chức năng phân hệ Khách hàng
* [cite_start]**Danh mục & Tìm kiếm:** Xem danh sách theo phòng/loại nội thất, lọc nâng cao (giá, chất liệu, màu sắc), tìm theo từ khóa[cite: 111].
* [cite_start]**Chi tiết & Mua sắm:** Xem hình ảnh, thông số kỹ thuật, đánh giá; quản lý giỏ hàng (thêm/sửa/xóa, tính tiền)[cite: 112, 113].
* [cite_start]**Thanh toán & Theo dõi:** Nhập thông tin giao hàng, chọn phương thức (COD, chuyển khoản), xem lịch sử trạng thái đơn hàng[cite: 113].

### 8.2. Chức năng phân hệ Quản trị viên
* [cite_start]**Tổng quan:** Xem biểu đồ doanh thu, số lượng đơn, sản phẩm bán chạy[cite: 115].
* [cite_start]**Quản lý Danh mục & Sản phẩm:** Thêm, sửa, xóa (CRUD) sản phẩm và các thuộc tính liên quan (kích thước, hình ảnh)[cite: 116].
* [cite_start]**Quản lý Kho & Đơn hàng:** Theo dõi tồn kho, duyệt đơn, giao vận chuyển, hủy đơn, nhập kho[cite: 117].

## 9. Yêu cầu phi chức năng

### 9.1. Về giao diện và Trải nghiệm
* [cite_start]**Responsive Design:** Website phải hiển thị tốt và mượt mà trên PC, Tablet và Mobile[cite: 118].
* [cite_start]Giao diện cần làm nổi bật được vẻ đẹp của các sản phẩm nội thất (sử dụng UI Framework như Tailwind CSS hoặc Ant Design)[cite: 119].

### 9.2. Về hiệu suất
* [cite_start]Do hình ảnh nội thất thường có dung lượng lớn, hệ thống cần áp dụng các kỹ thuật tối ưu hóa (Lazy loading, nén ảnh) để trang tải nhanh[cite: 120].

### 9.3. Về bảo mật
* [cite_start]Mã hóa mật khẩu, bảo mật API (JWT), chống các lỗ hổng XSS, CSRF để bảo vệ dữ liệu khách hàng[cite: 121].

## 10. Phạm vi bài toán

### 10.1. Phạm vi thực hiện
Trong giai đoạn này, dự án tập trung hoàn thiện:
* [cite_start]Frontend với ReactJS cho cả người dùng và Admin[cite: 122].
* [cite_start]Quản lý danh mục, tìm kiếm và lọc sản phẩm nội thất phức tạp[cite: 123].
* [cite_start]Quản lý giỏ hàng, quy trình thanh toán cơ bản và quản lý tồn kho[cite: 124].

### 10.2. Phạm vi chưa thực hiện (Định hướng tương lai)
* [cite_start]Chưa tích hợp công nghệ AR/VR (Thực tế ảo tăng cường) cho phép khách hàng ướm thử đồ nội thất 3D vào không gian phòng thực tế[cite: 125].
* [cite_start]Chưa xây dựng hệ thống AI tự động tư vấn, thiết kế nội thất trọn gói dựa trên bản vẽ mặt bằng nhà của khách[cite: 126].
