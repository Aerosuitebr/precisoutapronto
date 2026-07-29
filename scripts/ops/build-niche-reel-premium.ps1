# Monta 1 reel nicho premium: Ken Burns + xfade + AntonioNeural sync + impact-trailer.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/ops/build-niche-reel-premium.ps1 -Id 01-cabeleireiro

param(
  [Parameter(Mandatory = $true)][string]$Id
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$nicheDir = Join-Path $root "docs\divulgacao\reel\nichos\$Id"
$arts = Join-Path $nicheDir 'arts'
$voiceDir = Join-Path $nicheDir 'voice'
$work = Join-Path $nicheDir 'work'
$final = Join-Path $nicheDir "$Id.mp4"
$trilha = Join-Path $root 'docs\divulgacao\reel\trilha\impact-trailer.wav'
$metaPath = Join-Path $nicheDir 'meta.json'

$ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
$ffprobeCmd = Get-Command ffprobe -ErrorAction SilentlyContinue
$ffmpeg = if ($ffmpegCmd) { $ffmpegCmd.Source } else { $null }
$ffprobe = if ($ffprobeCmd) { $ffprobeCmd.Source } else { $null }
if (-not $ffmpeg) {
  $wingetFf = 'C:\Users\welle\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe'
  if (Test-Path $wingetFf) {
    $ffmpeg = $wingetFf
    $ffprobe = $wingetFf.Replace('ffmpeg.exe', 'ffprobe.exe')
  }
}
if (-not $ffmpeg -or -not (Test-Path $ffmpeg)) { throw 'ffmpeg nao encontrado' }
if (-not $ffprobe -or -not (Test-Path $ffprobe)) { throw 'ffprobe nao encontrado' }

foreach ($need in @(
  (Join-Path $arts 'dor.png'),
  (Join-Path $arts 'solucao.png'),
  (Join-Path $arts 'cta.png'),
  (Join-Path $voiceDir '01.mp3'),
  (Join-Path $voiceDir '02.mp3'),
  (Join-Path $voiceDir '03.mp3'),
  $trilha,
  $metaPath
)) {
  if (-not (Test-Path -LiteralPath $need)) { throw "Falta arquivo: $need" }
}

New-Item -ItemType Directory -Force -Path $work | Out-Null

function Get-Duration([string]$Path) {
  $raw = & $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $Path
  if ($LASTEXITCODE -ne 0) { throw "ffprobe falhou: $Path" }
  return [double]::Parse($raw, [cultureinfo]::InvariantCulture)
}

function Get-SilenceStart([string]$Path) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $log = & $ffmpeg -hide_banner -i $Path -af silencedetect=noise=-40dB:d=0.15 -f null - 2>&1 | Out-String
  $ErrorActionPreference = $prev
  if ($log -match 'silence_start: 0') {
    if ($log -match 'silence_end: ([0-9.]+)') {
      return [double]::Parse($Matches[1], [cultureinfo]::InvariantCulture)
    }
  }
  return 0.0
}

$pad = 0.32
$xfade = 0.18
$voiceFiles = @(
  (Join-Path $voiceDir '01.mp3'),
  (Join-Path $voiceDir '02.mp3'),
  (Join-Path $voiceDir '03.mp3')
)
$images = @(
  (Join-Path $arts 'dor.png'),
  (Join-Path $arts 'solucao.png'),
  (Join-Path $arts 'cta.png')
)

Write-Host "==> Processando voz ($Id)"
$voiceFit = @()
$voiceDur = @()
for ($i = 0; $i -lt 3; $i++) {
  $sil = Get-SilenceStart $voiceFiles[$i]
  if ($sil -gt 0.55) { throw "Silencio inicial excessivo no take $($i+1): ${sil}s" }

  $fit = Join-Path $work ("voice-{0:00}.wav" -f ($i + 1))
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $ffmpeg -y -hide_banner -loglevel error -i $voiceFiles[$i] `
    -af "highpass=f=80,lowpass=f=12000,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=80,loudnorm=I=-16:TP=-1.5:LRA=7" `
    -ar 48000 -ac 2 $fit
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($code -ne 0) { throw "Falha loudnorm take $($i+1)" }
  $d = Get-Duration $fit
  if ($d -lt 0.8 -or $d -gt 6.5) { throw "Duracao de voz fora da faixa take $($i+1): $d" }
  $voiceFit += $fit
  $voiceDur += $d
  Write-Host ("  take {0}: {1:F2}s" -f ($i + 1), $d)
}

$sceneDur = @()
for ($i = 0; $i -lt 3; $i++) {
  $sceneDur += [math]::Round($voiceDur[$i] + $pad, 3)
}

$sceneStart = @(0.0)
$cursor = $sceneDur[0]
for ($i = 1; $i -lt 3; $i++) {
  $cursor = $cursor - $xfade
  $sceneStart += [math]::Round($cursor, 3)
  $cursor = $cursor + $sceneDur[$i]
}
$totalDur = [math]::Round($cursor, 3)
if ($totalDur -lt 11 -or $totalDur -gt 16.5) {
  throw "Duracao total fora do gate 11 a 16.5s: $totalDur"
}

Write-Host ("==> Montagem video ({0:F2}s)" -f $totalDur)

$zoomSpecs = @(
  @{ Z = 'min(zoom+0.0018,1.12)'; X = 'iw/2-(iw/zoom/2)'; Y = 'ih/2-(ih/zoom/2)-10' },
  @{ Z = 'min(zoom+0.0020,1.13)'; X = 'iw/2-(iw/zoom/2)+6'; Y = 'ih/2-(ih/zoom/2)' },
  @{ Z = 'min(zoom+0.0022,1.14)'; X = 'iw/2-(iw/zoom/2)'; Y = 'ih/2-(ih/zoom/2)+4' }
)
$transitions = @('fadeblack', 'smoothright')

$ffArgs = @('-y', '-hide_banner', '-loglevel', 'error')
for ($i = 0; $i -lt 3; $i++) {
  $t = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $sceneDur[$i]))
  $ffArgs += @('-loop', '1', '-t', $t, '-i', $images[$i])
}
foreach ($v in $voiceFit) { $ffArgs += @('-i', $v) }
$ffArgs += @('-i', $trilha)

$filters = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt 3; $i++) {
  $frames = [math]::Ceiling($sceneDur[$i] * 30)
  $z = $zoomSpecs[$i]
  $filters.Add(("[{0}:v]scale=1200:2134:force_original_aspect_ratio=increase,crop=1200:2134,zoompan=z='{1}':x='{2}':y='{3}':d={4}:s=1080x1920:fps=30,eq=contrast=1.07:saturation=1.10:brightness=-0.01:gamma=0.98,vignette=PI/6,unsharp=5:5:0.5:5:5:0.0,format=yuv420p[s{0}]" -f $i, $z.Z, $z.X, $z.Y, $frames))
}

$offset = $sceneDur[0] - $xfade
$prev = '[s0]'
for ($i = 1; $i -lt 3; $i++) {
  $out = if ($i -eq 2) { '[video]' } else { "[x$i]" }
  $tr = $transitions[$i - 1]
  $off = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $offset))
  $filters.Add("${prev}[s${i}]xfade=transition=${tr}:duration=${xfade}:offset=${off}${out}")
  $prev = $out
  $offset += $sceneDur[$i] - $xfade
}

for ($i = 0; $i -lt 3; $i++) {
  $inputIndex = 3 + $i
  $delayMs = [int]([math]::Round($sceneStart[$i] * 1000))
  $filters.Add(("[{0}:a]adelay={1}|{1},volume=1.05[v{2}]" -f $inputIndex, $delayMs, $i))
}
$filters.Add('[v0][v1][v2]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[narration]')

$trilhaIndex = 6
$totalText = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $totalDur))
$fadeOutStart = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', [math]::Max(0, $totalDur - 0.8)))
$filters.Add(("[{0}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.14,atrim=0:{1},afade=t=in:st=0:d=0.4,afade=t=out:st={2}:d=0.8[bed]" -f $trilhaIndex, $totalText, $fadeOutStart))
$filters.Add('[bed][narration]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.96,loudnorm=I=-15:TP=-1.5:LRA=8[audio]')

$ffArgs += @(
  '-filter_complex', ($filters -join ';'),
  '-map', '[video]',
  '-map', '[audio]',
  '-t', $totalText,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '17',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-movflags', '+faststart',
  $final
)

$prev = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
& $ffmpeg @ffArgs
$code = $LASTEXITCODE
$ErrorActionPreference = $prev
if ($code -ne 0) { throw "Falha ao renderizar $Id (exit $code)" }

$outDur = Get-Duration $final
if ($outDur -lt 11 -or $outDur -gt 16.5) { throw "QA duracao final falhou: $outDur" }

$qa = [ordered]@{
  id = $Id
  duration = [math]::Round($outDur, 3)
  sceneStarts = $sceneStart
  voiceDurations = @($voiceDur | ForEach-Object { [math]::Round($_, 3) })
  final = $final
  bytes = (Get-Item $final).Length
}
$qa | ConvertTo-Json | Set-Content (Join-Path $nicheDir 'qa.json') -Encoding utf8
Write-Host ("OK: {0} ({1:F2}s, {2:F2} MB)" -f $final, $outDur, ((Get-Item $final).Length / 1MB))
