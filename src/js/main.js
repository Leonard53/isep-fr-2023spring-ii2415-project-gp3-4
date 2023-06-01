// Import our custom CSS
import "../scss/styles.scss";

// Import all of Bootstrap's JS
import * as bootstrap from "bootstrap";
import {
  filterRegion,
  filterTimePeriod,
  readDataset,
} from "./datasetProcessing.js";
import { computePlan, formValidation } from "./queryProcessing.js";
import { doc } from "prettier";

let startDate = 0;
let endDate = 0;
const dataset = readDataset();

/** Helper function to update the date difference on screen
 *@param {string} startDate: starting date input by the user
  @param {string} endDate: ending date input by the user
 */
function updateDate(startDate, endDate) {
  const milisecondsDifference = endDate - startDate;
  // miliseconds to day
  const actualDateDifference = Math.floor(
    milisecondsDifference / 1000 / 60 / 60 / 24
  );
  document.getElementById("displayDay").innerHTML = actualDateDifference;
}

/**
 * @param {Any[]} arr Any types of array to be converted to Checkboxes in HTML format
 * @param {String} type The type of what these checkboxes do, for form validation
 * @return {String} the HTML formatted string */
function arrayToListOfCheckboxesHTML(arr, type = "") {
  let returnString = "";
  returnString += '<div class="row row-cols-4">\n';
  arr.map((elem) => {
    returnString += '<div class="col form-check">\n';
    returnString +=
      '<input class="form-check-input ' +
      type +
      'Checkbox" type="checkbox" value="" id="' +
      elem +
      '">\n';
    returnString +=
      '<label class="form-check-label" for="flexCheckDefault">\n' +
      elem +
      "\n</label>\n";
    returnString += "</div>\n";
  });
  returnString += "</div>";
  return returnString;
}

/**
 * This function returns the HTML code for creating a bunch of checkboxes for all the regions that exist in the dataset for the creation of a proper form
 * @return {String} the HTML code for all the regions */
export function getAllRegionsHTMLForm() {
  const allSites = dataset;
  return arrayToListOfCheckboxesHTML(filterRegion(allSites).sort(), "regions");
}

/**
 * This function returns the HTML code for creating a bunch of checkboxes for all the time regions all available sites that exist in the dataset for the creation of a proper form
 * @return {String} the HTML code for all the regions */
export function getAllTimePeriodsHTMLForm() {
  const allSites = dataset;
  return arrayToListOfCheckboxesHTML(
    filterTimePeriod(allSites).sort(),
    "timePeriod"
  );
}

/** This function flips the visibility of an HTML element
 * @param {HTMLElement} htmlElem the element to be dealt with */
export function flipVisibility(htmlElem) {
  try {
    if (htmlElem.hasAttribute("visible")) {
      htmlElem.classList.remove("visible");
      htmlElem.classList.add("invisible");
    } else {
      htmlElem.classList.remove("invisible");
      htmlElem.classList.add("visible");
    }
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("budget").addEventListener("input", function () {
  const budgetRead = document.getElementById("budget").value;
  if (budgetRead) {
    document.getElementById("displayBudget").innerHTML = budgetRead.toString();
  }
});

document.getElementById("startDate").addEventListener("change", function () {
  startDate = new Date(document.getElementById("startDate").value);
  if (startDate && endDate) {
    updateDate(startDate, endDate);
  }
});

document.getElementById("endDate").addEventListener("change", function () {
  endDate = new Date(document.getElementById("endDate").value);
  if (startDate && endDate) {
    updateDate(startDate, endDate);
  }
});

document.getElementById("submissionBtn").addEventListener("click", function () {
  flipVisibility(document.getElementById("planDisplay"));
  if (formValidation()) {
    window.scrollTo({
      top: document.getElementById("planDisplay").offsetTop,
      behavior: "smooth",
    });
    flipVisibility(document.getElementById("planningInProgressAlert"));
    computePlan(dataset);
  }
});
