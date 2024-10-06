import { Client } from "pg";

async function query(queryObject) {
    const client = new Client({
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        password: process.env.POSTGRES_PASSWORD,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DB
    });

    console.log("Dados Postgres: " + {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        password: process.env.POSTGRES_PASSWORD,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DB
    })

    try {
        await client.connect();
        const result = await client.query(queryObject);
        return result;
    } catch(err) {
        console.error(err);
        throw err;
    } finally {
        await client.end();
    }
}

export default {
    query: query
};