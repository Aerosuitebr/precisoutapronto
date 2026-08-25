using System;
using System.Collections.Generic;

namespace PrecisouTaProntoGamesDiagnostic.Models
{

public sealed class HardwareSnapshot
{
    public string OperatingSystem { get; set; } = "";
    public string CpuName { get; set; } = "";
    public int LogicalProcessors { get; set; }
    public int PhysicalCores { get; set; }
    public double MemoryGb { get; set; }
    public string GpuName { get; set; } = "";
    public double VideoMemoryGb { get; set; }
    public string DriverVersion { get; set; } = "";
    public List<GraphicsAdapter> GraphicsAdapters { get; set; } = new();
    public string PrimaryDisk { get; set; } = "";
    public double DiskFreeGb { get; set; }
    public List<string> InventoryWarnings { get; set; } = new();
}

public sealed class GraphicsAdapter
{
    public string Name { get; set; } = "";
    public double VideoMemoryGb { get; set; }
    public string DriverVersion { get; set; } = "";
    public bool IsIntegrated { get; set; }
}

public sealed class BenchmarkResult
{
    public double CpuSingleIndex { get; set; }
    public double CpuMultiIndex { get; set; }
    public double MemoryMegabytesPerSecond { get; set; }
    public double StorageWriteMegabytesPerSecond { get; set; }
    public double StorageReadMegabytesPerSecond { get; set; }
    public int CpuScore { get; set; }
    public int MemoryScore { get; set; }
    public int StorageScore { get; set; }
    public int GraphicsScore { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public sealed class GameProfile
{
    public string Slug { get; set; } = "";
    public int Rank { get; set; }
    public string Name { get; set; } = "";
    public string[] Platforms { get; set; } = Array.Empty<string>();
    public int CpuTarget { get; set; }
    public int GpuTarget { get; set; }
    public double RamMinimumGb { get; set; }
    public double StorageMinimumGb { get; set; }
    public string RequirementsSourceUrl { get; set; } = "";
    public DateTimeOffset RequirementsVerifiedAt { get; set; }
    public string EditorialVersion { get; set; } = "";
    public string Minimum { get; set; } = "";
    public string Recommended { get; set; } = "";
    public string QualityNotes { get; set; } = "";
    public bool SupportsIntegratedGpu { get; set; }
    public bool NativeWindowsSupport { get; set; } = true;
    public override string ToString() => Rank > 0 ? $"#{Rank}  {Name}" : Name;
}

public sealed class GameCatalog
{
    public int SchemaVersion { get; set; }
    public string CatalogVersion { get; set; } = "";
    public string Source { get; set; } = "";
    public List<GameProfile> Games { get; set; } = new();
}

public sealed class DiagnosticReport
{
    public string Product { get; set; } = "Precisou, Tá Pronto Games Diagnostic";
    public string Version { get; set; } = "0.9.0";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;
    public string Privacy { get; set; } = "Gerado localmente e exportado somente por ação do usuário.";
    public string DataClassification { get; set; } = "Contém somente dados técnicos. Nome do computador, usuário, arquivos e identificadores pessoais não são coletados.";
    public HardwareSnapshot Hardware { get; set; } = new();
    public BenchmarkResult Benchmark { get; set; } = new();
    public GameProfile Game { get; set; } = new();
    public int CompatibilityScore { get; set; }
    public int Confidence { get; set; }
    public string Verdict { get; set; } = "";
    public List<string> Findings { get; set; } = new();
}
}
