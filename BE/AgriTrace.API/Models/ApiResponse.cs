using System.Net;
using System.Text.Json.Serialization;

namespace AgriTrace.API.Models;

/// <summary>
/// Response Envelope chuẩn theo API Specification v2.0 §1.2.
/// </summary>
public class ApiResponse<T>
{
    [JsonPropertyName("statusCode")]
    public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.OK;

    [JsonPropertyName("success")]
    public bool Success { get; set; } = true;

    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get => Success; set => Success = value; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("result")]
    public T? Result { get => Data; set => Data = value; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = "Thành công";

    [JsonPropertyName("errors")]
    public object? Errors { get; set; }

    [JsonPropertyName("errorMessages")]
    public List<string> ErrorMessages { get; set; } = new();

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T? data, string message = "Thành công") => new()
    {
        StatusCode = HttpStatusCode.OK,
        Success = true,
        Data = data,
        Message = message
    };

    public static ApiResponse<T> Created(T? data, string message = "Tạo mới thành công") => new()
    {
        StatusCode = HttpStatusCode.Created,
        Success = true,
        Data = data,
        Message = message
    };

    public static ApiResponse<T> Fail(HttpStatusCode statusCode, params string[] errorMessages) => new()
    {
        StatusCode = statusCode,
        Success = false,
        Data = default,
        Message = errorMessages.FirstOrDefault() ?? "Lỗi xử lý",
        ErrorMessages = new List<string>(errorMessages),
        Errors = errorMessages
    };

    public static ApiResponse<T> Fail(string message, object? errors = null) => new()
    {
        StatusCode = HttpStatusCode.BadRequest,
        Success = false,
        Data = default,
        Message = message,
        Errors = errors,
        ErrorMessages = errors is string[] arr ? new List<string>(arr) : new List<string> { message }
    };
}

public class ApiResponse : ApiResponse<object>
{
    public static new ApiResponse Ok(object? data, string message = "Thành công") => new()
    {
        StatusCode = HttpStatusCode.OK,
        Success = true,
        Data = data,
        Message = message
    };

    public static new ApiResponse Created(object? data, string message = "Tạo mới thành công") => new()
    {
        StatusCode = HttpStatusCode.Created,
        Success = true,
        Data = data,
        Message = message
    };

    public static new ApiResponse Fail(HttpStatusCode statusCode, params string[] errorMessages) => new()
    {
        StatusCode = statusCode,
        Success = false,
        Data = null,
        Message = errorMessages.FirstOrDefault() ?? "Lỗi xử lý",
        ErrorMessages = new List<string>(errorMessages),
        Errors = errorMessages
    };

    public static new ApiResponse Fail(string message, object? errors = null) => new()
    {
        StatusCode = HttpStatusCode.BadRequest,
        Success = false,
        Data = null,
        Message = message,
        Errors = errors,
        ErrorMessages = errors is string[] arr ? new List<string>(arr) : new List<string> { message }
    };
}
