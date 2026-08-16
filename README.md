# scl


## Libraries

1. Storymap: https://github.com/jakobzhao/geog458/tree/master/weeks/week07

## Satellite imagery layer (right map)

- Source: NASA GIBS, MODIS Terra Corrected Reflectance (True Color), 2026-08-05 — the Aug 2026 WA wildfire smoke event.
- Extent: Pacific Northwest; local raster tiles under `tiles/imagery/{z}/{x}/{y}.jpg` (394 JPEG tiles, 256×256, ~2.4 MB).
- Zoom 4–9 only; the MapLibre source sets `maxzoom: 9` so higher zooms overzoom instead of 404ing.
- Tile scheme is standard XYZ: GIBS serves `{z}/{TileRow}/{TileCol}`, already normalized to `{z}/{x}/{y}` on disk.
- Regenerate: fetch `MODIS_Terra_CorrectedReflectance_TrueColor` for the target date from the GIBS WMTS endpoint (`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/`), zooms 4–9 over the PNW bounding box, saving each tile as `tiles/imagery/{z}/{x}/{y}.jpg` with row→y, col→x.
- Toggled by the "Wildfire smoke" checkbox in the right-hand panel (independent of the equity choropleth radios); slider drives `raster-opacity`.
