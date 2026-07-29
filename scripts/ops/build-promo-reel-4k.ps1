$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$assets = Join-Path $root 'docs\divulgacao\assets'
$reelDir = Join-Path $root 'docs\divulgacao\reel'
$workDir = Join-Path $reelDir 'narracao-neural'
$final = Join-Path $reelDir 'resolvajato-reel-4k-premium.mp4'
$tempFinal = Join-Path $reelDir 'resolvajato-reel-4k-premium-rendering.mp4'

$python = 'C:\Users\welle\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$ffmpeg = 'C:\Users\welle\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe'
$ffprobe = 'C:\Users\welle\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffprobe.exe'

New-Item -ItemType Directory -Force -Path $workDir | Out-Null

Write-Host 'Gerando locução neural em português...'
& $python (Join-Path $PSScriptRoot 'generate-neural-narration.py') $workDir
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar a locução neural.' }

$images = @(
  'promo-marca-site-stories.png',
  'promo-orcamento-pix-stories.png',
  'promo-curriculo-stories.png',
  'promo-recibo-stories.png',
  'promo-proposta-stories.png',
  'promo-ferramentas-vivo-stories.png',
  'promo-marca-site-stories.png'
)

$sceneDurations = @()
for ($i = 0; $i -lt 7; $i++) {
  $audioPath = Join-Path $workDir ("neural-{0:00}.mp3" -f ($i + 1))
  $trimmedPath = Join-Path $workDir ("neural-{0:00}-trimmed.wav" -f ($i + 1))
  & $ffmpeg -y -hide_banner -loglevel error -i $audioPath -af 'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB,areverse' -ar 48000 -ac 1 $trimmedPath
  if ($LASTEXITCODE -ne 0) { throw "Falha ao preparar a fala $($i + 1)." }
  $audioDuration = [double](& $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $trimmedPath)
  $sceneDurations += [math]::Round($audioDuration + 0.50, 3)
}

$xfade = 0.42
$transitions = @('fadeblack', 'smoothleft', 'fade', 'slideleft', 'smoothup', 'fadeblack')

$args = @('-y', '-hide_banner', '-loglevel', 'warning')
for ($i = 0; $i -lt $images.Count; $i++) {
  $durationText = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $sceneDurations[$i]))
  $args += @('-loop', '1', '-t', $durationText, '-i', (Join-Path $assets $images[$i]))
}
for ($i = 0; $i -lt 7; $i++) {
  $args += @('-i', (Join-Path $workDir ("neural-{0:00}-trimmed.wav" -f ($i + 1))))
}

$filters = @()
for ($i = 0; $i -lt $images.Count; $i++) {
  $filters += "[$i`:v]split=2[bg$i][fg$i]"
  $filters += "[bg$i]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,gblur=sigma=55,eq=brightness=-0.22:saturation=0.80[bgp$i]"
  $filters += "[fg$i]scale=2040:3060:flags=lanczos,unsharp=5:5:0.35:5:5:0[fgp$i]"
  $filters += "[bgp$i][fgp$i]overlay=(W-w)/2:(H-h)/2,format=yuv420p,setsar=1[s$i]"
}

$previous = '[s0]'
$offset = $sceneDurations[0] - $xfade
for ($i = 1; $i -lt $images.Count; $i++) {
  $out = if ($i -eq $images.Count - 1) { '[video]' } else { "[x$i]" }
  $offsetText = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $offset))
  $filters += "$previous[s$i]xfade=transition=$($transitions[$i - 1]):duration=$xfade`:offset=$offsetText$out"
  $previous = $out
  $offset += $sceneDurations[$i] - $xfade
}

$audioStarts = @(0.18)
for ($i = 1; $i -lt 7; $i++) {
  $nextStart = $audioStarts[$i - 1] + $sceneDurations[$i - 1] - $xfade
  $audioStarts += $nextStart
}

for ($i = 0; $i -lt 7; $i++) {
  $input = 7 + $i
  $delay = [int]([math]::Round($audioStarts[$i] * 1000))
  $filters += "[$input`:a]adelay=$delay|$delay,highpass=f=70,lowpass=f=10000,acompressor=threshold=-20dB:ratio=2:attack=10:release=120,volume=1.0[a$i]"
}
$audioLabels = (0..6 | ForEach-Object { "[a$_]" }) -join ''
$filters += "$audioLabels" + 'amix=inputs=7:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=8[audio]'

$totalDuration = $offset + $xfade
$totalText = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $totalDuration))

$args += @(
  '-filter_complex', ($filters -join ';'),
  '-map', '[video]',
  '-map', '[audio]',
  '-t', $totalText,
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '16',
  '-profile:v', 'high',
  '-level:v', '5.2',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-c:a', 'aac',
  '-b:a', '256k',
  '-ar', '48000',
  '-movflags', '+faststart',
  $tempFinal
)

Write-Host 'Renderizando em 4K vertical...'
& $ffmpeg @args
if ($LASTEXITCODE -ne 0) { throw 'Falha ao renderizar o vídeo 4K.' }
Move-Item -LiteralPath $tempFinal -Destination $final -Force

Write-Host "Vídeo 4K pronto: $final"
