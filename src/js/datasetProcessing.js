import fileJSON from "../frAllMonumentsDataset.json";

/** A class that store the information of a tourist site */
export class Site {
  /**
   *
   * @param {string} siteName name of the site
   * @param {string} commune commune of this site
   * @param {string} region region of this site
   * @param {string} timePeriod time period of what this site represent
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

/** This function read the CSV file supplied,
 * split the objects into group in order to be processed later
 * @return {Site[]} allSites all the tourist sites in the JSON file
 * */
export function readDataset() {
  const allSites = [];
  fileJSON.map((currentSite) => {
    const actualData = currentSite.fields;
    const siteName = actualData.appellation_courante;
    const commune = actualData.commune;
    const region = actualData.region;
    const timePeriod = actualData.siecle;
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
  console.log(allSites);
  return allSites;
}
