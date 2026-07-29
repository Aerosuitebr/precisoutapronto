#!/usr/bin/env python3
"""Gera narração AntonioNeural (3 takes) para reels de nicho premium."""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[2]
OUT_ROOT = ROOT / "docs" / "divulgacao" / "reel" / "nichos"

# rate/volume/pitch: dor forte, solução estável, CTA empolgante (padrão Frota final)
NICHES: dict[str, dict] = {
    "01-cabeleireiro": {
        "slug": "cabeleireiro",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#cabeleireiro #mei #orcamento #pix #resolvajato #ferramentasgratis",
        "lines": [
            ("Cliente pediu orçamento no Zap e você mandou áudio?", "+12%", "+20%", "+2Hz"),
            ("Monta o orçamento com valor, serviços e Pix em um link.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Cliente pediu orçamento no Zap\ne você mandou áudio?",
            "Orçamento com valor, serviços\ne Pix em um link.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "02-pedreiro": {
        "slug": "pedreiro",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#pedreiro #obra #orcamento #mei #resolvajato #ferramentasgratis",
        "lines": [
            ("Orçamento de obra no caderno some. No PDF, não.", "+12%", "+20%", "+2Hz"),
            ("Lista materiais, mão de obra e prazo. Envia no WhatsApp.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Orçamento de obra no caderno some.\nNo PDF, não.",
            "Materiais, mão de obra e prazo.\nEnvia no WhatsApp.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "03-personal": {
        "slug": "personal",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#personaltrainer #academia #mei #pix #resolvajato #ferramentasgratis",
        "lines": [
            ("Aluno novo pediu pacote mensal. E agora?", "+12%", "+20%", "+2Hz"),
            ("Gera orçamento de planos e manda com Pix no mesmo fluxo.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Aluno novo pediu pacote mensal.\nE agora?",
            "Orçamento de planos com Pix\nno mesmo fluxo.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "04-manicure": {
        "slug": "manicure",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#manicure #beleza #mei #orcamento #resolvajato #ferramentasgratis",
        "lines": [
            ("Tabela de preços no Instagram não fecha cliente. Orçamento sim.", "+10%", "+20%", "+2Hz"),
            ("Monta o combo com valor e validade. PDF limpo no Zap.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Tabela de preços no Instagram\nnão fecha cliente.",
            "Combo com valor e validade.\nPDF limpo no Zap.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "05-fotografo": {
        "slug": "fotografo",
        "tool": "proposta",
        "cta_url": "resolvajato.com.br/gerador-de-proposta-comercial",
        "tags": "#fotografo #proposta #freelancer #mei #resolvajato #ferramentasgratis",
        "lines": [
            ("Briefing no direct vira proposta profissional em minutos.", "+10%", "+20%", "+2Hz"),
            ("Escopo, pacotes e condições em PDF. Cara de estúdio grande.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Briefing no direct vira\nproposta em minutos.",
            "Escopo, pacotes e condições\nem PDF profissional.",
            "Comece grátis\nresolvajato.com.br/gerador-de-proposta-comercial",
        ],
    },
    "06-eletricista": {
        "slug": "eletricista",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#eletricista #servicos #orcamento #pix #resolvajato #ferramentasgratis",
        "lines": [
            ("Visita técnica sem orçamento escrito é retrabalho.", "+12%", "+20%", "+2Hz"),
            ("Itens, deslocamento e mão de obra. Envia e cobra com Pix.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Visita técnica sem orçamento\nescrito é retrabalho.",
            "Itens, deslocamento e mão de obra.\nEnvia e cobra com Pix.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "07-contador": {
        "slug": "contador",
        "tool": "recibo",
        "cta_url": "resolvajato.com.br/gerador-de-recibo",
        "tags": "#contador #recibo #mei #escritorio #resolvajato #ferramentasgratis",
        "lines": [
            ("Cliente pagou a mensalidade. Cadê o recibo?", "+12%", "+20%", "+2Hz"),
            ("Emite recibo com valor por extenso em PDF, pronto pro Zap.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Cliente pagou a mensalidade.\nCadê o recibo?",
            "Recibo com valor por extenso\nem PDF, pronto pro Zap.",
            "Comece grátis\nresolvajato.com.br/gerador-de-recibo",
        ],
    },
    "08-advogado": {
        "slug": "advogado",
        "tool": "contrato",
        "cta_url": "resolvajato.com.br/gerador-de-contrato",
        "tags": "#advogado #contrato #oab #juridico #resolvajato #ferramentasgratis",
        "lines": [
            ("Honorários no Zap sem contrato? Risco à vista.", "+12%", "+20%", "+2Hz"),
            ("Modelo de contrato editável. PDF para revisar e assinar.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Honorários no Zap sem contrato?\nRisco à vista.",
            "Contrato editável em PDF.\nPara revisar e assinar.",
            "Comece grátis\nresolvajato.com.br/gerador-de-contrato",
        ],
    },
    "09-delivery": {
        "slug": "delivery",
        "tool": "pix",
        "cta_url": "resolvajato.com.br/gerador-de-qr-code-pix",
        "tags": "#delivery #mei #pix #cobranca #resolvajato #ferramentasgratis",
        "lines": [
            ("Pedido saiu. Cobrança ainda no me passa a chave.", "+12%", "+20%", "+2Hz"),
            ("Gera QR e copia e cola Pix em segundos.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Pedido saiu. Cobrança ainda\nno me passa a chave.",
            "QR e copia e cola Pix\nem segundos.",
            "Comece grátis\nresolvajato.com.br/gerador-de-qr-code-pix",
        ],
    },
    "10-aulas": {
        "slug": "aulas",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#aulasparticulares #professor #orcamento #mei #resolvajato #ferramentasgratis",
        "lines": [
            ("Pais perguntam o pacote. Você responde com áudio de três minutos?", "+10%", "+20%", "+2Hz"),
            ("Orçamento de aulas com valor e regras claras em PDF.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Pais perguntam o pacote.\nVocê manda áudio?",
            "Orçamento de aulas com valor\ne regras claras em PDF.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "11-petsitter": {
        "slug": "petsitter",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#petsitter #pet #mei #orcamento #resolvajato #ferramentasgratis",
        "lines": [
            ("Hospedagem de pet no fim de semana. Como precificar?", "+12%", "+20%", "+2Hz"),
            ("Orçamento por diária, passeio e extras. Fecha com Pix.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Hospedagem de pet.\nComo precificar?",
            "Diária, passeio e extras.\nFecha com Pix.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
    "12-dj": {
        "slug": "dj",
        "tool": "orcamento",
        "cta_url": "resolvajato.com.br/orcamento-com-pix",
        "tags": "#dj #eventos #orcamento #mei #resolvajato #ferramentasgratis",
        "lines": [
            ("Festa marcada. Cliente quer proposta ontem.", "+12%", "+20%", "+2Hz"),
            ("Pacote de som, horário e extras em orçamento limpo.", "+2%", "+12%", "+0Hz"),
            ("Comece grátis. Resolva Jato!", "+8%", "+22%", "+2Hz"),
        ],
        "screen": [
            "Festa marcada.\nCliente quer proposta ontem.",
            "Som, horário e extras\nem orçamento limpo.",
            "Comece grátis\nresolvajato.com.br/orcamento-com-pix",
        ],
    },
}


async def synthesize(niche_id: str) -> Path:
    if niche_id not in NICHES:
        raise SystemExit(f"Nicho desconhecido: {niche_id}")
    data = NICHES[niche_id]
    out_dir = OUT_ROOT / niche_id / "voice"
    out_dir.mkdir(parents=True, exist_ok=True)
    files: list[str] = []
    for index, (text, rate, volume, pitch) in enumerate(data["lines"], start=1):
        path = out_dir / f"{index:02d}.mp3"
        await edge_tts.Communicate(
            text=text,
            voice="pt-BR-AntonioNeural",
            rate=rate,
            volume=volume,
            pitch=pitch,
        ).save(str(path))
        files.append(path.name)
        print(f"ok {niche_id}/{path.name}")

    caption = (
        f"{data['lines'][0][0]}\n\n"
        f"{data['lines'][1][0]}\n\n"
        f"https://{data['cta_url']}?utm_source=instagram&utm_medium=organic_social"
        f"&utm_campaign=reel_nicho_{data['slug']}\n\n"
        f"{data['tags']}"
    )
    (OUT_ROOT / niche_id / "legenda.txt").write_text(caption, encoding="utf-8")

    meta = {
        "id": niche_id,
        "slug": data["slug"],
        "tool": data["tool"],
        "cta_url": data["cta_url"],
        "screen": data["screen"],
        "voice": files,
        "lines": [t[0] for t in data["lines"]],
    }
    (OUT_ROOT / niche_id / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return out_dir


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", help="Ex.: 01-cabeleireiro")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    ids = list(NICHES) if args.all else ([args.id] if args.id else [])
    if not ids:
        parser.error("Use --id ou --all")
    for niche_id in ids:
        await synthesize(niche_id)


if __name__ == "__main__":
    asyncio.run(main())
