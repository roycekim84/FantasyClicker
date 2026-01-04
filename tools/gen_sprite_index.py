# tools/gen_sprite_index.py
from pathlib import Path
import argparse
import html

TEMPLATE = """<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Sprite Index</title>
<style>
  body{{font-family:system-ui, -apple-system, sans-serif; background:#111; color:#eee;}}
  .grid{{display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:12px; padding:16px;}}
  .card{{background:#1b1b1b; border:1px solid #333; border-radius:10px; padding:10px;}}
  .imgwrap{{height:96px; display:flex; align-items:center; justify-content:center; background:#0c0c0c; border-radius:8px;}}
  img{{max-width:100%; max-height:96px; image-rendering:pixelated;}}
  .name{{margin-top:8px; font-size:12px; word-break:break-all; color:#ddd;}}
</style>
</head>
<body>
<h1 style="padding:16px; margin:0;">{title}</h1>
<div class="grid">
{cards}
</div>
</body>
</html>
"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", help="folder with png files, e.g. public/assets/v1/battle")
    ap.add_argument("--out", default="sprite_index.html")
    args = ap.parse_args()

    folder = Path(args.folder)
    pngs = sorted(folder.glob("*.png"))

    cards = []
    for p in pngs:
        rel = p.as_posix()
        cards.append(
            f"""<div class="card">
<div class="imgwrap"><img src="{html.escape(rel)}" /></div>
<div class="name">{html.escape(p.name)}</div>
</div>"""
        )

    out = folder / args.out
    out.write_text(TEMPLATE.format(title=folder.as_posix(), cards="\n".join(cards)), encoding="utf-8")
    print("Wrote:", out)

if __name__ == "__main__":
    main()
