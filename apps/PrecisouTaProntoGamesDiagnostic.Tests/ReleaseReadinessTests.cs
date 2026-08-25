using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using PrecisouTaProntoGamesDiagnostic.Models;
using PrecisouTaProntoGamesDiagnostic.Services;
using Xunit;

namespace PrecisouTaProntoGamesDiagnostic.Tests;

public sealed class ReleaseReadinessTests
{
    [Theory]
    [InlineData(-500, 0)]
    [InlineData(40.4, 40)]
    [InlineData(999, 100)]
    public void ScoresAreAlwaysBounded(double input, int expected)
    {
        Assert.Equal(expected, ReportService.Clamp(input));
        Assert.InRange(BenchmarkService.Clamp(input), 0, 100);
    }

    [Fact]
    public void UnknownGpuIsNotGivenInventedPerformance()
    {
        Assert.Equal(0, ReportService.ScoreGraphics("", 0));
        Assert.Equal(0, ReportService.ScoreGraphics("   ", 8));
    }

    [Fact]
    public void HybridNotebookSelectsDedicatedGpu()
    {
        var adapters = new[]
        {
            new GraphicsAdapter { Name = "Intel Iris Xe Graphics", VideoMemoryGb = 1, IsIntegrated = true },
            new GraphicsAdapter { Name = "NVIDIA GeForce RTX 4060 Laptop GPU", VideoMemoryGb = 8 }
        };
        Assert.Contains("RTX 4060", GraphicsAdapterSelector.SelectBest(adapters)!.Name);
    }

    [Fact]
    public void IntegratedGpuIsDetected()
    {
        Assert.True(GraphicsAdapterSelector.IsIntegrated("Intel UHD Graphics"));
        Assert.True(GraphicsAdapterSelector.IsIntegrated("AMD Radeon Graphics"));
        Assert.False(GraphicsAdapterSelector.IsIntegrated("NVIDIA GeForce RTX 3060"));
    }

    [Fact]
    public void CatalogRejectsWrongSchemaAndUnsafeSource()
    {
        var catalog = ValidCatalog();
        catalog.SchemaVersion = 99;
        Assert.False(GameCatalogService.Validate(catalog, out _));
        catalog = ValidCatalog();
        catalog.Games[0].RequirementsSourceUrl = "http://example.com/requirements";
        Assert.False(GameCatalogService.Validate(catalog, out _));
    }

    [Fact]
    public void CatalogRejectsDuplicatesAndOutOfRangeTargets()
    {
        var catalog = ValidCatalog();
        catalog.Games.Add(catalog.Games[0]);
        Assert.False(GameCatalogService.Validate(catalog, out _));
        catalog = ValidCatalog();
        catalog.Games[0].GpuTarget = 101;
        Assert.False(GameCatalogService.Validate(catalog, out _));
    }

    [Fact]
    public void InvalidOfflineCacheIsIgnored()
    {
        var path = Path.GetTempFileName();
        try
        {
            File.WriteAllText(path, "{not-json");
            Assert.Null(new GameCatalogService(cachePath: path).ReadCache());
        }
        finally { File.Delete(path); }
    }

    [Fact]
    public void ExportContainsNoMachineOrUserIdentifier()
    {
        var report = new ReportService().Create(
            new HardwareSnapshot { CpuName = "CPU", GpuName = "GPU", MemoryGb = 16, DiskFreeGb = 200 },
            new BenchmarkResult { CpuScore = 50, MemoryScore = 50, StorageScore = 50 },
            ValidCatalog().Games[0]);
        var json = new ReportService().Serialize(report);
        Assert.DoesNotContain(Environment.MachineName, json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(Environment.UserName, json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("dados técnicos", report.DataClassification, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task PreCancelledBenchmarkStopsSafely()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            new BenchmarkService().RunAsync(new Progress<(int, string)>(), cancellation.Token));
    }

    private static GameCatalog ValidCatalog() => new()
    {
        SchemaVersion = GameCatalogService.SupportedSchemaVersion,
        CatalogVersion = "2026.07",
        Source = "Teste",
        Games = new List<GameProfile>
        {
            new()
            {
                Slug = "teste", Rank = 1, Name = "Jogo teste", CpuTarget = 50, GpuTarget = 50,
                RamMinimumGb = 8, StorageMinimumGb = 20,
                RequirementsSourceUrl = "https://example.com/requirements",
                RequirementsVerifiedAt = DateTimeOffset.UtcNow,
                EditorialVersion = "2026.07"
            }
        }
    };
}
