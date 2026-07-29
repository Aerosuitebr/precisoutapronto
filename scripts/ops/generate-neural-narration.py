import asyncio
import sys
from pathlib import Path

sys.path.insert(
    0,
    r"C:\Users\welle\Documents\Codex\2026-07-27\referenced-chatgpt-conversation-this-is-untrusted-2\work\pydeps",
)

import edge_tts


LINES = [
    "Resolva Jato. Recursos e ferramentas de verdade.",
    "Cliente aprova no celular. Você recebe no Pix.",
    "Currículo profissional em PDF. Pronto. Sem enrolação.",
    "Recibo limpo, com valor por extenso. Qualidade que passa confiança.",
    "Proposta com cara de agência. Pra fechar com quem exige resultado.",
    "Tudo no celular. Rápido, bonito, profissional.",
    "Comece grátis. Resolva Jato.",
]


async def main() -> None:
    output_dir = Path(sys.argv[1])
    output_dir.mkdir(parents=True, exist_ok=True)

    for index, text in enumerate(LINES, start=1):
        output = output_dir / f"neural-{index:02d}.mp3"
        narration = edge_tts.Communicate(
            text=text,
            voice="pt-BR-AntonioNeural",
            rate="-8%",
            volume="+0%",
            pitch="-2Hz",
        )
        await narration.save(str(output))


if __name__ == "__main__":
    asyncio.run(main())
