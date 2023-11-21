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

// Data Sources
beforeMap.on("load", () => {
  // Add a geojson point source.
  // Heatmap layers also work with a vector tile source.
  beforeMap.addSource("outage_loc", {
    type: "geojson",
    data: "data/outage_by_year.geojson",
  });

  beforeMap.addSource("censusTract", {
    type: "geojson",
    data: "data/c_tract_2020_seattle.geojson",
  });

  beforeMap.addSource("cc_districts", {
    type: "geojson",
    data: "data/seattle_city_council_districts.geojson"
  });

  beforeMap.addSource("neighborhoods_outline", {
    type: "geojson",
    data: "data/SCL_neighborhood_data.geojson"
  });

  beforeMap.addSource("wireless_priority_area", {
    type: "geojson",
    data: "data/WirelessPriorityAreas.geojson"
  })

  beforeMap.addSource("ua_status", {
    type: "geojson",
    data: "data/ug_status.geojson"
  })

  beforeMap.addLayer(
    {
      id: "co_line_layer",
      type: "line",
      source: "censusTract",
      paint: {
        "line-opacity": 0.3,
        "line-color": "black",
      },
    },
    "watername_ocean"
  );

  // Initialize the heatmap layer with the default year
  addHeatmapLayer(2023);

  // Update the heatmap layer when the slider changes
  document.getElementById('yearSlider').addEventListener('input', function () {
      var selectedYear = parseInt(this.value, 10);
      updateHeatmapLayer(selectedYear);
  });

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
          ["interpolate", ["linear"], ["get", "sum"], 1, 1, 6, 4],
          25,
          ["interpolate", ["linear"], ["get", "sum"], 1, 5, 6, 10],
        ],
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "sum"],
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

  // outline of city districts
  outlineOptions();

});


// map containing equity matrix and all other data
afterMap.on("load", () => {

  afterMap.addSource("svi20_data", {
    type: "geojson",
    data: "data/svi_20_seattle_new.geojson",
  });

  afterMap.addLayer(
    {
      id: "svi_lines",
      type: "line",
      source: "svi20_data",
      paint: {
        "line-opacity": 0.3,
        "line-color": "black",
      },
    },
    "watername_ocean"
  );

  // initiate
  let legendLabels = document.querySelectorAll(".legend-row > div");
  let colorScale = chroma.scale('OrRd').colors(4);
  let legendValues = [10, 9, 6, 1];
  plotMap("svi20_data", "env_health_disparity_rank", [
    [1, colorScale[0]],
    [6, colorScale[1]],
    [9, colorScale[2]],
    [10, colorScale[3]],
  ]);
  updateLegendValues(legendValues, legendLabels, colorScale);
  justiceOptions();
});

afterMap.on('click', 'options_layer', (e) => {
  // enable tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

  let featureData = e.features[0].properties;
  document.getElementById('c-tract-name').textContent = featureData['NAMELSAD'];
  document.getElementById('countyName').textContent = featureData['County.Name'];
  document.getElementById('population').textContent = featureData['Total.population'];
  document.getElementById('life-expectancy').textContent = featureData['Life.expectancy..years.'];
  document.getElementById('households').textContent = featureData['Households'];

  // Update progress bar also [need to optimize]
  document.getElementById('a-native-indian').style.width = featureData['Percent.American.Indian...Alaska.Native'] * 100 + '%';
  document.getElementById('a-native-indian').title= "American Indian/Alaska Native:" + featureData['Percent.American.Indian...Alaska.Native'] * 100 + '%';
  document.getElementById('a-asian').style.width = featureData['Percent.Asian'] * 100 + '%';
  document.getElementById('a-asian').title= "Asian: " + featureData['Percent.Asian'] * 100 + '%';
  document.getElementById('a-black').style.width = featureData['Percent.Black.or.African.American.alone'] * 100 + '%';
  document.getElementById('a-black').title= "Black/African American: " + featureData['Percent.Black.or.African.American.alone'] * 100 + '%';
  document.getElementById('a-latino').style.width = featureData['Percent.Hispanic.or.Latino'] * 100 + '%';
  document.getElementById('a-latino').title= "Hispanic or Latino: " + featureData['Percent.Hispanic.or.Latino'] * 100 + '%';
  document.getElementById('a-native-pacific').style.width = featureData['Percent.Native.Hawaiian.or.Pacific'] * 100 + '%';
  document.getElementById('a-native-pacific').title= "Native Hawaiian/Pacific Islander: " + featureData['Percent.Native.Hawaiian.or.Pacific'] * 100 + '%';
  document.getElementById('a-white').style.width = featureData['Percent.White'] * 100 + '%';
  document.getElementById('a-white').title= "White: " + featureData['Percent.White'] * 100 + '%';
  document.getElementById('a-other').style.width = featureData['Percent.other.races'] * 100 + '%';
  document.getElementById('a-other').title= "Other: " + featureData['Percent.other.races'] * 100 + '%';

})

// function
function justiceOptions() {
  let radioButtons = document.getElementsByName("population_category");
  let legendLabels = document.querySelectorAll(".legend-row > div");
  radioButtons.forEach(function(radioButton) {
    radioButton.addEventListener("change", function() {
      let selectedProperty = this.value;
      if(selectedProperty == 1) {
        let colorScale = chroma.scale('OrRd').colors(4);
        plotMap("svi20_data", "env_health_disparity_rank", [
          [1, colorScale[0]],
          [6, colorScale[1]],
          [9, colorScale[2]],
          [10, colorScale[3]],
        ]);
        let legendValues = [10, 9, 6, 1];
        updateLegendValues(legendValues,legendLabels, colorScale);
      } else if (selectedProperty == 2) {
        let colorScale = chroma.scale('PuBu').colors(4);
        let features = afterMap.querySourceFeatures('svi20_data');
        var propertyValues = features.map(function (feature) {
          return feature.properties["Traffic.proximity.and.volume"];
        });
        var breaks = ss.equalIntervalBreaks(propertyValues, 3);
        plotMap("svi20_data", "Traffic.proximity.and.volume", [
          [breaks[0], colorScale[0]],
          [breaks[1],colorScale[1]],
          [breaks[2], colorScale[2]],
          [breaks[3], colorScale[3]],
        ]);

        let legendValues = breaks;
        updateLegendValues(legendValues,legendLabels, colorScale);
      } else if(selectedProperty == 3) {
        let colorScale = chroma.scale('Oranges').colors(4);
        plotMap("svi20_data", "Proximity.to.hazardous.waste.sites", [
          [0.31, colorScale[0]],
          [4.82, colorScale[1]],
          [11.35, colorScale[2]],
          [25.7, colorScale[3]],
        ]);
        let legendValues = [25.7, 11.35, 4.82, 0.31];
        updateLegendValues(legendValues,legendLabels, colorScale);
      } else if(selectedProperty == 4) {
        let colorScale = chroma.scale('Greys').colors(4);
        plotMap("svi20_data", "Expected.population.loss.rate..Natural.Hazards.Risk.Index.", [
          [0.0024, colorScale[0] ],
          [0.0035, colorScale[1] ],
          [0.0048, colorScale[2] ],
          [0.0145, colorScale[3] ],
        ]);
        let legendValues = [0.0145, 0.0048, 0.0035, 0.0024];
        updateLegendValues(legendValues,legendLabels, colorScale);
      } else if(selectedProperty == 5) {
        let colorScale = chroma.scale('Greens').colors(4);
        plotMap("svi20_data", "housing_transit",[
          [0.041, colorScale[0]],
          [0.609, colorScale[1]],
          [1.0, colorScale[2]],
          [1.0, colorScale[3]],
        ])
        let legendValues = [1.0, 1.0, 0.609, 0.041];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 6) {
        let colorScale = chroma.scale('GnBu').colors(4);
        plotMap("svi20_data", "svi",[
          [0.007, colorScale[0]],
          [0.385, colorScale[1]],
          [1.0, colorScale[2]],
          [1.0, colorScale[3]],
        ])
        let legendValues = [1.0, 1.0, 0.385, 0.007];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 7) {
        let colorScale = chroma.scale('BuPu').colors(4);
        plotMap("svi20_data", "sef_rank",[
          [1, colorScale[0]],
          [2, colorScale[1]],
          [6, colorScale[2]],
          [10, colorScale[3]],
        ])
        let legendValues = [10.0, 6.0, 2.0, 1.0];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 8)  {
        let colorScale = chroma.scale('BuGn').colors(4);
        plotMap("svi20_data", "Housing.burden..percent.",[
          [5, colorScale[0]],
          [18, colorScale[1]],
          [26, colorScale[2]],
          [84, colorScale[3]],
        ])
        let legendValues = [84.0, 26.0, 18.0, 5.0];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 9) {
        let colorScale = chroma.scale('Blues').colors(4);
        plotMap("svi20_data", "Linguistic.isolation..percent.",[
          [0, colorScale[0]],
          [1, colorScale[1]],
          [5, colorScale[2]],
          [35, colorScale[3]],
        ])
        let legendValues = [35.0, 5.0, 1.0, 0.0];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 10) {
        let colorScale = chroma.scale('PuRd').colors(4);
        plotMap("svi20_data", "Percent.Black.or.African.American.alone",[
          [0, colorScale[0]],
          [0.013, colorScale[1]],
          [0.08, colorScale[2]],
          [0.4, colorScale[3]],
        ])
        let legendValues = [0.4, 0.08, 0.013, 0.0];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 11) {
        let colorScale = chroma.scale('Purples').colors(4);
        plotMap("svi20_data", "PM2.5.in.the.air",[
          [7.4, colorScale[0]],
          [7.65, colorScale[1]],
          [7.8, colorScale[2]],
          [7.88, colorScale[3]],
        ])
        let legendValues = [7.88, 7.8, 7.65, 7.4];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 12) {
        let colorScale = chroma.scale('YlGn').colors(4);
        plotMap("svi20_data", "Diesel.particulate.matter.exposure",[
          [0.44, colorScale[0]],
          [0.65, colorScale[1]],
          [0.74, colorScale[2]],
          [1.05, colorScale[3]],
        ])
        let legendValues = [1.05, 0.74, 0.65, 0.44];
        updateLegendValues(legendValues, legendLabels, colorScale);
      } else if (selectedProperty == 13) {
        let colorScale = chroma.scale('YlOrBr').colors(4);
        plotMap("svi20_data", "%_disability",[
          [3.8, colorScale[0]],
          [7.1, colorScale[1]],
          [10.7, colorScale[2]],
          [28.1, colorScale[3]],
        ])
        let legendValues = [28.1, 10.7, 7.1, 3.8];
        updateLegendValues(legendValues, legendLabels, colorScale);
      }
    })
  })
}

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
  let features = afterMap.queryRenderedFeatures({ layers: ['options_layer'] });
  var propertyValues = features.map(function (feature) {
    return feature.properties[property];
  });

  let histDiv = document.getElementById("histogram-testing");
  var trace = {
    x: propertyValues,
    type: 'histogram',
    marker: {
      type: 'gradient', // Use the property values as the basis for the color scale
      color: [breaks[0][1],breaks[1][1],breaks[2][1],breaks[3][1]], // Choose a predefined color scale or provide your own array
    },
    nbinsx: 4, // Set the number of bins
  };

  var layout = {
    xaxis: {
      tickfont: { size: 9 }, // Set the font size for tick labels
    },
    yaxis: {
      tickfont: { size: 9 }, // Set the font size for tick labels
    },
    width: 250,
    height: 150,
    margin: { l: 30, r: 10, b: 15, t: 20 },
    plot_bgcolor: 'rgba(0, 0, 0, 0)', // Set the background color of the plot area
    paper_bgcolor: 'rgba(0, 0, 0, 0)', // Set the background color of the entire chart
  };
  var data = [trace];
  Plotly.newPlot(histDiv, data, layout, {displayModeBar: false});
}

function beforeMapPlotLine(source) {
  if (!(source in beforeMap.style.sourceCaches)) {
    console.log("Could not find proper source.");
  }
  if(beforeMap.getLayer("co_line_layer")) {
    beforeMap.removeLayer("co_line_layer");
  }

  beforeMap.addLayer(
    {
      id: "co_line_layer",
      type: "line",
      source: source,
      paint: {
        "line-opacity" : 0.3,
        "line-color": "black"
      }
    }
  );
}

function beforeMapPlotPoint(source) {
  if (!(source in beforeMap.style.sourceCaches)) {
    console.log("Could not find proper source.");
  }
  if(beforeMap.getLayer("co_line_layer")) {
    beforeMap.removeLayer("co_line_layer");
  }

  let statusColorScale = {
    "Completed": "#00ff00",  // Green
    "High Priority": "#ff0000",  // Red
    "Medium Priority": "#ffcc00",  // Yellow
    "Low Priority": "#3399ff"  // Blue
  };

  beforeMap.addLayer(
    {
      id: "co_line_layer",
      type: "circle",
      source: source,
      paint: {
        "circle-radius": 8,
        "circle-color": [
          "match",
          ["get", "Status"],
          "Completed", statusColorScale["Completed"],
          "High", statusColorScale["High Priority"],
          "Medium", statusColorScale["Medium Priority"],
          "N/A", statusColorScale["Low Priority"],
          "#ffffff"  // Default color for unmatched values
        ]
      }
    }
  );
}

function updateLegendValues(rangeArray, legendLabels, colorScale) {
  let length = rangeArray.length;
  legendLabels.forEach((label, index) => {
    let span = label.parentElement.querySelector('span');
    span.style.backgroundColor = colorScale[(length -1) - index];
    let value = rangeArray[index];
    if(index == length -1 || index == 0) {
      label.textContent = value;
    } else {
      let prev = rangeArray[index - 1];
      label.textContent = value + " - " + prev;
    }
  })
}

function outlineOptions() {
  let radioButtons = document.getElementsByName("city_outlines");
  radioButtons.forEach(function(radioButton) {
    radioButton.addEventListener("change", function() {
      let selectedProperty = this.value;
      if(selectedProperty == "cc") {
        beforeMapPlotLine("cc_districts");
      } else if (selectedProperty == "nh") {
        beforeMapPlotLine("neighborhoods_outline");
      } else if (selectedProperty == "ct") {
        beforeMapPlotLine("censusTract");
      } else if (selectedProperty == "wpa") {
        beforeMapPlotLine("wireless_priority_area");
      } else if (selectedProperty == "uas") {
        beforeMapPlotPoint("ua_status");
      }
    });
  })

}

// Synchronize map movements from map1 to map2
afterMap.on('moveend', function () {
  var center1 = afterMap.getCenter();
  var zoom1 = afterMap.getZoom();
  var bearing1 = afterMap.getBearing();
  var pitch1 = afterMap.getPitch();

  beforeMap.jumpTo({
    center: center1,
    zoom: zoom1,
    bearing: bearing1,
    pitch: pitch1,
  });
});

// Synchronize map movements from map2 to map1
beforeMap.on('moveend', function () {
  var center2 = beforeMap.getCenter();
  var zoom2 = beforeMap.getZoom();
  var bearing2 = beforeMap.getBearing();
  var pitch2 = beforeMap.getPitch();

  afterMap.jumpTo({
    center: center2,
    zoom: zoom2,
    bearing: bearing2,
    pitch: pitch2,
  });
}); 

document.getElementById('yearSlider').addEventListener('input', updateYearLabel);
// slider bar change on slide
function updateYearLabel() {
  let yearLabel = document.getElementById('yearLabel');
  let yearSlider = document.getElementById('yearSlider');
  yearLabel.innerHTML = yearSlider.value;
}

// function add heatmap layer
function addHeatmapLayer(year) {
  beforeMap.addLayer(
    {
      id: "outage_heatmap",
      type: "heatmap",
      source: "outage_loc",
      maxzoom: 21,
      paint: {
        // Increase the heatmap weight based on frequency and property magnitude
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', year + '_fq'],
          50, 0,
          100, 1
        ],
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
}

// Function to update the heatmap layer
function updateHeatmapLayer(year) {
  // Remove the existing heatmap layer
  if (beforeMap.getLayer('outage_heatmap')) {
      beforeMap.removeLayer('outage_heatmap');
  }
  // Add the updated heatmap layer
  addHeatmapLayer(year);
}