import { Site, readDataset } from "../lib/src/js/datasetProcessing.js";
import {
  Graph,
  Node,
  calculateDistance,
} from "../lib/src/js/queryProcessing.js";
import { expect, describe, beforeEach, test, it } from "vitest";
let datasetRead: Site[];
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
      const sampleNode: Node = new Node(dataRow);
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
    const newGraph: Graph = new Graph(allNodes);
  }).not.toThrow();
});
it("Should be able to calculate distances between two points based on their longitude and latitude", () => {
  const lat1: number = 10.0;
  const lat2: number = 20.0;
  const lon1: number = 10.0;
  const lon2: number = 20.0;
  const distanceOutput = calculateDistance(lat1, lon1, lat2, lon2);
  expect(distanceOutput).eq(
    Math.acos(
      Math.sin(10.0) * Math.sin(20.0) +
        Math.cos(10.0) * Math.cos(20.0) * Math.cos(20.0 - 10.0)
    ) * 6371
  );
});
