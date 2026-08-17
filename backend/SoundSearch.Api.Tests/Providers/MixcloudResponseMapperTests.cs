using SoundSearch.Api.Providers;

namespace SoundSearch.Api.Tests.Providers;

public class MixcloudResponseMapperTests
{
    [Fact]
    public void MapToPage_Returns_Empty_Page_For_Null_Response()
    {
        var page = MixcloudResponseMapper.MapToPage(null);

        Assert.Empty(page.Items);
        Assert.Null(page.NextCursor);
        Assert.Null(page.PreviousCursor);
    }

    [Fact]
    public void MapToPage_Maps_Fields_And_Prefers_The_Largest_Picture()
    {
        var raw = new MixcloudSearchResponse(
            Data:
            [
                new MixcloudCloudcast(
                    Key: "/NPR/tiny-desk-adele/",
                    Url: "https://www.mixcloud.com/NPR/tiny-desk-adele/",
                    Name: "Tiny Desk - Adele",
                    User: new MixcloudUser(Username: "NPR", Name: "NPR Music"),
                    Pictures: new MixcloudPictures(ExtraLarge: "xl.jpg", Large: "l.jpg", Medium: "m.jpg"))
            ],
            Paging: new MixcloudPaging(
                Next: "https://api.mixcloud.com/search/?q=adele&offset=6",
                Previous: null));

        var page = MixcloudResponseMapper.MapToPage(raw);

        var item = Assert.Single(page.Items);
        Assert.Equal("/NPR/tiny-desk-adele/", item.Id);
        Assert.Equal("Tiny Desk - Adele", item.Title);
        Assert.Equal("NPR Music", item.OwnerName);
        Assert.Equal("xl.jpg", item.ImageUrl);
        Assert.Equal("https://www.mixcloud.com/NPR/tiny-desk-adele/", item.PageUrl);
        Assert.Contains("feed=%2FNPR%2Ftiny-desk-adele%2F", item.EmbedUrl);
        Assert.Equal("https://api.mixcloud.com/search/?q=adele&offset=6", page.NextCursor);
        Assert.Null(page.PreviousCursor);
    }

    [Fact]
    public void MapToPage_Falls_Back_To_Smaller_Pictures_And_Username_When_Missing()
    {
        var raw = new MixcloudSearchResponse(
            Data:
            [
                new MixcloudCloudcast(
                    Key: "/someone/a-track/",
                    Url: null,
                    Name: "A Track",
                    User: new MixcloudUser(Username: "someone", Name: null),
                    Pictures: new MixcloudPictures(ExtraLarge: null, Large: null, Medium: "m.jpg"))
            ],
            Paging: null);

        var page = MixcloudResponseMapper.MapToPage(raw);

        var item = Assert.Single(page.Items);
        Assert.Equal("m.jpg", item.ImageUrl);
        Assert.Equal("someone", item.OwnerName);
        Assert.Equal("https://www.mixcloud.com/someone/a-track/", item.PageUrl);
    }

    [Fact]
    public void MapToPage_Skips_Entries_Missing_A_Key_Or_Name()
    {
        var raw = new MixcloudSearchResponse(
            Data:
            [
                new MixcloudCloudcast(Key: null, Url: null, Name: "Has no key", User: null, Pictures: null),
                new MixcloudCloudcast(Key: "/a/b/", Url: null, Name: null, User: null, Pictures: null),
                new MixcloudCloudcast(Key: "/valid/one/", Url: null, Name: "Valid", User: null, Pictures: null),
            ],
            Paging: null);

        var page = MixcloudResponseMapper.MapToPage(raw);

        var item = Assert.Single(page.Items);
        Assert.Equal("/valid/one/", item.Id);
    }
}
