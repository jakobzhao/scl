var beforeMap = new maplibregl.Map({
  container: "before",
  style: "data/style.json",
  center: [-122.335167, 47.608013],
  zoom: 12,
});

var afterMap = new maplibregl.Map({
  container: "after",
  style: "data/style.json",
  center: [-122.335167, 47.608013],
  zoom: 12,
});


// A selector or reference to HTML element

//   afterMap.addControl(
//     new maplibregl.NavigationControl({
//         visualizePitch: true,
//         showZoom: true,
//         showCompass: true
//     })
// );

// // afterMap.addControl(
// //     new maplibregl.TerrainControl({
// //         source: 'terrainSource',
// //         exaggeration: 1
// //     })
// // );

// Data Sources
beforeMap.on("load", () => {
  // Add a geojson point source.
  // Heatmap layers also work with a vector tile source.
  beforeMap.addSource("outage_loc", {
    type: "geojson",
    data: "data/outage_byloc.geojson",
  });

  beforeMap.addLayer(
    {
      id: "outage_heatmap",
      type: "heatmap",
      source: "outage_loc",
      maxzoom: 21,
      paint: {
        // Increase the heatmap weight based on frequency and property magnitude
        "heatmap-weight": {
          property: "total_frq",
          type: "exponential",
          stops: [
            [500, 0],
            [750, 1],
          ],
        },
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": {
          stops: [
            [11, 1],
            [15, 3],
          ],
        },
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": {
          stops: [
            [9, 5],
            [12, 40],
            [15, 120],
          ],
        },
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": {
          default: 1,
          stops: [
            [9, 0.9],
            [12, 0.7],
            [15, 0.7],
            [18, 0],
          ],
        },
      },
    },
    "watername_ocean"
  );

  beforeMap.addLayer(
    {
      id: "outage-point",
      type: "circle",
      source: "outage_loc",
      minzoom: 14,
      paint: {
        // Size circle radius by earthquake magnitude and zoom level
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          ["interpolate", ["linear"], ["get", "total_frq"], 1, 1, 6, 4],
          25,
          ["interpolate", ["linear"], ["get", "total_frq"], 1, 5, 6, 10],
        ],
        // Color circle by earthquake magnitude
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "total_frq"],
          0,
          "rgba(33,102,172,0)",
          200,
          "rgb(103,169,207)",
          300,
          "rgb(209,229,240)",
          400,
          "rgb(253,219,199)",
          500,
          "rgb(239,138,98)",
          600,
          "rgb(178,24,43)",
        ],
        "circle-stroke-color": "white",
        "circle-stroke-width": 1,
        "circle-stroke-opacity": 0.3,
        // Transition from heatmap to circle layer by zoom level
        "circle-opacity": {
          stops: [
            [14, 0],
            [15, 1],
          ],
        },
      },
    },
    "watername_ocean"
  );
});


// map containing equity matrix and all other data
afterMap.on("load", () => {

  afterMap.addSource("svi20_data", {
    type: "geojson",
    data: "data/svi20_seattle.geojson",
  });

  afterMap.addSource("public_health_data", {
    type: "geojson",
    data: "data/public_health_data.geojson"
  })

  afterMap.addLayer(
    {
      id: "svi_lines",
      type: "line",
      source: "svi20_data",
      paint: {
        "line-opacity": 0.3,
        "line-color": "darkgrey",
      },
    },
    "watername_ocean"
  );

  plotMap("svi20_data", "svi", [
    [0.3, "rgb(209,229,240)"],
    [0.7, "rgb(200,180,180)"],
    [0.99, "rgb(189,129,140)"],
    [1, "rgb(178,24,43)"],
  ]);

  justiceOptions();
  // Use the querySourceFeatures method to get features
});

afterMap.on('click', 'options_layer', (e) => {
  featureData = e.features[0].properties;
  console.log(featureData);
  document.getElementById('c-track-number').textContent = featureData.GEOID10;
  document.getElementById('svi').textContent = featureData.svi;
  document.getElementById('racial_ethnic').textContent = featureData.racial_ethnic;
  document.getElementById('socioeconomic').textContent = featureData.socioecono;
})

// function
function justiceOptions() {
  let radioButtons = document.getElementsByName("first_item");
  radioButtons.forEach(function(radioButton) {
    radioButton.addEventListener("change", function() {
      var selectedProperty = this.value;
      if(selectedProperty == 1) {
        plotMap("svi20_data", "svi", [
          [0.3, "rgb(209,229,240)"],
          [0.7, "rgb(200,180,180)"],
          [0.99, "rgb(189,129,140)"],
          [1, "rgb(178,24,43)"],
        ]);
      } else if (selectedProperty == 2) {
        plotMap("public_health_data", "sef_rank", [
          [1, "rgb(209,229,240)"],
          [3, "rgb(200,180,180)"],
          [5, "rgb(189,129,140)"],
          [7, "rgb(178,24,43)"],
        ]);
      } else if(selectedProperty == 3) {
        plotMap("svi20_data", "housing_transit", [
          [0.3, "rgb(209,229,240)"],
          [0.7, "rgb(200,180,180)"],
          [0.99, "rgb(189,129,140)"],
          [1, "rgb(178,24,43)"],
        ]);
      } else if(selectedProperty == 4) {
        plotMap("public_health_data", "env_health_disparity_rank", [
          [1, "rgb(209,229,240)"],
          [3, "rgb(200,180,180)"],
          [7, "rgb(189,129,140)"],
          [10, "rgb(178,24,43)"],
        ]);
      }
    })
  })
}

afterMap.on('svi20_data', (e) => {
  if(e.sourceId === "svi20_data" && e.isSourceLoaded){
      const stores = map.querySourceFeatures("svi20_data")
      console.log(stores)
  }
})

function plotMap(source, property, breaks) {
  if (!(source in afterMap.style.sourceCaches)) {
    console.log("Could not find proper source.");
  }
  if(afterMap.getLayer("options_layer")) {
    afterMap.removeLayer("options_layer");
  }

  // Add following layer with indicated source & property
  afterMap.addLayer(
    {
      id: "options_layer",
      type: "fill",
      source: source,
      paint: {
        "fill-color": {
          property: property,
          stops: breaks,
        },
        "fill-opacity": 0.4,
      },
    },
    "watername_ocean"
  );
}