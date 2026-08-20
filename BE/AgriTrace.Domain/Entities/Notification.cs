namespace AgriTrace.Domain.Entities;

/// <summary>
/// Thông báo hệ thống gửi đến người dùng (ví dụ: cảnh báo thu hồi).
/// </summary>
public sealed class Notification
{
    public int Id { get; private set; }
    public int UserId { get; private set; }
    public string Title { get; private set; }
    public string Message { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public Notification(int id, int userId, string title, string message, bool isRead = false, DateTime? createdAt = null)
    {
        if (userId <= 0) throw new ArgumentException("UserId is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(message)) throw new ArgumentException("Message is required.", nameof(message));

        Id = id;
        UserId = userId;
        Title = title.Trim();
        Message = message.Trim();
        IsRead = isRead;
        CreatedAt = createdAt ?? DateTime.UtcNow;
    }
}
