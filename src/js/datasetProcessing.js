import fileJSON from "../frAllMonumentsDataset.json";

/** A class that store the information of a tourist site */
export class Site {
  /**
   * @param {string} siteName name of the site
   * @param {string} commune commune of this site
   * @param {string} region region of this site
   * @param {string[]} timePeriod time period of what this site represent
   * @param {string} historyDescription description of what this site is about
   * @param {double} longtitude longtitude of this site
   * @param {double} latitude latitude of this site
   */
  constructor(
    siteName,
    commune,
    region,
    timePeriod,
    historyDescription,
    longtitude,
    latitude
  ) {
    this.siteName = siteName;
    this.commune = commune;
    this.region = region;
    this.timePeriod = timePeriod;
    this.historyDescription = historyDescription;
    this.longtitude = longtitude;
    this.latitude = latitude;
  }
}

/** The following functions will split a raw, unprocessed string of time period into an array of string.
 * in the database, each site has either
 * A) Numeral centuries with other random words;
 * B) Only alphabatical time period; Or,
 * C) Empty
 * If the retrieved data is A, we first remove all characters except for 0-9 and space
 * After that, we seperate the centuries list (if there are multiple centuries given in the database), and for each of the century number occured in the database, we compare the current century number to all the tags in allPeriodTags to see if the current century number we are processing is already in the tag. If not, add it, otherwise, continue to the next item.
 *
 * If the retrived data is B, we first remove all the accents of the time period, seperate the time period by semicolon, and repeat the comparsion process above
 *
 * If the retrived data does not match A or B, or in any of the above processes, fall into the C) catagory, the data is disregarded.
 *
 * @param {String} rawString the raw string to be processed
 * @return {String[]} processedString the array of string that is processed
 */
function seperateTimePeriod(rawString) {
  const processedString = [];
  if (!rawString) return processedString;
  const numeralOnly = rawString.replace(/[^0-9\s]/g, "");
  const currentTimePeriodNumeral = !!numeralOnly; // if true, current site has numeric time period, otherwise: alphabatical only
  if (currentTimePeriodNumeral) {
    const allPresentCenturies = numeralOnly.split(" ");
    allPresentCenturies.forEach((currentCentury) => {
      if (!currentCentury || currentCentury == String.fromCharCode(160)) return; // char code 160 stands for the &nbsp character, which is a white space character
      if (
        processedString.indexOf(currentCentury) < 0 &&
        currentCentury.length <= 2
      )
        // For now, we ignore time period that are longer than 2 in size, meaning if a site has a time period in the format of a year, we will not be able to include that into the search algorithm
        processedString.push(currentCentury);
    });
  } else if (!currentTimePeriodNumeral) {
    const noAccentTimePeriod = rawString
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    const allAlphanumericTimePeriod = noAccentTimePeriod.split(";");
    allAlphanumericTimePeriod.forEach((currentTimePeriod) => {
      if (!currentTimePeriod || currentTimePeriod == String.fromCharCode(160))
        return;
      if (processedString.indexOf(currentTimePeriod) < 0) {
        processedString.push(currentTimePeriod);
      }
    });
  }
  return processedString;
}

/** This function read the CSV file supplied,
 * split the objects into group in order to be processed later
 * @return {Site[]} allSites all the tourist sites in the JSON file
 */
export function readDataset() {
  const allSites = [];
  fileJSON.map((currentSite) => {
    const actualData = currentSite.fields;
    const siteName = actualData.appellation_courante;
    const commune = actualData.commune;
    const region = actualData.region;
    const timePeriod = seperateTimePeriod(actualData.siecle);
    const historyDescription = actualData.historique;
    const locationDetails = actualData.p_coordonnees;
    let longtitude = 0;
    let latitude = 0;
    locationDetails
      ? ([longtitude, latitude] = locationDetails)
      : ([longtitude, latitude] = [0, 0]);
    allSites.push(
      new Site(
        siteName,
        commune,
        region,
        timePeriod,
        historyDescription,
        longtitude,
        latitude
      )
    );
  });
  return allSites;
}

/**
 *  @param {Site[]} allsite all the processed sites in an array format
 *  @return {string[]} allRegionTags all the regions that exist in the dataset
 */
export function filterRegion(allsite) {
  const allRegionTags = [];
  allsite.forEach((site) => {
    if (site.region && allRegionTags.indexOf(site.region) < 0) {
      // if the current region is not in the list of regions recorded before, add it into to allRegionTags array
      allRegionTags.push(site.region);
    }
  });
  return allRegionTags;
}

/**
 *  @param {Site[]} allsite all the processed sites in an array format
 *  @return {string[]} allPeriodTags the time period that exist in the dataset
 */
export function filterTimePeriod(allsite) {
  const allPeriodTags = [];
  allsite.forEach((site) => {
    site.timePeriod.forEach((currentTimePeriod) => {
      if (/^[0-9]+$/.test(currentTimePeriod)) currentTimePeriod += " Century"; // Add a "Century" keyword for better display, does not altered the actual data in the Site class
      if (currentTimePeriod && allPeriodTags.indexOf(currentTimePeriod) < 0) {
        allPeriodTags.push(currentTimePeriod);
      }
    });
  });
  return allPeriodTags;
}
