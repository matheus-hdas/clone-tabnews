import { ValidationError } from "infra/errors";
import database from "infra/database";

async function create(userInputValues) {
  const newUser = runInsertQuery(userInputValues);

  return newUser;

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "This email is already registered.",
        action: "Please try with another email address.",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `
        SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "This username is already registered.",
        action: "Please try with another username.",
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    await validateUniqueEmail(userInputValues.email);
    await validateUniqueUsername(userInputValues.username);

    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

const user = {
  create,
};

export default user;
