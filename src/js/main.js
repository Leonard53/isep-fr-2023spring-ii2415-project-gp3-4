// Import our custom CSS
import "../scss/styles.scss";
import {
  filterRegion,
  filterTimePeriod,
  readDataset,
} from "./datasetProcessing.js";
import {
  computePlan,
  formValidation,
  sitesToCardOutputToHTML,
} from "./queryProcessing.js";

let startDate = 0;
let endDate = 0;
const dataset = readDataset();
console.log("MAIN.JS CALLED");

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

/** This function asserts the HTML element is visible
 * @param {HTMLElement} htmlElem the element to be shown */
async function assertVisibleElement(htmlElem) {
  return new Promise((resolve) => {
    htmlElem.classList.add("visible");
    htmlElem.classList.remove("invisible");
    resolve();
  });
}

/** This function asserts the HTML element is invisible
 * @param {HTMLElement} htmlElem the element to be hide */
async function assertInvisibleElement(htmlElem) {
  return new Promise((resolve) => {
    htmlElem.classList.add("invisible");
    htmlElem.classList.remove("visible");
    resolve();
  });
}

/** This function flips the visibility of an HTML element
 * @param {HTMLElement} htmlElem the element to be dealt with */
export async function flipVisibility(htmlElem) {
  return new Promise((resolve, error) => {
    setTimeout(() => {
      try {
        if (htmlElem.classList.contains("visible")) {
          htmlElem.classList.remove("visible");
          htmlElem.classList.add("invisible");
        } else {
          htmlElem.classList.remove("invisible");
          htmlElem.classList.add("visible");
        }
        resolve();
      } catch (e) {
        console.error(e);
        error(e);
      }
    }, 10);
  });
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

document
  .getElementById("submissionBtn")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (await formValidation()) {
      await assertVisibleElement(document.getElementById("planDisplay"));
      window.scrollTo({
        top: document.getElementById("planDisplay").offsetTop,
        behavior: "smooth",
      });
      await assertVisibleElement(
        document.getElementById("planningInProgressAlert")
      );
      /** This function provide a way for the algorithm to finish running before executing other lines */
      const planResult = await computePlan(dataset);
      const planHTMLOutput = await sitesToCardOutputToHTML(planResult);
      document.getElementById("resultDisplay").innerHTML = planHTMLOutput;
      await assertInvisibleElement(
        document.getElementById("planningInProgressAlert")
      );
      window.scrollTo({
        top: document.getElementById("planDisplay").offsetTop,
        behavior: "smooth",
      });
    }
  });
