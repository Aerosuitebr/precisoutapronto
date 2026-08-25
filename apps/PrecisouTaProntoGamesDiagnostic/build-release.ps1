param(
  [string]$Runtime = 'win-x64',
  [string]$Output = '',
  [string]$DotnetPath = 'dotnet'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Resolve-Path (Join-Path $projectRoot '..\..')

if (-not $Output) {
  $Output = Join-Path $repositoryRoot 'dist\PrecisouTaProntoGamesDiagnostic'
}

& $DotnetPath restore (Join-Path $projectRoot 'PrecisouTaProntoGamesDiagnostic.csproj')
& $DotnetPath publish (Join-Path $projectRoot 'PrecisouTaProntoGamesDiagnostic.csproj') `
  -c Release `
  -r $Runtime `
  --self-contained true `
  /p:PublishSingleFile=true `
  /p:IncludeNativeLibrariesForSelfExtract=true `
  -o $Output

$exePath = Join-Path $Output 'PrecisouTaProntoGamesDiagnostic.exe'
if (-not (Test-Path -LiteralPath $exePath)) {
  throw "Executável não encontrado em $exePath"
}

$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $exePath
$hashLine = "$($hash.Hash.ToLowerInvariant())  PrecisouTaProntoGamesDiagnostic.exe"
Set-Content -LiteralPath (Join-Path $Output 'PrecisouTaProntoGamesDiagnostic.sha256') -Value $hashLine -Encoding ascii

Write-Host ''
Write-Host "Build concluído: $exePath"
Write-Host "SHA-256: $($hash.Hash)"
