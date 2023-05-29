// Assuming you have the latitude and longitude data for sites in the 'dataProcessing' file

// Function to calculate the distance between two latitude-longitude points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Function to get the list of sites that can be visited within the given number of days
function getPlannedSites(days) {
  const userLat = parseFloat(document.getElementById("latitude").value);
  const userLon = parseFloat(document.getElementById("longitude").value);

  // Array of sites with their latitude and longitude
  const sites = [
    { name: "Site 1", lat: 10.1234, lon: 20.5678 },
    { name: "Site 2", lat: 30.9876, lon: 40.5432 },
    // Add more sites here
  ];

  // Calculate the maximum number of sites that can be visited
  const maxSites = Math.floor((days * 24) / 2);

  // Calculate distances from user's location to each site
  const distances = sites.map((site) => ({
    name: site.name,
    distance: calculateDistance(userLat, userLon, site.lat, site.lon),
  }));

  // Sort sites by distance in ascending order
  distances.sort((a, b) => a.distance - b.distance);

  // Generate the list of sites that can be visited within the given number of days
  const plannedSites = distances.slice(0, maxSites).map((site) => site.name);

  return plannedSites;
}
