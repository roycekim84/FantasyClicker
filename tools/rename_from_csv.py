# tools/rename_from_csv.py
from pathlib import Path
import argparse
import csv
import subprocess

def is_git_repo(root: Path) -> bool:
    return (root / ".git").exists()

def git_mv(src: Path, dst: Path):
    subprocess.check_call(["git", "mv", src.as_posix(), dst.as_posix()])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", help="target folder, e.g. public/assets/v1/battle")
    ap.add_argument("csv", help="csv file with old,new columns")
    ap.add_argument("--dry", action="store_true", help="print only")
    args = ap.parse_args()

    folder = Path(args.folder)
    csv_path = Path(args.csv)
    root = Path.cwd()

    use_git = is_git_repo(root)

    # read map
    rows = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            old = (row.get("old") or "").strip()
            new = (row.get("new") or "").strip()
            if not old or not new:
                continue
            rows.append((old, new))

    # precheck
    seen_new = set()
    for old, new in rows:
        src = folder / old
        dst = folder / new

        if not src.exists():
            raise FileNotFoundError(f"Missing source: {src}")
        if dst.exists():
            raise FileExistsError(f"Destination exists: {dst}")
        if new in seen_new:
            raise ValueError(f"Duplicate new name: {new}")
        seen_new.add(new)

    # rename
    for old, new in rows:
        src = folder / old
        dst = folder / new
        print(("DRY " if args.dry else "") + f"{src} -> {dst}")

        if args.dry:
            continue

        if use_git:
            git_mv(src, dst)
        else:
            src.rename(dst)

    print("Done.")

if __name__ == "__main__":
    main()
