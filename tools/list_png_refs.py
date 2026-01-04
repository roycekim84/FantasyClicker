#!/usr/bin/env python3
import re, os, argparse
from pathlib import Path

# 문자열 안의 png 경로 추출 (css url(), js string 등)
PNG_RE = re.compile(r"""(['"(])([^'")\s]+?\.png)(['")])""", re.IGNORECASE)

SCAN_EXTS = {".js",".ts",".jsx",".tsx",".css",".html",".json",".md"}

def norm_path(p: str) -> str:
    p = p.replace("\\", "/")
    return p

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="project root")
    ap.add_argument("--public", default="public", help="public dir")
    ap.add_argument("--only-assets-v1", action="store_true", help="only include paths containing /assets/v1/")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    public_dir = (root / args.public).resolve()

    refs = {}  # path -> set(files)
    for path in root.rglob("*"):
        if path.is_dir():
            continue
        if path.suffix.lower() not in SCAN_EXTS:
            continue
        # 대용량/의미없는 폴더는 스킵
        if any(part in (".git","node_modules",".venv","dist","build") for part in path.parts):
            continue

        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        for m in PNG_RE.finditer(text):
            p = norm_path(m.group(2))
            if args.only_assets_v1 and ("/assets/v1/" not in p):
                continue
            refs.setdefault(p, set()).add(str(path.relative_to(root)))

    # 출력: 필요한 파일 목록 + 존재 여부
    items = sorted(refs.keys())
    print(f"Found {len(items)} png refs\n")
    for p in items:
        exists = False

        # /assets/... 형태면 public 기준으로 존재 여부 체크
        if p.startswith("/"):
            candidate = public_dir / p.lstrip("/")
            exists = candidate.exists()
        else:
            # 상대경로는 "파일 기준"이어서 여기선 존재여부 판단이 애매 → 일단 skip 표시
            # 그래도 public 아래로 들어가는 케이스는 체크
            if p.startswith("assets/"):
                candidate = public_dir / p
                exists = candidate.exists()

        status = "OK" if exists else "MISSING(?)"
        print(f"{status:10} {p}")

    # 어디서 참조하는지도 보고 싶으면 아래 주석 해제
    print("\n--- Used by (top 3 per ref) ---")
    for p in items:
        uses = sorted(list(refs[p]))[:3]
        print(f"{p}  <=  {', '.join(uses)}")

if __name__ == "__main__":
    main()
