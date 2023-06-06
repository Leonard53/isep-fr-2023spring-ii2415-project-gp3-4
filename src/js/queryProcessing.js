import {
  removeAccentedCharacter,
  checkEmptyString,
} from "./datasetProcessing.js";

/**
 * This function calculates the distance between two sites using latitude and longitude
 * @param {float} lat1 Latitude of site 1
 * @param {float} lon1 Longitude of site 1
 * @param {float} lat2 Latitude of site 2
 * @param {float} lon2 Longitude of site 2
 * @return {float} distance between site 1 and site 2 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
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
/** This class acts as the basis of the entire graph network */
export class Node {
  /** @param {Site} siteInfo takes in a site object */
  constructor(siteInfo) {
    if (
      checkEmptyString(siteInfo.longitude) ||
      checkEmptyString(siteInfo.latitude)
    )
      return; // reject sites with no longitude and latitude information
    this.node = siteInfo;
    this.edge = []; // structure: {Node, Distance}
  }
}

/** This class stores all the available nodes in the network */
export class Graph {
  /** @param {Node[]} allNodes array of Node object to be stored */
  constructor(allNodes) {
    this.allNodes = allNodes;
  }
  /** This function calls each nodes in the graph to remove a specific node from their edges
   * @param {Node} nodeToRemove the node to be removed from the edges of each node */
}

/** This function computes the distances between all nodes in the graph network
 * @param {Graph} graph an object of graph. Note that the nodes in allNodes will be changed upon calling this function */
export async function computeEdges(graph) {
  return new Promise((resolve) => {
    graph.allNodes.map((currentNode) => {
      const everyOtherNodes = graph.allNodes.filter((tempNode) => {
        return tempNode.node.siteName != currentNode.node.siteName;
      });
      // Computing distance between the current node and all the other node in the network
      everyOtherNodes.forEach((otherNode) => {
        const distance = parseFloat(
          calculateDistance(
            currentNode.node.latitude,
            currentNode.node.longitude,
            otherNode.node.latitude,
            otherNode.node.longitude
          )
        );
        currentNode.edge.push({
          node: otherNode,
          distance: distance,
        });
      });
      resolve();
    });
  });
}
/** This function acts as an filter functions for HTMLCollections since there isn't a native version
 * @param {HTMLCollections} collection the HTMLCollections from getElementsByClassName or getElementsByName
 * @param {function(Any)} condition anonymous function that takes in a statement and output a boolean for the filter funciton
 * @return {String[]} ids of the elements that fit the condition specified in the function header */
function htmlCollectionsFilter(collection, condition) {
  const filtered = [];
  try {
    for (let i = 0; i < collection.length; ++i) {
      if (condition(collection[i])) filtered.push(collection[i].id);
    }
    return filtered;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/** This function returns the number of days the users is going to stay
 * @return {number} the number of days of stay */
function getDay() {
  return parseInt(document.getElementById("displayDay").innerHTML);
}

/** This function returns the array of sites that are in the specific regions
 * @param {Site[]} dataset all sites that are parsed previously
 * @param {String[]} regions to be matched
 * @return {Site[]} the sites that are in the regions, all elements are unique */
export function getAllSitesFromRegions(dataset, regions) {
  const allSites = dataset;
  return [
    ...new Set( // filter out duplicating sites
      regions.flatMap((currentRegion) =>
        allSites.filter(
          (currentSite) => currentSite.region.indexOf(currentRegion) >= 0
        )
      )
    ),
  ];
}

/** This function returns the array of sites that match the specific time periods / themes
 * @param {Site[]} dataset all sites that are parsed previously
 * @param {String[]} timePeriods time periods / themes to be matched
 * @return {Site[]} the sites that match the time periods / themes, all elements are unique */
export function getAllSitesFromTimePeriod(dataset, timePeriods) {
  const allSites = dataset;
  return [
    ...new Set( // filter out duplicating sites
      timePeriods.flatMap((currentTimePeriod) =>
        allSites.filter(
          (currentSite) =>
            currentSite.timePeriod.indexOf(currentTimePeriod) >= 0
        )
      )
    ),
  ];
}

/** This function returns all the selected regions input by the users
 * @return {String[]} array of string of selected regions */
function getSelectedRegions() {
  const allRegions = document.getElementsByClassName("regionsCheckbox");
  const regionFiltered = htmlCollectionsFilter(
    allRegions,
    (thisRegion) => thisRegion.checked
  );
  return regionFiltered;
}

/** This function returns all the selected time periods or themes input by the users
 * @return {String[]} array of string of selected time periods or themes */
function getSelectedTimePeriod() {
  const allTimePeriod = document.getElementsByClassName("timePeriodCheckbox");
  const timePeriodFiltered = htmlCollectionsFilter(
    allTimePeriod,
    (thisTimePeriod) => thisTimePeriod.checked
  ); // At least one time period must be checked
  return timePeriodFiltered;
}

/** This function returns sites that only match both the region and the time period selection
 * @param {Site[]} sitesInRegions the sites that match the regions
 * @param {Site[]} sitesInTimePeriods the sites that match the time periods or themes
 * @return {Site[]} sites that only match both the regions and time period selection */
export function filterSitesIntersection(sitesInRegions, sitesInTimePeriods) {
  const matchingSitesFinal = [];
  for (const currentSite of sitesInRegions) {
    for (const otherSite of sitesInTimePeriods) {
      if (currentSite.siteName == otherSite.siteName) {
        matchingSitesFinal.push(currentSite);
        break;
      }
    }
  }
  const filterDuplication = matchingSitesFinal.filter(
    (site, index, self) =>
      index == self.findIndex((s) => site.siteName == s.siteName)
  );
  return filterDuplication;
}

/** this function valid the input from the form and return a boolean based on if all the inputs are valid or not
 * @return {boolean} if true, the input of the form is valid, otherwise, false */
export async function formValidation() {
  return new Promise((resolve) => {
    let isValid = true;
    const allRegions = getSelectedRegions(); // At least one region must be checked
    if (allRegions.length <= 0) {
      isValid = false;
      document
        .getElementById("masterRegionSelection")
        .classList.add("text-bg-danger");
    } else {
      document
        .getElementById("masterRegionSelection")
        .classList.remove("text-bg-danger");
    }
    const allTimePeriod = getSelectedTimePeriod(); // At least one time period must be checked
    if (allTimePeriod.length <= 0) {
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
    if (checkEmptyString(startDateInput.value)) {
      startDateInput.classList.add("is-invalid");
      isValid = false;
    }
    const endDateInput = document.getElementById("endDate");
    if (checkEmptyString(endDateInput.value)) {
      endDateInput.classList.add("is-invalid");
      isValid = false;
    }
    if (endDateInput.value < startDateInput.value) {
      document.getElementById("endDateFeedback").innerHTML =
        "End date must be set after the Start date";
      document.getElementById("startDateFeedback").innerHTML =
        "Start date must be set before the End date";
      isValid = false;
    } else {
      const startDateFeedback = document.getElementById("startDateFeedback");
      startDateFeedback.innerHTML = "Indicate a start date";
      startDateFeedback.classList.remove("is-invalid");
      const endDateFeedback = document.getElementById("endDateFeedback");
      endDateFeedback.innerHTML = "Indicate an end date";
      endDateFeedback.classList.remove("is-invalid");
    }
    const budgetInput = document.getElementById("budget");
    if (!budgetInput.value) {
      budgetInput.classList.add("is-invalid");
      isValid = false;
    }
    resolve(isValid);
  });
}

/** This funciton calculates the distance between itself and other nodes connected through edges.
 * @param {Node} node the starting node
 * @return {float} the total distance between itself and all other edges connected to the current node*/
export function computeTotalDistanceAllEdges(node) {
  let distanceCount = 0;
  node.edge.forEach((currentEdge) => (distanceCount += currentEdge.distance));
  return distanceCount;
}

/** This function updates the progress bar that indicate the progress of the algorithm
 * @param {number} progress the progress of the algorithm, ranges from 0 - 100 */
async function updateProgressBar(progress) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const progressBarDisplay = document.getElementById("progressBarProgress");
      progressBarDisplay.style.width = progress.toString() + "%";
      progressBarDisplay.innerHTML = progress.toString() + "%";
      resolve();
    });
  });
}

/** This function automatically find the next avaiable site to visit that will not result it plan duplication
 * @param {Site[]} exisitngPlan the array of sites already planned
 * @param {Node[]} chooseFrom the edhges of a node where the next site will need to be chosen from
 * @return {Node} the next site to visit */
async function findNextAvailableSite(exisitngPlan, chooseFrom) {
  return new Promise((resolve, reject) => {
    try {
      if (exisitngPlan.length <= 0 || exisitngPlan === null)
        return chooseFrom[0];
      const siteNameOnly = exisitngPlan.map((site) =>
        removeAccentedCharacter(site.siteName)
      );
      for (const currentNode of chooseFrom) {
        if (
          siteNameOnly.indexOf(
            removeAccentedCharacter(currentNode.node.node.siteName)
          ) < 0
        ) {
          resolve(currentNode);
        }
      }
      reject(new Error("No avaiable site found"));
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

/** This function is the main entry of the algorithm
 * @param {Site[]} dataset the parsed sites that was read in the beginning
 * @return {Site[]} all sites to be visited in that order */
export async function computePlan(dataset) {
  return new Promise(async (resolve, reject) => {
    try {
      const allSitesMatchRegions = getAllSitesFromRegions(
        dataset,
        getSelectedRegions()
      );
      await updateProgressBar(5);
      const allSitesMatchTimePeriod = getAllSitesFromTimePeriod(
        dataset,
        getSelectedTimePeriod()
      );
      await updateProgressBar(10);
      const allSitesMatchBoth = filterSitesIntersection(
        allSitesMatchRegions,
        allSitesMatchTimePeriod
      );
      await updateProgressBar(15);
      const nodes = allSitesMatchBoth
        .map((currentSite) => new Node(currentSite))
        .filter((currentNode) => Object.keys(currentNode).length > 0);
      await updateProgressBar(30);
      const graph = new Graph(nodes);
      await computeEdges(graph);
      await updateProgressBar(40);
      graph.allNodes.sort(
        (currentNode, nextNode) =>
          computeTotalDistanceAllEdges(currentNode) -
          computeTotalDistanceAllEdges(nextNode) // If distance from currentNode is greater than distance from the nextNode, swap the order.
        // The goal is to have the node that have the least total distance from all other nodes being the first node. This will determine the first site the user will need to visit
      );
      await updateProgressBar(60);
      const perSiteExpense = 15;
      const maxSitePerDay = 5;
      const dayAvailable = getDay();
      const budgetAvaiable = parseInt(document.getElementById("budget").value);
      const maxSite = Math.round(
        Math.min(
          budgetAvaiable / perSiteExpense,
          dayAvailable * maxSitePerDay,
          graph.allNodes.length
        )
      );
      if (maxSite <= 0) throw new Error();
      let currentNode = graph.allNodes[0];
      const resultSites = [currentNode.node];
      await updateProgressBar(65);
      for (let i = 1; i < maxSite; ++i) {
        const currentNodeEdgeSorted = currentNode.edge.sort(
          (edgeCurrentNode, edgeNextNode) =>
            edgeCurrentNode.node.distance - edgeNextNode.node.distance
        );
        const nextToVisit = await findNextAvailableSite(
          resultSites,
          currentNodeEdgeSorted
        );
        resultSites.push(nextToVisit.node.node);
        currentNode = nextToVisit.node;
      }
      await updateProgressBar(100);
      resolve(resultSites);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

/** This function takes in an array of site, and return an HTML string that represent all sites with the card utilities provided by boostrap
 * @param {Site[]} sites the sites to be displayed
 * @return {string} the string representing the HTML DOM to be rendered */
export async function sitesToCardOutputToHTML(sites) {
  return new Promise(async (resolve, reject) => {
    try {
      let stringToReturn = "";
      let counter = 1;
      sites.forEach(async (currentSite) => {
        stringToReturn += '<div class="card col">\n';
        stringToReturn += '<div class="card-body">\n';
        stringToReturn +=
          '<h5 class="card-title">' +
          counter.toString() +
          ". " +
          currentSite.siteName +
          "</h5>\n";
        stringToReturn +=
          '<h6 class="card-subtitle mb-2 text-body-secondary">' +
          currentSite.commune +
          ", " +
          currentSite.region.toString() +
          "</h6>\n";
        stringToReturn +=
          '<p class="card-text">' +
            checkEmptyString(currentSite.historyDescription) ||
          !currentSite.historyDescription
            ? currentSite.historyDescription
            : "Information not avaiable" + "</p>\n";
        stringToReturn +=
          '<p class="card-footer">' +
          currentSite.timePeriod.toString() +
          "</p>\n";
        stringToReturn += "</div>\n</div>\n";
        ++counter;
      });
      resolve(stringToReturn);
    } catch (e) {
      console.error(e);
      await flipVisibility(document.getElementById("invalidPlanAlert"));
      await flipVisibility(document.getElementById("planningInProgressAlert"));
      reject(e);
    }
  });
}
