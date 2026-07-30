using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using JatoGamesDiagnostic.Models;
using JatoGamesDiagnostic.Services;
using Microsoft.Win32;

namespace JatoGamesDiagnostic
{

public partial class MainWindow : Window
{
    private readonly HardwareInventoryService _inventory = new();
    private readonly BenchmarkService _benchmark = new();
    private readonly ReportService _reports = new();
    private DiagnosticReport? _currentReport;

    public MainWindow()
    {
        InitializeComponent();
        GameSelector.ItemsSource = GameProfiles();
        GameSelector.SelectedIndex = 0;
    }

    private async void StartButton_Click(object sender, RoutedEventArgs e)
    {
        if (ConsentCheck.IsChecked != true)
        {
            ConsentWarning.Visibility = Visibility.Visible;
            return;
        }

        ConsentWarning.Visibility = Visibility.Collapsed;
        ConsentView.Visibility = Visibility.Collapsed;
        BenchmarkView.Visibility = Visibility.Visible;
        var game = (GameProfile)GameSelector.SelectedItem;

        try
        {
            StageText.Text = "Lendo inventário do Windows";
            MainProgress.Value = 3;
            ProgressNumber.Text = "3%";
            var hardware = await Task.Run(() => _inventory.Collect());
            LiveHardware.Text =
                $"CPU  {hardware.CpuName}\n" +
                $"GPU  {hardware.GpuName}\n" +
                $"RAM  {hardware.MemoryGb:0.0} GB\n" +
                $"DISCO {hardware.PrimaryDisk} · {hardware.DiskFreeGb:0.0} GB livres";

            var progress = new Progress<(int progress, string stage)>(value =>
            {
                MainProgress.Value = value.progress;
                ProgressNumber.Text = $"{value.progress}%";
                StageText.Text = value.stage;
            });
            var benchmark = await _benchmark.RunAsync(progress, CancellationToken.None);
            MainProgress.Value = 100;
            ProgressNumber.Text = "100%";
            StageText.Text = "Relatório finalizado";
            _currentReport = _reports.Create(hardware, benchmark, game);
            await Task.Delay(260);
            RenderReport(_currentReport);
        }
        catch (Exception exception)
        {
            MessageBox.Show(
                $"O diagnóstico foi interrompido.\n\n{exception.Message}\n\nNenhum arquivo temporário foi mantido.",
                "Jato Games Diagnostic",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
            Restart();
        }
    }

    private void RenderReport(DiagnosticReport report)
    {
        BenchmarkView.Visibility = Visibility.Collapsed;
        ReportView.Visibility = Visibility.Visible;
        OverallScore.Text = report.CompatibilityScore.ToString();
        VerdictText.Text = report.Verdict;
        ReportSubtitle.Text = $"{report.Game.Name} · diagnóstico concluído em {report.CreatedAt:dd/MM/yyyy HH:mm}";

        SetMetric(CpuScoreText, CpuBar, report.Benchmark.CpuScore, $"{report.Hardware.CpuName}\nÍndice multi {report.Benchmark.CpuMultiIndex:0}");
        CpuDetail.Text = $"{report.Hardware.PhysicalCores} núcleos · {report.Hardware.LogicalProcessors} lógicos";
        SetMetric(GpuScoreText, GpuBar, report.Benchmark.GraphicsScore, report.Hardware.GpuName);
        GpuDetail.Text = $"{report.Hardware.VideoMemoryGb:0.0} GB reportados · driver {report.Hardware.DriverVersion}";
        SetMetric(MemoryScoreText, MemoryBar, report.Benchmark.MemoryScore, $"{report.Hardware.MemoryGb:0.0} GB");
        MemoryDetail.Text = $"{report.Benchmark.MemoryMegabytesPerSecond:0} MB/s medidos";
        SetMetric(StorageScoreText, StorageBar, report.Benchmark.StorageScore, $"{report.Hardware.DiskFreeGb:0} GB livres");
        StorageDetail.Text = $"{report.Benchmark.StorageWriteMegabytesPerSecond:0} MB/s escrita · {report.Benchmark.StorageReadMegabytesPerSecond:0} MB/s leitura";
        FindingsList.ItemsSource = report.Findings;
        HardwareSummary.Text =
            $"{report.Hardware.OperatingSystem}\n\n" +
            $"{report.Hardware.CpuName}\n\n" +
            $"{report.Hardware.GpuName}\n\n" +
            $"{report.Hardware.MemoryGb:0.0} GB RAM · {report.Hardware.PrimaryDisk}";
    }

    private static void SetMetric(System.Windows.Controls.TextBlock text, System.Windows.Controls.ProgressBar bar, int score, string tooltip)
    {
        text.Text = $"{score}/100";
        text.ToolTip = tooltip;
        bar.Value = score;
    }

    private void ExportButton_Click(object sender, RoutedEventArgs e)
    {
        if (_currentReport is null) return;
        var dialog = new SaveFileDialog
        {
            Title = "Exportar diagnóstico Jato Games",
            Filter = "Relatório JSON (*.json)|*.json",
            FileName = $"jato-games-diagnostic-{DateTime.Now:yyyyMMdd-HHmm}.json"
        };
        if (dialog.ShowDialog(this) == true)
        {
            File.WriteAllText(dialog.FileName, _reports.Serialize(_currentReport));
            MessageBox.Show("Relatório exportado. Compartilhe somente se desejar.", "Jato Games Diagnostic", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void RestartButton_Click(object sender, RoutedEventArgs e) => Restart();

    private void Restart()
    {
        _currentReport = null;
        MainProgress.Value = 0;
        ProgressNumber.Text = "0%";
        ConsentCheck.IsChecked = false;
        ReportView.Visibility = Visibility.Collapsed;
        BenchmarkView.Visibility = Visibility.Collapsed;
        ConsentView.Visibility = Visibility.Visible;
    }

    private static List<GameProfile> GameProfiles() => new()
    {
        new() { Name = "Counter-Strike 2", CpuTarget = 58, GpuTarget = 54, RamMinimumGb = 8, StorageMinimumGb = 85 },
        new() { Name = "Valorant", CpuTarget = 52, GpuTarget = 48, RamMinimumGb = 8, StorageMinimumGb = 40 },
        new() { Name = "Fortnite", CpuTarget = 60, GpuTarget = 58, RamMinimumGb = 8, StorageMinimumGb = 30 },
        new() { Name = "Elden Ring", CpuTarget = 68, GpuTarget = 70, RamMinimumGb = 12, StorageMinimumGb = 60 },
        new() { Name = "Grand Theft Auto V", CpuTarget = 55, GpuTarget = 56, RamMinimumGb = 8, StorageMinimumGb = 100 },
        new() { Name = "Minecraft com shaders", CpuTarget = 62, GpuTarget = 62, RamMinimumGb = 8, StorageMinimumGb = 10 },
        new() { Name = "EA Sports FC", CpuTarget = 63, GpuTarget = 60, RamMinimumGb = 8, StorageMinimumGb = 100 }
    };
}
}
