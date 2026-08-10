using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using Mapster;
using MediatR;

namespace AgriTrace.Application.Features.Farms.Queries
{
    // Use-case: lấy danh sách nông trại theo trang (phân trang).
    public record GetFarmsQuery(int PageNumber, int PageSize) : IRequest<PaginationResponse<FarmDto>>;

    public class GetFarmsQueryHandler : IRequestHandler<GetFarmsQuery, PaginationResponse<FarmDto>>
    {
        private readonly IFarmService _farmService;

        public GetFarmsQueryHandler(IFarmService farmService)
        {
            _farmService = farmService;
        }

        public async Task<PaginationResponse<FarmDto>> Handle(GetFarmsQuery request, CancellationToken cancellationToken)
        {
            var paged = await _farmService.GetFarmsAsync(request.PageNumber, request.PageSize);

            var items = paged.Items.Select(f => f.Adapt<FarmDto>()).ToList();

            // Dựng sẵn envelope phân trang tại đây; tầng API chỉ việc trả về.
            return new PaginationResponse<FarmDto>(
                items, paged.TotalCount, request.PageNumber, request.PageSize);
        }
    }
}
