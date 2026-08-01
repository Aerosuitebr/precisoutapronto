using System;
using System.Collections.Generic;
using System.IO;
using System.Management;
using JatoGamesDiagnostic.Models;

namespace JatoGamesDiagnostic.Services;

public sealed class HardwareInventoryService
{
    public HardwareSnapshot Collect()
    {
        var snapshot = new HardwareSnapshot
        {
            OperatingSystem = Environment.OSVersion.VersionString,
            LogicalProcessors = Environment.ProcessorCount
        };

        TryRead("processador", snapshot, () => ReadFirst("Win32_Processor", item =>
        {
            snapshot.CpuName = ReadString(item, "Name");
            snapshot.PhysicalCores = ReadInt(item, "NumberOfCores");
        }));

        TryRead("memória", snapshot, () => ReadFirst("Win32_ComputerSystem", item =>
        {
            snapshot.MemoryGb = ReadLong(item, "TotalPhysicalMemory") / 1024d / 1024d / 1024d;
        }));

        TryRead("adaptadores gráficos", snapshot, () =>
        {
            foreach (var item in ReadAll("Win32_VideoController"))
            {
                using (item)
                {
                    var name = ReadString(item, "Name");
                    if (string.IsNullOrWhiteSpace(name)) continue;
                    snapshot.GraphicsAdapters.Add(new GraphicsAdapter
                    {
                        Name = name,
                        VideoMemoryGb = ReadLong(item, "AdapterRAM") / 1024d / 1024d / 1024d,
                        DriverVersion = ReadString(item, "DriverVersion"),
                        IsIntegrated = GraphicsAdapterSelector.IsIntegrated(name)
                    });
                }
            }
            var selected = GraphicsAdapterSelector.SelectBest(snapshot.GraphicsAdapters);
            if (selected is null) return;
            snapshot.GpuName = selected.Name;
            snapshot.VideoMemoryGb = selected.VideoMemoryGb;
            snapshot.DriverVersion = selected.DriverVersion;
        });

        TryRead("armazenamento", snapshot, () =>
        {
            var systemRoot = Path.GetPathRoot(Environment.SystemDirectory) ?? "C:\\";
            var drive = new DriveInfo(systemRoot);
            snapshot.PrimaryDisk = drive.Name;
            snapshot.DiskFreeGb = drive.AvailableFreeSpace / 1024d / 1024d / 1024d;
        });

        if (string.IsNullOrWhiteSpace(snapshot.CpuName))
            snapshot.InventoryWarnings.Add("Processador não identificado; a comparação de CPU terá confiança reduzida.");
        if (string.IsNullOrWhiteSpace(snapshot.GpuName))
            snapshot.InventoryWarnings.Add("GPU não identificada; nenhuma capacidade gráfica será presumida.");
        if (snapshot.MemoryGb <= 0)
            snapshot.InventoryWarnings.Add("Memória instalada não identificada.");
        return snapshot;
    }

    private static void TryRead(string area, HardwareSnapshot snapshot, Action action)
    {
        try { action(); }
        catch (Exception exception) when (exception is ManagementException or UnauthorizedAccessException or IOException or InvalidOperationException or System.Runtime.InteropServices.COMException)
        {
            snapshot.InventoryWarnings.Add($"Não foi possível consultar {area}: {exception.GetType().Name}.");
            LocalLog.Write(exception, $"Inventário: {area}");
        }
    }

    private static void ReadFirst(string className, Action<ManagementObject> reader)
    {
        foreach (var item in ReadAll(className))
        {
            using (item) { reader(item); }
            break;
        }
    }

    private static IEnumerable<ManagementObject> ReadAll(string className)
    {
        using var searcher = new ManagementObjectSearcher($"SELECT * FROM {className}");
        using var collection = searcher.Get();
        foreach (ManagementObject item in collection) yield return item;
    }

    private static string ReadString(ManagementObject item, string key) =>
        Convert.ToString(item[key])?.Trim() ?? "";

    private static int ReadInt(ManagementObject item, string key)
    {
        try { return Convert.ToInt32(item[key] ?? 0); }
        catch { return 0; }
    }

    private static long ReadLong(ManagementObject item, string key)
    {
        try { return Convert.ToInt64(item[key] ?? 0); }
        catch { return 0; }
    }
}
