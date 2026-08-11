using System.Threading.Tasks;
using AgriTrace.API.Models;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Application.Features.Crops.Commands;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CropsController : ControllerBase
    {
        private readonly ISender _sender;
        private readonly IMapper _mapper;

        public CropsController(ISender sender, IMapper mapper)
        {
            _sender = sender;
            _mapper = mapper;
        }

        // Tạo mới một mùa vụ (phía "N"). Nông trại đích được chỉ định qua FarmId trong body.
        // Body thực tế được ApiResponseWrapperFilter bọc thành ApiResponse (Result = CropResponse).
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateCrop([FromBody] CropRequest request)
        {
            var command = _mapper.Map<CreateCropCommand>(request);
            var resultDto = await _sender.Send(command);

            if (resultDto == null)
            {
                throw new NotFoundException($"Farm '{request.FarmId}' not found.");
            }

            var response = _mapper.Map<CropResponse>(resultDto);

            // Crop chưa có endpoint GET riêng; trỏ Location về nông trại cha (đã có GET) — nơi
            // truy xuất được mùa vụ vừa tạo trong danh sách Crops của nó.
            return CreatedAtAction(
                nameof(FarmsController.GetFarmById),
                "Farms",
                new { id = request.FarmId },
                response);
        }
    }
}
