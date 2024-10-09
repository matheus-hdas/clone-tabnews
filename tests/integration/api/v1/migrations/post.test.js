import database from "infra/database.js";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST to /api/v1/migrations should run migrations and return 201 with migration details", async () => {
  const firstResponse = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(firstResponse.status).toBe(201);

  const firstResponseBody = await firstResponse.json();
  expect(Array.isArray(firstResponseBody)).toBe(true);
  expect(firstResponseBody.length).toBeGreaterThan(0);

  firstResponseBody.forEach((migration) => {
    expect(migration).toHaveProperty("name");
    expect(migration).toHaveProperty("path");
    expect(migration).toHaveProperty("timestamp");
  });

  const finalResponse = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(finalResponse.status).toBe(200);

  const finalResponseBody = await finalResponse.json();
  expect(Array.isArray(finalResponseBody)).toBe(true);
  expect(finalResponseBody.length).toBe(0);
});
