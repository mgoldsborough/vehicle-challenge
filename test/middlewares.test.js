import { describe, it, afterEach, vi, expect } from "vitest";
import checkParams from "../src/middlewares";

// mock request
const mockRequest = () => {
  const req = {};
  req.body = {};
  req.params = {};
  return req;
};

// mock response
const mockResponse = () => {
  const res = {};
  res.send = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

describe("middlewares", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // error handling: Bad format of startDate / end Date
  it("should return 400 when the body is empty", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    // null out body;
    req.body = null;

    checkParams(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({"error": "Empty body"});
  });

  // error handling: Bad format of startDate / end Date
  it("should return 400 when the start date is empty", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    req.body = {};

    checkParams(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({"error": "Empty start date"});
  });

  // error handling: Bad format of startDate / end Date
  it("should return 400 when the end date is empty", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    req.body = {
      startDate: '2024-01-03T15:00:00Z',
    };

    checkParams(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({"error": "Empty end date"});
  });

  it("should return 400 when the vehicle ID is empty", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    req.body = {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-02T00:00:00Z'
    };

    checkParams(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({"error": "Empty vehicle id"});
  });

  // error handling: Bad format of startDate / end Date
  it("should return 400 when the start date is invalid", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    req.body = {
      startDate: 'Not a date',
      endDate: '2024-01-02T00:00:00Z',
      vehicleId: 'sprint-1',
    };

    checkParams(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({"error": "Invalid start date"});
  });

  // error handling: startDate > endDate
  it("should return 400 when the start date is after the end date", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    req.body = {
      startDate: '2024-01-05T00:00:00Z',
      endDate: '2024-01-02T00:00:00Z',
      vehicleId: 'sprint-1',
    };

    checkParams(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({"error": "Start date after end date"});
  });
});
