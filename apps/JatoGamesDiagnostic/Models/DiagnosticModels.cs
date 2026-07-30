using System;
using System.Collections.Generic;

namespace JatoGamesDiagnostic.Models
{

public sealed class HardwareSnapshot
{
    public string MachineName { get; set; } = Environment.MachineName;
    public string OperatingSystem { get; set; } = "";
    public string CpuName { get; set; } = "";
    public int LogicalProcessors { get; set; }
    public int PhysicalCores { get; set; }
    public double MemoryGb { get; set; }
    public string GpuName { get; set; } = "";
    public double VideoMemoryGb { get; set; }
    public string DriverVersion { get; set; } = "";
    public string PrimaryDisk { get; set; } = "";
    public double DiskFreeGb { get; set; }
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
    public string Product { get; set; } = "Jato Games Diagnostic";
    public string Version { get; set; } = "0.2.0";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;
    public string Privacy { get; set; } = "Gerado localmente e exportado somente por ação do usuário.";
    public HardwareSnapshot Hardware { get; set; } = new();
    public BenchmarkResult Benchmark { get; set; } = new();
    public GameProfile Game { get; set; } = new();
    public int CompatibilityScore { get; set; }
    public int Confidence { get; set; }
    public string Verdict { get; set; } = "";
    public List<string> Findings { get; set; } = new();
}
}
