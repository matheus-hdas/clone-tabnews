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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "duplicatedusername",
          email: "duplicated.username@email.com",
          password: "senha123",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "duplicatedusername2",
          email: "duplicated.username2@email.com",
          password: "senha123",
        }),
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "duplicatedemail",
          email: "duplicated.email@email.com",
          password: "senha123",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "duplicatedemail2",
          email: "duplicated.email2@email.com",
          password: "senha123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicatedemail2",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "uniqueuser",
          email: "unique.user@email.com",
          password: "senha123",
        }),
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
        email: "unique.user@email.com",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "uniqueemail",
          email: "unique.email@email.com",
          password: "senha123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueemail",
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
        username: "uniqueemail",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: "withpassword",
          email: "with.password@email.com",
          password: "senha123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/withpassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password: "senhanova",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "withpassword",
        email: "with.password@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("withpassword");
      const correctPassowrdMatch = await password.compare(
        "senhanova",
        userInDatabase.password,
      );

      const incorrectPassowrdMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      expect(correctPassowrdMatch).toBe(true);
      expect(incorrectPassowrdMatch).toBe(false);
    });
  });
});
