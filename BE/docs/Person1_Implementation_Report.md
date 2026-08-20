# Báo cáo Triển khai Backend — Người 1: Master Auth, Quản trị Tổ chức & Sản phẩm

**Dự án:** Hệ thống Truy xuất Nguồn gốc Nông sản (Agricultural Supply Chain Traceability System)  
**Phiên bản:** 2.0  
**Tác giả:** Người 1 (Foundation & Core Setup)  
**Ngày thực hiện:** 20/08/2026  
**Backend API Base URL:** `http://localhost:5103/api/v1`  
**Database SQL Server:** `20.24.211.6,1433` (`AgriTraceabilityDB`)  

---

## 1. Tổng quan Kiến trúc & Nền tảng (Foundation Setup)

### 1.1. Base Framework Clean Architecture
Backend được thiết kế theo đúng chuẩn **Clean Architecture**:
- **`AgriTrace.Domain`**: Định nghĩa Entities (`User`, `Organization`, `Product`, `Batch`, `SupplyChainEvent`), Interfaces Repository (`IUserRepository`, `IOrganizationRepository`, `IProductRepository`), DTO Contracts.
- **`AgriTrace.Application`**: Xử lý logic nghiệp vụ qua mẫu thiết kế **CQRS (MediatR)**.
- **`AgriTrace.Infrastructure.Sqlserver`**: Cấu hình EF Core DbContext, Auto-scan Entities, triển khai Repositories tương tác SQL Server.
- **`AgriTrace.API`**: Expose Controllers RESTful, tích hợp JWT Authentication, Swagger OpenAPI, Global Exception Handler & Response Envelope.

### 1.2. Chuẩn hóa Response Envelope (§1.2 API Specification)
Mọi response trả về cho Client đều được đóng gói theo dạng Envelope đồng nhất:

```json
{
  "success": true,
  "data": { ... },
  "message": "Đăng nhập thành công",
  "errors": null,
  "timestamp": "2026-08-20T10:23:11.542683Z"
}
```

### 1.3. Cơ sở dữ liệu V2.0 & Seed Data
Đã reset hoàn toàn cơ sở dữ liệu trên máy chủ SQL Server và khôi phục 11 bảng chuẩn theo `Database.sql` & `Data`:
- `Organizations`: 10 tổ chức
- `Users`: 12 người dùng
- `Products`: 9 sản phẩm
- `Batches`: 10 lô hàng
- `SupplyChainEvents`: 19 sự kiện chuỗi cung ứng
- `BatchImages`: 9 hình ảnh
- `Inspections`: 7 lượt kiểm định
- `Certificates`: 6 chứng nhận
- `Recalls`: 1 vụ thu hồi
- `Notifications`: 7 thông báo
- `BatchRelations`: 2 quan hệ tách/gộp

---

## 2. Danh sách 20 APIs thuộc phạm vi Người 1

### 2.1. Module Auth & IAM (Mục 3)
1. **`POST /api/v1/auth/login`**: Đăng nhập tài khoản bằng `email` & `password`. Trả về JWT Access Token (hạn 1h) và Refresh Token (hạn 7d).
2. **`POST /api/v1/auth/refresh-token`**: Cấp lại Access Token mới khi token cũ hết hạn (Token Rotation).
3. **`POST /api/v1/auth/logout`**: Vô hiệu hóa Refresh Token của người dùng.
4. **`GET /api/v1/auth/me`**: Trả về chi tiết thông tin người dùng đang đăng nhập (kèm Tổ chức & Vai trò).
5. **`PUT /api/v1/auth/change-password`**: Đổi mật khẩu tài khoản.

### 2.2. Module Organizations (Mục 4)
6. **`GET /api/v1/organizations`**: Lấy danh sách tổ chức có phân trang (`page`, `pageSize`, `type`, `status`, `search`). Require Role: `ADMIN`.
7. **`GET /api/v1/organizations/{id}`**: Lấy chi tiết thông tin tổ chức. Require Role: `ADMIN`, `ORGADMIN`.
8. **`POST /api/v1/organizations`**: Tạo mới tổ chức (FARM, PROCESSOR, DISTRIBUTOR, RETAILER). Require Role: `ADMIN`.
9. **`PUT /api/v1/organizations/{id}`**: Cập nhật thông tin tổ chức. Require Role: `ADMIN`.
10. **`PATCH /api/v1/organizations/{id}/status`**: Cập nhật trạng thái tổ chức (`ACTIVE`, `INACTIVE`, `SUSPENDED`). Require Role: `ADMIN`.

### 2.3. Module Users (Mục 5)
11. **`GET /api/v1/users`**: Lấy danh sách người dùng có phân trang (`organizationId`, `role`, `isActive`, `search`, `page`, `pageSize`). Require Role: `ADMIN`, `ORGADMIN`.
12. **`GET /api/v1/users/{id}`**: Chi tiết thông tin người dùng.
13. **`POST /api/v1/users`**: Tạo người dùng mới trong hệ thống/tổ chức. Require Role: `ADMIN`, `ORGADMIN`.
14. **`PUT /api/v1/users/{id}`**: Cập nhật thông tin họ tên, vai trò người dùng.
15. **`PATCH /api/v1/users/{id}/status`**: Kích hoạt (`true`) hoặc Vô hiệu hóa (`false`) tài khoản người dùng. Require Role: `ADMIN`, `ORGADMIN`.

### 2.4. Module Products (Mục 6)
16. **`GET /api/v1/products`**: Lấy danh sách sản phẩm nông sản (hỗ trợ lọc theo `organizationId`, `category`, `search`, phân trang).
17. **`GET /api/v1/products/{id}`**: Lấy chi tiết sản phẩm nông sản.
18. **`POST /api/v1/products`**: Tạo mới sản phẩm nông sản. Require Role: `ADMIN`, `ORGADMIN`.
19. **`PUT /api/v1/products/{id}`**: Cập nhật thông tin sản phẩm. Require Role: `ADMIN`, `ORGADMIN`.

### 2.5. Module Lookup / Danh mục hệ thống (Mục 17)
20. **`GET /api/v1/roles`**: Tra cứu danh sách Roles (`ADMIN`, `ORGADMIN`, `FARMER`, `OPERATOR`, `INSPECTOR`). Allow Anonymous.
21. **`GET /api/v1/organization-types`**: Tra cứu danh sách Loại tổ chức (`FARM`, `PROCESSOR`, `DISTRIBUTOR`, `RETAILER`).
22. **`GET /api/v1/event-types`**: Tra cứu các loại sự kiện chuỗi cung ứng (`HARVEST`, `PROCESS`, `PACKAGE`, `TRANSPORT`, `INSPECT`, `RECEIVE`, `SPLIT`, `MERGE`).

---

## 3. Danh sách Tài khoản Kiểm thử (Seed Test Accounts)

| Email | Password | Role | Organization |
| :--- | :--- | :---: | :--- |
| `admin@agritrace.vn` | `P@ssw0rd123` | `ADMIN` | Hệ thống Quản trị |
| `orgadmin@sonlafarm.vn` | `P@ssw0rd123` | `ORGADMIN` | Nông trại Hữu cơ Sơn La |
| `farmer@sonlafarm.vn` | `P@ssw0rd123` | `FARMER` | Nông trại Hữu cơ Sơn La |
| `operator@mocchau.vn` | `P@ssw0rd123` | `OPERATOR` | Công ty CP Chế biến Nông sản Mộc Châu |
| `inspector@agritrace.vn` | `P@ssw0rd123` | `INSPECTOR` | Cục Kiểm định Chất lượng |

---

## 4. Trạng thái Build & Run

- **Trạng thái Build**: `Build succeeded - 0 Warning(s) - 0 Error(s)`
- **Server API**: Đang chạy tại `http://localhost:5103`
- **Swagger Documentation**: `http://localhost:5103/swagger`
