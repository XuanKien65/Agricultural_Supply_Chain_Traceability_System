namespace AgriTrace.Domain.Common;

/// <summary>
/// SQL Server round-trips DateTime as Kind=Unspecified and (for `datetime` columns)
/// truncates precision — both cause `DateTime.ToString("O")` to differ between the
/// value used to compute a hash at write time and the value read back at verify time.
/// Always format timestamps through this helper on both sides of a hash computation.
/// </summary>
public static class HashCanonical
{
    public static string Timestamp(DateTime value) =>
        DateTime.SpecifyKind(value, DateTimeKind.Utc).ToString("O");
}
