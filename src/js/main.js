// Import our custom CSS
import "../scss/styles.scss";

// Import all of Bootstrap's JS
import * as bootstrap from "bootstrap";
import {
  filterRegion,
  filterTimePeriod,
  readDataset,
  Site,
} from "./datasetProcessing.js";

let startDate = 0;
let endDate = 0;

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
 * @return {String} the HTML formatted string */
function arrayToListOfCheckboxesHTML(arr) {
  let returnString = "";
  returnString += '<div class="row row-cols-4">\n';
  arr.map((elem) => {
    returnString += '<div class="col form-check">\n';
    returnString +=
      '<input class="form-check-input" type="checkbox" value="" id="checkboxBox' +
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
  const allSites = readDataset();
  return arrayToListOfCheckboxesHTML(filterRegion(allSites).sort());
}

/**
 * This function returns the HTML code for creating a bunch of checkboxes for all the time regions all available sites that exist in the dataset for the creation of a proper form
 * @return {String} the HTML code for all the regions */
export function getAllTimePeriodsHTMLForm() {
  const allSites = readDataset();
  return arrayToListOfCheckboxesHTML(filterTimePeriod(allSites).sort());
}

document.getElementById("budget").addEventListener("change", function () {
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
