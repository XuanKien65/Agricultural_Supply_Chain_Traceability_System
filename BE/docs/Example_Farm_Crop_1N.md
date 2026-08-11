# 🌾 Ví dụ quan hệ 1 - N: Farm (Nông trại) → Crop (Mùa vụ)

Tài liệu này giải thích ví dụ mẫu **1 nông trại có nhiều mùa vụ**, được xây dựng
theo đúng chuẩn **Clean Architecture** và **DDD** của dự án. Mục tiêu: giúp sinh
viên hiểu cách tạo 2 Entity và một quan hệ 1 - N đi xuyên suốt các tầng.

---

## 1. Ý tưởng

| Phía | Entity | Vai trò |
|------|--------|---------|
| **1** | `Farm` | Aggregate Root — sở hữu nhiều mùa vụ |
| **N** | `Crop` | Entity con — luôn thuộc về đúng một `Farm` (qua `FarmId`) |

Cả hai đều kế thừa `BaseEntity` để dùng chung `Id`, `CreatedAt`, `UpdatedAt`.

```
        1                     N
   ┌────────┐           ┌──────────┐
   │  Farm  │ ────────< │   Crop   │
   └────────┘           └──────────┘
    (Id, Name,           (Id, FarmId,
     Location)            Name, AreaHectares)
```

---

## 2. Các file theo từng tầng

### Domain (lõi nghiệp vụ)
- `Common/BaseEntity.cs` — lớp cơ sở dùng chung (Id + mốc thời gian).
- `Entities/Farm.cs` — phía "1", chứa danh sách `Crops` (private) và phương thức
  `AddCrop(...)` để tạo quan hệ đúng cách.
- `Entities/Crop.cs` — phía "N", giữ khóa ngoại `FarmId`.
- `Interfaces/IFarmRepository.cs` — chỉ có **một** repository cho Aggregate Root.
  Theo DDD, `Crop` không có repository riêng; mọi thao tác đi qua `Farm`.

### Infrastructure (EF Core + SQL Server)
- `Models/FarmDataModel.cs`, `Models/CropDataModel.cs` — bảng vật lý.
- `Configurations/FarmConfiguration.cs` — khai báo quan hệ 1 - N bằng
  `HasMany(...).WithOne(...).HasForeignKey(c => c.FarmId)` + Cascade Delete.
- `Repositories/FarmRepository.cs` — dùng `Include(f => f.Crops)` để tải kèm mùa vụ,
  và ánh xạ thủ công hai chiều giữa Data Model ↔ Domain Entity.

### Application (CQRS - MediatR)
- `Contracts/FarmDto.cs`, `Contracts/CropDto.cs` — DTO trả ra ngoài.
- `Features/Farms/Commands/CreateFarmCommand.cs` — tạo nông trại.
- `Features/Farms/Commands/AddCropToFarmCommand.cs` — thêm mùa vụ vào nông trại.
- `Features/Farms/Queries/GetFarmByIdQuery.cs` — lấy nông trại kèm mùa vụ.

### API (Presentation)
- `Models/FarmRequest.cs`, `Models/CropRequest.cs`, `Models/FarmResponse.cs`,
  `Models/CropResponse.cs`.
- `Controllers/FarmsController.cs`.

---

## 3. Thử nhanh với API

```http
### 1) Tạo nông trại
POST /api/farms
{
  "name": "Nông trại Đà Lạt",
  "location": "Lâm Đồng"
}

### 2) Thêm mùa vụ vào nông trại (thay {id} bằng Id trả về ở bước 1)
POST /api/farms/{id}/crops
{
  "name": "Cà chua vụ Đông",
  "areaHectares": 2.5
}

### 3) Xem nông trại kèm toàn bộ mùa vụ
GET /api/farms/{id}
```

---

## 4. Điểm cần nhớ (DDD)
- **Aggregate Root**: chỉ `Farm` có repository. Muốn thêm `Crop` phải gọi
  `farm.AddCrop(...)` rồi lưu qua `IFarmRepository` — không thao tác trực tiếp `Crop`.
- **Đóng gói**: thuộc tính để `private set`, danh sách con để `private` và chỉ lộ ra
  dưới dạng `IReadOnlyCollection` để bảo vệ tính toàn vẹn dữ liệu.
- **Tách biệt tầng**: Domain không biết gì về EF Core; việc ánh xạ nằm ở Infrastructure.
