using SoundSearch.Api.Providers;

var builder = WebApplication.CreateBuilder(args);

// Render (and most PaaS hosts) tell the app which port to bind to via $PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// The data-source seam: swap MixcloudSearchProvider for another
// IMusicSearchProvider implementation to point the app at a different
// Sound API without touching controllers, DTOs, or the frontend.
builder.Services.AddHttpClient<IMusicSearchProvider, MixcloudSearchProvider>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("SoundSearchApp/1.0 (+https://github.com/)");
});

const string FrontendCorsPolicy = "Frontend";
var allowedOrigins = (builder.Configuration["AllowedOrigin"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

// Exposed so WebApplicationFactory<Program> can be used from integration tests.
public partial class Program;
