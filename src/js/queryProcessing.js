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
