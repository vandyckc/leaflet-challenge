// Wait for the document to be ready
$(document).ready(function() {
    // Initialize the map
    const map = L.map('map').setView([0, 0], 2); // Default view at [0, 0] with zoom level 2
  
    // Add the base layer (you can choose different map providers here)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
    // Function to set the marker size based on the earthquake magnitude
    function getMarkerSize(magnitude) {
      return Math.max(4, magnitude * 4);
    }
  
    // Function to set the marker color based on the earthquake depth
    function getMarkerColor(depth) {
      const colors = ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'];
      if (depth < 10) return colors[0];
      else if (depth < 30) return colors[1];
      else if (depth < 50) return colors[2];
      else if (depth < 70) return colors[3];
      else return colors[4];
    }
  
    // Function to create popups with earthquake information
    function createPopup(feature, layer) {
      const properties = feature.properties;
      const popupContent = `
        <strong>Location:</strong> ${properties.place}<br>
        <strong>Magnitude:</strong> ${properties.mag}<br>
        <strong>Depth:</strong> ${properties.depth} km<br>
        <strong>Date:</strong> ${new Date(properties.time)}
      `;
      layer.bindPopup(popupContent);
    }
  
    // Function to create the circle markers
    function createCircleMarker(feature, latlng) {
      const properties = feature.properties;
      const markerOptions = {
        radius: getMarkerSize(properties.mag),
        fillColor: getMarkerColor(properties.depth),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };
      return L.circleMarker(latlng, markerOptions);
    }
  
    // URL to the earthquake data
    const earthquakeDataURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
  
    // Fetch the earthquake data using jQuery AJAX
    $.getJSON(earthquakeDataURL, function(data) {
      // Create a GeoJSON layer with the earthquake data
      const earthquakesLayer = L.geoJSON(data, {
        pointToLayer: createCircleMarker,
        onEachFeature: createPopup,
      });
  
      // Add the GeoJSON layer to the map
      earthquakesLayer.addTo(map);
  
      // Create a legend
      const legend = L.control({ position: 'bottomright' });
  
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [0, 10, 30, 50, 70];
        const labels = [];
  
        for (let i = 0; i < depths.length; i++) {
          labels.push(
            '<i style="background:' + getMarkerColor(depths[i]) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+ km')
          );
        }
  
        div.innerHTML = labels.join('<br>');
        return div;
      };
  
      // Add the legend to the map
      legend.addTo(map);
    });
  });
  