using SoundSearch.Api.Models;

namespace SoundSearch.Api.Providers;

public interface IMusicSearchProvider
{
    Task<SearchResultPage> SearchByTermAsync(string query, int limit, CancellationToken cancellationToken);

    Task<SearchResultPage> SearchByCursorAsync(string cursorUrl, CancellationToken cancellationToken);

    // guards against SSRF via a tampered cursor
    bool IsSupportedCursor(string cursorUrl);
}
