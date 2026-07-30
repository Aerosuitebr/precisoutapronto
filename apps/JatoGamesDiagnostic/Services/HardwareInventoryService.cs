using System;
using System.IO;
using System.Management;
using JatoGamesDiagnostic.Models;

namespace JatoGamesDiagnostic.Services
{

public sealed class HardwareInventoryService
{
    public HardwareSnapshot Collect()
    {
        var snapshot = new HardwareSnapshot
        {
            OperatingSystem = Environment.OSVersion.VersionString,
            LogicalProcessors = Environment.ProcessorCount
        };

        ReadFirst("Win32_Processor", item =>
        {
            snapshot.CpuName = ReadString(item, "Name");
            snapshot.PhysicalCores = ReadInt(item, "NumberOfCores");
        });

        ReadFirst("Win32_ComputerSystem", item =>
        {
            snapshot.MemoryGb = ReadLong(item, "TotalPhysicalMemory") / 1024d / 1024d / 1024d;
        });

        ReadFirst("Win32_VideoController", item =>
        {
            snapshot.GpuName = ReadString(item, "Name");
            snapshot.VideoMemoryGb = ReadLong(item, "AdapterRAM") / 1024d / 1024d / 1024d;
            snapshot.DriverVersion = ReadString(item, "DriverVersion");
        });

        var systemRoot = Path.GetPathRoot(Environment.SystemDirectory) ?? "C:\\";
        var drive = new DriveInfo(systemRoot);
        snapshot.PrimaryDisk = drive.Name;
        snapshot.DiskFreeGb = drive.AvailableFreeSpace / 1024d / 1024d / 1024d;
        return snapshot;
    }

    private static void ReadFirst(string className, Action<ManagementObject> reader)
    {
        using var searcher = new ManagementObjectSearcher($"SELECT * FROM {className}");
        foreach (ManagementObject item in searcher.Get())
        {
            reader(item);
            break;
        }
    }

    private static string ReadString(ManagementObject item, string key) =>
        Convert.ToString(item[key])?.Trim() ?? "";

    private static int ReadInt(ManagementObject item, string key) =>
        Convert.ToInt32(item[key] ?? 0);

    private static long ReadLong(ManagementObject item, string key) =>
        Convert.ToInt64(item[key] ?? 0);
}
}
