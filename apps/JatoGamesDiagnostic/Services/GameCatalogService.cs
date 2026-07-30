using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using JatoGamesDiagnostic.Models;

namespace JatoGamesDiagnostic.Services
{

public sealed class GameCatalogService
{
    private const string ProductionUrl = "https://resolvajato.com.br/api/games/catalog";
    private readonly string _cachePath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "JatoGamesDiagnostic",
        "catalog.json");

    public IReadOnlyList<GameProfile> Fallback() => new List<GameProfile>
    {
        new() { Slug = "counter-strike-2", Rank = 1, Name = "Counter-Strike 2", CpuTarget = 58, GpuTarget = 54, RamMinimumGb = 8, StorageMinimumGb = 85 },
        new() { Slug = "league-of-legends", Rank = 2, Name = "League of Legends", CpuTarget = 44, GpuTarget = 38, RamMinimumGb = 8, StorageMinimumGb = 20 },
        new() { Slug = "valorant", Rank = 3, Name = "Valorant", CpuTarget = 52, GpuTarget = 48, RamMinimumGb = 8, StorageMinimumGb = 40 },
        new() { Slug = "grand-theft-auto-v", Rank = 4, Name = "Grand Theft Auto V", CpuTarget = 55, GpuTarget = 56, RamMinimumGb = 8, StorageMinimumGb = 100 },
        new() { Slug = "minecraft", Rank = 5, Name = "Minecraft", CpuTarget = 48, GpuTarget = 42, RamMinimumGb = 4, StorageMinimumGb = 2 },
        new() { Slug = "fortnite", Rank = 6, Name = "Fortnite", CpuTarget = 60, GpuTarget = 58, RamMinimumGb = 8, StorageMinimumGb = 30 },
        new() { Slug = "elden-ring", Rank = 7, Name = "Elden Ring", CpuTarget = 68, GpuTarget = 70, RamMinimumGb = 12, StorageMinimumGb = 60 },
        new() { Slug = "free-fire", Rank = 8, Name = "Free Fire", CpuTarget = 38, GpuTarget = 34, RamMinimumGb = 4, StorageMinimumGb = 2 },
        new() { Slug = "roblox", Rank = 9, Name = "Roblox", CpuTarget = 40, GpuTarget = 38, RamMinimumGb = 4, StorageMinimumGb = 2 },
        new() { Slug = "ea-sports-fc", Rank = 10, Name = "EA Sports FC", CpuTarget = 63, GpuTarget = 60, RamMinimumGb = 8, StorageMinimumGb = 100 }
    };

    public GameCatalog? ReadCache()
    {
        try
        {
            if (!File.Exists(_cachePath)) return null;
            return Deserialize(File.ReadAllText(_cachePath));
        }
        catch
        {
            return null;
        }
    }

    public async Task<GameCatalog> RefreshAsync(CancellationToken cancellationToken)
    {
        var overrideUrl = Environment.GetEnvironmentVariable("JATO_GAMES_CATALOG_URL");
        var url = string.IsNullOrWhiteSpace(overrideUrl) ? ProductionUrl : overrideUrl;
        using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
        client.DefaultRequestHeaders.UserAgent.ParseAdd("JatoGamesDiagnostic/0.2");
        var json = await client.GetStringAsync(url, cancellationToken);
        var catalog = Deserialize(json) ?? throw new InvalidDataException("Catálogo recebido em formato inválido.");
        if (catalog.SchemaVersion != 1 || catalog.Games.Count == 0)
            throw new InvalidDataException("Catálogo vazio ou incompatível.");

        Directory.CreateDirectory(Path.GetDirectoryName(_cachePath)!);
        File.WriteAllText(_cachePath, json);
        return catalog;
    }

    private static GameCatalog? Deserialize(string json) =>
        JsonSerializer.Deserialize<GameCatalog>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
}
}
