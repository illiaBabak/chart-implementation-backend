import { app } from "../index";

const request = require("supertest");

describe("GET /users", () => {
  it("should be return 200 and users", async () => {
    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.length).toBeGreaterThan(0);
  });
});
