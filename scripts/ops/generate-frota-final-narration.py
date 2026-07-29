import asyncio
import sys
from pathlib import Path

sys.path.insert(
    0,
    r"C:\Users\welle\Documents\Codex\2026-07-27\referenced-chatgpt-conversation-this-is-untrusted-2\work\pydeps",
)
import edge_tts

JOBS = [
    ("frota-01.mp3", "Pare de improvisar no Word!", "+12%", "+20%", "+2Hz"),
    ("frota-02.mp3", "Crie, aprove e receba no Pix.", "+2%", "+10%", "+0Hz"),
    (
        "frota-03a.mp3",
        "Comece agora mesmo, acesse resolvajato.com.br e facilite a sua vida.",
        "+6%",
        "+18%",
        "+1Hz",
    ),
    ("frota-03b.mp3", "Resolva Jato!", "+6%", "+25%", "+2Hz"),
]


async def main() -> None:
    out_dir = Path(
        r"D:\Desenvolvimento\hub-recursos-gratis\docs\divulgacao\reel\narracao-frota-style"
    )
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, text, rate, volume, pitch in JOBS:
        narration = edge_tts.Communicate(
            text=text,
            voice="pt-BR-AntonioNeural",
            rate=rate,
            volume=volume,
            pitch=pitch,
        )
        await narration.save(str(out_dir / name))
        print("ok", name)


if __name__ == "__main__":
    asyncio.run(main())
