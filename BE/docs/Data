USE [AgriTraceabilityDB];
GO

-- =========================================================================
-- 1. SEED TỔ CHỨC (Organizations)
-- =========================================================================
SET IDENTITY_INSERT Organizations ON;

INSERT INTO Organizations (Id, Name, Type, Status, CreatedAt) VALUES
(1, N'Nông trại Hữu cơ Sơn La', 'FARM', 'ACTIVE', '2026-07-01 00:00:00'),
(2, N'Công ty CP Chế biến Nông sản Mộc Châu', 'PROCESSOR', 'ACTIVE', '2026-07-01 00:00:00'),
(3, N'Tổng kho Logistics Miền Bắc', 'DISTRIBUTOR', 'ACTIVE', '2026-07-01 00:00:00'),
(4, N'Hệ thống Siêu thị WinMart Hà Nội', 'RETAILER', 'ACTIVE', '2026-07-01 00:00:00');

SET IDENTITY_INSERT Organizations OFF;
GO

-- =========================================================================
-- 2. SEED NGƯỜI DÙNG (Users) - Mật khẩu chung: P@ssw0rd123
-- =========================================================================
SET IDENTITY_INSERT Users ON;

INSERT INTO Users (Id, FullName, Email, PasswordHash, Role, OrganizationId, IsActive, CreatedAt) VALUES
(1, N'Hệ Thống Quản Trị', 'admin@agritrace.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NULL, 1, '2026-07-01 00:00:00'),
(2, N'Nguyễn Văn Quản Lý', 'orgadmin@sonlafarm.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ORGADMIN', 1, 1, '2026-07-01 00:00:00'),
(3, N'Trần Văn Nông Dân', 'farmer@sonlafarm.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FARMER', 1, 1, '2026-07-01 00:00:00'),
(4, N'Lê Thị Vận Hành', 'operator@mocchau.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'OPERATOR', 2, 1, '2026-07-01 00:00:00'),
(5, N'Phạm Kiểm Định Viên', 'inspector@agritrace.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'INSPECTOR', NULL, 1, '2026-07-01 00:00:00');

SET IDENTITY_INSERT Users OFF;
GO

-- =========================================================================
-- 3. SEED SẢN PHẨM (Products)
-- =========================================================================
SET IDENTITY_INSERT Products ON;

INSERT INTO Products (Id, Name, Category, Unit, OrganizationId) VALUES
(1, N'Cà chua bi Cherry', N'Rau củ quả', 'kg', 1),
(2, N'Dâu tây giống Hana Mộc Châu', N'Trái cây tươi', 'kg', 1),
(3, N'Bắp cải trái tim hữu cơ', N'Rau củ quả', 'kg', 1);

SET IDENTITY_INSERT Products OFF;
GO

-- =========================================================================
-- 4. SEED LÔ HÀNG (Batches)
-- =========================================================================
SET IDENTITY_INSERT Batches ON;

INSERT INTO Batches (Id, ProductId, BatchCode, Quantity, CurrentOrganizationId, ParentBatchId, RootBatchId, QRCode, CreatedAt) VALUES
-- Lô gốc thu hoạch 500kg
(1, 1, 'BTH-20260701-001', 500.00, 2, NULL, NULL, 'https://agritrace.vn/trace/1', '2026-07-01 06:00:00'),
-- Lô con 1 tách ra (200kg)
(2, 1, 'BTH-20260703-002', 200.00, 3, 1, 1, 'https://agritrace.vn/trace/2', '2026-07-03 08:00:00'),
-- Lô con 2 tách ra (300kg)
(3, 1, 'BTH-20260703-003', 300.00, 3, 1, 1, 'https://agritrace.vn/trace/3', '2026-07-03 08:00:00'),
-- Lô thu hoạch thứ 2 (Dâu tây)
(4, 2, 'BTH-20260705-004', 150.00, 1, NULL, NULL, 'https://agritrace.vn/trace/4', '2026-07-05 06:30:00');

SET IDENTITY_INSERT Batches OFF;
GO

-- =========================================================================
-- 5. SEED CHUỖI SỰ KIỆN & HASH CHAIN (SupplyChainEvents)
-- =========================================================================
SET IDENTITY_INSERT SupplyChainEvents ON;

INSERT INTO SupplyChainEvents (Id, BatchId, EventType, OrganizationId, UserId, EventData, Location, PreviousHash, CurrentHash, CreatedAt) VALUES
-- Event 1: Thu hoạch Lô 1
(1, 1, 'HARVEST', 1, 3, N'{"field":"Khu A2 - Vườn Sơn La","seedSource":"Hạt giống F1 Rijk Zwaan"}', N'Xã Mường Bon, Sơn La', NULL, 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2', '2026-07-01 06:05:00'),

-- Event 2: Sơ chế & đóng gói Lô 1
(2, 1, 'PROCESS', 2, 4, N'{"temperature":20,"standard":"Rửa ozone và phân loại loại 1"}', N'Nhà máy Chế biến Mộc Châu', 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2', 'b4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', '2026-07-02 09:30:00'),

-- Event 3: Kiểm định chất lượng Lô 1
(3, 1, 'INSPECT', 1, 5, N'{"inspectionCode":"QC-2026-089","criteria":"Không tồn dư thuốc BVTV"}', N'Trung tâm Kiểm định Chất lượng', 'b4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 'c5b3d2e4f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', '2026-07-02 14:00:00'),

-- Event 4: Tách lô 1 thành lô 2 và lô 3
(4, 1, 'SPLIT', 2, 4, N'{"childBatches":[{"id":2,"qty":200},{"id":3,"qty":300}]}', N'Kho phân loại Mộc Châu', 'c5b3d2e4f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'd6c4e3f5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', '2026-07-03 08:00:00'),

-- Event 5: Thu hoạch Lô 4 (Dâu tây)
(5, 4, 'HARVEST', 1, 3, N'{"field":"Nhà màng Mộc Châu","brix":11.5}', N'Thị trấn Mộc Châu', NULL, 'e7d5f4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', '2026-07-05 06:35:00');

SET IDENTITY_INSERT SupplyChainEvents OFF;
GO

-- =========================================================================
-- 6. SEED ẢNH LÔ HÀNG (BatchImages)
-- =========================================================================
INSERT INTO BatchImages (BatchId, ImageUrl, Caption, DisplayOrder, EventId, CreatedAt) VALUES
(1, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800', N'Ảnh thu hoạch thực tế tại nông trại Sơn La', 1, 1, '2026-07-01 06:10:00'),
(1, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', N'Đóng thùng xốp bảo quản tại kho sơ chế', 2, 2, '2026-07-02 10:00:00'),
(4, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800', N'Thu hái dâu tây nhà kính', 1, 5, '2026-07-05 06:40:00');
GO

-- =========================================================================
-- 7. SEED QUAN HỆ TÁCH / GỘP LÔ (BatchRelations)
-- =========================================================================
INSERT INTO BatchRelations (SourceBatchId, TargetBatchId, RelationType, Quantity, CreatedAt) VALUES
(1, 2, 'SPLIT', 200.00, '2026-07-03 08:00:00'),
(1, 3, 'SPLIT', 300.00, '2026-07-03 08:00:00');
GO

-- =========================================================================
-- 8. SEED KIỂM ĐỊNH CHẤT LƯỢNG (Inspections)
-- =========================================================================
SET IDENTITY_INSERT Inspections ON;

INSERT INTO Inspections (Id, BatchId, InspectorId, Result, Notes, CreatedAt) VALUES
(1, 1, 5, 'PASS', N'Đạt 100% tiêu chuẩn VietGAP. Độ tồn dư nitrat < 50mg/kg, không phát sinh kim loại nặng.', '2026-07-02 14:00:00'),
(2, 4, 5, 'PASS', N'Dâu tây đạt chuẩn an toàn vệ sinh, độ ngọt đạt 11.5 brix.', '2026-07-05 11:00:00');

SET IDENTITY_INSERT Inspections OFF;
GO

-- =========================================================================
-- 9. SEED CHỨNG NHẬN TIÊU CHUẨN (Certificates)
-- =========================================================================
INSERT INTO Certificates (BatchId, InspectionId, CertificateType, FileUrl, IssuedAt) VALUES
(1, 1, 'VietGAP', 'https://cdn.agritrace.vn/certs/vietgap-sonla-2026.pdf', '2026-07-02 15:00:00'),
(4, 2, 'GlobalGAP', 'https://cdn.agritrace.vn/certs/globalgap-strawberry-2026.pdf', '2026-07-05 12:00:00');
GO

-- =========================================================================
-- 10. SEED THU HỒI SẢN PHẨM (Recalls)
-- =========================================================================
INSERT INTO Recalls (BatchId, Reason, Severity, CreatedBy, CreatedAt) VALUES
(3, N'Phát hiện bao bì lô 3 bị rách trong quá trình trung chuyển tại kho', 'LOW', 5, '2026-07-04 16:00:00');
GO

-- =========================================================================
-- 11. SEED THÔNG BÁO (Notifications)
-- =========================================================================
INSERT INTO Notifications (UserId, Title, Message, IsRead, CreatedAt) VALUES
(2, N'Thu hồi cảnh báo', N'Lô hàng BTH-20260703-003 đã được kích hoạt cảnh báo thu hồi mức độ LOW.', 0, '2026-07-04 16:01:00'),
(3, N'Cấp chứng nhận VietGAP', N'Lô hàng BTH-20260701-001 vừa được cấp chứng chỉ VietGAP thành công.', 1, '2026-07-02 15:05:00'),
(4, N'Tiếp nhận lô hàng mới', N'Bạn có 1 lô hàng mới được chuyển từ Nông trại Sơn La sang xưởng Mộc Châu.', 1, '2026-07-02 08:00:00');
GO