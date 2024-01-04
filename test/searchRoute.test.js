import express, { Express } from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import searchRoute from "../src/search.route";

describe("GET default routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const sampleData = [
      {
        id: 1,
        timestamp: "2023-12-13T00:02:00Z",
        vehicleId: "sprint-3",
        event: "offline",
      },
      {
        id: 2,
        timestamp: "2023-12-13T00:08:40Z",
        vehicleId: "sprint-4",
        event: "error",
      },
      {
        id: 3,
        timestamp: "2023-12-13T00:08:43Z",
        vehicleId: "sprint-4",
        event: "not_ready",
      },
      {
        id: 4,
        timestamp: "2023-12-13T00:08:43Z",
        vehicleId: "sprint-4",
        event: "vehicle_error",
      },
      {
        id: 5,
        timestamp: "2023-12-13T00:10:51Z",
        vehicleId: "sprint-4",
        event: "vehicle_error",
      },
      {
        id: 6,
        timestamp: "2023-12-13T00:10:51Z",
        vehicleId: "sprint-5",
        event: "same_event",
      },
      {
        id: 7,
        timestamp: "2023-12-14T00:10:51Z",
        vehicleId: "sprint-5",
        event: "same_event",
      },
      {
        id: 8,
        timestamp: "2023-12-15T00:10:51Z",
        vehicleId: "sprint-5",
        event: "same_event",
      },
      {
        id: 9,
        timestamp: "2023-12-16T00:10:51Z",
        vehicleId: "sprint-5",
        event: "same_event",
      },
    ];

    app.use(searchRoute(sampleData));
  });

  // edge case: There is only one event within the [startDate;endDate] interval
  it("should return no data before single event is returned", async () => {
    // this should hit ID #1
    const body = {
      startDate: "2023-12-13T00:01:59Z",
      endDate: "2023-12-13T00:02:01Z",
      vehicleId: "sprint-3",
    };

    const response = await request(app).post("/search").send(body);

    expect(response.error).toBeFalsy();
    expect(response.body).toEqual([
      { event: 'no_data', from: 1702425719000, to: 1702425719000 },
      { event: 'offline', from: 1702425720000, to: 1702425721000 }
    ]);
  });

  // edge case: Consecutive similar events must be combined into one interval
  it("should return multiple elements", async () => {
    const body = {
      startDate: "2023-12-13T00:00:00Z",
      endDate: "2023-12-17T00:00:00Z",
      vehicleId: "sprint-5",
    };

    const response = await request(app).post("/search").send(body);
    console.dir(response.body);

    expect(response.error).toBeFalsy();
    expect(response.body).toEqual([
      { event: 'no_data', from: 1702425600000, to: 1702425600000 },
      { event: 'same_event', from: 1702426251000, to: 1702771200000 }
    ]);
  });


  // edge case: All events within the [startDate;endDate] interval have the same type
  it("should aggregate the same event", async () => {
    const body = {
      startDate: "2023-12-13T00:08:40Z",
      endDate: "2023-12-13T00:10:51Z",
      vehicleId: "sprint-4",
    };

    const response = await request(app).post("/search").send(body);

    expect(response.error).toBeFalsy();
    expect(response.body).toEqual([
      { event: 'no_data', from: 1702426120000, to: 1702426120000 },
      { event: 'error', from: 1702426120000, to: 1702426123000 },
      { event: 'not_ready', from: 1702426123000, to: 1702426123000 },
      { event: 'vehicle_error', from: 1702426123000, to: 1702426251000 }
    ]);
  });

  // edgce case: There are no events within the [startDate;endDate] interval
  it("empty results should return no data", async () => {
    const body = {
      startDate: "2020-01-01T00:00:01Z",
      endDate: "2020-01-02T01:00:00Z",
      vehicleId: "sprint-3",
    };

    const response = await request(app).post("/search").send(body);

    expect(response.error).toBeFalsy();
    expect(response.body).toEqual([
      { event: "no_data", from: 1577836801000, to: 1577926800000 },
    ]);
  });
});
