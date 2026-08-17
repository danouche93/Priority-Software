namespace SoundSearch.Api.Models;

/// <summary>
/// Normalized, provider-agnostic representation of a single searchable track.
/// This is the only shape the frontend ever sees, regardless of which
/// <see cref="Providers.IMusicSearchProvider"/> produced it.
/// </summary>
public sealed record TrackResult(
    string Id,
    string Title,
    string OwnerName,
    string ImageUrl,
    string PageUrl,
    string EmbedUrl);
