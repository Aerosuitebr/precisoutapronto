#!/usr/bin/env bash
# Instala conector Cloudflare Tunnel do Precisou, Tá Pronto SEM mexer no cloudflared do Aerosuite.
# Pré-requisito: credentials JSON já em /etc/cloudflared-precisoutapronto/
# Uso: bash install-cloudflared-precisoutapronto.sh

set -euo pipefail

CF_DIR="/etc/cloudflared-precisoutapronto"
TUNNEL_ID="3f99aa58-2811-4cd2-9b0b-a0819ee70242"
CRED="${CF_DIR}/${TUNNEL_ID}.json"
CFG="${CF_DIR}/config.yml"
UNIT="/etc/systemd/system/cloudflared-precisoutapronto.service"

if [[ ! -f "${CRED}" ]]; then
  echo "ERRO: falta ${CRED}"
  exit 1
fi

if [[ ! -f "${CFG}" ]]; then
  echo "ERRO: falta ${CFG}"
  exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  curl -fsSL -o /tmp/cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  dpkg -i /tmp/cloudflared.deb
  rm -f /tmp/cloudflared.deb
fi

chmod 600 "${CRED}" "${CFG}"

cat > "${UNIT}" <<'EOF'
[Unit]
Description=cloudflared Precisou, Tá Pronto
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/cloudflared --no-autoupdate --config /etc/cloudflared-precisoutapronto/config.yml tunnel run
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cloudflared-precisoutapronto
systemctl restart cloudflared-precisoutapronto
sleep 5
systemctl is-active cloudflared-precisoutapronto
# O serviço genérico pode não existir neste host. O conector dedicado acima é
# suficiente e não deve depender da instalação usada por outros projetos.
systemctl is-active cloudflared >/dev/null 2>&1 || true
journalctl -u cloudflared-precisoutapronto -n 15 --no-pager

echo "OK — tunnel Precisou, Tá Pronto ativo (Aerosuite cloudflared intacto)."
echo "Teste: https://precisoutapronto.com.br"
