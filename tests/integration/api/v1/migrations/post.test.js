import database from "infra/database.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

describe("POST to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pendign migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(201);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);

        responseBody.forEach((migration) => {
          expect(migration).toHaveProperty("name");
          expect(migration).toHaveProperty("path");
          expect(migration).toHaveProperty("timestamp");
        });
      });
      test("For the second time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBe(0);
      });
    });
  });
});
