using System.ComponentModel.DataAnnotations;

namespace AgriTrace.API.Models;

// =========================================================
// USER
// =========================================================

public sealed class AdminUserRequest
{
    [MaxLength(200)]
    public string? FullName { get; init; }

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; init; } =
        string.Empty;

    [MinLength(6)]
    public string? Password { get; init; }

    [Required]
    [MaxLength(50)]
    public string Role { get; init; } =
        string.Empty;

    public int? OrganizationId { get; init; }

    public bool IsActive { get; init; } = true;
}


// =========================================================
// ORGANIZATION
// =========================================================

public sealed class AdminOrganizationRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } =
        string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; init; } =
        "FARM";

    [Required]
    [MaxLength(20)]
    public string Status { get; init; } =
        "ACTIVE";
}


// =========================================================
// PRODUCT
// =========================================================

public sealed class AdminProductRequest
{
    [Required]
    [MaxLength(200)]
    public string? Name { get; init; }

    [MaxLength(100)]
    public string? Category { get; init; }

    [MaxLength(50)]
    public string? Unit { get; init; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "OrganizationId phải lớn hơn 0.")]
    public int OrganizationId { get; init; }
}


// =========================================================
// BATCH
// =========================================================

public sealed class AdminBatchRequest
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "ProductId phải lớn hơn 0.")]
    public int ProductId { get; init; }

    [Required(
        ErrorMessage =
            "Mã lô không được để trống.")]
    [MaxLength(100)]
    public string BatchCode { get; init; } =
        string.Empty;

    // Không dùng:
    //
    // [Range(typeof(decimal), "0.01", "...")]
    //
    // vì một số culture như vi-VN có thể parse
    // "0.01" không đúng.
    //
    // Dùng constructor double của RangeAttribute
    // để validation không phụ thuộc dấu chấm/phẩy.
    [Range(
        0.01,
        9999999999999999d,
        ErrorMessage =
            "Số lượng phải lớn hơn 0.")]
    public decimal Quantity { get; init; }

    public int? CurrentOrganizationId { get; init; }

    public int? ParentBatchId { get; init; }

    public int? RootBatchId { get; init; }

    [MaxLength(500)]
    public string? QrCode { get; init; }
}


// =========================================================
// SUPPLY CHAIN EVENT
// =========================================================

public sealed class AdminEventRequest
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "BatchId phải lớn hơn 0.")]
    public int BatchId { get; init; }

    [Required]
    [MaxLength(50)]
    public string EventType { get; init; } =
        string.Empty;

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "OrganizationId phải lớn hơn 0.")]
    public int OrganizationId { get; init; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "UserId phải lớn hơn 0.")]
    public int UserId { get; init; }

    public string? EventData { get; init; }

    [MaxLength(200)]
    public string? Location { get; init; }

    [MaxLength(500)]
    public string? PreviousHash { get; init; }

    [MaxLength(500)]
    public string? CurrentHash { get; init; }
}


// =========================================================
// INSPECTION
// =========================================================

public sealed class AdminInspectionRequest
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "BatchId phải lớn hơn 0.")]
    public int BatchId { get; init; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "InspectorId phải lớn hơn 0.")]
    public int InspectorId { get; init; }

    [MaxLength(100)]
    public string? Result { get; init; }

    public string? Notes { get; init; }
}


// =========================================================
// CERTIFICATE
// =========================================================

public sealed class AdminCertificateRequest
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "BatchId phải lớn hơn 0.")]
    public int BatchId { get; init; }

    public int? InspectionId { get; init; }

    [MaxLength(100)]
    public string? CertificateType { get; init; }

    [MaxLength(500)]
    public string? FileUrl { get; init; }
}


// =========================================================
// RECALL
// =========================================================

public sealed class AdminRecallRequest
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "BatchId phải lớn hơn 0.")]
    public int BatchId { get; init; }

    [MaxLength(500)]
    public string? Reason { get; init; }

    [MaxLength(50)]
    public string? Severity { get; init; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "CreatedBy phải lớn hơn 0.")]
    public int CreatedBy { get; init; }
}