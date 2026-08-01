using System;
using System.Collections.Generic;
using System.Text.Json;
using JatoGamesDiagnostic.Models;

namespace JatoGamesDiagnostic.Services
{

public sealed class ReportService
{
    public DiagnosticReport Create(HardwareSnapshot hardware, BenchmarkResult benchmark, GameProfile game)
    {
        benchmark.GraphicsScore = ScoreGraphics(hardware.GpuName, hardware.VideoMemoryGb);
        var ramScore = Clamp(hardware.MemoryGb / Math.Max(game.RamMinimumGb, 1) * 58);
        var diskSpaceScore = Clamp(hardware.DiskFreeGb / Math.Max(game.StorageMinimumGb, 1) * 58);
        var cpuFit = Clamp(benchmark.CpuScore - game.CpuTarget + 58);
        var gpuFit = Clamp(benchmark.GraphicsScore - game.GpuTarget + 58);
        var score = (int)Math.Round(cpuFit * .30 + gpuFit * .35 + ramScore * .18 + Math.Min(benchmark.StorageScore, diskSpaceScore) * .17);
        var findings = new List<string>();

        findings.AddRange(hardware.InventoryWarnings);
        findings.AddRange(benchmark.Warnings);
        if (cpuFit < 55) findings.Add("CPU é o principal ponto de atenção para esta referência.");
        if (gpuFit < 55) findings.Add("A GPU identificada está abaixo do perfil gráfico definido para o jogo.");
        var selectedGpu = GraphicsAdapterSelector.SelectBest(hardware.GraphicsAdapters);
        if (selectedGpu?.IsIntegrated == true && !game.SupportsIntegratedGpu)
            findings.Add("GPU integrada detectada; este perfil recomenda uma GPU dedicada e pode apresentar limitações.");
        if (!game.NativeWindowsSupport)
            findings.Add("Este jogo não possui suporte nativo para Windows neste perfil; emuladores não são avaliados.");
        if (hardware.MemoryGb < game.RamMinimumGb) findings.Add($"RAM abaixo do mínimo de {game.RamMinimumGb:0} GB.");
        if (hardware.DiskFreeGb < game.StorageMinimumGb) findings.Add($"Espaço livre abaixo dos {game.StorageMinimumGb:0} GB exigidos.");
        if (findings.Count == 0) findings.Add("Nenhum requisito objetivo ficou abaixo da referência cadastrada.");
        findings.Add("FPS real ainda varia com resolução, qualidade, drivers, temperatura e processos em segundo plano.");

        return new DiagnosticReport
        {
            Hardware = hardware,
            Benchmark = benchmark,
            Game = game,
            CompatibilityScore = Clamp(score),
            Confidence = CalculateConfidence(hardware, benchmark, game),
            Verdict = score >= 78 ? "Perfil recomendado" : score >= 56 ? "Compatível com ajustes" : "Upgrade recomendado",
            Findings = findings
        };
    }

    public string Serialize(DiagnosticReport report) =>
        JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true });

    public static int ScoreGraphics(string name, double memoryGb)
    {
        if (string.IsNullOrWhiteSpace(name)) return 0;
        var text = name.ToLowerInvariant();
        var score =
            text.Contains("rtx 40") || text.Contains("rx 7") ? 94 :
            text.Contains("rtx 30") || text.Contains("rx 6") ? 80 :
            text.Contains("rtx 20") || text.Contains("gtx 16") ? 67 :
            text.Contains("gtx 10") || text.Contains("rx 5") ? 53 :
            text.Contains("iris") || text.Contains("vega") ? 42 :
            text.Contains("intel") ? 30 : 48;
        return Clamp(score + Math.Min(memoryGb, 16) * .8);
    }

    public static int Clamp(double value) => (int)Math.Max(0, Math.Min(100, Math.Round(value)));

    private static int CalculateConfidence(HardwareSnapshot hardware, BenchmarkResult benchmark, GameProfile game)
    {
        var confidence = 94;
        confidence -= hardware.InventoryWarnings.Count * 10;
        confidence -= benchmark.Warnings.Count * 8;
        if (string.IsNullOrWhiteSpace(game.RequirementsSourceUrl)) confidence -= 12;
        if (game.RequirementsVerifiedAt == default) confidence -= 8;
        if (!game.NativeWindowsSupport) confidence -= 20;
        return Clamp(confidence);
    }
}
}
