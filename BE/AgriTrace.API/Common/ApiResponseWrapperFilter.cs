using System.Net;
using AgriTrace.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace AgriTrace.API.Common;

/// <summary>
/// Tự động bọc MỌI kết quả trả về của controller vào envelope ApiResponse.
/// </summary>
public class ApiResponseWrapperFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        switch (context.Result)
        {
            case ObjectResult { Value: ApiResponse }:
            case ObjectResult { Value: ApiResponse<object> }:
                break;

            case ObjectResult objectResult:
                objectResult.Value = Build(objectResult.Value, objectResult.StatusCode ?? StatusCodes.Status200OK);
                break;

            case StatusCodeResult statusCodeResult:
                context.Result = new ObjectResult(Build(null, statusCodeResult.StatusCode))
                {
                    StatusCode = statusCodeResult.StatusCode
                };
                break;

            case EmptyResult:
                context.Result = new ObjectResult(Build(null, StatusCodes.Status200OK))
                {
                    StatusCode = StatusCodes.Status200OK
                };
                break;
        }

        await next();
    }

    private static ApiResponse Build(object? value, int statusCode)
    {
        if (statusCode is >= 200 and < 300)
        {
            return statusCode == 201
                ? ApiResponse.Created(value)
                : ApiResponse.Ok(value);
        }

        return ApiResponse.Fail((HttpStatusCode)statusCode, ExtractMessages(value, statusCode));
    }

    private static string[] ExtractMessages(object? value, int statusCode)
    {
        return value switch
        {
            ValidationProblemDetails vpd => vpd.Errors.SelectMany(kvp => kvp.Value).ToArray(),
            ProblemDetails pd => [pd.Detail ?? pd.Title ?? DefaultMessage(statusCode)],
            string s => [s],
            null => [DefaultMessage(statusCode)],
            _ => [value.ToString()!]
        };
    }

    private static string DefaultMessage(int statusCode) =>
        ((HttpStatusCode)statusCode).ToString();
}
