const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "taskly_db",
  password: "Sekartejo123",
  port: 5432,
});

module.exports = pool;
