## 📋 BỔ SUNG TRANG FE - AGRICULTURAL SUPPLY CHAIN TRACEABILITY SYSTEM

### ✅ TỔNG QUAN CÁC TRANG ĐÃ BỔ SUNG

---

## 🎯 1. FEATURE: EVENTS (Quản lý Sự kiện Chuỗi cung ứng)

### 📄 EventsPage.tsx (`/events`)
- **Mô tả:** Danh sách tất cả sự kiện của các lô hàng
- **Chức năng:**
  - Hiển thị bảng danh sách sự kiện (Batch ID, Event Type, Mô tả, Vị trí, Thời gian, Trạng thái)
  - Phân trang
  - Nút xem chi tiết sự kiện
- **Notes:** Dữ liệu mock, sẵn sàng kết nối API

### 📄 CreateEventPage.tsx (`/events/new`)
- **Mô tả:** Tạo sự kiện mới cho lô hàng
- **Chức năng:**
  - Form nhập: Mã lô, Loại sự kiện (Harvest, Processing, Packaging, Transport, Distribution, Retail)
  - Ghi nhận vị trí, nhiệt độ, độ ẩm
  - Thêm ghi chú chi tiết
  - Lưu dữ liệu
- **Notes:** Bao gồm các loại sự kiện cho chuỗi cung ứng nông sản

### 📄 EventDetailPage.tsx (`/events/:eventId`)
- **Mô tả:** Chi tiết sự kiện - Xem toàn bộ thông tin sự kiện
- **Chức năng:**
  - Hiển thị thông tin cơ bản (Timestamp, Vị trí, Actor, Trạng thái)
  - Hiển thị điều kiện lưu bảo (Nhiệt độ, Độ ẩm)
  - **Xác thực Hash Chain:** Hiển thị `previousHash` và `currentHash` để kiểm tra tính toàn vẹn dữ liệu
- **Notes:** Triển khai cơ chế Blockchain-lite theo yêu cầu đề tài

---

## 🎯 2. FEATURE: PRODUCTS (Quản lý Sản phẩm)

### 📄 ProductsPage.tsx (`/products`)
- **Mô tả:** Danh sách các loại sản phẩm nông sản
- **Chức năng:**
  - Hiển thị bảng danh sách: Tên sản phẩm, Loại, Chứng nhận, Trạng thái
  - Tìm kiếm sản phẩm
  - Nút thêm sản phẩm mới
  - Nút xem chi tiết

### 📄 CreateProductPage.tsx (`/products/new`)
- **Mô tả:** Thêm loại sản phẩm mới
- **Chức năng:**
  - Form nhập: Tên sản phẩm, Loại (Trái cây, Rau xanh, Lúa gạo, Sữa, Thịt...)
  - Chọn đơn vị (kg, tấn, cái, lít, chục)
  - Chọn chứng nhận: VietGAP, GlobalGAP, Organic, Fair Trade, ISO 22000
  - Thêm mô tả
- **Notes:** Hỗ trợ nhiều chứng nhận

### 📄 ProductDetailPage.tsx (`/products/:productId`)
- **Mô tả:** Chi tiết sản phẩm
- **Chức năng:**
  - Thông tin cơ bản (Tên, Loại, Đơn vị, Ngày tạo)
  - Danh sách chứng nhận
  - Bảng lô hàng gần đây của sản phẩm này (Mã lô, Số lượng, Ngày thu hoạch, Trạng thái)
- **Notes:** Kết nối giữa sản phẩm và các lô hàng

---

## 🎯 3. FEATURE: QUALITY (Kiểm định Chất lượng)

### 📄 QualityInspectionsPage.tsx (`/quality`)
- **Mô tả:** Danh sách kiểm định chất lượng
- **Chức náng:**
  - Hiển thị bảng: Mã kiểm định, Mã lô, Ngày, Người kiểm định, Kết quả (Pass/Fail)
  - Tìm kiếm theo mã lô
  - Nút tạo kiểm định mới
  - Nút xem chi tiết
- **Notes:** Quản lý QA cho chuỗi cung ứng

### 📄 CreateInspectionPage.tsx (`/quality/new`)
- **Mô tả:** Ghi nhận kiểm định chất lượng mới
- **Chức năng:**
  - Form nhập: Mã lô, Ngày kiểm định
  - Danh sách tiêu chí kiểm định (checkbox):
    - Độ tươi
    - Màu sắc
    - Mức độ tổn thương
    - Hàm lượng thuốc trừ sâu
    - Vi khuẩn Coliform
  - Chọn kết quả: Đạt chuẩn / Không đạt / Có điều kiện
  - Thêm ghi chú/khuyến cáo
- **Notes:** Tuân thủ tiêu chuẩn chất lượng nông sản

### 📄 InspectionDetailPage.tsx (`/quality/:inspectionId`)
- **Mô tả:** Chi tiết kết quả kiểm định
- **Chức năng:**
  - Hiển thị thông tin cơ bản (Ngày, Người kiểm định, Mã kiểm định)
  - Tóm tắt kết quả: Số tiêu chí đạt / Tổng tiêu chí, Tỷ lệ %
  - Chi tiết từng tiêu chí (Đạt/Không đạt) với icon trực quan
  - Ghi chú và khuyến cáo
- **Notes:** Hiển thị rõ ràng, dễ kiểm tra cho người tiêu dùng

---

## 🎯 4. FEATURE: RECALLS (Quản lý Thu hồi Sản phẩm)

### 📄 RecallsPage.tsx (`/recalls`)
- **Mô tả:** Danh sách các yêu cầu thu hồi sản phẩm
- **Chức năng:**
  - Hiển thị bảng: Mã Recall, Mã lô, Sản phẩm, Lý do, Mức độ, Trạng thái, Số lô bị ảnh hưởng
  - Icon cảnh báo trong header
  - Nút phát hành Recall mới (variant="destructive")
  - Nút xem chi tiết
- **Notes:** Giao diện cảnh báo rõ ràng cho vấn đề an toàn

### 📄 CreateRecallPage.tsx (`/recalls/new`)
- **Mô tả:** Phát hành yêu cầu thu hồi mới
- **Chức năng:**
  - **Cảnh báo header:** Nhắc nhở tác động của hành động này
  - Form nhập:
    - Mã lô chính, Tên sản phẩm
    - Mức độ (Cao - Nguy hiểm tính mạng, Trung bình, Thấp)
    - Lý do: Phát hiện vi khuẩn, Nhiễm hóa chất, Dị ứng, Vật lạ, Nấm độc, Lỗi bao bì
    - Mô tả chi tiết sự cố
    - Hành động khắc phục / Khuyến cáo
  - **Auto Traceback:** Hệ thống tự động truy vết ngược tìm lô bị ảnh hưởng
  - **Auto Notification:** Gửi thông báo tới tất cả Actor
- **Notes:** Kích hoạt cơ chế truy vết ngược và lan truyền cảnh báo theo đề tài

### 📄 RecallDetailPage.tsx (`/recalls/:recallId`)
- **Mô tả:** Chi tiết yêu cầu thu hồi
- **Chức năng:**
  - Header với indicator mức độ nguy hiểm
  - Thông tin recall: Mã, Mã lô, Lý do, Mô tả, Hành động khắc phục
  - **Danh sách lô bị ảnh hưởng:** Kết quả traceback
  - **Tình trạng thông báo:** Số actor được thông báo, số đã xác nhận
  - **Bảng chi tiết notification:** Danh sách Actor, Vai trò, Thời gian thông báo, Trạng thái xác nhận
- **Notes:** Hoàn chỉnh quy trình recall theo yêu cầu đề tài

---

## 🎯 5. FEATURE: PUBLIC TRACE PORTAL (Tra cứu Công khai)

### 📄 TracePublicPage.tsx (`/trace/:batchId`)
- **Mô tả:** Trang tra cứu công khai cho Consumer (không cần login)
- **Đặc điểm:**
  - **Mobile-first design:** Tối ưu giao diện cho điện thoại
  - **Gradient background:** Thiết kế hiện đại, dễ chịu
  - **Không cần xác thực:** Người tiêu dùng truy cập qua mã QR
  
- **Chức năng:**
  - **Product Header:**
    - Tên sản phẩm, Loại, Mã lô
    - Badge chứng nhận (VietGAP, Organic...)
    - Cảnh báo Recall nếu có
  
  - **Thông tin Nguồn gốc:**
    - Địa điểm sản xuất (Nông trại, Địa chỉ, Tọa độ GPS)
    - Ngày thu hoạch
  
  - **Timeline Chuỗi cung ứng (Vertical Layout):**
    - Icon biểu thị sự kiện: 🌾 (Thu hoạch) → ✓ (Kiểm định) → 📦 (Đóng gói) → 🚚 (Vận chuyển) → 🏢 (Phân phối) → 🛒 (Bán lẻ)
    - Mỗi sự kiện:
      - Tên sự kiện, Mô tả chi tiết
      - Ngày giờ, Vị trí, Actor
      - Kết quả (Đạt chuẩn), Nhiệt độ bảo quản (nếu có)
  
  - **Cảnh báo Recall:** Hiển thị nếu sản phẩm bị recall với hướng dẫn xử lý
  
  - **Xác thực Tính toàn vẹn (Data Integrity):**
    - Thông tin về Hash Chain verification
    - Giải thích tầm quan trọng của blockchain-like technology
  
  - **Footer:** Thông tin hệ thống

- **Notes:** 
  - Tương ứng yêu cầu "Tra cứu Công khai" trong đề tài
  - Người tiêu dùng có thể quét QR code với điện thoại để xem lịch sử sản phẩm
  - Không hiển thị thông tin nhạy cảm (chỉ thông tin công khai)

---

## 🔧 CẬP NHẬT ROUTER.TSX

### Các lazy import được thêm:
```typescript
// Events
const EventsPage = lazyPage(...)
const CreateEventPage = lazyPage(...)
const EventDetailPage = lazyPage(...)

// Products
const ProductsPage = lazyPage(...)
const CreateProductPage = lazyPage(...)
const ProductDetailPage = lazyPage(...)

// Quality
const QualityInspectionsPage = lazyPage(...)
const CreateInspectionPage = lazyPage(...)
const InspectionDetailPage = lazyPage(...)

// Recalls
const RecallsPage = lazyPage(...)
const CreateRecallPage = lazyPage(...)
const RecallDetailPage = lazyPage(...)

// Public Trace
const TracePublicPage = lazyPage(...)
```

### Routes được thêm (trong Farmer routes):
```
/events              → EventsPage
/events/new          → CreateEventPage
/events/:eventId     → EventDetailPage

/products            → ProductsPage
/products/new        → CreateProductPage
/products/:productId → ProductDetailPage

/quality             → QualityInspectionsPage
/quality/new         → CreateInspectionPage
/quality/:inspectionId → InspectionDetailPage

/recalls             → RecallsPage
/recalls/new         → CreateRecallPage
/recalls/:recallId   → RecallDetailPage
```

### Public Routes (No authentication):
```
/trace/:batchId      → TracePublicPage (Công khai cho Consumer)
```

---

## ✅ TIÊU CHÍ ĐẶC BIỆT

### ✔️ Hash Chain Implementation
- Mỗi EventDetailPage hiển thị `previousHash` và `currentHash`
- Giải thích tính năng xác thực toàn vẹn dữ liệu
- Phòng chống giả mạo / sửa đổi dữ liệu

### ✔️ Traceback & Recall Propagation
- CreateRecallPage kích hoạt tìm kiếm tất cả lô bị ảnh hưởng
- RecallDetailPage hiển thị danh sách lô và Actor được thông báo
- Hỗ trợ cơ chế notification tự động

### ✔️ Mobile-First Public Portal
- TracePublicPage tối ưu cho thiết bị di động
- Timeline timeline rõ ràng, trực quan
- Không cần xác thực, công khai minh bạch

### ✔️ Dữ liệu Mock & Ready for API
- Tất cả components đều sử dụng `useQuery` từ React Query
- Chỉ cần thay thế `queryFn` bằng API call thực tế
- Structure dữ liệu mock tương ứng với yêu cầu backend

---

## 📌 GHI CHÚ QUAN TRỌNG

1. **Không xóa code cũ:** Tất cả bổ sung đều được đánh dấu `/* NEW CODE ... */` và `/* END NEW CODE */`
2. **Comment rõ ràng:** Mỗi file có comment mô tả chức năng và lưu ý
3. **Cấu trúc đồng bộ:** Tất cả pages tuân theo pattern tương tự
4. **Ready for integration:** Có thể dễ dàng kết nối với API backend .NET
5. **UI Components:** Sử dụng các component UI đã định nghĩa (Button, Card, Badge, Input, Table, etc.)

---

**Tác giả:** GitHub Copilot  
**Ngày:** 2026-08-13  
**Dự án:** Agricultural Supply Chain Traceability System - FE Enhancement
