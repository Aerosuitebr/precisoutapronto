$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$assets = Join-Path $root 'docs\divulgacao\assets'
$reelDir = Join-Path $root 'docs\divulgacao\reel'
$workDir = Join-Path $reelDir 'narracao-work'
$final = Join-Path $reelDir 'resolvajato-reel-narrado-cinematico.mp4'

$ffmpeg = 'C:\Users\welle\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe'
$ffprobe = 'C:\Users\welle\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffprobe.exe'

if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "FFmpeg não encontrado: $ffmpeg" }
if (-not (Test-Path -LiteralPath $ffprobe)) { throw "FFprobe não encontrado: $ffprobe" }

New-Item -ItemType Directory -Force -Path $workDir | Out-Null

$scenes = @(
  @{ Image = 'promo-marca-site-stories.png';      Duration = 2.55; Zoom = 'min(zoom+0.0015,1.10)'; X = 'iw/2-(iw/zoom/2)';       Y = 'ih/2-(ih/zoom/2)' },
  @{ Image = 'promo-orcamento-pix-stories.png';   Duration = 2.65; Zoom = 'min(zoom+0.0022,1.13)'; X = 'iw/2-(iw/zoom/2)+8';     Y = 'ih/2-(ih/zoom/2)-6' },
  @{ Image = 'promo-curriculo-stories.png';       Duration = 2.65; Zoom = 'min(zoom+0.0018,1.11)'; X = 'iw/2-(iw/zoom/2)-7';     Y = 'ih/2-(ih/zoom/2)+5' },
  @{ Image = 'promo-recibo-stories.png';          Duration = 2.55; Zoom = 'min(zoom+0.0020,1.12)'; X = 'iw/2-(iw/zoom/2)+6';     Y = 'ih/2-(ih/zoom/2)+4' },
  @{ Image = 'promo-proposta-stories.png';        Duration = 2.65; Zoom = 'min(zoom+0.0017,1.11)'; X = 'iw/2-(iw/zoom/2)-5';     Y = 'ih/2-(ih/zoom/2)-5' },
  @{ Image = 'promo-ferramentas-vivo-stories.png';Duration = 2.95; Zoom = 'min(zoom+0.0015,1.10)'; X = 'iw/2-(iw/zoom/2)+4';     Y = 'ih/2-(ih/zoom/2)' },
  @{ Image = 'promo-marca-site-stories.png';      Duration = 2.10; Zoom = 'min(zoom+0.0024,1.14)'; X = 'iw/2-(iw/zoom/2)';       Y = 'ih/2-(ih/zoom/2)' }
)

$transitions = @('fadeblack', 'zoomin', 'diagbl', 'circleopen', 'radial', 'smoothup')
$xfadeDuration = 0.15

$voiceLines = @(
  @{ Start = 0;     Target = 2.28; Text = 'Resolva Jato. Recursos e ferramentas de verdade.' },
  @{ Start = 2500;  Target = 2.25; Text = 'Cliente aprova no celular. Você recebe no Pix.' },
  @{ Start = 5000;  Target = 2.28; Text = 'Currículo profissional em PDF. Pronto. Sem enrolação.' },
  @{ Start = 7600;  Target = 2.18; Text = 'Recibo limpo, com valor por extenso. Qualidade que passa confiança.' },
  @{ Start = 10000; Target = 2.28; Text = 'Proposta com cara de agência. Pra fechar com quem exige resultado.' },
  @{ Start = 12600; Target = 2.58; Text = 'Tudo no celular. Rápido, bonito, profissional.' },
  @{ Start = 15500; Target = 1.58; Text = 'Comece grátis. Resolva Jato.' }
)

Write-Host 'Gerando takes de narração...'
$voice = New-Object -ComObject SAPI.SpVoice
$voice.Rate = 3
$voice.Volume = 100
$maria = $voice.GetVoices() | Where-Object { $_.GetDescription() -like '*Maria*Portuguese*' } | Select-Object -First 1
if (-not $maria) { throw 'Voz Microsoft Maria (pt-BR) não encontrada.' }
$voice.Voice = $maria

$stream = New-Object -ComObject SAPI.SpFileStream
$format = New-Object -ComObject SAPI.SpAudioFormat
$format.Type = 22
$stream.Format = $format

for ($i = 0; $i -lt $voiceLines.Count; $i++) {
  $raw = Join-Path $workDir ("voice-{0:00}-raw.wav" -f ($i + 1))
  $fit = Join-Path $workDir ("voice-{0:00}.wav" -f ($i + 1))
  $stream.Open($raw, 3, $false)
  $voice.AudioOutputStream = $stream
  [void]$voice.Speak($voiceLines[$i].Text)
  $stream.Close()

  $duration = [double](& $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $raw)
  $tempo = $duration / $voiceLines[$i].Target
  $tempoParts = @()
  while ($tempo -gt 2.0) { $tempoParts += 'atempo=2.0'; $tempo /= 2.0 }
  while ($tempo -lt 0.5) { $tempoParts += 'atempo=0.5'; $tempo /= 0.5 }
  $tempoParts += ('atempo={0:F5}' -f $tempo).Replace(',', '.')
  $audioFilter = ($tempoParts -join ',') + ',highpass=f=80,lowpass=f=12000,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=80,loudnorm=I=-16:TP=-2:LRA=7'
  & $ffmpeg -y -hide_banner -loglevel error -i $raw -af $audioFilter -ar 48000 -ac 2 $fit
  if ($LASTEXITCODE -ne 0) { throw "Falha ao ajustar a fala $($i + 1)." }
}
$voice.AudioOutputStream = $null

Write-Host 'Montando fotografia, movimento e transições cinematográficas...'
$args = @('-y', '-hide_banner', '-loglevel', 'warning')
foreach ($scene in $scenes) {
  $args += @('-loop', '1', '-t', ([string]::Format([cultureinfo]::InvariantCulture, '{0:F2}', $scene.Duration)), '-i', (Join-Path $assets $scene.Image))
}
foreach ($i in 0..($voiceLines.Count - 1)) {
  $args += @('-i', (Join-Path $workDir ("voice-{0:00}.wav" -f ($i + 1))))
}

$filters = @()
for ($i = 0; $i -lt $scenes.Count; $i++) {
  $frames = [math]::Ceiling($scenes[$i].Duration * 30)
  $filters += "[$i`:v]scale=1200:2134:force_original_aspect_ratio=increase,crop=1200:2134,zoompan=z='$($scenes[$i].Zoom)':x='$($scenes[$i].X)':y='$($scenes[$i].Y)':d=${frames}:s=1080x1920:fps=30,eq=contrast=1.08:saturation=1.12:brightness=-0.012:gamma=0.98,vignette=PI/5,unsharp=5:5:0.55:5:5:0.0,format=yuv420p[s$i]"
}

$offset = $scenes[0].Duration - $xfadeDuration
$previous = '[s0]'
for ($i = 1; $i -lt $scenes.Count; $i++) {
  $out = if ($i -eq $scenes.Count - 1) { '[video]' } else { "[x$i]" }
  $transition = $transitions[$i - 1]
  $offsetText = ([string]::Format([cultureinfo]::InvariantCulture, '{0:F3}', $offset))
  $filters += "$previous[s$i]xfade=transition=$transition`:duration=$xfadeDuration`:offset=$offsetText$out"
  $previous = $out
  $offset += $scenes[$i].Duration - $xfadeDuration
}

for ($i = 0; $i -lt $voiceLines.Count; $i++) {
  $inputIndex = $scenes.Count + $i
  $delay = $voiceLines[$i].Start
  $filters += "[$inputIndex`:a]adelay=$delay|$delay,volume=1.0[v$i]"
}
$voiceLabels = (0..($voiceLines.Count - 1) | ForEach-Object { "[v$_]" }) -join ''
$filters += "$voiceLabels" + "amix=inputs=$($voiceLines.Count):duration=longest:normalize=0,alimiter=limit=0.95[narration]"

$impactTimes = @(2.4, 5.0, 7.5, 10.0, 12.5, 15.4)
$impactLabels = @()
for ($i = 0; $i -lt $impactTimes.Count; $i++) {
  $delay = [int]($impactTimes[$i] * 1000)
  $filters += "sine=f=72:d=0.22:r=48000,afade=t=out:st=0:d=0.22,volume=0.18,adelay=$delay|$delay[hit$i]"
  $impactLabels += "[hit$i]"
}
$filters += "sine=f=48:d=17.2:r=48000,volume=0.025[bed]"
$impactMix = ($impactLabels -join '') + '[bed][narration]'
$filters += "$impactMix" + "amix=inputs=$($impactLabels.Count + 2):duration=longest:normalize=0,alimiter=limit=0.95[audio]"

$args += @(
  '-filter_complex', ($filters -join ';'),
  '-map', '[video]',
  '-map', '[audio]',
  '-t', '17.2',
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

& $ffmpeg @args
if ($LASTEXITCODE -ne 0) { throw 'Falha ao renderizar o reel narrado.' }

Write-Host "Vídeo pronto: $final"
