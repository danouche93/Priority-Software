using SoundSearch.Api.Cursors;

namespace SoundSearch.Api.Tests.Cursors;

public class CursorCodecTests
{
    [Fact]
    public void Encode_Then_TryDecode_RoundTrips_To_The_Original_Url()
    {
        const string originalUrl = "https://api.mixcloud.com/search/?q=adele&type=cloudcast&limit=6&offset=6";

        var token = CursorCodec.Encode(originalUrl);
        var decoded = CursorCodec.TryDecode(token, out var providerUrl);

        Assert.True(decoded);
        Assert.Equal(originalUrl, providerUrl);
    }

    [Fact]
    public void Encode_Produces_A_UrlSafe_Token()
    {
        const string originalUrl = "https://api.mixcloud.com/search/?q=a+b/c&type=cloudcast";

        var token = CursorCodec.Encode(originalUrl);

        Assert.DoesNotContain('+', token);
        Assert.DoesNotContain('/', token);
        Assert.DoesNotContain('=', token);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-valid-base64!!!")]
    public void TryDecode_Returns_False_For_Garbage_Input(string cursor)
    {
        var result = CursorCodec.TryDecode(cursor, out var providerUrl);

        Assert.False(result);
        Assert.Equal(string.Empty, providerUrl);
    }

    [Fact]
    public void TryDecode_Returns_False_When_Decoded_Bytes_Are_Not_A_Url()
    {
        var token = CursorCodec.Encode("just some plain text, not a url");

        var result = CursorCodec.TryDecode(token, out _);

        Assert.False(result);
    }
}
