var beforeMap = new maplibregl.Map({
    container: "before",
    style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
    center: [-122.335167, 47.608013],
    zoom: 12,
  });

  var afterMap = new maplibregl.Map({
    container: "after",
    style:
      "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
    center: [-122.335167, 47.608013],
    zoom: 12,
  });

  // A selector or reference to HTML element
  var container = "#comparison-container";

  var map = new maplibregl.Compare(beforeMap, afterMap, container, {
    // Set this to enable comparing two maps by mouse movement:
    // mousemove: true
  });


// Data Sources
beforeMap.on('load', () => {
  // Add a geojson point source.
    // Heatmap layers also work with a vector tile source.
  beforeMap.addSource('outage_loc', {
      'type': 'geojson',
      'data': outage_byloc
  });

  beforeMap.addLayer(
      {
          'id': 'outage_heatmap',
          'type': 'heatmap',
          'source': 'outage_loc',
          'maxzoom': 21,
          'paint': {
              // Increase the heatmap weight based on frequency and property magnitude
              'heatmap-weight': {
                'property': 'total_frq',
                'type': 'exponential',
                'stops': [
                  [500,0],
                  [750, 1]
                ]
                },
              // Increase the heatmap color weight weight by zoom level
              // heatmap-intensity is a multiplier on top of heatmap-weight
              'heatmap-intensity': {
                'stops': [
                  [11, 1],
                  [15, 3]
                ]
              },
              // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
              // Begin color ramp at 0-stop with a 0-transparancy color
              // to create a blur-like effect.
              'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(33,102,172,0)',
                  0.2,
                  'rgb(103,169,207)',
                  0.4,
                  'rgb(209,229,240)',
                  0.6,
                  'rgb(253,219,199)',
                  0.8,
                  'rgb(239,138,98)',
                  1,
                  'rgb(178,24,43)'
              ],
              // Adjust the heatmap radius by zoom level
              'heatmap-radius': {
                'stops': [
                [11, 40],
                [15, 100]
                ]
              },
              // Transition from heatmap to circle layer by zoom level
              'heatmap-opacity': {
                'default': 1,
                'stops': [
                [12, 1],
                [20, 0]
                ]
              }
          }
      },
      'waterway'
  );

  beforeMap.addLayer(
      {
          'id': 'outage-point',
          'type': 'circle',
          'source': 'outage_loc',
          'minzoom': 14,
          'paint': {
              // Size circle radius by earthquake magnitude and zoom level
              'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  7,
                  ['interpolate', ['linear'], ['get', 'total_frq'], 1, 1, 6, 4],
                  25,
                  ['interpolate', ['linear'], ['get', 'total_frq'], 1, 5, 6, 10]
              ],
              // Color circle by earthquake magnitude
              'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'total_frq'],
                  0,
                  'rgba(33,102,172,0)',
                  10,
                  'rgb(103,169,207)',
                  20,
                  'rgb(209,229,240)',
                  30,
                  'rgb(253,219,199)',
                  40,
                  'rgb(239,138,98)',
                  50,
                  'rgb(178,24,43)'
              ],
              'circle-stroke-color': 'white',
              'circle-stroke-width': 1,
              // Transition from heatmap to circle layer by zoom level
              'circle-opacity': {
                'stops': [
                [14, 0],
                [15, 1]
                ]
              }
          }
      },
      'waterway'
  );
})


afterMap.on('load', () => {
    afterMap.addSource('svi20_data', {
        'type': 'geojson',
        'data': svi20
    });

    afterMap.addLayer({
      'id': 'svi20_choropleth',
      'type': 'fill',
      'source': 'svi20_data',
      'paint': {
        'fill-color': {
          property: 'svi',
          stops: [
            [0.5, 'rgb(209,229,240)'],
            [1.0, 'rgb(178,24,43)'],
          ]
        },
        'fill-opacity': 0.5
      }
    })

    afterMap.addLayer({
      'id' : 'svi_lines',
      'type': 'line',
      'source': 'svi20_data',
      'paint': {
        'line-opacity': 0.3
      }
    })
})