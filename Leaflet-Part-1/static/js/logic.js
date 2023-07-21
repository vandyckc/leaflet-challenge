// Fetch earthquake data
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
  .then(response => response.json())
  .then(data => {
    // Create the map centered on a specific location (e.g., San Francisco, CA)
    const map = L.map("map").setView([37.7749, -122.4194], 6);
    
    // Add the tile layer to the map (using OpenStreetMap as the base map)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // Define function to set marker style based on magnitude and depth
    function getMarkerStyle(magnitude, depth) {
      return {
        radius: magnitude * 5, // Adjust the multiplier to control marker size based on magnitude
        fillColor: getColor(depth),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
    }

    // Define function to get color based on earthquake depth
    function getColor(depth) {
      // You can customize the colors here
      // For example, let's use green to red gradient for the depth
      const minDepth = 0;
      const maxDepth = 90;
      const gradient = (depth - minDepth) / (maxDepth - minDepth);
      const startColor = "#00FF00"; // Green
      const endColor = "#FF0000";   // Red

      // Calculate the color in the gradient based on the depth
      const r = Math.floor(parseInt(startColor.slice(1, 3), 16) + gradient * (parseInt(endColor.slice(1, 3), 16) - parseInt(startColor.slice(1, 3), 16)));
      const g = Math.floor(parseInt(startColor.slice(3, 5), 16) + gradient * (parseInt(endColor.slice(3, 5), 16) - parseInt(startColor.slice(3, 5), 16)));
      const b = Math.floor(parseInt(startColor.slice(5, 7), 16) + gradient * (parseInt(endColor.slice(5, 7), 16) - parseInt(startColor.slice(5, 7), 16)));

      return `rgb(${r}, ${g}, ${b})`;
    }

    // Loop through the features and add markers to the map
    data.features.forEach(feature => {
      const { coordinates } = feature.geometry;
      const [longitude, latitude, depth] = coordinates;
      const { mag, place, time, url, title } = feature.properties;

      const marker = L.circleMarker([latitude, longitude], getMarkerStyle(mag, depth))
        .addTo(map)
        .bindPopup(`<b>${title}</b><br>Magnitude: ${mag}<br>Depth: ${depth} km<br>Place: ${place}<br><a href="${url}" target="_blank">More info</a>`);
    });

    // Create a legend for earthquake depth
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
      const div = L.DomUtil.create("div", "info legend");
      const depths = [0, 50, 70, 90];
      const colors = ["#00FF00", "#FFFF00", "#FFA500", "#FF0000"];

      div.innerHTML += "<h4>Depth</h4>";
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
      }

      return div;
    };

    // Add the legend to the map
    legend.addTo(map);
  });
