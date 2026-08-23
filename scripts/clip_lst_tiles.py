#!/usr/bin/env python3
"""Clip the LST tile pyramid to Seattle city limits.

build_lst_tiles.py exports a Puget Sound bbox, so the raster covered Everett
to Kent. This zeroes the alpha channel outside the city boundary (union of the
7 council districts) and deletes tiles that end up fully transparent.

    python3 scripts/clip_lst_tiles.py            # clip in place
    python3 scripts/clip_lst_tiles.py --check     # self-check, no writes

One-time post-process, same as the build. Re-run after any rebuild.
"""

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
TILES = ROOT / "tiles" / "lst"
BOUNDARY = ROOT / "data" / "seattle_city_council_districts.geojson"
TILE_PX = 256
SS = 4  # supersample factor; antialiases the city edge


def rings(path):
    """Every (exterior, [holes]) polygon in a GeoJSON of Polygon/MultiPolygon."""
    out = []
    for feat in json.loads(path.read_text())["features"]:
        geom = feat["geometry"]
        polys = (
            [geom["coordinates"]]
            if geom["type"] == "Polygon"
            else geom["coordinates"]
        )
        for poly in polys:
            out.append((poly[0], poly[1:]))
    return out


def to_px(lon, lat, zoom):
    """Web Mercator lon/lat -> global pixel coords at this zoom."""
    n = TILE_PX * 2**zoom
    s = math.sin(math.radians(lat))
    return (
        (lon + 180.0) / 360.0 * n,
        (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n,
    )


def mask_for(zoom, tx, ty, polys):
    """256x256 'L' mask: 255 inside the city, 0 outside. None if fully outside."""
    ox, oy = tx * TILE_PX * SS, ty * TILE_PX * SS
    big = Image.new("L", (TILE_PX * SS, TILE_PX * SS), 0)
    draw = ImageDraw.Draw(big)
    hit = False
    for shell, holes in polys:
        for ring, fill in [(shell, 255)] + [(h, 0) for h in holes]:
            pts = []
            for lon, lat in ring:
                x, y = to_px(lon, lat, zoom)
                pts.append((x * SS - ox, y * SS - oy))
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            # skip rings whose bbox misses this tile entirely
            if max(xs) < 0 or min(xs) > TILE_PX * SS:
                continue
            if max(ys) < 0 or min(ys) > TILE_PX * SS:
                continue
            draw.polygon(pts, fill=fill)
            hit = hit or fill == 255
    if not hit:
        return None
    return big.resize((TILE_PX, TILE_PX), Image.LANCZOS)


def clip(dry_run=False):
    polys = rings(BOUNDARY)
    kept = dropped = 0
    for png in sorted(TILES.glob("*/*/*.png")):
        zoom, tx, ty = int(png.parent.parent.name), int(png.parent.name), int(png.stem)
        mask = mask_for(zoom, tx, ty, polys)
        if mask is None or not mask.getbbox():
            dropped += 1
            if not dry_run:
                png.unlink()
            continue
        kept += 1
        if dry_run:
            continue
        img = Image.open(png).convert("RGBA")
        img.putalpha(ImageChops.darker(img.getchannel("A"), mask))
        img.save(png)
    if not dry_run:
        for d in sorted(TILES.glob("*/*"), reverse=True):
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()
    return kept, dropped


def check():
    polys = rings(BOUNDARY)
    # downtown Seattle at z13 must survive; Bremerton and Everett must not.
    downtown = mask_for(13, *_tile(-122.3321, 47.6062, 13), polys)
    assert downtown is not None and downtown.getbbox(), "downtown tile was dropped"
    for name, lon, lat in [("Bremerton", -122.6270, 47.5673), ("Everett", -122.2021, 47.9790)]:
        m = mask_for(13, *_tile(lon, lat, 13), polys)
        assert m is None or not m.getbbox(), f"{name} tile survived the clip"
    # clipping keeps the smaller of tile alpha and city mask
    a = Image.new("L", (2, 1), 200)
    m = Image.new("L", (2, 1), 100)
    assert ImageChops.darker(a, m).tobytes() == bytes([100, 100]), "clip combine wrong"
    print("checks passed")


def _tile(lon, lat, zoom):
    x, y = to_px(lon, lat, zoom)
    return int(x // TILE_PX), int(y // TILE_PX)


if __name__ == "__main__":
    if "--check" in sys.argv:
        check()
    else:
        kept, dropped = clip()
        print(f"kept {kept} tiles, deleted {dropped} outside Seattle")
