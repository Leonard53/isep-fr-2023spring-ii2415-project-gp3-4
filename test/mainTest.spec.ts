import {
  Site,
  checkEmptyString,
  removeAccentedCharacter,
  readDataset,
} from "../lib/js/datasetProcessing";
import { Graph, Node, calculateDistance } from "../lib/js/queryProcessing";
const { expect } = require("expect.js");
import { describe } from "mocha";
describe("Class Setup", async () => {
  let datasetRead: Site[];
  beforeEach(async () => {
    datasetRead = readDataset();
  });
  expect("Should be able to construct a Site object", async () => {
    for (const dataRow of datasetRead) {
      if (typeof dataRow.siteName != "string") {
        throw new Error(
          "Type not matched; expected Site to have siteName: String, got " +
            typeof dataRow.siteName +
            " instead."
        );
      }
    }
  }).to.not.throw();
  expect("Should be able to construct a Node object", async () => {
    for (const dataRow of datasetRead) {
      expect(async () => {
        const sampleNode: Node = new Node(dataRow);
      }).to.not.throw();
    }
  }).to.not.throw();
  expect("Should be able to construct a Graph object", async () => {
    const allNodes: Node[] = [];
    for (const dataRow of datasetRead) {
      const newNode: Node = new Node(dataRow);
      allNodes.push(newNode);
    }
    expect(() => {
      const newGraph: Graph = new Graph(allNodes);
    }).to.not.throw();
  }).to.not.throw();
  expect(
    "Should be able to calculate distances between two points based on their longitude and latitude",
    async () => {
      const lat1: number = 10.0;
      const lat2: number = 20.0;
      const lon1: number = 10.0;
      const lon2: number = 20.0;
      const distanceOutput = calculateDistance(lat1, lon1, lat2, lon2);
      return distanceOutput;
    }
  ).to.be(
    Math.acos(
      Math.sin(10.0) * Math.sin(20.0) +
        Math.cos(10.0) * Math.cos(20.0) * Math.cos(20.0 - 10.0)
    ) * 6371
  );
});
