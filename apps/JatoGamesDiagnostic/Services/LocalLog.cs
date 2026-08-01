using System;
using System.IO;

namespace JatoGamesDiagnostic.Services;

public static class LocalLog
{
    private static readonly string DirectoryPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "JatoGamesDiagnostic", "Logs");

    public static string CurrentPath => Path.Combine(DirectoryPath, $"diagnostic-{DateTime.UtcNow:yyyyMMdd}.log");

    public static void Write(Exception exception, string context)
    {
        try
        {
            Directory.CreateDirectory(DirectoryPath);
            var line = $"{DateTimeOffset.UtcNow:O}\t{context}\t{exception.GetType().Name}\t{Sanitize(exception.Message)}{Environment.NewLine}";
            File.AppendAllText(CurrentPath, line);
            RemoveOldLogs();
        }
        catch
        {
            // Logging must never interrupt the diagnostic.
        }
    }

    private static string Sanitize(string value)
    {
        var sanitized = value
            .Replace(Environment.UserName, "[usuario]", StringComparison.OrdinalIgnoreCase)
            .Replace(Environment.MachineName, "[maquina]", StringComparison.OrdinalIgnoreCase)
            .Replace(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "[perfil]", StringComparison.OrdinalIgnoreCase);
        return sanitized.Replace("\r", " ").Replace("\n", " ");
    }

    private static void RemoveOldLogs()
    {
        foreach (var file in Directory.EnumerateFiles(DirectoryPath, "diagnostic-*.log"))
            if (File.GetCreationTimeUtc(file) < DateTime.UtcNow.AddDays(-14))
                File.Delete(file);
    }
}
