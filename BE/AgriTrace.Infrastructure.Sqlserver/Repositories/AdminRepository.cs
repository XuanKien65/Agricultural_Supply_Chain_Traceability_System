using System.Data;
using System.Data.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

/// <summary>
/// Repository dành cho trang Admin.
///
/// Project hiện có 2 mô tả schema khác nhau:
/// - schema mới trong docs/Database.md: Organizations, Users, Products, Batches...
/// - database đang chạy ở một số máy vẫn dùng schema cũ: DonVi, NguoiDung, SanPham, LoHang...
///
/// Repository này đọc metadata của SQL Server và tự chọn bảng/cột đang tồn tại,
/// nhờ đó không còn lỗi kiểu "Invalid column name 'Type'" khi DB thực tế khác tài liệu.
/// </summary>
public sealed class AdminRepository(ApplicationDbContext db) : IAdminRepository
{
    private DatabaseSchema? _schema;

    public async Task<IReadOnlyList<AdminOrganization>> GetOrganizationsAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var t = RequireTable(s, "Organizations", "DonVi", "DonVis");

        var id = RequireColumn(t, "Id", "MaDonVi");
        var name = RequireColumn(t, "Name", "TenDonVi");
        var type = OptionalColumn(t, "Type", "OrganizationType", "LoaiDonVi");
        var status = OptionalColumn(t, "Status", "TrangThai");
        var created = OptionalColumn(t, "CreatedAt", "NgayTao", "ThoiGianTao");

        var sql = $"""
            SELECT
                {C(id)},
                {C(name)},
                {SelectOrLiteral(type, "N'UNKNOWN'")},
                {SelectOrLiteral(status, "N'ACTIVE'")},
                {SelectOrNull(created, "DATETIME")}
            FROM {T(t)}
            ORDER BY {C(id)} DESC;
            """;

        return await QueryAsync(
            sql,
            r => new AdminOrganization(
                ToInt32(r, 0),
                ToStringValue(r, 1) ?? string.Empty,
                ToStringValue(r, 2) ?? "UNKNOWN",
                ToStringValue(r, 3) ?? "ACTIVE",
                ToNullableDateTime(r, 4)),
            cancellationToken);
    }

    public async Task<IReadOnlyList<AdminUser>> GetUsersAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var u = RequireTable(s, "Users", "NguoiDung", "NguoiDungs");
        var o = FindTable(s, "Organizations", "DonVi", "DonVis");
        var roleTable = FindTable(s, "VaiTro", "VaiTros", "Roles");

        var uid = RequireColumn(u, "Id", "MaNguoiDung");
        var fullName = OptionalColumn(u, "FullName", "HoTen", "Name");
        var email = RequireColumn(u, "Email", "TenDangNhap");
        var directRole = OptionalColumn(u, "Role");
        var userRoleId = OptionalColumn(u, "MaVaiTro", "RoleId");
        var orgId = OptionalColumn(u, "OrganizationId", "MaDonVi");
        var active = OptionalColumn(u, "IsActive", "TrangThai");
        var created = OptionalColumn(u, "CreatedAt", "NgayTao", "ThoiGianTao");

        string roleExpr;
        string roleJoin = string.Empty;
        if (directRole is not null)
        {
            roleExpr = $"u.{C(directRole)}";
        }
        else if (userRoleId is not null && roleTable is not null)
        {
            var rid = RequireColumn(roleTable, "Id", "MaVaiTro");
            var rname = RequireColumn(roleTable, "Name", "TenVaiTro");
            roleJoin = $"LEFT JOIN {T(roleTable)} r ON r.{C(rid)} = u.{C(userRoleId)}";
            roleExpr = $"r.{C(rname)}";
        }
        else
        {
            roleExpr = "N'USER'";
        }

        string orgJoin = string.Empty;
        string orgNameExpr = "CAST(NULL AS NVARCHAR(200))";
        if (orgId is not null && o is not null)
        {
            var oid = RequireColumn(o, "Id", "MaDonVi");
            var oname = RequireColumn(o, "Name", "TenDonVi");
            orgJoin = $"LEFT JOIN {T(o)} o ON o.{C(oid)} = u.{C(orgId)}";
            orgNameExpr = $"o.{C(oname)}";
        }

        var activeExpr = active is null
            ? "CAST(1 AS BIT)"
            : active.Equals("TrangThai", StringComparison.OrdinalIgnoreCase)
                ? $"CASE WHEN UPPER(CONVERT(NVARCHAR(50), u.{C(active)})) IN (N'ACTIVE', N'HOAT_DONG', N'HOẠT ĐỘNG', N'1', N'TRUE') THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END"
                : $"CONVERT(BIT, u.{C(active)})";

        var sql = $"""
            SELECT
                u.{C(uid)},
                {SelectAliasOrNull("u", fullName, "NVARCHAR(200)")},
                u.{C(email)},
                {roleExpr},
                {SelectAliasOrNull("u", orgId, "INT")},
                {orgNameExpr},
                {activeExpr},
                {SelectAliasOrNull("u", created, "DATETIME")}
            FROM {T(u)} u
            {roleJoin}
            {orgJoin}
            ORDER BY u.{C(uid)} DESC;
            """;

        return await QueryAsync(sql, MapUser, cancellationToken);
    }

    public async Task<IReadOnlyList<AdminProduct>> GetProductsAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var p = RequireTable(s, "Products", "SanPham", "SanPhams");
        var o = FindTable(s, "Organizations", "DonVi", "DonVis");

        var id = RequireColumn(p, "Id", "MaSanPham");
        var name = OptionalColumn(p, "Name", "TenSanPham");
        var category = OptionalColumn(p, "Category", "LoaiSanPham");
        var unit = OptionalColumn(p, "Unit", "DonViTinh");
        var orgId = OptionalColumn(p, "OrganizationId", "MaDonVi", "MaDonViSanXuat");

        string orgJoin = string.Empty;
        string orgName = "CAST(NULL AS NVARCHAR(200))";
        if (orgId is not null && o is not null)
        {
            var oid = RequireColumn(o, "Id", "MaDonVi");
            var oname = RequireColumn(o, "Name", "TenDonVi");
            orgJoin = $"LEFT JOIN {T(o)} o ON o.{C(oid)} = p.{C(orgId)}";
            orgName = $"o.{C(oname)}";
        }

        var sql = $"""
            SELECT
                p.{C(id)},
                {SelectAliasOrNull("p", name, "NVARCHAR(200)")},
                {SelectAliasOrNull("p", category, "NVARCHAR(100)")},
                {SelectAliasOrNull("p", unit, "NVARCHAR(50)")},
                {SelectAliasOrLiteral("p", orgId, "0")},
                {orgName}
            FROM {T(p)} p
            {orgJoin}
            ORDER BY p.{C(id)} DESC;
            """;

        return await QueryAsync(
            sql,
            r => new AdminProduct(
                ToInt32(r, 0),
                ToStringValue(r, 1),
                ToStringValue(r, 2),
                ToStringValue(r, 3),
                ToInt32(r, 4),
                ToStringValue(r, 5)),
            cancellationToken);
    }

    public async Task<IReadOnlyList<AdminBatch>> GetBatchesAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        return await GetBatchesInternalAsync(s, null, cancellationToken);
    }

    public async Task<IReadOnlyList<AdminSupplyChainEvent>> GetEventsAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var e = RequireTable(s, "SupplyChainEvents", "SuKien", "SuKiens");
        var b = FindTable(s, "Batches", "LoHang", "LoHangs");
        var o = FindTable(s, "Organizations", "DonVi", "DonVis");
        var u = FindTable(s, "Users", "NguoiDung", "NguoiDungs");

        var id = RequireColumn(e, "Id", "MaSuKien");
        var batchId = RequireColumn(e, "BatchId", "MaLoHang");
        var eventType = RequireColumn(e, "EventType", "LoaiSuKien");
        var orgId = OptionalColumn(e, "OrganizationId", "MaDonViThucHien", "MaDonVi");
        var userId = OptionalColumn(e, "UserId", "PerformedByUserId", "MaNguoiThucHien", "MaNguoiDung");
        var data = OptionalColumn(e, "EventData", "AdditionalData", "DuLieuBoSung");
        var location = OptionalColumn(e, "Location", "ViTri");
        var prevHash = OptionalColumn(e, "PreviousHash", "MaHashTruoc");
        var currentHash = OptionalColumn(e, "CurrentHash", "Hash", "MaHash");
        var created = OptionalColumn(e, "CreatedAt", "EventTime", "ThoiGian", "NgayTao");

        string batchJoin = string.Empty;
        string batchCode = "CAST(NULL AS NVARCHAR(100))";
        if (b is not null)
        {
            var bid = RequireColumn(b, "Id", "MaLoHang");
            var code = OptionalColumn(b, "BatchCode", "QRCode", "QrCode", "MaQR", "MaLoHang");
            batchJoin = $"LEFT JOIN {T(b)} b ON b.{C(bid)} = e.{C(batchId)}";
            batchCode = code is null ? "CAST(NULL AS NVARCHAR(100))" : $"CONVERT(NVARCHAR(100), b.{C(code)})";
        }

        string orgJoin = string.Empty;
        string orgName = "CAST(NULL AS NVARCHAR(200))";
        if (orgId is not null && o is not null)
        {
            var oid = RequireColumn(o, "Id", "MaDonVi");
            var oname = RequireColumn(o, "Name", "TenDonVi");
            orgJoin = $"LEFT JOIN {T(o)} o ON o.{C(oid)} = e.{C(orgId)}";
            orgName = $"o.{C(oname)}";
        }

        string userJoin = string.Empty;
        string userName = "CAST(NULL AS NVARCHAR(200))";
        if (userId is not null && u is not null)
        {
            var uid = RequireColumn(u, "Id", "MaNguoiDung");
            var uname = OptionalColumn(u, "FullName", "HoTen", "TenDangNhap", "Email");
            userJoin = $"LEFT JOIN {T(u)} u ON u.{C(uid)} = e.{C(userId)}";
            userName = uname is null ? "CAST(NULL AS NVARCHAR(200))" : $"CONVERT(NVARCHAR(200), u.{C(uname)})";
        }

        var sql = $"""
            SELECT
                e.{C(id)},
                e.{C(batchId)},
                {batchCode},
                e.{C(eventType)},
                {SelectAliasOrLiteral("e", orgId, "0")},
                {orgName},
                {SelectAliasOrLiteral("e", userId, "0")},
                {userName},
                {SelectAliasOrNull("e", data, "NVARCHAR(MAX)")},
                {SelectAliasOrNull("e", location, "NVARCHAR(200)")},
                {SelectAliasOrNull("e", prevHash, "NVARCHAR(500)")},
                {SelectAliasOrNull("e", currentHash, "NVARCHAR(500)")},
                {SelectAliasOrNull("e", created, "DATETIME")}
            FROM {T(e)} e
            {batchJoin}
            {orgJoin}
            {userJoin}
            ORDER BY e.{C(id)} DESC;
            """;

        return await QueryAsync(
            sql,
            r => new AdminSupplyChainEvent(
                ToInt32(r, 0),
                ToInt32(r, 1),
                ToStringValue(r, 2),
                ToStringValue(r, 3) ?? string.Empty,
                ToInt32(r, 4),
                ToStringValue(r, 5),
                ToInt32(r, 6),
                ToStringValue(r, 7),
                ToStringValue(r, 8),
                ToStringValue(r, 9),
                ToStringValue(r, 10),
                ToStringValue(r, 11),
                ToNullableDateTime(r, 12)),
            cancellationToken);
    }

    public async Task<IReadOnlyList<AdminInspection>> GetInspectionsAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var i = RequireTable(s, "Inspections", "KiemDinh", "KiemDinhs");
        var b = FindTable(s, "Batches", "LoHang", "LoHangs");
        var u = FindTable(s, "Users", "NguoiDung", "NguoiDungs");

        // Đọc bảng Inspections và LEFT JOIN sang Batches/Users (nếu tồn tại)
        // để lấy tên lô hàng và tên người kiểm định thay vì chỉ trả về id.
        // Dùng FindTable (không bắt buộc) nên nếu schema DB thực tế thiếu
        // bảng nào thì cột tương ứng sẽ về NULL thay vì làm lỗi cả trang.
        var id = RequireColumn(i, "Id", "MaKiemDinh");
        var batchId = RequireColumn(i, "BatchId", "MaLoHang");
        var inspectorId = OptionalColumn(
            i,
            "InspectorId",
            "InspectorUserId",
            "UserId",
            "PerformedByUserId",
            "MaNguoiKiemDinh",
            "MaNguoiDung")
            ?? await FindForeignKeyColumnAsync(
                i,
                cancellationToken,
                "Users",
                "NguoiDung",
                "NguoiDungs");
        var result = OptionalColumn(i, "Result", "KetQua");
        var notes = OptionalColumn(i, "Notes", "GhiChu");
        var created = OptionalColumn(
            i,
            "CreatedAt",
            "InspectionDate",
            "InspectedAt",
            "NgayKiemDinh",
            "NgayTao");

        string batchJoin = string.Empty;
        string batchCode = "CAST(NULL AS NVARCHAR(100))";
        if (b is not null)
        {
            var bid = RequireColumn(b, "Id", "MaLoHang");
            var code = OptionalColumn(b, "BatchCode", "QRCode", "QrCode", "MaQR", "MaLoHang");
            batchJoin = $"LEFT JOIN {T(b)} b ON b.{C(bid)} = i.{C(batchId)}";
            batchCode = code is null ? "CAST(NULL AS NVARCHAR(100))" : $"CONVERT(NVARCHAR(100), b.{C(code)})";
        }

        string userJoin = string.Empty;
        string inspectorName = "CAST(NULL AS NVARCHAR(200))";
        if (inspectorId is not null && u is not null)
        {
            var uid = RequireColumn(u, "Id", "MaNguoiDung");
            var uname = OptionalColumn(u, "FullName", "HoTen", "TenDangNhap", "Email");
            userJoin = $"LEFT JOIN {T(u)} u ON u.{C(uid)} = i.{C(inspectorId)}";
            inspectorName = uname is null ? "CAST(NULL AS NVARCHAR(200))" : $"CONVERT(NVARCHAR(200), u.{C(uname)})";
        }

        var sql = $"""
            SELECT
                i.{C(id)},
                i.{C(batchId)},
                {batchCode},
                {SelectAliasOrLiteral("i", inspectorId, "0")},
                {inspectorName},
                {SelectAliasOrNull("i", result, "NVARCHAR(100)")},
                {SelectAliasOrNull("i", notes, "NVARCHAR(MAX)")},
                {SelectAliasOrNull("i", created, "DATETIME")}
            FROM {T(i)} i
            {batchJoin}
            {userJoin}
            ORDER BY i.{C(id)} DESC;
            """;

        return await QueryAsync(
            sql,
            r => new AdminInspection(
                ToInt32(r, 0),
                ToInt32(r, 1),
                ToStringValue(r, 2),
                ToInt32(r, 3),
                ToStringValue(r, 4),
                ToStringValue(r, 5),
                ToStringValue(r, 6),
                ToNullableDateTime(r, 7)),
            cancellationToken);
    }

    public async Task<IReadOnlyList<AdminCertificate>> GetCertificatesAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var c = RequireTable(s, "Certificates", "ChungNhan", "ChungNhans");
        var b = FindTable(s, "Batches", "LoHang", "LoHangs");

        var id = RequireColumn(c, "Id", "MaChungNhan");
        var batchId = RequireColumn(c, "BatchId", "MaLoHang");
        var inspectionId = OptionalColumn(c, "InspectionId", "MaKiemDinh");
        var type = OptionalColumn(c, "CertificateType", "LoaiChungNhan");
        var file = OptionalColumn(c, "FileUrl", "FileChungNhanUrl");
        var issued = OptionalColumn(c, "IssuedAt", "NgayCap", "NgayTao");

        string batchJoin = string.Empty;
        string batchCode = "CAST(NULL AS NVARCHAR(100))";
        if (b is not null)
        {
            var bid = RequireColumn(b, "Id", "MaLoHang");
            var code = OptionalColumn(b, "BatchCode", "QRCode", "QrCode", "MaQR", "MaLoHang");
            batchJoin = $"LEFT JOIN {T(b)} b ON b.{C(bid)} = c.{C(batchId)}";
            batchCode = code is null ? "CAST(NULL AS NVARCHAR(100))" : $"CONVERT(NVARCHAR(100), b.{C(code)})";
        }

        var sql = $"""
            SELECT
                c.{C(id)},
                c.{C(batchId)},
                {batchCode},
                {SelectAliasOrNull("c", inspectionId, "INT")},
                {SelectAliasOrNull("c", type, "NVARCHAR(100)")},
                {SelectAliasOrNull("c", file, "NVARCHAR(500)")},
                {SelectAliasOrNull("c", issued, "DATETIME")}
            FROM {T(c)} c
            {batchJoin}
            ORDER BY c.{C(id)} DESC;
            """;

        return await QueryAsync(
            sql,
            r => new AdminCertificate(
                ToInt32(r, 0),
                ToInt32(r, 1),
                ToStringValue(r, 2),
                ToNullableInt32(r, 3),
                ToStringValue(r, 4),
                ToStringValue(r, 5),
                ToNullableDateTime(r, 6)),
            cancellationToken);
    }

    public async Task<IReadOnlyList<AdminRecall>> GetRecallsAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var rTable = RequireTable(s, "Recalls", "CanhBaoThuHoi", "CanhBaoThuHois");
        var b = FindTable(s, "Batches", "LoHang", "LoHangs");
        var u = FindTable(s, "Users", "NguoiDung", "NguoiDungs");

        var id = RequireColumn(rTable, "Id", "MaCanhBao");
        var batchId = RequireColumn(rTable, "BatchId", "MaLoHang");
        var reason = OptionalColumn(rTable, "Reason", "LyDo");
        var severity = OptionalColumn(rTable, "Severity", "MucDoNghiemTrong");
        var creator = OptionalColumn(rTable, "CreatedBy", "CreatedByUserId", "MaNguoiTao");
        var created = OptionalColumn(rTable, "CreatedAt", "ThoiGianTao", "NgayTao");

        string batchJoin = string.Empty;
        string batchCode = "CAST(NULL AS NVARCHAR(100))";
        if (b is not null)
        {
            var bid = RequireColumn(b, "Id", "MaLoHang");
            var code = OptionalColumn(b, "BatchCode", "QRCode", "QrCode", "MaQR", "MaLoHang");
            batchJoin = $"LEFT JOIN {T(b)} b ON b.{C(bid)} = r.{C(batchId)}";
            batchCode = code is null ? "CAST(NULL AS NVARCHAR(100))" : $"CONVERT(NVARCHAR(100), b.{C(code)})";
        }

        string userJoin = string.Empty;
        string creatorName = "CAST(NULL AS NVARCHAR(200))";
        if (creator is not null && u is not null)
        {
            var uid = RequireColumn(u, "Id", "MaNguoiDung");
            var uname = OptionalColumn(u, "FullName", "HoTen", "TenDangNhap", "Email");
            userJoin = $"LEFT JOIN {T(u)} u ON u.{C(uid)} = r.{C(creator)}";
            creatorName = uname is null ? "CAST(NULL AS NVARCHAR(200))" : $"CONVERT(NVARCHAR(200), u.{C(uname)})";
        }

        var sql = $"""
            SELECT
                r.{C(id)},
                r.{C(batchId)},
                {batchCode},
                {SelectAliasOrNull("r", reason, "NVARCHAR(500)")},
                {SelectAliasOrNull("r", severity, "NVARCHAR(50)")},
                {SelectAliasOrLiteral("r", creator, "0")},
                {creatorName},
                {SelectAliasOrNull("r", created, "DATETIME")}
            FROM {T(rTable)} r
            {batchJoin}
            {userJoin}
            ORDER BY r.{C(id)} DESC;
            """;

        return await QueryAsync(
            sql,
            r => new AdminRecall(
                ToInt32(r, 0),
                ToInt32(r, 1),
                ToStringValue(r, 2),
                ToStringValue(r, 3),
                ToStringValue(r, 4),
                ToInt32(r, 5),
                ToStringValue(r, 6),
                ToNullableDateTime(r, 7)),
            cancellationToken);
    }

    public async Task<AdminDashboard> GetDashboardAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var org = FindTable(s, "Organizations", "DonVi", "DonVis");
        var users = FindTable(s, "Users", "NguoiDung", "NguoiDungs");
        var batches = FindTable(s, "Batches", "LoHang", "LoHangs");
        var recalls = FindTable(s, "Recalls", "CanhBaoThuHoi", "CanhBaoThuHois");

        var organizationCount = org is null ? 0 : await CountAsync(org, cancellationToken);
        var userCount = users is null ? 0 : await CountAsync(users, cancellationToken);
        var batchCount = batches is null ? 0 : await CountAsync(batches, cancellationToken);
        var recallCount = recalls is null ? 0 : await CountAsync(recalls, cancellationToken);

        var recent = batches is null
            ? Array.Empty<AdminBatch>()
            : (await GetBatchesInternalAsync(s, 5, cancellationToken)).ToArray();

        return new AdminDashboard(
            organizationCount,
            userCount,
            batchCount,
            recallCount,
            recent);
    }

    public async Task<IReadOnlyDictionary<string, int>> GetRoleCountsAsync(
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var u = RequireTable(s, "Users", "NguoiDung", "NguoiDungs");
        var directRole = OptionalColumn(u, "Role");
        var roleId = OptionalColumn(u, "MaVaiTro", "RoleId");
        var roleTable = FindTable(s, "VaiTro", "VaiTros", "Roles");

        string sql;
        if (directRole is not null)
        {
            sql = $"""
                SELECT CONVERT(NVARCHAR(100), {C(directRole)}), COUNT(*)
                FROM {T(u)}
                GROUP BY {C(directRole)};
                """;
        }
        else if (roleId is not null && roleTable is not null)
        {
            var rid = RequireColumn(roleTable, "Id", "MaVaiTro");
            var rname = RequireColumn(roleTable, "Name", "TenVaiTro");
            sql = $"""
                SELECT CONVERT(NVARCHAR(100), r.{C(rname)}), COUNT(*)
                FROM {T(u)} u
                LEFT JOIN {T(roleTable)} r ON r.{C(rid)} = u.{C(roleId)}
                GROUP BY r.{C(rname)};
                """;
        }
        else
        {
            return new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        }

        var rows = await QueryAsync(
            sql,
            r => new KeyValuePair<string, int>(
                ToStringValue(r, 0) ?? "UNKNOWN",
                ToInt32(r, 1)),
            cancellationToken);

        return rows
            .GroupBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Value), StringComparer.OrdinalIgnoreCase);
    }

    public async Task<bool> EmailExistsAsync(
        string email,
        int? exceptUserId = null,
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var u = RequireTable(s, "Users", "NguoiDung", "NguoiDungs");
        var id = RequireColumn(u, "Id", "MaNguoiDung");
        var emailCol = RequireColumn(u, "Email", "TenDangNhap");

        var sql = $"""
            SELECT COUNT(*)
            FROM {T(u)}
            WHERE LOWER(CONVERT(NVARCHAR(400), {C(emailCol)})) = LOWER(@Email)
              AND (@ExceptUserId IS NULL OR {C(id)} <> @ExceptUserId);
            """;

        return await ExecuteScalarAsync<int>(
            sql,
            command =>
            {
                AddParameter(command, "@Email", email);
                AddParameter(command, "@ExceptUserId", exceptUserId);
            },
            cancellationToken) > 0;
    }

    public async Task<bool> OrganizationExistsAsync(
        int organizationId,
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var o = RequireTable(s, "Organizations", "DonVi", "DonVis");
        var id = RequireColumn(o, "Id", "MaDonVi");

        return await ExecuteScalarAsync<int>(
            $"SELECT COUNT(*) FROM {T(o)} WHERE {C(id)} = @Id;",
            c => AddParameter(c, "@Id", organizationId),
            cancellationToken) > 0;
    }

    public async Task<AdminUser?> GetUserByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var users = await GetUsersAsync(cancellationToken);
        return users.FirstOrDefault(x => x.Id == id);
    }

    public async Task<AdminUser> CreateUserAsync(
        string? fullName,
        string email,
        string? passwordHash,
        string role,
        int? organizationId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var u = RequireTable(s, "Users", "NguoiDung", "NguoiDungs");
        var id = RequireColumn(u, "Id", "MaNguoiDung");
        var fullNameCol = OptionalColumn(u, "FullName", "HoTen");
        var emailCol = RequireColumn(u, "Email", "TenDangNhap");
        var usernameCol = OptionalColumn(u, "Username");
        var passwordCol = OptionalColumn(u, "PasswordHash", "MatKhauHash");
        var directRole = OptionalColumn(u, "Role");
        var roleId = OptionalColumn(u, "MaVaiTro", "RoleId");
        var orgCol = OptionalColumn(u, "OrganizationId", "MaDonVi");
        var activeCol = OptionalColumn(u, "IsActive", "TrangThai");

        int? resolvedRoleId = null;
        if (directRole is null && roleId is not null)
            resolvedRoleId = await ResolveRoleIdAsync(s, role, cancellationToken);

        var columns = new List<string> { C(emailCol) };
        var values = new List<string> { "@Email" };
        var parameters = new List<(string, object?)> { ("@Email", email) };

        AddInsert(fullNameCol, "@FullName", fullName, columns, values, parameters);

        // Database.md v2.0 does not define Username, but the shared SQL Server
        // currently has Users.Username as NOT NULL. If that compatibility column
        // exists, use the normalized email as Username so INSERT works on both schemas.
        AddInsert(usernameCol, "@Username", email, columns, values, parameters);

        AddInsert(passwordCol, "@PasswordHash", passwordHash, columns, values, parameters);

        if (directRole is not null)
            AddInsert(directRole, "@Role", role, columns, values, parameters);
        else if (roleId is not null)
            AddInsert(roleId, "@RoleId", resolvedRoleId, columns, values, parameters);

        AddInsert(orgCol, "@OrganizationId", organizationId, columns, values, parameters);

        if (activeCol is not null)
        {
            var value = activeCol.Equals("TrangThai", StringComparison.OrdinalIgnoreCase)
                ? (object?)(isActive ? "ACTIVE" : "INACTIVE")
                : isActive;
            AddInsert(activeCol, "@IsActive", value, columns, values, parameters);
        }

        var sql = $"""
            INSERT INTO {T(u)} ({string.Join(", ", columns)})
            OUTPUT INSERTED.{C(id)}
            VALUES ({string.Join(", ", values)});
            """;

        var newId = await ExecuteScalarAsync<int>(
            sql,
            command =>
            {
                foreach (var p in parameters)
                    AddParameter(command, p.Item1, p.Item2);
            },
            cancellationToken);

        return (await GetUserByIdAsync(newId, cancellationToken))!;
    }

    public async Task<AdminUser?> UpdateUserAsync(
        int id,
        string? fullName,
        string email,
        string? passwordHash,
        string role,
        int? organizationId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var u = RequireTable(s, "Users", "NguoiDung", "NguoiDungs");
        var idCol = RequireColumn(u, "Id", "MaNguoiDung");
        var fullNameCol = OptionalColumn(u, "FullName", "HoTen");
        var emailCol = RequireColumn(u, "Email", "TenDangNhap");
        var usernameCol = OptionalColumn(u, "Username");
        var passwordCol = OptionalColumn(u, "PasswordHash", "MatKhauHash");
        var directRole = OptionalColumn(u, "Role");
        var roleId = OptionalColumn(u, "MaVaiTro", "RoleId");
        var orgCol = OptionalColumn(u, "OrganizationId", "MaDonVi");
        var activeCol = OptionalColumn(u, "IsActive", "TrangThai");

        int? resolvedRoleId = null;
        if (directRole is null && roleId is not null)
            resolvedRoleId = await ResolveRoleIdAsync(s, role, cancellationToken);

        var sets = new List<string> { $"{C(emailCol)} = @Email" };
        var parameters = new List<(string, object?)> { ("@Email", email), ("@Id", id) };

        AddUpdate(fullNameCol, "@FullName", fullName, sets, parameters);

        // Keep the compatibility Username column synchronized with Email when it exists.
        // On the Database.md v2.0 schema usernameCol is null, so this adds nothing.
        AddUpdate(usernameCol, "@Username", email, sets, parameters);

        if (!string.IsNullOrWhiteSpace(passwordHash))
            AddUpdate(passwordCol, "@PasswordHash", passwordHash, sets, parameters);

        if (directRole is not null)
            AddUpdate(directRole, "@Role", role, sets, parameters);
        else if (roleId is not null)
            AddUpdate(roleId, "@RoleId", resolvedRoleId, sets, parameters);

        AddUpdate(orgCol, "@OrganizationId", organizationId, sets, parameters);

        if (activeCol is not null)
        {
            var value = activeCol.Equals("TrangThai", StringComparison.OrdinalIgnoreCase)
                ? (object?)(isActive ? "ACTIVE" : "INACTIVE")
                : isActive;
            AddUpdate(activeCol, "@IsActive", value, sets, parameters);
        }

        var sql = $"""
            UPDATE {T(u)}
            SET {string.Join(", ", sets)}
            WHERE {C(idCol)} = @Id;
            SELECT @@ROWCOUNT;
            """;

        var affected = await ExecuteScalarAsync<int>(
            sql,
            command =>
            {
                foreach (var p in parameters)
                    AddParameter(command, p.Item1, p.Item2);
            },
            cancellationToken);

        return affected == 0 ? null : await GetUserByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeactivateUserAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var s = await GetSchemaAsync(cancellationToken);
        var u = RequireTable(s, "Users", "NguoiDung", "NguoiDungs");
        var idCol = RequireColumn(u, "Id", "MaNguoiDung");
        var active = OptionalColumn(u, "IsActive", "TrangThai");

        if (active is null)
            return false;

        var value = active.Equals("TrangThai", StringComparison.OrdinalIgnoreCase)
            ? (object?)"INACTIVE"
            : false;

        var affected = await ExecuteScalarAsync<int>(
            $"UPDATE {T(u)} SET {C(active)} = @Inactive WHERE {C(idCol)} = @Id; SELECT @@ROWCOUNT;",
            command =>
            {
                AddParameter(command, "@Inactive", value);
                AddParameter(command, "@Id", id);
            },
            cancellationToken);

        return affected > 0;
    }

    private async Task<IReadOnlyList<AdminBatch>> GetBatchesInternalAsync(
        DatabaseSchema s,
        int? top,
        CancellationToken cancellationToken)
    {
        var b = RequireTable(s, "Batches", "LoHang", "LoHangs");
        var p = FindTable(s, "Products", "SanPham", "SanPhams");
        var o = FindTable(s, "Organizations", "DonVi", "DonVis");

        var id = RequireColumn(b, "Id", "MaLoHang");
        var productId = RequireColumn(b, "ProductId", "MaSanPham");
        var batchCode = OptionalColumn(b, "BatchCode", "QRCode", "QrCode", "MaQR");
        var quantity = OptionalColumn(b, "Quantity", "Weight", "KhoiLuong");
        var currentOrg = OptionalColumn(b, "CurrentOrganizationId", "ProducerOrganizationId", "MaDonVi", "MaDonViHienTai", "MaDonViSanXuat");
        var parent = OptionalColumn(b, "ParentBatchId", "MaLoHangCha");
        var root = OptionalColumn(b, "RootBatchId", "MaLoHangGoc");
        var qr = OptionalColumn(b, "QRCode", "QrCode", "MaQR");
        var created = OptionalColumn(b, "CreatedAt", "NgayTao", "ThoiGianTao", "NgayThuHoach");

        string productJoin = string.Empty;
        string productName = "CAST(NULL AS NVARCHAR(200))";
        if (p is not null)
        {
            var pid = RequireColumn(p, "Id", "MaSanPham");
            var pname = OptionalColumn(p, "Name", "TenSanPham");
            productJoin = $"LEFT JOIN {T(p)} p ON p.{C(pid)} = b.{C(productId)}";
            productName = pname is null ? "CAST(NULL AS NVARCHAR(200))" : $"CONVERT(NVARCHAR(200), p.{C(pname)})";
        }

        string orgJoin = string.Empty;
        string orgName = "CAST(NULL AS NVARCHAR(200))";
        if (currentOrg is not null && o is not null)
        {
            var oid = RequireColumn(o, "Id", "MaDonVi");
            var oname = RequireColumn(o, "Name", "TenDonVi");
            orgJoin = $"LEFT JOIN {T(o)} o ON o.{C(oid)} = b.{C(currentOrg)}";
            orgName = $"o.{C(oname)}";
        }

        var topSql = top.HasValue ? $"TOP ({top.Value})" : string.Empty;
        var batchCodeExpr = batchCode is null
            ? $"CONVERT(NVARCHAR(100), b.{C(id)})"
            : $"CONVERT(NVARCHAR(100), b.{C(batchCode)})";

        var sql = $"""
            SELECT {topSql}
                b.{C(id)},
                b.{C(productId)},
                {productName},
                {batchCodeExpr},
                {SelectAliasOrLiteral("b", quantity, "0")},
                {SelectAliasOrNull("b", currentOrg, "INT")},
                {orgName},
                {SelectAliasOrNull("b", parent, "INT")},
                {SelectAliasOrNull("b", root, "INT")},
                {SelectAliasOrNull("b", qr, "NVARCHAR(500)")},
                {SelectAliasOrNull("b", created, "DATETIME")}
            FROM {T(b)} b
            {productJoin}
            {orgJoin}
            ORDER BY {SelectOrderColumn("b", created, id)} DESC, b.{C(id)} DESC;
            """;

        return await QueryAsync(sql, MapBatch, cancellationToken);
    }

    private async Task<int> ResolveRoleIdAsync(
        DatabaseSchema s,
        string role,
        CancellationToken cancellationToken)
    {
        var rt = RequireTable(s, "VaiTro", "VaiTros", "Roles");
        var id = RequireColumn(rt, "Id", "MaVaiTro");
        var name = RequireColumn(rt, "Name", "TenVaiTro");

        var roleId = await ExecuteScalarNullableIntAsync(
            $"SELECT TOP (1) {C(id)} FROM {T(rt)} WHERE UPPER(CONVERT(NVARCHAR(100), {C(name)})) = UPPER(@Role);",
            c => AddParameter(c, "@Role", role),
            cancellationToken);

        if (!roleId.HasValue)
            throw new InvalidOperationException($"Không tìm thấy vai trò '{role}' trong bảng {rt.Name}.");

        return roleId.Value;
    }

    private async Task<int> CountAsync(TableSchema table, CancellationToken cancellationToken) =>
        await ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM {T(table)};", _ => { }, cancellationToken);

    private async Task<DatabaseSchema> GetSchemaAsync(CancellationToken cancellationToken)
    {
        if (_schema is not null)
            return _schema;

        var rows = await WithConnectionAsync<
            List<(string Schema, string Table, string Column)>>(
            async connection =>
            {
                await using var command = connection.CreateCommand();
                command.CommandText = """
                    SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;
                    """;

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var result = new List<(string Schema, string Table, string Column)>();
                while (await reader.ReadAsync(cancellationToken))
                {
                    result.Add((
                        reader.GetString(0),
                        reader.GetString(1),
                        reader.GetString(2)));
                }
                return result;
            },
            cancellationToken);

        var tables = rows
            .GroupBy(x => (x.Schema, x.Table))
            .Select(g => new TableSchema(
                g.Key.Schema,
                g.Key.Table,
                new HashSet<string>(g.Select(x => x.Column), StringComparer.OrdinalIgnoreCase)))
            .ToList();

        _schema = new DatabaseSchema(tables);
        return _schema;
    }

    private static TableSchema RequireTable(DatabaseSchema schema, params string[] candidates) =>
        FindTable(schema, candidates)
        ?? throw new InvalidOperationException(
            $"Không tìm thấy bảng phù hợp. Cần một trong các bảng: {string.Join(", ", candidates)}.");

    private static TableSchema? FindTable(DatabaseSchema schema, params string[] candidates)
    {
        foreach (var candidate in candidates)
        {
            var table = schema.Tables.FirstOrDefault(x =>
                x.Name.Equals(candidate, StringComparison.OrdinalIgnoreCase));
            if (table is not null)
                return table;
        }
        return null;
    }

    private static string RequireColumn(TableSchema table, params string[] candidates) =>
        OptionalColumn(table, candidates)
        ?? throw new InvalidOperationException(
            $"Bảng {table.Name} thiếu cột bắt buộc. Cần một trong các cột: {string.Join(", ", candidates)}.");

    private static string? OptionalColumn(TableSchema table, params string[] candidates)
    {
        foreach (var candidate in candidates)
        {
            var column = table.Columns.FirstOrDefault(x =>
                x.Equals(candidate, StringComparison.OrdinalIgnoreCase));
            if (column is not null)
                return column;
        }
        return null;
    }

    // Nếu DB thực tế dùng tên cột khác Database.md, tìm cột FK của bảng hiện tại
    // đang trỏ tới bảng Users. Nhờ vậy không cần đoán tên InspectorId/UserId.
    private async Task<string?> FindForeignKeyColumnAsync(
        TableSchema sourceTable,
        CancellationToken cancellationToken,
        params string[] referencedTableCandidates)
    {
        return await WithConnectionAsync<string?>(
            async connection =>
            {
                await using var command = connection.CreateCommand();

                var conditions = new List<string>();
                for (var index = 0; index < referencedTableCandidates.Length; index++)
                {
                    var parameterName = $"@ReferencedTable{index}";
                    conditions.Add($"rt.name = {parameterName}");
                    AddParameter(command, parameterName, referencedTableCandidates[index]);
                }

                AddParameter(command, "@SourceSchema", sourceTable.Schema);
                AddParameter(command, "@SourceTable", sourceTable.Name);

                command.CommandText = $"""
                    SELECT TOP (1) pc.name
                    FROM sys.foreign_key_columns fkc
                    INNER JOIN sys.tables pt
                        ON pt.object_id = fkc.parent_object_id
                    INNER JOIN sys.schemas ps
                        ON ps.schema_id = pt.schema_id
                    INNER JOIN sys.columns pc
                        ON pc.object_id = fkc.parent_object_id
                       AND pc.column_id = fkc.parent_column_id
                    INNER JOIN sys.tables rt
                        ON rt.object_id = fkc.referenced_object_id
                    WHERE ps.name = @SourceSchema
                      AND pt.name = @SourceTable
                      AND ({string.Join(" OR ", conditions)})
                    ORDER BY fkc.constraint_column_id;
                    """;

                var value = await command.ExecuteScalarAsync(cancellationToken);
                return value is null or DBNull ? null : Convert.ToString(value);
            },
            cancellationToken);
    }

    private static string T(TableSchema table) => $"{C(table.Schema)}.{C(table.Name)}";
    private static string C(string identifier) => $"[{identifier.Replace("]", "]]", StringComparison.Ordinal)}]";
    private static string SelectOrNull(string? column, string sqlType) =>
        column is null ? $"CAST(NULL AS {sqlType})" : C(column);
    private static string SelectOrLiteral(string? column, string literal) =>
        column is null ? literal : C(column);
    private static string SelectAliasOrNull(string alias, string? column, string sqlType) =>
        column is null ? $"CAST(NULL AS {sqlType})" : $"{alias}.{C(column)}";
    private static string SelectAliasOrLiteral(string alias, string? column, string literal) =>
        column is null ? literal : $"{alias}.{C(column)}";
    private static string SelectOrderColumn(string alias, string? preferred, string fallback) =>
        preferred is null ? $"{alias}.{C(fallback)}" : $"{alias}.{C(preferred)}";

    private static void AddInsert(
        string? column,
        string parameterName,
        object? value,
        ICollection<string> columns,
        ICollection<string> values,
        ICollection<(string, object?)> parameters)
    {
        if (column is null) return;
        columns.Add(C(column));
        values.Add(parameterName);
        parameters.Add((parameterName, value));
    }

    private static void AddUpdate(
        string? column,
        string parameterName,
        object? value,
        ICollection<string> sets,
        ICollection<(string, object?)> parameters)
    {
        if (column is null) return;
        sets.Add($"{C(column)} = {parameterName}");
        parameters.Add((parameterName, value));
    }

    private static AdminBatch MapBatch(DbDataReader r) => new(
        ToInt32(r, 0),
        ToInt32(r, 1),
        ToStringValue(r, 2),
        ToStringValue(r, 3) ?? string.Empty,
        ToDecimal(r, 4),
        ToNullableInt32(r, 5),
        ToStringValue(r, 6),
        ToNullableInt32(r, 7),
        ToNullableInt32(r, 8),
        ToStringValue(r, 9),
        ToNullableDateTime(r, 10));

    private static AdminUser MapUser(DbDataReader r) => new(
        ToInt32(r, 0),
        ToStringValue(r, 1),
        ToStringValue(r, 2) ?? string.Empty,
        ToStringValue(r, 3) ?? "USER",
        ToNullableInt32(r, 4),
        ToStringValue(r, 5),
        !r.IsDBNull(6) && Convert.ToBoolean(r.GetValue(6)),
        ToNullableDateTime(r, 7));

    private async Task<IReadOnlyList<T>> QueryAsync<T>(
        string sql,
        Func<DbDataReader, T> map,
        CancellationToken cancellationToken) =>
        await QueryAsync(sql, map, _ => { }, cancellationToken);

    private async Task<IReadOnlyList<T>> QueryAsync<T>(
        string sql,
        Func<DbDataReader, T> map,
        Action<DbCommand> configure,
        CancellationToken cancellationToken)
    {
        return await WithConnectionAsync<IReadOnlyList<T>>(
            async connection =>
            {
                await using var command = connection.CreateCommand();
                command.CommandText = sql;
                configure(command);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var result = new List<T>();
                while (await reader.ReadAsync(cancellationToken))
                    result.Add(map(reader));
                return (IReadOnlyList<T>)result;
            },
            cancellationToken);
    }

    private async Task<T> ExecuteScalarAsync<T>(
        string sql,
        Action<DbCommand> configure,
        CancellationToken cancellationToken)
    {
        return await WithConnectionAsync<T>(
            async connection =>
            {
                await using var command = connection.CreateCommand();
                command.CommandText = sql;
                configure(command);
                var value = await command.ExecuteScalarAsync(cancellationToken);
                return (T)Convert.ChangeType(value!, typeof(T));
            },
            cancellationToken);
    }

    private async Task<int?> ExecuteScalarNullableIntAsync(
        string sql,
        Action<DbCommand> configure,
        CancellationToken cancellationToken)
    {
        return await WithConnectionAsync<int?>(
            async connection =>
            {
                await using var command = connection.CreateCommand();
                command.CommandText = sql;
                configure(command);
                var value = await command.ExecuteScalarAsync(cancellationToken);
                return value is null or DBNull ? null : Convert.ToInt32(value);
            },
            cancellationToken);
    }

    private async Task<T> WithConnectionAsync<T>(
        Func<DbConnection, Task<T>> action,
        CancellationToken cancellationToken)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
            await connection.OpenAsync(cancellationToken);

        try
        {
            return await action(connection);
        }
        finally
        {
            if (shouldClose)
                await connection.CloseAsync();
        }
    }

    private static void AddParameter(DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }

    private static int ToInt32(DbDataReader r, int i) =>
        r.IsDBNull(i) ? 0 : Convert.ToInt32(r.GetValue(i));

    private static int? ToNullableInt32(DbDataReader r, int i) =>
        r.IsDBNull(i) ? null : Convert.ToInt32(r.GetValue(i));

    private static decimal ToDecimal(DbDataReader r, int i) =>
        r.IsDBNull(i) ? 0m : Convert.ToDecimal(r.GetValue(i));

    private static string? ToStringValue(DbDataReader r, int i) =>
        r.IsDBNull(i) ? null : Convert.ToString(r.GetValue(i));

    private static DateTime? ToNullableDateTime(DbDataReader r, int i) =>
        r.IsDBNull(i) ? null : Convert.ToDateTime(r.GetValue(i));

    private sealed record DatabaseSchema(IReadOnlyList<TableSchema> Tables);
    private sealed record TableSchema(string Schema, string Name, HashSet<string> Columns);
}