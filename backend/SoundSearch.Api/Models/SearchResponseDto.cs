namespace SoundSearch.Api.Models;

/// <summary>
/// The wire shape returned by <c>GET /api/search</c>. Cursors are opaque,
/// base64-url tokens the client must pass back verbatim - it never needs to
/// know what they encode.
/// </summary>
public sealed record SearchResponseDto(
    IReadOnlyList<TrackResult> Items,
    string? NextCursor,
    string? PreviousCursor);
