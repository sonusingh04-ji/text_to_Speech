import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "text_to_speech_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

export const query = (text, params) => {
    return pool.query(text, params);
};

export const testDatabaseConnection = async () => {
    const client = await pool.connect();

    try {
        await client.query("SELECT 1");
        console.log("PostgreSQL database connected successfully");
    } finally {
        client.release();
    }
};

export default pool;