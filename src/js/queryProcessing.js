import {
  removeAccentedCharacter,
  checkEmptyString,
} from "./datasetProcessing.js";
import { flipVisibility } from "./main.js";

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
/** This class act as the basis of the entire graph network */
class Node {
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

  /** This function remove a specific node from the edge list of the current node
   * @param {Node} nodeToRemove the node to be removed from the edge */
  remoevFromEdge(nodeToRemove) {
    for (let i = 0; i < this.edge.length; ++i) {
      if (
        removeAccentedCharacter(this.edge[i].node.node.siteName) ==
        removeAccentedCharacter(nodeToRemove.node.siteName)
      ) {
        const newEdgeFirstHalf = this.edge.slice(0, i);
        const newEdgeSecondHalf = this.edge.slice(i + 1);
        newEdgeSecondHalf.forEach((currentNode) =>
          newEdgeFirstHalf.push(currentNode)
        );
        this.edge = newEdgeFirstHalf;
        return;
      }
    }
  }
}

/** This class stored all the available nodes in the network */
class Graph {
  /** @param {Node[]} allNodes array of Node object to be stored */
  constructor(allNodes) {
    this.allNodes = allNodes;
  }
  /** This function calls each nodes in the graph to remove a specific node from their edges
   * @param {Node} nodeToRemove the node to be removed from the edges of each node */
  removeFromAllNodesEdge(nodeToRemove) {
    this.allNodes.forEach((currentNode) => {
      currentNode.remoevFromEdge(nodeToRemove);
    });
  }
}

/** This function computes the distances between all nodes in the graph network
 * @param {Graph} graph an object of graph. Note that the nodes in allNodes will be changed upon calling this function */
function computeEdges(graph) {
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
  });
}
/** This function acts as an filter functions for HTMLCollections since there isn't a native version
 * @param {HTMLCollections} collection the HTMLCollections from getElementsByClassName or getElementsByName
 * @param {function(Any)} condition anonymous function that takes in a statement and output a boolean for the filter funciton
 * @return {Sting[]} ids of the elements that fit the condition specified in the function header */
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
 * @return {number} the number of day of stay */
function getDay() {
  return parseInt(document.getElementById("displayDay").innerHTML);
}

/** This function returns the array of sites that are in the specific regions
 * @param {Site[]} dataset all sites that are parsed previously
 * @param {String[]} regions to be matched
 * @return {Site[]} the sites that is in the regions, all elements are unique */
function getAllSitesFromRegions(dataset, regions) {
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
function getAllSitesFromTimePeriod(dataset, timePeriods) {
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
 * @return {string[]} array of string of selected regions */
function getSelectedRegions() {
  const allRegions = document.getElementsByClassName("regionsCheckbox");
  const regionFiltered = htmlCollectionsFilter(
    allRegions,
    (thisRegion) => thisRegion.checked
  );
  return regionFiltered;
}

/** This function returns all the selected time periods or themes input by the users
 * @return {string[]} array of string of selected time periods or themes */
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
 * @param {Site[]} sitesInTimePeriods the sites the match the time periods or themes
 * @return {Site[]} sites that only match both the regions and time period selection */
function filterSitesIntersection(sitesInRegions, sitesInTimePeriods) {
  const matchingSitesFinal = [];
  sitesInRegions.forEach((currentSite) => {
    sitesInTimePeriods.forEach((otherSite) => {
      if (currentSite.siteName == otherSite.siteName) {
        matchingSitesFinal.push(currentSite);
      }
    });
  });
  const filterDuplication = matchingSitesFinal.filter(
    (site, index, self) =>
      index == self.findIndex((s) => site.siteName == s.siteName)
  );
  return filterDuplication;
}

/** this function valid the input from the form and return a boolean based on if all the inputs are valid or not
 * @return {boolean} if true, the inputs of the form is valid, otherwise, false */
export function formValidation() {
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
  return isValid;
}

/** This funciton calculates the distance between itself and other nodes connected through edges.
 * @param {Node} node the starting node
 * @return {float} the total distance between itself and all other edges connected to the current node*/
function computeTotalDistanceAllEdges(node) {
  let distanceCount = 0;
  node.edge.forEach((currentEdge) => (distanceCount += currentEdge.distance));
  return distanceCount;
}

/** This function updates the progress bar that indicate the progress of the algorithm
 * @param {number} progress the progress of the algorithm, from 0 - 100 */
function updateProgressBar(progress) {
  // const progressBarMaster = document.getElementById("planningProgress");
  const progressBarDisplay = document.getElementById("progressBarProgress");
  // progressBarMaster.setAttribute("aria-valuenow", progress);
  progressBarDisplay.style.width = progress.toString() + "%";
  progressBarDisplay.innerHTML = progress.toString() + "%";
}

/** This function is the main entry of the algorithm
 * @param {Site[]} dataset the parsed sites that was read in the beginning
 * @return {Site[]} all sites to be visited in that order */
export function computePlan(dataset) {
  try {
    const allSitesMatchRegions = getAllSitesFromRegions(
      dataset,
      getSelectedRegions()
    );
    updateProgressBar(5);
    setTimeout(() => {
      const allSitesMatchTimePeriod = getAllSitesFromTimePeriod(
        dataset,
        getSelectedTimePeriod()
      );
      updateProgressBar(10);
      setTimeout(() => {
        const allSitesMatchBoth = filterSitesIntersection(
          allSitesMatchRegions,
          allSitesMatchTimePeriod
        );
        updateProgressBar(15);
        setTimeout(() => {
          const nodes = allSitesMatchBoth
            .map((currentSite) => new Node(currentSite))
            .filter((currentNode) => Object.keys(currentNode).length > 0);
          updateProgressBar(30);
          setTimeout(() => {
            const graph = new Graph(nodes);
            computeEdges(graph);
            updateProgressBar(40);
            setTimeout(() => {
              graph.allNodes.sort(
                (currentNode, nextNode) =>
                  computeTotalDistanceAllEdges(currentNode) -
                  computeTotalDistanceAllEdges(nextNode) // If distance from currentNode is greater than distance from the nextNode, swap the order.
                // The goal is to have the node that have the least total distance from all other nodes being the first node. This will determine the first site the user will need to visit
              );
              updateProgressBar(60);
              setTimeout(() => {
                const perSiteExpense = 15;
                const maxSitePerDay = 5;
                const dayAvailable = getDay();
                const budgetAvaiable = parseInt(
                  document.getElementById("budget").value
                );
                const maxSite = Math.round(
                  Math.min(
                    budgetAvaiable / perSiteExpense,
                    dayAvailable * maxSitePerDay,
                    graph.allNodes.length
                  )
                );
                if (maxSite <= 0) return [];
                let currentNode = graph.allNodes[0];
                const resultSites = [currentNode.node];
                updateProgressBar(65);
                setTimeout(() => {
                  for (let i = 1; i < maxSite; ++i) {
                    graph.removeFromAllNodesEdge(currentNode);
                    const currentNodeEdgeSorted = currentNode.edge.sort(
                      (edgeCurrentNode, edgeNextNode) =>
                        edgeCurrentNode.node.distance -
                        edgeNextNode.node.distance
                    );
                    const nextToVisit = currentNodeEdgeSorted[0];
                    resultSites.push(nextToVisit.node.node);
                    currentNode = nextToVisit.node;
                  }
                  updateProgressBar(100);
                  setTimeout(() => {
                    console.log(resultSites);
                    flipVisibility(
                      document.getElementById("planningInProgressAlert")
                    );
                    return resultSites;
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (e) {
    console.error(e);
    displayPlanArea.classList.add("bg-error");
    flipVisibility(document.getElementById("invalidPlanAlert"));
    flipVisibility(document.getElementById("planningInProgressAlert"));
    return [];
  }
}
