import { Site, readDataset } from "../lib/src/js/datasetProcessing.js";
import {
  Graph,
  Node,
  calculateDistance,
  getAllSitesFromRegions,
  getAllSitesFromTimePeriod,
  computeEdges,
} from "../lib/src/js/queryProcessing.js";
import { expect, beforeEach, it } from "vitest";
let datasetRead: Site[];

/**
 * This function construct and return a new Site object, which allows an object to be passed through for readability
 * @param {Object} obj the object to be passed in
 * @return {Site} the constructed site
 */
function siteCreationWrapper(obj?: {
  siteName?: string;
  commune?: string;
  region?: string;
  timePeriod?: string[];
  historyDescription?: string;
  longitude?: number;
  latitude?: number;
}): Site {
  const defaultObj: {
    siteName: string;
    commune: string;
    region: string;
    timePeriod: string[];
    historyDescription: string;
    longitude: number;
    latitude: number;
  } = {
    siteName: obj?.siteName ?? "RANDOM",
    commune: obj?.commune ?? "RANDOM",
    region: obj?.region ?? "RANDOM",
    timePeriod: obj?.timePeriod ?? ["RANDOM"],
    historyDescription: obj?.historyDescription ?? "RANDOM",
    longitude: obj?.longitude ?? 0.0,
    latitude: obj?.latitude ?? 0.0,
  };

  return new Site(
    defaultObj.siteName,
    defaultObj.commune,
    defaultObj.region,
    defaultObj.timePeriod,
    defaultObj.historyDescription,
    defaultObj.longitude,
    defaultObj.latitude
  );
}

beforeEach(async () => {
  datasetRead = await readDataset();
});
it("Should be able to construct a Site object", () => {
  for (const dataRow of datasetRead) {
    expect(() => {
      if (typeof dataRow.siteName != "string") {
        throw new Error(
          "Type not matched; expected Site to have siteName: String, got " +
            typeof dataRow.siteName +
            " instead."
        );
      }
    }).not.toThrow();
  }
});
it("Should be able to construct a Node object", () => {
  for (const dataRow of datasetRead) {
    expect(async () => {
      new Node(dataRow);
    }).not.toThrow();
  }
});
it("Should be able to construct a Graph object", () => {
  const allNodes: Node[] = [];
  for (const dataRow of datasetRead) {
    const newNode: Node = new Node(dataRow);
    allNodes.push(newNode);
  }
  expect(() => {
    new Graph(allNodes);
  }).not.toThrow();
});
it("Should be able to calculate distances between two points based on their longitude and latitude", () => {
  const lat1 = 10.0;
  const lat2 = 20.0;
  const lon1 = 10.0;
  const lon2 = 20.0;
  const distanceOutput = calculateDistance(lat1, lon1, lat2, lon2);
  const conversionToRadian: (arg0: number) => number = (deg) =>
    (deg * Math.PI) / 180;
  const dLat: number = conversionToRadian(lat2 - lat1);
  const dLon: number = conversionToRadian(lon2 - lon1);
  const lat1Rad: number = conversionToRadian(lat1);
  const lat2Rad: number = conversionToRadian(lat2);
  const a: number =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const expectedDistamce: number = 6371 * c;
  expect(distanceOutput).eq(expectedDistamce);
  const reverseDistance: number = calculateDistance(lat2, lon2, lat1, lon1);
  expect(reverseDistance).eq(distanceOutput); // Should be the same the other way around
});

it("Should be able to filter out only a specific region from all sites", async () => {
  const exampleSites: Site[] = [];
  const regionToBeMatched = "firstRegion";
  exampleSites.push(
    siteCreationWrapper({
      region: regionToBeMatched,
    })
  );
  exampleSites.push(
    siteCreationWrapper({ siteName: "B", region: regionToBeMatched })
  );
  exampleSites.push(siteCreationWrapper({ siteName: "C" }));
  const filteredRegions: Site[] = getAllSitesFromRegions(exampleSites, [
    regionToBeMatched,
  ]);
  expect(filteredRegions.length).toBe(2);
  expect(
    filteredRegions.every(
      (matchedSite: Site) => matchedSite.region == regionToBeMatched
    )
  ).toBe(true);
});

it("Should be able to filter out only a specific time period from all sites", async () => {
  const exampleSites: Site[] = [];
  const timePeriodToBeMatched = "firstPeriod";
  exampleSites.push(
    siteCreationWrapper({ siteName: "A", timePeriod: timePeriodToBeMatched })
  );
  exampleSites.push(
    siteCreationWrapper({ siteName: "B", timePeriod: timePeriodToBeMatched })
  );
  exampleSites.push(
    siteCreationWrapper({ siteName: "C", timePeriod: "secondPeriod" })
  );
  const filteredTimePeriod: Site[] = getAllSitesFromTimePeriod(exampleSites, [
    timePeriodToBeMatched,
  ]);
  expect(filteredTimePeriod.length).toBe(2);
  expect(
    filteredTimePeriod.every(
      (matchedSite: Site) => matchedSite.timePeriod == timePeriodToBeMatched
    )
  ).toBe(true);
});
it("Should be able to calculate the distance between a node and its other edges", async () => {
  const exampleSites: Site[] = [];
  const [lat1, lon1, lat2, lon2, lat3, lon3] = [1, 1, 1, 2, 1, 3];
  exampleSites.push(
    siteCreationWrapper({ siteName: "A", longitude: lon1, latitude: lat1 })
  );
  exampleSites.push(
    siteCreationWrapper({ siteName: "B", longitude: lon2, latitude: lat2 })
  );
  exampleSites.push(
    siteCreationWrapper({ siteName: "C", longitude: lon3, latitude: lat3 })
  );
  const exampleNode: Node[] = exampleSites.map((site) => new Node(site));
  const exampleGraph: Graph = new Graph(exampleNode);
  await computeEdges(exampleGraph);
  console.log(exampleNode);
  console.log(exampleGraph);
  const betweenNodeOneAndTwo = calculateDistance(lat1, lon1, lat2, lon2);
  const betweenNodeOneAndThree = calculateDistance(lat1, lon1, lat3, lon3);
  const betweenNodeTwoAndThree = calculateDistance(lat2, lon2, lat3, lon3);
  expect(exampleNode.every((node) => node.edge.length == 2)).toBe(true);
  expect(exampleNode[0].edge[0].distance).toBe(betweenNodeOneAndTwo);
  expect(exampleNode[0].edge[1].distance).toBe(betweenNodeOneAndThree);
  expect(exampleNode[1].edge[0].distance).toBe(betweenNodeOneAndTwo);
  expect(exampleNode[1].edge[1].distance).toBe(betweenNodeTwoAndThree);
});
