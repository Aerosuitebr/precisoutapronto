param(
  [string]$DotnetPath = 'dotnet',
  [string]$PackagePath = '',
  [switch]$RunDefenderScan
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Resolve-Path (Join-Path $projectRoot '..\..')
$testProject = Join-Path $repositoryRoot 'apps\PrecisouTaProntoGamesDiagnostic.Tests\PrecisouTaProntoGamesDiagnostic.Tests.csproj'

& $DotnetPath test $testProject -c Release
if ($LASTEXITCODE -ne 0) { throw 'A suíte automatizada falhou.' }

if ($PackagePath) {
  $resolvedPackage = Resolve-Path $PackagePath
  $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $resolvedPackage
  Write-Host "SHA-256: $($hash.Hash)"

  $signTool = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter signtool.exe |
    Where-Object FullName -Match '\\x64\\signtool.exe$' |
    Sort-Object FullName -Descending |
    Select-Object -First 1 -ExpandProperty FullName
  if ($signTool) {
    & $signTool verify /pa /v $resolvedPackage
    if ($LASTEXITCODE -ne 0) {
      Write-Warning 'Pacote ainda não possui assinatura pública válida. Isso é esperado antes do Partner Center/certificado.'
    }
  }

  if ($RunDefenderScan) {
    $defender = Get-Command Start-MpScan -ErrorAction SilentlyContinue
    if (-not $defender) { throw 'Microsoft Defender PowerShell não está disponível neste ambiente.' }
    Start-MpScan -ScanType CustomScan -ScanPath $resolvedPackage
    Write-Host 'Verificação do Microsoft Defender solicitada com sucesso.'
  }
}
