using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using PrecisouTaProntoGamesDiagnostic.Models;

namespace PrecisouTaProntoGamesDiagnostic.Services;

public sealed class GameCatalogService
{
    public const int SupportedSchemaVersion = 2;
    private const string ProductionUrl = "https://precisoutapronto.com.br/api/games/catalog";
    private readonly string _cachePath;
    private readonly HttpClient _client;
    private readonly string _url;

    public GameCatalogService(HttpClient? client = null, string? cachePath = null, string? url = null)
    {
        _client = client ?? new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
        _cachePath = cachePath ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "PrecisouTaProntoGamesDiagnostic", "catalog-v2.json");
        _url = url ?? Environment.GetEnvironmentVariable("PRECISOUTAPRONTO_GAMES_CATALOG_URL") ?? ProductionUrl;
        if (!Uri.TryCreate(_url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttps && uri.Host is not ("localhost" or "127.0.0.1")))
            throw new ArgumentException("O catálogo deve usar HTTPS; HTTP é permitido apenas em testes locais.", nameof(url));
    }

    public IReadOnlyList<GameProfile> Fallback() => new List<GameProfile>
    {
        Profile("counter-strike-2", 1, "Counter-Strike 2", 58, 54, 8, 85, "https://store.steampowered.com/app/730/CounterStrike_2/"),
        Profile("league-of-legends", 2, "League of Legends", 44, 38, 8, 20, "https://support-leagueoflegends.riotgames.com/hc/pt-br/articles/201752654", integrated: true),
        Profile("valorant", 3, "Valorant", 52, 48, 8, 40, "https://support-valorant.riotgames.com/hc/pt-br/articles/360044136134", integrated: true),
        Profile("grand-theft-auto-v", 4, "Grand Theft Auto V", 55, 56, 8, 100, "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/"),
        Profile("minecraft", 5, "Minecraft", 48, 42, 4, 2, "https://www.minecraft.net/store/minecraft-java-bedrock-edition-pc", integrated: true),
        Profile("fortnite", 6, "Fortnite", 60, 58, 8, 30, "https://www.epicgames.com/help/fortnite-c5719335176219/technical-support-c5719372265755/what-are-the-system-requirements-for-fortnite-on-pc-a5720377106075"),
        Profile("elden-ring", 7, "Elden Ring", 68, 70, 12, 60, "https://store.steampowered.com/app/1245620/ELDEN_RING/"),
        Profile("free-fire", 8, "Free Fire", 38, 34, 4, 2, "https://ffsupport.garena.com/hc/en-us", integrated: true, nativeWindows: false),
        Profile("roblox", 9, "Roblox", 40, 38, 4, 2, "https://en.help.roblox.com/hc/en-us/articles/203312800", integrated: true),
        Profile("ea-sports-fc", 10, "EA Sports FC", 63, 60, 8, 100, "https://www.ea.com/games/ea-sports-fc")
    };

    public GameCatalog? ReadCache()
    {
        try
        {
            if (!File.Exists(_cachePath)) return null;
            var catalog = Deserialize(File.ReadAllText(_cachePath));
            return Validate(catalog, out _) ? catalog : null;
        }
        catch (Exception exception)
        {
            LocalLog.Write(exception, "Leitura do catálogo offline");
            return null;
        }
    }

    public async Task<GameCatalog> RefreshAsync(CancellationToken cancellationToken)
    {
        _client.DefaultRequestHeaders.UserAgent.ParseAdd("PrecisouTaProntoGamesDiagnostic/0.9");
        using var response = await _client.GetAsync(_url, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        if (response.Content.Headers.ContentLength > 512_000)
            throw new InvalidDataException("Catálogo excede o tamanho permitido.");
        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        if (json.Length > 512_000) throw new InvalidDataException("Catálogo excede o tamanho permitido.");
        var catalog = Deserialize(json);
        if (!Validate(catalog, out var reason))
            throw new InvalidDataException($"Catálogo rejeitado: {reason}");

        Directory.CreateDirectory(Path.GetDirectoryName(_cachePath)!);
        var temporaryPath = _cachePath + ".tmp";
        File.WriteAllText(temporaryPath, json);
        File.Move(temporaryPath, _cachePath, true);
        return catalog!;
    }

    public static bool Validate(GameCatalog? catalog, out string reason)
    {
        reason = "";
        if (catalog is null) { reason = "JSON inválido"; return false; }
        if (catalog.SchemaVersion != SupportedSchemaVersion) { reason = "schema incompatível"; return false; }
        if (string.IsNullOrWhiteSpace(catalog.CatalogVersion) || catalog.Games.Count is < 1 or > 50)
        { reason = "versão ou quantidade inválida"; return false; }
        if (catalog.Games.Select(game => game.Slug).Distinct(StringComparer.OrdinalIgnoreCase).Count() != catalog.Games.Count)
        { reason = "jogos duplicados"; return false; }

        foreach (var game in catalog.Games)
        {
            if (string.IsNullOrWhiteSpace(game.Slug) || string.IsNullOrWhiteSpace(game.Name) ||
                game.CpuTarget is < 0 or > 100 || game.GpuTarget is < 0 or > 100 ||
                game.RamMinimumGb is <= 0 or > 256 || game.StorageMinimumGb is <= 0 or > 4096 ||
                game.RequirementsVerifiedAt == default || string.IsNullOrWhiteSpace(game.EditorialVersion) ||
                !Uri.TryCreate(game.RequirementsSourceUrl, UriKind.Absolute, out var source) ||
                source.Scheme != Uri.UriSchemeHttps)
            { reason = $"perfil inválido: {game.Slug}"; return false; }
        }
        return true;
    }

    private static GameProfile Profile(string slug, int rank, string name, int cpu, int gpu, double ram, double storage,
        string source, bool integrated = false, bool nativeWindows = true) => new()
        {
            Slug = slug, Rank = rank, Name = name, Platforms = nativeWindows ? new[] { "PC" } : new[] { "Mobile" },
            CpuTarget = cpu, GpuTarget = gpu, RamMinimumGb = ram, StorageMinimumGb = storage,
            RequirementsSourceUrl = source, RequirementsVerifiedAt = new DateTimeOffset(2026, 7, 30, 0, 0, 0, TimeSpan.Zero),
            EditorialVersion = "2026.07", Minimum = $"{ram:0} GB RAM · {storage:0} GB",
            Recommended = "Consulte a fonte oficial versionada.", QualityNotes = "Estimativa orientativa; não prevê FPS.",
            SupportsIntegratedGpu = integrated, NativeWindowsSupport = nativeWindows
        };

    private static GameCatalog? Deserialize(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<GameCatalog>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                MaxDepth = 16
            });
        }
        catch (JsonException) { return null; }
    }
}
