namespace SoundSearch.Api.Models;

/// <summary>
/// A page of results as produced by a search provider. Cursors here are in
/// "provider space" (e.g. a raw Mixcloud paging URL) - they are opaque to
/// everything outside the provider and get encoded before leaving the API.
/// </summary>
public sealed record SearchResultPage(
    IReadOnlyList<TrackResult> Items,
    string? NextCursor,
    string? PreviousCursor);
