import { createRouter } from "next-connect";
import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

const router = createRouter();

router.get(getHandler);

export default router.handler();

async function getHandler(request, response) {
  try {
    const databaseName = process.env.POSTGRES_DB;
    const updatedAt = new Date().toISOString();

    const databaseVersionRs = await database.query("SHOW server_version;");
    const databaseVersionValue = databaseVersionRs.rows[0].server_version;

    const databaseMaxConnectionsRs = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnectionsValue = parseInt(
      databaseMaxConnectionsRs.rows[0].max_connections,
    );

    //  const databaseOpenConnectionsRs = await database.query(
    //    `SELECT count(*)::int FROM pg_stat_activity WHERE datname = '${databaseName}';`
    //  );

    const databaseOpenConnectionsRs = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
      values: [databaseName],
    });
    const databaseOpenConnectionsValue =
      databaseOpenConnectionsRs.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: databaseMaxConnectionsValue,
          open_connections: databaseOpenConnectionsValue,
        },
      },
    });
  } catch (error) {
    console.log("Error on /api/v1/status controller.");

    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.error(publicErrorObject);
    response.status(500).json(publicErrorObject);
  }
}
