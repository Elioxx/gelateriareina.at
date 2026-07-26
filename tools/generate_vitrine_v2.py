#!/usr/bin/env python3
"""Generiert randlose Vitrinen-Eisbilder via OpenRouter Image API.
Style: exakt fixierte Draufsicht, Eis fuellt den ganzen Frame, Zutat oben drauf.
Textur pro Sorte: 'swirl' (erhabene Spatel-Welle) oder 'smooth' (glatt).
Referenzbild-Modus: erstes Bild wird als Style-Referenz fuer die restlichen mitgegeben.
"""
import base64
import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

ENV_FILE = Path.home() / ".hermes" / ".env"
OUT_DIR = Path("/home/elioxx/DemoWeb/2026/Reina/assets/images/vitrine-v2-src")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "google/gemini-2.5-flash-image"

def load_key():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("OPENROUTER_API_KEY nicht in ~/.hermes/.env gefunden")

def build_prompt(desc, color, topping):
    surface = ("The gelato surface has a characteristic gentle wavy pattern from a gelato "
               "spatula, with soft ridges running across the whole surface, like gelato in a "
               "real Italian gelateria display case. ")
    return (
        "Top-down flat-lay food photography, camera exactly 90 degrees vertical overhead, "
        "no angle, no tilt. The entire frame is completely filled edge-to-edge with "
        f"freshly churned {desc} gelato, natural {color} color. "
        "No container, no pan, no edges, no border, no background, no sign, no label, no text — "
        "only gelato fills the whole image like a texture. "
        + surface +
        f"Placed on top of the gelato surface, slightly off-center: {topping}. "
        "Soft diffused daylight from above, even lighting, no harsh shadows, no reflections, "
        "no glass, no display case. Photorealistic, high detail, square 1:1 format."
    )

# name: (desc, color, topping)
FLAVORS = {
    "schokolade":    ("dark chocolate", "deep dark brown",
                      "a few dark chocolate curls and a light cocoa dusting"),
    "vanille":       ("vanilla bean", "creamy ivory",
                      "half a vanilla pod and a few loose vanilla seeds"),
    "stracciatella": ("stracciatella milk gelato with fine chocolate shavings mixed in", "off-white",
                      "a small piece of dark chocolate bark"),
    "haselnuss":     ("hazelnut", "warm nut brown",
                      "three whole roasted hazelnuts"),
    "pistazie":      ("pistachio", "muted natural sage green",
                      "a small handful of shelled pistachios"),
    "erdbeere":      ("strawberry sorbet", "soft strawberry red",
                      "one fresh strawberry cut in half"),
    "zitrone":       ("lemon sorbet", "pale yellow",
                      "a thin fresh lemon slice"),
    "mango":         ("mango sorbet", "vivid orange",
                      "two small fresh mango cubes"),
    "himbeere":      ("raspberry sorbet", "deep raspberry red",
                      "three fresh raspberries"),
    "maracuja":      ("passion fruit sorbet", "golden yellow",
                      "half a passion fruit with seeds"),
    "tiramisu":      ("tiramisu mascarpone", "light beige",
                      "a light cocoa powder dusting and one coffee bean"),
    "amaretto":      ("amaretto almond", "pale almond cream",
                      "a few flaked almonds and one amaretti cookie piece"),
    "kokos":         ("coconut", "bright white",
                      "a sprinkle of coconut flakes and a small coconut shell piece"),
    "joghurt":       ("yogurt", "matte white cream",
                      "a small drizzle of honey"),
    "walnuss-honig": ("walnut and honey", "warm caramel beige",
                      "half a walnut and a thin honey drizzle"),
}

def generate(name, key, ref_b64=None, retries=3):
    desc, color, topping = FLAVORS[name]
    prompt = build_prompt(desc, color, topping)
    if ref_b64:
        prompt += (
            "\n\nIMPORTANT: Match the exact same camera angle, lighting, framing and surface "
            "style as the provided reference image — only change the gelato flavor, color and topping."
        )
    content: list[dict] = [{"type": "text", "text": prompt}]
    if ref_b64:
        content.append({"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ref_b64}"}})
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": content}],
        "modalities": ["image", "text"],
    }
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    data = None
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
    if data is None:
        raise RuntimeError("Keine Antwort erhalten")
    msg = data["choices"][0]["message"]
    images = msg.get("images") or []
    if not images:
        raise RuntimeError(f"Keine Bilder in Antwort: {json.dumps(msg)[:400]}")
    raw = base64.b64decode(images[0]["image_url"]["url"].split(",", 1)[1])
    out = OUT_DIR / f"{name}.png"
    out.write_bytes(raw)
    print(f"OK  {name}: {len(raw)/1024:.0f} KB")
    return out

if __name__ == "__main__":
    key = load_key()
    args = sys.argv[1:]
    use_ref = "--with-ref" in args
    names = [a for a in args if not a.startswith("--")] or list(FLAVORS)
    ref_b64 = None
    if use_ref:
        ref_path = OUT_DIR / "pistazie.png"
        if ref_path.exists():
            ref_b64 = base64.b64encode(ref_path.read_bytes()).decode()
            print("Referenz: pistazie.png wird als Style-Vorlage mitgegeben")
        else:
            print("Warnung: keine Referenz gefunden, generiere ohne", file=sys.stderr)
    for name in names:
        print(f"Generiere {name} ...")
        generate(name, key, ref_b64 if name != "pistazie" else None)
        time.sleep(1)
    print("Fertig.")
