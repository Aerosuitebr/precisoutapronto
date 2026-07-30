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
    private readonly GameCatalogService _catalog = new();
    private DiagnosticReport? _currentReport;
    private CancellationTokenSource? _diagnosticCancellation;

    public MainWindow()
    {
        InitializeComponent();
        ApplyCatalog(_catalog.ReadCache()?.Games ?? _catalog.Fallback(), "Top 10 offline disponível");
        Loaded += async (_, _) => await RefreshCatalogAsync(false);
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
        _diagnosticCancellation?.Dispose();
        _diagnosticCancellation = new CancellationTokenSource();
        var cancellationToken = _diagnosticCancellation.Token;

        try
        {
            StageText.Text = "Lendo inventário do Windows";
            MainProgress.Value = 3;
            ProgressNumber.Text = "3%";
            var hardware = await Task.Run(() => _inventory.Collect(), cancellationToken);
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
            var benchmark = await _benchmark.RunAsync(progress, cancellationToken);
            MainProgress.Value = 100;
            ProgressNumber.Text = "100%";
            StageText.Text = "Relatório finalizado";
            _currentReport = _reports.Create(hardware, benchmark, game);
            await Task.Delay(260);
            RenderReport(_currentReport);
        }
        catch (OperationCanceledException)
        {
            MessageBox.Show("O teste foi cancelado com segurança. Nenhum resultado foi enviado.", "Jato Games Diagnostic", MessageBoxButton.OK, MessageBoxImage.Information);
            Restart();
        }
        catch (Exception exception)
        {
            LocalLog.Write(exception, "Diagnóstico");
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
        ConfidenceText.Text = $"Fidelidade do diagnóstico: {report.Confidence}%";
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
            try
            {
                File.WriteAllText(dialog.FileName, _reports.Serialize(_currentReport));
                MessageBox.Show("Relatório técnico exportado sem nome do computador ou usuário. Compartilhe somente se desejar.", "Jato Games Diagnostic", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception exception)
            {
                LocalLog.Write(exception, "Exportação do relatório");
                MessageBox.Show("Não foi possível salvar nesse local. Escolha uma pasta em que você tenha permissão.", "Jato Games Diagnostic", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }
    }

    private void RestartButton_Click(object sender, RoutedEventArgs e) => Restart();
    private void CancelButton_Click(object sender, RoutedEventArgs e) => _diagnosticCancellation?.Cancel();

    private async void RefreshCatalogButton_Click(object sender, RoutedEventArgs e) =>
        await RefreshCatalogAsync(true);

    private async Task RefreshCatalogAsync(bool notifyFailure)
    {
        RefreshCatalogButton.IsEnabled = false;
        CatalogStatus.Text = "Verificando Top 10 do Jato Games…";
        try
        {
            var catalog = await _catalog.RefreshAsync(CancellationToken.None);
            var version = DateTimeOffset.TryParse(catalog.CatalogVersion, out var updatedAt)
                ? updatedAt.ToLocalTime().ToString("dd/MM/yyyy")
                : catalog.CatalogVersion;
            ApplyCatalog(catalog.Games, $"✓ Top 10 atualizado · {version}");
        }
        catch
        {
            CatalogStatus.Text = "Modo offline · usando último Top 10 disponível";
            if (notifyFailure)
                MessageBox.Show("Não foi possível consultar o catálogo agora. A lista offline continua disponível.", "Jato Games Diagnostic", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        finally
        {
            RefreshCatalogButton.IsEnabled = true;
        }
    }

    private void ApplyCatalog(IEnumerable<GameProfile> games, string status)
    {
        var selectedSlug = (GameSelector.SelectedItem as GameProfile)?.Slug;
        var list = new List<GameProfile>(games);
        if (list.Count == 0) list.AddRange(_catalog.Fallback());
        GameSelector.ItemsSource = list;
        GameSelector.SelectedItem = list.Find(game => game.Slug == selectedSlug) ?? list[0];
        CatalogStatus.Text = status;
    }

    private void Restart()
    {
        _diagnosticCancellation?.Dispose();
        _diagnosticCancellation = null;
        _currentReport = null;
        MainProgress.Value = 0;
        ProgressNumber.Text = "0%";
        ConsentCheck.IsChecked = false;
        ReportView.Visibility = Visibility.Collapsed;
        BenchmarkView.Visibility = Visibility.Collapsed;
        ConsentView.Visibility = Visibility.Visible;
    }

}
}
