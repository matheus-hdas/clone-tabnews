import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "SameCase",
          email: "same.case@email.com",
          password: "senha123",
        }),
      });

      const getResponse = await fetch(
        "http://localhost:3000/api/v1/users/SameCase",
      );

      expect(getResponse.status).toBe(200);

      const responseBody = await getResponse.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "SameCase",
        email: "same.case@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "DiferentCase",
          email: "diferent.case@email.com",
          password: "senha123",
        }),
      });

      const getResponse = await fetch(
        "http://localhost:3000/api/v1/users/diferentcase",
      );

      expect(getResponse.status).toBe(200);

      const responseBody = await getResponse.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "DiferentCase",
        email: "diferent.case@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NonExistent",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "The username provided was not found in the system.",
        action: "Try again with an existent username.",
        status_code: 404,
      });
    });
  });
});
