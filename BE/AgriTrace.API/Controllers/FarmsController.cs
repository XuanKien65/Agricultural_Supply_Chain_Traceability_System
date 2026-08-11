using System;
using System.Threading.Tasks;
using AgriTrace.API.Models;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Application.Contracts;
using AgriTrace.Application.Features.Farms.Commands;
using AgriTrace.Application.Features.Farms.Queries;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FarmsController : ControllerBase
    {
        private readonly ISender _sender;
        private readonly IMapper _mapper;

        public FarmsController(ISender sender, IMapper mapper)
        {
            _sender = sender;
            _mapper = mapper;
        }

        // Tạo mới một nông trại (phía "1").
        // Body thực tế được ApiResponseWrapperFilter bọc thành ApiResponse (Result = FarmResponse).
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateFarm([FromBody] FarmRequest request)
        {
            var command = _mapper.Map<CreateFarmCommand>(request);
            var resultDto = await _sender.Send(command);
            var response = _mapper.Map<FarmResponse>(resultDto);

            return CreatedAtAction(nameof(GetFarmById), new { id = response.Id }, response);
        }

        // Lấy danh sách nông trại theo trang (phân trang).
        // Body thực tế: ApiResponse (Result = PaginationResponse<FarmDto>).
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFarms([FromQuery] PaginationRequest request)
        {
            var query = _mapper.Map<GetFarmsQuery>(request);
            return Ok(await _sender.Send(query));
        }

        // Lấy một nông trại kèm toàn bộ mùa vụ (quan hệ 1 - N).
        // Body thực tế: ApiResponse (Result = FarmResponse).
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFarmById(Guid id)
        {
            var query = _mapper.Map<GetFarmByIdQuery>(id);
            var resultDto = await _sender.Send(query);

            if (resultDto == null)
            {
                throw new NotFoundException($"Farm '{id}' not found.");
            }

            return Ok(_mapper.Map<FarmResponse>(resultDto));
        }
    }
}
