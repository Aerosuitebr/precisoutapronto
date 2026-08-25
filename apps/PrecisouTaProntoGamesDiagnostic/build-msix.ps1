param(
  [string]$IdentityName = 'Aerosuite.PrecisouTaProntoGamesDiagnostic',
  [string]$Publisher = 'CN=Aerosuite',
  [string]$Version = '0.9.0.0',
  [string]$CertificateThumbprint = '',
  [string]$DotnetPath = 'dotnet'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Resolve-Path (Join-Path $projectRoot '..\..')
$outputRoot = Join-Path $repositoryRoot 'dist\PrecisouTaProntoGamesDiagnostic'
$publishRoot = Join-Path $outputRoot 'msix-content'
$msixPath = Join-Path $outputRoot "PrecisouTaProntoGamesDiagnostic-$Version-x64.msix"
$windowsSdkRoot = 'C:\Program Files (x86)\Windows Kits\10\bin'
$makeAppx = Get-ChildItem $windowsSdkRoot -Recurse -Filter makeappx.exe |
  Where-Object FullName -Match '\\x64\\makeappx.exe$' |
  Sort-Object FullName -Descending |
  Select-Object -First 1 -ExpandProperty FullName
$signTool = Get-ChildItem $windowsSdkRoot -Recurse -Filter signtool.exe |
  Where-Object FullName -Match '\\x64\\signtool.exe$' |
  Sort-Object FullName -Descending |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $makeAppx) { throw 'MakeAppx.exe não foi encontrado no Windows SDK.' }
if (Test-Path -LiteralPath $publishRoot) { Remove-Item -LiteralPath $publishRoot -Recurse -Force }
New-Item -ItemType Directory -Force -Path $publishRoot | Out-Null

& $DotnetPath publish (Join-Path $projectRoot 'PrecisouTaProntoGamesDiagnostic.csproj') `
  -c Release -r win-x64 --self-contained true `
  /p:PublishSingleFile=true /p:IncludeNativeLibrariesForSelfExtract=true `
  -o $publishRoot
Get-ChildItem -LiteralPath $publishRoot -Filter *.pdb | Remove-Item -Force

Copy-Item -LiteralPath (Join-Path $projectRoot 'Packaging\Assets') -Destination $publishRoot -Recurse
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'Packaging\AppxManifest.template.xml') -Raw
$manifest = $manifest.Replace('{{IDENTITY_NAME}}', $IdentityName).Replace('{{PUBLISHER}}', $Publisher).Replace('{{VERSION}}', $Version)
Set-Content -LiteralPath (Join-Path $publishRoot 'AppxManifest.xml') -Value $manifest -Encoding utf8

if (Test-Path -LiteralPath $msixPath) { Remove-Item -LiteralPath $msixPath -Force }
& $makeAppx pack /d $publishRoot /p $msixPath /o
if ($LASTEXITCODE -ne 0) { throw "MakeAppx falhou com código $LASTEXITCODE." }

if ($CertificateThumbprint) {
  if (-not $signTool) { throw 'SignTool.exe não foi encontrado no Windows SDK.' }
  & $signTool sign /sha1 $CertificateThumbprint /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 $msixPath
  if ($LASTEXITCODE -ne 0) { throw "Assinatura falhou com código $LASTEXITCODE." }
  & $signTool verify /pa /v $msixPath
  if ($LASTEXITCODE -ne 0) { throw "Verificação da assinatura falhou com código $LASTEXITCODE." }
}

$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $msixPath
Set-Content -LiteralPath "$msixPath.sha256" -Value "$($hash.Hash.ToLowerInvariant())  $(Split-Path $msixPath -Leaf)" -Encoding ascii
Write-Host "MSIX concluído: $msixPath"
Write-Host "SHA-256: $($hash.Hash)"
if (-not $CertificateThumbprint) {
  Write-Warning 'Pacote não assinado: use apenas para validação/Partner Center. Para instalação direta, informe CertificateThumbprint.'
}
