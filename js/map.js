var map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
    center: [-122.335167, 47.608013], // starting position [lng, lat]
    zoom: 7 // starting zoom
});

// Data Sources

map.on('load', () => {
    map.addSource('nei_data', {
        'type': 'geojson',
        'data': scl_nei
    }); 

    map.addLayer({
        'id': 'nei_data',
        'type': 'line',
        'source': 'nei_data',
        'layout': {},
    })
})
