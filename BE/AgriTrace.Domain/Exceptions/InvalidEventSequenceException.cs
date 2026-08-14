namespace AgriTrace.Domain.Exceptions;

/// Ném khi ghi sự kiện không hợp lệ với trạng thái hiện tại của lô hàng (sai thứ tự chain of custody).
public sealed class InvalidEventSequenceException(string message) : Exception(message);
