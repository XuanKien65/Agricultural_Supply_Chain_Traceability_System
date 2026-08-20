using MediatR;

namespace AgriTrace.Application.Features.Lookup;

public record LookupItemDto(string Code, string Name, string? Description = null);

public record GetRolesQuery : IRequest<IReadOnlyList<LookupItemDto>>;
public record GetOrganizationTypesQuery : IRequest<IReadOnlyList<LookupItemDto>>;
public record GetEventTypesQuery : IRequest<IReadOnlyList<LookupItemDto>>;

public sealed class LookupQueryHandler
    : IRequestHandler<GetRolesQuery, IReadOnlyList<LookupItemDto>>,
      IRequestHandler<GetOrganizationTypesQuery, IReadOnlyList<LookupItemDto>>,
      IRequestHandler<GetEventTypesQuery, IReadOnlyList<LookupItemDto>>
{
    public Task<IReadOnlyList<LookupItemDto>> Handle(GetRolesQuery request, CancellationToken ct)
    {
        IReadOnlyList<LookupItemDto> roles =
        [
            new("ADMIN", "Quản trị hệ thống", "Toàn quyền quản trị hệ thống"),
            new("ORGADMIN", "Quản trị tổ chức", "Quản trị trong phạm vi tổ chức"),
            new("FARMER", "Nông dân / Chủ trang trại", "Quản lý nông trại và ghi nhận thu hoạch"),
            new("OPERATOR", "Nhân viên vận hành", "Ghi nhận chế biến, đóng gói, vận chuyển, tách/gộp lô"),
            new("INSPECTOR", "Kiểm định viên", "Thực hiện kiểm định, cấp chứng nhận, kích hoạt thu hồi")
        ];
        return Task.FromResult(roles);
    }

    public Task<IReadOnlyList<LookupItemDto>> Handle(GetOrganizationTypesQuery request, CancellationToken ct)
    {
        IReadOnlyList<LookupItemDto> types =
        [
            new("FARM", "Nông trại / Trang trại", "Đơn vị sản xuất nông nghiệp ban đầu"),
            new("PROCESSOR", "Cơ sở sơ chế / Nhà máy đóng gói", "Đơn vị chế biến và đóng gói nông sản"),
            new("DISTRIBUTOR", "Nhà phân phối / Công ty Logistics", "Đơn vị vận chuyển và trung chuyển"),
            new("RETAILER", "Siêu thị / Cửa hàng bán lẻ", "Đơn vị cung cấp nông sản tới người tiêu dùng")
        ];
        return Task.FromResult(types);
    }

    public Task<IReadOnlyList<LookupItemDto>> Handle(GetEventTypesQuery request, CancellationToken ct)
    {
        IReadOnlyList<LookupItemDto> events =
        [
            new("HARVEST", "Thu hoạch", "Thu hoạch nông sản tại trang trại"),
            new("PROCESS", "Sơ chế / Chế biến", "Làm sạch, phân loại hoặc chế biến"),
            new("PACKAGE", "Đóng gói", "Đóng thùng, dán tem QR"),
            new("TRANSPORT", "Vận chuyển", "Di chuyển lô hàng giữa các địa điểm"),
            new("INSPECT", "Kiểm định chất lượng", "Đánh giá tiêu chuẩn an toàn thực phẩm"),
            new("RECEIVE", "Tiếp nhận lô hàng", "Xác nhận nhận hàng tại kho / điểm phân phối"),
            new("SPLIT", "Tách lô", "Chia 1 lô lớn thành nhiều lô nhỏ"),
            new("MERGE", "Gộp lô", "Gộp nhiều lô nhỏ thành 1 lô lớn")
        ];
        return Task.FromResult(events);
    }
}
