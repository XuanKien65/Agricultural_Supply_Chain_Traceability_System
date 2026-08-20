using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class RecallNotificationRepository(ApplicationDbContext db) : IRecallNotificationRepository
{
    public async Task PropagateRecallNotificationsAsync(int recallId, int batchId, CancellationToken ct = default)
    {
        var conn = db.Database.GetDbConnection();
        await conn.OpenAsync(ct);

        // Tìm tất cả Organization đã tham gia vào chuỗi sự kiện của Batch (trừ trùng lặp)
        // và tạo RecallNotification cho mỗi Organization.
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO RecallNotifications (RecallId, OrganizationId, SentAt, AcknowledgementStatus)
            SELECT DISTINCT @recallId, e.OrganizationId, GETDATE(), 'Pending'
            FROM SupplyChainEvents e
            WHERE e.BatchId = @batchId
              AND NOT EXISTS (
                SELECT 1 FROM RecallNotifications rn
                WHERE rn.RecallId = @recallId AND rn.OrganizationId = e.OrganizationId
              )";

        var pRecall = cmd.CreateParameter(); pRecall.ParameterName = "@recallId"; pRecall.Value = recallId;
        var pBatch = cmd.CreateParameter(); pBatch.ParameterName = "@batchId"; pBatch.Value = batchId;
        cmd.Parameters.Add(pRecall);
        cmd.Parameters.Add(pBatch);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<IReadOnlyList<RecallNotificationDto>> GetByOrganizationAsync(int organizationId, CancellationToken ct = default)
    {
        var conn = db.Database.GetDbConnection();
        await conn.OpenAsync(ct);

        var results = new List<RecallNotificationDto>();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT rn.Id, rn.RecallId, rn.OrganizationId, o.Name AS OrgName,
                   rn.SentAt, rn.AcknowledgementStatus, rn.ProcessingNotes
            FROM RecallNotifications rn
            JOIN Organizations o ON o.Id = rn.OrganizationId
            WHERE rn.OrganizationId = @orgId
            ORDER BY rn.SentAt DESC";

        var p = cmd.CreateParameter(); p.ParameterName = "@orgId"; p.Value = organizationId;
        cmd.Parameters.Add(p);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            results.Add(new RecallNotificationDto(
                reader.GetInt32(0), reader.GetInt32(1), reader.GetInt32(2),
                reader.IsDBNull(3) ? null : reader.GetString(3),
                reader.GetDateTime(4), reader.GetString(5),
                reader.IsDBNull(6) ? null : reader.GetString(6)));
        }
        return results;
    }

    public async Task<RecallDetailDto?> GetRecallDetailAsync(int recallId, CancellationToken ct = default)
    {
        var conn = db.Database.GetDbConnection();
        await conn.OpenAsync(ct);

        RecallDetailDto? recall = null;

        // Get recall
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT r.Id, r.BatchId, b.QrCode, r.Reason, r.Severity,
                       u.FullName AS CreatedByName, r.CreatedAt, r.Status
                FROM Recalls r
                JOIN Batches b ON b.Id = r.BatchId
                JOIN Users u ON u.Id = r.CreatedByUserId
                WHERE r.Id = @id";
            var p = cmd.CreateParameter(); p.ParameterName = "@id"; p.Value = recallId;
            cmd.Parameters.Add(p);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                recall = new RecallDetailDto(
                    reader.GetInt32(0), reader.GetInt32(1),
                    reader.IsDBNull(2) ? null : reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3),
                    reader.IsDBNull(4) ? null : reader.GetString(4),
                    reader.IsDBNull(5) ? null : reader.GetString(5),
                    reader.GetDateTime(6), reader.GetString(7),
                    new List<RecallNotificationDto>());
            }
        }
        if (recall is null) return null;

        // Get notifications
        var notifications = new List<RecallNotificationDto>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT rn.Id, rn.RecallId, rn.OrganizationId, o.Name,
                       rn.SentAt, rn.AcknowledgementStatus, rn.ProcessingNotes
                FROM RecallNotifications rn
                JOIN Organizations o ON o.Id = rn.OrganizationId
                WHERE rn.RecallId = @id
                ORDER BY rn.SentAt DESC";
            var p = cmd.CreateParameter(); p.ParameterName = "@id"; p.Value = recallId;
            cmd.Parameters.Add(p);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                notifications.Add(new RecallNotificationDto(
                    reader.GetInt32(0), reader.GetInt32(1), reader.GetInt32(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3),
                    reader.GetDateTime(4), reader.GetString(5),
                    reader.IsDBNull(6) ? null : reader.GetString(6)));
            }
        }

        return recall with { Notifications = notifications };
    }

    public async Task AcknowledgeAsync(int notificationId, string? processingNotes, CancellationToken ct = default)
    {
        var conn = db.Database.GetDbConnection();
        await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE RecallNotifications
            SET AcknowledgementStatus = 'Acknowledged', ProcessingNotes = @notes
            WHERE Id = @id";

        var pId = cmd.CreateParameter(); pId.ParameterName = "@id"; pId.Value = notificationId;
        var pNotes = cmd.CreateParameter(); pNotes.ParameterName = "@notes";
        pNotes.Value = (object?)processingNotes ?? DBNull.Value;
        cmd.Parameters.Add(pId);
        cmd.Parameters.Add(pNotes);

        var affected = await cmd.ExecuteNonQueryAsync(ct);
        if (affected == 0) throw new InvalidOperationException("Không tìm thấy thông báo thu hồi.");
    }
}
