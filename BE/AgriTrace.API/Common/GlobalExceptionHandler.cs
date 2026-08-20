using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AgriTrace.API.Models;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;

namespace AgriTrace.API.Common
{
    /// <summary>
    /// Bắt MỌI exception chưa được xử lý và trả về đúng envelope ApiResponse.
    /// Nhờ đó client luôn nhận cùng một hình dạng kể cả khi có lỗi.
    /// </summary>
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;
        private readonly IHostEnvironment _environment;

        public GlobalExceptionHandler(
            ILogger<GlobalExceptionHandler> logger,
            IHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var (statusCode, messages) = exception switch
            {
                NotFoundException => (HttpStatusCode.NotFound, new[] { exception.Message }),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, new[] { exception.Message }),
                ForbiddenException => (HttpStatusCode.Forbidden, new[] { exception.Message }),
                // Ghi sự kiện sai thứ tự chain of custody (VD: Retail trước Transport) — AC-05.
                InvalidEventSequenceException => (HttpStatusCode.Conflict, new[] { exception.Message }),
                // Domain ném ArgumentException khi dữ liệu đầu vào không hợp lệ.
                ArgumentException => (HttpStatusCode.BadRequest, new[] { exception.Message }),
                InvalidOperationException => (HttpStatusCode.BadRequest, new[] { exception.Message }),
                // Vi phạm khóa ngoại (VD: organizationId/userId không tồn tại) — trả 400 thay vì 500 chung chung.
                DbUpdateException { InnerException: SqlException { Number: 547 } } =>
                    (HttpStatusCode.BadRequest, new[] { "Dữ liệu tham chiếu không hợp lệ: tổ chức hoặc người thực hiện không tồn tại." }),
                _ => (
                    HttpStatusCode.InternalServerError,
                    new[]
                    {
                        _environment.IsDevelopment()
                            ? exception.Message
                            : "An unexpected error occurred."
                    })
            };

            if (statusCode == HttpStatusCode.InternalServerError)
            {
                // Chỉ log chi tiết cho lỗi ngoài dự kiến; không rò rỉ thông tin ra client.
                _logger.LogError(
                    exception,
                    "Unhandled exception while processing {Path}",
                    httpContext.Request.Path);
            }

            var response = ApiResponse.Fail(
                messages.FirstOrDefault() ?? "Lỗi hệ thống",
                messages);

            httpContext.Response.StatusCode =
                (int)statusCode;

            await httpContext.Response.WriteAsJsonAsync(
                response,
                cancellationToken);

            return true;
        }
    }
}
