const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;

// Isso administra as conexões com o banco de dados PostgreSQL, usando as variáveis de ambiente definidas no arquivo .env.
