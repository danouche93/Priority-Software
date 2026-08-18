namespace SoundSearch.Api.Models;

public sealed record SearchResponseDto(
    IReadOnlyList<TrackResult> Items,
    string? NextCursor,
    string? PreviousCursor);
