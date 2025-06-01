import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NonExistent",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
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

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "duplicatedusername",
      });

      await orchestrator.createUser({
        username: "duplicatedusername2",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicatedusername2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: "duplicatedusername",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "This username is already registered.",
        action: "Please try with another username.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "duplicated.email@email.com",
      });

      const userToPatch = await orchestrator.createUser({
        email: "duplicated.email2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userToPatch.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: "duplicated.email2@email.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "This email is already registered.",
        action: "Please try with another email address.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      await orchestrator.createUser({
        username: "uniqueuser",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: "uniqueuser1",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueuser1",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const userToPatch = await orchestrator.createUser({
        email: "unique.email@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userToPatch.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: "unique.email1@email.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "unique.email1@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const userToPatch = await orchestrator.createUser();

      console.log(userToPatch.username);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userToPatch.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password: "newpassword",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(userToPatch.username);
      const correctPassowrdMatch = await password.compare(
        "newpassword",
        userInDatabase.password,
      );

      const incorrectPassowrdMatch = await password.compare(
        "validpassword",
        userInDatabase.password,
      );

      expect(correctPassowrdMatch).toBe(true);
      expect(incorrectPassowrdMatch).toBe(false);
    });
  });
});
