import { readDataset } from "./js/datasetProcessing.js";
// Function to calculate the distance between two latitude-longitude coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers

    // Convert latitude and longitude to radians
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

// Function to generate site visit plans based on user inputs
function generateSiteVisitPlans(days, region, timePeriod) {
    const sitesData = readDataset();
    // Retrieve data from the database based on user inputs
    // Assuming sitesData is an array of site objects retrieved from the database
    // Each object should have properties: siteName, commune, historyDescription, latitude, longitude

    // Filter sites based on region and time period
    const filteredSites = sitesData.filter(site => {
        return site.region === region && site.timePeriod === timePeriod;
    });

    // Sort the filtered sites based on latitude and longitude
    filteredSites.sort((site1, site2) => {
        return site1.latitude - site2.latitude || site1.longitude - site2.longitude;
    });

    // Initialize variables
    const plans = [];
    const visitedSites = [];

    // Iterate through the filtered and sorted sites to generate plans
    for (let i = 0; i < filteredSites.length; i++) {
        const currentSite = filteredSites[i];

        // Check if the current site has already been visited
        if (visitedSites.includes(currentSite.siteName)) {
            continue;
        }

        // Create a new plan
        const plan = {
            siteName: currentSite.siteName,
            commune: currentSite.commune,
            historyDescription: currentSite.historyDescription,
            latitude: currentSite.latitude,
            longitude: currentSite.longitude
        };

        // Calculate the total distance covered so far in the plan
        let totalDistance = 0;

        // Iterate through the remaining sites to find the ones closest to the current site
        for (let j = i + 1; j < filteredSites.length; j++) {
            const nextSite = filteredSites[j];

            // Check if the next site has already been visited
            if (visitedSites.includes(nextSite.siteName)) {
                continue;
            }

            // Calculate the distance between the current site and the next site
            const distance = calculateDistance(
                currentSite.latitude,
                currentSite.longitude,
                nextSite.latitude,
                nextSite.longitude
            );

            // Check if the total distance covered plus the distance to the next site exceeds the available days
            if (totalDistance + distance > days) {
                break;
            }

            // Add the next site to the plan
            plan.siteName += ", " + nextSite.siteName;
            visitedSites.push(nextSite.siteName);
            totalDistance += distance;
        }

        // Add the plan to the list of plans
        plans.push(plan);
    }

    return plans;
}

// Function to handle form submission
function generatePlans(event) {
    event.preventDefault(); // Prevent form submission

    // Get user inputs
    var days = parseInt(document.getElementById("days").value);
    var region = document.getElementById("region").value;
    var timePeriod = document.getElementById("timePeriod").value;

    // Call the function to generate plans
    var plans = generateSiteVisitPlans(days, region, timePeriod);

    // Display the plans on the webpage
    var plansContainer = document.getElementById("plansContainer");
    plansContainer.innerHTML = ""; // Clear previous plans

    if (plans.length === 0) {
        plansContainer.innerHTML = "No plans found.";
    } else {
        for (var i = 0; i < plans.length; i++) {
            var plan = plans[i];
            var planItem = document.createElement("div");
            planItem.innerHTML = "<strong>Plan " + (i+1) + ":</strong><br>" +
                "Site Name: " + plan.siteName + "<br>" +
                "Commune: " + plan.commune + "<br>" +
                "History Description: " + plan.historyDescription + "<br>" +
                "Latitude: " + plan.latitude + "<br>" +
                "Longitude: " + plan.longitude;
            plansContainer.appendChild(planItem);
        }
    }
}

// Attach form submission event listener
document.getElementById("plannerForm").addEventListener("submit", generatePlans);
