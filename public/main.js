let issMap,
  issIcon,
  marker,
  firstTime = true,
  pointerCounter = 20;

const pointerRadius = 1;

function initMap() {
  // Create the map and tiles and sets the view to the center
  issMap = L.map('issMap', {
    minZoom: 2,
    maxZoom: 19,
    dragging: false
  }).setView([0, 0], 0);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(issMap);

  // Create a marker with a custom icon
  issIcon = L.icon({
    iconUrl: 'images/space-station.svg',
    iconSize: [80, 64],
    iconAnchor: [40, 32],
    popupAnchor: [-3, -76]
  });

  // add a scale bar on the lower left corner
  L.control.scale().addTo(issMap);
}

// fetch location of the iss
async function fetchISS() {
  const api_url = 'https://api.wheretheiss.at/v1/satellites/25544';
  const response = await fetch(api_url);
  const data = await response.json();
  const { latitude, longitude, velocity, altitude } = data;

  // update data in DOM
  document.querySelector('#velocity').textContent =
    velocity.toFixed(0) + ' km/h';
  document.querySelector('#altitude').textContent = altitude.toFixed(0) + ' km';
  document.querySelector('#lat').textContent = latitude.toFixed(2) + '°';
  document.querySelector('#long').textContent = longitude.toFixed(2) + '°';

  // draw route to follow up the way of the iss
  drawRoute();

  return {
    lon: longitude,
    lat: latitude
  };
}

// follow up the route of the iss
async function drawRoute() {
  const response = await fetch('/getRoute');
  const data = await response.json();
  const coordsArray = data;

  // draw circles to each coordinates
  coordsArray.forEach(coord => {
    L.circle(coord, {
      color: 'red',
      fillColor: 'red',
      radius: pointerRadius
    }).addTo(issMap);
  });
}

// add coords to the database
function addData(coords) {
  fetch('/addData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(coords)
  });
}

function updateMap(coords) {
  if (firstTime) {
    marker = L.marker(coords)
      .bindPopup('The center of the world')
      .setIcon(issIcon)
      .addTo(issMap);
    firstTime = false;
  }
  marker.setLatLng(coords);

  if (pointerCounter == 20) {
    // draws circles to follow up the way of the iss
    L.circle(coords, {
      color: 'red',
      fillColor: 'red',
      radius: pointerRadius
    }).addTo(issMap);
    pointerCounter = 0;
    // Writes to the database
    addData(coords);
  }
  pointerCounter++;
}

document.addEventListener('DOMContentLoaded', initMap);

setInterval(function() {
  fetchISS().then(coords => {
    updateMap(coords);
  });
}, 2000);
