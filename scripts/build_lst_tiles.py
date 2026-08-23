#!/usr/bin/env python3
"""Build static XYZ tiles of Landsat land surface temperature for the SCL map.

Source:  Landsat 8/9 Collection 2 Level 2, band ST_B10, cloud-masked via
         QA_PIXEL, .median() composite (region is cloud-prone).
Window:  2024-06-01 .. 2024-09-15 (summer 2024).
Extent:  greater Seattle / Puget Sound, [-123.3, 46.9] .. [-121.4, 48.3].
Ramp:    blue -> red over 50-105 degF (values clamped by .visualize()).
Output:  lst.tif (3-band RGB GeoTIFF), then XYZ tiles:

    gdal2tiles.py -z 8-13 -w none --xyz lst.tif tiles/lst/

--xyz is required: without it gdal2tiles emits TMS row order and the layer
renders vertically flipped in MapLibre.

One-time build (advisor-confirmed); no automation. Do not use live
getMapId URLs in the site: tokens expire in ~1 day and leak the project id.
"""

import io
import zipfile
from pathlib import Path

import ee
import requests

PROJECT = "disasterapp-474118"
BBOX = [-123.3, 46.9, -121.4, 48.3]  # W, S, E, N
DATE_START, DATE_END = "2024-06-01", "2024-09-15"
VIS = {
    "min": 50,
    "max": 105,
    "palette": ["313695", "74add1", "fed976", "feb24c", "fd8d3c", "f03b20", "bd0026"],
}
OUT_TIF = Path(__file__).resolve().parent.parent / "lst.tif"


def mask_clouds(img):
    # QA_PIXEL bits 3 (cloud) and 4 (cloud shadow)
    qa = img.select("QA_PIXEL")
    clear = qa.bitwiseAnd(1 << 3).eq(0).And(qa.bitwiseAnd(1 << 4).eq(0))
    return img.updateMask(clear)


def lst_fahrenheit(img):
    kelvin = img.select("ST_B10").multiply(0.00341802).add(149)
    return kelvin.subtract(273.15).multiply(9 / 5).add(32).rename("lst_f")


def main():
    ee.Initialize(project=PROJECT)
    region = ee.Geometry.Rectangle(BBOX)

    col = (
        ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
        .merge(ee.ImageCollection("LANDSAT/LC09/C02/T1_L2"))
        .filterBounds(region)
        .filterDate(DATE_START, DATE_END)
        .map(mask_clouds)
        .map(lst_fahrenheit)
    )
    n = col.size().getInfo()
    print(f"{n} Landsat scenes in {DATE_START}..{DATE_END}")

    rgb = col.median().visualize(**VIS)

    # ponytail: getDownloadURL (50 MB cap) instead of a batch Export task;
    # 90 m is plenty (ST_B10 is 100 m native) and keeps this synchronous.
    url = rgb.getDownloadURL(
        {"region": region, "scale": 90, "format": "GEO_TIFF", "crs": "EPSG:3857"}
    )
    print("downloading composite ...")
    r = requests.get(url, timeout=600)
    r.raise_for_status()
    body = r.content
    if body[:2] == b"PK":  # some responses arrive zipped
        with zipfile.ZipFile(io.BytesIO(body)) as z:
            body = z.read(z.namelist()[0])
    OUT_TIF.write_bytes(body)
    print(f"wrote {OUT_TIF} ({len(body)/1e6:.1f} MB)")
    print("now run: gdal2tiles.py -z 8-13 -w none --xyz lst.tif tiles/lst/")


if __name__ == "__main__":
    main()
