using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SoundSearch.Api.Controllers;
using SoundSearch.Api.Cursors;
using SoundSearch.Api.Models;
using SoundSearch.Api.Providers;

namespace SoundSearch.Api.Tests.Controllers;

public class SearchControllerTests
{
    private static TrackResult MakeTrack(string id) =>
        new(Id: id, Title: $"Title {id}", OwnerName: "Owner", ImageUrl: "img.jpg", PageUrl: "page", EmbedUrl: "embed");

    private static SearchController MakeController(Mock<IMusicSearchProvider> provider) =>
        new(provider.Object, NullLogger<SearchController>.Instance);

    private static void AssertProblemStatus(ActionResult? actionResult, int expectedStatus)
    {
        var objectResult = Assert.IsType<ObjectResult>(actionResult);
        var problemDetails = Assert.IsAssignableFrom<ProblemDetails>(objectResult.Value);
        Assert.Equal(expectedStatus, problemDetails.Status);
    }

    [Fact]
    public async Task Get_Without_Query_Or_Cursor_Returns_ValidationProblem()
    {
        var provider = new Mock<IMusicSearchProvider>();
        var controller = MakeController(provider);

        var result = await controller.Get(q: null, cursor: null, limit: 6, CancellationToken.None);

        AssertProblemStatus(result.Result, StatusCodes.Status400BadRequest);
        provider.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Get_With_Query_Calls_Provider_And_Encodes_Cursors()
    {
        var provider = new Mock<IMusicSearchProvider>();
        provider
            .Setup(p => p.SearchByTermAsync("adele", 6, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SearchResultPage(
                [MakeTrack("1"), MakeTrack("2")],
                NextCursor: "https://api.mixcloud.com/search/?q=adele&offset=6",
                PreviousCursor: null));
        var controller = MakeController(provider);

        var result = await controller.Get(q: "adele", cursor: null, limit: 6, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<SearchResponseDto>(okResult.Value);
        Assert.Equal(2, dto.Items.Count);
        Assert.Null(dto.PreviousCursor);
        Assert.NotNull(dto.NextCursor);
        Assert.True(CursorCodec.TryDecode(dto.NextCursor!, out var decoded));
        Assert.Equal("https://api.mixcloud.com/search/?q=adele&offset=6", decoded);
    }

    [Fact]
    public async Task Get_Clamps_Limit_To_The_Configured_Maximum()
    {
        var provider = new Mock<IMusicSearchProvider>();
        provider
            .Setup(p => p.SearchByTermAsync("x", 6, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SearchResultPage([], null, null));
        var controller = MakeController(provider);

        await controller.Get(q: "x", cursor: null, limit: 999, CancellationToken.None);

        provider.Verify(p => p.SearchByTermAsync("x", 6, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Get_With_Valid_Cursor_Decodes_And_Delegates_To_Provider()
    {
        const string providerUrl = "https://api.mixcloud.com/search/?q=adele&offset=6";
        var provider = new Mock<IMusicSearchProvider>();
        provider.Setup(p => p.IsSupportedCursor(providerUrl)).Returns(true);
        provider
            .Setup(p => p.SearchByCursorAsync(providerUrl, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SearchResultPage([MakeTrack("3")], null, "https://api.mixcloud.com/search/?q=adele&offset=0"));
        var controller = MakeController(provider);
        var token = CursorCodec.Encode(providerUrl);

        var result = await controller.Get(q: null, cursor: token, limit: 6, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<SearchResponseDto>(okResult.Value);
        Assert.Single(dto.Items);
        provider.Verify(p => p.SearchByCursorAsync(providerUrl, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Get_With_Cursor_For_An_Untrusted_Host_Returns_ValidationProblem()
    {
        const string untrustedUrl = "https://evil.example.com/steal-data";
        var provider = new Mock<IMusicSearchProvider>();
        provider.Setup(p => p.IsSupportedCursor(untrustedUrl)).Returns(false);
        var controller = MakeController(provider);
        var token = CursorCodec.Encode(untrustedUrl);

        var result = await controller.Get(q: null, cursor: token, limit: 6, CancellationToken.None);

        AssertProblemStatus(result.Result, StatusCodes.Status400BadRequest);
        provider.Verify(p => p.SearchByCursorAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Get_Returns_BadGateway_When_The_Provider_Throws()
    {
        var provider = new Mock<IMusicSearchProvider>();
        provider
            .Setup(p => p.SearchByTermAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException("boom"));
        var controller = MakeController(provider);

        var result = await controller.Get(q: "adele", cursor: null, limit: 6, CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status502BadGateway, objectResult.StatusCode);
    }
}
