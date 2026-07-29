import asyncio
import sys
from pathlib import Path

sys.path.insert(
    0,
    r"C:\Users\welle\Documents\Codex\2026-07-27\referenced-chatgpt-conversation-this-is-untrusted-2\work\pydeps",
)

import edge_tts

LINES = [
    "Pare de improvisar no Word.",
    "Crie, aprove e receba no Pix.",
    "Comece grátis. Resolva Jato.",
]


async def main() -> None:
    output_dir = Path(sys.argv[1])
    output_dir.mkdir(parents=True, exist_ok=True)
    for index, text in enumerate(LINES, start=1):
        output = output_dir / f"frota-{index:02d}.mp3"
        narration = edge_tts.Communicate(
            text=text,
            voice="pt-BR-AntonioNeural",
            rate="-5%",
            volume="+0%",
            pitch="-2Hz",
        )
        await narration.save(str(output))
        print(f"ok {output.name}")


if __name__ == "__main__":
    asyncio.run(main())
