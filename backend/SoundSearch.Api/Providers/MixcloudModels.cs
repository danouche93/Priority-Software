using System.Text.Json.Serialization;

namespace SoundSearch.Api.Providers;

// Raw shapes returned by the Mixcloud search API (https://api.mixcloud.com/search/).
// These are internal on purpose: nothing outside this file/provider should
// ever depend on Mixcloud's JSON layout.

internal sealed record MixcloudSearchResponse(
    [property: JsonPropertyName("data")] List<MixcloudCloudcast>? Data,
    [property: JsonPropertyName("paging")] MixcloudPaging? Paging);

internal sealed record MixcloudCloudcast(
    [property: JsonPropertyName("key")] string? Key,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("user")] MixcloudUser? User,
    [property: JsonPropertyName("pictures")] MixcloudPictures? Pictures);

internal sealed record MixcloudUser(
    [property: JsonPropertyName("username")] string? Username,
    [property: JsonPropertyName("name")] string? Name);

internal sealed record MixcloudPictures(
    [property: JsonPropertyName("extra_large")] string? ExtraLarge,
    [property: JsonPropertyName("large")] string? Large,
    [property: JsonPropertyName("medium")] string? Medium);

internal sealed record MixcloudPaging(
    [property: JsonPropertyName("next")] string? Next,
    [property: JsonPropertyName("previous")] string? Previous);
