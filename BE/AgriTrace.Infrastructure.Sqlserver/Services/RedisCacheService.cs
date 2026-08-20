using System.Text.Json;
using AgriTrace.Domain.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace AgriTrace.Infrastructure.Sqlserver.Services;

public sealed class RedisCacheService(
    IDistributedCache cache,
    ILogger<RedisCacheService> logger) : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class
    {
        try
        {
            var data = await cache.GetStringAsync(key, ct);
            if (string.IsNullOrEmpty(data)) return null;

            return JsonSerializer.Deserialize<T>(data, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache get failed for key {Key}. Falling back to source.", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default) where T : class
    {
        try
        {
            var json = JsonSerializer.Serialize(value, JsonOptions);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            };

            await cache.SetStringAsync(key, json, options, ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache set failed for key {Key}.", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await cache.RemoveAsync(key, ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache remove failed for key {Key}.", key);
        }
    }

    public Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
    {
        // Standard IDistributedCache doesn't support scan/keys directly,
        // but for batch cache we can invalidate specific batch key e.g. "trace:batch:{batchId}"
        return Task.CompletedTask;
    }
}
