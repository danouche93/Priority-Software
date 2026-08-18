namespace SoundSearch.Api.Models;

public sealed record TrackResult(
    string Id,
    string Title,
    string OwnerName,
    string ImageUrl,
    string PageUrl,
    string EmbedUrl);
