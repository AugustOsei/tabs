#!/usr/bin/env python3
"""Turn the hero's pose grid into the files the site loads.

The grid is GPT Image 2.5 edits of one still (assets/drafts/hero-head/still.webp)
on Higgsfield, each asking for only the head pose to change: rows tilt from
looking up to looking down, columns turn from the viewer's left to right,
saved as assets/drafts/hero-head/grid/ROW_COL.webp. For each image this keys
out the magenta background, locks it to the still body, and matches colour.
The whole upper body (head, neck, collar, shoulders) comes from each pose, so
nothing is stitched at the neck; only the lower chest is the still, feathered
into the box edges. Check a contact sheet of the grid
before building: columns must run from the viewer's left to right.

Writes public/assets/hero-head/: row_N.webp (top row looks up), body.webp (the
still with the box area cleared), still.webp (the full still, for no-JS and
reduced motion) and rig.json, which also records where the eyes are in every
cell so the site can paint blinks.

  python scripts/build-head-rig.py --pitch -1 -0.5 0 0.5 1

Needs numpy, pillow and opencv-python-headless.
"""
from pathlib import Path
import argparse
import json
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STILL = ROOT / "assets/drafts/hero-head/still.webp"
GRID = ROOT / "assets/drafts/hero-head/grid"
# An outpaint of the still with room for his full shoulders. The site shows
# this, with the still and the poses laid exactly over its middle.
WIDE = ROOT / "assets/drafts/hero-head/wide.webp"
WIDE_CROP = (0.13, 0.87, 0.74)  # left, right, bottom, as fractions of the outpaint
OUT = ROOT / "public/assets/hero-head"

SIZE = 1024   # the still is SIZE x SIZE on magenta
PAD = 48      # empty rows above, so a lifted head has room
BOX = (150, 0, 874, PAD + 800)   # stage pixels the canvas repaints per pose
FEATHER = 48  # soft edge where the box meets the still body
CELL_SCALE = 0.75
COLS = 9


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def key(rgb):
    """Magenta key with despill. Returns straight RGB and alpha in 0..1."""
    f = rgb.astype(np.float32)
    magenta = np.minimum(f[..., 0], f[..., 2]) - f[..., 1]
    alpha = 1 - smooth(45, 130, magenta)
    spill = np.clip(magenta, 0, None)
    f[..., 0] -= spill * 0.85
    f[..., 2] -= spill * 0.85
    return np.clip(f, 0, 255), alpha


def to_stage(frame, shape):
    """Resample a video frame into stage pixels."""
    s = frame.shape[1] / SIZE
    m = np.float32([[s, 0, 0], [0, s, -PAD * s]])
    return cv2.warpAffine(frame, m, (shape[1], shape[0]), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 0, 255))


def lock(rgb, reference, mask):
    """Align a frame to the still using the chest and shoulders."""
    a = cv2.cvtColor(reference, cv2.COLOR_RGB2GRAY).astype(np.float32)
    b = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    s = 0.5
    shrink = lambda im: cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    small = np.eye(2, 3, dtype=np.float32)
    try:
        _, small = cv2.findTransformECC(shrink(a), shrink(b), small, cv2.MOTION_AFFINE,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 80, 1e-5),
                                        shrink(mask), 5)
    except cv2.error:
        pass
    warp = small.copy()
    warp[:, 2] /= s
    h, w = reference.shape[:2]
    return cv2.warpAffine(rgb, warp, (w, h), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP,
                          borderMode=cv2.BORDER_REPLICATE)


def eyes(rgb, alpha):
    """Find the two eyes from their whites. Returns [[x, y, rx, ry], ...]."""
    hsv = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2HSV)
    inner = cv2.erode((alpha > 0.9).astype(np.uint8), np.ones((25, 25), np.uint8)).astype(bool)
    white = (hsv[..., 2] > 170) & (hsv[..., 1] < 70) & inner
    white[: PAD + 60] = False
    white[PAD + 420:] = False
    dark = (hsv[..., 2] < 70).astype(np.uint8)
    n, _, stats, _ = cv2.connectedComponentsWithStats(white.astype(np.uint8))
    found = []
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if area < 25 or w > 90 or h > 45:
            continue
        if dark[max(0, y - 6):y + h + 6, max(0, x - 6):x + w + 6].sum() < 12:
            continue
        for e in found:
            if abs((x + w / 2) - e["cx"]) < 55 and abs((y + h / 2) - e["cy"]) < 22:
                e["x0"], e["x1"] = min(e["x0"], x), max(e["x1"], x + w)
                e["y0"], e["y1"] = min(e["y0"], y), max(e["y1"], y + h)
                e["cx"], e["cy"] = (e["x0"] + e["x1"]) / 2, (e["y0"] + e["y1"]) / 2
                e["area"] += area
                break
        else:
            found.append({"x0": x, "x1": x + w, "y0": y, "y1": y + h, "cx": x + w / 2, "cy": y + h / 2,
                          "area": area})
    found = sorted(found, key=lambda e: -e["area"])[:2]
    if len(found) == 2 and (abs(found[0]["cx"] - found[1]["cx"]) < 60 or abs(found[0]["cy"] - found[1]["cy"]) > 45):
        found = found[:1]
    return [[round(e["cx"], 1), round(e["cy"], 1), round(max(14, (e["x1"] - e["x0"]) / 2 + 9), 1),
             round(max(10, (e["y1"] - e["y0"]) / 2 + 7), 1)] for e in sorted(found, key=lambda e: e["cx"])]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pitch", nargs="+", type=float, required=True)
    args = parser.parse_args()

    still_rgb, still_a = key(np.array(Image.open(STILL).convert("RGB").resize((SIZE, SIZE), Image.LANCZOS)))
    h = SIZE + PAD
    rgb0 = np.zeros((h, SIZE, 3), np.float32)
    a0 = np.zeros((h, SIZE), np.float32)
    rgb0[PAD:], a0[PAD:] = still_rgb, still_a
    on_grey = (rgb0 * a0[..., None] + 128 * (1 - a0[..., None])).astype(np.uint8)
    # Align on the chest and shoulders, which never move.
    body_mask = np.zeros((h, SIZE), np.uint8)
    body_mask[PAD + 640:, :] = 255
    body_mask[a0 < 0.9] = 0

    x0, y0, x1, y1 = BOX
    yy, xx = np.mgrid[:h, :SIZE].astype(np.float32)
    # 1 inside the box, easing to 0 across its sides and bottom.
    inside = (smooth(x0, x0 + FEATHER, xx) * (1 - smooth(x1 - FEATHER, x1, xx))
              * (1 - smooth(y1 - FEATHER, y1, yy)))
    inside[(xx < x0) | (xx >= x1) | (yy >= y1)] = 0

    fw, fh = round((x1 - x0) * CELL_SCALE), round((y1 - y0) * CELL_SCALE)
    rows = []
    for r, pitch in enumerate(args.pitch):
        poses = [np.array(Image.open(GRID / f"{r}_{c}.webp").convert("RGB").resize((SIZE, SIZE), Image.LANCZOS))
                 for c in range(COLS)]
        cells = []
        for c in range(COLS):
            rgb, a = key(lock(to_stage(poses[c], (h, SIZE)), on_grey, body_mask))
            # Match colour to the still on the chest so the box edge is invisible.
            zone = (body_mask > 0) & (a > 0.95)
            if zone.sum() > 500:
                gain = rgb0[zone].mean(0) / np.maximum(rgb[zone].mean(0), 1)
                rgb = np.clip(rgb * np.clip(gain, 0.85, 1.15), 0, 255)
            cell = np.dstack([rgb, a * inside * 255])[y0:y1, x0:x1].astype(np.uint8)
            cell = np.array(Image.fromarray(cell).resize((fw, fh), Image.LANCZOS))
            eye_cells = []
            for ex, ey, rx, ry in eyes(rgb, a):
                # Eyelid skin sits between the lash line and the brow.
                lid = rgb[int(ey - ry - 12):int(ey - ry - 4), int(ex - rx * 0.5):int(ex + rx * 0.5)]
                colour = lid.reshape(-1, 3).mean(0) if lid.size else np.array([120, 70, 50])
                # Stage pixels relative to the box, not cell pixels.
                eye_cells.append([round(ex - x0, 1), round(ey - y0, 1), rx, ry,
                                  "#%02x%02x%02x" % tuple(int(v) for v in colour)])
            cells.append({"image": cell, "eyes": eye_cells})
        rows.append(cells)

    # Find the still inside the outpaint, then build the stage around it.
    wide_src = np.array(Image.open(WIDE).convert("RGB"))
    big = cv2.cvtColor(wide_src, cv2.COLOR_RGB2GRAY)
    small = cv2.cvtColor(np.array(Image.open(STILL).convert("RGB")), cv2.COLOR_RGB2GRAY)
    best = (-1.0, 0, (0, 0))
    for w in range(800, min(big.shape) + 1, 4):
        t = cv2.resize(small, (w, w), interpolation=cv2.INTER_AREA)[: int(w * 0.7)]
        if t.shape[0] > big.shape[0] or t.shape[1] > big.shape[1]:
            continue
        _, score, _, loc = cv2.minMaxLoc(cv2.matchTemplate(big, t, cv2.TM_CCOEFF_NORMED))
        if score > best[0]:
            best = (score, w, loc)
    score, w, (mx, my) = best
    k = SIZE / w
    wide = cv2.resize(wide_src, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    cx0, cx1 = round(wide.shape[1] * WIDE_CROP[0]), round(wide.shape[1] * WIDE_CROP[1])
    cy1 = round(wide.shape[0] * WIDE_CROP[2])
    wide_rgb, wide_a = key(wide[:cy1, cx0:cx1])
    lx, ly = round(mx * k) - cx0, round(my * k) - PAD
    print(f"still found in the outpaint at {w}px (match {score:.3f}); stage {wide_rgb.shape[1]}x{cy1}")
    assert ly >= 0 and lx >= 0 and lx + SIZE <= wide_rgb.shape[1], "crop the outpaint wider"

    # Lay the full-resolution still over the outpaint, feathered at its edges.
    sh, sw = wide_rgb.shape[:2]
    local_y, local_x = np.mgrid[:h, :SIZE].astype(np.float32)
    lay = (smooth(0, 64, local_x) * (1 - smooth(SIZE - 64, SIZE, local_x))
           * (1 - smooth(h - 64, h, local_y)))
    lay[:PAD] = 0
    lay[PAD:PAD + 64] = np.maximum(lay[PAD:PAD + 64], smooth(PAD, PAD + 64, local_y[PAD:PAD + 64]))
    stage_rgb, stage_a = wide_rgb.copy(), wide_a.copy()
    region = (slice(ly, ly + h), slice(lx, lx + SIZE))
    keep = lay[: stage_a[region].shape[0]][..., None]
    stage_rgb[region] = stage_rgb[region] * (1 - keep) + rgb0[: keep.shape[0]] * keep
    stage_a[region] = stage_a[region] * (1 - keep[..., 0]) + a0[: keep.shape[0]] * keep[..., 0]
    covered = np.zeros((sh, sw), np.float32)
    covered[region] = inside[: keep.shape[0]]

    OUT.mkdir(parents=True, exist_ok=True)
    still = np.dstack([stage_rgb, stage_a * 255]).astype(np.uint8)
    Image.fromarray(still).save(OUT / "still.webp", quality=90, method=6)
    body = still.copy()
    # Fully opaque wherever a pose fades out over it, so the feather never
    # lets the page show through; cleared only where a pose covers it fully.
    body[..., 3] = (stage_a * (covered < 0.999) * 255).astype(np.uint8)
    Image.fromarray(body).save(OUT / "body.webp", quality=90, method=6)
    rig = {"box": [x0 + lx, y0 + ly, x1 + lx, y1 + ly], "stage": [sw, sh], "frame": [fw, fh], "cols": COLS,
           "center": COLS // 2, "pitch": args.pitch, "rows": []}
    for r, cells in enumerate(rows):
        strip = Image.new("RGBA", (fw * COLS, fh))
        for c, cell in enumerate(cells):
            strip.paste(Image.fromarray(cell["image"]), (c * fw, 0))
        name = f"row_{r}.webp"
        strip.save(OUT / name, quality=86, method=6)
        rig["rows"].append({"src": name, "eyes": [cell["eyes"] for cell in cells]})
    (OUT / "rig.json").write_text(json.dumps(rig, separators=(",", ":")))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
