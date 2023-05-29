import {
  readDataset,
  seperateRegions,
  seperateTimePeriod,
  Site,
} from "./datasetProcessing.js";

/** This function acts as an filter functions for HTMLCollections since there isn't a native version
 * @param {HTMLCollections} collection the HTMLCollections from getElementsByClassName or getElementsByName
 * @param {function(Any)} condition anonymous function that takes in a statement and output a boolean for the filter funciton
 * @return {HTMLCollections} the array of HTML elements that fits the condition specified in the function header */
function htmlCollectionsFilter(collection, condition) {
  const filtered = [];
  try {
    for (let i = 0; i < collection.length; ++i) {
      if (condition(collection[i])) filtered.push(collection[i]);
    }
    return filtered;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/** this function valid the input from the form and return a boolean based on if all the inputs are valid or not
 * @return {boolean} if true, the inputs of the form is valid, otherwise, false */
export function formValidation() {
  let isValid = true;
  const allRegions = document.getElementsByClassName("regionsCheckbox");
  const regionFiltered = htmlCollectionsFilter(
    allRegions,
    (thisRegion) => thisRegion.checked
  );
  // At least one region must be checked
  if (regionFiltered.length <= 0) {
    isValid = false;
    document
      .getElementById("masterRegionSelection")
      .classList.add("text-bg-danger");
  } else {
    document
      .getElementById("masterRegionSelection")
      .classList.remove("text-bg-danger");
  }
  const allTimePeriod = document.getElementsByClassName("timePeriodCheckbox");
  const timePeriodFiltered = htmlCollectionsFilter(
    allTimePeriod,
    (thisTimePeriod) => thisTimePeriod.checked
  ); // At least one time period must be checked
  if (timePeriodFiltered.length <= 0) {
    isValid = false;
    document
      .getElementById("masterTimePeriodSelection")
      .classList.add("text-bg-danger");
  } else {
    document
      .getElementById("masterTimePeriodSelection")
      .classList.remove("text-bg-danger");
  }
  const startDateInput = document.getElementById("startDate");
  if (!startDateInput.value) {
    startDateInput.classList.add("is-invalid");
    isValid = false;
  }
  const endDateInput = document.getElementById("endDate");
  if (!endDateInput.value) {
    endDateInput.classList.add("is-invalid");
    isValid = false;
  }
  if (endDateInput.value < startDateInput.value) {
    document.getElementById("endDateFeedback").innerHTML =
      "End date must be set after the Start date";
    document.getElementById("startDateFeedback").innerHTML =
      "Start date must be set before the End date";
  } else {
    document.getElementById("endDateFeedback").innerHTML =
      "Indicate a start date";
    document.getElementById("startDateFeedback").innerHTML =
      "Indicate a start date";
  }
  const budgetInput = document.getElementById("budget");
  if (!budgetInput.value) {
    budgetInput.classList.add("is-invalid");
    isValid = false;
  }
  return isValid;
}

/**
 * This function calculator the distance between two sites using latitude and longitude
 * @param {float} lat1 Latitude of site 1
 * @param {float} lon1 Longitude of site 1
 * @param {float} lat2 Latitude of site 2
 * @param {float} lon2 Longitude of site 2
 * @return {float} distance between site 1 and site 2 */
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

/**
 * This function is the main algorithm the calculates the path of what the users should take
 * @return {Site[]} the array of sites that the users should take, in that order */
function getPlannedSites() {
  // const userLat = parseFloat(document.getElementById("latitude").value);
  // const userLon = parseFloat(document.getElementById("longitude").value);

  // Array of sites with their latitude and longitude
  const sites = readDataset();
  const days = parseInt(document.getElementById("displayDay").innerHTML);
  // Calculate the maximum number of sites that can be visited
  const maxSites = Math.floor((days * 24) / 2);

  // Calculate distances from user's location to each site
  const distances = sites.map((site) => ({
    name: site.siteName,
    distance: calculateDistance(
      userLat,
      userLon,
      site.latitude,
      site.longitude
    ),
  }));

  // Sort sites by distance in ascending order
  distances.sort((a, b) => a.distance - b.distance);

  // Generate the list of sites that can be visited within the given number of days
  const plannedSites = distances.slice(0, maxSites).map((site) => site.name);

  return plannedSites;
}
