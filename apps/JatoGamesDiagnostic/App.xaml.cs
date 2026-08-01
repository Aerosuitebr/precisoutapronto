using System.Windows;

namespace JatoGamesDiagnostic
{

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        DispatcherUnhandledException += (_, args) =>
        {
            Services.LocalLog.Write(args.Exception, "Falha não tratada");
            MessageBox.Show(
                "O aplicativo encontrou uma falha inesperada e foi encerrado com segurança. Um registro técnico sem dados pessoais foi salvo localmente.",
                "Jato Games Diagnostic",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            args.Handled = true;
            Current.Shutdown(-1);
        };
        base.OnStartup(e);
    }
}
}
