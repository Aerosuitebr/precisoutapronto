using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using JatoGamesDiagnostic.Models;

namespace JatoGamesDiagnostic.Services
{

public sealed class BenchmarkService
{
    public async Task<BenchmarkResult> RunAsync(IProgress<(int progress, string stage)> progress, CancellationToken cancellationToken)
    {
        progress.Report((8, "Preparando carga de processamento"));
        var single = await Task.Run(() => RunCpuWorker(900, cancellationToken), cancellationToken);

        progress.Report((26, "Medindo processamento paralelo"));
        var workers = Math.Max(1, Math.Min(Environment.ProcessorCount, 16));
        var tasks = new Task<double>[workers];
        for (var index = 0; index < workers; index++)
            tasks[index] = Task.Run(() => RunCpuWorker(1050, cancellationToken), cancellationToken);
        var multiValues = await Task.WhenAll(tasks);
        var multi = 0d;
        foreach (var value in multiValues) multi += value;

        progress.Report((50, "Medindo largura de banda da memória"));
        var memory = await Task.Run(() => RunMemoryBenchmark(cancellationToken), cancellationToken);

        progress.Report((69, "Criando arquivo temporário para o teste de disco"));
        var storage = await Task.Run(() => RunStorageBenchmark(cancellationToken), cancellationToken);

        progress.Report((91, "Normalizando resultados locais"));
        await Task.Delay(180, cancellationToken);
        return new BenchmarkResult
        {
            CpuSingleIndex = single,
            CpuMultiIndex = multi,
            MemoryMegabytesPerSecond = memory,
            StorageWriteMegabytesPerSecond = storage.write,
            StorageReadMegabytesPerSecond = storage.read,
            CpuScore = Clamp(25 + Math.Log10(Math.Max(multi, 1)) * 18),
            MemoryScore = Clamp(memory / 180),
            StorageScore = Clamp((storage.write + storage.read) / 55)
        };
    }

    private static double RunCpuWorker(int durationMs, CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        long operations = 0;
        var accumulator = 0d;
        while (stopwatch.ElapsedMilliseconds < durationMs)
        {
            for (var index = 1; index <= 22000; index++)
                accumulator += Math.Sqrt(index * 1.0000001) % 23;
            operations += 22000;
            cancellationToken.ThrowIfCancellationRequested();
        }
        GC.KeepAlive(accumulator);
        return operations / stopwatch.Elapsed.TotalMilliseconds;
    }

    private static double RunMemoryBenchmark(CancellationToken cancellationToken)
    {
        const int bytes = 128 * 1024 * 1024;
        var source = new byte[bytes];
        var destination = new byte[bytes];
        new Random(42).NextBytes(source);
        var stopwatch = Stopwatch.StartNew();
        const int rounds = 5;
        for (var index = 0; index < rounds; index++)
        {
            Buffer.BlockCopy(source, 0, destination, 0, bytes);
            cancellationToken.ThrowIfCancellationRequested();
        }
        stopwatch.Stop();
        return (bytes * rounds / 1024d / 1024d) / stopwatch.Elapsed.TotalSeconds;
    }

    private static (double write, double read) RunStorageBenchmark(CancellationToken cancellationToken)
    {
        var path = Path.Combine(Path.GetTempPath(), $"jato-games-benchmark-{Guid.NewGuid():N}.tmp");
        const int totalBytes = 192 * 1024 * 1024;
        var buffer = new byte[4 * 1024 * 1024];
        new Random(84).NextBytes(buffer);
        try
        {
            var stopwatch = Stopwatch.StartNew();
            using (var stream = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, buffer.Length, FileOptions.WriteThrough))
            {
                for (var written = 0; written < totalBytes; written += buffer.Length)
                {
                    stream.Write(buffer, 0, buffer.Length);
                    cancellationToken.ThrowIfCancellationRequested();
                }
                stream.Flush(true);
            }
            stopwatch.Stop();
            var write = totalBytes / 1024d / 1024d / stopwatch.Elapsed.TotalSeconds;

            stopwatch.Restart();
            using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, buffer.Length, FileOptions.SequentialScan))
            {
                while (stream.Read(buffer, 0, buffer.Length) > 0)
                    cancellationToken.ThrowIfCancellationRequested();
            }
            stopwatch.Stop();
            var read = totalBytes / 1024d / 1024d / stopwatch.Elapsed.TotalSeconds;
            return (write, read);
        }
        finally
        {
            if (File.Exists(path)) File.Delete(path);
        }
    }

    private static int Clamp(double value) => (int)Math.Max(0, Math.Min(100, Math.Round(value)));
}
}
