#Requires -Version 5.1
<#
.SYNOPSIS
  Publica o Precisou, Tá Pronto no Vultr (mesmo VPS do Aerosuite): código, .env, Docker e tunnel Cloudflare.
#>
param(
  [string]$HostName = "216.238.102.195",
  [string]$User = "root",
  [string]$SshKey = "$env:USERPROFILE\.ssh\aerosuite_ed25519",
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [switch]$SkipEnv,
  [switch]$SkipTunnel,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$sshOpts = @("-i", $SshKey, "-o", "StrictHostKeyChecking=accept-new", "-o", "BatchMode=yes")
$remote = "${User}@${HostName}"

function Invoke-Remote {
  param([Parameter(Mandatory)][string]$Command)
  & ssh @sshOpts $remote $Command
  if ($LASTEXITCODE -ne 0) { throw "SSH falhou: $Command" }
}

function Copy-ToRemote {
  param([Parameter(Mandatory)][string]$Local, [Parameter(Mandatory)][string]$RemotePath)
  & scp @sshOpts $Local "${remote}:${RemotePath}"
  if ($LASTEXITCODE -ne 0) { throw "SCP falhou: $Local -> $RemotePath" }
}

Write-Host "==> Repo: $RepoRoot"
Set-Location $RepoRoot

if (-not (Test-Path $SshKey)) { throw "Chave SSH ausente: $SshKey" }

# --- .env.production ---
$envProdLocal = Join-Path $env:TEMP "precisoutapronto.env.production"
if (-not $SkipEnv) {
  Write-Host "==> Montando .env.production"
  $localEnv = Join-Path $RepoRoot ".env"
  if (-not (Test-Path $localEnv)) { throw ".env local ausente" }

  # Senhas fortes para o servidor (não reutiliza defaults fracos)
  $pgPass = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 28 | ForEach-Object { [char]$_ })
  $evoKey = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 36 | ForEach-Object { [char]$_ })
  $evoDbPass = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })

  $kv = @{}
  Get-Content $localEnv | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $parts = $_.Split('=', 2)
    $k = $parts[0].Trim()
    $v = $parts[1].Trim().Trim('"')
    $kv[$k] = $v
  }

  $lines = @(
    "DOMAIN=precisoutapronto.com.br",
    "NEXT_PUBLIC_APP_URL=https://precisoutapronto.com.br",
    "POSTGRES_USER=precisoutapronto",
    "POSTGRES_PASSWORD=$pgPass",
    "POSTGRES_DB=precisoutapronto",
    "EVOLUTION_API_KEY=$evoKey",
    "EVOLUTION_DB_PASSWORD=$evoDbPass",
    "WHATSAPP_PROVIDER=evolution",
    "WHATSAPP_API_ENABLED=true",
    "WHATSAPP_INSTANCE=precisoutapronto",
    "EVOLUTION_SERVER_URL=http://127.0.0.1:18083",
    "MERCADOPAGO_MODE=production",
    "NEXT_PUBLIC_MERCADOPAGO_MODE=production",
    "MERCADOPAGO_ACCESS_TOKEN=$($kv['MERCADOPAGO_ACCESS_TOKEN'])",
    "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=$($kv['NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY'])",
    "MERCADOPAGO_CLIENT_ID=$($kv['MERCADOPAGO_CLIENT_ID'])",
    "MERCADOPAGO_CLIENT_SECRET=$($kv['MERCADOPAGO_CLIENT_SECRET'])",
    "MERCADOPAGO_WEBHOOK_SECRET=$($kv['MERCADOPAGO_WEBHOOK_SECRET'])",
    "NUPAY_MODE=$($kv['NUPAY_MODE'])",
    "NUPAY_APP_KEY=$($kv['NUPAY_APP_KEY'])",
    "NUPAY_APP_TOKEN=$($kv['NUPAY_APP_TOKEN'])",
    "STRIPE_SECRET_KEY=$($kv['STRIPE_SECRET_KEY'])",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$($kv['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])",
    "STRIPE_PRICE_PREMIUM=$($kv['STRIPE_PRICE_PREMIUM'])",
    "STRIPE_WEBHOOK_SECRET=$($kv['STRIPE_WEBHOOK_SECRET'])",
    "ZOOP_MODE=$($kv['ZOOP_MODE'])",
    "ZOOP_MARKETPLACE_ID=$($kv['ZOOP_MARKETPLACE_ID'])",
    "ZOOP_API_KEY=$($kv['ZOOP_API_KEY'])",
    "ZOOP_SELLER_ID=$($kv['ZOOP_SELLER_ID'])",
    "ZOOP_WEBHOOK_TOKEN=$($kv['ZOOP_WEBHOOK_TOKEN'])",
    "NEXT_PUBLIC_ZOOP_MARKETPLACE_ID=$($kv['NEXT_PUBLIC_ZOOP_MARKETPLACE_ID'])",
    "NEXT_PUBLIC_ZOOP_PUBLISHABLE_KEY=$($kv['NEXT_PUBLIC_ZOOP_PUBLISHABLE_KEY'])",
    "ASAAS_MODE=$($kv['ASAAS_MODE'])",
    "ASAAS_API_KEY=$($kv['ASAAS_API_KEY'])",
    "ASAAS_WEBHOOK_TOKEN=$($kv['ASAAS_WEBHOOK_TOKEN'])",
    "RESEND_API_KEY=$($kv['RESEND_API_KEY'])",
    "RESEND_FROM=$($kv['RESEND_FROM'])",
    "SMTP_HOST=$($kv['SMTP_HOST'])",
    "SMTP_PORT=$($kv['SMTP_PORT'])",
    "SMTP_USER=$($kv['SMTP_USER'])",
    "SMTP_PASS=$($kv['SMTP_PASS'])",
    "SMTP_FROM=$($kv['SMTP_FROM'])",
    "SMTP_SSL=$($kv['SMTP_SSL'])",
    "SMTP_START_TLS=$($kv['SMTP_START_TLS'])",
    "AUTH_SECRET=$($kv['AUTH_SECRET'])",
    "TURNSTILE_SECRET_KEY=$($kv['TURNSTILE_SECRET_KEY'])",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY=$($kv['NEXT_PUBLIC_TURNSTILE_SITE_KEY'])",
    "TWILIO_ACCOUNT_SID=$($kv['TWILIO_ACCOUNT_SID'])",
    "TWILIO_AUTH_TOKEN=$($kv['TWILIO_AUTH_TOKEN'])",
    "TWILIO_FROM_NUMBER=$($kv['TWILIO_FROM_NUMBER'])",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY=$($kv['NEXT_PUBLIC_VAPID_PUBLIC_KEY'])",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID=$($kv['NEXT_PUBLIC_GA_MEASUREMENT_ID'])",
    "NEXT_PUBLIC_CLARITY_PROJECT_ID=$($kv['NEXT_PUBLIC_CLARITY_PROJECT_ID'])",
    "VAPID_PRIVATE_KEY=$($kv['VAPID_PRIVATE_KEY'])",
    "VAPID_SUBJECT=$($kv['VAPID_SUBJECT'])"
  )
  $lines | Set-Content -Path $envProdLocal -Encoding utf8
}

# --- tarball ---
$tarball = Join-Path $env:TEMP "precisoutapronto-repo.tgz"
Write-Host "==> Empacotando codigo"
if (Test-Path $tarball) { Remove-Item $tarball -Force }

# Prefer tar if available (Git Bash / Windows tar)
Push-Location $RepoRoot
& tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=.angular `
  --exclude=.env --exclude=.env.local --exclude=*.pack `
  -czf $tarball .
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "tar falhou" }
Pop-Location

Write-Host "==> Enviando para $remote"
Invoke-Remote "mkdir -p /opt/precisoutapronto /var/precisoutapronto /etc/cloudflared-precisoutapronto"
Copy-ToRemote $tarball "/tmp/precisoutapronto-repo.tgz"
Copy-ToRemote (Join-Path $RepoRoot "scripts\deploy\vultr-deploy-precisoutapronto.sh") "/tmp/vultr-deploy-precisoutapronto.sh"

if (-not $SkipEnv) {
  Copy-ToRemote $envProdLocal "/opt/precisoutapronto/.env.production"
  Invoke-Remote "chmod 600 /opt/precisoutapronto/.env.production"
}

if (-not $SkipTunnel) {
  $credLocal = Join-Path $env:USERPROFILE ".cloudflared\3f99aa58-2811-4cd2-9b0b-a0819ee70242.json"
  $cfgLocal = Join-Path $RepoRoot "scripts\deploy\cloudflared-config.precisoutapronto.yml"
  $installLocal = Join-Path $RepoRoot "scripts\deploy\install-cloudflared-precisoutapronto.sh"
  if (-not (Test-Path $credLocal)) { throw "Credencial tunnel ausente: $credLocal" }
  Copy-ToRemote $credLocal "/etc/cloudflared-precisoutapronto/3f99aa58-2811-4cd2-9b0b-a0819ee70242.json"
  Copy-ToRemote $cfgLocal "/etc/cloudflared-precisoutapronto/config.yml"
  Copy-ToRemote $installLocal "/tmp/install-cloudflared-precisoutapronto.sh"
  Invoke-Remote "chmod +x /tmp/install-cloudflared-precisoutapronto.sh && bash /tmp/install-cloudflared-precisoutapronto.sh"
}

if (-not $SkipBuild) {
  Invoke-Remote "chmod +x /tmp/vultr-deploy-precisoutapronto.sh && INSTALL_DIR=/opt/precisoutapronto TARBALL=/tmp/precisoutapronto-repo.tgz bash /tmp/vultr-deploy-precisoutapronto.sh"
}

Write-Host ""
Write-Host "OK - Precisou, Tá Pronto no Vultr."
Write-Host "  Local:  http://127.0.0.1:3000 (no servidor)"
Write-Host "  Public: https://precisoutapronto.com.br"
Write-Host "  Docs:   aerosuite/scripts/deploy/PRECISOUTAPRONTO-VULTR.md"
