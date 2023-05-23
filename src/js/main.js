// Import our custom CSS
import '../scss/styles.scss';

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';
import {readDataset, Site} from './datasetProcessing.js';

const allSites = readDataset();

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
      milisecondsDifference / 1000 / 60 / 60 / 24,
  );
  document.getElementById('displayDay').innerHTML = actualDateDifference;
}

document.getElementById('budget').addEventListener('change', function() {
  const budgetRead = document.getElementById('budget').value;
  if (budgetRead) {
    document.getElementById('displayBudget').innerHTML = budgetRead.toString();
  }
});

document.getElementById('startDate').addEventListener('change', function() {
  startDate = new Date(document.getElementById('startDate').value);
  if (startDate && endDate) {
    updateDate(startDate, endDate);
  }
});

document.getElementById('endDate').addEventListener('change', function() {
  endDate = new Date(document.getElementById('endDate').value);
  if (startDate && endDate) {
    updateDate(startDate, endDate);
  }
});
