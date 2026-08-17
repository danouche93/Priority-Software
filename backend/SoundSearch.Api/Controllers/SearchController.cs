using Microsoft.AspNetCore.Mvc;
using SoundSearch.Api.Cursors;
using SoundSearch.Api.Models;
using SoundSearch.Api.Providers;

namespace SoundSearch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SearchController(IMusicSearchProvider provider, ILogger<SearchController> logger) : ControllerBase
{
    private const int DefaultLimit = 6;
    private const int MaxLimit = 6;

    /// <summary>
    /// GET /api/search?q=term            -> new search, first page.
    /// GET /api/search?cursor=opaqueToken -> next/previous page of a search
    ///                                       already in progress.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SearchResponseDto>> Get(
        [FromQuery] string? q,
        [FromQuery] string? cursor,
        [FromQuery] int limit,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q) && string.IsNullOrWhiteSpace(cursor))
        {
            return BadRequestProblem("Either 'q' or 'cursor' must be provided.");
        }

        var effectiveLimit = Math.Clamp(limit <= 0 ? DefaultLimit : limit, 1, MaxLimit);

        try
        {
            var page = string.IsNullOrWhiteSpace(cursor)
                ? await provider.SearchByTermAsync(q!.Trim(), effectiveLimit, cancellationToken)
                : await ResolveCursorPageAsync(cursor, cancellationToken);

            if (page is null)
            {
                return BadRequestProblem("The provided cursor is invalid or has expired.");
            }

            return Ok(new SearchResponseDto(
                page.Items,
                EncodeOrNull(page.NextCursor),
                EncodeOrNull(page.PreviousCursor)));
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Client navigated away / aborted the request; nothing to report.
            return new StatusCodeResult(499);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Search failed for q={Query} cursor={Cursor}", q, cursor);
            return Problem(
                title: "Search provider unavailable",
                detail: "We couldn't reach the music search provider. Please try again.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    private async Task<SearchResultPage?> ResolveCursorPageAsync(string cursor, CancellationToken cancellationToken)
    {
        if (!CursorCodec.TryDecode(cursor, out var providerUrl) || !provider.IsSupportedCursor(providerUrl))
        {
            return null;
        }

        return await provider.SearchByCursorAsync(providerUrl, cancellationToken);
    }

    private static string? EncodeOrNull(string? providerUrl) =>
        providerUrl is null ? null : CursorCodec.Encode(providerUrl);

    private ObjectResult BadRequestProblem(string detail) =>
        Problem(title: "Invalid request", detail: detail, statusCode: StatusCodes.Status400BadRequest);
}
