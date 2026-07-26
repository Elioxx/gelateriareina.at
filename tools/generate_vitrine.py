#!/usr/bin/env python3
"""Generiert Eissorten-Bilder via OpenRouter Image API.
Quelle: ~/.hermes/.env -> OPENROUTER_API_KEY
"""
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

ENV_FILE = Path.home() / ".hermes" / ".env"
OUT_DIR = Path("/home/elioxx/DemoWeb/2026/Reina/assets/images/vitrine-src")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "google/gemini-2.5-flash-image"

def load_key():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("OPENROUTER_API_KEY nicht in ~/.hermes/.env gefunden")

# Prompt-Grundlage: einheitlicher Look fuer alle Sorten.
# Draufsicht auf Carapine (Edelstahl-Napf) mit Gelato, Vitrinen-Setting.
STYLE = (
    "Professional food photography, top-down overhead shot at a slight 20-degree angle: "
    "a stainless steel gelato pan (carapine) filled with smooth, freshly churned {desc} gelato "
    "in an Italian gelateria display case. The gelato has a natural {color} color with visible "
    "creamy texture and characteristic ripples from a gelato spatula. Soft, diffused natural "
    "light, shallow depth of field, clean minimalist composition, the pan fills most of the frame. "
    "No cone, no cup, no scoop, no hands, no text, no logo. Photorealistic."
)

FLAVORS = {
    "schokolade":    ("dark chocolate", "deep dark brown"),
    "vanille":       ("vanilla bean", "creamy ivory with tiny black vanilla specks"),
    "stracciatella": ("stracciatella milk with fine chocolate shavings", "off-white with dark chocolate flakes"),
    "haselnuss":     ("hazelnut", "warm nut brown"),
    "pistazie":      ("pistachio", "muted natural sage green"),
    "erdbeere":      ("strawberry sorbet", "soft pink red"),
    "zitrone":       ("lemon sorbet", "pale yellow"),
    "mango":         ("mango sorbet", "vivid orange"),
    "himbeere":      ("raspberry sorbet", "deep raspberry red"),
    "maracuja":      ("passion fruit sorbet", "golden yellow"),
    "tiramisu":      ("tiramisu mascarpone with cocoa dusting", "beige layered with cocoa brown"),
    "amaretto":      ("amaretto almond", "pale almond cream"),
    "kokos":         ("coconut", "bright white"),
    "joghurt":       ("yogurt", "matte white cream"),
    "walnuss-honig": ("walnut and honey", "warm caramel beige"),
}

def generate(name, desc, color, key, retries=3):
    prompt = STYLE.format(desc=desc, color=color)
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image", "text"],
    }
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = json.load(r)
            break
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")[:400]
            print(f"  HTTP {e.code} (Versuch {attempt}/{retries}): {body}", file=sys.stderr)
            if attempt == retries:
                raise
            time.sleep(5 * attempt)
    else:
        raise RuntimeError("unreachable")

    msg = data["choices"][0]["message"]
    images = msg.get("images") or []
    if not images:
        raise RuntimeError(f"Keine Bilder in Antwort: {json.dumps(msg)[:400]}")
    url = images[0]["image_url"]["url"]
    b64 = url.split(",", 1)[1]
    raw = base64.b64decode(b64)
    out = OUT_DIR / f"{name}.png"
    out.write_bytes(raw)
    print(f"OK  {name}: {len(raw)/1024:.0f} KB -> {out}")

if __name__ == "__main__":
    key = load_key()
    only = sys.argv[1:] or list(FLAVORS)
    for name in only:
        desc, color = FLAVORS[name]
        print(f"Generiere {name} ...")
        generate(name, desc, color, key)
        time.sleep(1)
    print("Fertig.")
