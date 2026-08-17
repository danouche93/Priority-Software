# Build context is the backend/ folder.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY SoundSearch.Api/SoundSearch.Api.csproj SoundSearch.Api/
RUN dotnet restore SoundSearch.Api/SoundSearch.Api.csproj

COPY SoundSearch.Api/ SoundSearch.Api/
RUN dotnet publish SoundSearch.Api/SoundSearch.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render (and most PaaS hosts) inject $PORT at runtime; Program.cs binds to
# it directly, so no fixed port is declared here.
ENTRYPOINT ["dotnet", "SoundSearch.Api.dll"]
