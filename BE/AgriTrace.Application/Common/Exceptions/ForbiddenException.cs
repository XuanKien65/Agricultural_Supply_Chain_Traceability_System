using System;

namespace AgriTrace.Application.Common.Exceptions
{
    /// <summary>
    /// Ném ra khi hành động bị từ chối do không đủ quyền/phạm vi. Được GlobalExceptionHandler ánh xạ sang HTTP 403.
    /// </summary>
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message)
        {
        }
    }
}
