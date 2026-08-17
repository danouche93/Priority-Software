using System.Net.Http.Json;
using SoundSearch.Api.Models;

namespace SoundSearch.Api.Providers;

/// <summary>
/// <see cref="IMusicSearchProvider"/> backed by the public Mixcloud search
/// API. This is the only class in the whole backend that knows Mixcloud's
/// URL shapes, JSON layout, and pagination scheme.
/// </summary>
public sealed class MixcloudSearchProvider(HttpClient httpClient) : IMusicSearchProvider
{
    private const string ApiHost = "api.mixcloud.com";
    private const string BaseUrl = $"https://{ApiHost}";

    public bool IsSupportedCursor(string cursorUrl) =>
        Uri.TryCreate(cursorUrl, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && uri.Host.Equals(ApiHost, StringComparison.OrdinalIgnoreCase);

    public Task<SearchResultPage> SearchByTermAsync(string query, int limit, CancellationToken cancellationToken)
    {
        var url = $"{BaseUrl}/search/?q={Uri.EscapeDataString(query)}&type=cloudcast&limit={limit}";
        return FetchAsync(url, cancellationToken);
    }

    public Task<SearchResultPage> SearchByCursorAsync(string cursorUrl, CancellationToken cancellationToken) =>
        FetchAsync(cursorUrl, cancellationToken);

    private async Task<SearchResultPage> FetchAsync(string url, CancellationToken cancellationToken)
    {
        using var response = await httpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        var raw = await response.Content.ReadFromJsonAsync<MixcloudSearchResponse>(cancellationToken: cancellationToken);
        return MixcloudResponseMapper.MapToPage(raw);
    }
}
