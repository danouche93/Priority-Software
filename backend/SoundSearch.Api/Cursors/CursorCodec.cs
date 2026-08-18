using System.Text;

namespace SoundSearch.Api.Cursors;

public static class CursorCodec
{
    public static string Encode(string providerUrl)
    {
        var bytes = Encoding.UTF8.GetBytes(providerUrl);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    public static bool TryDecode(string cursor, out string providerUrl)
    {
        providerUrl = string.Empty;

        if (string.IsNullOrWhiteSpace(cursor))
        {
            return false;
        }

        try
        {
            var base64 = cursor.Replace('-', '+').Replace('_', '/');
            var padded = base64.PadRight(base64.Length + ((4 - (base64.Length % 4)) % 4), '=');
            var bytes = Convert.FromBase64String(padded);
            var decoded = Encoding.UTF8.GetString(bytes);

            if (!Uri.TryCreate(decoded, UriKind.Absolute, out _))
            {
                return false;
            }

            providerUrl = decoded;
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
