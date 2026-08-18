# Build context is the repo root (needs both frontend/ and backend/).
FROM node:20-alpine AS frontend-build
WORKDIR /src
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src
COPY backend/SoundSearch.Api/SoundSearch.Api.csproj SoundSearch.Api/
RUN dotnet restore SoundSearch.Api/SoundSearch.Api.csproj

COPY backend/SoundSearch.Api/ SoundSearch.Api/
RUN dotnet publish SoundSearch.Api/SoundSearch.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /src/dist ./wwwroot

# Render (and most PaaS hosts) inject $PORT at runtime; Program.cs binds to
# it directly, so no fixed port is declared here.
ENTRYPOINT ["dotnet", "SoundSearch.Api.dll"]
