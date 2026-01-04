# tools/slice_sheet_alpha.py
# 사용법:
#   python3 tools/slice_sheet_alpha.py public/assets/v1/sheets/UI_skin_sheet.png public/assets/v1/ui --min-area 500
#   python3 tools/slice_sheet_alpha.py public/assets/v1/sheets/icon_tile_sheet.png public/assets/v1/icons --min-area 200
#   python3 tools/slice_sheet_alpha.py public/assets/v1/sheets/battle_visual_sheet.png public/assets/v1/battle --min-area 500

import os
import sys
import argparse
from PIL import Image
import numpy as np
from scipy import ndimage as ndi

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="input sheet png (RGBA recommended)")
    ap.add_argument("outdir", help="output directory")
    ap.add_argument("--alpha", type=int, default=8, help="alpha threshold (0~255)")
    ap.add_argument("--pad", type=int, default=2, help="padding around each crop")
    ap.add_argument("--min-area", type=int, default=300, help="minimum pixel area to export")
    ap.add_argument("--max-count", type=int, default=0, help="0 = unlimited")
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)

    im = Image.open(args.input).convert("RGBA")
    arr = np.array(im)
    alpha = arr[:, :, 3]

    # 마스크: 알파가 일정 이상인 픽셀만 전경
    mask = alpha >= args.alpha

    # 연결 요소 라벨링
    labeled, n = ndi.label(mask)
    if n == 0:
        print("No components found. Check alpha threshold.")
        return

    # 각 컴포넌트의 bounding box 계산
    slices = ndi.find_objects(labeled)

    exported = 0
    idx = 0
    for i, slc in enumerate(slices, start=1):
        if slc is None:
            continue

        ys, xs = slc
        y0, y1 = ys.start, ys.stop
        x0, x1 = xs.start, xs.stop

        # 면적(픽셀수) 체크
        comp = (labeled[y0:y1, x0:x1] == i)
        area = int(comp.sum())
        if area < args.min_area:
            continue

        # padding 적용 + 경계 클램프
        y0p = max(0, y0 - args.pad)
        y1p = min(arr.shape[0], y1 + args.pad)
        x0p = max(0, x0 - args.pad)
        x1p = min(arr.shape[1], x1 + args.pad)

        crop = im.crop((x0p, y0p, x1p, y1p))

        out = os.path.join(args.outdir, f"sprite_{idx:04d}.png")
        crop.save(out)
        idx += 1
        exported += 1

        if args.max_count and exported >= args.max_count:
            break

    print(f"Done. exported={exported} -> {args.outdir}")

if __name__ == "__main__":
    main()
