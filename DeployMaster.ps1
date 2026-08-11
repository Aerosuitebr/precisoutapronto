#Requires -Version 5.1
<#
.SYNOPSIS
  DeployMaster: staging -> resumo -> producao automatica (GitHub Actions Vultr).

.DESCRIPTION
  Dispara o workflow "Deploy Resolva Jato Vultr" em staging, aguarda E2E,
  mostra informacoes relevantes e promove automaticamente para producao.

.PARAMETER Branch
  Branch remota a publicar. Padrao: branch atual.

.PARAMETER SkipPush
  Nao faz push mesmo se houver commits locais a frente do remoto.

.PARAMETER SkipCommit
  Nao faz commit automatico da working tree (so avisa e segue com o tip remoto).

.PARAMETER StagingOnly
  Para apos staging (nao promove producao).

.PARAMETER DryRun
  So prepara working tree / push e mostra o tip; nao dispara workflows.

.EXAMPLE
  .\DeployMaster.bat
  .\DeployMaster.ps1 -Branch feat/growth-nichos-d30
#>
[CmdletBinding()]
param(
  [string]$Branch = '',
  [switch]$SkipPush,
  [switch]$SkipCommit,
  [switch]$StagingOnly,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$WorkflowName = 'Deploy Resolva Jato Vultr'
$ProdUrl = 'https://resolvajato.com.br/'
$StagingUrl = 'https://staging.resolvajato.com.br/'
$RepoRoot = $PSScriptRoot
$script:RepoSlug = $null

# Git porcelain com acentos (Gráfico.csv etc.) precisa de UTF-8 no console,
# senao o DeployMaster tenta git add com path literal tipo Gr\303\241fico.csv.
try {
  [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
  $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
  if ($PSVersionTable.PSVersion.Major -ge 6) {
    $PSDefaultParameterValues['*:Encoding'] = 'utf8'
  }
} catch { }

Set-Location $RepoRoot
try {
  $Host.UI.RawUI.WindowTitle = 'DeployMaster - Resolva Jato'
} catch { }

function Write-Banner {
  Write-Host ''
  Write-Host '============================================================' -ForegroundColor Cyan
  Write-Host '  DeployMaster - Resolva Jato (staging -> producao)' -ForegroundColor Cyan
  Write-Host '============================================================' -ForegroundColor Cyan
  Write-Host ''
}

function Write-Step([string]$Message, [string]$Color = 'White') {
  Write-Host ''
  Write-Host (">> {0}" -f $Message) -ForegroundColor $Color
}

function Show-ProgressBar {
  param(
    [ValidateRange(0, 100)][int]$Percent,
    [string]$Label = ''
  )
  $width = 42
  $filled = [Math]::Max(0, [Math]::Min($width, [Math]::Floor($width * $Percent / 100.0)))
  $empty = $width - $filled
  $bar = ('=' * $filled) + (' ' * $empty)
  $line = '[{0}] {1,3}%  {2}' -f $bar, $Percent, $Label
  if ($line.Length -gt 110) { $line = $line.Substring(0, 107) + '...' }
  Write-Host ("`r{0}" -f $line.PadRight(110)) -NoNewline
  try {
    Write-Progress -Activity 'DeployMaster' -Status $Label -PercentComplete $Percent
  } catch {
    # Hosts sem Write-Progress (alguns terminais) ignoram.
  }
}

function Complete-ProgressLine {
  Write-Host ''
  try { Write-Progress -Activity 'DeployMaster' -Completed } catch { }
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatorio ausente: $Name"
  }
}

function Invoke-Git {
  param(
    [Parameter(Mandatory)][string[]]$GitArgs,
    [switch]$AllowFail
  )
  # git escreve progresso em stderr; com $ErrorActionPreference=Stop isso vira exception.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $output = & git @GitArgs 2>&1
    $code = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prev
  }
  $text = @($output | ForEach-Object { "$_" }) -join "`n"
  if (-not $AllowFail -and $code -ne 0) {
    throw ("git {0} falhou (exit {1}): {2}" -f ($GitArgs -join ' '), $code, $text)
  }
  return [pscustomobject]@{
    ExitCode = $code
    Output   = $text
    Lines    = @($output | ForEach-Object { "$_" })
  }
}

function Test-IgnoredDeployPath {
  param([Parameter(Mandatory)][string]$Path)
  $p = $Path -replace '\\', '/'
  $name = Split-Path -Leaf $p
  if ($name -eq '-w') { return $true }
  if ($p -eq '.env' -or $p -like '.env.*') { return $true }
  if ($p -like 'tmp/*' -or $p -eq 'tmp') { return $true }
  if ($p -like 'node_modules/*' -or $p -eq 'node_modules') { return $true }
  if ($p -like '.next/*' -or $p -eq '.next') { return $true }
  if ($p -like 'test-results/*' -or $p -like 'playwright-report/*') { return $true }
  if ($p -like 'e2e-agent/artifacts/*' -or $p -like 'e2e-agent/.venv/*') { return $true }
  if ($p -like '*.log' -or $p -like '*.pack') { return $true }
  if ($p -like '.git-credentials*') { return $true }
  return $false
}

function ConvertFrom-GitStatusPath {
  param([Parameter(Mandatory)][string]$Raw)
  $path = $Raw.Trim()
  $quoted = $false
  if ($path.Length -ge 2 -and $path[0] -eq [char]0x22 -and $path[$path.Length - 1] -eq [char]0x22) {
    $path = $path.Substring(1, $path.Length - 2)
    $quoted = $true
  }
  # Com core.quotepath=false os acentos ja vem UTF-8; ainda assim decodifica
  # escapes C-style (\303\241) se o Git/quotepath voltar a citar o path.
  if (-not $quoted -and $path -notmatch '\\[0-7]{3}') {
    return $path
  }
  if ($path -notmatch '\\') {
    return $path
  }

  $ms = [System.IO.MemoryStream]::new()
  $i = 0
  $len = $path.Length
  while ($i -lt $len) {
    $ch = $path[$i]
    if ($ch -eq '\' -and ($i + 3) -lt $len) {
      $oct = $path.Substring($i + 1, 3)
      if ($oct -match '^[0-7]{3}$') {
        $ms.WriteByte([Convert]::ToByte($oct, 8))
        $i += 4
        continue
      }
    }
    if ($ch -eq '\' -and ($i + 1) -lt $len) {
      $esc = $path[$i + 1]
      $byte = switch ($esc) {
        '"' { [byte]34 }
        '\' { [byte]92 }
        'n' { [byte]10 }
        't' { [byte]9 }
        'r' { [byte]13 }
        'b' { [byte]8 }
        'f' { [byte]12 }
        'a' { [byte]7 }
        'v' { [byte]11 }
        default { $null }
      }
      if ($null -ne $byte) {
        $ms.WriteByte($byte)
        $i += 2
        continue
      }
    }
    $charBytes = [System.Text.Encoding]::UTF8.GetBytes([string]$ch)
    $ms.Write($charBytes, 0, $charBytes.Length)
    $i++
  }
  return [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
}

function Get-WorkingTreeEntries {
  # quotepath=false evita Gr\303\241fico.csv no porcelain (quebra o git add no Windows).
  $res = Invoke-Git -GitArgs @('-c', 'core.quotepath=false', 'status', '--porcelain', '-uall')
  $entries = @()
  foreach ($line in $res.Lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $xy = $line.Substring(0, 2)
    $rest = $line.Substring(2).Trim()
    if ($rest -match ' -> ') {
      $rest = ($rest -split ' -> ', 2)[1]
    }
    $path = ConvertFrom-GitStatusPath -Raw $rest
    $entries += [pscustomobject]@{
      Xy   = $xy
      Path = $path
      Skip = (Test-IgnoredDeployPath -Path $path)
    }
  }
  return $entries
}

function Sync-WorkingTreeForDeploy {
  param([switch]$NoCommit)

  $entries = @(Get-WorkingTreeEntries)
  if ($entries.Count -eq 0) {
    Write-Step 'Working tree limpa.' 'Green'
    return $false
  }

  $todo = @($entries | Where-Object { -not $_.Skip })

  Write-Step 'Checando working tree...' 'Cyan'
  foreach ($e in $entries) {
    $tag = if ($e.Skip) { 'ignore' } else { 'commit' }
    Write-Host ("  [{0}] {1} {2}" -f $tag, $e.Xy, $e.Path)
  }

  if ($todo.Count -eq 0) {
    Write-Step 'So ha arquivos ignorados (secrets/tmp/lixo). Seguindo sem commit.' 'Yellow'
    return $false
  }

  if ($NoCommit) {
    Write-Step 'SkipCommit ativo: mudancas locais NAO serao commitadas. Deploy usara o tip remoto.' 'Yellow'
    return $false
  }

  Write-Step ("Preparando commit automatico de {0} arquivo(s)..." -f $todo.Count) 'Cyan'
  foreach ($e in $todo) {
    $add = Invoke-Git -GitArgs @('add', '--', $e.Path) -AllowFail
    if ($add.ExitCode -ne 0) {
      throw ("Falha ao git add {0}: {1}" -f $e.Path, $add.Output)
    }
  }

  $staged = Invoke-Git -GitArgs @('diff', '--cached', '--name-only')
  if ([string]::IsNullOrWhiteSpace($staged.Output)) {
    Write-Step 'Nada staged apos add. Seguindo.' 'Yellow'
    return $false
  }

  $commit = Invoke-Git -GitArgs @(
    'commit',
    '-m', 'chore: sync working tree before DeployMaster',
    '-m', 'Auto-commit do DeployMaster para publicar o tip no remoto antes do workflow.'
  ) -AllowFail
  if ($commit.ExitCode -ne 0) {
    throw ("git commit falhou: {0}" -f $commit.Output)
  }

  Write-Step 'Commit local criado.' 'Green'
  Write-Host ("  {0}" -f ((Invoke-Git -GitArgs @('log', '-1', '--oneline')).Output))
  return $true
}

function Invoke-GhJson {
  param(
    [Parameter(Mandatory)][string[]]$GhArgs,
    [int]$Retries = 6
  )
  # gh escreve erros em stderr; com $ErrorActionPreference=Stop o 2>&1 vira NativeCommandError
  # e aborta o DeployMaster mesmo em blip transitório de api.github.com.
  $prev = $ErrorActionPreference
  $attempt = 0
  $lastText = ''
  while ($attempt -lt $Retries) {
    $attempt++
    $ErrorActionPreference = 'Continue'
    try {
      $raw = & gh @GhArgs 2>&1
      $code = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $prev
    }
    $lastText = (@($raw | ForEach-Object { "$_" }) -join "`n").Trim()
    if ($code -eq 0) {
      if ([string]::IsNullOrWhiteSpace($lastText) -or $lastText -eq 'null') { return $null }
      return ($lastText | ConvertFrom-Json)
    }
    $transient = $lastText -match '(?i)error connecting to api\.github\.com|connection reset|timeout|TLS handshake|i/o timeout|temporary failure|EOF|502 Bad Gateway|503 Service Unavailable'
    if (-not $transient -or $attempt -ge $Retries) {
      throw ("gh falhou ({0}): {1}" -f ($GhArgs -join ' '), $lastText)
    }
    Start-Sleep -Seconds ([Math]::Min(20, 2 * $attempt))
  }
  throw ("gh falhou ({0}): {1}" -f ($GhArgs -join ' '), $lastText)
}

function Get-LatestRunId {
  param(
    [Parameter(Mandatory)][string]$BranchName,
    [Parameter(Mandatory)][string]$Sha,
    [datetime]$NotBefore
  )
  $deadline = (Get-Date).AddMinutes(3)
  while ((Get-Date) -lt $deadline) {
    $runs = Invoke-GhJson @(
      'run', 'list',
      '--workflow', $WorkflowName,
      '--branch', $BranchName,
      '--limit', '8',
      '--json', 'databaseId,status,conclusion,headSha,createdAt,url,event,displayTitle'
    )
    $match = $runs |
      Where-Object {
        $_.headSha -eq $Sha -and
        ([datetime]$_.createdAt).ToUniversalTime() -ge $NotBefore.ToUniversalTime().AddSeconds(-15)
      } |
      Sort-Object { [datetime]$_.createdAt } -Descending |
      Select-Object -First 1
    if ($match) { return [long]$match.databaseId }
    Start-Sleep -Seconds 3
  }
  throw "Nao encontrei o run do workflow para SHA $Sha na branch $BranchName."
}

function Get-RunSnapshot {
  param([Parameter(Mandatory)][long]$RunId)
  return Invoke-GhJson @(
    'run', 'view', "$RunId",
    '--json', 'status,conclusion,url,headSha,headBranch,displayTitle,createdAt,updatedAt,jobs,event'
  )
}

function Get-JobsProgressHint {
  param($Snapshot)
  if (-not $Snapshot -or -not $Snapshot.jobs) { return 'aguardando jobs...' }
  $jobs = @($Snapshot.jobs)
  $done = @($jobs | Where-Object { $_.status -eq 'completed' }).Count
  $total = [Math]::Max(1, $jobs.Count)
  $current = $jobs | Where-Object { $_.status -eq 'in_progress' } | Select-Object -First 1
  if ($current) {
    return ('{0}/{1} jobs · {2}' -f $done, $total, $current.name)
  }
  if ($Snapshot.status -eq 'completed') {
    return ('{0}/{1} jobs · concluido' -f $done, $total)
  }
  return ('{0}/{1} jobs · {2}' -f $done, $total, $Snapshot.status)
}

function Wait-WorkflowRun {
  param(
    [Parameter(Mandatory)][long]$RunId,
    [Parameter(Mandatory)][int]$ProgressStart,
    [Parameter(Mandatory)][int]$ProgressEnd,
    [Parameter(Mandatory)][string]$PhaseLabel,
    [int]$TimeoutMinutes = 55
  )

  $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
  $span = [Math]::Max(1, $ProgressEnd - $ProgressStart)
  $started = Get-Date

  while ((Get-Date) -lt $deadline) {
    $snap = Get-RunSnapshot -RunId $RunId
    $hint = Get-JobsProgressHint -Snapshot $snap
    $elapsed = ((Get-Date) - $started).TotalSeconds
    # Curva suave ate 92% do intervalo enquanto roda; 100% so no fim.
    $ratio = [Math]::Min(0.92, $elapsed / ($TimeoutMinutes * 60.0 * 0.55))
    if ($snap.status -eq 'completed') { $ratio = 1.0 }
    $pct = [int]($ProgressStart + ($span * $ratio))
    Show-ProgressBar -Percent $pct -Label ("{0}: {1}" -f $PhaseLabel, $hint)

    if ($snap.status -eq 'completed') {
      Complete-ProgressLine
      return $snap
    }
    Start-Sleep -Seconds 5
  }

  Complete-ProgressLine
  throw ("Timeout aguardando run {0} ({1})." -f $RunId, $PhaseLabel)
}

function Test-HttpOk {
  param([Parameter(Mandatory)][string]$Url, [int]$Retries = 8)
  for ($i = 1; $i -le $Retries; $i++) {
    try {
      $resp = Invoke-WebRequest -Uri $Url -Method Head -MaximumRedirection 5 -UseBasicParsing -TimeoutSec 20
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
        return [pscustomobject]@{ Ok = $true; StatusCode = [int]$resp.StatusCode; Error = $null }
      }
    } catch {
      $code = $null
      if ($_.Exception.Response) {
        try { $code = [int]$_.Exception.Response.StatusCode } catch { }
      }
      if ($i -eq $Retries) {
        return [pscustomobject]@{ Ok = $false; StatusCode = $code; Error = $_.Exception.Message }
      }
    }
    Start-Sleep -Seconds 3
  }
  return [pscustomobject]@{ Ok = $false; StatusCode = $null; Error = 'sem resposta' }
}

function Get-CanonicalFromUrl {
  param([Parameter(Mandatory)][string]$Url)
  try {
    $html = (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30).Content
    $m = [regex]::Match($html, 'rel=["'']canonical["''][^>]*href=["'']([^"'']+)["'']|href=["'']([^"'']+)["''][^>]*rel=["'']canonical["'']')
    if ($m.Success) {
      if ($m.Groups[1].Value) { return $m.Groups[1].Value }
      return $m.Groups[2].Value
    }
  } catch { }
  return $null
}

function Show-StagingReport {
  param(
    [Parameter(Mandatory)]$Snap,
    [Parameter(Mandatory)][string]$Sha,
    [Parameter(Mandatory)][string]$BranchName,
    [Parameter(Mandatory)][string]$CommitSubject
  )

  $e2e = $null
  try {
    $statuses = Invoke-GhJson @(
      'api',
      ("repos/{0}/commits/{1}/statuses" -f $script:RepoSlug, $Sha)
    )
    $e2e = @($statuses) |
      Where-Object { $_.context -eq 'e2e/staging' } |
      Sort-Object { [datetime]$_.created_at } -Descending |
      Select-Object -First 1
  } catch {
    $e2e = $null
  }

  $health = Test-HttpOk -Url $StagingUrl
  $jobs = @($Snap.jobs) | ForEach-Object {
    '{0}={1}' -f $_.name, $(if ($_.conclusion) { $_.conclusion } else { $_.status })
  }

  Write-Host ''
  Write-Host '------------------------------------------------------------' -ForegroundColor Green
  Write-Host '  STAGING OK - resumo antes da producao' -ForegroundColor Green
  Write-Host '------------------------------------------------------------' -ForegroundColor Green
  Write-Host ("  Branch     : {0}" -f $BranchName)
  Write-Host ("  SHA        : {0}" -f $Sha)
  Write-Host ("  Commit     : {0}" -f $CommitSubject)
  Write-Host ("  Run        : {0}" -f $Snap.url)
  Write-Host ("  Conclusao  : {0}" -f $Snap.conclusion)
  Write-Host ("  Jobs       : {0}" -f ($jobs -join ' | '))
  if ($e2e) {
    Write-Host ("  E2E status : {0} ({1})" -f $e2e.state, $e2e.created_at)
  } else {
    Write-Host '  E2E status : (nao lido via API; gate do workflow ja passou)'
  }
  Write-Host ("  Staging URL: {0} -> HTTP {1}" -f $StagingUrl, $(if ($health.StatusCode) { $health.StatusCode } else { 'n/d' }))
  Write-Host '------------------------------------------------------------' -ForegroundColor Green
  Write-Host ''
}

# --- main --------------------------------------------------------------------

Write-Banner
Show-ProgressBar -Percent 0 -Label 'preflight'

Assert-Command 'git'
Assert-Command 'gh'

$ghAuth = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Complete-ProgressLine
  throw "gh nao autenticado. Rode: gh auth login"
}

$script:RepoSlug = ((& gh repo view --json nameWithOwner -q .nameWithOwner) | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($script:RepoSlug)) {
  Complete-ProgressLine
  throw 'Nao foi possivel resolver o repositorio via gh repo view.'
}

if (-not $Branch) {
  $Branch = (git branch --show-current).Trim()
}
if ([string]::IsNullOrWhiteSpace($Branch)) {
  Complete-ProgressLine
  throw 'Nao foi possivel detectar a branch atual.'
}

Show-ProgressBar -Percent 3 -Label ("branch {0}" -f $Branch)

Show-ProgressBar -Percent 5 -Label 'checando working tree'
[void](Sync-WorkingTreeForDeploy -NoCommit:$SkipCommit)

Show-ProgressBar -Percent 7 -Label 'sincronizando remoto'
Invoke-Git -GitArgs @('fetch', 'origin', $Branch) | Out-Null

$upstream = "origin/$Branch"
$remoteSha = $null
$remoteCheck = Invoke-Git -GitArgs @('rev-parse', '--verify', $upstream) -AllowFail
if ($remoteCheck.ExitCode -eq 0) {
  $remoteSha = $remoteCheck.Output.Trim()
}

$ahead = 0
$behind = 0
if ($remoteSha) {
  $ahead = [int]((Invoke-Git -GitArgs @('rev-list', '--count', "${upstream}..HEAD")).Output.Trim())
  $behind = [int]((Invoke-Git -GitArgs @('rev-list', '--count', "HEAD..${upstream}")).Output.Trim())
}

if ($behind -gt 0) {
  Write-Step ("Local esta {0} commit(s) atras do remoto." -f $behind) 'Yellow'
  if (-not $SkipPush) {
    Write-Step 'Integrando remoto com rebase antes do push...' 'Cyan'
    $pull = Invoke-Git -GitArgs @('pull', '--rebase', 'origin', $Branch) -AllowFail
    if ($pull.ExitCode -ne 0) {
      Complete-ProgressLine
      throw ("git pull --rebase falhou. Resolva conflitos e rode de novo.`n{0}" -f $pull.Output)
    }
    $ahead = [int]((Invoke-Git -GitArgs @('rev-list', '--count', "${upstream}..HEAD")).Output.Trim())
    $behind = 0
  } else {
    Write-Step 'SkipPush ativo: deployara o tip remoto (commits locais atrasados nao sobem).' 'Yellow'
  }
}

if (($ahead -gt 0 -or -not $remoteSha) -and -not $SkipPush) {
  Write-Step ("Push para origin/{0}..." -f $Branch) 'Cyan'
  Show-ProgressBar -Percent 9 -Label 'git push'
  $push = Invoke-Git -GitArgs @('push', '-u', 'origin', "HEAD:refs/heads/$Branch") -AllowFail
  if ($push.ExitCode -ne 0) {
    Complete-ProgressLine
    throw ("git push falhou:`n{0}" -f $push.Output)
  }
  Invoke-Git -GitArgs @('fetch', 'origin', $Branch) | Out-Null
  $remoteSha = (Invoke-Git -GitArgs @('rev-parse', $upstream)).Output.Trim()
  $ahead = 0
} elseif ($ahead -gt 0 -and $SkipPush) {
  Write-Step 'SkipPush ativo: deployara o tip remoto, nao os commits locais nao enviados.' 'Yellow'
}

if (-not $remoteSha) {
  Complete-ProgressLine
  throw "Branch remota origin/$Branch nao encontrada. Faca push da branch antes."
}

$sha = (Invoke-Git -GitArgs @('rev-parse', $upstream)).Output.Trim()
$subject = (Invoke-Git -GitArgs @('log', '-1', '--format=%s', $sha)).Output.Trim()
$short = $sha.Substring(0, 7)

Show-ProgressBar -Percent 10 -Label ("tip {0}" -f $short)
Write-Step ("Alvo: {0} @ {1} - {2}" -f $Branch, $short, $subject) 'Cyan'

if ($DryRun) {
  Show-ProgressBar -Percent 100 -Label 'dry-run concluido'
  Complete-ProgressLine
  Write-Step 'DryRun: working tree/push ok. Workflows nao foram disparados.' 'Yellow'
  exit 0
}

# --- STAGING -----------------------------------------------------------------
Write-Step 'Disparando deploy de STAGING...' 'Cyan'
$stagingNotBefore = (Get-Date).ToUniversalTime()
& gh workflow run $WorkflowName --ref $Branch -f target=staging
if ($LASTEXITCODE -ne 0) {
  Complete-ProgressLine
  throw 'Falha ao disparar workflow de staging.'
}

Show-ProgressBar -Percent 12 -Label 'localizando run de staging'
$stagingRunId = Get-LatestRunId -BranchName $Branch -Sha $sha -NotBefore $stagingNotBefore
Write-Host ("  Staging run: https://github.com/{0}/actions/runs/{1}" -f $script:RepoSlug, $stagingRunId)

$stagingSnap = Wait-WorkflowRun `
  -RunId $stagingRunId `
  -ProgressStart 15 `
  -ProgressEnd 58 `
  -PhaseLabel 'STAGING' `
  -TimeoutMinutes 55

if ($stagingSnap.conclusion -ne 'success') {
  Show-ProgressBar -Percent 58 -Label 'staging falhou'
  Complete-ProgressLine
  Write-Host ''
  Write-Host ("STAGING FALHOU: {0}" -f $stagingSnap.conclusion) -ForegroundColor Red
  Write-Host ("URL: {0}" -f $stagingSnap.url) -ForegroundColor Red
  Write-Host 'Producao NAO sera disparada.' -ForegroundColor Red
  exit 1
}

Show-ProgressBar -Percent 60 -Label 'montando resumo de staging'
Show-StagingReport -Snap $stagingSnap -Sha $sha -BranchName $Branch -CommitSubject $subject

if ($StagingOnly) {
  Show-ProgressBar -Percent 100 -Label 'staging-only concluido'
  Complete-ProgressLine
  Write-Step 'StagingOnly: encerrando sem producao.' 'Yellow'
  exit 0
}

# --- PRODUCTION --------------------------------------------------------------
Write-Step 'Staging OK. Promovendo automaticamente para PRODUCAO...' 'Cyan'
Show-ProgressBar -Percent 65 -Label 'disparando producao'
$prodNotBefore = (Get-Date).ToUniversalTime()
& gh workflow run $WorkflowName --ref $Branch -f target=production
if ($LASTEXITCODE -ne 0) {
  Complete-ProgressLine
  throw 'Falha ao disparar workflow de producao.'
}

Show-ProgressBar -Percent 68 -Label 'localizando run de producao'
$prodRunId = Get-LatestRunId -BranchName $Branch -Sha $sha -NotBefore $prodNotBefore
Write-Host ("  Producao run: https://github.com/{0}/actions/runs/{1}" -f $script:RepoSlug, $prodRunId)

$prodSnap = Wait-WorkflowRun `
  -RunId $prodRunId `
  -ProgressStart 70 `
  -ProgressEnd 92 `
  -PhaseLabel 'PRODUCAO' `
  -TimeoutMinutes 45

if ($prodSnap.conclusion -ne 'success') {
  Show-ProgressBar -Percent 92 -Label 'producao falhou'
  Complete-ProgressLine
  Write-Host ''
  Write-Host ("PRODUCAO FALHOU: {0}" -f $prodSnap.conclusion) -ForegroundColor Red
  Write-Host ("URL: {0}" -f $prodSnap.url) -ForegroundColor Red
  exit 1
}

# --- VERIFY ------------------------------------------------------------------
Show-ProgressBar -Percent 94 -Label 'verificando producao live'
$prodHealth = Test-HttpOk -Url $ProdUrl
$canon = Get-CanonicalFromUrl -Url ($ProdUrl.TrimEnd('/') + '/gerador-de-curriculo')

Show-ProgressBar -Percent 100 -Label 'concluido'
Complete-ProgressLine

Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host '  DEPLOYMASTER CONCLUIDO' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host ("  Branch       : {0}" -f $Branch)
Write-Host ("  SHA          : {0}" -f $sha)
Write-Host ("  Commit       : {0}" -f $subject)
Write-Host ("  Staging run  : {0}" -f $stagingSnap.url)
Write-Host ("  Producao run : {0}" -f $prodSnap.url)
Write-Host ("  Producao URL : {0} -> HTTP {1}" -f $ProdUrl, $(if ($prodHealth.StatusCode) { $prodHealth.StatusCode } else { 'n/d' }))
if ($canon) {
  Write-Host ("  Canonical CV : {0}" -f $canon)
}
Write-Host '============================================================' -ForegroundColor Green
Write-Host ''

if (-not $prodHealth.Ok) {
  Write-Host 'Aviso: health check de producao nao retornou 2xx/3xx. Confira o tunnel/app.' -ForegroundColor Yellow
  exit 2
}

exit 0
