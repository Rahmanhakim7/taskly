const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL belum dikonfigurasi. Tambahkan connection string PostgreSQL pada environment variables.",
  );
}

const poolConfig = {
  connectionString,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
};

if (process.env.DATABASE_SSL === "true") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});

module.exports = pool;
