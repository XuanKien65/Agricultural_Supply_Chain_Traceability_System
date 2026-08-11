# 📐 Hướng dẫn tổ chức code khi thêm Feature mới

Tài liệu này bổ sung cho [`BACKEND_PROJECT_STRUCTURE.md`](./BACKEND_PROJECT_STRUCTURE.md) (mô tả kiến trúc tổng thể) — mục tiêu ở đây là trả lời câu hỏi thực tế: **"Tôi vừa viết xong 1 đoạn code, nó nên nằm ở file/folder nào?"**

---

## 1. Quy tắc vàng: đi đúng thứ tự 4 tầng

Khi thêm 1 nghiệp vụ mới (ví dụ: thêm entity `Order`), luôn viết theo thứ tự sau — **không nhảy cóc**:

```
1. Domain          → Entity, Interface (IOrderRepository)
2. Application      → Command/Query + Handler, DTO
3. Infrastructure   → DataModel, Configuration, Repository
4. API              → Request/Response, Controller
```

Lý do: tầng trong (Domain) không được biết tới tầng ngoài. Nếu bạn viết Controller trước rồi mới nghĩ Entity, dễ bị lẫn logic nghiệp vụ vào Controller.

---

## 2. Bảng tra cứu nhanh — "Code này đặt ở đâu?"

| Loại code                                              | Đặt ở                                                              | Ví dụ                                    |
|---------------------------------------------------------|---------------------------------------------------------------------|-------------------------------------------|
| Entity nghiệp vụ (có logic, private setter)              | `Domain/Entities/`                                                   | `Order.cs`                                |
| Interface Repository/Service của Domain                  | `Domain/Interfaces/`                                                 | `IOrderRepository.cs`                     |
| Exception do vi phạm quy tắc nghiệp vụ (Domain tự ném ra) | `Domain/Exceptions/`                                                 | `InvalidOrderStateException.cs`           |
| Command / Query (input của use-case)                     | `Application/Features/<Domain>/Commands|Queries/`                   | `Features/Orders/Commands/CreateOrderCommand.cs` |
| Handler xử lý Command/Query                              | **Cùng file** với Command/Query đó                                   | trong `CreateOrderCommand.cs`             |
| Validator cho Command/Query (FluentValidation)            | **Cùng folder** với Command/Query, hậu tố `Validator`                 | `CreateOrderCommandValidator.cs`          |
| DTO trả ra khỏi Application                              | `Application/Contracts/`                                             | `OrderDto.cs`                             |
| MediatR Pipeline Behavior (Validation, Logging chung)     | `Application/Common/Behaviors/`                                      | `ValidationBehavior.cs`                   |
| Exception dùng chung ở tầng Application (NotFound...)     | `Application/Common/Exceptions/`                                     | `NotFoundException.cs`                    |
| DataModel (đại diện bảng SQL)                             | `Infrastructure.Sqlserver/Models/`                                    | `OrderDataModel.cs`                       |
| Fluent API config bảng                                    | `Infrastructure.Sqlserver/Configurations/`                            | `OrderConfiguration.cs`                   |
| Repository (implement Interface của Domain)               | `Infrastructure.Sqlserver/Repositories/`                              | `OrderRepository.cs`                      |
| Migration EF Core                                          | `Infrastructure.Sqlserver/Persistence/Migrations/` (tự sinh bởi `dotnet ef migrations add`) | — |
| Request/Response model của API                            | `API/Models/`                                                        | `OrderRequest.cs`, `OrderResponse.cs`     |
| Controller                                                 | `API/Controllers/`                                                    | `OrdersController.cs`                     |
| Middleware HTTP pipeline (khác exception handler mặc định) | `API/Middlewares/`                                                    | `RequestLoggingMiddleware.cs`             |
| Filter (action filter, wrapper response...)                | `API/Common/` (đã có `ApiResponseWrapperFilter.cs`)                   | —                                          |
| Unit test cho Domain/Application                           | `tests/AgriTrace.Domain.UnitTests/`, `tests/AgriTrace.Application.UnitTests/` | `OrderTests.cs`, `CreateOrderCommandHandlerTests.cs` |
| Integration test (gọi qua HTTP thật, DB thật/Testcontainers)| `tests/AgriTrace.API.IntegrationTests/`                                | `OrdersControllerTests.cs`                |

---

## 3. Quy ước đặt tên & gom nhóm theo Domain

- Mỗi **Domain/Aggregate** (Farm, Order, User...) có 1 folder con cùng tên trong `Application/Features/<Domain>/`. Đã áp dụng đúng cho `Farms/` và `Crops/`.
- **Controllers**: hiện tại đang để phẳng (`Controllers/FarmsController.cs`). Khi số lượng Controller vượt quá ~5-6 hoặc xuất hiện nhiều domain không liên quan (ví dụ thêm `Orders`, `Users`), hãy gom theo domain:
  ```
  Controllers/
  ├── Farms/
  │   ├── FarmsController.cs
  │   └── CropsController.cs
  └── Orders/
      └── OrdersController.cs
  ```
- 1 Command/Query = 1 file, chứa cả Handler bên trong (đúng convention hiện tại của dự án, giữ nguyên — không tách Handler ra file riêng để tránh rải file vụn).
- Validator luôn đặt tên `<TênCommand>Validator.cs`, nằm ngay cạnh Command/Query tương ứng — không tạo folder `Validators/` riêng (giữ liên quan tính năng gần nhau).

---

## 4. Checklist khi thêm 1 Domain/Feature mới

Ví dụ thêm domain `Order`:

- [ ] `Domain/Entities/Order.cs` — entity với private setter, factory method/constructor validate nghiệp vụ
- [ ] `Domain/Interfaces/IOrderRepository.cs`
- [ ] `Application/Features/Orders/Commands/CreateOrderCommand.cs` (+ Handler trong cùng file)
- [ ] `Application/Features/Orders/Commands/CreateOrderCommandValidator.cs` (nếu có input cần validate)
- [ ] `Application/Features/Orders/Queries/GetOrderByIdQuery.cs`
- [ ] `Application/Contracts/OrderDto.cs`
- [ ] `Application/Mappings/ApplicationMappingRegister.cs` — bổ sung rule map Entity ↔ DTO nếu cần
- [ ] `Infrastructure.Sqlserver/Models/OrderDataModel.cs`
- [ ] `Infrastructure.Sqlserver/Configurations/OrderConfiguration.cs`
- [ ] `Infrastructure.Sqlserver/Repositories/OrderRepository.cs`
- [ ] Chạy `dotnet ef migrations add Add_Order` để sinh migration trong `Persistence/Migrations/`
- [ ] `Infrastructure.Sqlserver/DependencyInjection.cs` — đăng ký `IOrderRepository` → `OrderRepository`
- [ ] `API/Models/OrderRequest.cs`, `OrderResponse.cs`
- [ ] `API/Mappings/ApiMappingRegister.cs` — bổ sung rule map Request → Command, DTO → Response
- [ ] `API/Controllers/OrdersController.cs`
- [ ] Viết test: `tests/AgriTrace.Application.UnitTests/CreateOrderCommandHandlerTests.cs`
- [ ] Không hardcode connection string / secret — dùng `appsettings.Development.json` (gitignored) hoặc user-secrets

---

## 5. Trước khi tạo Pull Request

- [ ] `dotnet build` không lỗi, không warning mới
- [ ] `dotnet test` chạy pass (khi đã có test)
- [ ] Không dùng lẫn 2 kiểu Mapster trong cùng 1 PR (`IMapper.Map<T>()` inject **hoặc** `.Adapt<T>()` tĩnh — chọn 1, xem quy ước hiện có trong layer tương ứng trước khi viết mới)
- [ ] Entity Domain không có setter public tự do — chỉ thay đổi qua method nghiệp vụ
- [ ] Controller không chứa logic nghiệp vụ — chỉ gọi `Mediator.Send()` và map response

---

## 6. Các folder đã scaffold sẵn (đang trống, chờ dùng)

Các folder dưới đây đã được tạo trước (kèm `.gitkeep`) theo đúng kiến trúc đã thiết kế trong `BACKEND_PROJECT_STRUCTURE.md`, nhưng chưa có code — đừng xóa, hãy dùng khi cần:

- `AgriTrace.Domain/Exceptions/` — domain exception
- `AgriTrace.Application/Common/Behaviors/` — MediatR Pipeline Behavior (Validation, Logging)
- `AgriTrace.Infrastructure.Sqlserver/Persistence/Migrations/` — EF Core migrations
- `AgriTrace.API/Middlewares/` — middleware HTTP pipeline ngoài exception handler
- `tests/AgriTrace.Domain.UnitTests/`
- `tests/AgriTrace.Application.UnitTests/`
- `tests/AgriTrace.API.IntegrationTests/`
