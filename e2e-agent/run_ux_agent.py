#!/usr/bin/env python3
"""
Browser Use UX agent for Resolva Jato staging.

Runs after the Playwright gate. Writes artifacts/ux-report.json and ux-report.md.
Exit code 0 even on soft failures when E2E_UX_SOFT=1 (CI default).
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / "artifacts"
BASE_URL = os.environ.get("E2E_BASE_URL", "https://staging.resolvajato.com.br").rstrip("/")
SOFT = os.environ.get("E2E_UX_SOFT", "1") == "1"
API_KEY = os.environ.get("E2E_LLM_API_KEY") or os.environ.get("OPENAI_API_KEY")


TASK = f"""
You are a UX QA agent testing Resolva Jato staging.

Open: {BASE_URL}/en/tools/quote-pix

Do this flow:
1. Fill professional name, WhatsApp, email.
2. Fill client name and WhatsApp.
3. Add one quote item named "Website design", qty 1, unit price 1000 (as plain number).
4. Confirm the Quote total becomes about R$1,000 (not R$0).
5. Click "Generate approval link and Pix".
6. Observe whether the UI shows loading, an error alert, a success card, or an account modal.

Then return a short UX evaluation with:
- score: integer 0-10
- pass_flow: true/false (could a user complete price+total+button feedback?)
- findings: list of concrete UX issues (clarity of price field, silent button, locale confusion, etc.)
- steps_taken: brief list of what you did
- recommendation: one sentence

Prefer factual observations over generic praise.
"""


def write_reports(payload: dict) -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    (ARTIFACTS / "ux-report.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    findings = payload.get("findings") or []
    if isinstance(findings, str):
        findings = [findings]
    steps = payload.get("steps_taken") or []
    if isinstance(steps, str):
        steps = [steps]

    md = [
        f"# UX report · Resolva Jato staging",
        "",
        f"- Generated: `{payload.get('generated_at')}`",
        f"- Base URL: `{payload.get('base_url')}`",
        f"- Score: **{payload.get('score', 'n/a')}/10**",
        f"- Flow usable: **{payload.get('pass_flow')}**",
        f"- Agent status: `{payload.get('status')}`",
        "",
        "## Findings",
    ]
    if findings:
        md.extend(f"- {item}" for item in findings)
    else:
        md.append("- (none)")
    md.extend(["", "## Steps", ""])
    if steps:
        md.extend(f"1. {item}" if not str(item).startswith(("1.", "-", "*")) else str(item) for item in steps)
    else:
        md.append("- (none)")
    md.extend(["", "## Recommendation", "", str(payload.get("recommendation") or "(none)"), ""])
    if payload.get("raw_result"):
        md.extend(["", "## Raw agent output", "", "```", str(payload["raw_result"])[:8000], "```", ""])

    (ARTIFACTS / "ux-report.md").write_text("\n".join(md), encoding="utf-8")


def parse_agent_result(text: str) -> dict:
    """Best-effort extraction of structured fields from free-form agent output."""
    score = None
    m = re.search(r"score[\"'\s:=]+(\d{1,2})", text, re.I)
    if m:
        score = max(0, min(10, int(m.group(1))))

    pass_flow = None
    if re.search(r"pass_flow[\"'\s:=]+true", text, re.I) or re.search(r"flow usable[:\s]+yes", text, re.I):
        pass_flow = True
    elif re.search(r"pass_flow[\"'\s:=]+false", text, re.I) or re.search(r"flow usable[:\s]+no", text, re.I):
        pass_flow = False

    findings: list[str] = []
    for line in text.splitlines():
        stripped = line.strip(" -*\t")
        if stripped.lower().startswith("finding") or "issue" in stripped.lower():
            if ":" in stripped:
                findings.append(stripped.split(":", 1)[1].strip() or stripped)
            else:
                findings.append(stripped)

    recommendation = None
    rm = re.search(r"recommendation[:\s]+(.+)", text, re.I)
    if rm:
        recommendation = rm.group(1).strip()

    return {
        "score": score if score is not None else 5,
        "pass_flow": pass_flow if pass_flow is not None else True,
        "findings": findings[:12] or ["Agent returned free-form text; see raw_result."],
        "steps_taken": ["See raw_result for detailed steps."],
        "recommendation": recommendation or "Review raw agent output and Playwright gate results.",
        "raw_result": text,
    }


async def run_browser_use() -> dict:
    if not API_KEY:
        return {
            "status": "skipped",
            "score": None,
            "pass_flow": None,
            "findings": ["E2E_LLM_API_KEY / OPENAI_API_KEY not set; UX agent skipped."],
            "steps_taken": [],
            "recommendation": "Add E2E_LLM_API_KEY secret to enable Browser Use reports.",
            "raw_result": None,
        }

    # Lazy imports so missing deps still produce a skipped report in CI soft mode.
    from browser_use import Agent
    from langchain_openai import ChatOpenAI

    os.environ.setdefault("OPENAI_API_KEY", API_KEY)

    extra_headers = {}
    cf_id = os.environ.get("E2E_CF_ACCESS_CLIENT_ID", "").strip()
    cf_secret = os.environ.get("E2E_CF_ACCESS_CLIENT_SECRET", "").strip()
    if cf_id and cf_secret:
        extra_headers["CF-Access-Client-Id"] = cf_id
        extra_headers["CF-Access-Client-Secret"] = cf_secret

    llm = ChatOpenAI(model=os.environ.get("E2E_LLM_MODEL", "gpt-4o-mini"), temperature=0)
    agent = Agent(task=TASK, llm=llm)
    history = await agent.run()

    raw = ""
    try:
        raw = history.final_result() if hasattr(history, "final_result") else str(history)
    except Exception:
        raw = str(history)

    parsed = parse_agent_result(str(raw or ""))
    parsed["status"] = "ok"
    if extra_headers:
        parsed["cf_access"] = True
    return parsed


async def main() -> int:
    generated_at = datetime.now(timezone.utc).isoformat()
    try:
        result = await run_browser_use()
    except Exception as exc:  # noqa: BLE001 - soft report path
        result = {
            "status": "error",
            "score": 0,
            "pass_flow": False,
            "findings": [f"UX agent crashed: {exc}"],
            "steps_taken": [],
            "recommendation": "Inspect CI logs; Playwright gate remains the deploy blocker.",
            "raw_result": str(exc),
        }

    payload = {
        "generated_at": generated_at,
        "base_url": BASE_URL,
        **result,
    }
    write_reports(payload)

    print(f"[e2e-agent] wrote {ARTIFACTS / 'ux-report.md'} status={payload.get('status')}")

    if SOFT:
        return 0
    if payload.get("status") in {"error", "skipped"}:
        return 1
    if payload.get("pass_flow") is False:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
