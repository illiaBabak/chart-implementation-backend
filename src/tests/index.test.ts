import { app } from "../index";
import * as userService from "../services/userServices";
import * as supabaseService from "../services/supabaseServices";
import * as ollamaService from "../services/ollamaServices";
import { SUPABASE_URL } from "../utils/constants";
import * as pdfUtils from "../utils/pdfStreamToBuffer";

const MOCK_USERS_DATA = [
  {
    id: 1,
    name: "Emma Johnson",
    age: 28,
    gender: "female",
    workplace: "EuroTech",
    industry: "IT",
    location: "United Kingdom",
    birth_date: "1995-04-12",
  },
  {
    id: 15,
    name: "Amelie Laurent",
    age: 29,
    gender: "female",
    workplace: "EduWorld",
    industry: "Education",
    location: "Belgium",
    birth_date: "1994-09-12",
  },
];

const MOCK_CHARTS = [
  {
    id: 1,
    chart_type: "age",
    created_at: "2025-01-01T10:00:00.000Z",
    key: "age-1",
    status: "success",
    url: "https://example.com/age-1.pdf",
    version: 1,
  },
  {
    id: 2,
    chart_type: "gender",
    created_at: "2025-01-02T11:00:00.000Z",
    key: "gender-1",
    status: "success",
    url: "https://example.com/gender-1.pdf",
    version: 1,
  },
];

const request = require("supertest");

jest.mock("../services/userServices");
jest.mock("../services/supabaseServices");
jest.mock("../utils/generatePdf", () => {
  return {
    ChartBuilder: jest.fn().mockImplementation(() => ({
      setHeader: jest.fn(),
      setFooter: jest.fn(),
      addSVGChart: jest.fn().mockResolvedValue(undefined),
      addHorizontalBarChart: jest.fn().mockResolvedValue(undefined),
      addChartAnalysis: jest.fn().mockResolvedValue(undefined),
      saveDocument: jest.fn().mockReturnValue({}),
    })),
  };
});

describe("GET /api/users", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return users", async () => {
    jest.spyOn(userService, "getUsers").mockResolvedValue(MOCK_USERS_DATA);

    const res = await request(app).get("/api/users").expect(200);

    expect(res.body).toEqual(MOCK_USERS_DATA);
  });

  it("should return error when db is down", async () => {
    jest
      .spyOn(userService, "getUsers")
      .mockRejectedValue(new Error("DB is down"));

    const res = await request(app).get("/api/users").expect(500);

    expect(res.body).toEqual({ error: "Internal server error on get users" });
  });
});

describe("POST /api/pdf/generate-document", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 422 for invalid params", async () => {
    const res = await request(app)
      .post("/api/pdf/generate-document")
      .send({ chartType: "test" })
      .expect(422);

    expect(res.body).toEqual({ error: "Invalid parameters" });
  });

  it("should return PDF for success generation", async () => {
    jest
      .spyOn(supabaseService, "getLatestVersionOfChartType")
      .mockResolvedValue(1);

    jest.spyOn(supabaseService, "insertChart").mockResolvedValue(undefined);
    jest.spyOn(userService, "getUsers").mockResolvedValue(MOCK_USERS_DATA);
    jest.spyOn(supabaseService, "updateChart").mockResolvedValue(undefined);
    jest.spyOn(supabaseService, "uploadPdf").mockResolvedValue(undefined);

    const mockBuffer = Buffer.from("test-buffer");
    jest.spyOn(pdfUtils, "pdfStreamToBuffer").mockResolvedValue(mockBuffer);

    const res = await request(app)
      .post("/api/pdf/generate-document")
      .send({ chartType: "age", key: "test-key" })
      .expect(200);

    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toContain(".pdf");

    expect(supabaseService.insertChart).toHaveBeenCalledWith({
      chart_type: "age",
      status: "new",
      version: 2, // 1 + 1
      key: "test-key",
      url: null,
    });

    expect(supabaseService.uploadPdf).toHaveBeenCalledWith(
      "test-key",
      mockBuffer
    );

    expect(supabaseService.updateChart).toHaveBeenCalledWith("test-key", {
      status: "success",
      url: `${SUPABASE_URL}/storage/v1/object/public/documents/test-key.pdf`,
    });
  });

  it("should return error when PDF generation fails", async () => {
    jest
      .spyOn(supabaseService, "getLatestVersionOfChartType")
      .mockResolvedValue(1);

    jest
      .spyOn(supabaseService, "insertChart")
      .mockRejectedValue(new Error("Supabase is down"));

    const res = await request(app)
      .post("/api/pdf/generate-document")
      .send({ chartType: "age", key: "test-key" })
      .expect(500);

    expect(res.body).toEqual({
      error: "Internal server error on generate document",
    });
  });
});

describe("POST /api/pdf/generate-archive", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 422 for invalid chartType", async () => {
    const res = await request(app)
      .post("/api/pdf/generate-archive")
      .send({
        chartType: "invalid-type",
        categories: ["age"],
        language: "English",
      })
      .expect(422);

    expect(res.body).toEqual({ error: "Invalid chart type to generate" });
  });

  it("should return 422 for invalid categories", async () => {
    const res = await request(app)
      .post("/api/pdf/generate-archive")
      .send({
        chartType: "pie",
        categories: ["age", "invalid_value"],
        language: "English",
      })
      .expect(422);

    expect(res.body).toEqual({ error: "Invalid categories" });
  });

  it("should return 422 for invalid language", async () => {
    const res = await request(app)
      .post("/api/pdf/generate-archive")
      .send({
        chartType: "pie",
        categories: ["age"],
        language: 123,
      })
      .expect(422);

    expect(res.body).toEqual({ error: "Invalid language" });
  });

  it("should return zip with PDFs for success generation", async () => {
    jest.spyOn(userService, "getUsers").mockResolvedValue(MOCK_USERS_DATA);
    jest
      .spyOn(ollamaService, "translateText")
      .mockResolvedValueOnce({
        age: ["Header age"],
        gender: ["Header gender"],
      })
      .mockResolvedValueOnce({
        age: ["Age 18–25", "Age 26–35"],
        gender: ["Male", "Female"],
      });

    const mockBuffer = Buffer.from("test-buffer");
    jest.spyOn(pdfUtils, "pdfStreamToBuffer").mockResolvedValue(mockBuffer);

    const res = await request(app)
      .post("/api/pdf/generate-archive")
      .send({
        chartType: "pie",
        categories: ["age", "gender"],
        language: "English",
      })
      .expect(200);

    expect(res.headers["content-type"]).toBe("application/zip");
    expect(res.headers["content-disposition"]).toContain(".zip");
  }, 10000);

  it("should return error when zip generation fails", async () => {
    jest
      .spyOn(userService, "getUsers")
      .mockRejectedValue(new Error("DB is down"));

    const res = await request(app)
      .post("/api/pdf/generate-archive")
      .send({
        chartType: "pie",
        categories: ["age", "gender"],
        language: "English",
      })
      .expect(500);

    expect(res.body).toEqual({
      error: "Internal server error on generate archive",
    });
  });
});

describe("GET /api/pdf/get-documents", () => {
  it("should return 422 for empty chart type", async () => {
    const res = await request(app).get("/api/pdf/get-documents").expect(422);

    expect(res.body).toEqual({ error: "Chart type is required" });
  });

  it("should return 422 for non-string chart type", async () => {
    const res = await request(app)
      .get(`/api/pdf/get-documents?chartType=age&chartType=gender`)
      .expect(422);

    expect(res.body).toEqual({ error: "Chart type must be a string" });
  });

  it("should return 422 for invalid chart type", async () => {
    const res = await request(app)
      .get("/api/pdf/get-documents?chartType=test")
      .expect(422);

    expect(res.body).toEqual({ error: "Invalid chart type" });
  });

  it("should return charts successful", async () => {
    jest.spyOn(supabaseService, "getCharts").mockResolvedValue(MOCK_CHARTS);

    const res = await request(app)
      .get("/api/pdf/get-documents?chartType=age")
      .expect(200);

    expect(res.body).toEqual(MOCK_CHARTS);
  });

  it("should return error when Supabase fails", async () => {
    jest
      .spyOn(supabaseService, "getCharts")
      .mockRejectedValue(new Error("Supabase is down"));

    const res = await request(app)
      .get("/api/pdf/get-documents?chartType=age")
      .expect(500);

    expect(res.body).toEqual({
      error: "Internal server error on get documents",
    });
  });
});

describe("GET /api/pdf/get-document", () => {
  it("should return 422 for empty key", async () => {
    const res = await request(app).get("/api/pdf/get-document").expect(422);

    expect(res.body).toEqual({ error: "Key is required" });
  });

  it("should return chart successful", async () => {
    jest.spyOn(supabaseService, "getChart").mockResolvedValue(MOCK_CHARTS[0]);

    const res = await request(app)
      .get("/api/pdf/get-document?key=test")
      .expect(200);

    expect(res.body).toEqual(MOCK_CHARTS[0]);
  });

  it("should return error when Supabase fails", async () => {
    jest
      .spyOn(supabaseService, "getChart")
      .mockRejectedValue(new Error("Supabase is fails"));

    const res = await request(app)
      .get("/api/pdf/get-document?key=test")
      .expect(500);

    expect(res.body).toEqual({
      error: "Internal server error on get document",
    });
  });
});

describe("GET /api/pdf/delete-document", () => {
  it("should return 422 for empty key", async () => {
    const res = await request(app)
      .delete("/api/pdf/delete-document")
      .send({})
      .expect(422);

    expect(res.body).toEqual({ error: "Key is required" });
  });

  it("should delete chart successful", async () => {
    jest.spyOn(supabaseService, "deleteChart").mockResolvedValue(undefined);

    await request(app)
      .delete("/api/pdf/delete-document")
      .send({ key: "test-key" })
      .expect(204);

    expect(supabaseService.deleteChart).toHaveBeenCalledWith("test-key");
  });

  it("should return error when Supabase fails", async () => {
    jest
      .spyOn(supabaseService, "deleteChart")
      .mockRejectedValue(new Error("Supabase is fails"));

    const res = await request(app)
      .delete("/api/pdf/delete-document")
      .expect(500);

    expect(res.body).toEqual({
      error: "Internal server error on delete document",
    });
  });
});
