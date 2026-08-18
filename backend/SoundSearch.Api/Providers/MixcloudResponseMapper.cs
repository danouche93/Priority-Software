using SoundSearch.Api.Models;

namespace SoundSearch.Api.Providers;

internal static class MixcloudResponseMapper
{
    private const string EmbedBaseUrl = "https://www.mixcloud.com/widget/iframe/";

    public static SearchResultPage MapToPage(MixcloudSearchResponse? raw)
    {
        var items = (raw?.Data ?? [])
            .Where(cloudcast => !string.IsNullOrWhiteSpace(cloudcast.Key) && !string.IsNullOrWhiteSpace(cloudcast.Name))
            .Select(MapItem)
            .ToList();

        return new SearchResultPage(items, raw?.Paging?.Next, raw?.Paging?.Previous);
    }

    private static TrackResult MapItem(MixcloudCloudcast cloudcast)
    {
        var key = cloudcast.Key!;
        var imageUrl = cloudcast.Pictures?.ExtraLarge
            ?? cloudcast.Pictures?.Large
            ?? cloudcast.Pictures?.Medium
            ?? string.Empty;
        var ownerName = cloudcast.User?.Name
            ?? cloudcast.User?.Username
            ?? "Unknown artist";
        var pageUrl = cloudcast.Url ?? $"https://www.mixcloud.com{key}";
        var embedUrl = $"{EmbedBaseUrl}?hide_cover=1&light=1&autoplay=1&feed={Uri.EscapeDataString(key)}";

        return new TrackResult(
            Id: key,
            Title: cloudcast.Name!,
            OwnerName: ownerName,
            ImageUrl: imageUrl,
            PageUrl: pageUrl,
            EmbedUrl: embedUrl);
    }
}
