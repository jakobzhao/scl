# scl


## Libraries

1. Storymap: https://github.com/jakobzhao/geog458/tree/master/weeks/week07

## Surface temperature raster (right map)

- Source: Landsat 8/9 Collection 2 Level 2 `ST_B10`, cloud-masked (QA_PIXEL), median composite over 2024-06-01..2024-09-15, via Google Earth Engine. Converted to °F.
- Continuous raster surface — deliberately contrasts with the tract-level "Afternoon Heat" choropleth in the same Environment Factors group.
- Extent: greater Seattle / Puget Sound (−123.3, 46.9 to −121.4, 48.3); tiles under `tiles/lst/{z}/{x}/{y}.png` (2,882 PNG tiles, 256×256, ~68 MB), zoom 8–13; source `maxzoom: 13` so deeper zooms overzoom instead of 404ing.
- Color ramp: blue→red over 50–105 °F.
- Attribution: Landsat 8/9 courtesy of the U.S. Geological Survey, processed in Google Earth Engine.
- Regenerate: `python scripts/build_lst_tiles.py` (needs `earthengine-api` auth), then `gdal2tiles.py -z 8-13 -w none --xyz lst.tif tiles/lst/` (`--xyz` required — TMS output renders vertically flipped). Static pre-rendered tiles only: live `getMapId` URLs expire in ~a day and leak the EE project id.
