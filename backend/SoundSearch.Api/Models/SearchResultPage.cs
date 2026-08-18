namespace SoundSearch.Api.Models;

public sealed record SearchResultPage(
    IReadOnlyList<TrackResult> Items,
    string? NextCursor,
    string? PreviousCursor);
