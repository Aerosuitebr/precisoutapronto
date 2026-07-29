# Reel 9:16 full-bleed (preenche a tela) + transições agressivas + flash.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/ops/build-promo-reel.ps1

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$assets = Join-Path $root 'docs\divulgacao\assets'
$outDir = Join-Path $root 'docs\divulgacao\reel'
$clips = Join-Path $outDir 'clips'
$final = Join-Path $outDir 'resolvajato-reel-15s.mp4'

New-Item -ItemType Directory -Force -Path $clips | Out-Null

$W = 1080
$H = 1920
$fps = 30
$stillSec = 2.5
$xfade = 0.35

function New-FullBleedStill {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [double]$DurationSec
  )

  # Preenche 9:16 inteiro (crop lateral mínimo). Sem barras pretas.
  $vf = @(
    "scale=${W}:${H}:force_original_aspect_ratio=increase",
    "crop=${W}:${H}",
    "eq=contrast=1.05:saturation=1.08:brightness=0.01",
    "unsharp=5:5:0.6:5:5:0.0",
    "fps=${fps}",
    "format=yuv420p"
  ) -join ','

  & ffmpeg -y -loop 1 -i $InputPath -vf $vf -t $DurationSec -an $OutputPath
  if ($LASTEXITCODE -ne 0) { throw "Falha still: $InputPath" }
}

function New-FlashClip {
  param(
    [string]$OutputPath,
    [double]$DurationSec = 0.08,
    [string]$Color = 'white'
  )
  & ffmpeg -y -f lavfi -i "color=c=${Color}:s=${W}x${H}:d=${DurationSec}:r=${fps}" -pix_fmt yuv420p -an $OutputPath
  if ($LASTEXITCODE -ne 0) { throw "Falha flash: $OutputPath" }
}

Write-Host '==> Stills full-bleed (tela cheia)'
New-FullBleedStill (Join-Path $assets 'promo-marca-site-stories.png') (Join-Path $clips '01-marca.mp4') $stillSec
New-FullBleedStill (Join-Path $assets 'promo-orcamento-pix-stories.png') (Join-Path $clips '02-orcamento.mp4') $stillSec
New-FullBleedStill (Join-Path $assets 'promo-curriculo-stories.png') (Join-Path $clips '03-curriculo.mp4') $stillSec
New-FullBleedStill (Join-Path $assets 'promo-recibo-stories.png') (Join-Path $clips '04-recibo.mp4') $stillSec
New-FullBleedStill (Join-Path $assets 'promo-proposta-stories.png') (Join-Path $clips '05-proposta.mp4') $stillSec
New-FullBleedStill (Join-Path $assets 'promo-ferramentas-vivo-stories.png') (Join-Path $clips '06-ferramentas.mp4') 2.8
New-FullBleedStill (Join-Path $assets 'promo-marca-site-stories.png') (Join-Path $clips '07-cta.mp4') 2.4

Write-Host '==> Flashes de impacto'
New-FlashClip (Join-Path $clips 'flash-white.mp4') 0.07 'white'
New-FlashClip (Join-Path $clips 'flash-gold.mp4') 0.06 '#E8B84A'

# Ordem: cena + flash + cena + flash...
$sequence = @(
  @{ Path = (Join-Path $clips '01-marca.mp4'); Dur = $stillSec },
  @{ Path = (Join-Path $clips 'flash-white.mp4'); Dur = 0.07 },
  @{ Path = (Join-Path $clips '02-orcamento.mp4'); Dur = $stillSec },
  @{ Path = (Join-Path $clips 'flash-gold.mp4'); Dur = 0.06 },
  @{ Path = (Join-Path $clips '03-curriculo.mp4'); Dur = $stillSec },
  @{ Path = (Join-Path $clips 'flash-white.mp4'); Dur = 0.07 },
  @{ Path = (Join-Path $clips '04-recibo.mp4'); Dur = $stillSec },
  @{ Path = (Join-Path $clips 'flash-gold.mp4'); Dur = 0.06 },
  @{ Path = (Join-Path $clips '05-proposta.mp4'); Dur = $stillSec },
  @{ Path = (Join-Path $clips 'flash-white.mp4'); Dur = 0.07 },
  @{ Path = (Join-Path $clips '06-ferramentas.mp4'); Dur = 2.8 },
  @{ Path = (Join-Path $clips 'flash-gold.mp4'); Dur = 0.06 },
  @{ Path = (Join-Path $clips '07-cta.mp4'); Dur = 2.4 }
)

$transitions = @(
  'zoomin', 'pixelize', 'diagbl', 'hlslice', 'circleopen',
  'wipeleft', 'radial', 'hblur', 'vertopen', 'distance',
  'slideup', 'fadegrays'
)

Write-Host '==> Montagem com xfade agressivo + flashes'
$ffArgs = @('-y')
foreach ($item in $sequence) { $ffArgs += @('-i', $item.Path) }

$filterParts = @()
$prev = '[0:v]'
$offset = [math]::Round($sequence[0].Dur - $xfade, 3)
for ($i = 1; $i -lt $sequence.Count; $i++) {
  $isFlash = $sequence[$i].Path -like '*flash*'
  $prevIsFlash = $sequence[$i - 1].Path -like '*flash*'

  # Flash entra/sai rápido; entre artes usa transição forte
  if ($isFlash -or $prevIsFlash) {
    $tr = 'fade'
    $dur = 0.05
  } else {
    $tr = $transitions[($i - 1) % $transitions.Count]
    $dur = $xfade
  }

  $outLabel = if ($i -eq $sequence.Count - 1) { '[vout]' } else { "[v$i]" }
  $right = '[' + $i + ':v]'
  $filterParts += ($prev + $right + "xfade=transition=${tr}:duration=${dur}:offset=${offset}" + $outLabel)
  $prev = $outLabel
  if ($i -lt $sequence.Count - 1) {
    $offset = [math]::Round($offset + $sequence[$i].Dur - $dur, 3)
  }
}

$filter = ($filterParts -join ';')
# Punch final: leve contraste no master
$filter = $filter + ';[vout]eq=contrast=1.04:saturation=1.06[vfinal]'

$ffArgs += @(
  '-filter_complex', $filter,
  '-map', '[vfinal]',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '17',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  $final
)

& ffmpeg @ffArgs
if ($LASTEXITCODE -ne 0) { throw 'Falha na montagem final' }

Write-Host ""
Write-Host "OK full-bleed + efeitos: $final"
