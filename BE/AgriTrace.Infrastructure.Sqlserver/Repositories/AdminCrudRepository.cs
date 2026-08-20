using System.Data;
using System.Data.Common;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class AdminCrudRepository(
    ApplicationDbContext db,
    IAdminRepository readRepository)
    : IAdminCrudRepository
{
    private DatabaseSchema? _schema;

    // =========================================================
    // ORGANIZATIONS
    // =========================================================

    public async Task<AdminOrganization> CreateOrganizationAsync(
        string name,
        string type,
        string status,
        CancellationToken ct = default)
    {
        var s = await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Organizations",
                "DonVi",
                "DonVis");

        var id =
            RequireColumn(
                table,
                "Id",
                "MaDonVi");

        var nameCol =
            RequireColumn(
                table,
                "Name",
                "TenDonVi");

        var typeCol =
            OptionalColumn(
                table,
                "Type",
                "OrganizationType",
                "LoaiDonVi");

        var statusCol =
            OptionalColumn(
                table,
                "Status",
                "TrangThai");

        var columns =
            new List<string>
            {
                C(nameCol)
            };

        var values =
            new List<string>
            {
                "@Name"
            };

        var parameters =
            new List<(string, object?)>
            {
                ("@Name", name.Trim())
            };

        AddInsert(
            typeCol,
            "@Type",
            type.Trim(),
            columns,
            values,
            parameters);

        AddInsert(
            statusCol,
            "@Status",
            status.Trim(),
            columns,
            values,
            parameters);

        var newId =
            await InsertAndReturnIdAsync(
                table,
                id,
                columns,
                values,
                parameters,
                ct);

        return (
            await readRepository
                .GetOrganizationsAsync(ct)
        ).First(x => x.Id == newId);
    }

    public async Task<AdminOrganization?> UpdateOrganizationAsync(
        int id,
        string name,
        string type,
        string status,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Organizations",
                "DonVi",
                "DonVis");

        var idCol =
            RequireColumn(
                table,
                "Id",
                "MaDonVi");

        var nameCol =
            RequireColumn(
                table,
                "Name",
                "TenDonVi");

        var typeCol =
            OptionalColumn(
                table,
                "Type",
                "OrganizationType",
                "LoaiDonVi");

        var statusCol =
            OptionalColumn(
                table,
                "Status",
                "TrangThai");

        var sets =
            new List<string>
            {
                $"{C(nameCol)} = @Name"
            };

        var parameters =
            new List<(string, object?)>
            {
                ("@Name", name.Trim()),
                ("@Id", id)
            };

        AddUpdate(
            typeCol,
            "@Type",
            type.Trim(),
            sets,
            parameters);

        AddUpdate(
            statusCol,
            "@Status",
            status.Trim(),
            sets,
            parameters);

        var updated =
            await UpdateAsync(
                table,
                idCol,
                sets,
                parameters,
                ct);

        if (!updated)
            return null;

        return (
            await readRepository
                .GetOrganizationsAsync(ct)
        ).FirstOrDefault(
            x => x.Id == id);
    }

    // Organization thường đang được Users/Products/Batches tham chiếu.
    // Vì vậy DELETE của Admin sẽ chuyển Status -> INACTIVE thay vì hard delete.
    public async Task<bool> DeactivateOrganizationAsync(
        int id,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Organizations",
                "DonVi",
                "DonVis");

        var idCol =
            RequireColumn(
                table,
                "Id",
                "MaDonVi");

        var statusCol =
            RequireColumn(
                table,
                "Status",
                "TrangThai");

        return await UpdateAsync(
            table,
            idCol,
            new List<string>
            {
                $"{C(statusCol)} = @Status"
            },
            new List<(string, object?)>
            {
                ("@Status", "INACTIVE"),
                ("@Id", id)
            },
            ct);
    }


    // =========================================================
    // PRODUCTS
    // =========================================================

    public async Task<AdminProduct> CreateProductAsync(
        string? name,
        string? category,
        string? unit,
        int organizationId,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Products",
                "SanPham",
                "SanPhams");

        var id =
            RequireColumn(
                table,
                "Id",
                "MaSanPham");

        var nameCol =
            OptionalColumn(
                table,
                "Name",
                "TenSanPham");

        var categoryCol =
            OptionalColumn(
                table,
                "Category",
                "LoaiSanPham");

        var unitCol =
            OptionalColumn(
                table,
                "Unit",
                "DonViTinh");

        // Database.md v2 co OrganizationId, nhung database/project cu co the
        // chua co cot nay. De Admin Product chay duoc tren ca hai schema,
        // OrganizationId duoc doc theo kieu optional. Neu cot ton tai thi
        // INSERT/UPDATE se luu OrganizationId; neu khong thi bo qua.
        var orgCol =
            OptionalColumn(
                table,
                "OrganizationId",
                "MaDonVi",
                "MaDonViSanXuat");

        var columns = new List<string>();
        var values = new List<string>();

        var parameters =
            new List<(string, object?)>();

        AddInsert(
            nameCol,
            "@Name",
            NullIfWhiteSpace(name),
            columns,
            values,
            parameters);

        AddInsert(
            categoryCol,
            "@Category",
            NullIfWhiteSpace(category),
            columns,
            values,
            parameters);

        AddInsert(
            unitCol,
            "@Unit",
            NullIfWhiteSpace(unit),
            columns,
            values,
            parameters);

        AddInsert(
            orgCol,
            "@OrganizationId",
            organizationId,
            columns,
            values,
            parameters);

        var newId =
            await InsertAndReturnIdAsync(
                table,
                id,
                columns,
                values,
                parameters,
                ct);

        return (
            await readRepository
                .GetProductsAsync(ct)
        ).First(x => x.Id == newId);
    }

    public async Task<AdminProduct?> UpdateProductAsync(
        int id,
        string? name,
        string? category,
        string? unit,
        int organizationId,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Products",
                "SanPham",
                "SanPhams");

        var idCol =
            RequireColumn(
                table,
                "Id",
                "MaSanPham");

        var nameCol =
            OptionalColumn(
                table,
                "Name",
                "TenSanPham");

        var categoryCol =
            OptionalColumn(
                table,
                "Category",
                "LoaiSanPham");

        var unitCol =
            OptionalColumn(
                table,
                "Unit",
                "DonViTinh");

        // Database.md v2 co OrganizationId, nhung database/project cu co the
        // chua co cot nay. De Admin Product chay duoc tren ca hai schema,
        // OrganizationId duoc doc theo kieu optional. Neu cot ton tai thi
        // INSERT/UPDATE se luu OrganizationId; neu khong thi bo qua.
        var orgCol =
            OptionalColumn(
                table,
                "OrganizationId",
                "MaDonVi",
                "MaDonViSanXuat");

        var sets =
            new List<string>();

        var parameters =
            new List<(string, object?)>
            {
                ("@Id", id)
            };

        AddUpdate(
            nameCol,
            "@Name",
            NullIfWhiteSpace(name),
            sets,
            parameters);

        AddUpdate(
            categoryCol,
            "@Category",
            NullIfWhiteSpace(category),
            sets,
            parameters);

        AddUpdate(
            unitCol,
            "@Unit",
            NullIfWhiteSpace(unit),
            sets,
            parameters);

        AddUpdate(
            orgCol,
            "@OrganizationId",
            organizationId,
            sets,
            parameters);

        if (!await UpdateAsync(
                table,
                idCol,
                sets,
                parameters,
                ct))
        {
            return null;
        }

        return (
            await readRepository.GetProductsAsync(ct)
        ).FirstOrDefault(
            x => x.Id == id);
    }

    public Task<bool> DeleteProductAsync(
        int id,
        CancellationToken ct = default) =>
        DeleteByIdAsync(
            "Products",
            new[]
            {
                "SanPham",
                "SanPhams"
            },
            new[]
            {
                "Id",
                "MaSanPham"
            },
            id,
            ct);


    // =========================================================
    // BATCHES
    // =========================================================

    public async Task<AdminBatch> CreateBatchAsync(
        int productId,
        string batchCode,
        decimal quantity,
        int? currentOrganizationId,
        int? parentBatchId,
        int? rootBatchId,
        string? qrCode,
        CancellationToken ct = default)
    {
        var s = await GetSchemaAsync(ct);

        var table = RequireTable(
            s,
            "Batches",
            "LoHang",
            "LoHangs");

        var id = RequireColumn(
            table,
            "Id",
            "MaLoHang");

        var product = RequireColumn(
            table,
            "ProductId",
            "MaSanPham");

        // Schema mới trong docs dùng BatchCode + Quantity + CurrentOrganizationId.
        // Schema cũ của project dùng QrCode + Weight + ProducerOrganizationId + Status.
        var batchCodeCol = OptionalColumn(
            table,
            "BatchCode",
            "MaLoHang");

        var qrCol = OptionalColumn(
            table,
            "QRCode",
            "QrCode",
            "MaQR");

        var quantityCol = OptionalColumn(
            table,
            "Quantity",
            "Weight",
            "KhoiLuong");

        var organizationCol = OptionalColumn(
            table,
            "CurrentOrganizationId",
            "ProducerOrganizationId",
            "MaDonViHienTai",
            "MaDonViSanXuat",
            "MaDonVi");

        var parentCol = OptionalColumn(
            table,
            "ParentBatchId",
            "MaLoHangCha");

        var rootCol = OptionalColumn(
            table,
            "RootBatchId",
            "MaLoHangGoc");

        var statusCol = OptionalColumn(
            table,
            "Status",
            "TrangThai");

        var harvestDateCol = OptionalColumn(
            table,
            "HarvestDate",
            "NgayThuHoach");

        // Schema cũ của project có CreatedAt NOT NULL và không cấu hình DEFAULT.
        // Schema mới trong Database.md có DEFAULT GETDATE().
        // Ghi rõ giá trị để chạy được với cả hai schema.
        var createdAtCol = OptionalColumn(
            table,
            "CreatedAt",
            "NgayTao",
            "ThoiGianTao");

        if (batchCodeCol is null && qrCol is null)
        {
            throw new InvalidOperationException(
                $"Bảng {table.Name} không có cột BatchCode/QRCode để lưu mã lô.");
        }

        if (quantityCol is null)
        {
            throw new InvalidOperationException(
                $"Bảng {table.Name} không có cột Quantity/Weight để lưu số lượng.");
        }

        // Schema cũ bắt buộc ProducerOrganizationId NOT NULL.
        if (organizationCol is not null && !currentOrganizationId.HasValue)
        {
            throw new InvalidOperationException(
                "Bạn phải chọn Đơn vị hiện tại/Tổ chức khi tạo lô hàng.");
        }

        var columns = new List<string>();
        var values = new List<string>();
        var parameters = new List<(string, object?)>();

        AddInsert(
            product,
            "@ProductId",
            productId,
            columns,
            values,
            parameters);

        if (batchCodeCol is not null)
        {
            AddInsert(
                batchCodeCol,
                "@BatchCode",
                batchCode.Trim(),
                columns,
                values,
                parameters);
        }

        // Với schema cũ, QrCode là mã bắt buộc và unique.
        if (qrCol is not null &&
            (batchCodeCol is null ||
             !qrCol.Equals(batchCodeCol, StringComparison.OrdinalIgnoreCase)))
        {
            var qrValue = NullIfWhiteSpace(qrCode) ?? batchCode.Trim();

            AddInsert(
                qrCol,
                "@QRCode",
                qrValue,
                columns,
                values,
                parameters);
        }

        AddInsert(
            quantityCol,
            "@Quantity",
            quantity,
            columns,
            values,
            parameters);

        AddInsert(
            organizationCol,
            "@OrganizationId",
            currentOrganizationId,
            columns,
            values,
            parameters);

        AddInsert(
            parentCol,
            "@ParentBatchId",
            parentBatchId,
            columns,
            values,
            parameters);

        AddInsert(
            rootCol,
            "@RootBatchId",
            rootBatchId,
            columns,
            values,
            parameters);

        // Schema cũ có Status NOT NULL nhưng form Admin hiện chưa có Status.
        // Tự gán trạng thái khởi tạo hợp lệ.
        AddInsert(
            statusCol,
            "@Status",
            "Created",
            columns,
            values,
            parameters);

        // HarvestDate của schema cũ nullable. Nếu tồn tại thì để null.
        AddInsert(
            harvestDateCol,
            "@HarvestDate",
            null,
            columns,
            values,
            parameters);

        // Quan trọng: BatchDataModel cũ có CreatedAt bắt buộc nhưng không có default.
        AddInsert(
            createdAtCol,
            "@CreatedAt",
            DateTime.UtcNow,
            columns,
            values,
            parameters);

        var newId = await InsertAndReturnIdAsync(
            table,
            id,
            columns,
            values,
            parameters,
            ct);

        return (
            await readRepository.GetBatchesAsync(ct)
        ).First(x => x.Id == newId);
    }

    public async Task<AdminBatch?> UpdateBatchAsync(
        int id,
        int productId,
        string batchCode,
        decimal quantity,
        int? currentOrganizationId,
        int? parentBatchId,
        int? rootBatchId,
        string? qrCode,
        CancellationToken ct = default)
    {
        var s = await GetSchemaAsync(ct);

        var table = RequireTable(
            s,
            "Batches",
            "LoHang",
            "LoHangs");

        var idCol = RequireColumn(
            table,
            "Id",
            "MaLoHang");

        var product = RequireColumn(
            table,
            "ProductId",
            "MaSanPham");

        var batchCodeCol = OptionalColumn(
            table,
            "BatchCode",
            "MaLoHang");

        var qrCol = OptionalColumn(
            table,
            "QRCode",
            "QrCode",
            "MaQR");

        var quantityCol = OptionalColumn(
            table,
            "Quantity",
            "Weight",
            "KhoiLuong");

        var organizationCol = OptionalColumn(
            table,
            "CurrentOrganizationId",
            "ProducerOrganizationId",
            "MaDonViHienTai",
            "MaDonViSanXuat",
            "MaDonVi");

        var parentCol = OptionalColumn(
            table,
            "ParentBatchId",
            "MaLoHangCha");

        var rootCol = OptionalColumn(
            table,
            "RootBatchId",
            "MaLoHangGoc");

        if (batchCodeCol is null && qrCol is null)
        {
            throw new InvalidOperationException(
                $"Bảng {table.Name} không có cột BatchCode/QRCode để lưu mã lô.");
        }

        if (quantityCol is null)
        {
            throw new InvalidOperationException(
                $"Bảng {table.Name} không có cột Quantity/Weight để lưu số lượng.");
        }

        if (organizationCol is not null && !currentOrganizationId.HasValue)
        {
            throw new InvalidOperationException(
                "Bạn phải chọn Đơn vị hiện tại/Tổ chức khi sửa lô hàng.");
        }

        var sets = new List<string>();
        var parameters = new List<(string, object?)>
        {
            ("@Id", id)
        };

        AddUpdate(
            product,
            "@ProductId",
            productId,
            sets,
            parameters);

        if (batchCodeCol is not null)
        {
            AddUpdate(
                batchCodeCol,
                "@BatchCode",
                batchCode.Trim(),
                sets,
                parameters);
        }

        if (qrCol is not null &&
            (batchCodeCol is null ||
             !qrCol.Equals(batchCodeCol, StringComparison.OrdinalIgnoreCase)))
        {
            var qrValue = NullIfWhiteSpace(qrCode) ?? batchCode.Trim();

            AddUpdate(
                qrCol,
                "@QRCode",
                qrValue,
                sets,
                parameters);
        }

        AddUpdate(
            quantityCol,
            "@Quantity",
            quantity,
            sets,
            parameters);

        AddUpdate(
            organizationCol,
            "@OrganizationId",
            currentOrganizationId,
            sets,
            parameters);

        AddUpdate(
            parentCol,
            "@ParentBatchId",
            parentBatchId,
            sets,
            parameters);

        AddUpdate(
            rootCol,
            "@RootBatchId",
            rootBatchId,
            sets,
            parameters);

        if (!await UpdateAsync(
                table,
                idCol,
                sets,
                parameters,
                ct))
        {
            return null;
        }

        return (
            await readRepository.GetBatchesAsync(ct)
        ).FirstOrDefault(x => x.Id == id);
    }

    public Task<bool> DeleteBatchAsync(
        int id,
        CancellationToken ct = default) =>
        DeleteByIdAsync(
            "Batches",
            new[]
            {
                "LoHang",
                "LoHangs"
            },
            new[]
            {
                "Id",
                "MaLoHang"
            },
            id,
            ct);

    // =========================================================
    // EVENTS
    // =========================================================

    // Event chỉ có Create vì Database.md quy định event append-only.
    public async Task<AdminSupplyChainEvent> CreateEventAsync(
        int batchId,
        string eventType,
        int organizationId,
        int userId,
        string? eventData,
        string? location,
        string? previousHash,
        string? currentHash,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "SupplyChainEvents",
                "SuKien",
                "SuKiens");

        var id =
            RequireColumn(
                table,
                "Id",
                "MaSuKien");

        var batch =
            RequireColumn(
                table,
                "BatchId",
                "MaLoHang");

        var type =
            RequireColumn(
                table,
                "EventType",
                "LoaiSuKien");

        var org =
            RequireColumn(
                table,
                "OrganizationId",
                "MaDonViThucHien",
                "MaDonVi");

        var user =
            RequireColumn(
                table,
                "UserId",
                "PerformedByUserId",
                "MaNguoiThucHien",
                "MaNguoiDung");

        var data =
            OptionalColumn(
                table,
                "EventData",
                "AdditionalData",
                "DuLieuBoSung");

        var locationCol =
            OptionalColumn(
                table,
                "Location",
                "ViTri");

        var previous =
            OptionalColumn(
                table,
                "PreviousHash",
                "MaHashTruoc");

        var current =
            OptionalColumn(
                table,
                "CurrentHash",
                "Hash",
                "MaHash");

        var created =
            OptionalColumn(
                table,
                "CreatedAt",
                "EventTime",
                "ThoiGian",
                "NgayTao");

        var previousEventId =
            OptionalColumn(
                table,
                "PreviousEventId");

        var columns = new List<string>();
        var values = new List<string>();

        var parameters =
            new List<(string, object?)>();

        AddInsert(
            batch,
            "@BatchId",
            batchId,
            columns,
            values,
            parameters);

        AddInsert(
            type,
            "@EventType",
            eventType.Trim(),
            columns,
            values,
            parameters);

        AddInsert(
            org,
            "@OrganizationId",
            organizationId,
            columns,
            values,
            parameters);

        AddInsert(
            user,
            "@UserId",
            userId,
            columns,
            values,
            parameters);

        AddInsert(
            data,
            "@EventData",
            NullIfWhiteSpace(eventData),
            columns,
            values,
            parameters);

        AddInsert(
            locationCol,
            "@Location",
            NullIfWhiteSpace(location),
            columns,
            values,
            parameters);

        AddInsert(
            previous,
            "@PreviousHash",
            NullIfWhiteSpace(previousHash),
            columns,
            values,
            parameters);

        var now = DateTime.UtcNow;
        var effectiveCurrentHash =
            NullIfWhiteSpace(currentHash)
            ?? Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(
                    System.Text.Encoding.UTF8.GetBytes(
                        $"{batchId}|{eventType}|{organizationId}|{userId}|{HashCanonical.Timestamp(now)}|{eventData}|{location}")));

        AddInsert(
            current,
            "@CurrentHash",
            effectiveCurrentHash,
            columns,
            values,
            parameters);

        AddInsert(
            created,
            "@CreatedAt",
            now,
            columns,
            values,
            parameters);

        // Schema cũ có PreviousEventId. Với event đầu tiên để NULL.
        AddInsert(
            previousEventId,
            "@PreviousEventId",
            null,
            columns,
            values,
            parameters);

        var newId =
            await InsertAndReturnIdAsync(
                table,
                id,
                columns,
                values,
                parameters,
                ct);

        return (
            await readRepository.GetEventsAsync(ct)
        ).First(
            x => x.Id == newId);
    }


    // =========================================================
    // INSPECTIONS
    // =========================================================

    public async Task<AdminInspection> CreateInspectionAsync(
        int batchId,
        int inspectorId,
        string? result,
        string? notes,
        CancellationToken ct = default)
    {
        var s = await GetSchemaAsync(ct);

        var table = FindTable(
            s,
            "Inspections",
            "Inspection",
            "QualityInspections",
            "QualityInspection",
            "KiemDinh",
            "KiemDinhs")
            ?? FindTableByColumns(
                s,
                new[] { "BatchId", "MaLoHang" },
                new[] { "InspectorId", "InspectorUserId", "UserId", "PerformedByUserId", "MaNguoiKiemDinh", "MaNguoiDung" })
            ?? throw new InvalidOperationException(
                "Database chưa có bảng Inspections phù hợp với BE/docs/Database.md.");

        var id = RequireColumn(table, "Id", "InspectionId", "MaKiemDinh");
        var batch = RequireColumn(table, "BatchId", "MaLoHang");
        var inspector = OptionalColumn(
            table,
            "InspectorId",
            "InspectorUserId",
            "UserId",
            "PerformedByUserId",
            "MaNguoiKiemDinh",
            "MaNguoiDung")
            ?? await FindForeignKeyColumnAsync(
                table,
                ct,
                "Users",
                "NguoiDung",
                "NguoiDungs")
            ?? throw new InvalidOperationException(
                $"Bảng {table.Name} không có cột người kiểm định và cũng không có FK tới Users. " +
                $"Các cột hiện có: {string.Join(", ", table.Columns.OrderBy(x => x))}");
        var resultCol = OptionalColumn(table, "Result", "KetQua");
        var notesCol = OptionalColumn(table, "Notes", "GhiChu");

        // CreatedAt trong Database.md có DEFAULT GETDATE(), vì vậy không tự truyền
        // thời gian để tránh xung đột kiểu dữ liệu ở DB cũ.
        var columns = new List<string>();
        var values = new List<string>();
        var parameters = new List<(string, object?)>();

        AddInsert(batch, "@BatchId", batchId, columns, values, parameters);
        AddInsert(inspector, "@InspectorId", inspectorId, columns, values, parameters);
        AddInsert(resultCol, "@Result", NullIfWhiteSpace(result)?.ToUpperInvariant(), columns, values, parameters);
        AddInsert(notesCol, "@Notes", NullIfWhiteSpace(notes), columns, values, parameters);

        var newId = await InsertAndReturnIdAsync(
            table,
            id,
            columns,
            values,
            parameters,
            ct);

        // Không gọi GetInspectionsAsync ngay sau INSERT. Nếu DB cũ có kiểu dữ liệu
        // khác, bản ghi vẫn được tạo thành công và GET sẽ tự đọc lại ở request sau.
        return new AdminInspection(
            newId,
            batchId,
            null,
            inspectorId,
            null,
            NullIfWhiteSpace(result)?.ToUpperInvariant(),
            NullIfWhiteSpace(notes),
            DateTime.UtcNow);
    }

    public async Task<AdminInspection?> UpdateInspectionAsync(
        int id,
        int batchId,
        int inspectorId,
        string? result,
        string? notes,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Inspections",
                "KiemDinh",
                "KiemDinhs");

        var idCol =
            RequireColumn(
                table,
                "Id",
                "MaKiemDinh");

        var batch =
            RequireColumn(
                table,
                "BatchId",
                "MaLoHang");

        var inspector =
            OptionalColumn(
                table,
                "InspectorId",
                "InspectorUserId",
                "UserId",
                "PerformedByUserId",
                "MaNguoiKiemDinh",
                "MaNguoiDung")
            ?? await FindForeignKeyColumnAsync(
                table,
                ct,
                "Users",
                "NguoiDung",
                "NguoiDungs")
            ?? throw new InvalidOperationException(
                $"Bảng {table.Name} không có cột người kiểm định và cũng không có FK tới Users. " +
                $"Các cột hiện có: {string.Join(", ", table.Columns.OrderBy(x => x))}");

        var resultCol =
            OptionalColumn(
                table,
                "Result",
                "KetQua");

        var notesCol =
            OptionalColumn(
                table,
                "Notes",
                "GhiChu");

        var sets = new List<string>();

        var parameters =
            new List<(string, object?)>
            {
                ("@Id", id)
            };

        AddUpdate(
            batch,
            "@BatchId",
            batchId,
            sets,
            parameters);

        AddUpdate(
            inspector,
            "@InspectorId",
            inspectorId,
            sets,
            parameters);

        AddUpdate(
            resultCol,
            "@Result",
            NullIfWhiteSpace(result),
            sets,
            parameters);

        AddUpdate(
            notesCol,
            "@Notes",
            NullIfWhiteSpace(notes),
            sets,
            parameters);

        if (!await UpdateAsync(
                table,
                idCol,
                sets,
                parameters,
                ct))
        {
            return null;
        }

        return (
            await readRepository.GetInspectionsAsync(ct)
        ).FirstOrDefault(
            x => x.Id == id);
    }

    public Task<bool> DeleteInspectionAsync(
        int id,
        CancellationToken ct = default) =>
        DeleteByIdAsync(
            "Inspections",
            new[]
            {
                "KiemDinh",
                "KiemDinhs"
            },
            new[]
            {
                "Id",
                "MaKiemDinh"
            },
            id,
            ct);


    // =========================================================
    // CERTIFICATES
    // =========================================================

    public async Task<AdminCertificate> CreateCertificateAsync(
        int batchId,
        int? inspectionId,
        string? certificateType,
        string? fileUrl,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Certificates",
                "ChungNhan",
                "ChungNhans");

        var id =
            RequireColumn(
                table,
                "Id",
                "MaChungNhan");

        var batch =
            RequireColumn(
                table,
                "BatchId",
                "MaLoHang");

        var inspection =
            OptionalColumn(
                table,
                "InspectionId",
                "MaKiemDinh");

        var type =
            OptionalColumn(
                table,
                "CertificateType",
                "LoaiChungNhan");

        var file =
            OptionalColumn(
                table,
                "FileUrl",
                "FileChungNhanUrl");

        var issuedAt =
            OptionalColumn(
                table,
                "IssuedAt",
                "CreatedAt",
                "NgayCap",
                "NgayTao");

        var certificateNumber =
            OptionalColumn(
                table,
                "CertificateNumber",
                "Code",
                "MaChungNhanSo");

        var columns = new List<string>();
        var values = new List<string>();
        var parameters = new List<(string, object?)>();

        AddInsert(
            batch,
            "@BatchId",
            batchId,
            columns,
            values,
            parameters);

        AddInsert(
            inspection,
            "@InspectionId",
            inspectionId,
            columns,
            values,
            parameters);

        AddInsert(
            type,
            "@CertificateType",
            NullIfWhiteSpace(certificateType),
            columns,
            values,
            parameters);

        AddInsert(
            file,
            "@FileUrl",
            NullIfWhiteSpace(fileUrl),
            columns,
            values,
            parameters);

        AddInsert(
            issuedAt,
            "@IssuedAt",
            DateTime.UtcNow,
            columns,
            values,
            parameters);

        AddInsert(
            certificateNumber,
            "@CertificateNumber",
            $"CERT-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            columns,
            values,
            parameters);

        var newId =
            await InsertAndReturnIdAsync(
                table,
                id,
                columns,
                values,
                parameters,
                ct);

        return (
            await readRepository.GetCertificatesAsync(ct)
        ).First(
            x => x.Id == newId);
    }

    public async Task<AdminCertificate?> UpdateCertificateAsync(
        int id,
        int batchId,
        int? inspectionId,
        string? certificateType,
        string? fileUrl,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Certificates",
                "ChungNhan",
                "ChungNhans");

        var idCol =
            RequireColumn(
                table,
                "Id",
                "MaChungNhan");

        var batch =
            RequireColumn(
                table,
                "BatchId",
                "MaLoHang");

        var inspection =
            OptionalColumn(
                table,
                "InspectionId",
                "MaKiemDinh");

        var type =
            OptionalColumn(
                table,
                "CertificateType",
                "LoaiChungNhan");

        var file =
            OptionalColumn(
                table,
                "FileUrl",
                "FileChungNhanUrl");

        var sets = new List<string>();

        var parameters =
            new List<(string, object?)>
            {
                ("@Id", id)
            };

        AddUpdate(
            batch,
            "@BatchId",
            batchId,
            sets,
            parameters);

        AddUpdate(
            inspection,
            "@InspectionId",
            inspectionId,
            sets,
            parameters);

        AddUpdate(
            type,
            "@CertificateType",
            NullIfWhiteSpace(certificateType),
            sets,
            parameters);

        AddUpdate(
            file,
            "@FileUrl",
            NullIfWhiteSpace(fileUrl),
            sets,
            parameters);

        if (!await UpdateAsync(
                table,
                idCol,
                sets,
                parameters,
                ct))
        {
            return null;
        }

        return (
            await readRepository.GetCertificatesAsync(ct)
        ).FirstOrDefault(
            x => x.Id == id);
    }

    public Task<bool> DeleteCertificateAsync(
        int id,
        CancellationToken ct = default) =>
        DeleteByIdAsync(
            "Certificates",
            new[]
            {
                "ChungNhan",
                "ChungNhans"
            },
            new[]
            {
                "Id",
                "MaChungNhan"
            },
            id,
            ct);


    // =========================================================
    // RECALLS
    // =========================================================

    public async Task<AdminRecall> CreateRecallAsync(
        int batchId,
        string? reason,
        string? severity,
        int createdBy,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Recalls",
                "CanhBaoThuHoi",
                "CanhBaoThuHois");

        var id =
            RequireColumn(
                table,
                "Id",
                "MaCanhBao");

        var batch =
            RequireColumn(
                table,
                "BatchId",
                "MaLoHang");

        var reasonCol =
            OptionalColumn(
                table,
                "Reason",
                "LyDo");

        var severityCol =
            OptionalColumn(
                table,
                "Severity",
                "MucDoNghiemTrong");

        var creator =
            RequireColumn(
                table,
                "CreatedBy",
                "CreatedByUserId",
                "MaNguoiTao");

        var createdAt =
            OptionalColumn(
                table,
                "CreatedAt",
                "ThoiGianTao",
                "NgayTao");

        var statusCol =
            OptionalColumn(
                table,
                "Status",
                "TrangThai");

        var columns = new List<string>();
        var values = new List<string>();
        var parameters = new List<(string, object?)>();

        AddInsert(
            batch,
            "@BatchId",
            batchId,
            columns,
            values,
            parameters);

        AddInsert(
            reasonCol,
            "@Reason",
            NullIfWhiteSpace(reason),
            columns,
            values,
            parameters);

        AddInsert(
            severityCol,
            "@Severity",
            NullIfWhiteSpace(severity),
            columns,
            values,
            parameters);

        AddInsert(
            creator,
            "@CreatedBy",
            createdBy,
            columns,
            values,
            parameters);

        AddInsert(
            createdAt,
            "@CreatedAt",
            DateTime.UtcNow,
            columns,
            values,
            parameters);

        AddInsert(
            statusCol,
            "@Status",
            "OPEN",
            columns,
            values,
            parameters);

        var newId =
            await InsertAndReturnIdAsync(
                table,
                id,
                columns,
                values,
                parameters,
                ct);

        return (
            await readRepository.GetRecallsAsync(ct)
        ).First(
            x => x.Id == newId);
    }

    public async Task<AdminRecall?> UpdateRecallAsync(
        int id,
        int batchId,
        string? reason,
        string? severity,
        int createdBy,
        CancellationToken ct = default)
    {
        var s =
            await GetSchemaAsync(ct);

        var table =
            RequireTable(
                s,
                "Recalls",
                "CanhBaoThuHoi",
                "CanhBaoThuHois");

        var idCol =
            RequireColumn(
                table,
                "Id",
                "MaCanhBao");

        var batch =
            RequireColumn(
                table,
                "BatchId",
                "MaLoHang");

        var reasonCol =
            OptionalColumn(
                table,
                "Reason",
                "LyDo");

        var severityCol =
            OptionalColumn(
                table,
                "Severity",
                "MucDoNghiemTrong");

        var creator =
            RequireColumn(
                table,
                "CreatedBy",
                "MaNguoiTao");

        var sets = new List<string>();

        var parameters =
            new List<(string, object?)>
            {
                ("@Id", id)
            };

        AddUpdate(
            batch,
            "@BatchId",
            batchId,
            sets,
            parameters);

        AddUpdate(
            reasonCol,
            "@Reason",
            NullIfWhiteSpace(reason),
            sets,
            parameters);

        AddUpdate(
            severityCol,
            "@Severity",
            NullIfWhiteSpace(severity),
            sets,
            parameters);

        AddUpdate(
            creator,
            "@CreatedBy",
            createdBy,
            sets,
            parameters);

        if (!await UpdateAsync(
                table,
                idCol,
                sets,
                parameters,
                ct))
        {
            return null;
        }

        return (
            await readRepository.GetRecallsAsync(ct)
        ).FirstOrDefault(
            x => x.Id == id);
    }

    public Task<bool> DeleteRecallAsync(
        int id,
        CancellationToken ct = default) =>
        DeleteByIdAsync(
            "Recalls",
            new[]
            {
                "CanhBaoThuHoi",
                "CanhBaoThuHois"
            },
            new[]
            {
                "Id",
                "MaCanhBao"
            },
            id,
            ct);


    // =========================================================
    // COMMON SQL
    // =========================================================

    private async Task<int> InsertAndReturnIdAsync(
        TableSchema table,
        string idColumn,
        IReadOnlyList<string> columns,
        IReadOnlyList<string> values,
        IReadOnlyList<(string, object?)> parameters,
        CancellationToken ct)
    {
        var sql = $"""
            INSERT INTO {T(table)}
            (
                {string.Join(", ", columns)}
            )
            OUTPUT INSERTED.{C(idColumn)}
            VALUES
            (
                {string.Join(", ", values)}
            );
            """;

        return await ExecuteScalarAsync<int>(
            sql,
            command =>
                AddParameters(
                    command,
                    parameters),
            ct);
    }

    private async Task<bool> UpdateAsync(
        TableSchema table,
        string idColumn,
        IReadOnlyList<string> sets,
        IReadOnlyList<(string, object?)> parameters,
        CancellationToken ct)
    {
        if (sets.Count == 0)
            return false;

        var sql = $"""
            UPDATE {T(table)}
            SET {string.Join(", ", sets)}
            WHERE {C(idColumn)} = @Id;

            SELECT @@ROWCOUNT;
            """;

        return await ExecuteScalarAsync<int>(
            sql,
            command =>
                AddParameters(
                    command,
                    parameters),
            ct) > 0;
    }

    private async Task<bool> DeleteByIdAsync(
        string tableName,
        string[] tableAliases,
        string[] idCandidates,
        int id,
        CancellationToken ct)
    {
        var s =
            await GetSchemaAsync(ct);

        var candidates =
            new[]
            {
                tableName
            }
            .Concat(tableAliases)
            .ToArray();

        var table =
            RequireTable(
                s,
                candidates);

        var idCol =
            RequireColumn(
                table,
                idCandidates);

        var sql = $"""
            DELETE FROM {T(table)}
            WHERE {C(idCol)} = @Id;

            SELECT @@ROWCOUNT;
            """;

        return await ExecuteScalarAsync<int>(
            sql,
            command =>
                AddParameter(
                    command,
                    "@Id",
                    id),
            ct) > 0;
    }


    // =========================================================
    // READ DATABASE SCHEMA
    // =========================================================

    private async Task<DatabaseSchema> GetSchemaAsync(
        CancellationToken ct)
    {
        if (_schema is not null)
            return _schema;

        var rows =
            await WithConnectionAsync<
                List<(
                    string Schema,
                    string Table,
                    string Column)>>(
                async connection =>
                {
                    await using var command =
                        connection.CreateCommand();

                    command.CommandText =
                        """
                        SELECT
                            TABLE_SCHEMA,
                            TABLE_NAME,
                            COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        ORDER BY
                            TABLE_SCHEMA,
                            TABLE_NAME,
                            ORDINAL_POSITION;
                        """;

                    await using var reader =
                        await command.ExecuteReaderAsync(
                            ct);

                    var result =
                        new List<(
                            string Schema,
                            string Table,
                            string Column)>();

                    while (
                        await reader.ReadAsync(ct))
                    {
                        result.Add(
                            (
                                reader.GetString(0),
                                reader.GetString(1),
                                reader.GetString(2)
                            ));
                    }

                    return result;
                },
                ct);

        _schema =
            new DatabaseSchema(
                rows
                    .GroupBy(
                        x =>
                            (
                                x.Schema,
                                x.Table
                            ))
                    .Select(
                        group =>
                            new TableSchema(
                                group.Key.Schema,
                                group.Key.Table,
                                new HashSet<string>(
                                    group.Select(
                                        x =>
                                            x.Column),
                                    StringComparer
                                        .OrdinalIgnoreCase)))
                    .ToList());

        return _schema;
    }

    private static TableSchema? FindTable(
        DatabaseSchema schema,
        params string[] candidates)
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

    private static TableSchema? FindTableByColumns(
        DatabaseSchema schema,
        params string[][] columnGroups)
    {
        return schema.Tables.FirstOrDefault(table =>
            columnGroups.All(group =>
                group.Any(candidate =>
                    table.Columns.Contains(candidate))));
    }

    private static TableSchema RequireTable(
        DatabaseSchema schema,
        params string[] candidates) =>
        candidates
            .Select(
                name =>
                    schema.Tables
                        .FirstOrDefault(
                            table =>
                                table.Name.Equals(
                                    name,
                                    StringComparison.OrdinalIgnoreCase)))
            .FirstOrDefault(
                table =>
                    table is not null)
        ?? throw new InvalidOperationException(
            $"Không tìm thấy bảng: {string.Join(", ", candidates)}");

    private static string RequireColumn(
        TableSchema table,
        params string[] candidates) =>
        OptionalColumn(
            table,
            candidates)
        ?? throw new InvalidOperationException(
            $"Bảng {table.Name} thiếu cột: {string.Join(", ", candidates)}");

    private static string? OptionalColumn(
        TableSchema table,
        params string[] candidates) =>
        candidates
            .Select(
                name =>
                    table.Columns
                        .FirstOrDefault(
                            column =>
                                column.Equals(
                                    name,
                                    StringComparison.OrdinalIgnoreCase)))
            .FirstOrDefault(
                column =>
                    column is not null);


    // Nếu database thật đặt tên cột người dùng khác tài liệu, tìm chính xác
    // cột FK của bảng Inspections đang trỏ tới Users bằng metadata SQL Server.
    private async Task<string?> FindForeignKeyColumnAsync(
        TableSchema sourceTable,
        CancellationToken ct,
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

                var value = await command.ExecuteScalarAsync(ct);
                return value is null or DBNull ? null : Convert.ToString(value);
            },
            ct);
    }

    private static string C(
        string value) =>
        $"[{value.Replace(
            "]",
            "]]",
            StringComparison.Ordinal)}]";

    private static string T(
        TableSchema table) =>
        $"{C(table.Schema)}.{C(table.Name)}";

    private static string? NullIfWhiteSpace(
        string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();


    // =========================================================
    // SQL PARAMETER HELPERS
    // =========================================================

    private static void AddInsert(
        string? column,
        string parameter,
        object? value,
        ICollection<string> columns,
        ICollection<string> values,
        ICollection<(string, object?)> parameters)
    {
        if (column is null)
            return;

        columns.Add(
            C(column));

        values.Add(
            parameter);

        parameters.Add(
            (
                parameter,
                value
            ));
    }

    private static void AddUpdate(
        string? column,
        string parameter,
        object? value,
        ICollection<string> sets,
        ICollection<(string, object?)> parameters)
    {
        if (column is null)
            return;

        sets.Add(
            $"{C(column)} = {parameter}");

        parameters.Add(
            (
                parameter,
                value
            ));
    }

    private static void AddParameters(
        DbCommand command,
        IEnumerable<(string, object?)> parameters)
    {
        foreach (
            var (name, value)
            in parameters)
        {
            AddParameter(
                command,
                name,
                value);
        }
    }

    private static void AddParameter(
        DbCommand command,
        string name,
        object? value)
    {
        var parameter =
            command.CreateParameter();

        parameter.ParameterName =
            name;

        parameter.Value =
            value ??
            DBNull.Value;

        command.Parameters.Add(
            parameter);
    }


    // =========================================================
    // EXECUTE SQL
    // =========================================================

    private async Task<T> ExecuteScalarAsync<T>(
        string sql,
        Action<DbCommand> configure,
        CancellationToken ct) =>
        await WithConnectionAsync<T>(
            async connection =>
            {
                await using var command =
                    connection.CreateCommand();

                command.CommandText =
                    sql;

                configure(command);

                var value =
                    await command.ExecuteScalarAsync(
                        ct);

                return (T)
                    Convert.ChangeType(
                        value!,
                        typeof(T));
            },
            ct);

    private async Task<T> WithConnectionAsync<T>(
        Func<DbConnection, Task<T>> action,
        CancellationToken ct)
    {
        var connection =
            db.Database.GetDbConnection();

        var shouldClose =
            connection.State !=
            ConnectionState.Open;

        if (shouldClose)
        {
            await connection.OpenAsync(
                ct);
        }

        try
        {
            return await action(
                connection);
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync();
            }
        }
    }


    private sealed record DatabaseSchema(
        IReadOnlyList<TableSchema> Tables);

    private sealed record TableSchema(
        string Schema,
        string Name,
        HashSet<string> Columns);
}