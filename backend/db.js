const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL belum dikonfigurasi. Tambahkan connection string PostgreSQL pada environment variables.",
  );
}

const poolConfig = {
  connectionString,
};

if (process.env.DATABASE_SSL === "true") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = pool;
