using SoundSearch.Api.Models;

namespace SoundSearch.Api.Providers;

/// <summary>
/// The seam that makes the data source swappable. Everything above this
/// interface (controller, DTOs, cursor handling) is provider-agnostic;
/// swapping Mixcloud for another sound API means writing a new
/// implementation of this interface and registering it in Program.cs -
/// nothing else in the app needs to change.
/// </summary>
public interface IMusicSearchProvider
{
    Task<SearchResultPage> SearchByTermAsync(string query, int limit, CancellationToken cancellationToken);

    Task<SearchResultPage> SearchByCursorAsync(string cursorUrl, CancellationToken cancellationToken);

    /// <summary>
    /// Whether a decoded cursor URL actually belongs to this provider.
    /// Used to reject tampered/forged cursors before making an outbound
    /// request with them (basic SSRF protection).
    /// </summary>
    bool IsSupportedCursor(string cursorUrl);
}
